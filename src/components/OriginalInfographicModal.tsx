import React from 'react';
import { X, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OriginalInfographicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalInfographicModal: React.FC<OriginalInfographicModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-5 text-slate-200 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h3 className="font-bold text-white text-base">
                อินโฟกราฟิกทางการ สสจ.นราธิวาส (เอกสารต้นฉบับภารกิจอุทกภัย)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              สำนักงานสาธารณสุขจังหวัดนราธิวาส: “เตรียมพร้อมก่อนน้ำท่วม ปกป้องชีวิต ลดความสูญเสีย ระบบสุขภาพยังเดินต่อได้”
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* The Authentic Uploaded Image */}
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
          <img
            src="/A71DB175-ECCB-4F13-8F9E-980918C436E1.png"
            alt="อินโฟกราฟิกทางการ สสจ.นราธิวาส เตรียมพร้อมก่อนน้ำท่วม"
            className="w-full h-auto object-contain max-h-[68vh]"
          />
        </div>

        {/* Verification Checkpoints */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
          <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            การยืนยันความถูกต้องของข้อมูลในระบบ Dashboard (100% Data Fidelity):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ระดับ 2 : PRE-ACTIVATE BCP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ฝน 24ชม. 156.4 มม. (+32%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>จุดตัดขาด 11 จุด (หลัก 4/สำรอง 7)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ผู้ป่วยเปราะบาง 1,284 ราย</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>รพ. เฝ้าระวัง 5/13 แห่ง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>รพ.สต. เสี่ยง 18/111 แห่ง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ความพร้อมกำลังคน 85%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>เสียชีวิต 0 ราย (Zero Preventable)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
          >
            ปิดเอกสาร
          </button>
        </div>
      </div>
    </div>
  );
};
