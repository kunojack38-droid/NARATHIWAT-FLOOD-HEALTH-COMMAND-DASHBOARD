import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Save, 
  AlertTriangle, 
  Bed, 
  Zap, 
  Droplet, 
  Flame, 
  Activity, 
  Heart, 
  Phone, 
  User, 
  PlusCircle,
  Stethoscope,
  Check
} from 'lucide-react';
import { HospitalResource, DistrictName, RiskLevel } from '../types/eoc';

interface HospitalEditModalProps {
  hospital: HospitalResource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (hospital: HospitalResource, isNew: boolean) => Promise<boolean>;
}

const DISTRICT_OPTIONS: DistrictName[] = [
  'สุไหงโก-ลก', 'ตากใบ', 'เมืองนราธิวาส', 'ระแงะ', 'สุไหงปาดี',
  'ยี่งอ', 'รือเสาะ', 'เจาะไอร้อง', 'จะแนะ', 'แว้ง', 'สุคิริน', 'ศรีสาคร', 'บาเจาะ'
];

export const HospitalEditModal: React.FC<HospitalEditModalProps> = ({
  hospital,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const isNew = !hospital;

  // Form State
  const [formData, setFormData] = useState<HospitalResource>(() => {
    if (hospital) return { ...hospital };
    return {
      id: `HOSP-${Date.now().toString().slice(-4)}`,
      name: '',
      shortName: '',
      district: 'เมืองนราธิวาส',
      level: 'M',
      risk: 'เหลือง',
      trend: '→',
      lat: 6.4258,
      lng: 101.8253,
      totalBeds: 60,
      occupiedBeds: 40,
      icuBeds: 4,
      autonomyHours: 48,
      rtoHours: {
        er: 1,
        icu: 2,
        dialysis: 4,
        lr: 2,
        or: 4,
        power: 0.5,
        water: 2,
        oxygen: 2
      },
      resources: {
        generatorFuelHours: 48,
        generatorFuelLiters: 4000,
        oxygenHours: 48,
        oxygenCylinders: 40,
        liquidOxygenDays: 2.5,
        waterHours: 48,
        waterTankLiters: 50000,
        criticalMedicineDays: 30,
        bloodPRBCUnits: { A: 10, B: 10, O: 15, AB: 5 },
        dialysisMachines: 4,
        ventilators: 5
      },
      services: {
        er: 'normal',
        lr: 'normal',
        or: 'normal',
        icu: 'normal',
        dialysis: 'normal',
        opd: 'normal'
      },
      staff: {
        total: 100,
        readyPercentage: 85,
        physicians: 8,
        nurses: 55,
        paramedics: 8,
        pharmacists: 6,
        engineers: 4,
        teamA: 40,
        teamB: 30,
        teamC: 20
      },
      phone: '073-511000',
      directorName: 'นายแพทย์ผู้อำนวยการโรงพยาบาล'
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาล');
      return;
    }

    setIsSubmitting(true);
    try {
      const formatted: HospitalResource = {
        ...formData,
        shortName: formData.shortName.trim() || formData.name,
        totalBeds: Number(formData.totalBeds) || 0,
        occupiedBeds: Number(formData.occupiedBeds) || 0,
        icuBeds: Number(formData.icuBeds) || 0,
        autonomyHours: Number(formData.autonomyHours) || 0,
        resources: {
          ...formData.resources,
          generatorFuelHours: Number(formData.resources.generatorFuelHours) || 0,
          generatorFuelLiters: Number(formData.resources.generatorFuelLiters) || 0,
          oxygenHours: Number(formData.resources.oxygenHours) || 0,
          waterHours: Number(formData.resources.waterHours) || 0,
          waterTankLiters: Number(formData.resources.waterTankLiters) || 0,
          criticalMedicineDays: Number(formData.resources.criticalMedicineDays) || 0,
          dialysisMachines: Number(formData.resources.dialysisMachines) || 0,
          ventilators: Number(formData.resources.ventilators) || 0
        }
      };

      await onSave(formatted, isNew);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 text-slate-200 max-h-[92vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                {isNew ? 'เพิ่มโรงพยาบาลใหม่เข้าระบบ & Google Sheet' : `แก้ไขข้อมูลทรัพยากร: ${formData.name}`}
              </h3>
              <p className="text-xs text-slate-400">
                ข้อมูลจะถูกบันทึกและซิงค์แบบ 2-WAY ลงใน Google Sheet ID: 17M9s5...kkA อัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Basic Info */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              ข้อมูลทั่วไปและที่ตั้ง
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">รหัส รพ. (ID):</label>
                <input
                  type="text"
                  value={formData.id}
                  disabled={!isNew}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono disabled:opacity-50"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">ชื่อโรงพยาบาล (Hospital Name):</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น โรงพยาบาลสุไหงโก-ลก"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">อำเภอที่ตั้ง:</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value as DistrictName })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d} value={d}>อ.{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ระดับหน่วยบริการ (Level):</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                >
                  <option value="A+">A+ (ตติยภูมิขั้นสูง / ศูนย์ความเชี่ยวชาญ)</option>
                  <option value="S+">S+ (ทุติยภูมิขั้นสูง)</option>
                  <option value="M1">M1 (ทุติยภูมิระดับกลาง)</option>
                  <option value="M2">M2 (ทุติยภูมิระดับกลาง)</option>
                  <option value="M">M (ทุติยภูมิ)</option>
                  <option value="F1">F1 (ปฐมภูมิขนาดใหญ่)</option>
                  <option value="F2">F2 (ปฐมภูมิ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ระดับความเสี่ยงภัยพิบัติ (Risk):</label>
                <select
                  value={formData.risk}
                  onChange={(e) => setFormData({ ...formData, risk: e.target.value as RiskLevel })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="แดง">แดง (วิกฤต / ติดเกาะ / ท่วม)</option>
                  <option value="ส้ม">ส้ม (เสี่ยงสูง / เฝ้าระวังเข้มข้น)</option>
                  <option value="เหลือง">เหลือง (เฝ้าระวังปกติ)</option>
                  <option value="เขียว">เขียว (ปลอดภัย / พื้นที่สนับสนุน)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Beds & Safe Autonomy */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-emerald-400" />
              ศักยภาพเตียง & ชั่วโมงความปลอดภัย (Safe Autonomy)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">เตียงทั้งหมด (Total Beds):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">เตียงครองปัจจุบัน (Occupied):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.occupiedBeds}
                  onChange={(e) => setFormData({ ...formData, occupiedBeds: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">เตียง ICU (ICU Beds):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.icuBeds}
                  onChange={(e) => setFormData({ ...formData, icuBeds: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Safe Autonomy (ชม.):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.autonomyHours}
                  onChange={(e) => setFormData({ ...formData, autonomyHours: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Critical Survival Resources */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              ทรัพยากรวิกฤต (ไฟฟ้า ออกซิเจน น้ำ ยา)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">น้ำมันปั่นไฟ (ชม.):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.resources.generatorFuelHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    resources: { ...formData.resources, generatorFuelHours: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ออกซิเจนทางการแพทย์ (ชม.):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.resources.oxygenHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    resources: { ...formData.resources, oxygenHours: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">น้ำประปาสำรอง (ชม.):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.resources.waterHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    resources: { ...formData.resources, waterHours: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ยาจำเป็นวิกฤต (วัน):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.resources.criticalMedicineDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    resources: { ...formData.resources, criticalMedicineDays: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contact & Leadership */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              การติดต่อและผู้บริหาร
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">เบอร์โทรศัพท์ฉุกเฉิน (Phone):</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="เช่น 073-511090"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ชื่อผู้อำนวยการ รพ. (Director):</label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  placeholder="เช่น นพ.พรประสิทธิ์ จันทระ"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/60 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึกลง Sheet...' : isNew ? 'เพิ่มโรงพยาบาล' : 'บันทึกการแก้ไขลง Sheet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
