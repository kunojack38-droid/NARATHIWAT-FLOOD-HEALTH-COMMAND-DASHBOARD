import React from 'react';
import { 
  CloudRain, 
  AlertTriangle, 
  Building2, 
  Users, 
  HeartHandshake, 
  Clock, 
  TrendingUp, 
  Compass, 
  Activity,
  ShieldCheck
} from 'lucide-react';
import { WeatherData } from '../types/eoc';

interface SituationBannerProps {
  weather: WeatherData;
  activeDistrictFilter: string | null;
  onClearDistrictFilter: () => void;
  onSelectTab: (tabId: string) => void;
}

export const SituationBanner: React.FC<SituationBannerProps> = ({
  weather,
  activeDistrictFilter,
  onClearDistrictFilter,
  onSelectTab
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* District Active Filter notification if applied */}
        {activeDistrictFilter && (
          <div className="mb-3 px-3 py-1.5 rounded-md bg-amber-950/70 border border-amber-600/60 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>
                กำลังกรองข้อมูลเฉพาะอำเภอ: <strong className="text-white text-sm">{activeDistrictFilter}</strong>
              </span>
            </div>
            <button
              onClick={onClearDistrictFilter}
              className="px-2 py-0.5 rounded bg-amber-800/60 hover:bg-amber-700 text-white font-medium text-xs transition-colors"
            >
              แสดงทุกอำเภอ (13 อำเภอ)
            </button>
          </div>
        )}

        {/* Top Header Row with Status Badge & Slogan */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 rounded bg-amber-500/20 border border-amber-500/60 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              LEVEL 2 : PRE-ACTIVATE BCP
            </div>
            <span className="text-xs font-medium text-slate-300">
              สถานะ: <strong className="text-amber-300">เฝ้าระวัง : เตรียมพร้อมรับมือน้ำหลาก</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="hidden md:inline italic text-slate-300">
              “ปกป้องชีวิต ลดความสูญเสีย ระบบสุขภาพยังเดินต่อได้”
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>GISTDA/ThaiWater อัปเดต: {weather.gistdaUpdateTimestamp}</span>
            </div>
          </div>
        </div>

        {/* 8 Core EOC Strategic KPI Blocks (Directly matching official Infographic) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-3">
          {/* KPI 1: 24h Rain */}
          <div 
            onClick={() => onSelectTab('map')}
            className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate">ปริมาณฝน 24 ชม.</span>
              <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-sky-400 tabular-nums">
              {weather.rainfall24h} <span className="text-xs font-sans text-slate-400 font-normal">มม.</span>
            </div>
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              +{weather.rainfallChangeWeek}% สัปดาห์ก่อน
            </div>
          </div>

          {/* KPI 2: 72h Forecast */}
          <div 
            onClick={() => onSelectTab('map')}
            className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate">คาดการณ์ 72 ชม.</span>
              <CloudRain className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-indigo-300 tabular-nums">
              {weather.rainfallForecast72h} <span className="text-xs font-sans text-slate-400 font-normal">มม.</span>
            </div>
            <div className="text-[11px] text-rose-400 font-medium mt-0.5">
              เสี่ยงน้ำหลากเพิ่มขึ้น
            </div>
          </div>

          {/* KPI 3: Critical Flood Points */}
          <div 
            onClick={() => onSelectTab('map')}
            className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate">จุดเสี่ยงวิกฤต</span>
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-rose-400 tabular-nums">
              {weather.criticalFloodPoints} <span className="text-xs font-sans text-slate-400 font-normal">จุด</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              น้ำท่วมซ้ำซาก / สะพาน
            </div>
          </div>

          {/* KPI 4: Road Cutoffs 3-yr */}
          <div 
            onClick={() => onSelectTab('map')}
            className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate">ถนนผ่านไม่ได้</span>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {weather.roadCutoffs.total} <span className="text-xs font-sans text-slate-400 font-normal">จุด</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              หลัก {weather.roadCutoffs.main} / สำรอง {weather.roadCutoffs.alternative}
            </div>
          </div>

          {/* KPI 5: Monitored Hospitals */}
          <div 
            onClick={() => onSelectTab('hospitals')}
            className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 hover:border-orange-500/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate">รพ. เฝ้าระวัง</span>
              <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-orange-400 tabular-nums">
              {weather.monitoredHospitals.affected} <span className="text-xs font-sans text-slate-400 font-normal">/ {weather.monitoredHospitals.total} แห่ง</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              ขีดความสามารถลดลง
            </div>
          </div>

          {/* KPI 6: At-Risk Primary Clinics */}
          <div 
            onClick={() => onSelectTab('hospitals')}
            className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate">รพ.สต. เสี่ยง</span>
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {weather.atRiskClinics.affected} <span className="text-xs font-sans text-slate-400 font-normal">/ {weather.atRiskClinics.total} แห่ง</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              ปิดบริการชั่วคราว 29 แห่ง
            </div>
          </div>

          {/* KPI 7: Vulnerable Patients */}
          <div 
            onClick={() => onSelectTab('vulnerable')}
            className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="truncate">ผู้ป่วยเปราะบาง</span>
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              1,284 <span className="text-xs font-sans text-slate-400 font-normal">ราย</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              ต้องดูแล/EVAC พิเศษ
            </div>
          </div>

          {/* KPI 8: Fatalities (ZERO PREVENTABLE DEATH) */}
          <div className="bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-600/50">
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-1">
              <span className="truncate font-semibold">เสียชีวิตจากน้ำท่วม</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
              {weather.fatalities} <span className="text-xs font-sans text-emerald-400 font-normal">ราย</span>
            </div>
            <div className="text-[10px] text-emerald-300 font-bold tracking-tight uppercase truncate mt-0.5">
              ZERO PREVENTABLE DEATH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
