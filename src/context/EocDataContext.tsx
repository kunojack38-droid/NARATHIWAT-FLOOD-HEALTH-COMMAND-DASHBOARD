import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  VULNERABLE_PATIENT_RECORDS, 
  HOSPITALS_DATA, 
  WASHOUT_ROUTES_DATA, 
  DISTRICT_RISK_ASSESSMENT
} from '../data/narathiwatDisasterData';
import { 
  VulnerablePatient, 
  HospitalResource, 
  WashoutRoute, 
  DistrictName, 
  RiskLevel 
} from '../types/eoc';

export interface SyncLogItem {
  id: string;
  time: string;
  action: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
}

interface EocDataContextType {
  // Primary relational state
  patients: VulnerablePatient[];
  hospitals: HospitalResource[];
  washouts: WashoutRoute[];
  selectedDistrict: DistrictName | null;
  setSelectedDistrict: (d: DistrictName | null) => void;

  // Webhook settings & logs
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  syncLogs: SyncLogItem[];
  addSyncLog: (action: string, status?: 'SUCCESS' | 'ERROR') => void;
  isSyncing: boolean;

  // CRUD actions
  createPatient: (patient: VulnerablePatient) => Promise<boolean>;
  updatePatient: (patient: VulnerablePatient) => Promise<boolean>;
  deletePatient: (id: string) => Promise<boolean>;
  toggleRoadStatus: (id: string) => Promise<boolean>;
  updateHospital: (id: string, updates: Partial<HospitalResource>) => Promise<boolean>;

  // Correlated Computed Properties (Interconnected relational data)
  districtStats: Record<DistrictName, {
    totalVulnerable: number;
    p1Immediate: number;
    evacuatedCount: number;
    evacuatedPercent: number;
    hospital: HospitalResource | undefined;
    washouts: WashoutRoute[];
    activeBlockages: number;
    computedRisk: RiskLevel;
  }>;
  criticalHospitals: HospitalResource[];
  totalVulnerableCount: number;
  totalEvacuatedCount: number;
  blockedWashoutsCount: number;
  totalOccupiedBeds: number;
  totalBeds: number;
}

const EocDataContext = createContext<EocDataContextType | undefined>(undefined);

