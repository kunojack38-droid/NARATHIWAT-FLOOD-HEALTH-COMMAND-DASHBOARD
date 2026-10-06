import React from 'react';
import { 
  ShieldAlert, 
  FileText, 
  Image as ImageIcon, 
  RotateCw, 
  Menu,
  Settings,
  SlidersHorizontal,
  Database,
  Type
} from 'lucide-react';
import { useEocData } from '../context/EocDataContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenInfographicModal: () => void;
  onSimulateRefresh: () => void;
  isSimulating: boolean;
  onToggleSidebarMobile: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  onNotify?: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenInfographicModal,
  onSimulateRefresh,
  isSimulating,
  onToggleSidebarMobile,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onNotify
}) => {
  const { 
    fontSize, 
    setFontSize, 
    syncDatabase, 
    isDbSyncing, 
    lastDbSyncTime 
  } = useEocData();
  const getTabLabel = (id: string) => {
    switch (id) {
      case 'overview': return 'EOC Cockpit Overview';
      case 'map': return 'แผนที่ดาวเทียม & ทางขาด 11 จุด (Leaflet ปลอด Key)';
      case 'hospitals': return '13 โรงพยาบาล & 111 รพ.สต.';
      case 'rto': return 'RTO & แผนกวิกฤต (Safe Autonomy)';
      case 'staff': return 'กำลังคน & ทีมผลัด A-B-C (85%)';
      case 'vulnerable': return 'ผู้ป่วยเปราะบาง 1,284 ราย';
      case 'referral': return 'ระบบส่งต่อ OPOH & ทางเลี่ยง';
      case 'comm': return 'สื่อสารสำรอง 4 ชั้น';
      case 'surge': return 'โลจิสติกส์สำรองหมด (เขต 12)';
      case 'sheet': return 'บันทึกและซิงค์ชีต 2-WAY (CRUD)';
      case 'settings': return 'ตั้งค่าระบบ EOC';
      default: return 'ศูนย์ปฏิบัติการ EOC';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left Section: Sidebar Toggle & Branding */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <button
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="เปิดเมนู Slidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title={isSidebarCollapsed ? "ขยาย Slidebar" : "ย่อ Slidebar"}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Current Page Context & Breadcrumb */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                EOC สสจ.นราธิวาส /
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                {getTabLabel(activeTab)}
                <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE REALTIME
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section: Actions Deck */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Font Size Scaling Controls (เพิ่มขนาดอักษร) */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1" title="ปรับขนาดตัวอักษรของระบบ">
            <Type className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                fontSize === 'normal' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="ขนาดตัวอักษรปกติ (100%)"
            >
              ปกติ
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                fontSize === 'large' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="เพิ่มขนาดตัวอักษรใหญ่ (115%)"
            >
              ใหญ่
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                fontSize === 'xlarge' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="เพิ่มขนาดตัวอักษรใหญ่พิเศษ (130%) เหมาะสำหรับห้องบัญชาการ"
            >
              ใหญ่พิเศษ
            </button>
          </div>

          {/* Database Sync Button (ซิงค์ข้อมูลเข้าระบบ/ฐานข้อมูล) */}
          <button
            onClick={() => syncDatabase(onNotify)}
            disabled={isDbSyncing}
            title={`ซิงค์ข้อมูลผู้ป่วยเปราะบาง 1,284 ราย, 13 รพ. และจุดตัดขาด เข้าสู่ฐานข้อมูลระบบ (ล่าสุด: ${lastDbSyncTime})`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 transition-colors disabled:opacity-50"
          >
            <Database className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isDbSyncing ? 'กำลังซิงค์...' : 'ซิงค์ฐานข้อมูล'}</span>
            <span className="sm:hidden">ซิงค์</span>
          </button>

          {/* Simulate Refresh button */}
          <button
            onClick={onSimulateRefresh}
            title="จำลองอัปเดตข้อมูลเซนเซอร์ฝนและระดับน้ำแบบ Realtime"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden lg:inline">ซิงค์เซนเซอร์</span>
          </button>

          {/* Original Infographic Modal button */}
          <button
            onClick={onOpenInfographicModal}
            title="เปิดดูอินโฟกราฟิกทางการ สสจ.นราธิวาส ตัวจริง"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 rounded-xl border border-amber-800/60 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">ต้นฉบับ สสจ.</span>
          </button>

          {/* Settings shortcut button */}
          <button
            onClick={() => setActiveTab('settings')}
            title="ไปที่หน้าตั้งค่าระบบ"
            className={`flex items-center gap-1.5 p-2 text-xs font-medium rounded-xl border transition-colors ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">ตั้งค่า</span>
          </button>

          {/* SitRep button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">ออกรายงาน SitRep</span>
            <span className="sm:hidden">SitRep</span>
          </button>
        </div>
      </div>
    </header>
  );
};
