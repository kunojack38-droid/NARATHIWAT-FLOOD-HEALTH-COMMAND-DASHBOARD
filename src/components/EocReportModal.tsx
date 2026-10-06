import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Download, 
  FileText, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { 
  INITIAL_WEATHER, 
  HOSPITALS_DATA, 
  PRIMARY_CARE_CLINICS_SUMMARY, 
  TOTAL_STAFF_SUMMARY,
  WASHOUT_ROUTES_DATA 
} from '../data/narathiwatDisasterData';

interface EocReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EocReportModal: React.FC<EocReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const reportText = `
รายงานสถานการณ์ภาวะฉุกเฉินทางด้านสาธารณสุข (EOC Situation Report - SitRep)
สำนักงานสาธารณสุขจังหวัดนราธิวาส
ประจำวันที่ 06 ตุลาคม 2569 เวลา 06:00 น. (ฉบับที่ 02/2569)

1. ระดับสถานการณ์และการเฝ้าระวัง:
- ระดับสถานการณ์จังหวัด: LEVEL 2 : PRE-ACTIVATE BCP (เฝ้าระวัง : เตรียมพร้อม)
- ปริมาณน้ำฝนสะสม 24 ชม.: 156.4 มม. (+32% จากสัปดาห์ก่อน)
- คาดการณ์ฝน 72 ชม.: 312.6 มม. (ความเสี่ยงน้ำท่วมเพิ่มสูงขึ้นในลุ่มน้ำโก-ลกและสายบุรี)
- ผู้เสียชีวิตจากอุทกภัย: 0 ราย (เป้าหมาย: ZERO PREVENTABLE DEATH)

2. ผลกระทบต่อโครงข่ายเส้นทางคมนาคม:
- ถนนถูกตัดขาด: 11 จุด (สายหลัก 4 จุด, สายสำรอง 7 จุด)
- จุดวิกฤตหลัก: ทล. 4056 สะพานโต๊ะเด็ง กม. 24+100 (ระดับน้ำท่วม 1.20 ม.), สะพานร่อน ทล. 4084 ตากใบ, ทางลอด รฟท. โก-ลก
- เส้นทางสำรอง: เปิดใช้งานเส้นทางสำรอง 1 (แว้ง-โก-ลก) และเส้นทางสำรอง 2 (เลียบชายฝั่งตากใบ ทล. 4107) พร้อมรถยกสูง Unimog ทหารพราน

3. ทรัพยากรและความต่อเนื่องของสถานพยาบาล:
- โรงพยาบาล 13 แห่ง: ปกติ 8 แห่ง, เฝ้าระวัง 5 แห่ง (รพ.สุไหงโก-ลก แดง Autonomy 24 ชม., ระแงะ 36 ชม., ตากใบ 36 ชม., นราธิวาสฯ 48 ชม., ยี่งอ 48 ชม.)
- รพ.สต. 111 แห่ง: ปกติ 58 แห่ง (53%), เฝ้าระวัง 12 แห่ง, เสี่ยง 6 แห่ง, ปิดชั่วคราวและย้ายจุดบริการ 29 แห่ง
- ทรัพยากรสำรอง: ไฟฟ้า Generator 72 ชม. (พร้อม), ออกซิเจน 48 ชม. (เฝ้าระวัง), น้ำประปา 72 ชม. (พร้อม), คลังยา 30 วัน (พร้อม), คลังเลือด PRBC (เพียงพอ)

4. การคุ้มครองผู้ป่วยกลุ่มเปราะบาง (1,284 ราย):
- หญิงตั้งครรภ์เสี่ยงสูง/ใกล้คลอด: 218 ราย (P1 อพยพเข้าห้องคลอดแล้ว 85 ราย)
- ผู้ป่วยฟอกไต: 164 ราย (P1 จัดคิวฟอกไตล่วงหน้า ณ รพ.นราธิวาสฯ และศูนย์สำรอง)
- Home O2 / เครื่องช่วยหายใจ: 137 ราย (ส่งมอบถัง O2 สำรองและ UPS สำรองไฟครบถ้วน)
- ผู้ป่วยติดเตียง: 264 ราย (ประสานย้ายขึ้นชั้น 2 และศูนย์พักพิง)
- ผู้ป่วยขาดยาไม่ได้: 195 ราย (ส่งยาสำรอง 30 วันทางเรือ ปภ.)
- จิตเวชรุนแรง (SMI): 86 ราย
- Palliative / Device-dependent: 48 ราย

5. ระบบสื่อสารสำรอง (4 ชั้น):
- Tier 1 โครงข่ายมือถือ/ไฟเบอร์ (เสี่ยงล่ม)
- Tier 2 วิทยุสื่อสาร VHF สธ. 155.775 / 168.275 MHz (ทดสอบแล้ว ผ่าน 100%)
- Tier 3 ดาวเทียม Starlink 3 สถานี + Inmarsat 4 เครื่อง (พร้อมใช้งาน)
- Tier 4 สาส์นฉุกเฉินมอเตอร์ไซค์วิบาก อส. และโดรนสำรวจ (Standby)

6. แผนกรณีสำรองหมด (Surge Protocol):
- พร้อมเปิดระเบียง Green Corridor รับออกซิเจนเหลวจาก บมจ.บิก สงขลา (Lead time 6 ชม.)
- เฮลิคอปเตอร์แอร์ลิฟต์เลือดจากภาคบริการโลหิตที่ 12 หาดใหญ่ (Lead time 2.5 ชม.)
- รถบรรทุกน้ำมันทหาร มทบ.46 เติมน้ำมัน Generator (Lead time 4 ชม.)
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                รายงานสถานการณ์ภาวะฉุกเฉิน สสจ.นราธิวาส (SitRep)
              </h3>
              <p className="text-xs text-slate-400">ฉบับเสนอผู้ว่าราชการจังหวัด และกระทรวงสาธารณสุข</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์เอกสาร</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Styled Content */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
          {reportText}
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>รับรองข้อมูลโดย: ศูนย์ปฏิบัติการภาวะฉุกเฉินทางด้านสาธารณสุข สสจ.นราธิวาส</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
