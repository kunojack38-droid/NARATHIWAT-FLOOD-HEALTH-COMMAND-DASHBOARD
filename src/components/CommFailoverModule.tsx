import React, { useState } from 'react';
import { 
  Radio, 
  Wifi, 
  Satellite, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  FileCheck,
  Zap,
  PhoneForwarded
} from 'lucide-react';
import { COMM_FAILOVER_TIERS } from '../data/narathiwatDisasterData';
import { CommTier } from '../types/eoc';

export const CommFailoverModule: React.FC = () => {
  const [tiers, setTiers] = useState<CommTier[]>(COMM_FAILOVER_TIERS);
  const [testLogs, setTestLogs] = useState([
    {
      id: 'LOG-01',
      time: '06/10/2569 05:45 น.',
      channel: 'VHF 155.775 MHz (ช่องนราฯ 1)',
      station: 'ศูนย์นเรนทร สสจ. &harr; รพ.สุไหงโก-ลก',
      operator: 'จ.ส.ต. ดำรงเกียรติ สว่างศรี',
      result: 'PASS (5/5 เสียงคมชัด)',
      snr: 'QSA 5 / QRK 5'
    },
    {
      id: 'LOG-02',
      time: '06/10/2569 05:30 น.',
      channel: 'Starlink Terminal #01 (สสจ.)',
      station: 'สสจ.นราธิวาส &harr; EOC กระทรวงสาธารณสุข นนทบุรี',
      operator: 'นายมูฮัมหมัด ซอและห์',
      result: 'PASS (DL 185 Mbps / Latency 36ms)',
      snr: 'SNR 12.4 dB'
    },
    {
      id: 'LOG-03',
      time: '06/10/2569 05:15 น.',
      channel: 'Inmarsat IsatPhone 2 (#03)',
      station: 'รพ.ระแงะ &harr; ศูนย์สื่อสาร ปภ. เขต 12 สงขลา',
      operator: 'นพ.วิเศษ สิรินทรโสภณ',
      result: 'PASS (เชื่อมต่อดาวเทียมสมบูรณ์)',
      snr: 'Signal Bar 5/5'
    },
    {
      id: 'LOG-04',
      time: '06/10/2569 04:50 น.',
      channel: 'Trunked Radio DTRS 800 MHz',
      station: 'แม่ข่าย 13 โรงพยาบาลในจังหวัด',
      operator: 'ศูนย์สั่งการ 1669 นราธิวาส',
      result: 'PASS (ตอบรับครบทั้ง 13 สถานี)',
      snr: 'Coverage 98%'
    }
  ]);

  const [isSimulatingRadio, setIsSimulatingRadio] = useState(false);

  const handleSimulateLiveRadioCheck = () => {
    setIsSimulatingRadio(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.`;
      
      const newLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        time: timeStr,
        channel: 'VHF 155.775 MHz (ข่ายวิทยุ สธ. ช่อง 1)',
        station: 'ทดสอบสด: ศูนย์ EOC สสจ. &harr; 13 รพ. และ 111 รพ.สต.',
        operator: 'ผู้ควบคุมข่ายวิทยุสื่อสารประจำศูนย์ EOC (ทดสอบสดผ่านระบบ)',
        result: 'PASS (ยืนยันรับสัญญาณพร้อมเพรียง 100%)',
        snr: 'QSA 5 / QRK 5 (dBm -76)'
      };

      setTestLogs([newLog, ...testLogs]);
      setIsSimulatingRadio(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            ระบบสำรองการสื่อสาร 4 ชั้น และหลักฐานการทดสอบจริง (Failover Communication Matrix)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ตามข้อ 9: หากระบบหลักล่ม &rarr; ใช้วิทยุสื่อสาร สธ./ปภ. &rarr; หากล่มอีก &rarr; ใช้สถานีดาวเทียม Starlink &rarr; หากล่มสิ้นเชิง &rarr; มอเตอร์ไซค์วิบาก อส. และโดรน
          </p>
        </div>

        <button
          onClick={handleSimulateLiveRadioCheck}
          disabled={isSimulatingRadio}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingRadio ? 'animate-spin' : ''}`} />
          <span>{isSimulatingRadio ? 'กำลังส่งสัญญาณวิทยุ...' : 'ทดสอบข่ายวิทยุสดเดี๋ยวนี้'}</span>
        </button>
      </div>

      {/* 4-Tier Visual Failover Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {tiers.map((tier) => {
          const tierBorder = 
            tier.tierNumber === 1 ? 'border-sky-500/70' :
            tier.tierNumber === 2 ? 'border-emerald-500/70' :
            tier.tierNumber === 3 ? 'border-purple-500/70' : 'border-amber-500/70';

          const tierIcon = 
            tier.tierNumber === 1 ? <Wifi className="w-5 h-5 text-sky-400" /> :
            tier.tierNumber === 2 ? <Radio className="w-5 h-5 text-emerald-400" /> :
            tier.tierNumber === 3 ? <Satellite className="w-5 h-5 text-purple-400" /> :
            <Send className="w-5 h-5 text-amber-400" />;

          return (
            <div 
              key={tier.tierNumber}
              className={`bg-slate-900 p-4 rounded-xl border ${tierBorder} space-y-3 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono text-xs font-bold text-slate-400">
                  TIER {tier.tierNumber}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  tier.operationalStatus === 'ACTIVE' ? 'bg-sky-950 text-sky-300 border border-sky-700' :
                  tier.operationalStatus === 'READY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                  'bg-amber-950 text-amber-300 border border-amber-700'
                }`}>
                  {tier.operationalStatus}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                  {tierIcon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs leading-snug">
                    {tier.tierName}
                  </h3>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                    ความครอบคลุม: {tier.coveragePercentage}%
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {tier.protocolDescription}
              </p>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div>
                  <span className="text-slate-400">อุปกรณ์:</span> <span className="text-slate-200">{tier.equipment}</span>
                </div>
                <div>
                  <span className="text-slate-400">ความถี่/ย่าน:</span> <strong className="text-amber-300 font-mono">{tier.frequencyOrBand}</strong>
                </div>
              </div>

              {/* Failover Condition Trigger */}
              <div className="text-[10px] text-slate-400 bg-slate-800/40 p-2 rounded">
                <strong>ลำดับการทำงาน:</strong>{' '}
                {tier.tierNumber === 1 ? 'ใช้งานเป็นหลัก ตรวจจับสัญญาณตลอด 24 ชม.' :
                 tier.tierNumber === 2 ? 'หาก Tier 1 โครงข่ายมือถือ/ไฟเบอร์ล่ม สลับมาข่ายวิทยุ VHF สธ. ทันที' :
                 tier.tierNumber === 3 ? 'หาก Tier 2 เสาวิทยุล้มหรือถูกฟ้าผ่า สลับใช้จานดาวเทียม Starlink ทันที' :
                 'หากสัญญาณคลื่นความถี่ล่ม 100% สาส์นฉุกเฉินมอเตอร์ไซค์วิบาก อส. และโดรน'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Test Evidence & Radio Logbook Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-sm">
                สมุดบันทึกหลักฐานการทดสอบสัญญาณจริง (Signal Verification & Transmission Logbook)
              </h3>
              <p className="text-xs text-slate-400">
                หลักฐานยืนยันความพร้อมใช้งานจริงตามระเบียบกระทรวงสาธารณสุขและ ปภ.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            LOG ENTRIES: {testLogs.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">วัน-เวลาทดสอบ</th>
                <th className="py-2.5 px-3">ช่องสัญญาณ / ความถี่</th>
                <th className="py-2.5 px-3">สถานีคู่สื่อสาร</th>
                <th className="py-2.5 px-3">เจ้าหน้าที่ผู้ทดสอบ</th>
                <th className="py-2.5 px-3">ค่าความแรงสัญญาณ</th>
                <th className="py-2.5 px-3 text-right">ผลการทดสอบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {testLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-300">{log.time}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-300">{log.channel}</td>
                  <td className="py-2.5 px-3 text-slate-200">{log.station}</td>
                  <td className="py-2.5 px-3 text-slate-400">{log.operator}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-300">{log.snr}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
