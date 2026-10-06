import React, { useState } from 'react';
import { 
  Ambulance, 
  Navigation, 
  AlertTriangle, 
  Route, 
  Anchor, 
  Compass, 
  Clock, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Building2,
  Share2
} from 'lucide-react';
import { 
  DYNAMIC_REFERRAL_ROUTES, 
  LOGISTICS_FLEET_SUMMARY, 
  HOSPITALS_DATA 
} from '../data/narathiwatDisasterData';
import { DynamicReferralRoute } from '../types/eoc';
import { useEocData } from '../context/EocDataContext';

export const OpohReferralModule: React.FC = () => {
  const { washouts } = useEocData();
  const [selectedRoute, setSelectedRoute] = useState<DynamicReferralRoute>(DYNAMIC_REFERRAL_ROUTES[0]);
  const [dispatchedReferral, setDispatchedReferral] = useState<DynamicReferralRoute | null>(null);

  const isRouteBlocked = (route: DynamicReferralRoute) => {
    return washouts.some(w => 
      (route.originHospitalName.includes(w.district) || route.alternativeRouteName.includes(w.roadNumber)) && 
      w.status === 'impassable'
    );
  };

  const handleDispatch = (route: DynamicReferralRoute) => {
    setDispatchedReferral(route);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-emerald-400" />
            ระบบส่งต่อผู้ป่วยวิกฤตและการเคลื่อนย้าย OPOH (One Province One Hospital)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            บูรณาการโครงข่ายส่งต่อร่วมกับแผนที่ทางขาด 3 ปี แก้ปัญหาเส้นทางตัดขาดด้วยรถยกสูง เรือ ปภ. และอากาศยาน (ฮ.)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>เป้าหมาย: <strong className="text-white">100% Route หลัก+สำรอง พร้อมใช้งาน</strong></span>
        </div>
      </div>

      {/* Fleet Mobility Capacity Summary (4 Metric Cards matching Infographic section 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Ambulances */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>รถพยาบาลฉุกเฉิน (EMS)</span>
            <Ambulance className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {LOGISTICS_FLEET_SUMMARY.ambulancesTotal} <span className="text-xs font-normal text-slate-400">คัน</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            ยกสูง 4WD พร้อมลุยน้ำ <strong>{LOGISTICS_FLEET_SUMMARY.ambulancesHighClearance} คัน</strong>
          </div>
        </div>

        {/* Rescue Boats */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>เรือพยาบาล / เรือ ปภ.</span>
            <Anchor className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400">
            {LOGISTICS_FLEET_SUMMARY.boatsTotal} <span className="text-xs font-normal text-slate-400">ลำ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            เรือท้องแบนเครื่องยนต์ติดท้าย
          </div>
        </div>

        {/* Critical Evac Teams */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>ทีมกู้ชีพวิกฤตฉุกเฉิน</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {LOGISTICS_FLEET_SUMMARY.criticalEvacTeams} <span className="text-xs font-normal text-slate-400">ทีม</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            แพทย์เวชศาสตร์ฉุกเฉิน + พยาบาลกู้ชีพ
          </div>
        </div>

        {/* Helipads */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>จุด ฮ. ลงส่งกลับสายแพทย์</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {LOGISTICS_FLEET_SUMMARY.helipads} <span className="text-xs font-normal text-slate-400">จุด</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            ทร. / ตชด. / สกายด็อกเตอร์ สธ.
          </div>
        </div>
      </div>

      {/* Main Referral Network: Routes Grid & Interactive Dispatch Resolver */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: List of Key OPOH Dynamic Referral Corridors */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center justify-between">
            <span>เส้นทางส่งต่อเชื่อมโยง OPOH</span>
            <span className="text-[11px] text-slate-400">เลือกดูวิธีแก้ปัญหาทางขาด</span>
          </h3>

          <div className="space-y-2">
            {DYNAMIC_REFERRAL_ROUTES.map((route) => {
              const isSelected = selectedRoute.id === route.id;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border text-xs ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-white mb-1">
                    <span className="truncate">{route.originHospitalName} &rarr; {route.targetHospitalName}</span>
                    {(isRouteBlocked(route) || route.isStandardBlocked) && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {isRouteBlocked(route) ? 'ทางขาด (ตัดขาดจริง)' : 'ทางหลักขาด'}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>กลุ่มโรค: <strong className="text-slate-300">{route.category}</strong></span>
                    <span className="text-emerald-400 font-mono">
                      {route.alternativeTransportMode === 'HELICOPTER' ? 'ฮ. 18 นาที' : `เลี่ยง +${route.transitTimeMin} น.`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Route Contingency Resolution Inspector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase font-mono text-emerald-400">
                  OPOH DYNAMIC REFERRAL CORRIDOR
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedRoute.originHospitalName}</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span>{selectedRoute.targetHospitalName}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  รองรับผู้ป่วยกลุ่ม: <strong className="text-white">{selectedRoute.category}</strong>
                </p>
              </div>

              <div>
                <button
                  onClick={() => handleDispatch(selectedRoute)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  สั่งการเปิดเส้นทางส่งต่อฉุกเฉิน
                </button>
              </div>
            </div>

            {/* Side-by-side: Standard Route vs Contingency Solution based on 3-yr washout data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
              {/* Standard Route Status */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-300">
                  <span>1. เส้นทางหลักตามปกติ</span>
                  <span className={selectedRoute.isStandardBlocked ? 'text-rose-400' : 'text-emerald-400'}>
                    {selectedRoute.isStandardBlocked ? '⛔ ถูกน้ำท่วมตัดขาด' : '✓ สัญจรได้ปกติ'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>ระยะทางตามปกติ: <strong className="text-white font-mono">{selectedRoute.standardRouteKm} กม.</strong></div>
                  <div>เวลาเดินทางปกติ: <strong className="text-white font-mono">{selectedRoute.standardTimeMin} นาที</strong></div>
                </div>
                {selectedRoute.isStandardBlocked && (
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[11px]">
                    สาเหตุ: จุดตัดสะพานโต๊ะเด็ง กม. 24+100 หรือ มะรึโบตก น้ำท่วมสูงเกิน 1.20 ม. รถพยาบาลปกติไม่สามารถผ่านได้
                  </div>
                )}
              </div>

              {/* Contingency Solution */}
              <div className="bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-700/60 space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-300">
                  <span>2. เส้นทางสำรอง & การแก้ปัญหา</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {selectedRoute.alternativeTransportMode}
                  </span>
                </div>
                <div className="text-slate-200 font-medium">
                  {selectedRoute.alternativeRouteName}
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>เวลาเดินทางในภาวะวิกฤต: <strong className="text-emerald-300 font-mono">{selectedRoute.transitTimeMin} นาที</strong></div>
                  <div>หน่วยงานทหาร/กู้ภัยสนับสนุน: <strong className="text-white">{selectedRoute.militaryAssistance}</strong></div>
                  {selectedRoute.landingZoneName && (
                    <div className="text-purple-300">
                      จุด Landing ฮ.: <strong>{selectedRoute.landingZoneName}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Dispatch Confirmation */}
            {dispatchedReferral?.id === selectedRoute.id && (
              <div className="mt-4 p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-200 flex items-start justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      ยืนยันคำสั่งเปิดระเบียงส่งต่อด่วนพิเศษ (Green Corridor Active)
                    </h4>
                    <p className="mt-0.5">
                      ศูนย์นเรนทร สสจ.นราธิวาส ได้วิทยุประสานงาน พัน.ร.151, ปภ. เขต 12 และตำรวจภูธร เพื่อนำขบวนรถ/อากาศยานเรียบร้อยแล้ว
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-1 rounded">
                  DISPATCH CONFIRMED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
