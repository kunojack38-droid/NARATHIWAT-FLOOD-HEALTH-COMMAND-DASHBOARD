import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Zap, 
  Droplets, 
  Flame, 
  Activity, 
  Clock, 
  Heart, 
  Bed, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Phone, 
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { HOSPITALS_DATA, PRIMARY_CARE_CLINICS_SUMMARY } from '../data/narathiwatDisasterData';
import { HospitalResource, DistrictName } from '../types/eoc';
import { useEocData } from '../context/EocDataContext';

interface HospitalResourceModuleProps {
  onSelectHospitalForDetail: (hospital: HospitalResource) => void;
  selectedDistrict: DistrictName | null;
}

export const HospitalResourceModule: React.FC<HospitalResourceModuleProps> = ({
  onSelectHospitalForDetail,
  selectedDistrict
}) => {
  const { hospitals } = useEocData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'hospitals' | 'clinics'>('hospitals');

  // Filter 13 hospitals from central relational context
  const filteredHospitals = hospitals.filter((hosp) => {
    const matchSearch = hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        hosp.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = filterRisk === 'all' || hosp.risk === filterRisk;
    const matchDistrict = !selectedDistrict || hosp.district === selectedDistrict;
    return matchSearch && matchRisk && matchDistrict;
  });

  return (
    <div className="space-y-6">
      {/* Top Selector & KPI Summary */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            คลังทรัพยากรทางการแพทย์ & หน่วยบริการ (13 รพ. และ 111 รพ.สต.)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ติดตามปริมาณคงเหลือจริง: เตียง, ออกซิเจน, น้ำมันปั่นไฟ, น้ำใช้, ยาฉุกเฉิน, และถุงเลือด
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('hospitals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'hospitals'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            โรงพยาบาล 13 แห่ง
          </button>
          <button
            onClick={() => setActiveSubTab('clinics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'clinics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            รพ.สต. 111 แห่ง
          </button>
        </div>
      </div>

      {activeSubTab === 'hospitals' ? (
        <div className="space-y-4">
          {/* Hospital Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อโรงพยาบาล หรือ อำเภอ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 shrink-0">ระดับความเสี่ยง:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setFilterRisk('all')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filterRisk === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ทั้งหมด ({HOSPITALS_DATA.length})
                </button>
                <button
                  onClick={() => setFilterRisk('แดง')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filterRisk === 'แดง' ? 'bg-rose-700 text-white' : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  แดง (1)
                </button>
                <button
                  onClick={() => setFilterRisk('ส้ม')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filterRisk === 'ส้ม' ? 'bg-orange-700 text-white' : 'text-orange-400 hover:text-orange-300'
                  }`}
                >
                  ส้ม (3)
                </button>
                <button
                  onClick={() => setFilterRisk('เหลือง')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filterRisk === 'เหลือง' ? 'bg-amber-700 text-white' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  เหลือง (6)
                </button>
                <button
                  onClick={() => setFilterRisk('เขียว')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filterRisk === 'เขียว' ? 'bg-emerald-700 text-white' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  เขียว (3)
                </button>
              </div>
            </div>
          </div>

          {/* Hospitals Table - High Density EOC Spec */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">โรงพยาบาล</th>
                    <th className="py-3 px-2 text-center">ระดับเสี่ยง</th>
                    <th className="py-3 px-2 text-center">เตียง (ครอง/ทั้งหมด)</th>
                    <th className="py-3 px-2 text-center">Autonomy ปลอดภัย</th>
                    <th className="py-3 px-2 text-center">น้ำมัน Generator</th>
                    <th className="py-3 px-2 text-center">ออกซิเจน (O2)</th>
                    <th className="py-3 px-2 text-center">น้ำสำรอง</th>
                    <th className="py-3 px-2 text-center">คลังเลือด PRBC</th>
                    <th className="py-3 px-2 text-center">แผนก ER/LR/OR/ICU</th>
                    <th className="py-3 px-3 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredHospitals.map((hosp) => {
                    const bedPercent = Math.round((hosp.occupiedBeds / hosp.totalBeds) * 100);
                    const riskBadgeBg = 
                      hosp.risk === 'แดง' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                      hosp.risk === 'ส้ม' ? 'bg-orange-950 text-orange-300 border-orange-700' :
                      hosp.risk === 'เหลือง' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                      'bg-emerald-950 text-emerald-300 border-emerald-700';

                    return (
                      <tr 
                        key={hosp.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Name */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{hosp.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {hosp.district} · ระดับ {hosp.level}
                          </div>
                        </td>

                        {/* Risk */}
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${riskBadgeBg}`}>
                            {hosp.risk} {hosp.trend}
                          </span>
                        </td>

                        {/* Beds */}
                        <td className="py-3 px-2 text-center font-mono">
                          <span className="text-white font-bold">{hosp.occupiedBeds}</span>
                          <span className="text-slate-400">/{hosp.totalBeds}</span>
                          <div className="text-[10px] text-slate-400">
                            ({bedPercent}%) · ICU {hosp.icuBeds}
                          </div>
                        </td>

                        {/* Autonomy Hours */}
                        <td className="py-3 px-2 text-center">
                          <span className={`font-mono font-bold text-sm ${
                            hosp.autonomyHours <= 24 ? 'text-rose-400 animate-pulse' :
                            hosp.autonomyHours <= 36 ? 'text-orange-400' :
                            hosp.autonomyHours <= 48 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {hosp.autonomyHours} ชม.
                          </span>
                          <div className="text-[10px] text-slate-400">Safe Operating</div>
                        </td>

                        {/* Generator */}
                        <td className="py-3 px-2 text-center font-mono">
                          <div className="text-slate-200 font-semibold">{hosp.resources.generatorFuelHours} ชม.</div>
                          <div className="text-[10px] text-slate-400">{hosp.resources.generatorFuelLiters.toLocaleString()} ลิตร</div>
                        </td>

                        {/* Oxygen */}
                        <td className="py-3 px-2 text-center font-mono">
                          <div className="text-slate-200 font-semibold">{hosp.resources.oxygenHours} ชม.</div>
                          <div className="text-[10px] text-slate-400">
                            {hosp.resources.oxygenCylinders} ท่อ / LOX {hosp.resources.liquidOxygenDays} วัน
                          </div>
                        </td>

                        {/* Water */}
                        <td className="py-3 px-2 text-center font-mono">
                          <div className="text-slate-200 font-semibold">{hosp.resources.waterHours} ชม.</div>
                          <div className="text-[10px] text-slate-400">{(hosp.resources.waterTankLiters / 1000).toLocaleString()} ลบ.ม.</div>
                        </td>

                        {/* Blood */}
                        <td className="py-3 px-2 text-center font-mono">
                          <div className="text-slate-200 font-semibold">
                            {hosp.resources.bloodPRBCUnits.A + hosp.resources.bloodPRBCUnits.B + hosp.resources.bloodPRBCUnits.O + hosp.resources.bloodPRBCUnits.AB} ยูนิต
                          </div>
                          <div className="text-[10px] text-slate-400">
                            O:{hosp.resources.bloodPRBCUnits.O} | B:{hosp.resources.bloodPRBCUnits.B} | A:{hosp.resources.bloodPRBCUnits.A}
                          </div>
                        </td>

                        {/* Service Matrix Quick Dots */}
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-mono">
                            <span title={`ER: ${hosp.services.er}`} className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${hosp.services.er === 'normal' ? 'bg-emerald-500' : 'bg-rose-500'}`}>E</span>
                            <span title={`LR: ${hosp.services.lr}`} className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${hosp.services.lr === 'normal' ? 'bg-emerald-500' : 'bg-rose-500'}`}>L</span>
                            <span title={`OR: ${hosp.services.or}`} className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${hosp.services.or === 'normal' ? 'bg-emerald-500' : 'bg-amber-500'}`}>O</span>
                            <span title={`ICU: ${hosp.services.icu}`} className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${hosp.services.icu === 'normal' ? 'bg-emerald-500' : hosp.services.icu === 'warning' ? 'bg-orange-500' : 'bg-slate-600'}`}>I</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Dialysis: {hosp.resources.dialysisMachines} เครื่อง</div>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onSelectHospitalForDetail(hosp)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 font-medium transition-colors"
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Primary Health Clinics (111 รพ.สต.) Breakdown */
        <div className="space-y-4">
          {/* Summary KPI Cards for 111 รพ.สต. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>ปกติ ให้บริการได้</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {PRIMARY_CARE_CLINICS_SUMMARY.normal} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง (53%)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">เปิดให้บริการตามปกติ</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>เฝ้าระวังน้ำล้น</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {PRIMARY_CARE_CLINICS_SUMMARY.watch} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">น้ำปริ่มตลิ่ง/ทางเข้าเริ่มท่วม</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>พื้นที่เสี่ยงสูง</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-xl font-bold font-mono text-orange-400">
                {PRIMARY_CARE_CLINICS_SUMMARY.risk} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">น้ำท่วมลาน รพ.สต. ขนย้ายของขึ้นที่สูง</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>ปิด/ไม่สามารถบริการ</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {PRIMARY_CARE_CLINICS_SUMMARY.closed} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง</span>
              </div>
              <div className="text-[11px] text-rose-400 mt-0.5">ย้ายจุดบริการสู่ศูนย์พักพิง</div>
            </div>
          </div>

          {/* Operational Continuity Protocol for 111 รพ.สต. */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              มาตรการบริหารความต่อเนื่อง รพ.สต. 111 แห่ง (BCP Primary Care Plan)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <strong className="text-amber-300 block mb-1">1. การย้ายจุดบริการชั่วคราว (Relocation):</strong>
                รพ.สต. 29 แห่งที่ถูกตัดขาด ให้เปิดจุดบริการปฐมพยาบาลและแจกจ่ายยา ณ มัสยิด/โรงเรียนศูนย์พักพิงประจำตำบล โดยมี อสม. และ พยาบาลวิชาชีพ 2 ท่านประจำการ
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <strong className="text-sky-300 block mb-1">2. ชุดเวชภัณฑ์ฉุกเฉินและยาโรคเรื้อรัง:</strong>
                ทุก รพ.สต. ได้รับการสำรองชุดยาสามัญประจำบ้าน 500 ชุด, ยารักษาโรคน้ำกัดเท้า 300 หลอด, ยาลดความดัน/เบาหวาน 30 วันล่วงหน้า
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <strong className="text-emerald-300 block mb-1">3. การสื่อสารรายงานสถานะ 2 รอบ/วัน:</strong>
                ผอ.รพ.สต. รายงานยอดผู้ป่วยและทรัพยากรผ่านวิทยุสื่อสาร VHF ช่องนราฯ 1 หรือ Starlink Terminal ทุกเวลา 08:30 น. และ 16:30 น.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
