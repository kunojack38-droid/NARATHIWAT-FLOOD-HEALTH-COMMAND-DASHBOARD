import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Zap, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  HeartPulse, 
  Droplet, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { HOSPITALS_DATA } from '../data/narathiwatDisasterData';
import { HospitalResource } from '../types/eoc';

export const RtoMatrixModule: React.FC = () => {
  const [selectedHosp, setSelectedHosp] = useState<HospitalResource>(HOSPITALS_DATA[1]); // Default to Sg Kolok (24h critical)

  return (
    <div className="space-y-6">
      {/* Overview Intro Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            RTO (Recovery Time Objective) & Safe Operating Autonomy 13 โรงพยาบาล
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            เกณฑ์เวลาความต่อเนื่องทางธุรกิจ (BCP) กำหนดระยะเวลาที่บริการวิกฤตจะทนต่อการตัดขาดได้ ก่อนต้องได้รับการสนับสนุน
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400">เป้าหมายจังหวัด:</span>
            <span className="ml-1.5 font-bold text-emerald-400">100% Critical Services มี BCP</span>
          </div>
        </div>
      </div>

      {/* Grid of Hospital Autonomy Rankings (Safe Operating Time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Hospital Autonomy Hours ranking list */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center justify-between">
            <span>ระยะเวลาปลอดภัย (Autonomy Hours)</span>
            <span className="text-[11px] text-slate-400">คลิกเพื่อดู RTO รายแผนก</span>
          </h3>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {HOSPITALS_DATA.map((hosp) => {
              const isSelected = selectedHosp.id === hosp.id;
              const barColor = 
                hosp.autonomyHours <= 24 ? 'bg-rose-500' :
                hosp.autonomyHours <= 36 ? 'bg-orange-500' :
                hosp.autonomyHours <= 48 ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <div
                  key={hosp.id}
                  onClick={() => setSelectedHosp(hosp)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white truncate">{hosp.shortName}</span>
                    <span className="font-mono font-bold text-white">
                      {hosp.autonomyHours} ชม.
                    </span>
                  </div>

                  {/* Visual Progress Gauge */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor}`} 
                      style={{ width: `${(hosp.autonomyHours / 72) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>ความเสี่ยง: <strong className="text-slate-300">{hosp.risk}</strong></span>
                    <span>เตียงครอง: {hosp.occupiedBeds}/{hosp.totalBeds}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed RTO Breakdown of Selected Hospital */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-amber-400 font-mono tracking-wider">
                  SELECTED FACILITY BCP AUDIT
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedHosp.name} ({selectedHosp.level})
                </h3>
                <p className="text-xs text-slate-400">
                  ผู้อำนวยการ: {selectedHosp.directorName} · โทร: {selectedHosp.phone}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-400">Safe Operating Autonomy:</span>
                <div className={`text-2xl font-bold font-mono tabular-nums ${
                  selectedHosp.autonomyHours <= 24 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {selectedHosp.autonomyHours} ชั่วโมง
                </div>
                <span className="text-[11px] text-slate-400">
                  {selectedHosp.autonomyHours <= 24 ? '⚠️ ต้องเริ่มกระบวนการเติมเสบียงด่วน' : 'สถานะปกติภายใต้แผน BCP'}
                </span>
              </div>
            </div>

            {/* Department RTO Specification Grid */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-white mb-3">
                เกณฑ์เวลาฟื้นฟูระบบวิกฤต (RTO per Critical Service / Infrastructure)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* ER */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">ห้องฉุกเฉิน (ER)</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    &le; {selectedHosp.rtoHours.er} ชม.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ระบบ CPR และยาช่วยชีวิตต้องกลับมาพร้อมใน 60 นาที
                  </p>
                </div>

                {/* ICU */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">ไอซียู (ICU)</div>
                  <div className="text-lg font-bold font-mono text-indigo-400">
                    &le; {selectedHosp.rtoHours.icu} ชม.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    เครื่องช่วยหายใจ + O2 สำรองแบบถังอัตโนมัติ
                  </p>
                </div>

                {/* Dialysis */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">ไตเทียม (Dialysis)</div>
                  <div className="text-lg font-bold font-mono text-amber-400">
                    &le; {selectedHosp.rtoHours.dialysis} ชม.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ระบบน้ำ RO กรองไต + ไฟฟ้าฉุกเฉิน {selectedHosp.resources.dialysisMachines} เครื่อง
                  </p>
                </div>

                {/* LR / OR */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">ห้องคลอด / ผ่าตัด</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    &le; {selectedHosp.rtoHours.lr} - {selectedHosp.rtoHours.or} ชม.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    รองรับผ่าคลอดฉุกเฉิน (C/S) ได้ตลอด 24 ชม.
                  </p>
                </div>

                {/* Generator Fuel */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">ระบบไฟฟ้า Generator</div>
                  <div className="text-lg font-bold font-mono text-sky-400">
                    &le; 30 วินาที
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ATS สับเปลี่ยนอัตโนมัติ น้ำมันคงเหลือ {selectedHosp.resources.generatorFuelHours} ชม.
                  </p>
                </div>

                {/* Medical Gas */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">ท่อก๊าซออกซิเจน</div>
                  <div className="text-lg font-bold font-mono text-purple-400">
                    &le; 1 ชม.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Manifold สลับถังอัตโนมัติ LOX {selectedHosp.resources.liquidOxygenDays} วัน
                  </p>
                </div>

                {/* Water supply */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">ระบบน้ำสำรอง</div>
                  <div className="text-lg font-bold font-mono text-teal-400">
                    &le; 2 ชม.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    แทงค์สำรอง {selectedHosp.resources.waterHours} ชม. ปั๊มระบบดีเซล
                  </p>
                </div>

                {/* Blood Bank */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">คลังเลือดฉุกเฉิน</div>
                  <div className="text-lg font-bold font-mono text-rose-400">
                    พร้อม 100%
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ตู้แช่สำรองไฟ UPS สำรองไฟ 4 ชม.
                  </p>
                </div>
              </div>
            </div>

            {/* BCP Escalation Protocol Trigger */}
            <div className="mt-5 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                เงื่อนไขการยกระดับเมื่อใกล้แตะขีดจำกัด RTO (Escalation Trigger):
              </h5>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                  <span><strong>Autonomy เหลือ 24 ชม.:</strong> แจ้งศูนย์ EOC สสจ. เตรียมขบวนรถขนส่งน้ำมันและออกซิเจนฉุกเฉิน (Tier 2 Surge)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span><strong>Autonomy เหลือ 12 ชม.:</strong> เริ่มประสานงานแผนกส่งต่อ OPOH เพื่อเตรียมเคลื่อนย้ายผู้ป่วย ICU และ Dialysis ไปยัง รพ.นราธิวาสราชนครินทร์ หรือ นอกจังหวัด</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                  <span><strong>Autonomy เหลือ &lt; 6 ชม.:</strong> ประกาศภาวะฉุกเฉินระดับ 3 ขอกำลังทหารและเฮลิคอปเตอร์แอร์ลิฟต์ส่งเสบียงด่วน</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
