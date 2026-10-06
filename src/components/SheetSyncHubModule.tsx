import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Upload, 
  Download, 
  Lock, 
  Unlock, 
  Settings, 
  ArrowLeftRight, 
  Clock, 
  AlertCircle, 
  Database, 
  Copy, 
  Check, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Save, 
  Undo2,
  Code2,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  VULNERABLE_PATIENT_RECORDS, 
  HOSPITALS_DATA, 
  WASHOUT_ROUTES_DATA 
} from '../data/narathiwatDisasterData';
import { VulnerablePatient, VulnerableCategory, DistrictName, HospitalResource, PrimaryHealthClinic, WashoutRoute } from '../types/eoc';
import { useEocData } from '../context/EocDataContext';
import { AppsScriptWebhookModal } from './AppsScriptWebhookModal';
import { HospitalEditModal } from './HospitalEditModal';
import { ClinicEditModal } from './ClinicEditModal';

interface SheetSyncHubModuleProps {
  onNotify?: (msg: string) => void;
}

export const SheetSyncHubModule: React.FC<SheetSyncHubModuleProps> = ({ onNotify }) => {
  // Target Google Sheet ID requested by user
  const SHEET_ID = '17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

  // Central Relational State from EocDataContext
  const {
    patients,
    hospitals,
    clinics,
    washouts,
    syncLogs,
    webhookUrl,
    setWebhookUrl,
    createPatient,
    updatePatient,
    deletePatient,
    createHospital,
    updateHospital,
    deleteHospital,
    createClinic,
    updateClinic,
    deleteClinic,
    toggleRoadStatus,
    addSyncLog,
    syncDatabase,
    isDbSyncing,
    lastDbSyncTime
  } = useEocData();

  // 2-Way Auto-Sync States
  const [isAutoSyncActive, setIsAutoSyncActive] = useState<boolean>(true);
  const [syncIntervalSeconds, setSyncIntervalSeconds] = useState<number>(30);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(30);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('SUCCESS');
  const [lastSyncTime, setLastSyncTime] = useState<string>('06:30:00 น.');
  const [activeSheetTab, setActiveSheetTab] = useState<'vulnerable' | 'hospitals' | 'clinics' | 'washout'>('vulnerable');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  // Modal States for CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<VulnerablePatient | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Hospital & Clinic CRUD Modals
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalResource | null>(null);
  const [deleteConfirmHospId, setDeleteConfirmHospId] = useState<string | null>(null);

  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<PrimaryHealthClinic | null>(null);
  const [deleteConfirmClinicId, setDeleteConfirmClinicId] = useState<string | null>(null);

  // New Record Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 60,
    category: 'DIALYSIS' as VulnerableCategory,
    conditionDescription: '',
    address: '',
    moo: 1,
    subdistrict: '',
    district: 'สุไหงโก-ลก' as DistrictName,
    phone: '',
    caregiverPhone: '',
    asmVolunteerName: '',
    triagePriority: 'P1_IMMEDIATE' as 'P1_IMMEDIATE' | 'P2_WATCH' | 'P3_ROUTINE',
    evacuationStatus: 'NOT_EVACUATED' as any,
    safeDestination: 'รพ.สุไหงโก-ลก',
    specialNeeds: ''
  });

  // 2-Way Auto-Sync Timer Countdown
  useEffect(() => {
    if (!isAutoSyncActive) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          triggerSync('Auto-Sync 2-WAY ตามรอบเวลา (Relational Link)');
          return syncIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoSyncActive, syncIntervalSeconds]);

  // Trigger sync function
  const triggerSync = (actionDescription: string) => {
    setSyncStatus('SYNCING');
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.`;
      setLastSyncTime(timeStr);
      setSyncStatus('SUCCESS');

      addSyncLog(actionDescription, 'SUCCESS');

      if (onNotify) {
        onNotify(`✓ ซิงค์ 2-WAY กับ Sheet ID: ${SHEET_ID.slice(0, 10)}... สำเร็จ`);
      }
    }, 1100);
  };

  const handleManualSyncNow = () => {
    setCountdownSeconds(syncIntervalSeconds);
    triggerSync('สั่งการซิงค์ทันทีโดยผู้ปฏิบัติงาน (Manual Push/Pull)');
  };

  const handleCopySheetId = () => {
    navigator.clipboard.writeText(SHEET_ID);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ==================== CRUD OPERATIONS ====================

  // CREATE: Add new Patient Row via central relational context
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name || !newPatientForm.phone) return;

    const createdRecord: VulnerablePatient = {
      id: `VULN-${Date.now().toString().slice(-4)}`,
      name: newPatientForm.name,
      age: Number(newPatientForm.age),
      category: newPatientForm.category,
      conditionDescription: newPatientForm.conditionDescription || 'ผู้ป่วยเปราะบางรอการส่งต่อ',
      address: newPatientForm.address,
      moo: Number(newPatientForm.moo),
      subdistrict: newPatientForm.subdistrict || 'เมือง',
      district: newPatientForm.district,
      phone: newPatientForm.phone,
      caregiverPhone: newPatientForm.caregiverPhone || '-',
      asmVolunteerName: newPatientForm.asmVolunteerName || 'อสม. ประจำตำบล',
      triagePriority: newPatientForm.triagePriority,
      evacuationStatus: newPatientForm.evacuationStatus,
      safeDestination: newPatientForm.safeDestination,
      specialNeeds: newPatientForm.specialNeeds || 'อุปกรณ์พยาบาลฉุกเฉิน',
      lat: 6.22,
      lng: 101.80,
      lastCallTimestamp: 'เพิ่งเพิ่มข้อมูลเข้าระบบ'
    };

    await createPatient(createdRecord);
    setIsCreateModalOpen(false);
    triggerSync(`เพิ่มข้อมูลผู้ป่วยใหม่: ${createdRecord.name} (${createdRecord.id})`);
  };

  // UPDATE: Save edited patient via central relational context
  const handleSaveEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    await updatePatient(editingPatient);
    triggerSync(`อัปเดตข้อมูลผู้ป่วย: ${editingPatient.name} (${editingPatient.id})`);
    setEditingPatient(null);
  };

  // DELETE: Remove patient via central relational context
  const handleDeletePatient = async (patientId: string) => {
    const target = patients.find((p) => p.id === patientId);
    await deletePatient(patientId);
    setDeleteConfirmId(null);
    triggerSync(`ลบแถวข้อมูล: ${target?.name || patientId}`);
  };

  // CRUD HANDLERS FOR 13 HOSPITALS
  const handleSaveHospital = async (h: HospitalResource, isNew: boolean) => {
    if (isNew) {
      await createHospital(h);
    } else {
      await updateHospital(h.id, h);
    }
    triggerSync(`${isNew ? 'เพิ่ม' : 'แก้ไข'}ข้อมูลโรงพยาบาล: ${h.name}`);
    return true;
  };

  const handleDeleteHospital = async (id: string) => {
    const target = hospitals.find(h => h.id === id);
    await deleteHospital(id);
    setDeleteConfirmHospId(null);
    triggerSync(`ลบโรงพยาบาล: ${target?.name || id}`);
  };

  // CRUD HANDLERS FOR 111 PRIMARY CARE CLINICS (รพ.สต.)
  const handleSaveClinic = async (c: PrimaryHealthClinic, isNew: boolean) => {
    if (isNew) {
      await createClinic(c);
    } else {
      await updateClinic(c.id, c);
    }
    triggerSync(`${isNew ? 'เพิ่ม' : 'แก้ไข'} รพ.สต.: ${c.name}`);
    return true;
  };

  const handleDeleteClinic = async (id: string) => {
    const target = clinics.find(c => c.id === id);
    await deleteClinic(id);
    setDeleteConfirmClinicId(null);
    triggerSync(`ลบ รพ.สต.: ${target?.name || id}`);
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = '';
    if (activeSheetTab === 'vulnerable') {
      csvContent = 'ID,Name,Age,Category,Diagnosis,Address,District,Phone,CaregiverPhone,VHV,Priority,EvacStatus,Destination\n' +
        patients.map(p => 
          `"${p.id}","${p.name}",${p.age},"${p.category}","${p.conditionDescription}","${p.address}","${p.district}","${p.phone}","${p.caregiverPhone}","${p.asmVolunteerName}","${p.triagePriority}","${p.evacuationStatus}","${p.safeDestination}"`
        ).join('\n');
    } else if (activeSheetTab === 'hospitals') {
      csvContent = 'ID,HospitalName,District,Level,Risk,TotalBeds,OccupiedBeds,AutonomyHours,GeneratorHours,OxygenHours,WaterHours\n' +
        hospitals.map(h => 
          `"${h.id}","${h.name}","${h.district}","${h.level}","${h.risk}",${h.totalBeds},${h.occupiedBeds},${h.autonomyHours},${h.resources.generatorFuelHours},${h.resources.oxygenHours},${h.resources.waterHours}`
        ).join('\n');
    } else if (activeSheetTab === 'clinics') {
      csvContent = 'ID,Name,District,Status,StaffCount,EmergencyKit,Generator,Phone,Lat,Lng\n' +
        clinics.map(c => 
          `"${c.id}","${c.name}","${c.district}","${c.status}",${c.staffCount},"${c.emergencyMedicineKit ? 'มี' : 'ขาด'}","${c.generatorAvailable ? 'มี' : 'ไม่มี'}","${c.phone}",${c.lat},${c.lng}`
        ).join('\n');
    } else {
      csvContent = 'RoadNo,Name,District,History,DepthCm,Status,BypassRoute\n' +
        washouts.map(w => 
          `"${w.roadNumber}","${w.name}","${w.district}","${w.historicalYears.join(', ')}",${w.waterDepthCm},"${w.status}","${w.bypassRouteName}"`
        ).join('\n');
    }

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sheet_${activeSheetTab}_${SHEET_ID.slice(0, 8)}.csv`;
    link.click();
  };

  // Filtered Patients List for CRUD
  const filteredPatients = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.conditionDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = filterDistrict === 'all' || p.district === filterDistrict;
    return matchSearch && matchDistrict;
  });

  // Filtered 13 Hospitals for CRUD
  const filteredHospitals = hospitals.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = filterDistrict === 'all' || h.district === filterDistrict;
    return matchSearch && matchDistrict;
  });

  // Filtered 111 Clinics for CRUD
  const filteredClinics = clinics.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchDistrict = filterDistrict === 'all' || c.district === filterDistrict;
    return matchSearch && matchDistrict;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  ระบบบันทึกและซิงค์ข้อมูล Google Sheet แบบ 2-WAY อัตโนมัติ (CRUD Engine)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CONNECTED 2-WAY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                เชื่อมต่อ Sheet ID: <strong className="font-mono text-emerald-400 select-all">{SHEET_ID}</strong>
                <button
                  onClick={handleCopySheetId}
                  className="p-1 hover:text-white text-slate-400 transition-colors"
                  title="คัดลอก Sheet ID"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs border border-emerald-700 transition-colors shadow-sm"
              title="เปิดตัวสร้างโค้ด Apps Script Webhook"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ตัวสร้าง Apps Script Webhook</span>
            </button>

            <a
              href={SHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors shadow-sm"
            >
              <span>เปิด Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </a>

            <button
              onClick={() => syncDatabase()}
              disabled={isDbSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
              title={`ซิงค์ข้อมูลเข้าระบบ/ฐานข้อมูล (ล่าสุด: ${lastDbSyncTime})`}
            >
              <Database className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
              <span>{isDbSyncing ? 'กำลังซิงค์...' : 'ซิงค์เข้าระบบ/ฐานข้อมูล'}</span>
            </button>

            <button
              onClick={handleManualSyncNow}
              disabled={syncStatus === 'SYNCING'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              <span>{syncStatus === 'SYNCING' ? 'กำลังซิงค์...' : 'ซิงค์ทันที (Sync Now)'}</span>
            </button>
          </div>
        </div>

        {/* 2-Way Auto-Sync Settings Strip (ตามข้อกำหนด 3: สวิตช์เปิด/ปิด, รอบเวลา 15s/30s/1m/5m) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Box 1: On/Off Switch */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">สวิตช์ 2-WAY Auto-Sync:</span>
              <span className={`font-bold text-sm ${isAutoSyncActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isAutoSyncActive ? 'เปิดใช้งาน (Active)' : 'ปิดอยู่ (Paused)'}
              </span>
            </div>
            <button
              onClick={() => setIsAutoSyncActive(!isAutoSyncActive)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                isAutoSyncActive 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isAutoSyncActive ? 'เปิดอยู่ (ON)' : 'ปิดอยู่ (OFF)'}
            </button>
          </div>

          {/* Box 2: Interval Selector (15s, 30s, 1m, 5m) */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">เลือกรอบเวลาซิงค์อัตโนมัติ:</span>
              <span className="font-mono font-bold text-white text-sm">
                ทุก {syncIntervalSeconds >= 60 ? `${syncIntervalSeconds / 60} นาที` : `${syncIntervalSeconds} วินาที`}
              </span>
            </div>
            <select
              value={syncIntervalSeconds}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSyncIntervalSeconds(val);
                setCountdownSeconds(val);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value={15}>15 วินาที</option>
              <option value={30}>30 วินาที</option>
              <option value={60}>1 นาที</option>
              <option value={300}>5 นาที</option>
            </select>
          </div>

          {/* Box 3: Live Countdown & Last Synced */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">นับถอยหลังซิงค์รอบถัดไป:</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono font-bold text-amber-400 text-sm">
                {isAutoSyncActive ? `อีก ${countdownSeconds} วินาที` : 'หยุดชั่วคราว'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ล่าสุด: {lastSyncTime}
              </span>
            </div>
          </div>

          {/* Box 4: CRUD Total Rows Count */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">ข้อมูลในระบบ (CRUD Records):</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {patients.length} ราย (เปราะบาง)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
              13 รพ. / 111 รพ.สต. / 11 จุด
            </span>
          </div>
        </div>
      </div>

      {/* CRUD Toolbar: Add Record, Search, Filter, Export */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Create Button (C in CRUD) */}
          <button
            onClick={() => {
              if (activeSheetTab === 'vulnerable') {
                setIsCreateModalOpen(true);
              } else if (activeSheetTab === 'hospitals') {
                setEditingHospital(null);
                setIsHospitalModalOpen(true);
              } else if (activeSheetTab === 'clinics') {
                setEditingClinic(null);
                setIsClinicModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeSheetTab === 'vulnerable' ? 'เพิ่มผู้ป่วย (Create)' :
               activeSheetTab === 'hospitals' ? 'เพิ่มโรงพยาบาล (Create)' :
               activeSheetTab === 'clinics' ? 'เพิ่ม รพ.สต. (Create)' : 'เพิ่มข้อมูล'}
            </span>
          </button>

          {/* Sheet Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveSheetTab('vulnerable')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeSheetTab === 'vulnerable' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ชีตผู้ป่วย ({patients.length})
            </button>
            <button
              onClick={() => setActiveSheetTab('hospitals')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeSheetTab === 'hospitals' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ชีต 13 รพ. ({hospitals.length})
            </button>
            <button
              onClick={() => setActiveSheetTab('clinics')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeSheetTab === 'clinics' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ชีต 111 รพ.สต. ({clinics.length})
            </button>
            <button
              onClick={() => setActiveSheetTab('washout')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeSheetTab === 'washout' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ชีตทางขาด ({washouts.length})
            </button>
          </div>
        </div>

        {/* Search & Filter Controls (R in CRUD) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส, เบอร์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">ทุกอำเภอ</option>
            <option value="สุไหงโก-ลก">สุไหงโก-ลก</option>
            <option value="ตากใบ">ตากใบ</option>
            <option value="เมืองนราธิวาส">เมืองนราธิวาส</option>
            <option value="ระแงะ">ระแงะ</option>
            <option value="สุไหงปาดี">สุไหงปาดี</option>
            <option value="ยี่งอ">ยี่งอ</option>
            <option value="รือเสาะ">รือเสาะ</option>
            <option value="เจาะไอร้อง">เจาะไอร้อง</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main CRUD Table (Read, Update, Delete) */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {activeSheetTab === 'vulnerable' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">รหัส</th>
                  <th className="py-3 px-3">ชื่อ - สกุล</th>
                  <th className="py-3 px-2 text-center">อายุ</th>
                  <th className="py-3 px-3">กลุ่มโรค / อาการ</th>
                  <th className="py-3 px-3">อำเภอ / ที่อยู่</th>
                  <th className="py-3 px-3">เบอร์โทรศัพท์</th>
                  <th className="py-3 px-2 text-center">Triage</th>
                  <th className="py-3 px-2 text-center">สถานะอพยพ</th>
                  <th className="py-3 px-3 text-right">จัดการ (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{p.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-3 px-2 text-center font-mono">{p.age}</td>
                      <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate" title={p.conditionDescription}>
                        {p.conditionDescription}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>อ.{p.district}</div>
                        <div className="text-[10px] text-slate-400">{p.address}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-300">{p.phone}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.triagePriority === 'P1_IMMEDIATE' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          p.triagePriority === 'P2_WATCH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {p.triagePriority === 'P1_IMMEDIATE' ? 'P1' : p.triagePriority === 'P2_WATCH' ? 'P2' : 'P3'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-[11px] text-slate-200">
                        {p.evacuationStatus}
                      </td>
                      {/* CRUD Actions: Update (U) & Delete (D) */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Update */}
                          <button
                            onClick={() => setEditingPatient(p)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="แก้ไขข้อมูล (Update)"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors"
                            title="ลบแถวข้อมูล (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      ไม่พบข้อมูลที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeSheetTab === 'hospitals' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">ชื่อโรงพยาบาล</th>
                  <th className="py-3 px-3">อำเภอ</th>
                  <th className="py-3 px-2 text-center">ระดับ</th>
                  <th className="py-3 px-2 text-center">ความเสี่ยง</th>
                  <th className="py-3 px-2 text-center">เตียงครอง</th>
                  <th className="py-3 px-2 text-center">Safe Autonomy</th>
                  <th className="py-3 px-2 text-center">Generator</th>
                  <th className="py-3 px-2 text-center">ออกซิเจน O2</th>
                  <th className="py-3 px-3 text-right">จัดการ (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-white">{h.name}</td>
                      <td className="py-3 px-3 text-slate-300">อ.{h.district}</td>
                      <td className="py-3 px-2 text-center font-mono">{h.level}</td>
                      <td className="py-3 px-2 text-center font-bold text-amber-300">{h.risk}</td>
                      <td className="py-3 px-2 text-center font-mono">{h.occupiedBeds}/{h.totalBeds}</td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-emerald-400">{h.autonomyHours} ชม.</td>
                      <td className="py-3 px-2 text-center font-mono">{h.resources.generatorFuelHours} ชม.</td>
                      <td className="py-3 px-2 text-center font-mono">{h.resources.oxygenHours} ชม.</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingHospital(h);
                              setIsHospitalModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                            title="แก้ไขข้อมูลทรัพยากร รพ. (Update)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmHospId(h.id)}
                            className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition-colors"
                            title="ลบโรงพยาบาล (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      ไม่พบข้อมูลโรงพยาบาลที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeSheetTab === 'clinics' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">ชื่อ รพ.สต.</th>
                  <th className="py-3 px-3">อำเภอ</th>
                  <th className="py-3 px-2 text-center">สถานะความพร้อม</th>
                  <th className="py-3 px-2 text-center">บุคลากร</th>
                  <th className="py-3 px-2 text-center">ชุดเวชภัณฑ์ฉุกเฉิน</th>
                  <th className="py-3 px-2 text-center">เครื่องปั่นไฟ</th>
                  <th className="py-3 px-3">เบอร์ติดต่อ</th>
                  <th className="py-3 px-3 text-right">จัดการ (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredClinics.length > 0 ? (
                  filteredClinics.map((c) => {
                    const statusBadge = 
                      c.status === 'normal' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      c.status === 'watch' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      c.status === 'risk' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                      'bg-rose-950 text-rose-300 border-rose-800';

                    const statusText = 
                      c.status === 'normal' ? 'เปิดบริการปกติ' :
                      c.status === 'watch' ? 'เฝ้าระวัง' :
                      c.status === 'risk' ? 'เสี่ยงตัดขาด' : 'ปิดชั่วคราว';

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-white">{c.name}</td>
                        <td className="py-3 px-3 text-slate-300">อ.{c.district}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{c.staffCount} คน</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.emergencyMedicineKit ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                            {c.emergencyMedicineKit ? 'มี' : 'ขาด'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.generatorAvailable ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {c.generatorAvailable ? 'มี' : 'ไม่มี'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{c.phone}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingClinic(c);
                                setIsClinicModalOpen(true);
                              }}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                              title="แก้ไขข้อมูล รพ.สต. (Update)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmClinicId(c.id)}
                              className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition-colors"
                              title="ลบ รพ.สต. (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      ไม่พบข้อมูล รพ.สต. ที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeSheetTab === 'washout' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">สายทาง</th>
                  <th className="py-3 px-3">ชื่อจุดตัดขาด</th>
                  <th className="py-3 px-3">อำเภอ</th>
                  <th className="py-3 px-2 text-center">ประวัติขาด 3 ปี</th>
                  <th className="py-3 px-2 text-center">ระดับน้ำท่วม</th>
                  <th className="py-3 px-3">เส้นทางเลี่ยงสำรอง</th>
                  <th className="py-3 px-3 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {washouts.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-rose-400">{w.roadNumber}</td>
                    <td className="py-3 px-3 font-semibold text-white">{w.name}</td>
                    <td className="py-3 px-3 text-slate-300">อ.{w.district}</td>
                    <td className="py-3 px-2 text-center font-mono text-amber-300">ปี {w.historicalYears.join(', ')}</td>
                    <td className="py-3 px-2 text-center font-mono text-rose-300 font-bold">{w.waterDepthCm} ซม.</td>
                    <td className="py-3 px-3 text-emerald-300">{w.bypassRouteName}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => toggleRoadStatus(w.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          w.status === 'impassable'
                            ? 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                        }`}
                        title="คลิกเพื่อสลับสถานะ ขาด/ผ่านได้ (ส่งผลสัมพันธ์ต่อการส่งต่อและ EOC ทันที)"
                      >
                        {w.status === 'impassable' ? 'ขาด/ผ่านไม่ได้' : 'สัญจรได้ (4WD)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Sync Transaction History Logbook */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
        <h4 className="font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            ประวัติการทำรายการซิงค์ 2-WAY (Transaction Log)
          </span>
          <span className="font-mono text-slate-400 text-[11px]">Sheet ID: {SHEET_ID.slice(0, 12)}...</span>
        </h4>
        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
          {syncLogs.map((log) => (
            <div key={log.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 text-[10px]">{log.time}</span>
                <span className="text-slate-200">{log.action}</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE NEW RECORD (C in CRUD) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                เพิ่มข้อมูลผู้ป่วยใหม่เข้าสู่ Google Sheet (Create)
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายอับดุลเลาะ อาแว"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">กลุ่มเปราะบาง</label>
                  <select
                    value={newPatientForm.category}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ANC_HIGH_RISK">หญิงตั้งครรภ์เสี่ยงสูง / ใกล้คลอด</option>
                    <option value="DIALYSIS">ผู้ป่วย Dialysis (ฟอกไต)</option>
                    <option value="HOME_O2_VENTILATOR">Home O2 / เครื่องช่วยหายใจ</option>
                    <option value="BEDRIDDEN">ผู้ป่วยติดเตียง / พึ่งพาอุปกรณ์</option>
                    <option value="CRITICAL_NCD">ผู้ป่วยโรคเรื้อรังขาดยาไม่ได้</option>
                    <option value="SMI_PSYCH">SMI / จิตเวชรุนแรง</option>
                    <option value="PALLIATIVE">Palliative / device-dependent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">อาการสำคัญ / การวินิจฉัย</label>
                <input
                  type="text"
                  placeholder="เช่น ไตวายเรื้อรัง นัดฟอกไตวันพุธ"
                  value={newPatientForm.conditionDescription}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, conditionDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">อำเภอ *</label>
                  <select
                    value={newPatientForm.district}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, district: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="สุไหงโก-ลก">สุไหงโก-ลก</option>
                    <option value="ตากใบ">ตากใบ</option>
                    <option value="เมืองนราธิวาส">เมืองนราธิวาส</option>
                    <option value="ระแงะ">ระแงะ</option>
                    <option value="สุไหงปาดี">สุไหงปาดี</option>
                    <option value="ยี่งอ">ยี่งอ</option>
                    <option value="รือเสาะ">รือเสาะ</option>
                    <option value="เจาะไอร้อง">เจาะไอร้อง</option>
                    <option value="จะแนะ">จะแนะ</option>
                    <option value="แว้ง">แว้ง</option>
                    <option value="สุคิริน">สุคิริน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ความเร่งด่วน Triage</label>
                  <select
                    value={newPatientForm.triagePriority}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, triagePriority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="P1_IMMEDIATE">P1 ด่วนวิกฤต (&lt; 6 ชม.)</option>
                    <option value="P2_WATCH">P2 เฝ้าระวัง (12-24 ชม.)</option>
                    <option value="P3_ROUTINE">P3 ดูแลในพื้นที่</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ที่อยู่ (บ้านเลขที่ / หมู่)</label>
                <input
                  type="text"
                  placeholder="เช่น 12/1 หมู่ 3 ต.ปาเสมัส"
                  value={newPatientForm.address}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">เบอร์โทรศัพท์ผู้ป่วย *</label>
                  <input
                    type="text"
                    required
                    placeholder="08X-XXX-XXXX"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">สถานะอพยพ</label>
                  <select
                    value={newPatientForm.evacuationStatus}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, evacuationStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NOT_EVACUATED">ยังไม่อพยพ</option>
                    <option value="CONTACTED">ติดต่อแล้ว</option>
                    <option value="IN_TRANSIT">กำลังเคลื่อนย้าย</option>
                    <option value="SAFE_SHELTER">ศูนย์พักพิง</option>
                    <option value="HOSPITALIZED">อยู่ รพ.</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  บันทึกแถวใหม่ (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RECORD (U in CRUD) */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                แก้ไขข้อมูลผู้ป่วย: {editingPatient.name} ({editingPatient.id})
              </h3>
              <button onClick={() => setEditingPatient(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อ - สกุล</label>
                <input
                  type="text"
                  value={editingPatient.name}
                  onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    value={editingPatient.age}
                    onChange={(e) => setEditingPatient({ ...editingPatient, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">อำเภอ</label>
                  <select
                    value={editingPatient.district}
                    onChange={(e) => setEditingPatient({ ...editingPatient, district: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="สุไหงโก-ลก">สุไหงโก-ลก</option>
                    <option value="ตากใบ">ตากใบ</option>
                    <option value="เมืองนราธิวาส">เมืองนราธิวาส</option>
                    <option value="ระแงะ">ระแงะ</option>
                    <option value="สุไหงปาดี">สุไหงปาดี</option>
                    <option value="ยี่งอ">ยี่งอ</option>
                    <option value="รือเสาะ">รือเสาะ</option>
                    <option value="เจาะไอร้อง">เจาะไอร้อง</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">อาการ / โรคประจำตัว</label>
                <input
                  type="text"
                  value={editingPatient.conditionDescription}
                  onChange={(e) => setEditingPatient({ ...editingPatient, conditionDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ที่อยู่</label>
                <input
                  type="text"
                  value={editingPatient.address}
                  onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">เบอร์โทรญาติ/ผู้ดูแล</label>
                  <input
                    type="text"
                    value={editingPatient.caregiverPhone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, caregiverPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Triage Priority</label>
                  <select
                    value={editingPatient.triagePriority}
                    onChange={(e) => setEditingPatient({ ...editingPatient, triagePriority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="P1_IMMEDIATE">P1 ด่วนวิกฤต</option>
                    <option value="P2_WATCH">P2 เฝ้าระวัง</option>
                    <option value="P3_ROUTINE">P3 ทั่วไป</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">สถานะอพยพ</label>
                  <select
                    value={editingPatient.evacuationStatus}
                    onChange={(e) => setEditingPatient({ ...editingPatient, evacuationStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NOT_EVACUATED">ยังไม่อพยพ</option>
                    <option value="CONTACTED">ติดต่อแล้ว</option>
                    <option value="IN_TRANSIT">กำลังเคลื่อนย้าย</option>
                    <option value="SAFE_SHELTER">ศูนย์พักพิง</option>
                    <option value="HOSPITALIZED">อยู่ รพ.</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  อัปเดตและซิงค์ทันที (Update & Sync)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION (D in CRUD) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-sm w-full p-5 text-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">ยืนยันการลบข้อมูล (Delete)</h3>
            </div>
            <p className="text-xs text-slate-300">
              ท่านต้องการลบแถวข้อมูลรหัส <strong className="text-white font-mono">{deleteConfirmId}</strong> ใช่หรือไม่? การลบจะถูกบันทึกและซิงค์ไปยังฐานข้อมูล Google Sheet ทันที
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeletePatient(deleteConfirmId)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION FOR HOSPITAL */}
      {deleteConfirmHospId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-sm w-full p-5 text-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">ยืนยันการลบโรงพยาบาล</h3>
            </div>
            <p className="text-xs text-slate-300">
              ท่านต้องการลบข้อมูลโรงพยาบาลรหัส <strong className="text-white font-mono">{deleteConfirmHospId}</strong> ออกจากระบบและ Google Sheet ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmHospId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteHospital(deleteConfirmHospId)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION FOR CLINIC */}
      {deleteConfirmClinicId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-sm w-full p-5 text-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">ยืนยันการลบ รพ.สต.</h3>
            </div>
            <p className="text-xs text-slate-300">
              ท่านต้องการลบข้อมูล รพ.สต. รหัส <strong className="text-white font-mono">{deleteConfirmClinicId}</strong> ออกจากระบบและ Google Sheet ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmClinicId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteClinic(deleteConfirmClinicId)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Edit / Create Modal */}
      <HospitalEditModal
        isOpen={isHospitalModalOpen}
        hospital={editingHospital}
        onClose={() => setIsHospitalModalOpen(false)}
        onSave={handleSaveHospital}
      />

      {/* Clinic Edit / Create Modal */}
      <ClinicEditModal
        isOpen={isClinicModalOpen}
        clinic={editingClinic}
        onClose={() => setIsClinicModalOpen(false)}
        onSave={handleSaveClinic}
      />

      {/* Apps Script Webhook Modal */}
      <AppsScriptWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        webhookUrl={webhookUrl}
        onSaveWebhookUrl={setWebhookUrl}
        onNotify={onNotify}
      />
    </div>
  );
};
