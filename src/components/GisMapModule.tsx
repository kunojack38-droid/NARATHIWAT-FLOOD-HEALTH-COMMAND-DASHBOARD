import React, { useEffect, useRef, useState } from 'react';
import { 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Compass, 
  Navigation, 
  Anchor, 
  Info, 
  ExternalLink, 
  Shield, 
  Eye, 
  Route, 
  Zap, 
  Building2, 
  Satellite, 
  Palette, 
  ShieldCheck 
} from 'lucide-react';
import L from 'leaflet';
import { 
  HOSPITALS_DATA, 
  WASHOUT_ROUTES_DATA, 
  DISTRICT_RISK_ASSESSMENT, 
  LOGISTICS_FLEET_SUMMARY 
} from '../data/narathiwatDisasterData';
import { 
  DISTRICT_BOUNDARIES, 
  getRiskFillColor, 
  getRiskBorderColor 
} from '../data/districtBoundaries';
import { HospitalResource, WashoutRoute, DistrictName } from '../types/eoc';

interface GisMapModuleProps {
  onSelectHospital: (hospital: HospitalResource) => void;
  onFilterDistrict: (district: DistrictName) => void;
  selectedDistrict: DistrictName | null;
}

export const GisMapModule: React.FC<GisMapModuleProps> = ({
  onSelectHospital,
  onFilterDistrict,
  selectedDistrict
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelOverlayLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const choroplethGroupRef = useRef<L.LayerGroup | null>(null);

  // Basemap State: 100% KEYLESS OPEN TILES (DEFAULT SATELLITE)
  const [baseMapType, setBaseMapType] = useState<'satellite' | 'hybrid' | 'dark' | 'osm'>('satellite');

  // Coloring Mode: By Risk Level vs By Rainfall
  const [colorMode, setColorMode] = useState<'risk' | 'rainfall'>('risk');

  // Layer Toggles
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [showGistdaFlood, setShowGistdaFlood] = useState(true);
  const [showWashoutPoints, setShowWashoutPoints] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(true);
  const [showHelipadsAndBoats, setShowHelipadsAndBoats] = useState(true);

  // Selected Item Inspector
  const [selectedWashout, setSelectedWashout] = useState<WashoutRoute | null>(WASHOUT_ROUTES_DATA[0]);

  // Purely Keyless, Open Tile Providers (NO API KEY REQUIRED)
  const getKeylessTileConfig = (type: string) => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          overlayUrl: null,
          attribution: 'Esri World Imagery (Open Public Server - No API Key)'
        };
      case 'hybrid':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Esri Satellite + Open Places Reference'
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          overlayUrl: null,
          attribution: 'CARTO Open Dark Basemap'
        };
      case 'osm':
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          overlayUrl: null,
          attribution: 'OpenStreetMap Contributors'
        };
    }
  };

  // Initialize Leaflet Map (Default Satellite, Zero API Key)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center coordinates around Narathiwat province (Lat 6.22, Lng 101.80)
    const map = L.map(mapContainerRef.current, {
      center: [6.22, 101.80],
      zoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    // Default: Keyless Public Esri Satellite Imagery
    const tileConfig = getKeylessTileConfig('satellite');
    const baseLayer = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c', 'd']
    }).addTo(map);

    baseTileLayerRef.current = baseLayer;

    // Groups for choropleth and markers
    const choroplethGroup = L.layerGroup().addTo(map);
    const layersGroup = L.layerGroup().addTo(map);

    choroplethGroupRef.current = choroplethGroup;
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Keyless Basemap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }
    if (labelOverlayLayerRef.current) {
      map.removeLayer(labelOverlayLayerRef.current);
      labelOverlayLayerRef.current = null;
    }

    const tileConfig = getKeylessTileConfig(baseMapType);
    const newBaseLayer = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c', 'd']
    }).addTo(map);

    newBaseLayer.bringToBack();
    baseTileLayerRef.current = newBaseLayer;

    if (tileConfig.overlayUrl) {
      const overlayLayer = L.tileLayer(tileConfig.overlayUrl, {
        maxZoom: 19
      }).addTo(map);
      labelOverlayLayerRef.current = overlayLayer;
    }
  }, [baseMapType]);

  // Render Choropleth District Shading (ระบายสีตามค่าระดับความเสี่ยง / ปริมาณฝน)
  useEffect(() => {
    const choroplethGroup = choroplethGroupRef.current;
    if (!choroplethGroup) return;

    choroplethGroup.clearLayers();

    if (!showChoropleth) return;

    DISTRICT_BOUNDARIES.forEach((dist) => {
      let fillColor = getRiskFillColor(dist.risk, 0.45);
      let strokeColor = getRiskBorderColor(dist.risk);

      if (colorMode === 'rainfall') {
        if (dist.rainfall24h >= 200) {
          fillColor = 'rgba(225, 29, 72, 0.55)'; // > 200 mm crimson
          strokeColor = '#f43f5e';
        } else if (dist.rainfall24h >= 150) {
          fillColor = 'rgba(234, 88, 12, 0.55)'; // 150-200 mm orange
          strokeColor = '#fb923c';
        } else if (dist.rainfall24h >= 100) {
          fillColor = 'rgba(202, 138, 4, 0.50)'; // 100-150 mm yellow
          strokeColor = '#facc15';
        } else {
          fillColor = 'rgba(22, 163, 74, 0.45)'; // < 100 mm green
          strokeColor = '#4ade80';
        }
      }

      const isDistrictSelected = selectedDistrict === dist.name;

      const polygon = L.polygon(dist.polygon, {
        color: isDistrictSelected ? '#ffffff' : strokeColor,
        weight: isDistrictSelected ? 3.5 : 2,
        fillColor: fillColor,
        fillOpacity: isDistrictSelected ? 0.7 : 0.45,
        dashArray: isDistrictSelected ? undefined : '2, 2'
      });

      polygon.on('click', () => {
        onFilterDistrict(dist.name);
      });

      polygon.bindTooltip(
        `<div style="font-family: Sarabun, sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="font-size: 13px;">อ.${dist.name}</strong><br/>
          ความเสี่ยง: <span style="font-weight: bold; color: ${strokeColor};">${dist.risk}</span><br/>
          ฝน 24 ชม.: <strong>${dist.rainfall24h} มม.</strong><br/>
          <em>${dist.description}</em>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      // District Center Label Marker
      const labelHtml = `
        <div style="
          background: rgba(15, 23, 42, 0.88);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid ${strokeColor};
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.6);
          pointer-events: none;
        ">
          ${dist.name} (${colorMode === 'risk' ? dist.risk : dist.rainfall24h + 'มม.'})
        </div>
      `;

      const labelIcon = L.divIcon({
        html: labelHtml,
        className: 'custom-district-label',
        iconAnchor: [30, 10]
      });

      const labelMarker = L.marker(dist.center, { icon: labelIcon, interactive: false });

      choroplethGroup.addLayer(polygon);
      choroplethGroup.addLayer(labelMarker);
    });

  }, [showChoropleth, colorMode, selectedDistrict]);

  // Render Overlays: Washout Points, Routes, Hospitals, Helipads, GISTDA Floods
  useEffect(() => {
    const layerGroup = layersGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    // 1. GISTDA Satellite Flood Polygons
    if (showGistdaFlood) {
      const kolokFloodPolygon = L.polygon([
        [6.00, 101.92],
        [6.05, 101.99],
        [6.14, 102.04],
        [6.26, 102.06],
        [6.28, 102.01],
        [6.18, 101.95],
        [6.06, 101.90]
      ], {
        color: '#38bdf8',
        weight: 2,
        fillColor: '#0284c7',
        fillOpacity: 0.4,
        dashArray: '4, 4'
      }).bindTooltip('พื้นที่น้ำท่วมขังดาวเทียม GISTDA: ลุ่มน้ำโก-ลก / ตากใบ', { sticky: true });

      const saiburiFloodPolygon = L.polygon([
        [6.35, 101.48],
        [6.42, 101.53],
        [6.40, 101.58],
        [6.32, 101.55],
        [6.25, 101.52]
      ], {
        color: '#60a5fa',
        weight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.35,
        dashArray: '3, 3'
      }).bindTooltip('พื้นที่น้ำท่วมขังดาวเทียม GISTDA: ลุ่มน้ำสายบุรี', { sticky: true });

      layerGroup.addLayer(kolokFloodPolygon);
      layerGroup.addLayer(saiburiFloodPolygon);
    }

    // 2. Washout Routes Markers (11 points 3-year history)
    if (showWashoutPoints) {
      WASHOUT_ROUTES_DATA.forEach((route) => {
        const markerColor = route.status === 'impassable' ? '#ef4444' : route.status === 'passable_4wd' ? '#f59e0b' : '#3b82f6';
        
        const htmlIcon = `
          <div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.8); cursor: pointer;">
            <span style="color: white; font-size: 12px; font-weight: 900;">✕</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: htmlIcon,
          className: 'custom-washout-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([route.lat, route.lng], { icon: customIcon });
        
        marker.on('click', () => {
          setSelectedWashout(route);
          if (route.district) onFilterDistrict(route.district);
        });

        marker.bindTooltip(`
          <div style="font-family: Sarabun, sans-serif;">
            <strong style="color: #ef4444;">${route.roadNumber}</strong>: ${route.name}<br/>
            ประวัติตัดขาด: <strong>ปี ${route.historicalYears.join(', ')}</strong><br/>
            ระดับน้ำท่วม: <strong style="color: #f87171;">${route.waterDepthCm} ซม.</strong>
          </div>`, 
          { direction: 'top' }
        );

        layerGroup.addLayer(marker);
      });
    }

    // 3. Alternative Routes Polylines (Green dashed bypasses)
    if (showAlternativeRoutes) {
      const altRoute1 = L.polyline([
        [6.0289, 101.9684],
        [6.1342, 102.0124],
        [6.2582, 102.0521],
        [6.3812, 101.9124],
        [6.4258, 101.8253]
      ], {
        color: '#10b981',
        weight: 4.5,
        dashArray: '6, 6',
        opacity: 0.95
      }).bindTooltip('เส้นทางสำรอง 1: เลียบชายฝั่ง ทล. 4084 + ทล. 4107 ตากใบ สู่ เมืองนราธิวาส (รองรับรถยกสูง Unimog)', { sticky: true });

      const altRoute2 = L.polyline([
        [6.0289, 101.9684],
        [5.9284, 101.8906],
        [5.9324, 101.7698],
        [6.1342, 101.6881],
        [6.3021, 101.7289]
      ], {
        color: '#059669',
        weight: 4,
        dashArray: '5, 5',
        opacity: 0.9
      }).bindTooltip('เส้นทางสำรอง 2: สันเขาดุซงญอ แว้ง-สุคิริน-จะแนะ สู่ ระแงะ', { sticky: true });

      layerGroup.addLayer(altRoute1);
      layerGroup.addLayer(altRoute2);
    }

    // 4. Hospitals (13 Hospitals)
    if (showHospitals) {
      HOSPITALS_DATA.forEach((hosp) => {
        const pinBg = hosp.risk === 'แดง' ? '#dc2626' : hosp.risk === 'ส้ม' ? '#ea580c' : hosp.risk === 'เหลือง' ? '#ca8a04' : '#16a34a';
        
        const hospIconHtml = `
          <div style="background-color: ${pinBg}; width: 32px; height: 32px; border-radius: 8px; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.8); transform: rotate(45deg); cursor: pointer;">
            <span style="color: white; font-size: 14px; font-weight: 900; transform: rotate(-45deg);">H</span>
          </div>
        `;

        const hospIcon = L.divIcon({
          html: hospIconHtml,
          className: 'custom-hosp-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon });
        
        marker.on('click', () => {
          onSelectHospital(hosp);
        });

        marker.bindTooltip(`
          <div style="font-family: Sarabun, sans-serif;">
            <strong>${hosp.name} (${hosp.level})</strong><br/>
            ความเสี่ยง: <span style="font-weight: bold; color: ${pinBg};">${hosp.risk} (${hosp.trend})</span><br/>
            Safe Autonomy: <strong>${hosp.autonomyHours} ชม.</strong><br/>
            เตียงครอง: <strong>${hosp.occupiedBeds}/${hosp.totalBeds}</strong>
          </div>`, 
          { direction: 'top' }
        );

        layerGroup.addLayer(marker);
      });
    }

    // 5. Helipads
    if (showHelipadsAndBoats) {
      const helipads = [
        { name: 'ลาน ฮ. รพ.สุไหงโก-ลก', lat: 6.035, lng: 101.971 },
        { name: 'ลาน ฮ. ค่ายกัลยาณิวัฒนา (กรม ทพ.151)', lat: 6.438, lng: 101.815 },
        { name: 'ลาน ฮ. สนามกีฬากลางจังหวัดนราธิวาส', lat: 6.418, lng: 101.831 }
      ];

      helipads.forEach((hp) => {
        const heliHtml = `
          <div style="background-color: #7c3aed; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.7);">
            <span style="color: white; font-size: 10px; font-weight: bold;">ฮ</span>
          </div>
        `;
        const heliIcon = L.divIcon({
          html: heliHtml,
          className: 'custom-heli-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        const marker = L.marker([hp.lat, hp.lng], { icon: heliIcon });
        marker.bindTooltip(`จุดบินส่งกลับสายแพทย์: <strong>${hp.name}</strong>`, { direction: 'top' });
        layerGroup.addLayer(marker);
      });
    }

  }, [showGistdaFlood, showWashoutPoints, showHospitals, showAlternativeRoutes, showHelipadsAndBoats]);

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        {/* Row 1: Basemap Style & Color Theme */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Basemap Picker (100% Free Public Keyless Tiles) */}
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">แผนที่ดาวเทียมเปิด (Open Keyless):</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setBaseMapType('satellite')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  baseMapType === 'satellite'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛰️ ภาพถ่ายดาวเทียม (ค่าเริ่มต้น)
              </button>
              <button
                onClick={() => setBaseMapType('hybrid')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  baseMapType === 'hybrid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🗺️ ดาวเทียม + ขอบเขต (Hybrid)
              </button>
              <button
                onClick={() => setBaseMapType('dark')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  baseMapType === 'dark'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⬛ Tactical Dark
              </button>
              <button
                onClick={() => setBaseMapType('osm')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  baseMapType === 'osm'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌐 OpenStreetMap (OSM)
              </button>
            </div>
          </div>

          {/* Choropleth Coloring Mode */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">ระบายสีตามค่า:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setColorMode('risk')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  colorMode === 'risk'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ระดับความเสี่ยง (แดง/ส้ม/เหลือง/เขียว)
              </button>
              <button
                onClick={() => setColorMode('rainfall')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  colorMode === 'rainfall'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ปริมาณฝนสะสม 24 ชม. (มม.)
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Overlays Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowChoropleth(!showChoropleth)}
              className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                showChoropleth 
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showChoropleth ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              พื้นที่ 13 อำเภอ (ระบายสีตามค่า)
            </button>

            <button
              onClick={() => setShowGistdaFlood(!showGistdaFlood)}
              className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                showGistdaFlood 
                  ? 'bg-sky-950/80 border-sky-500/80 text-sky-200' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showGistdaFlood ? 'bg-sky-400' : 'bg-slate-500'}`}></span>
              ดาวเทียม GISTDA น้ำท่วม
            </button>

            <button
              onClick={() => setShowWashoutPoints(!showWashoutPoints)}
              className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                showWashoutPoints 
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-200' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showWashoutPoints ? 'bg-rose-500' : 'bg-slate-500'}`}></span>
              จุดตัดขาด 3 ปี (11 จุด)
            </button>

            <button
              onClick={() => setShowAlternativeRoutes(!showAlternativeRoutes)}
              className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                showAlternativeRoutes 
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showAlternativeRoutes ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              เส้นทางสำรอง 1-2 & 4WD
            </button>

            <button
              onClick={() => setShowHospitals(!showHospitals)}
              className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                showHospitals 
                  ? 'bg-amber-950/80 border-amber-500/80 text-amber-200' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showHospitals ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
              โรงพยาบาล 13 แห่ง
            </button>

            <button
              onClick={() => setShowHelipadsAndBoats(!showHelipadsAndBoats)}
              className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                showHelipadsAndBoats 
                  ? 'bg-purple-950/80 border-purple-500/80 text-purple-200' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showHelipadsAndBoats ? 'bg-purple-400' : 'bg-slate-500'}`}></span>
              ลาน ฮ. ส่งกลับ (3 จุด)
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% KEYLESS OPEN TILES (ไม่มี API KEY)</span>
          </div>
        </div>
      </div>

      {/* Main Map + Inspection Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Viewport Container */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-[590px] shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Floating Legend (Choropleth Color Scale) */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-2xl max-w-[310px]">
            <div className="font-semibold text-white mb-2 flex items-center justify-between">
              <span>
                {colorMode === 'risk' ? 'เกณฑ์สีตามระดับความเสี่ยง' : 'เกณฑ์สีตามปริมาณฝนสะสม'}
              </span>
              <span className="font-mono text-emerald-400 text-[10px]">OPEN LEAFLET</span>
            </div>
            
            {colorMode === 'risk' ? (
              <div className="space-y-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-rose-600 shrink-0 border border-white/40"></span>
                  <span><strong>สีแดง:</strong> เสี่ยงวิกฤต (สุไหงโก-ลก, ตากใบ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-orange-500 shrink-0 border border-white/40"></span>
                  <span><strong>สีส้ม:</strong> น้ำล้นตลิ่ง/ท่วมขัง (ยี่งอ, สุไหงปาดี, เมือง, ระแงะ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-amber-400 shrink-0 border border-white/40"></span>
                  <span><strong>สีเหลือง:</strong> เฝ้าระวัง (เจาะไอร้อง, รือเสาะ, จะแนะ, ศรีสาคร)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 shrink-0 border border-white/40"></span>
                  <span><strong>สีเขียว:</strong> สถานการณ์ปกติ (แว้ง, สุคิริน, บาเจาะ)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-rose-600 shrink-0 border border-white/40"></span>
                  <span>ฝนสะสม &gt; 200 มม. (วิกฤตน้ำป่าไหลหลาก)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-orange-500 shrink-0 border border-white/40"></span>
                  <span>ฝนสะสม 150 - 200 มม. (น้ำท่วมขังสูง)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-amber-400 shrink-0 border border-white/40"></span>
                  <span>ฝนสะสม 100 - 150 มม. (เฝ้าระวังตลิ่ง)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 shrink-0 border border-white/40"></span>
                  <span>ฝนสะสม &lt; 100 มม. (ระดับปกติ)</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>คลิกพื้นที่เพื่อกรองอำเภอ</span>
              <span>คลิก ✕ ดูทางขาด 3 ปี</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Historical 3-Year Washout Inspector & Alternative Route Details */}
        <div className="space-y-3">
          {selectedWashout ? (
            <div className="bg-slate-900 p-4 rounded-xl border border-rose-900/40 text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-700/60 flex items-center justify-center text-rose-400 font-bold">
                    ✕
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">
                      {selectedWashout.roadNumber}
                    </h3>
                    <p className="text-xs text-rose-400">{selectedWashout.name}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-900/60 text-rose-200 border border-rose-700">
                  {selectedWashout.status === 'impassable' ? 'ตัดขาด รถผ่านไม่ได้' : 'รถยกสูงผ่านได้'}
                </span>
              </div>

              {/* Specific details */}
              <div className="py-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">ตำแหน่ง / อำเภอ:</span>
                  <span className="font-semibold text-white">{selectedWashout.location} ({selectedWashout.district})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">ประวัติน้ำท่วมตัดขาด 3 ปีย้อนหลัง:</span>
                  <span className="font-mono font-bold text-amber-300">
                    ปี {selectedWashout.historicalYears.join(', ')} (ซ้ำซาก)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">ระดับน้ำท่วมผิวทางปัจจุบัน:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    {selectedWashout.waterDepthCm} ซม.
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">พาหนะเคลื่อนย้ายที่เหมาะสม:</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedWashout.transportAlternative === 'BOAT' 
                      ? 'เรือท้องแบนเครื่องยนต์ ปภ.' 
                      : selectedWashout.transportAlternative === '4WD_UNIMOG'
                      ? 'รถบรรทุกทหารยกสูง Unimog'
                      : 'ทางเลี่ยงสายอ้อม 4WD'}
                  </span>
                </div>
              </div>

              {/* Alternative Route Solution Box */}
              <div className="mt-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
                  <Route className="w-4 h-4 text-emerald-400" />
                  <span>วิธีแก้ปัญหา & เส้นทางสำรอง (Alternative Route):</span>
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  {selectedWashout.bypassRouteName}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ระยะทางเลี่ยงเพิ่มขึ้น: <strong className="text-emerald-300 font-mono">+{selectedWashout.bypassDistanceKm} กม.</strong></span>
                  <span className="text-slate-400">รองรับรถกู้ชีพฉุกเฉิน</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
              คลิกที่จุดตัดขาดบนแผนที่เพื่อดูข้อมูลทางเลี่ยงสำรอง
            </div>
          )}

          {/* Quick List of All 11 Washout Points */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs">
            <h4 className="font-bold text-white mb-2.5 flex items-center justify-between">
              <span>รายการถนนที่ขาด 3 ปีย้อนหลัง (11 จุด)</span>
              <span className="font-mono text-amber-400 text-[11px]">2565 - 2567</span>
            </h4>
            
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              {WASHOUT_ROUTES_DATA.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedWashout(item)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors border ${
                    selectedWashout?.id === item.id
                      ? 'bg-rose-950/60 border-rose-500/80 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="truncate">{item.roadNumber} - {item.name}</span>
                    <span className="font-mono text-[10px] text-rose-400 shrink-0 ml-1">
                      {item.waterDepthCm} ซม.
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                    <span>{item.district}</span>
                    <span className="text-amber-300 font-mono">ปี: {item.historicalYears.join(',')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
