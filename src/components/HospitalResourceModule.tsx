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
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RotateCw,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { HospitalResource, PrimaryHealthClinic, DistrictName } from '../types/eoc';
import { useEocData } from '../context/EocDataContext';
import { HospitalEditModal } from './HospitalEditModal';
import { ClinicEditModal } from './ClinicEditModal';

interface HospitalResourceModuleProps {
  onSelectHospitalForDetail: (hospital: HospitalResource) => void;
  selectedDistrict: DistrictName | null;
}

export const HospitalResourceModule: React.FC<HospitalResourceModuleProps> = ({
  onSelectHospitalForDetail,
  selectedDistrict
}) => {
  const { 
    hospitals, 
    clinics,
    createHospital,
    updateHospital,
    deleteHospital,
    createClinic,
    updateClinic,
    deleteClinic,
    syncDatabase,
    isDbSyncing,
    lastDbSyncTime
  } = useEocData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'hospitals' | 'clinics'>('hospitals');

  // Modals for CRUD
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalResource | null>(null);

  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<PrimaryHealthClinic | null>(null);

  // Delete Confirm State
  const [deleteConfirmHospId, setDeleteConfirmHospId] = useState<string | null>(null);
  const [deleteConfirmClinicId, setDeleteConfirmClinicId] = useState<string | null>(null);

  // Filter 13 hospitals from central relational context
  const filteredHospitals = hospitals.filter((hosp) => {
    const matchSearch = hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        hosp.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        hosp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = filterRisk === 'all' || hosp.risk === filterRisk;
    const matchDistrict = !selectedDistrict || hosp.district === selectedDistrict;
    return matchSearch && matchRisk && matchDistrict;
  });

  // Filter 111 clinics
  const filteredClinics = clinics.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = filterRisk === 'all' || c.status === filterRisk;
    const matchDistrict = !selectedDistrict || c.district === selectedDistrict;
    return matchSearch && matchRisk && matchDistrict;
  });

  // KPI Calculations
  const clinicCounts = {
    normal: clinics.filter(c => c.status === 'normal').length,
    watch: clinics.filter(c => c.status === 'watch').length,
    risk: clinics.filter(c => c.status === 'risk').length,
    closed: clinics.filter(c => c.status === 'closed').length
  };

  // Handlers for Hospitals
  const handleOpenAddHospital = () => {
    setEditingHospital(null);
    setIsHospitalModalOpen(true);
  };

  const handleOpenEditHospital = (h: HospitalResource) => {
    setEditingHospital(h);
    setIsHospitalModalOpen(true);
  };

  const handleSaveHospital = async (h: HospitalResource, isNew: boolean) => {
    if (isNew) {
      await createHospital(h);
    } else {
      await updateHospital(h.id, h);
    }
    return true;
  };

  const handleDeleteHospital = async (id: string) => {
    await deleteHospital(id);
    setDeleteConfirmHospId(null);
  };

  // Handlers for Clinics
  const handleOpenAddClinic = () => {
    setEditingClinic(null);
    setIsClinicModalOpen(true);
  };

  const handleOpenEditClinic = (c: PrimaryHealthClinic) => {
    setEditingClinic(c);
    setIsClinicModalOpen(true);
  };

  const handleSaveClinic = async (c: PrimaryHealthClinic, isNew: boolean) => {
    if (isNew) {
      await createClinic(c);
    } else {
      await updateClinic(c.id, c);
    }
    return true;
  };

  const handleDeleteClinic = async (id: string) => {
    await deleteClinic(id);
    setDeleteConfirmClinicId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Action Deck */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              คลังทรัพยากรทางการแพทย์ & หน่วยบริการ (13 รพ. และ 111 รพ.สต.)
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                CRUD LIVE SYNC
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบบันทึก จัดการ และซิงค์ทรัพยากร: เตียง, ออกซิเจน, น้ำมันปั่นไฟ, น้ำใช้, ยาฉุกเฉิน ลง Google Sheet อัตโนมัติ
            </p>
          </div>
        </div>

        {/* Top Actions: Subtabs + Add New + Sync to Database */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveSubTab('hospitals'); setSearchTerm(''); setFilterRisk('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === 'hospitals'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              โรงพยาบาล ({hospitals.length} แห่ง)
            </button>
            <button
              onClick={() => { setActiveSubTab('clinics'); setSearchTerm(''); setFilterRisk('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === 'clinics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              รพ.สต. ({clinics.length} แห่ง)
            </button>
          </div>

          {/* Add Button (C in CRUD) */}
          {activeSubTab === 'hospitals' ? (
            <button
              onClick={handleOpenAddHospital}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/60 transition-colors"
              title="เพิ่มโรงพยาบาลใหม่ลง Sheet"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มโรงพยาบาล</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddClinic}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-950/60 transition-colors"
              title="เพิ่ม รพ.สต. ใหม่ลง Sheet"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม รพ.สต.</span>
            </button>
          )}

          {/* Sync Database Button */}
          <button
            onClick={() => syncDatabase()}
            disabled={isDbSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            title={`ซิงค์ข้อมูลเข้าระบบ/Sheet (ล่าสุด: ${lastDbSyncTime})`}
          >
            <Database className={`w-3.5 h-3.5 text-emerald-400 ${isDbSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isDbSyncing ? 'กำลังซิงค์...' : 'บันทึกลง Sheet'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'hospitals' ? (
        <div className="space-y-4">
          {/* Hospital Search & Filter Bar (R in CRUD) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อโรงพยาบาล หรือ อำเภอ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-400 shrink-0">ระดับความเสี่ยง:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFilterRisk('all')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterRisk === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ทั้งหมด ({hospitals.length})
                </button>
                <button
                  onClick={() => setFilterRisk('แดง')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterRisk === 'แดง' ? 'bg-rose-700 text-white' : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  แดง ({hospitals.filter(h => h.risk === 'แดง').length})
                </button>
                <button
                  onClick={() => setFilterRisk('ส้ม')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterRisk === 'ส้ม' ? 'bg-orange-700 text-white' : 'text-orange-400 hover:text-orange-300'
                  }`}
                >
                  ส้ม ({hospitals.filter(h => h.risk === 'ส้ม').length})
                </button>
                <button
                  onClick={() => setFilterRisk('เหลือง')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterRisk === 'เหลือง' ? 'bg-amber-700 text-white' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  เหลือง ({hospitals.filter(h => h.risk === 'เหลือง').length})
                </button>
                <button
                  onClick={() => setFilterRisk('เขียว')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterRisk === 'เขียว' ? 'bg-emerald-700 text-white' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  เขียว ({hospitals.filter(h => h.risk === 'เขียว').length})
                </button>
              </div>
            </div>
          </div>

          {/* Hospitals Table - High Density EOC Spec with CRUD Actions */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
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
                    <th className="py-3 px-3 text-center">จัดการ (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredHospitals.map((hosp) => {
                    const bedPercent = hosp.totalBeds > 0 ? Math.round((hosp.occupiedBeds / hosp.totalBeds) * 100) : 0;
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
                            อ.{hosp.district} · ระดับ {hosp.level}
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

                        {/* Actions (CRUD) */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Read / View detail */}
                            <button
                              onClick={() => onSelectHospitalForDetail(hosp)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="ดูรายละเอียดฉุกเฉิน"
                            >
                              รายละเอียด
                            </button>

                            {/* Update (U in CRUD) */}
                            <button
                              onClick={() => handleOpenEditHospital(hosp)}
                              className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/60 transition-colors"
                              title="แก้ไขข้อมูลทรัพยากร รพ. (Update)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete (D in CRUD) */}
                            {deleteConfirmHospId === hosp.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteHospital(hosp.id)}
                                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                                  title="ยืนยันการลบ"
                                >
                                  ลบจริง
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmHospId(null)}
                                  className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[11px]"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmHospId(hosp.id)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition-colors"
                                title="ลบรายการ รพ. (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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
        /* Primary Health Clinics (111 รพ.สต.) with Full CRUD */
        <div className="space-y-4">
          {/* Summary KPI Cards for 111 รพ.สต. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>ปกติ ให้บริการได้</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {clinicCounts.normal} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">เปิดให้บริการตามปกติ</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>เฝ้าระวังน้ำล้น</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {clinicCounts.watch} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">น้ำปริ่มตลิ่ง/ทางเข้าเริ่มท่วม</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>พื้นที่เสี่ยงสูง</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-xl font-bold font-mono text-orange-400">
                {clinicCounts.risk} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">น้ำท่วมลาน รพ.สต. ขนย้ายของขึ้นที่สูง</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>ปิด/ไม่สามารถบริการ</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {clinicCounts.closed} <span className="text-xs font-sans text-slate-400 font-normal">แห่ง</span>
              </div>
              <div className="text-[11px] text-rose-400 mt-0.5">ย้ายจุดบริการสู่ศูนย์พักพิง</div>
            </div>
          </div>

          {/* Clinics Filter Bar (R in CRUD) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ รพ.สต. หรือ อำเภอ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-400 shrink-0">สถานะ:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFilterRisk('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterRisk === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ทั้งหมด ({clinics.length})
                </button>
                <button
                  onClick={() => setFilterRisk('normal')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterRisk === 'normal' ? 'bg-emerald-700 text-white' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  ปกติ ({clinicCounts.normal})
                </button>
                <button
                  onClick={() => setFilterRisk('watch')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterRisk === 'watch' ? 'bg-amber-700 text-white' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  เฝ้าระวัง ({clinicCounts.watch})
                </button>
                <button
                  onClick={() => setFilterRisk('risk')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterRisk === 'risk' ? 'bg-orange-700 text-white' : 'text-orange-400 hover:text-orange-300'
                  }`}
                >
                  เสี่ยงสูง ({clinicCounts.risk})
                </button>
                <button
                  onClick={() => setFilterRisk('closed')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterRisk === 'closed' ? 'bg-rose-700 text-white' : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  ปิด ({clinicCounts.closed})
                </button>
              </div>
            </div>
          </div>

          {/* Clinics Table with CRUD operations */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">รหัส</th>
                    <th className="py-3 px-3">ชื่อ รพ.สต.</th>
                    <th className="py-3 px-3">อำเภอ</th>
                    <th className="py-3 px-2 text-center">สถานะ</th>
                    <th className="py-3 px-2 text-center">บุคลากร/อสม.</th>
                    <th className="py-3 px-2 text-center">เวชภัณฑ์ฉุกเฉิน</th>
                    <th className="py-3 px-2 text-center">เครื่องปั่นไฟ</th>
                    <th className="py-3 px-3">เบอร์โทรศัพท์</th>
                    <th className="py-3 px-3 text-center">จัดการ (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredClinics.map((c) => {
                    const statusBadge = 
                      c.status === 'normal' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      c.status === 'watch' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      c.status === 'risk' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                      'bg-rose-950 text-rose-300 border-rose-800';

                    const statusThai = 
                      c.status === 'normal' ? 'เปิดบริการปกติ' :
                      c.status === 'watch' ? 'เฝ้าระวังน้ำล้น' :
                      c.status === 'risk' ? 'พื้นที่เสี่ยงสูง' : 'ปิด/ย้ายจุดบริการ';

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400">{c.id}</td>
                        <td className="py-3 px-3 font-semibold text-white">{c.name}</td>
                        <td className="py-3 px-3 text-slate-300">อ.{c.district}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${statusBadge}`}>
                            {statusThai}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-white">{c.staffCount} คน</td>
                        <td className="py-3 px-2 text-center">
                          {c.emergencyMedicineKit ? (
                            <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> พร้อม
                            </span>
                          ) : (
                            <span className="text-slate-500">ไม่มี</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {c.generatorAvailable ? (
                            <span className="text-amber-400 font-semibold flex items-center justify-center gap-1">
                              <Zap className="w-3.5 h-3.5" /> มี
                            </span>
                          ) : (
                            <span className="text-slate-500">ไม่มี</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{c.phone || '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Update Clinic (U in CRUD) */}
                            <button
                              onClick={() => handleOpenEditClinic(c)}
                              className="p-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900 text-teal-300 border border-teal-800/60 transition-colors"
                              title="แก้ไขข้อมูล รพ.สต. (Update)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Clinic (D in CRUD) */}
                            {deleteConfirmClinicId === c.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteClinic(c.id)}
                                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                                  title="ยืนยันการลบ"
                                >
                                  ลบจริง
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmClinicId(null)}
                                  className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[11px]"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmClinicId(c.id)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition-colors"
                                title="ลบข้อมูล รพ.สต. (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Continuity Protocol for 111 รพ.สต. */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              มาตรการบริหารความต่อเนื่อง รพ.สต. 111 แห่ง (BCP Primary Care Plan)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-amber-300 block mb-1">1. การย้ายจุดบริการชั่วคราว (Relocation):</strong>
                รพ.สต. ที่ถูกตัดขาด ให้เปิดจุดบริการปฐมพยาบาลและแจกจ่ายยา ณ มัสยิด/โรงเรียนศูนย์พักพิงประจำตำบล โดยมี อสม. และ พยาบาลวิชาชีพ 2 ท่านประจำการ
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-sky-300 block mb-1">2. ชุดเวชภัณฑ์ฉุกเฉินและยาโรคเรื้อรัง:</strong>
                ทุก รพ.สต. ได้รับการสำรองชุดยาสามัญประจำบ้าน 500 ชุด, ยารักษาโรคน้ำกัดเท้า 300 หลอด, ยาลดความดัน/เบาหวาน 30 วันล่วงหน้า
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-emerald-300 block mb-1">3. การสื่อสารรายงานสถานะ 2 รอบ/วัน:</strong>
                ผอ.รพ.สต. รายงานยอดผู้ป่วยและทรัพยากรผ่านวิทยุสื่อสาร VHF ช่องนราฯ 1 หรือ Starlink Terminal ทุกเวลา 08:30 น. และ 16:30 น.
              </div>
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
    </div>
  );
};
