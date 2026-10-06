/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EocDataProvider, useEocData } from './context/EocDataContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SituationBanner } from './components/SituationBanner';
import { EocCockpitOverview } from './components/EocCockpitOverview';
import { GisMapModule } from './components/GisMapModule';
import { HospitalResourceModule } from './components/HospitalResourceModule';
import { RtoMatrixModule } from './components/RtoMatrixModule';
import { StaffManagementModule } from './components/StaffManagementModule';
import { VulnerablePatientModule } from './components/VulnerablePatientModule';
import { OpohReferralModule } from './components/OpohReferralModule';
import { CommFailoverModule } from './components/CommFailoverModule';
import { SurgeLogisticsModule } from './components/SurgeLogisticsModule';
import { SheetSyncHubModule } from './components/SheetSyncHubModule';
import { SettingsModule } from './components/SettingsModule';
import { HospitalDetailModal } from './components/HospitalDetailModal';
import { EocReportModal } from './components/EocReportModal';
import { OriginalInfographicModal } from './components/OriginalInfographicModal';
import { INITIAL_WEATHER } from './data/narathiwatDisasterData';
import { DistrictName, HospitalResource, WeatherData } from './types/eoc';

function EocDashboardApp() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  const { 
    selectedDistrict, 
    setSelectedDistrict,
    totalVulnerableCount,
    blockedWashoutsCount,
    totalOccupiedBeds
  } = useEocData();

  const [selectedHospital, setSelectedHospital] = useState<HospitalResource | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInfographicModalOpen, setIsInfographicModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Correlated weather display that reflects internal state
  const [weather, setWeather] = useState<WeatherData>(() => ({
    ...INITIAL_WEATHER,
    vulnerablePatientsTotal: totalVulnerableCount,
    roadCutoffs: {
      ...INITIAL_WEATHER.roadCutoffs,
      total: blockedWashoutsCount
    }
  }));

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sensor refresh simulator
  const handleSimulateRefresh = () => {
    setIsSimulating(true);
    setToastMessage('กำลังเชื่อมต่อสถานีวัดน้ำฝน GISTDA และ ThaiWater...');
    
    setTimeout(() => {
      setWeather(prev => ({
        ...prev,
        rainfall24h: Number((prev.rainfall24h + (Math.random() * 2 - 0.5)).toFixed(1)),
        gistdaUpdateTimestamp: `${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. (Live Sensor Sync)`
      }));
      setIsSimulating(false);
      setToastMessage('✓ ซิงค์ข้อมูลดาวเทียม GISTDA และระดับน้ำแม่น้ำโก-ลก เรียบร้อยแล้ว');
      setTimeout(() => setToastMessage(null), 3000);
    }, 1200);
  };

  const handleFilterDistrict = (district: DistrictName) => {
    if (selectedDistrict === district) {
      setSelectedDistrict(null);
    } else {
      setSelectedDistrict(district);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. Left Slidebar / Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* 2. Main Content Wrapper */}
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-68'
      }`}>
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenInfographicModal={() => setIsInfographicModalOpen(true)}
          onSimulateRefresh={handleSimulateRefresh}
          isSimulating={isSimulating}
          onToggleSidebarMobile={() => setIsOpenMobile(prev => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          onNotify={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 3500);
          }}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Official Level 2 BCP & KPI Strip */}
        <SituationBanner
          weather={{
            ...weather,
            vulnerablePatientsTotal: totalVulnerableCount,
            roadCutoffs: {
              ...weather.roadCutoffs,
              total: blockedWashoutsCount
            }
          }}
          activeDistrictFilter={selectedDistrict}
          onClearDistrictFilter={() => setSelectedDistrict(null)}
          onSelectTab={(tabId) => setActiveTab(tabId)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'overview' && (
            <EocCockpitOverview
              onSelectTab={(tabId) => setActiveTab(tabId)}
              onFilterDistrict={handleFilterDistrict}
              onSelectHospital={(hosp) => setSelectedHospital(hosp)}
              selectedDistrict={selectedDistrict}
            />
          )}

          {activeTab === 'map' && (
            <GisMapModule
              onSelectHospital={(hosp) => setSelectedHospital(hosp)}
              onFilterDistrict={handleFilterDistrict}
              selectedDistrict={selectedDistrict}
            />
          )}

          {activeTab === 'hospitals' && (
            <HospitalResourceModule
              onSelectHospitalForDetail={(hosp) => setSelectedHospital(hosp)}
              selectedDistrict={selectedDistrict}
            />
          )}

          {activeTab === 'rto' && (
            <RtoMatrixModule />
          )}

          {activeTab === 'staff' && (
            <StaffManagementModule />
          )}

          {activeTab === 'vulnerable' && (
            <VulnerablePatientModule
              selectedDistrict={selectedDistrict}
            />
          )}

          {activeTab === 'referral' && (
            <OpohReferralModule />
          )}

          {activeTab === 'comm' && (
            <CommFailoverModule />
          )}

          {activeTab === 'surge' && (
            <SurgeLogisticsModule />
          )}

          {activeTab === 'sheet' && (
            <SheetSyncHubModule
              onNotify={(msg) => {
                setToastMessage(msg);
                setTimeout(() => setToastMessage(null), 3500);
              }}
            />
          )}

          {/* Settings Module View */}
          {activeTab === 'settings' && (
            <SettingsModule
              onNotify={(msg) => {
                setToastMessage(msg);
                setTimeout(() => setToastMessage(null), 3500);
              }}
            />
          )}
        </main>

        {/* Standard Quiet Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 text-xs py-5 px-4 text-center mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              ศูนย์ปฏิบัติการภาวะฉุกเฉินทางด้านสาธารณสุข (EOC) สำนักงานสาธารณสุขจังหวัดนราธิวาส
            </span>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>บูรณาการข้อมูล: GISTDA · ThaiWater · กรมป้องกันและบรรเทาสาธารณภัย (ปภ.) · กองทัพภาคที่ 4</span>
              <span aria-hidden="true">·</span>
              <span>สายด่วนการแพทย์ฉุกเฉิน 1669</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <HospitalDetailModal
        hospital={selectedHospital}
        onClose={() => setSelectedHospital(null)}
      />

      <EocReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <OriginalInfographicModal
        isOpen={isInfographicModalOpen}
        onClose={() => setIsInfographicModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <EocDataProvider>
      <EocDashboardApp />
    </EocDataProvider>
  );
}
