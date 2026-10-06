import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  PhoneCall, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Ambulance, 
  FileSpreadsheet, 
  Plus, 
  Baby, 
  Activity, 
  HeartPulse, 
  Bed, 
  Pill, 
  Trash2,
  Smile, 
  Eye
} from 'lucide-react';
import { 
  VULNERABLE_PATIENT_RECORDS, 
  VULNERABLE_CATEGORY_COUNTS 
} from '../data/narathiwatDisasterData';
import { VulnerablePatient, VulnerableCategory, DistrictName } from '../types/eoc';
import { useEocData } from '../context/EocDataContext';

interface VulnerablePatientModuleProps {
  selectedDistrict: DistrictName | null;
}

export const VulnerablePatientModule: React.FC<VulnerablePatientModuleProps> = ({
  selectedDistrict
}) => {
  const { patients, createPatient, updatePatient, deletePatient } = useEocData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedEvacStatus, setSelectedEvacStatus] = useState<string>('all');
  const [activeCallPatient, setActiveCallPatient] = useState<VulnerablePatient | null>(null);
  const [statusUpdatePatient, setStatusUpdatePatient] = useState<VulnerablePatient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New patient form state
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 50,
    category: 'ANC_HIGH_RISK' as VulnerableCategory,
    conditionDescription: '',
    address: '',
    moo: 1,
    subdistrict: '',
    district: 'สุไหงโก-ลก' as DistrictName,
    phone: '',
    caregiverPhone: '',
    asmVolunteerName: '',
    triagePriority: 'P1_IMMEDIATE' as 'P1_IMMEDIATE' | 'P2_WATCH' | 'P3_ROUTINE',
    safeDestination: '',
    specialNeeds: ''
  });

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.conditionDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.phone.includes(searchTerm);
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchPriority = selectedPriority === 'all' || p.triagePriority === selectedPriority;
    const matchEvac = selectedEvacStatus === 'all' || p.evacuationStatus === selectedEvacStatus;
    const matchDistrict = !selectedDistrict || p.district === selectedDistrict;

    return matchSearch && matchCategory && matchPriority && matchEvac && matchDistrict;
  });

  // Handle status update
  const handleUpdateStatus = (patientId: string, newStatus: VulnerablePatient['evacuationStatus']) => {
    const target = patients.find(p => p.id === patientId);
    if (target) {
      updatePatient({
        ...target,
        evacuationStatus: newStatus,
        lastCallTimestamp: `${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. (อัปเดตสถานะ: ${newStatus})`
      });
    }
    setStatusUpdatePatient(null);
  };

  // Add new patient handler
  const handleAddNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name || !newPatientForm.phone) return;

    const newRecord: VulnerablePatient = {
      id: `VULN-${Date.now().toString().slice(-4)}`,
      name: newPatientForm.name,
      age: Number(newPatientForm.age),
      category: newPatientForm.category,
      conditionDescription: newPatientForm.conditionDescription,
      address: newPatientForm.address,
      moo: Number(newPatientForm.moo),
      subdistrict: newPatientForm.subdistrict,
      district: newPatientForm.district,
      phone: newPatientForm.phone,
      caregiverPhone: newPatientForm.caregiverPhone,
      asmVolunteerName: newPatientForm.asmVolunteerName || 'อสม. ประจำหมู่บ้าน',
      triagePriority: newPatientForm.triagePriority,
      evacuationStatus: 'NOT_EVACUATED',
      safeDestination: newPatientForm.safeDestination || 'รพ.ประจำอำเภอ',
      specialNeeds: newPatientForm.specialNeeds,
      lat: 6.25,
      lng: 101.85,
      lastCallTimestamp: 'เพิ่งลงทะเบียน'
    };

    createPatient(newRecord);
    setIsAddModalOpen(false);
  };

  // Export CSV mock
  const handleExportCSV = () => {
    const headers = "รหัส,ชื่อ-สกุล,อายุ,กลุ่มเปราะบาง,อาการ,ที่อยู่,อำเภอ,เบอร์โทร,เบอร์ญาติ,อสม.,ระดับความด่วน,สถานะอพยพ,ปลายทางปลอดภัย\n";
    const rows = patients.map(p => 
      `"${p.id}","${p.name}",${p.age},"${p.category}","${p.conditionDescription}","${p.address}","${p.district}","${p.phone}","${p.caregiverPhone}","${p.asmVolunteerName}","${p.triagePriority}","${p.evacuationStatus}","${p.safeDestination}"`
    ).join("\n");
    
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ทะเบียนผู้ป่วยเปราะบาง_EOCนราธิวาส_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Official Summary */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            ทะเบียนผู้ป่วยกลุ่มเปราะบางที่ต้องช่วยเหลือ/อพยพด่วน (1,284 ราย)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            คัดกรองระดับความเร่งด่วน P1 (อพยพทันที), P2 (เฝ้าระวัง 12-24 ชม.), P3 (ดูแลในพื้นที่/ส่งยา)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            ลงทะเบียนเคสใหม่
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            ส่งออก CSV (ชุดกู้ชีพ)
          </button>
        </div>
      </div>

      {/* 7 Group Category Metric Cards - Directly matching Infographic section 7 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
        {/* ANC */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'ANC_HIGH_RISK' ? 'all' : 'ANC_HIGH_RISK')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedCategory === 'ANC_HIGH_RISK' 
              ? 'bg-rose-950/70 border-rose-500 text-white' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="truncate">หญิงครรภ์เสี่ยง/ใกล้คลอด</span>
            <Baby className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-400">218 <span className="text-[10px] text-slate-400 font-sans">ราย</span></div>
          <div className="text-[10px] text-rose-300 font-semibold mt-0.5">P1 EVAC ก่อน</div>
        </div>

        {/* Dialysis */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'DIALYSIS' ? 'all' : 'DIALYSIS')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedCategory === 'DIALYSIS' 
              ? 'bg-rose-950/70 border-rose-500 text-white' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="truncate">ผู้ป่วยฟอกไต</span>
            <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-400">164 <span className="text-[10px] text-slate-400 font-sans">ราย</span></div>
          <div className="text-[10px] text-rose-300 font-semibold mt-0.5">P1 เสี่ยงน้ำเกิน</div>
        </div>

        {/* Home O2 / Vent */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'HOME_O2_VENTILATOR' ? 'all' : 'HOME_O2_VENTILATOR')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedCategory === 'HOME_O2_VENTILATOR' 
              ? 'bg-rose-950/70 border-rose-500 text-white' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="truncate">Home O2 / เครื่องช่วย</span>
            <HeartPulse className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          </div>
          <div className="text-lg font-bold font-mono text-sky-400">137 <span className="text-[10px] text-slate-400 font-sans">ราย</span></div>
          <div className="text-[10px] text-rose-300 font-semibold mt-0.5">P1 พึ่งพาไฟ</div>
        </div>

        {/* Bedridden */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'BEDRIDDEN' ? 'all' : 'BEDRIDDEN')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedCategory === 'BEDRIDDEN' 
              ? 'bg-amber-950/70 border-amber-500 text-white' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="truncate">ติดเตียง / พึ่งพาอุปกรณ์</span>
            <Bed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">264 <span className="text-[10px] text-slate-400 font-sans">ราย</span></div>
          <div className="text-[10px] text-amber-300 font-semibold mt-0.5">P2 เฝ้าระวัง</div>
        </div>

        {/* Critical NCD */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'CRITICAL_NCD' ? 'all' : 'CRITICAL_NCD')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedCategory === 'CRITICAL_NCD' 
              ? 'bg-emerald-950/70 border-emerald-500 text-white' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="truncate">ผู้ป่วยขาดยาไม่ได้</span>
            <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">195 <span className="text-[10px] text-slate-400 font-sans">ราย</span></div>
          <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">P3 จัดส่งยา 30 วัน</div>
        </div>

        {/* SMI Psych */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'SMI_PSYCH' ? 'all' : 'SMI_PSYCH')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedCategory === 'SMI_PSYCH' 
              ? 'bg-purple-950/70 border-purple-500 text-white' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="truncate">SMI / จิตเวชรุนแรง</span>
            <Smile className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          </div>
          <div className="text-lg font-bold font-mono text-purple-400">86 <span className="text-[10px] text-slate-400 font-sans">ราย</span></div>
          <div className="text-[10px] text-purple-300 font-semibold mt-0.5">P2 เฝ้าระวังยาจิตเวช</div>
        </div>

        {/* Palliative */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'PALLIATIVE' ? 'all' : 'PALLIATIVE')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedCategory === 'PALLIATIVE' 
              ? 'bg-rose-950/70 border-rose-500 text-white' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="truncate">Palliative Device</span>
            <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-400">48 <span className="text-[10px] text-slate-400 font-sans">ราย</span></div>
          <div className="text-[10px] text-rose-300 font-semibold mt-0.5">P1 ดูแลใกล้ชิด</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย, อาการ, ที่อยู่, เบอร์โทร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">ความเร่งด่วน: ทั้งหมด</option>
            <option value="P1_IMMEDIATE">P1 (อพยพทันที &lt; 6 ชม.)</option>
            <option value="P2_WATCH">P2 (เฝ้าระวัง 12-24 ชม.)</option>
            <option value="P3_ROUTINE">P3 (ดูแลในพื้นที่)</option>
          </select>

          {/* Evac status filter */}
          <select
            value={selectedEvacStatus}
            onChange={(e) => setSelectedEvacStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">สถานะอพยพ: ทั้งหมด</option>
            <option value="NOT_EVACUATED">ยังไม่อพยพ (รอช่วยเหลือ)</option>
            <option value="CONTACTED">ติดต่อได้แล้ว / ประสานญาติ</option>
            <option value="IN_TRANSIT">กำลังเคลื่อนย้าย (ในเส้นทาง)</option>
            <option value="SAFE_SHELTER">ปลอดภัยที่ศูนย์พักพิง</option>
            <option value="HOSPITALIZED">เข้ารับการรักษาใน รพ.</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedPriority('all');
              setSelectedEvacStatus('all');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </div>

      {/* Patient Registry Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">ชื่อผู้ป่วย / อายุ</th>
                <th className="py-3 px-2">กลุ่มเปราะบาง & รายละเอียดโรค</th>
                <th className="py-3 px-2">ที่อยู่ & พิกัด</th>
                <th className="py-3 px-2">เบอร์โทร & อสม. รับผิดชอบ</th>
                <th className="py-3 px-2 text-center">ระดับ Triage</th>
                <th className="py-3 px-2 text-center">สถานะอพยพ</th>
                <th className="py-3 px-2">ปลายทางปลอดภัย / ความต้องการพิเศษ</th>
                <th className="py-3 px-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const triageColor = 
                    patient.triagePriority === 'P1_IMMEDIATE' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                    patient.triagePriority === 'P2_WATCH' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                    'bg-emerald-950 text-emerald-300 border-emerald-700';

                  const evacColor = 
                    patient.evacuationStatus === 'NOT_EVACUATED' ? 'bg-rose-900/60 text-rose-200 border-rose-700 animate-pulse' :
                    patient.evacuationStatus === 'IN_TRANSIT' ? 'bg-sky-900/60 text-sky-200 border-sky-600' :
                    patient.evacuationStatus === 'CONTACTED' ? 'bg-amber-900/60 text-amber-200 border-amber-600' :
                    'bg-emerald-900/60 text-emerald-200 border-emerald-600';

                  const evacLabel = 
                    patient.evacuationStatus === 'NOT_EVACUATED' ? '⚠️ ยังไม่อพยพ' :
                    patient.evacuationStatus === 'IN_TRANSIT' ? '🚑 กำลังเคลื่อนย้าย' :
                    patient.evacuationStatus === 'CONTACTED' ? '📞 ประสานแล้ว' :
                    patient.evacuationStatus === 'SAFE_SHELTER' ? '✓ ศูนย์พักพิง' : '🏥 ถึง รพ.แล้ว';

                  return (
                    <tr key={patient.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-sm">{patient.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {patient.id} · อายุ {patient.age} ปี
                        </div>
                      </td>

                      {/* Category & Condition */}
                      <td className="py-3 px-2 max-w-[200px]">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-emerald-300 mb-1">
                          {VULNERABLE_CATEGORY_COUNTS[patient.category]?.label || patient.category}
                        </span>
                        <p className="text-[11px] text-slate-300 truncate" title={patient.conditionDescription}>
                          {patient.conditionDescription}
                        </p>
                      </td>

                      {/* Address */}
                      <td className="py-3 px-2">
                        <div className="text-slate-200 font-medium">{patient.address}</div>
                        <div className="text-[11px] text-slate-400">
                          อ.{patient.district}
                        </div>
                      </td>

                      {/* Contact & VHV */}
                      <td className="py-3 px-2 font-mono">
                        <div className="text-emerald-400 font-semibold">{patient.phone}</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          ญาติ: {patient.caregiverPhone}
                        </div>
                        <div className="text-[10px] text-amber-300 font-sans mt-0.5">
                          {patient.asmVolunteerName}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${triageColor}`}>
                          {patient.triagePriority === 'P1_IMMEDIATE' ? 'P1 ด่วนวิกฤต' : patient.triagePriority === 'P2_WATCH' ? 'P2 เฝ้าระวัง' : 'P3 ทั่วไป'}
                        </span>
                      </td>

                      {/* Evac Status */}
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${evacColor}`}>
                          {evacLabel}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-1 truncate max-w-[110px]" title={patient.lastCallTimestamp}>
                          {patient.lastCallTimestamp}
                        </div>
                      </td>

                      {/* Destination & Needs */}
                      <td className="py-3 px-2 max-w-[180px]">
                        <div className="text-slate-200 font-medium truncate" title={patient.safeDestination}>
                          📍 {patient.safeDestination}
                        </div>
                        <div className="text-[10px] text-amber-300/90 truncate" title={patient.specialNeeds}>
                          {patient.specialNeeds}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveCallPatient(patient)}
                            title="โทรด่วนผู้ป่วย / ญาติ / อสม."
                            className="p-1.5 rounded bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setStatusUpdatePatient(patient)}
                            title="อัปเดตสถานะการอพยพ"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            <Ambulance className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`ยืนยันการลบผู้ป่วย: ${patient.name} (${patient.id})? ข้อมูลจะถูกซิงค์อัตโนมัติ`)) {
                                deletePatient(patient.id);
                              }
                            }}
                            title="ลบข้อมูลผู้ป่วย (Delete)"
                            className="p-1.5 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    ไม่พบข้อมูลผู้ป่วยที่ตรงตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Quick Phone Contact Action */}
      {activeCallPatient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                ติดต่อด่วน: {activeCallPatient.name}
              </h3>
              <button 
                onClick={() => setActiveCallPatient(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">เบอร์โทรผู้ป่วย:</div>
                  <div className="font-mono text-emerald-400 font-bold text-base">{activeCallPatient.phone}</div>
                </div>
                <a
                  href={`tel:${activeCallPatient.phone}`}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  โทรออก
                </a>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">เบอร์โทรญาติ/ผู้ดูแล:</div>
                  <div className="font-mono text-sky-400 font-bold text-sm">{activeCallPatient.caregiverPhone}</div>
                </div>
                <a
                  href={`tel:${activeCallPatient.caregiverPhone.split(' ')[0]}`}
                  className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  โทรหาญาติ
                </a>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">อสม. ประจำตัวผู้ป่วย:</div>
                <div className="font-semibold text-amber-300 mt-0.5">{activeCallPatient.asmVolunteerName}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  ที่อยู่: {activeCallPatient.address} อ.{activeCallPatient.district}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveCallPatient(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Update Evacuation Status */}
      {statusUpdatePatient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Ambulance className="w-4 h-4 text-amber-400" />
                อัปเดตสถานะการอพยพ: {statusUpdatePatient.name}
              </h3>
              <button 
                onClick={() => setStatusUpdatePatient(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-400">เลือกสถานะการช่วยเหลือล่าสุดสำหรับผู้ป่วยรายนี้:</p>
              
              <button
                onClick={() => handleUpdateStatus(statusUpdatePatient.id, 'NOT_EVACUATED')}
                className="w-full text-left p-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 flex items-center justify-between"
              >
                <span>⚠️ ยังไม่อพยพ (น้ำเริ่มท่วม/รอความช่วยเหลือ)</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(statusUpdatePatient.id, 'CONTACTED')}
                className="w-full text-left p-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 flex items-center justify-between"
              >
                <span>📞 ติดต่อได้แล้ว (เตรียมพร้อมรอรถ/เรือ)</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(statusUpdatePatient.id, 'IN_TRANSIT')}
                className="w-full text-left p-2.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 flex items-center justify-between"
              >
                <span>🚑 กำลังเคลื่อนย้าย (อยู่บนรถกู้ชีพ/เรือ ปภ.)</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(statusUpdatePatient.id, 'SAFE_SHELTER')}
                className="w-full text-left p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 flex items-center justify-between"
              >
                <span>✓ ถึงศูนย์พักพิงชั่วคราวปลอดภัยแล้ว</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(statusUpdatePatient.id, 'HOSPITALIZED')}
                className="w-full text-left p-2.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 flex items-center justify-between"
              >
                <span>🏥 เข้ารับการรักษา ณ หอผู้ป่วยโรงพยาบาล</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Vulnerable Patient */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                ลงทะเบียนผู้ป่วยกลุ่มเปราะบางใหม่ (EVAC Registry)
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewPatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายมะแอ ดือราแม"
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
                  <label className="block text-slate-400 mb-1">กลุ่มเปราะบาง *</label>
                  <select
                    value={newPatientForm.category}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, category: e.target.value as VulnerableCategory })}
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
                <label className="block text-slate-400 mb-1">รายละเอียดโรค / อาการสำคัญ</label>
                <input
                  type="text"
                  placeholder="เช่น ไตวายเรื้อรัง นัดฟอกไต 08:00 น. หรือ ครรภ์ 38 สัปดาห์"
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
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, district: e.target.value as DistrictName })}
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
                    <option value="ศรีสาคร">ศรีสาคร</option>
                    <option value="บาเจาะ">บาเจาะ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ความเร่งด่วน Triage</label>
                  <select
                    value={newPatientForm.triagePriority}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, triagePriority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="P1_IMMEDIATE">P1 ด่วนวิกฤต (อพยพทันที &lt; 6 ชม.)</option>
                    <option value="P2_WATCH">P2 เฝ้าระวัง (12-24 ชม.)</option>
                    <option value="P3_ROUTINE">P3 ทั่วไป (ดูแลในพื้นที่)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ที่อยู่ (บ้านเลขที่ / หมู่บ้าน / ตำบล)</label>
                <input
                  type="text"
                  placeholder="เช่น 15/4 หมู่ 2 ต.ปาเสมัส"
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
                  <label className="block text-slate-400 mb-1">เบอร์โทรญาติ / ผู้ดูแล</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={newPatientForm.caregiverPhone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, caregiverPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">อุปกรณ์พิเศษที่ต้องใช้</label>
                <input
                  type="text"
                  placeholder="เช่น ถังออกซิเจนสำรอง, เครื่องดูดเสมหะ, เปลนอนราบ"
                  value={newPatientForm.specialNeeds}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, specialNeeds: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  บันทึกเข้าสู่ทะเบียน EOC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
