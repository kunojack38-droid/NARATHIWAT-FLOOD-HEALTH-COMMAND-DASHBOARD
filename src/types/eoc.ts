export type AlertLevel = 'LEVEL 1 : NORMAL' | 'LEVEL 2 : PRE-ACTIVATE BCP' | 'LEVEL 3 : FULL ACTIVATION' | 'LEVEL 4 : CATASTROPHIC';

export type DistrictName = 
  | 'เมืองนราธิวาส'
  | 'สุไหงโก-ลก'
  | 'ตากใบ'
  | 'ระแงะ'
  | 'รือเสาะ'
  | 'สุไหงปาดี'
  | 'แว้ง'
  | 'ยี่งอ'
  | 'จะแนะ'
  | 'บาเจาะ'
  | 'สุคิริน'
  | 'ศรีสาคร'
  | 'เจาะไอร้อง';

export type RiskLevel = 'แดง' | 'ส้ม' | 'เหลือง' | 'เขียว';

export interface WeatherData {
  rainfall24h: number; // mm
  rainfallChangeWeek: number; // percentage e.g. +32%
  rainfallForecast72h: number; // mm
  criticalFloodPoints: number;
  roadCutoffs: {
    total: number;
    main: number;
    alternative: number;
  };
  monitoredHospitals: {
    affected: number;
    total: number;
  };
  atRiskClinics: {
    affected: number;
    total: number;
  };
  vulnerablePatientsTotal: number;
  fatalities: number;
  gistdaUpdateTimestamp: string;
}

export interface HospitalServiceStatus {
  er: 'normal' | 'warning' | 'critical' | 'closed';
  lr: 'normal' | 'warning' | 'critical' | 'closed';
  or: 'normal' | 'warning' | 'critical' | 'closed';
  icu: 'normal' | 'warning' | 'critical' | 'na';
  dialysis: 'normal' | 'warning' | 'critical' | 'na';
  opd: 'normal' | 'warning' | 'critical' | 'closed';
}

export interface HospitalResource {
  id: string;
  name: string;
  shortName: string;
  district: DistrictName;
  level: 'A+' | 'S+' | 'M' | 'S';
  risk: RiskLevel;
  trend: '↑↑' | '↑' | '→' | '↓';
  lat: number;
  lng: number;
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  autonomyHours: number; // Safe Operating Time
  rtoHours: {
    er: number;
    icu: number;
    dialysis: number;
    lr: number;
    or: number;
    power: number;
    water: number;
    oxygen: number;
  };
  resources: {
    generatorFuelHours: number; // hours of fuel remaining
    generatorFuelLiters: number;
    oxygenHours: number;
    oxygenCylinders: number;
    liquidOxygenDays: number;
    waterHours: number;
    waterTankLiters: number;
    criticalMedicineDays: number;
    bloodPRBCUnits: {
      A: number;
      B: number;
      O: number;
      AB: number;
    };
    dialysisMachines: number;
    ventilators: number;
  };
  services: HospitalServiceStatus;
  staff: {
    total: number;
    readyPercentage: number;
    physicians: number;
    nurses: number;
    paramedics: number;
    pharmacists: number;
    engineers: number;
    teamA: number; // On duty
    teamB: number; // Reserve 2h
    teamC: number; // Emergency surge
  };
  phone: string;
  directorName: string;
}

export interface PrimaryHealthClinic {
  id: string;
  name: string;
  district: DistrictName;
  status: 'normal' | 'watch' | 'risk' | 'closed';
  staffCount: number;
  emergencyMedicineKit: boolean;
  generatorAvailable: boolean;
  phone: string;
  lat: number;
  lng: number;
}

export interface WashoutRoute {
  id: string;
  roadNumber: string;
  name: string;
  location: string;
  district: DistrictName;
  historicalYears: number[]; // e.g. [2565, 2566, 2567]
  waterDepthCm: number;
  status: 'impassable' | 'passable_4wd' | 'warning' | 'restored';
  bypassRouteName: string;
  bypassDistanceKm: number;
  transportAlternative: '4WD_UNIMOG' | 'BOAT' | 'AIRLIFT' | 'DETOUR';
  lat: number;
  lng: number;
}

export type VulnerableCategory = 
  | 'ANC_HIGH_RISK' // หญิงตั้งครรภ์เสี่ยงสูง / ใกล้คลอด
  | 'DIALYSIS' // ผู้ป่วยฟอกไต
  | 'HOME_O2_VENTILATOR' // ผู้ใช้เครื่องช่วยหายใจ / ออกซิเจน
  | 'BEDRIDDEN' // ผู้ป่วยติดเตียง / พึ่งพาอุปกรณ์
  | 'CRITICAL_NCD' // ผู้ป่วยโรคเรื้อรังขาดยาไม่ได้
  | 'SMI_PSYCH' // จิตเวชรุนแรง
  | 'PALLIATIVE'; // ระยะประคับประคอง / device-dependent

export interface VulnerablePatient {
  id: string;
  name: string;
  age: number;
  category: VulnerableCategory;
  conditionDescription: string;
  address: string;
  moo: number;
  subdistrict: string;
  district: DistrictName;
  phone: string;
  caregiverPhone: string;
  asmVolunteerName: string;
  triagePriority: 'P1_IMMEDIATE' | 'P2_WATCH' | 'P3_ROUTINE';
  evacuationStatus: 'NOT_EVACUATED' | 'CONTACTED' | 'IN_TRANSIT' | 'SAFE_SHELTER' | 'HOSPITALIZED';
  safeDestination: string;
  specialNeeds: string;
  lat: number;
  lng: number;
  lastCallTimestamp: string;
}

export interface DynamicReferralRoute {
  id: string;
  originHospitalId: string;
  originHospitalName: string;
  targetHospitalId: string;
  targetHospitalName: string;
  category: 'DIALYSIS' | 'SURGICAL_ICU' | 'HIGH_RISK_MATERNAL' | 'TRAUMA';
  standardRouteKm: number;
  standardTimeMin: number;
  isStandardBlocked: boolean;
  alternativeRouteName: string;
  alternativeTransportMode: 'AMBULANCE_HIGH' | 'BOAT_TRANSFER' | 'HELICOPTER';
  transitTimeMin: number;
  militaryAssistance: string;
  landingZoneName?: string;
}

export interface CommTier {
  tierNumber: number;
  tierName: string;
  protocolDescription: string;
  equipment: string;
  frequencyOrBand: string;
  operationalStatus: 'ACTIVE' | 'STANDBY' | 'FAILED' | 'READY';
  coveragePercentage: number;
  testEvidence: {
    lastTested: string;
    signalStrength: string; // e.g. "-78 dBm" or "5/5"
    operator: string;
    verifiedAudio: boolean;
  };
}

export interface SurgeProtocol {
  id: string;
  resourceType: 'LIQUID_OXYGEN' | 'BLOOD_PRBC' | 'DIESEL_FUEL' | 'CRITICAL_DRUGS' | 'FOOD_RATION';
  triggerThreshold: string;
  sourceHub: string;
  transportCorridor: string;
  corridorMode: 'GREEN_CONVOY_TRUCK' | 'C130_AIRLIFT' | 'HELICOPTER_AIRLIFT' | 'SPECIAL_TRAIN';
  leadTimeHours: number;
  escortAuthority: string;
  contactAgency: string;
  status: 'STANDBY' | 'REQUESTED' | 'DISPATCHED' | 'DELIVERED';
}
