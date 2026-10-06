import React, { useState } from 'react';
import { 
  Settings, 
  FileSpreadsheet, 
  Layers, 
  ShieldAlert, 
  Radio, 
  Save, 
  RotateCcw, 
  Check, 
  Sliders, 
  Database, 
  Download, 
  Upload, 
  AlertTriangle, 
  Bell, 
  Key, 
  CheckCircle2, 
  ExternalLink,
  Smartphone,
  Eye,
  RefreshCw,
  Sparkles,
  Type
} from 'lucide-react';
import { AlertLevel } from '../types/eoc';
import { AppsScriptWebhookModal } from './AppsScriptWebhookModal';
import { useEocData } from '../context/EocDataContext';

interface SettingsModuleProps {
  onNotify?: (msg: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onNotify }) => {
  const { fontSize, setFontSize, syncDatabase, isDbSyncing, lastDbSyncTime } = useEocData();
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState<boolean>(false);
  // Saved Configuration State (with localStorage fallback)
  const [sheetId, setSheetId] = useState<string>(() => {
    return localStorage.getItem('eoc_settings_sheet_id') || '17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA';
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('eoc_settings_auto_sync') !== 'false';
  });

  const [syncInterval, setSyncInterval] = useState<number>(() => {
    return Number(localStorage.getItem('eoc_settings_sync_interval')) || 30;
  });

  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('eoc_settings_webhook_url') || '';
  });

  const [defaultBasemap, setDefaultBasemap] = useState<string>(() => {
    return localStorage.getItem('eoc_settings_default_basemap') || 'satellite';
  });

  const [bcpLevel, setBcpLevel] = useState<AlertLevel>(() => {
    return (localStorage.getItem('eoc_settings_bcp_level') as AlertLevel) || 'LEVEL 2 : PRE-ACTIVATE BCP';
  });

  const [rainfallThreshold, setRainfallThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('eoc_settings_rainfall_thresh')) || 100;
  });

  const [autonomyCriticalHours, setAutonomyCriticalHours] = useState<number>(() => {
    return Number(localStorage.getItem('eoc_settings_autonomy_crit')) || 24;
  });

  const [eocCommanderName, setEocCommanderName] = useState<string>(() => {
    return localStorage.getItem('eoc_settings_commander') || 'นายแพทย์สาธารณสุขจังหวัดนราธิวาส (ผบ. เหตุการณ์)';
  });

  const [hotline1669Active, setHotline1669Active] = useState<boolean>(true);
  const [radioVhfFrequency, setRadioVhfFrequency] = useState<string>('162.300 MHz (ข่ายสาธารณสุข)');

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'sheet' | 'map' | 'display' | 'eoc' | 'comm' | 'backup'>('sheet');

  const handleSaveSettings = () => {
    localStorage.setItem('eoc_settings_sheet_id', sheetId);
    localStorage.setItem('eoc_settings_auto_sync', String(autoSyncEnabled));
    localStorage.setItem('eoc_settings_sync_interval', String(syncInterval));
    localStorage.setItem('eoc_settings_webhook_url', webhookUrl);
    localStorage.setItem('eoc_settings_default_basemap', defaultBasemap);
    localStorage.setItem('eoc_settings_bcp_level', bcpLevel);
    localStorage.setItem('eoc_settings_rainfall_thresh', String(rainfallThreshold));
    localStorage.setItem('eoc_settings_autonomy_crit', String(autonomyCriticalHours));
    localStorage.setItem('eoc_settings_commander', eocCommanderName);

    setIsSaved(true);
    if (onNotify) {
      onNotify('✓ บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    }
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('ท่านต้องการรีเซ็ตการตั้งค่ากลับสู่ค่าเริ่มต้นจากโรงงานใช่หรือไม่?')) {
      setSheetId('17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA');
      setAutoSyncEnabled(true);
      setSyncInterval(30);
      setWebhookUrl('');
      setDefaultBasemap('satellite');
      setBcpLevel('LEVEL 2 : PRE-ACTIVATE BCP');
      setRainfallThreshold(100);
      setAutonomyCriticalHours(24);
      setEocCommanderName('นายแพทย์สาธารณสุขจังหวัดนราธิวาส (ผบ. เหตุการณ์)');
      localStorage.clear();
      if (onNotify) {
        onNotify('รีเซ็ตการตั้งค่าเรียบร้อยแล้ว');
      }
    }
  };

  const handleExportDataJson = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      sheetId,
      autoSyncEnabled,
      syncInterval,
      bcpLevel,
      patients: localStorage.getItem('eoc_sheet_patients'),
      hospitals: localStorage.getItem('eoc_sheet_hospitals'),
      washouts: localStorage.getItem('eoc_sheet_washouts')
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EOC_Narathiwat_Backup_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-inner">
            <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ตั้งค่าระบบศูนย์ปฏิบัติการ EOC (System Preferences)
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                CONFIG ENGINE v2.4
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              กำหนดค่าเชื่อมต่อ Google Sheet แบบ 2-WAY, ค่าพิกัดแผนที่, เกณฑ์การแจ้งเตือน BCP และการสื่อสารฉุกเฉิน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-colors"
          >
            {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'บันทึกสำเร็จ!' : 'บันทึกการตั้งค่า'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tabs & Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1 bg-slate-900 p-2 rounded-2xl border border-slate-800 h-fit">
          <button
            onClick={() => setActiveSection('sheet')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'sheet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>เชื่อมต่อ Google Sheet 2-WAY</span>
          </button>

          <button
            onClick={() => setActiveSection('map')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>แผนที่ Leaflet (ปลอด API Key)</span>
          </button>

          <button
            onClick={() => setActiveSection('display')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'display'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>ขนาดตัวอักษร & การแสดงผล</span>
          </button>

          <button
            onClick={() => setActiveSection('eoc')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'eoc'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>ระดับการตอบโต้ EOC & BCP</span>
          </button>

          <button
            onClick={() => setActiveSection('comm')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'comm'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>สื่อสารฉุกเฉิน & วิทยุสื่อสาร</span>
          </button>

          <button
            onClick={() => setActiveSection('backup')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'backup'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>สำรองข้อมูล & Cache Data</span>
          </button>
        </div>

        {/* Section Contents */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section 1: Google Sheet 2-WAY */}
          {activeSection === 'sheet' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  การเชื่อมต่อ Google Sheet ID แบบ 2-WAY (CRUD Engine)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  กำหนดรหัสเอกสาร Google Sheet ที่ใช้บันทึก อ่าน และซิงค์ข้อมูลผู้ป่วยเปราะบาง 1,284 ราย, ข้อมูล 13 รพ. และจุดตัดขาด 11 จุด
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Google Sheet ID (ID ปัจจุบันที่เชื่อมโยง):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                      placeholder="ป้อน Google Sheet ID"
                    />
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <span>เปิด Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    ค่าเริ่มต้นทางการ: <strong className="font-mono text-slate-400">17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA</strong>
                  </span>
                </div>

                {/* Auto Sync Toggle & Interval */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">สวิตช์ Auto-Sync อัตโนมัติ:</span>
                      <span className="text-[11px] text-slate-400">ซิงค์ทั้งดึง (Pull) และส่ง (Push)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        autoSyncEnabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {autoSyncEnabled ? 'เปิดอยู่ (ON)' : 'ปิดอยู่ (OFF)'}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">รอบเวลาการซิงค์ (Interval):</span>
                      <span className="text-[11px] text-slate-400">กำหนดความถี่ตรวจสอบ</span>
                    </div>
                    <select
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      <option value={15}>ทุก 15 วินาที</option>
                      <option value={30}>ทุก 30 วินาที</option>
                      <option value={60}>ทุก 1 นาที</option>
                      <option value={300}>ทุก 5 นาที</option>
                    </select>
                  </div>
                </div>

                {/* Webhook / Apps Script URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Google Apps Script Webhook URL (สำหรับการบันทึกแถวแบบ Direct Push ทันที):
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAppsScriptModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>เปิดตัวสร้างโค้ด Apps Script (Code Generator)</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec (ถ้ามี)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    หากเว้นว่างไว้ ระบบจะใช้ Local Cache + CSV 2-WAY Data Synchronization อัตโนมัติโดยไม่สะดุด
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Leaflet Map Settings */}
          {activeSection === 'map' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  การตั้งค่าแผนที่ GIS (Leaflet ปลอด API Key 100%)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ระบบทำงานบน Open Tile Servers สากล ไม่ต้องใช้ API Key ของ Google Maps หรือ Bing Maps ไม่ติดข้อจำกัดด้านโควตา
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ชั้นแผนที่ฐานเริ่มต้น (Default Basemap):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'satellite', label: 'ดาวเทียม Esri (ค่าเริ่มต้น)', sub: 'World Imagery' },
                      { id: 'hybrid', label: 'ดาวเทียม + ขอบเขต', sub: 'Imagery + Places' },
                      { id: 'dark', label: 'CARTO Dark', sub: 'โหมดมืดสังเกตการณ์' },
                      { id: 'osm', label: 'OpenStreetMap', sub: 'แผนที่ถนนมาตรฐาน' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setDefaultBasemap(mode.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          defaultBasemap === mode.id
                            ? 'bg-emerald-950/80 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-semibold text-xs block text-slate-200">{mode.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{mode.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ชั้นข้อมูลวิเคราะห์ภัยพิบัติที่เปิดทำงานอัตโนมัติ:
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Choropleth ระบายสี 13 อำเภอตามระดับความเสี่ยง (สุไหงโก-ลก แดง, ตากใบ แดง, ยี่งอ แดง)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>จุดตัดขาด 11 จุดย้อนหลัง 3 ปี พร้อมความลึกและระดับน้ำท่วมผิวทาง</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      <span>เส้นทางเลี่ยงสำรอง (Bypass Route) และจุดรับส่งทางอากาศยาน (Helipads)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section: Font Size & Display (เพิ่มขนาดอักษร) */}
          {activeSection === 'display' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Type className="w-5 h-5 text-emerald-400" />
                  การปรับขนาดตัวอักษรและการแสดงผล (Font Scaling & Readability)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ปรับขนาดตัวอักษรของระบบ EOC นราธิวาส สำหรับการอ่านที่ชัดเจนบนจอ Command Wall, แท็บเล็ต หรือโน้ตบุ๊กศูนย์บัญชาการ
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    เลือกระดับขนาดตัวอักษรของทั้งระบบ (System Font Size):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { 
                        id: 'normal', 
                        label: 'ขนาดปกติ (Standard)', 
                        percent: '100% (16px)', 
                        desc: 'เหมาะสำหรับหน้าจอคอมพิวเตอร์ทั่วไป' 
                      },
                      { 
                        id: 'large', 
                        label: 'ขนาดใหญ่ (Large)', 
                        percent: '115% (18px)', 
                        desc: 'ตัวหนังสือใหญ่ อ่านง่าย สบายตา' 
                      },
                      { 
                        id: 'xlarge', 
                        label: 'ขนาดใหญ่พิเศษ (Extra Large)', 
                        percent: '130% (20px)', 
                        desc: 'เหมาะสำหรับจอใหญ่ / Command Wall ห้อง EOC' 
                      }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFontSize(item.id as any);
                          if (onNotify) {
                            onNotify(`✓ ปรับขนาดตัวอักษรเป็น: ${item.label}`);
                          }
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          fontSize === item.id
                            ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-white">{item.label}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            fontSize === item.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.percent}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">ตัวอย่างการแสดงผลข้อความตามขนาดปัจจุบัน:</span>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="font-bold text-white mb-1">
                      ศูนย์ปฏิบัติการฉุกเฉินด้านการแพทย์และสาธารณสุข (EOC) จังหวัดนราธิวาส
                    </p>
                    <p className="text-slate-300">
                      เฝ้าระวังผู้ป่วยกลุ่มเปราะบาง 1,284 ราย ครอบคลุม 13 อำเภอ และประสานงานส่งต่อผู้ป่วยผ่านเครือข่าย OPOH ปลอดภัย 100%
                    </p>
                  </div>
                </div>

                {/* Direct Database Sync Action Card */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" />
                      ซิงค์ข้อมูลเข้าระบบ / ฐานข้อมูลทันที (Sync to Database)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ซิงค์ข้อมูลผู้ป่วย, ทรัพยากร 13 รพ. และจุดตัดขาด 11 จุดเข้าฐานข้อมูลระบบและ Google Sheet ID ปัจจุบัน
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      ซิงค์ล่าสุด: {lastDbSyncTime}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => syncDatabase(onNotify)}
                    disabled={isDbSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/60 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Database className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
                    <span>{isDbSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: EOC Alert Level Settings */}
          {activeSection === 'eoc' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  ระดับการตอบโต้ EOC และเกณฑ์เตือนภัย BCP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ปรับระดับการปฏิบัติการตามแผนความต่อเนื่องทางธุรกิจด้านสาธารณสุข (BCP Narathiwat)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ระดับสถานการณ์ศูนย์ EOC (Alert Level):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'LEVEL 1 : NORMAL', label: 'ระดับ 1 : เฝ้าระวังปกติ (NORMAL)', color: 'emerald' },
                      { id: 'LEVEL 2 : PRE-ACTIVATE BCP', label: 'ระดับ 2 : เตรียมพร้อมเปิดแผน BCP (PRE-ACTIVATE)', color: 'amber' },
                      { id: 'LEVEL 3 : FULL ACTIVATION', label: 'ระดับ 3 : เปิดศูนย์เต็มรูปแบบ (FULL ACTIVATION)', color: 'rose' },
                      { id: 'LEVEL 4 : CATASTROPHIC', label: 'ระดับ 4 : วิกฤตรุนแรงระดับเขต/ประเทศ (CATASTROPHIC)', color: 'purple' }
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setBcpLevel(lvl.id as AlertLevel)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          bcpLevel === lvl.id
                            ? 'bg-slate-800 border-amber-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-semibold text-xs block text-slate-100">{lvl.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">รหัสระบบ: {lvl.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      เกณฑ์ฝนสะสมวิกฤต (มม./24 ชม.):
                    </label>
                    <input
                      type="number"
                      value={rainfallThreshold}
                      onChange={(e) => setRainfallThreshold(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      เกณฑ์ชั่วโมง Autonomy วิกฤตสีแดง (ชั่วโมง):
                    </label>
                    <input
                      type="number"
                      value={autonomyCriticalHours}
                      onChange={(e) => setAutonomyCriticalHours(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ตำแหน่งผู้บัญชาการเหตุการณ์ (Incident Commander):
                  </label>
                  <input
                    type="text"
                    value={eocCommanderName}
                    onChange={(e) => setEocCommanderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Emergency Communication */}
          {activeSection === 'comm' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400" />
                  การสื่อสารสำรอง 4 ชั้น และความพร้อมข่ายวิทยุ
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  กำหนดความถี่วิทยุสื่อสารหลักและสำรอง กรณีโครงข่าย Fiber/Cellular ล่มในพื้นที่อุทกภัย
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">สายด่วนการแพทย์ฉุกเฉิน 1669:</span>
                    <span className="text-[11px] text-slate-400">ศูนย์รับแจ้งเหตุและสั่งการจังหวัดนราธิวาส</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                    ONLINE 24/7
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ความถี่วิทยุสื่อสาร VHF ข่ายราชการสาธารณสุข:
                  </label>
                  <input
                    type="text"
                    value={radioVhfFrequency}
                    onChange={(e) => setRadioVhfFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <span className="font-semibold text-white block">ลำดับความพร้อมสำรอง (Failover Hierarchy):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <strong className="text-emerald-400 block">Tier 1:</strong> Fiber + 4G/5G Dual SIM
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <strong className="text-sky-400 block">Tier 2:</strong> VHF Radio 150-160 MHz
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <strong className="text-amber-400 block">Tier 3:</strong> ดาวเทียม Inmarsat BGAN
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <strong className="text-rose-400 block">Tier 4:</strong> รถจักรยานยนต์วิบาก & โดรนส่งสาร
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Data Backup & Cache */}
          {activeSection === 'backup' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  การสำรองข้อมูล (Data Backup & Local Persistence)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  จัดการฐานข้อมูลผู้ป่วยเปราะบาง ข้อมูล รพ. และจุดตัดขาดในอุปกรณ์เพื่อความพร้อมในโหมดออฟไลน์
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-white block">ส่งออกไฟล์สำรองฐานข้อมูล (Export Backup):</span>
                    <span className="text-[11px] text-slate-400">ดาวน์โหลดไฟล์ JSON เก็บไว้สำรองในเครื่องศูนย์ EOC</span>
                  </div>
                  <button
                    onClick={handleExportDataJson}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ดาวน์โหลด JSON Backup</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-white block">ล้างแคชข้อมูลชั่วคราว (Clear Local Cache):</span>
                    <span className="text-[11px] text-slate-400">ล้างข้อมูลที่จัดเก็บชั่วคราวและโหลดชุดข้อมูลทางการใหม่</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('ท่านต้องการล้างแคชและโหลดข้อมูลมาตรฐานใหม่ใช่หรือไม่?')) {
                        localStorage.removeItem('eoc_sheet_patients');
                        localStorage.removeItem('eoc_sheet_hospitals');
                        localStorage.removeItem('eoc_sheet_washouts');
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>ล้างแคช (Reload Defaults)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apps Script Webhook Modal */}
      <AppsScriptWebhookModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        webhookUrl={webhookUrl}
        onSaveWebhookUrl={(url) => {
          setWebhookUrl(url);
          localStorage.setItem('eoc_settings_webhook_url', url);
        }}
        onNotify={onNotify}
      />
    </div>
  );
};