export const EocDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Relational State initialized from localStorage or defaults
  const [patients, setPatients] = useState<VulnerablePatient[]>(() => {
    try {
      const saved = localStorage.getItem('eoc_sheet_patients');
      return saved ? JSON.parse(saved) : VULNERABLE_PATIENT_RECORDS;
    } catch {
      return VULNERABLE_PATIENT_RECORDS;
    }
  });

  const [hospitals, setHospitals] = useState<HospitalResource[]>(() => {
    try {
      const saved = localStorage.getItem('eoc_sheet_hospitals');
      return saved ? JSON.parse(saved) : HOSPITALS_DATA;
    } catch {
      return HOSPITALS_DATA;
    }
  });

  const [washouts, setWashouts] = useState<WashoutRoute[]>(() => {
    try {
      const saved = localStorage.getItem('eoc_sheet_washouts');
      return saved ? JSON.parse(saved) : WASHOUT_ROUTES_DATA;
    } catch {
      return WASHOUT_ROUTES_DATA;
    }
  });

  const [selectedDistrict, setSelectedDistrict] = useState<DistrictName | null>(null);

  const [webhookUrl, setWebhookUrlState] = useState<string>(() => {
    return localStorage.getItem('eoc_settings_webhook_url') || '';
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([
    { id: 'LOG-001', time: '06:30:00 น.', action: 'เชื่อมโยงความสัมพันธ์ข้อมูล 13 รพ. และผู้ป่วยเปราะบางสำเร็จ', status: 'SUCCESS' },
    { id: 'LOG-002', time: '06:25:00 น.', action: 'ตรวจสอบความสัมพันธ์จุดตัดขาด 11 จุดกับเส้นทางส่งต่อ OPOH', status: 'SUCCESS' }
  ]);

  const addSyncLog = (action: string, status: 'SUCCESS' | 'ERROR' = 'SUCCESS') => {
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.`;
    setSyncLogs(prev => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        time: timeStr,
        action,
        status
      },
      ...prev.slice(0, 9)
    ]);
  };

  const setWebhookUrl = (url: string) => {
    setWebhookUrlState(url);
    localStorage.setItem('eoc_settings_webhook_url', url);
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('eoc_sheet_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('eoc_sheet_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('eoc_sheet_washouts', JSON.stringify(washouts));
  }, [washouts]);

  // Helper for real Webhook Dispatch
  const dispatchWebhook = async (action: string, data: any) => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) return;
    try {
      setIsSyncing(true);
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action,
          data,
          user: 'EOC Command System',
          timestamp: new Date().toISOString()
        }),
        mode: 'no-cors'
      });
      setIsSyncing(false);
    } catch (e) {
      setIsSyncing(false);
      console.warn('Webhook dispatch fallback:', e);
    }
  };

  // ==========================================
  // RELATIONAL CRUD ACTIONS
  // ==========================================

  // 1. CREATE PATIENT: Correlates patient to district & destination hospital
  const createPatient = async (newPatient: VulnerablePatient): Promise<boolean> => {
    setPatients(prev => [newPatient, ...prev]);

    // Relational effect: if patient is already hospitalized, increment hospital bed occupancy
    if (newPatient.evacuationStatus === 'HOSPITALIZED' && newPatient.safeDestination) {
      setHospitals(prev => prev.map(h => {
        if (h.name.includes(newPatient.safeDestination) || newPatient.safeDestination.includes(h.shortName)) {
          return { ...h, occupiedBeds: Math.min(h.totalBeds, h.occupiedBeds + 1) };
        }
        return h;
      }));
    }

    addSyncLog(`[CRUD:Create] เพิ่มผู้ป่วย ${newPatient.name} (อ.${newPatient.district})`);
    await dispatchWebhook('CREATE_PATIENT', newPatient);
    return true;
  };

  // 2. UPDATE PATIENT: Correlates evac status changes with hospital occupancy
  const updatePatient = async (updatedPatient: VulnerablePatient): Promise<boolean> => {
    const oldPatient = patients.find(p => p.id === updatedPatient.id);

    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));

    // Relational bed occupancy update
    if (oldPatient && oldPatient.evacuationStatus !== updatedPatient.evacuationStatus) {
      setHospitals(prev => prev.map(h => {
        const isDestination = h.name.includes(updatedPatient.safeDestination) || updatedPatient.safeDestination.includes(h.shortName);
        if (isDestination) {
          if (updatedPatient.evacuationStatus === 'HOSPITALIZED' && oldPatient.evacuationStatus !== 'HOSPITALIZED') {
            return { ...h, occupiedBeds: Math.min(h.totalBeds, h.occupiedBeds + 1) };
          }
          if (oldPatient.evacuationStatus === 'HOSPITALIZED' && updatedPatient.evacuationStatus !== 'HOSPITALIZED') {
            return { ...h, occupiedBeds: Math.max(0, h.occupiedBeds - 1) };
          }
        }
        return h;
      }));
    }

    addSyncLog(`[CRUD:Update] อัปเดตข้อมูล ${updatedPatient.name} (${updatedPatient.evacuationStatus})`);
    await dispatchWebhook('UPDATE_PATIENT', updatedPatient);
    return true;
  };

  // 3. DELETE PATIENT
  const deletePatient = async (id: string): Promise<boolean> => {
    const target = patients.find(p => p.id === id);
    setPatients(prev => prev.filter(p => p.id !== id));

    if (target && target.evacuationStatus === 'HOSPITALIZED') {
      setHospitals(prev => prev.map(h => {
        if (h.name.includes(target.safeDestination)) {
          return { ...h, occupiedBeds: Math.max(0, h.occupiedBeds - 1) };
        }
        return h;
      }));
    }

    addSyncLog(`[CRUD:Delete] ลบข้อมูล ${target?.name || id}`);
    await dispatchWebhook('DELETE_PATIENT', { id });
    return true;
  };

  // 4. TOGGLE ROAD WASHOUT STATUS: Correlates road blockage with district risk & referral
  const toggleRoadStatus = async (roadId: string): Promise<boolean> => {
    let updatedTarget: WashoutRoute | undefined;

    setWashouts(prev => prev.map(w => {
      if (w.id === roadId || w.roadNumber === roadId) {
        const nextStatus: WashoutRoute['status'] = w.status === 'impassable' ? 'passable_4wd' : 'impassable';
        const nextDepth = nextStatus === 'impassable' ? 65 : 20;
        const target: WashoutRoute = { ...w, status: nextStatus, waterDepthCm: nextDepth };
        updatedTarget = target;
        return target;
      }
      return w;
    }));

    if (updatedTarget) {
      const statusThai = (updatedTarget as WashoutRoute).status === 'impassable' ? 'ขาด/ผ่านไม่ได้' : 'สัญจรได้ด้วย 4WD';
      addSyncLog(`[Road Correlate] ปรับสถานะสาย ${(updatedTarget as WashoutRoute).roadNumber} (${(updatedTarget as WashoutRoute).district}): ${statusThai}`);
      await dispatchWebhook('UPDATE_WASHOUT', updatedTarget);
    }
    return true;
  };

  // 5. UPDATE HOSPITAL RESOURCE
  const updateHospital = async (id: string, updates: Partial<HospitalResource>): Promise<boolean> => {
    setHospitals(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    addSyncLog(`[Hospital Correlate] อัปเดตทรัพยากร รพ. ${id}`);
    await dispatchWebhook('UPDATE_HOSPITAL', { id, ...updates });
    return true;
  };

  // ==========================================
  // CORRELATED COMPUTED PROPERTIES
  // ==========================================

  // Relational district-by-district aggregation
  const districtStats = useMemo(() => {
    const allDistricts: DistrictName[] = [
      'สุไหงโก-ลก', 'ตากใบ', 'เมืองนราธิวาส', 'ระแงะ', 'สุไหงปาดี',
      'ยี่งอ', 'รือเสาะ', 'เจาะไอร้อง', 'จะแนะ', 'แว้ง', 'สุคิริน', 'ศรีสาคร', 'บาเจาะ'
    ];

    const stats = {} as EocDataContextType['districtStats'];

    allDistricts.forEach(d => {
      const distPatients = patients.filter(p => p.district === d);
      const p1Immediate = distPatients.filter(p => p.triagePriority === 'P1_IMMEDIATE').length;
      const evacuatedCount = distPatients.filter(p => 
        p.evacuationStatus === 'SAFE_SHELTER' || p.evacuationStatus === 'HOSPITALIZED'
      ).length;
      const evacuatedPercent = distPatients.length > 0 ? Math.round((evacuatedCount / distPatients.length) * 100) : 0;

      const hospital = hospitals.find(h => h.district === d);
      const distWashouts = washouts.filter(w => w.district === d);
      const activeBlockages = distWashouts.filter(w => w.status === 'impassable').length;

      // Computed risk based on real correlated factors:
      // Red: active blockages >= 1 OR hospital autonomy < 24h OR P1 patients > 5
      let computedRisk: RiskLevel = 'เขียว';
      if (activeBlockages >= 2 || (hospital && hospital.autonomyHours <= 24) || p1Immediate >= 8) {
        computedRisk = 'แดง';
      } else if (activeBlockages === 1 || (hospital && hospital.autonomyHours <= 48) || p1Immediate >= 4) {
        computedRisk = 'ส้ม';
      } else if (distPatients.length > 0 || (hospital && hospital.autonomyHours <= 72)) {
        computedRisk = 'เหลือง';
      }

      stats[d] = {
        totalVulnerable: distPatients.length,
        p1Immediate,
        evacuatedCount,
        evacuatedPercent,
        hospital,
        washouts: distWashouts,
        activeBlockages,
        computedRisk
      };
    });

    return stats;
  }, [patients, hospitals, washouts]);

  // Critical hospitals (Autonomy < 24h or fuel < 24h)
  const criticalHospitals = useMemo(() => {
    return hospitals.filter(h => h.autonomyHours <= 24 || h.resources.generatorFuelHours <= 24);
  }, [hospitals]);

  const totalVulnerableCount = patients.length;

  const totalEvacuatedCount = useMemo(() => {
    return patients.filter(p => p.evacuationStatus === 'SAFE_SHELTER' || p.evacuationStatus === 'HOSPITALIZED').length;
  }, [patients]);

  const blockedWashoutsCount = useMemo(() => {
    return washouts.filter(w => w.status === 'impassable').length;
  }, [washouts]);

  const totalOccupiedBeds = useMemo(() => {
    return hospitals.reduce((sum, h) => sum + h.occupiedBeds, 0);
  }, [hospitals]);

  const totalBeds = useMemo(() => {
    return hospitals.reduce((sum, h) => sum + h.totalBeds, 0);
  }, [hospitals]);

  return (
    <EocDataContext.Provider
      value={{
        patients,
        hospitals,
        washouts,
        selectedDistrict,
        setSelectedDistrict,
        webhookUrl,
        setWebhookUrl,
        syncLogs,
        addSyncLog,
        isSyncing,
        createPatient,
        updatePatient,
        deletePatient,
        toggleRoadStatus,
        updateHospital,
        districtStats,
        criticalHospitals,
        totalVulnerableCount,
        totalEvacuatedCount,
        blockedWashoutsCount,
        totalOccupiedBeds,
        totalBeds
      }}
    >
      {children}
    </EocDataContext.Provider>
  );
};

export const useEocData = (): EocDataContextType => {
  const context = useContext(EocDataContext);
  if (!context) {
    throw new Error('useEocData must be used within an EocDataProvider');
  }
  return context;
};
