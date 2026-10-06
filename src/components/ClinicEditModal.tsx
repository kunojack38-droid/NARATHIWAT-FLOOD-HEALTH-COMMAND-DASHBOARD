import React, { useState } from 'react';
import { 
  Stethoscope, 
  X, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Zap, 
  Activity, 
  Building2,
  Users
} from 'lucide-react';
import { PrimaryHealthClinic, DistrictName } from '../types/eoc';

interface ClinicEditModalProps {
  clinic: PrimaryHealthClinic | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clinic: PrimaryHealthClinic, isNew: boolean) => Promise<boolean>;
}

const DISTRICT_OPTIONS: DistrictName[] = [
  'สุไหงโก-ลก', 'ตากใบ', 'เมืองนราธิวาส', 'ระแงะ', 'สุไหงปาดี',
  'ยี่งอ', 'รือเสาะ', 'เจาะไอร้อง', 'จะแนะ', 'แว้ง', 'สุคิริน', 'ศรีสาคร', 'บาเจาะ'
];

export const ClinicEditModal: React.FC<ClinicEditModalProps> = ({
  clinic,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const isNew = !clinic;

  const [formData, setFormData] = useState<PrimaryHealthClinic>(() => {
    if (clinic) return { ...clinic };
    return {
      id: `PCU-${Date.now().toString().slice(-4)}`,
      name: '',
      district: 'เมืองนราธิวาส',
      status: 'normal',
      staffCount: 8,
      emergencyMedicineKit: true,
      generatorAvailable: true,
      phone: '073-511000',
      lat: 6.4258,
      lng: 101.8253
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อ รพ.สต.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formatted: PrimaryHealthClinic = {
        ...formData,
        staffCount: Number(formData.staffCount) || 0
      };

      await onSave(formatted, isNew);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล รพ.สต.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-200 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-950 border border-teal-600/50 flex items-center justify-center text-teal-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isNew ? 'เพิ่ม รพ.สต. ใหม่เข้าระบบ & Google Sheet' : `แก้ไขข้อมูล: ${formData.name}`}
              </h3>
              <p className="text-xs text-slate-400">
                หน่วยบริการปฐมพยาบาล 111 แห่ง (Primary Care Unit)
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1">รหัส รพ.สต. (ID):</label>
              <input
                type="text"
                value={formData.id}
                disabled={!isNew}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ชื่อ รพ.สต. (Clinic Name):</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น รพ.สต.บ้านมูโนะ"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="block text-slate-400 mb-1">สถานะการให้บริการ:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="normal">ปกติ (เปิดให้บริการตามปกติ)</option>
                  <option value="watch">เฝ้าระวัง (น้ำปริ่มตลิ่ง / ทางเข้าเริ่มท่วม)</option>
                  <option value="risk">พื้นที่เสี่ยงสูง (น้ำท่วมลาน รพ.สต.)</option>
                  <option value="closed">ปิดบริการ / ย้ายจุดบริการสู่ศูนย์พักพิง</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">จำนวนบุคลากร/อสม. ประจำการ:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.staffCount}
                  onChange={(e) => setFormData({ ...formData, staffCount: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="เช่น 073-611201"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emergencyMedicineKit}
                  onChange={(e) => setFormData({ ...formData, emergencyMedicineKit: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="text-slate-300">มีชุดยาและเวชภัณฑ์ฉุกเฉินพร้อม</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.generatorAvailable}
                  onChange={(e) => setFormData({ ...formData, generatorAvailable: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="text-slate-300">มีเครื่องปั่นไฟสำรองพร้อมใช้</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-950/60 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึกลง Sheet...' : isNew ? 'เพิ่ม รพ.สต.' : 'บันทึกการแก้ไขลง Sheet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
