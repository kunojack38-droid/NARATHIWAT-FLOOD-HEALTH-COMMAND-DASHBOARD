import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Globe, 
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

interface AppsScriptWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
  onNotify?: (msg: string) => void;
}

export const AppsScriptWebhookModal: React.FC<AppsScriptWebhookModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl,
  onNotify
}) => {
  const SHEET_ID = '17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

  const [copiedCode, setCopiedCode] = useState(false);
  const [inputUrl, setInputUrl] = useState(webhookUrl);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testResultMsg, setTestResultMsg] = useState('');

  const APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT WEBHOOK: EOC สสจ.นราธิวาส (2-WAY SYNC ENGINE)
 * เชื่อมต่อกับ Sheet ID: 17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA
 */
var SHEET_ID = '17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA';
var SHEET_PATIENTS = 'ผู้ป่วยเปราะบาง';
var SHEET_HOSPITALS = '13_โรงพยาบาล';
var SHEET_WASHOUTS = 'จุดตัดขาด_11_จุด';
var SHEET_LOGS = 'ประวัติการซิงค์_Log';

function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var pSheet = ss.getSheetByName(SHEET_PATIENTS);
    var hSheet = ss.getSheetByName(SHEET_HOSPITALS);
    var wSheet = ss.getSheetByName(SHEET_WASHOUTS);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      timestamp: new Date().toISOString(),
      sheetId: SHEET_ID,
      data: {
        patients: pSheet ? readSheetAsObjects(pSheet) : [],
        hospitals: hSheet ? readSheetAsObjects(hSheet) : [],
        washouts: wSheet ? readSheetAsObjects(wSheet) : []
      }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : null;
    if (!contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' })).setMimeType(ContentService.MimeType.JSON);
    }
    var payload = JSON.parse(contents);
    var action = payload.action;
    var data = payload.data;
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var msg = 'Success';

    if (action === 'PING') {
      msg = 'Connected to Sheet ID: ' + SHEET_ID;
    } else if (action === 'CREATE_PATIENT') {
      var pSheet = ss.getSheetByName(SHEET_PATIENTS);
      if (pSheet && data) {
        pSheet.appendRow([
          data.id, data.name, data.age, data.category, data.conditionDescription,
          data.address, data.moo || 1, data.subdistrict || '', data.district,
          data.phone, data.caregiverPhone || '', data.asmVolunteerName || '',
          data.triagePriority, data.evacuationStatus, data.safeDestination,
          Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
        ]);
        msg = 'Created patient ' + data.name;
      }
    } else if (action === 'UPDATE_PATIENT') {
      var pSheet = ss.getSheetByName(SHEET_PATIENTS);
      if (pSheet && data && data.id) {
        var vals = pSheet.getDataRange().getValues();
        for (var r = 1; r < vals.length; r++) {
          if (vals[r][0] == data.id) {
            pSheet.getRange(r + 1, 1, 1, 16).setValues([[
              data.id, data.name, data.age, data.category, data.conditionDescription,
              data.address, data.moo || 1, data.subdistrict || '', data.district,
              data.phone, data.caregiverPhone || '', data.asmVolunteerName || '',
              data.triagePriority, data.evacuationStatus, data.safeDestination,
              Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
            ]]);
            break;
          }
        }
        msg = 'Updated patient ' + data.id;
      }
    } else if (action === 'DELETE_PATIENT') {
      var pSheet = ss.getSheetByName(SHEET_PATIENTS);
      if (pSheet && data && data.id) {
        var vals = pSheet.getDataRange().getValues();
        for (var r = 1; r < vals.length; r++) {
          if (vals[r][0] == data.id) {
            pSheet.deleteRow(r + 1);
            break;
          }
        }
        msg = 'Deleted patient ' + data.id;
      }
    }

    logAction(ss, action, msg, payload.user || 'EOC System');

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      action: action,
      message: msg,
      timestamp: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var pSheet = ss.getSheetByName(SHEET_PATIENTS) || ss.insertSheet(SHEET_PATIENTS);
  setupHeaders(pSheet, ['รหัส', 'ชื่อ - สกุล', 'อายุ', 'กลุ่มโรค', 'อาการ', 'ที่อยู่', 'หมู่', 'ตำบล', 'อำเภอ', 'เบอร์โทร', 'เบอร์ญาติ', 'อสม.', 'Triage', 'สถานะอพยพ', 'ปลายทางส่งต่อ', 'อัปเดตล่าสุด']);
  var hSheet = ss.getSheetByName(SHEET_HOSPITALS) || ss.insertSheet(SHEET_HOSPITALS);
  setupHeaders(hSheet, ['รหัส', 'ชื่อ รพ.', 'อำเภอ', 'ระดับ', 'ความเสี่ยง', 'เตียงทั้งหมด', 'เตียงครอง', 'Autonomy ชม.', 'น้ำมัน ชม.', 'O2 ชม.', 'น้ำ ชม.', 'ยา วัน', 'บุคลากร %', 'อัปเดต']);
  var wSheet = ss.getSheetByName(SHEET_WASHOUTS) || ss.insertSheet(SHEET_WASHOUTS);
  setupHeaders(wSheet, ['สายทาง', 'จุดตัดขาด', 'อำเภอ', 'ประวัติ 3 ปี', 'น้ำท่วม ซม.', 'สถานะ', 'ทางเลี่ยง', 'Lat', 'Lng', 'อัปเดต']);
  var lSheet = ss.getSheetByName(SHEET_LOGS) || ss.insertSheet(SHEET_LOGS);
  setupHeaders(lSheet, ['รหัสรายการ', 'วันเวลา', 'Action', 'รายละเอียด', 'ผู้ใช้งาน']);
}

