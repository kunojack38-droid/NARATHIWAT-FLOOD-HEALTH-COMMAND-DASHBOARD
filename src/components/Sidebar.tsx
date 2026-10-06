import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Map, 
  Building2, 
  Clock, 
  Users, 
  HeartPulse, 
  Ambulance, 
  Radio, 
  Truck, 
  FileSpreadsheet, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  Database,
  Type
} from 'lucide-react';
import { useEocData } from '../context/EocDataContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { syncDatabase, isDbSyncing, fontSize, setFontSize, lastDbSyncTime } = useEocData();
  const navItems = [
    { 
      id: 'overview', 
      label: 'EOC Cockpit', 
      subLabel: 'ภาพรวมบัญชาการเหตุการณ์',
      icon: LayoutDashboard,
      badge: null 
    },
    { 
      id: 'map', 
      label: 'แผนที่ดาวเทียม & ทางขาด', 
      subLabel: 'Leaflet ปลอด API Key',
      icon: Map,
      badge: '11 จุด' 
    },
    { 
      id: 'hospitals', 
      label: '13 รพ. & 111 รพ.สต.', 
      subLabel: 'เตียง ออกซิเจน เครื่องปั่นไฟ',
      icon: Building2,
      badge: '124 แห่ง' 
    },
    { 
      id: 'rto', 
      label: 'RTO & แผนกวิกฤต', 
      subLabel: 'Safe Autonomy & กู้คืนระบบ',
      icon: Clock,
      badge: null 
    },
    { 
      id: 'staff', 
      label: 'กำลังคน & ทีม A-B-C', 
      subLabel: 'ความพร้อมแพทย์-พยาบาล 85%',
      icon: Users,
      badge: '85%' 
    },
    { 
      id: 'vulnerable', 
      label: 'ผู้ป่วยเปราะบาง', 
      subLabel: 'เบอร์โทร ที่อยู่ พิกัดอพยพ',
      icon: HeartPulse,
      badge: '1,284 ราย',
      badgeColor: 'amber' 
    },
    { 
      id: 'referral', 
      label: 'ระบบส่งต่อ OPOH', 
      subLabel: 'ทางเลี่ยง สาย 42 & โก-ลก',
      icon: Ambulance,
      badge: null 
    },
    { 
      id: 'comm', 
      label: 'สื่อสารสำรอง 4 ชั้น', 
      subLabel: 'Fiber/4G > VHF > BGAN > รถวิบาก',
      icon: Radio,
      badge: '4 Tiers' 
    },
    { 
      id: 'surge', 
      label: 'โลจิสติกส์สำรองหมด', 
      subLabel: 'ขอสนับสนุนเขต 12 & ฮ. ส่งยา',
      icon: Truck,
      badge: null 
    },
    { 
      id: 'sheet', 
      label: '2-WAY Sheet (CRUD)', 
      subLabel: 'ซิงค์อัตโนมัติ Google Sheet',
      icon: FileSpreadsheet,
      badge: 'AUTO',
      badgeColor: 'emerald' 
    },
    { 
      id: 'settings', 
      label: 'ตั้งค่าระบบ', 
      subLabel: 'Sheet ID, แผนที่, เกณฑ์ BCP',
      icon: Settings,
      badge: 'CONFIG',
      badgeColor: 'slate' 
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl ${
          // Mobile visibility
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${
          // Desktop width
          isCollapsed ? 'lg:w-20' : 'lg:w-68'
        }`}
      >
        {/* Sidebar Header Brand Area */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>

            {(!isCollapsed || isOpenMobile) && (
              <div className="flex flex-col min-w-0 transition-opacity">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm tracking-tight truncate">
                    EOC นราธิวาส
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <span className="text-[11px] text-slate-400 truncate font-mono">
                  MoPH Narathiwat
                </span>
              </div>
            )}
          </div>

          {/* Close button for Mobile / Collapse toggle button for Desktop */}
          <div className="flex items-center">
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'ขยายแถบเมนู (Expand)' : 'ย่อแถบเมนู (Collapse)'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Mini Strip (When not collapsed) */}
        {(!isCollapsed || isOpenMobile) && (
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              LEVEL 2 : PRE-ACTIVATE BCP
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              2-WAY SYNC
            </span>
          </div>
        )}

        {/* Navigation Item List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          <div className={`px-2 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${isCollapsed && !isOpenMobile ? 'text-center' : ''}`}>
            {isCollapsed && !isOpenMobile ? 'NAV' : 'เมนูหลักศูนย์ปฏิบัติการ EOC'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={isCollapsed && !isOpenMobile ? item.label : undefined}
                className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/50'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                } ${isCollapsed && !isOpenMobile ? 'justify-center px-0' : ''}`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r"></span>
                )}

                {/* Icon */}
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                }`} />

                {/* Text and badges (visible when expanded or on mobile) */}
                {(!isCollapsed || isOpenMobile) && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                    <div className="truncate">
                      <div className="text-xs truncate leading-tight">
                        {item.label}
                      </div>
                      <div className={`text-[10px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-emerald-100' : 'text-slate-500'
                      }`}>
                        {item.subLabel}
                      </div>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor === 'amber'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : item.badgeColor === 'emerald'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Floating tooltip when collapsed on desktop */}
                {isCollapsed && !isOpenMobile && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-xl">
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.subLabel}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Footer: Quick Emergency Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 shrink-0">
          {(!isCollapsed || isOpenMobile) ? (
            <div className="space-y-2">
              {/* Font Size Selector (เพิ่มขนาดอักษร) */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold">
                  <Type className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ขนาดอักษร:</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      fontSize === 'normal'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="ขนาดปกติ"
                  >
                    ปกติ
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      fontSize === 'large'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="ขนาดใหญ่ (+15%)"
                  >
                    ใหญ่
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      fontSize === 'xlarge'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="ขนาดใหญ่พิเศษ (+30%)"
                  >
                    ใหญ่+
                  </button>
                </div>
              </div>

              <button
                onClick={() => syncDatabase()}
                disabled={isDbSyncing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
                <span>{isDbSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลเข้าระบบ / ฐานข้อมูล'}</span>
              </button>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-tight">สายด่วน EOC นราธิวาส</span>
                    <span className="text-xs font-mono font-bold text-white leading-tight">1669 / 073-511115</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                <span>ซิงค์ล่าสุด {lastDbSyncTime}</span>
                <span className="text-emerald-400 truncate max-w-[90px]" title="17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA">
                  17M9s5...
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => syncDatabase()}
                disabled={isDbSyncing}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                title="ซิงค์ข้อมูลเข้าระบบ / ฐานข้อมูล"
              >
                <Database className={`w-4 h-4 ${isDbSyncing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="ขยายเมนู (Expand)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
