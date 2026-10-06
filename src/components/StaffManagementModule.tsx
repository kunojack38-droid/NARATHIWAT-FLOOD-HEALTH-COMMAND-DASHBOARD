import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Clock, 
  Home, 
  Stethoscope, 
  HeartHandshake, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { TOTAL_STAFF_SUMMARY, HOSPITALS_DATA } from '../data/narathiwatDisasterData';
import { DistrictName } from '../types/eoc';

export const StaffManagementModule: React.FC = () => {
  const [selectedHospStaffId, setSelectedHospStaffId] = useState<string>(HOSPITALS_DATA[0].id);

  const selectedHosp = HOSPITALS_DATA.find(h => h.id === selectedHospStaffId) || HOSPITALS_DATA[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            การบริหารจัดการกำลังคนและทีมสนับสนุนทางการแพทย์ (Staff & Medical Teams)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ติดตามความพร้อมบุคลากร 2,353 นาย จัดทัพทีมเวร A-B-C และดูแลที่พักปลอดภัยบุคลากร
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400">ความพร้อมกำลังคนรวมจังหวัด:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {TOTAL_STAFF_SUMMARY.readyPercentage}% (พร้อมปฏิบัติงาน)
          </span>
          <span className="text-amber-400 font-mono text-[11px]">
            [เฝ้าระวัง 15% บ้านถูกน้ำท่วม]
          </span>
        </div>
      </div>

      {/* 4 KPI Summary Cards for Staffing */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* KPI 1: Total & Ready */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 mb-1 flex items-center justify-between">
            <span>กำลังคนรวมทั้งสิ้น</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {TOTAL_STAFF_SUMMARY.totalStaff.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">นาย</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            พร้อมปฏิบัติงาน {Math.round(TOTAL_STAFF_SUMMARY.totalStaff * (TOTAL_STAFF_SUMMARY.readyPercentage / 100)).toLocaleString()} นาย (85%)
          </div>
        </div>

        {/* KPI 2: Team A Active */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 mb-1 flex items-center justify-between">
            <span>ทีม A (เวรประจำการหน้างาน)</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-400">
            {TOTAL_STAFF_SUMMARY.teamA_ActiveShift}{' '}
            <span className="text-xs font-normal text-slate-400">นาย</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            กะ 12/24 ชม. ประจำแผนกวิกฤต
          </div>
        </div>

        {/* KPI 3: Team B Reserve */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 mb-1 flex items-center justify-between">
            <span>ทีม B (สำรองพร้อมใน 2 ชม.)</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {TOTAL_STAFF_SUMMARY.teamB_Reserve2h}{' '}
            <span className="text-xs font-normal text-slate-400">นาย</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            พักใน Safe House / อาคารพัก
          </div>
        </div>

        {/* KPI 4: Stranded Personnel */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 mb-1 flex items-center justify-between">
            <span>เจ้าหน้าที่ติดค้างน้ำท่วม</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {TOTAL_STAFF_SUMMARY.strandedAtHome}{' '}
            <span className="text-xs font-normal text-slate-400">นาย (15%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            ส่งทีมกู้ชีพไปรับ / อนุมัติพักชั่วคราว
          </div>
        </div>
      </div>

      {/* Main Staff Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Hospital Selection */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center justify-between">
            <span>กำลังคนรายโรงพยาบาล</span>
            <span className="text-[11px] text-slate-400">คลิกเพื่อดูโครงสร้างทีม</span>
          </h3>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {HOSPITALS_DATA.map((hosp) => (
              <div
                key={hosp.id}
                onClick={() => setSelectedHospStaffId(hosp.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors border text-xs ${
                  selectedHospStaffId === hosp.id
                    ? 'bg-slate-800 border-emerald-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="truncate">{hosp.shortName}</span>
                  <span className="font-mono text-emerald-400">{hosp.staff.readyPercentage}%</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                  <span>กำลังคนรวม: {hosp.staff.total} นาย</span>
                  <span>แพทย์ {hosp.staff.physicians} / พยาบาล {hosp.staff.nurses}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Staff & Shift Roster for Selected Hospital */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase font-mono">
                  HOSPITAL ROSTER & CONTINGENCY
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedHosp.name}
                </h3>
                <p className="text-xs text-slate-400">
                  กำลังคนพร้อมปฏิบัติการ: <strong className="text-white font-mono">{selectedHosp.staff.readyPercentage}%</strong> (จากบุคลากรทั้งหมด {selectedHosp.staff.total} นาย)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700/80 text-emerald-300 text-xs font-semibold">
                  ทีมประจำการ A: {selectedHosp.staff.teamA} นาย
                </span>
              </div>
            </div>

            {/* Profession Breakdown Table */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-white mb-2">
                การกระจายตามตำแหน่งวิชาชีพ (Staff by Profession)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">แพทย์ (MD)</span>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedHosp.staff.physicians} นาย
                  </div>
                  <span className="text-[10px] text-emerald-400">เวร ER/ICU/OR</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">พยาบาล (RN)</span>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedHosp.staff.nurses} นาย
                  </div>
                  <span className="text-[10px] text-sky-400">สลับกะ 12 ชม.</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">กู้ชีพ/Paramedic</span>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedHosp.staff.paramedics} นาย
                  </div>
                  <span className="text-[10px] text-amber-400">ทีมออกเหตุ 24 ชม.</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">เภสัชกร (Rx)</span>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedHosp.staff.pharmacists} นาย
                  </div>
                  <span className="text-[10px] text-purple-400">คุมคลังยาฉุกเฉิน</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">ช่าง/วิศวกร</span>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedHosp.staff.engineers} นาย
                  </div>
                  <span className="text-[10px] text-rose-400">คุม Generator/น้ำ</span>
                </div>
              </div>
            </div>

            {/* Team A-B-C Deployment Strategy */}
            <div className="mt-5 space-y-2.5">
              <h4 className="text-xs font-bold text-white">
                โครงสร้างทีมเวรผลัดเปลี่ยน (Shift Rotation & Contingency Plan)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-lg">
                  <div className="font-bold text-sky-300 flex items-center justify-between">
                    <span>ทีม A (เวรประจำการ)</span>
                    <span className="font-mono text-sm">{selectedHosp.staff.teamA} นาย</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    ปฏิบัติหน้าที่ในแผนกวิกฤต ห้ามออกจากพื้นที่โรงพยาบาล อาหาร 3 มื้อจากโรงครัวฉุกเฉิน
                  </p>
                </div>

                <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-lg">
                  <div className="font-bold text-amber-300 flex items-center justify-between">
                    <span>ทีม B (สำรองพร้อมผลัด)</span>
                    <span className="font-mono text-sm">{selectedHosp.staff.teamB} นาย</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    พักในหอพักบุคลากรหรือ Safe House ประจำอำเภอ พร้อมเข้าผลัดเปลี่ยนได้ในเวลาไม่เกิน 2 ชม.
                  </p>
                </div>

                <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-lg">
                  <div className="font-bold text-purple-300 flex items-center justify-between">
                    <span>ทีม C (ระดมพล/กู้ชีพ)</span>
                    <span className="font-mono text-sm">{selectedHosp.staff.teamC} นาย</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    ทีมเฉพาะกิจสนับสนุนการอพยพผู้ป่วยเปราะบางในชุมชน ร่วมกับ ปภ., เรือ และเฮลิคอปเตอร์
                  </p>
                </div>
              </div>
            </div>

            {/* Safe House & Staff Well-being Protection */}
            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  ที่พักปลอดภัย (Safe House Quarters) ในพื้นที่: <strong className="text-white">หอพักแพทย์-พยาบาล ชั้น 3-4 (น้ำไม่ท่วมถึง)</strong>
                </span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px]">พร้อมน้ำดื่มและไฟสำรอง</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
