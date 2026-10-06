import React from 'react';
import { 
  Building2, 
  X, 
  Phone, 
  User, 
  Zap, 
  Droplet, 
  Heart, 
  Flame, 
  Bed, 
  Activity, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { HospitalResource } from '../types/eoc';

interface HospitalDetailModalProps {
  hospital: HospitalResource | null;
  onClose: () => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  onClose
}) => {
  if (!hospital) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-200 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md ${
              hospital.risk === 'แดง' ? 'bg-rose-600' :
              hospital.risk === 'ส้ม' ? 'bg-orange-600' :
              hospital.risk === 'เหลือง' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">{hospital.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300">
                  ระดับ {hospital.level}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                อ.{hospital.district} · ความเสี่ยง: <strong className="text-white">{hospital.risk} ({hospital.trend})</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Director & Contact info */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>ผู้อำนวยการ: <strong className="text-white">{hospital.directorName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-400" />
            <span>เบอร์โทรฉุกเฉิน: <strong className="text-white font-mono">{hospital.phone}</strong></span>
          </div>
        </div>

        {/* Safe Autonomy & Beds */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Autonomy ปลอดภัย</span>
            <div className={`text-xl font-bold font-mono mt-0.5 ${
              hospital.autonomyHours <= 24 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {hospital.autonomyHours} ชม.
            </div>
            <span className="text-[10px] text-slate-500">Safe Operating Time</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">เตียง (ครอง/ทั้งหมด)</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {hospital.occupiedBeds}/{hospital.totalBeds}
            </div>
            <span className="text-[10px] text-slate-500">ว่าง {hospital.totalBeds - hospital.occupiedBeds} เตียง</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">เตียง ICU</span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
              {hospital.icuBeds} เตียง
            </div>
            <span className="text-[10px] text-slate-500">Ventilator {hospital.resources.ventilators}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">เครื่องฟอกไต</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {hospital.resources.dialysisMachines} เครื่อง
            </div>
            <span className="text-[10px] text-slate-500">Hemodialysis Units</span>
          </div>
        </div>

        {/* Resources Deep-Dive */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs">ปริมาณเสบียงและสาธารณูปโภคสำรอง (Logistics Reserves)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> น้ำมัน Generator:</span>
                <span className="font-mono text-white font-bold">{hospital.resources.generatorFuelHours} ชม.</span>
              </div>
              <p className="text-[11px] text-slate-400">คงเหลือ {hospital.resources.generatorFuelLiters.toLocaleString()} ลิตร (เครื่องปั่นไฟทำงานอัตโนมัติ)</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-sky-400" /> ก๊าซออกซิเจน (O2):</span>
                <span className="font-mono text-white font-bold">{hospital.resources.oxygenHours} ชม.</span>
              </div>
              <p className="text-[11px] text-slate-400">{hospital.resources.oxygenCylinders} ถัง 6m³ + แทงค์เหลว LOX {hospital.resources.liquidOxygenDays} วัน</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-teal-400" /> น้ำสำรองใช้ใน รพ.:</span>
                <span className="font-mono text-white font-bold">{hospital.resources.waterHours} ชม.</span>
              </div>
              <p className="text-[11px] text-slate-400">แทงค์น้ำความจุ {hospital.resources.waterTankLiters.toLocaleString()} ลิตร</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-400" /> คลังเลือด PRBC:</span>
                <span className="font-mono text-white font-bold">
                  {hospital.resources.bloodPRBCUnits.A + hospital.resources.bloodPRBCUnits.B + hospital.resources.bloodPRBCUnits.O + hospital.resources.bloodPRBCUnits.AB} ยูนิต
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                O: {hospital.resources.bloodPRBCUnits.O} | B: {hospital.resources.bloodPRBCUnits.B} | A: {hospital.resources.bloodPRBCUnits.A} | AB: {hospital.resources.bloodPRBCUnits.AB}
              </p>
            </div>
          </div>
        </div>

        {/* Critical Departments Status Matrix */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs">สถานะแผนกวิกฤต (Critical Departments Status)</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">ER (ฉุกเฉิน)</span>
              <span className={`font-bold mt-1 inline-block ${hospital.services.er === 'normal' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {hospital.services.er === 'normal' ? 'ปกติ' : 'วิกฤต'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">LR (ห้องคลอด)</span>
              <span className={`font-bold mt-1 inline-block ${hospital.services.lr === 'normal' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {hospital.services.lr === 'normal' ? 'ปกติ' : 'วิกฤต'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">OR (ผ่าตัด)</span>
              <span className={`font-bold mt-1 inline-block ${hospital.services.or === 'normal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hospital.services.or === 'normal' ? 'ปกติ' : 'เฝ้าระวัง'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">ICU (วิกฤต)</span>
              <span className={`font-bold mt-1 inline-block ${hospital.services.icu === 'normal' ? 'text-emerald-400' : hospital.services.icu === 'warning' ? 'text-orange-400' : 'text-slate-500'}`}>
                {hospital.services.icu === 'normal' ? 'ปกติ' : hospital.services.icu === 'warning' ? 'เฝ้าระวัง' : 'N/A'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Dialysis (ไต)</span>
              <span className={`font-bold mt-1 inline-block ${hospital.services.dialysis === 'normal' ? 'text-emerald-400' : hospital.services.dialysis === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                {hospital.services.dialysis === 'normal' ? 'ปกติ' : hospital.services.dialysis === 'critical' ? 'งดรับใหม่' : 'เฝ้าระวัง'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">OPD/NCD</span>
              <span className={`font-bold mt-1 inline-block ${hospital.services.opd === 'normal' ? 'text-emerald-400' : hospital.services.opd === 'warning' ? 'text-amber-400' : 'text-rose-400'}`}>
                {hospital.services.opd === 'normal' ? 'ปกติ' : 'จำกัดบริการ'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
