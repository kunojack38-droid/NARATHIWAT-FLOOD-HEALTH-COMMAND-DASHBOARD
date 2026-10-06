import React, { useState } from 'react';
import { 
  Truck, 
  Droplet, 
  Heart, 
  Flame, 
  Pill, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  Building2, 
  Plane, 
  Train,
  AlertTriangle
} from 'lucide-react';
import { SURGE_LOGISTICS_PROTOCOLS } from '../data/narathiwatDisasterData';
import { SurgeProtocol } from '../types/eoc';
import { useEocData } from '../context/EocDataContext';

export const SurgeLogisticsModule: React.FC = () => {
  const { criticalHospitals } = useEocData();
  const [protocols, setProtocols] = useState<SurgeProtocol[]>(SURGE_LOGISTICS_PROTOCOLS);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const handleRequestDispatch = (protocolId: string) => {
    setProtocols(prev => prev.map(p => {
      if (p.id === protocolId) {
        return {
          ...p,
          status: 'REQUESTED'
        };
      }
      return p;
    }));
    setDispatchedId(protocolId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            แผนนำเข้าทรัพยากรฉุกเฉินระดับจังหวัด (Surge Logistics Protocol เมื่อเกิน RTO / สำรองหมด)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ตามข้อ 10: เชื่อมโยงคลังยุทธศาสตร์เขตสุขภาพที่ 12 ขบวนคุ้มกัน Green Corridor ทางอากาศยาน C-130 และรถไฟขบวนพิเศษ
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400">เงื่อนไขเริ่มทำงาน (Trigger):</span>
          <span className="font-bold text-amber-400">Autonomy &lt; 24 ชม. หรือ Blackout</span>
        </div>
      </div>

      {/* Dynamic Trigger Alert for Hospitals with Autonomy <= 24h */}
      {criticalHospitals.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>ตรวจพบโรงพยาบาลที่มี Safe Autonomy วิกฤต (&le; 24 ชั่วโมง) ที่ต้องขอรับการสนับสนุนด่วน:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {criticalHospitals.map(h => (
              <div key={h.id} className="p-2.5 rounded-lg bg-slate-950 border border-rose-900/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{h.name}</span>
                  <span className="text-[10px] text-slate-400">อ.{h.district} (เตียง {h.occupiedBeds}/{h.totalBeds})</span>
                </div>
                <span className="font-mono text-rose-400 font-bold text-xs bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  {h.autonomyHours} ชม.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Surge Protocols List */}
      <div className="space-y-4">
        {protocols.map((protocol) => {
          const typeIcon = 
            protocol.resourceType === 'LIQUID_OXYGEN' ? <Droplet className="w-5 h-5 text-sky-400" /> :
            protocol.resourceType === 'BLOOD_PRBC' ? <Heart className="w-5 h-5 text-rose-400" /> :
            protocol.resourceType === 'DIESEL_FUEL' ? <Flame className="w-5 h-5 text-amber-400" /> :
            protocol.resourceType === 'CRITICAL_DRUGS' ? <Pill className="w-5 h-5 text-purple-400" /> :
            <Truck className="w-5 h-5 text-emerald-400" />;

          const titleThai = 
            protocol.resourceType === 'LIQUID_OXYGEN' ? '1. ก๊าซออกซิเจนทางการแพทย์และออกซิเจนเหลว (LOX)' :
            protocol.resourceType === 'BLOOD_PRBC' ? '2. ถุงเลือดสำรองและส่วนประกอบโลหิต (Blood Bank)' :
            protocol.resourceType === 'DIESEL_FUEL' ? '3. น้ำมันดีเซล B7 สำหรับเครื่องกำเนิดไฟฟ้าฉุกเฉิน' :
            protocol.resourceType === 'CRITICAL_DRUGS' ? '4. ยาช่วยชีวิต เวชภัณฑ์ และน้ำเกลือ IV Fluid' :
            '5. เสบียงอาหารปรุงสำเร็จและน้ำดื่มพระราชทาน';

          const transportBadge = 
            protocol.corridorMode === 'GREEN_CONVOY_TRUCK' ? 'ขบวนรถคอนวอยคุ้มกัน Green Corridor' :
            protocol.corridorMode === 'HELICOPTER_AIRLIFT' ? 'แอร์ลิฟต์ ฮ. กองทัพเรือ / ทบ.' :
            protocol.corridorMode === 'C130_AIRLIFT' ? 'เครื่องบินลำเลียง C-130 ทอ. ลงสนามบินนราธิวาส' :
            'ขบวนรถไฟขนส่งพิเศษ รฟท. (หาดใหญ่ - ตันหยงมัส)';

          return (
            <div 
              key={protocol.id}
              className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    {typeIcon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{titleThai}</h3>
                    <p className="text-xs text-amber-400 font-medium">{protocol.triggerThreshold}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    protocol.status === 'REQUESTED' 
                      ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse' 
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}>
                    {protocol.status === 'REQUESTED' ? '⚠️ ส่งคำขอสนับสนุนแล้ว' : 'พร้อมสั่งการ (STANDBY)'}
                  </span>

                  {protocol.status === 'STANDBY' ? (
                    <button
                      onClick={() => handleRequestDispatch(protocol.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      เปิดแผนนำเข้า
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      กำลังนำขบวน
                    </span>
                  )}
                </div>
              </div>

              {/* Protocol Execution Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {/* Source Hub */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">แหล่งต้นทาง (Source Escrow Hub):</span>
                  <div className="font-semibold text-white">{protocol.sourceHub}</div>
                </div>

                {/* Corridor & Mode */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">ช่องทางลำเลียง (Corridor):</span>
                  <div className="font-semibold text-emerald-300">{transportBadge}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{protocol.transportCorridor}</div>
                </div>

                {/* Lead Time */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">ระยะเวลาส่งถึง (Lead Time):</span>
                  <div className="font-mono font-bold text-amber-400 text-base">
                    &le; {protocol.leadTimeHours} ชั่วโมง
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">ถึงคลังกลาง สสจ. หรือ รพ.เป้าหมาย</div>
                </div>

                {/* Escort & Authority */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">หน่วยคุ้มกัน & ประสานงาน:</span>
                  <div className="font-semibold text-slate-200">{protocol.escortAuthority}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{protocol.contactAgency}</div>
                </div>
              </div>

              {/* Active Requested Notification Banner */}
              {protocol.status === 'REQUESTED' && (
                <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded-lg text-xs text-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      คำขอได้รับการบันทึก: ได้ส่งรหัสคำสั่งไปยังศูนย์ประสานการส่งกำลังบำรุง กองทัพภาคที่ 4 และ สป.สธ. แล้ว
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white text-[11px]">ETA: ~{protocol.leadTimeHours} ชม.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