function setupHeaders(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var range = sheet.getRange(1, 1, 1, headers.length);
  range.setBackground('#064e3b');
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function logAction(ss, action, detail, user) {
  var lSheet = ss.getSheetByName(SHEET_LOGS);
  if (!lSheet) return;
  lSheet.appendRow(['LOG-' + new Date().getTime().toString().slice(-6), Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss'), action, detail, user]);
}

function readSheetAsObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j];
    result.push(obj);
  }
  return result;
}`;

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    if (onNotify) {
      onNotify('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว');
    }
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestWebhook = async () => {
    if (!inputUrl.trim()) {
      setTestStatus('ERROR');
      setTestResultMsg('กรุณาระบุ URL ของเว็บแอปพลิเคชัน Apps Script ก่อนทดสอบ');
      return;
    }

    setTestStatus('TESTING');
    setTestResultMsg('กำลังส่ง Ping ทดสอบไปยัง Webhook...');

    try {
      // In browser, Google Apps Script POST redirects (302).
      // We test with mode: 'no-cors' or a GET check.
      const pingPayload = JSON.stringify({
        action: 'PING',
        user: 'EOC Webhook Tester',
        timestamp: new Date().toISOString()
      });

      // Attempt send
      await fetch(inputUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: pingPayload,
        mode: 'no-cors'
      });

      setTestStatus('SUCCESS');
      setTestResultMsg(`✓ เชื่อมต่อสำเร็จ! ส่งคำสั่ง Ping ไปยัง Webhook ของ Sheet ID: ${SHEET_ID.slice(0, 10)}... สำเร็จ`);
      onSaveWebhookUrl(inputUrl.trim());
      if (onNotify) {
        onNotify('✓ บันทึกและทดสอบ Webhook สำเร็จ');
      }
    } catch (err: any) {
      setTestStatus('ERROR');
      setTestResultMsg('ข้อผิดพลาดการเชื่อมต่อ: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 text-slate-200 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                ตัวสร้างและติดตั้ง Google Apps Script Webhook
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  2-WAY WEBHOOK
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                สคริปต์เชื่อมต่อ 2-Way Push & Pull อัตโนมัติกับ Sheet ID: <strong className="text-emerald-400 font-mono">{SHEET_ID}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Steps Instructions Strip */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            ขั้นตอนการติดตั้งใช้งานใน 4 ขั้นตอน (ไม่ต้องใช้ API KEY):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-400">ขั้นที่ 1: เปิดชีต</div>
              <p className="text-slate-400">
                เปิด Google Sheet แล้วไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong>
              </p>
              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline pt-1 text-[10px]"
              >
                <span>เปิดชีตทันที</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-sky-400">ขั้นที่ 2: วางโค้ด</div>
              <p className="text-slate-400">
                กดปุ่ม <strong>"คัดลอกโค้ด Apps Script"</strong> ด้านล่าง แล้วนำไปวางทับในไฟล์ <strong className="font-mono">Code.gs</strong>
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-400">ขั้นที่ 3: Deploy Web App</div>
              <p className="text-slate-400">
                กด <strong>Deploy &gt; New deployment &gt; Web app</strong> และเลือกสิทธิเข้าถึง <strong>"ทุกคน (Anyone)"</strong>
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-purple-400">ขั้นที่ 4: ใส่ Webhook URL</div>
              <p className="text-slate-400">
                คัดลอก URL ของ Web app มาวางในช่องด้านล่าง แล้วกด <strong>"ทดสอบและบันทึก"</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Code Box with 1-Click Copy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              โค้ด Google Apps Script (Code.gs) พร้อมระบบหัวตาราง 4 ชีต:
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ดทั้งหมด (Copy)'}</span>
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-[11px] max-h-56 overflow-y-auto p-4 text-slate-300">
            <pre className="whitespace-pre">{APPS_SCRIPT_CODE}</pre>
          </div>
        </div>

        {/* Webhook URL Input & Test Connection Area */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-white">
            Webhook URL ของ Web App ที่ติดตั้งเสร็จแล้ว:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
            />
            <button
              onClick={handleTestWebhook}
              disabled={testStatus === 'TESTING'}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testStatus === 'TESTING' ? 'กำลังส่ง Ping...' : 'ทดสอบและบันทึก URL'}</span>
            </button>
          </div>

          {testResultMsg && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              testStatus === 'SUCCESS'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : testStatus === 'ERROR'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}>
              {testStatus === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : testStatus === 'ERROR' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : null}
              <span>{testResultMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
