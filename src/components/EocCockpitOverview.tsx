import React from 'react';
import { 
  Building2, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Radio, 
  Truck, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  Activity, 
  ExternalLink,
  Flame,
  Droplet,
  Heart,
  Baby,
  Stethoscope,
  FileSpreadsheet
} from 'lucide-react';
import { 
  DISTRICT_RISK_ASSESSMENT, 
  HOSPITALS_DATA, 
  PRIMARY_CARE_CLINICS_SUMMARY, 
  VULNERABLE_CATEGORY_COUNTS,
  TOTAL_STAFF_SUMMARY,
  WASHOUT_ROUTES_DATA
} from '../data/narathiwatDisasterData';
import { DistrictName, HospitalResource } from '../types/eoc';
import { useEocData } from '../context/EocDataContext';

interface EocCockpitOverviewProps {
  onSelectTab: (tabId: string) => void;
  onFilterDistrict: (district: DistrictName) => void;
  onSelectHospital: (hospital: HospitalResource) => void;
  selectedDistrict: DistrictName | null;
}

export const EocCockpitOverview: React.FC<EocCockpitOverviewProps> = ({
  onSelectTab,
  onFilterDistrict,
  onSelectHospital,
  selectedDistrict
}) => {
  const {
    districtStats,
    hospitals,
    totalVulnerableCount,
    totalEvacuatedCount,
    blockedWashoutsCount,
    totalOccupiedBeds,
    totalBeds,
    criticalHospitals
  } = useEocData();

  const districtList = Object.entries(DISTRICT_RISK_ASSESSMENT) as [DistrictName, typeof DISTRICT_RISK_ASSESSMENT[DistrictName]][];

  return (
    <div className="space-y-6">
      {/* Strategic Mission Statement Banner matching Infographic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-600/40 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600/60 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ศูนย์ปฏิบัติการภาวะฉุกเฉินทางด้านสาธารณสุข (EOC) จังหวัดนราธิวาส</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              จังหวัดนราธิวาส เตรียมพร้อมก่อนน้ำท่วม
            </h1>
            <p className="text-sm text-emerald-200/90 font-medium">
              “ปกป้องชีวิต ลดความสูญเสีย ระบบสุขภาพยังเดินต่อได้ — เตรียมก่อน ลดผลกระทบ ช่วยได้เร็วกว่า ปลอดภัยกว่า ชีวิตประชาชนต้องมาก่อน”
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                13 รพ. ข้อมูลครบ 100%
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                111 รพ.สต. มีแผน BCP
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                เส้นทางหลัก+สำรอง พร้อมใช้
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ผู้เสียชีวิต 0 ราย (ZERO PREVENTABLE DEATH)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('map')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              เปิดแผนที่ GIS & ทางขาด 3 ปี
            </button>
            <button
              onClick={() => onSelectTab('vulnerable')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              ทะเบียนผู้ป่วยเปราะบาง 1,284 ราย
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: 13 Districts Risk Table & Trend (Section 3 of Infographic) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                ระดับความเสี่ยงและคาดการณ์สถานการณ์รายอำเภอ (13 อำเภอ)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ประเมินแนวโน้มระดับน้ำ 6 ชม., 12 ชม., 24 ชม. ล่วงหน้า (คลิกอำเภอเพื่อกรองข้อมูลทั้งระบบ)
              </p>
            </div>
            {selectedDistrict && (
              <span className="text-xs font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                เลือก: {selectedDistrict}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">อำเภอ</th>
                  <th className="py-2.5 px-2 text-center">ระดับเสี่ยง</th>
                  <th className="py-2.5 px-2 text-center">แนวโน้ม</th>
                  <th className="py-2.5 px-2 text-center">6 ชม.</th>
                  <th className="py-2.5 px-2 text-center">12 ชม.</th>
                  <th className="py-2.5 px-2 text-center">24 ชม.</th>
                  <th className="py-2.5 px-3 text-right">ลุ่มน้ำที่ได้รับผลกระทบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {districtList.map(([district, data]) => {
                  const isSelected = selectedDistrict === district;
                  const dStats = districtStats[district];
                  const currentRisk = dStats?.computedRisk || data.risk;
                  const riskBadge = 
                    currentRisk === 'แดง' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                    currentRisk === 'ส้ม' ? 'bg-orange-950 text-orange-300 border-orange-700' :
                    currentRisk === 'เหลือง' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                    'bg-emerald-950 text-emerald-300 border-emerald-700';

                  return (
                    <tr
                      key={district}
                      onClick={() => onFilterDistrict(district)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-slate-800/80 font-semibold' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{district}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          เปราะบาง {dStats?.totalVulnerable || 0} ราย · ทางขาด {dStats?.activeBlockages || 0} จุด
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${riskBadge}`}>
                          {currentRisk}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-400">
                        {data.trend}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        <span className={data.t6h === 'เสี่ยงสูง' ? 'text-rose-400 font-bold' : data.t6h === 'น้ำเพิ่ม' ? 'text-amber-400' : 'text-slate-300'}>
                          {data.t6h}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        <span className={data.t12h === 'เสี่ยงสูง' ? 'text-rose-400 font-bold' : data.t12h === 'น้ำเพิ่ม' ? 'text-amber-400' : 'text-slate-300'}>
                          {data.t12h}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        <span className={data.t24h === 'น้ำเพิ่ม' ? 'text-rose-400 font-bold' : data.t24h === 'ท่วมขัง' ? 'text-orange-400' : 'text-slate-300'}>
                          {data.t24h}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {data.riverBasin}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: High-Risk Hospitals & Vulnerable Triage Alert */}
        <div className="space-y-4">
          {/* High-Risk Hospitals Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-rose-400" />
                โรงพยาบาลเฝ้าระวังวิกฤต (5 แห่ง)
              </h3>
              <button 
                onClick={() => onSelectTab('hospitals')}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                ดูทั้งหมด 13 รพ. &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {criticalHospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  onClick={() => onSelectHospital(hosp)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>{hosp.shortName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      hosp.risk === 'แดง' ? 'bg-rose-950 text-rose-300' : 'bg-orange-950 text-orange-300'
                    }`}>
                      {hosp.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Safe Autonomy: <strong className="text-amber-400 font-mono">{hosp.autonomyHours} ชม.</strong></span>
                    <span>เตียงครอง: {hosp.occupiedBeds}/{hosp.totalBeds}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to Key Mission Protocols */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-2.5 text-xs">
            <h4 className="font-bold text-white mb-2">กลไกสนับสนุนตอบโต้ภาวะฉุกเฉิน (EOC Pillars)</h4>

            <button
              onClick={() => onSelectTab('referral')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-slate-200">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>ระบบส่งต่อ OPOH (รถยกสูง / เรือ / ฮ.)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onSelectTab('comm')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-slate-200">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>สื่อสารสำรอง 4 ชั้น (วิทยุ สธ. / Starlink)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onSelectTab('surge')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-slate-200">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>แผนนำเข้าเมื่อสำรองหมด (Green Corridor เขต 12)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onSelectTab('staff')}
              className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-slate-200">
                <Users className="w-4 h-4 text-purple-400" />
                <span>กำลังคน 2,353 นาย & ทีมเวร A-B-C</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onSelectTab('sheet')}
              className="w-full text-left p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-emerald-300">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>2-WAY Auto-Sync Sheet (17M9s5... CRUD)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
