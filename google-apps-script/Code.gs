/**
 * =========================================================================
 * GOOGLE APPS SCRIPT WEBHOOK: EOC สสจ.นราธิวาส (2-WAY SYNC ENGINE)
 * เชื่อมต่อกับ Sheet ID: 17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA
 * =========================================================================
 * คำแนะนำการติดตั้ง:
 * 1. เปิด Google Sheet ID: 17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA
 * 2. ไปที่เมนู "ส่วนขยาย (Extensions)" -> "Apps Script"
 * 3. วางโค้ดนี้ทั้งหมดลงใน Code.gs
 * 4. กดเรียกใช้ฟังก์ชัน "setupSpreadsheet" หนึ่งครั้งเพื่อสร้างหัวตารางภาษาไทยอัตโนมัติ
 * 5. กดปุ่ม "ทำให้ใช้งานได้ (Deploy)" -> "การทำให้ใช้งานได้รายการใหม่ (New deployment)"
 * 6. เลือกประเภท: "เว็บแอปพลิเคชัน (Web app)"
 * 7. การเข้าถึง (Who has access): เลือก "ทุกคน (Anyone)"
 * 8. คัดลอก URL ของเว็บแอป (Webhook URL) แล้วนำไปวางในช่อง Webhook URL ในระบบ EOC
 * =========================================================================
 */

var SHEET_ID = '17M9s5TbsJgvFtHGp8woq80sT3TkP6y_oclhguGUUkkA';
var SHEET_PATIENTS = 'ผู้ป่วยเปราะบาง';
var SHEET_HOSPITALS = '13_โรงพยาบาล';
var SHEET_CLINICS = '111_รพสต_หน่วยบริการ';
var SHEET_WASHOUTS = 'จุดตัดขาด_11_จุด';
var SHEET_LOGS = 'ประวัติการซิงค์_Log';

/**
 * 1. GET Request: ดึงข้อมูลจาก Google Sheet กลับสู่ระบบ EOC (Pull)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var patientSheet = ss.getSheetByName(SHEET_PATIENTS);
    var hospitalSheet = ss.getSheetByName(SHEET_HOSPITALS);
    var clinicSheet = ss.getSheetByName(SHEET_CLINICS);
    var washoutSheet = ss.getSheetByName(SHEET_WASHOUTS);

    var patients = patientSheet ? readSheetAsObjects(patientSheet) : [];
    var hospitals = hospitalSheet ? readSheetAsObjects(hospitalSheet) : [];
    var clinics = clinicSheet ? readSheetAsObjects(clinicSheet) : [];
    var washouts = washoutSheet ? readSheetAsObjects(washoutSheet) : [];

    var response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      sheetId: SHEET_ID,
      data: {
        patients: patients,
        hospitals: hospitals,
        clinics: clinics,
        washouts: washouts
      }
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 2. POST Request: รับข้อมูล CRUD จากระบบ EOC แล้วบันทึกลง Google Sheet (Push)
 */
function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : null;
    if (!contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'No payload received'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(contents);
    var action = payload.action; 
    var data = payload.data;
    var ss = SpreadsheetApp.openById(SHEET_ID);

    var resultMessage = 'Action completed';

    if (action === 'PING') {
      resultMessage = 'Webhook active and connected successfully to Sheet: ' + SHEET_ID;
    } 
    // ==========================================
    // PATIENTS CRUD
    // ==========================================
    else if (action === 'CREATE_PATIENT') {
      var pSheet = ss.getSheetByName(SHEET_PATIENTS);
      if (pSheet && data) {
        pSheet.appendRow([
          data.id || ('VULN-' + new Date().getTime().toString().slice(-4)),
          data.name || '',
          data.age || 0,
          data.category || '',
          data.conditionDescription || '',
          data.address || '',
          data.moo || 1,
          data.subdistrict || '',
          data.district || '',
          data.phone || '',
          data.caregiverPhone || '',
          data.asmVolunteerName || '',
          data.triagePriority || 'P1',
          data.evacuationStatus || 'NOT_EVACUATED',
          data.safeDestination || '',
          Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
        ]);
        resultMessage = 'Created patient row: ' + data.name;
      }
    } else if (action === 'UPDATE_PATIENT') {
      var pSheet = ss.getSheetByName(SHEET_PATIENTS);
      if (pSheet && data && data.id) {
        var values = pSheet.getDataRange().getValues();
        var found = false;
        for (var r = 1; r < values.length; r++) {
          if (values[r][0] == data.id) {
            pSheet.getRange(r + 1, 1, 1, 16).setValues([[
              data.id,
              data.name,
              data.age,
              data.category,
              data.conditionDescription,
              data.address,
              data.moo || 1,
              data.subdistrict || '',
              data.district,
              data.phone,
              data.caregiverPhone || '',
              data.asmVolunteerName || '',
              data.triagePriority,
              data.evacuationStatus,
              data.safeDestination,
              Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
            ]]);
            found = true;
            break;
          }
        }
        if (!found) {
          pSheet.appendRow([
            data.id, data.name, data.age, data.category, data.conditionDescription,
            data.address, data.moo || 1, data.subdistrict || '', data.district,
            data.phone, data.caregiverPhone || '', data.asmVolunteerName || '',
            data.triagePriority, data.evacuationStatus, data.safeDestination,
            Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
          ]);
        }
        resultMessage = 'Updated patient row: ' + data.id;
      }
    } else if (action === 'DELETE_PATIENT') {
      var pSheet = ss.getSheetByName(SHEET_PATIENTS);
      if (pSheet && data && data.id) {
        var values = pSheet.getDataRange().getValues();
        for (var r = 1; r < values.length; r++) {
          if (values[r][0] == data.id) {
            pSheet.deleteRow(r + 1);
            resultMessage = 'Deleted patient row: ' + data.id;
            break;
          }
        }
      }
    }
    // ==========================================
    // 13 HOSPITALS CRUD (คลังทรัพยากร รพ.)
    // ==========================================
    else if (action === 'CREATE_HOSPITAL') {
      var hSheet = ss.getSheetByName(SHEET_HOSPITALS);
      if (hSheet && data) {
        hSheet.appendRow([
          data.id || ('HOSP-' + new Date().getTime().toString().slice(-4)),
          data.name || '',
          data.district || '',
          data.level || 'M',
          data.risk || 'เหลือง',
          data.totalBeds || 0,
          data.occupiedBeds || 0,
          data.autonomyHours || 48,
          data.resources ? data.resources.generatorFuelHours : (data.generatorFuelHours || 48),
          data.resources ? data.resources.oxygenHours : (data.oxygenHours || 48),
          data.resources ? data.resources.waterHours : (data.waterHours || 48),
          data.resources ? data.resources.criticalMedicineDays : (data.criticalMedicineDays || 30),
          data.contact ? data.contact.staffReadinessPercent : (data.staffReadinessPercent || 90),
          Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
        ]);
        resultMessage = 'Created hospital row: ' + data.name;
      }
    } else if (action === 'UPDATE_HOSPITAL') {
      var hSheet = ss.getSheetByName(SHEET_HOSPITALS);
      if (hSheet && data && data.id) {
        var values = hSheet.getDataRange().getValues();
        var found = false;
        for (var r = 1; r < values.length; r++) {
          if (values[r][0] == data.id) {
            var rowVals = values[r];
            hSheet.getRange(r + 1, 1, 1, 14).setValues([[
              data.id,
              data.name !== undefined ? data.name : rowVals[1],
              data.district !== undefined ? data.district : rowVals[2],
              data.level !== undefined ? data.level : rowVals[3],
              data.risk !== undefined ? data.risk : rowVals[4],
              data.totalBeds !== undefined ? data.totalBeds : rowVals[5],
              data.occupiedBeds !== undefined ? data.occupiedBeds : rowVals[6],
              data.autonomyHours !== undefined ? data.autonomyHours : rowVals[7],
              (data.resources && data.resources.generatorFuelHours !== undefined) ? data.resources.generatorFuelHours : rowVals[8],
              (data.resources && data.resources.oxygenHours !== undefined) ? data.resources.oxygenHours : rowVals[9],
              (data.resources && data.resources.waterHours !== undefined) ? data.resources.waterHours : rowVals[10],
              (data.resources && data.resources.criticalMedicineDays !== undefined) ? data.resources.criticalMedicineDays : rowVals[11],
              (data.contact && data.contact.staffReadinessPercent !== undefined) ? data.contact.staffReadinessPercent : rowVals[12],
              Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
            ]]);
            found = true;
            break;
          }
        }
        if (!found) {
          hSheet.appendRow([
            data.id,
            data.name || '',
            data.district || '',
            data.level || 'M',
            data.risk || 'เหลือง',
            data.totalBeds || 0,
            data.occupiedBeds || 0,
            data.autonomyHours || 48,
            data.resources ? data.resources.generatorFuelHours : 48,
            data.resources ? data.resources.oxygenHours : 48,
            data.resources ? data.resources.waterHours : 48,
            data.resources ? data.resources.criticalMedicineDays : 30,
            data.contact ? data.contact.staffReadinessPercent : 90,
            Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
          ]);
        }
        resultMessage = 'Updated hospital row: ' + data.id;
      }
    } else if (action === 'DELETE_HOSPITAL') {
      var hSheet = ss.getSheetByName(SHEET_HOSPITALS);
      if (hSheet && data && data.id) {
        var values = hSheet.getDataRange().getValues();
        for (var r = 1; r < values.length; r++) {
          if (values[r][0] == data.id) {
            hSheet.deleteRow(r + 1);
            resultMessage = 'Deleted hospital row: ' + data.id;
            break;
          }
        }
      }
    }
    // ==========================================
    // 111 PRIMARY CARE CLINICS CRUD (รพ.สต.)
    // ==========================================
    else if (action === 'CREATE_CLINIC') {
      var cSheet = ss.getSheetByName(SHEET_CLINICS);
      if (cSheet && data) {
        cSheet.appendRow([
          data.id || ('PCU-' + new Date().getTime().toString().slice(-4)),
          data.name || '',
          data.district || '',
          data.status || 'normal',
          data.staffCount || 8,
          data.emergencyMedicineKit ? 'มี' : 'ขาด',
          data.generatorAvailable ? 'มี' : 'ไม่มี',
          data.phone || '',
          data.lat || '',
          data.lng || '',
          Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
        ]);
        resultMessage = 'Created clinic row: ' + data.name;
      }
    } else if (action === 'UPDATE_CLINIC') {
      var cSheet = ss.getSheetByName(SHEET_CLINICS);
      if (cSheet && data && data.id) {
        var values = cSheet.getDataRange().getValues();
        var found = false;
        for (var r = 1; r < values.length; r++) {
          if (values[r][0] == data.id) {
            var rowVals = values[r];
            cSheet.getRange(r + 1, 1, 1, 11).setValues([[
              data.id,
              data.name !== undefined ? data.name : rowVals[1],
              data.district !== undefined ? data.district : rowVals[2],
              data.status !== undefined ? data.status : rowVals[3],
              data.staffCount !== undefined ? data.staffCount : rowVals[4],
              data.emergencyMedicineKit !== undefined ? (data.emergencyMedicineKit ? 'มี' : 'ขาด') : rowVals[5],
              data.generatorAvailable !== undefined ? (data.generatorAvailable ? 'มี' : 'ไม่มี') : rowVals[6],
              data.phone !== undefined ? data.phone : rowVals[7],
              data.lat !== undefined ? data.lat : rowVals[8],
              data.lng !== undefined ? data.lng : rowVals[9],
              Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
            ]]);
            found = true;
            break;
          }
        }
        if (!found) {
          cSheet.appendRow([
            data.id,
            data.name || '',
            data.district || '',
            data.status || 'normal',
            data.staffCount || 8,
            data.emergencyMedicineKit ? 'มี' : 'ขาด',
            data.generatorAvailable ? 'มี' : 'ไม่มี',
            data.phone || '',
            data.lat || '',
            data.lng || '',
            Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
          ]);
        }
        resultMessage = 'Updated clinic row: ' + data.id;
      }
    } else if (action === 'DELETE_CLINIC') {
      var cSheet = ss.getSheetByName(SHEET_CLINICS);
      if (cSheet && data && data.id) {
        var values = cSheet.getDataRange().getValues();
        for (var r = 1; r < values.length; r++) {
          if (values[r][0] == data.id) {
            cSheet.deleteRow(r + 1);
            resultMessage = 'Deleted clinic row: ' + data.id;
            break;
          }
        }
      }
    }
    // ==========================================
    // FULL BULK 2-WAY REFRESH
    // ==========================================
    else if (action === 'BULK_SYNC') {
      var syncSummary = [];
      // 1. Sync Patients
      if (data.patients && data.patients.length > 0) {
        var pSheet = ss.getSheetByName(SHEET_PATIENTS);
        if (pSheet) {
          var lastRow = pSheet.getLastRow();
          if (lastRow > 1) {
            pSheet.deleteRows(2, lastRow - 1);
          }
          var rowsToAdd = data.patients.map(function(p) {
            return [
              p.id, p.name, p.age, p.category, p.conditionDescription,
              p.address, p.moo || 1, p.subdistrict || '', p.district,
              p.phone, p.caregiverPhone || '', p.asmVolunteerName || '',
              p.triagePriority, p.evacuationStatus, p.safeDestination,
              Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
            ];
          });
          pSheet.getRange(2, 1, rowsToAdd.length, 16).setValues(rowsToAdd);
          syncSummary.push(rowsToAdd.length + ' patients');
        }
      }

      // 2. Sync Hospitals (13 แห่ง)
      if (data.hospitals && data.hospitals.length > 0) {
        var hSheet = ss.getSheetByName(SHEET_HOSPITALS);
        if (hSheet) {
          var lastHospRow = hSheet.getLastRow();
          if (lastHospRow > 1) {
            hSheet.deleteRows(2, lastHospRow - 1);
          }
          var hospRows = data.hospitals.map(function(h) {
            return [
              h.id, h.name, h.district, h.level, h.risk,
              h.totalBeds, h.occupiedBeds, h.autonomyHours,
              h.resources ? h.resources.generatorFuelHours : 48,
              h.resources ? h.resources.oxygenHours : 48,
              h.resources ? h.resources.waterHours : 48,
              h.resources ? h.resources.criticalMedicineDays : 30,
              h.contact ? h.contact.staffReadinessPercent : 90,
              Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
            ];
          });
          hSheet.getRange(2, 1, hospRows.length, 14).setValues(hospRows);
          syncSummary.push(hospRows.length + ' hospitals');
        }
      }

      // 3. Sync Clinics (111 แห่ง)
      if (data.clinics && data.clinics.length > 0) {
        var cSheet = ss.getSheetByName(SHEET_CLINICS);
        if (cSheet) {
          var lastClinicRow = cSheet.getLastRow();
          if (lastClinicRow > 1) {
            cSheet.deleteRows(2, lastClinicRow - 1);
          }
          var clinicRows = data.clinics.map(function(c) {
            return [
              c.id, c.name, c.district, c.status, c.staffCount,
              c.emergencyMedicineKit ? 'มี' : 'ขาด',
              c.generatorAvailable ? 'มี' : 'ไม่มี',
              c.phone || '',
              c.lat || '',
              c.lng || '',
              Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
            ];
          });
          cSheet.getRange(2, 1, clinicRows.length, 11).setValues(clinicRows);
          syncSummary.push(clinicRows.length + ' clinics');
        }
      }

      resultMessage = 'Bulk synced: ' + syncSummary.join(', ');
    }

    // Record action to Log sheet
    logAction(ss, action, resultMessage, payload.user || 'EOC Command System');

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      action: action,
      message: resultMessage,
      timestamp: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss น.')
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. ฟังก์ชันสร้างหัวตารางและโครงสร้างเริ่มต้น (Setup Spreadsheet)
 * รันฟังก์ชันนี้ครั้งเดียวใน Apps Script
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. ชีตผู้ป่วยเปราะบาง
  var pSheet = ss.getSheetByName(SHEET_PATIENTS);
  if (!pSheet) {
    pSheet = ss.insertSheet(SHEET_PATIENTS);
  }
  var patientHeaders = [
    'รหัสผู้ป่วย', 'ชื่อ - สกุล', 'อายุ', 'กลุ่มเปราะบาง', 'การวินิจฉัย/อาการ',
    'ที่อยู่', 'หมู่ที่', 'ตำบล', 'อำเภอ', 'เบอร์โทรศัพท์', 'เบอร์ญาติ',
    'อสม. ผู้รับผิดชอบ', 'ความเร่งด่วน (Triage)', 'สถานะการอพยพ', 'ปลายทางส่งต่อ', 'เวลาอัปเดตล่าสุด'
  ];
  setupHeaderFormat(pSheet, patientHeaders);

  // 2. ชีต 13 โรงพยาบาล
  var hSheet = ss.getSheetByName(SHEET_HOSPITALS);
  if (!hSheet) {
    hSheet = ss.insertSheet(SHEET_HOSPITALS);
  }
  var hospitalHeaders = [
    'รหัส รพ.', 'ชื่อโรงพยาบาล', 'อำเภอ', 'ระดับ', 'ระดับความเสี่ยง',
    'เตียงทั้งหมด', 'เตียงครองปัจจุบัน', 'Safe Autonomy (ชม.)', 'น้ำมันสำรอง (ชม.)',
    'ออกซิเจน (ชม.)', 'น้ำสำรอง (ชม.)', 'ยาจำเป็น (วัน)', 'ความพร้อมบุคลากร (%)', 'เวลาซิงค์ล่าสุด'
  ];
  setupHeaderFormat(hSheet, hospitalHeaders);

  // 3. ชีต 111 รพ.สต. หน่วยบริการปฐมภูมิ
  var cSheet = ss.getSheetByName(SHEET_CLINICS);
  if (!cSheet) {
    cSheet = ss.insertSheet(SHEET_CLINICS);
  }
  var clinicHeaders = [
    'รหัส รพ.สต.', 'ชื่อ รพ.สต.', 'อำเภอ', 'สถานะความพร้อม', 'จำนวนบุคลากร',
    'ชุดเวชภัณฑ์ฉุกเฉิน', 'เครื่องปั่นไฟ', 'เบอร์โทรศัพท์', 'พิกัด Lat', 'พิกัด Lng', 'เวลาอัปเดตล่าสุด'
  ];
  setupHeaderFormat(cSheet, clinicHeaders);

  // 4. ชีตจุดตัดขาด 11 จุด
  var wSheet = ss.getSheetByName(SHEET_WASHOUTS);
  if (!wSheet) {
    wSheet = ss.insertSheet(SHEET_WASHOUTS);
  }
  var washoutHeaders = [
    'สายทาง', 'ชื่อจุดตัดขาด', 'อำเภอ', 'ประวัติขาด 3 ปี', 'ระดับน้ำท่วม (ซม.)',
    'สถานะเส้นทาง', 'เส้นทางเลี่ยงสำรอง', 'พิกัด Lat', 'พิกัด Lng', 'เวลาอัปเดต'
  ];
  setupHeaderFormat(wSheet, washoutHeaders);

  // 5. ชีตประวัติ Log
  var logSheet = ss.getSheetByName(SHEET_LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_LOGS);
  }
  var logHeaders = ['รหัสรายการ', 'วันเวลา (Bangkok)', 'คำสั่ง (Action)', 'รายละเอียดผลลัพธ์', 'ผู้สั่งการ/ระบบ'];
  setupHeaderFormat(logSheet, logHeaders);

  Logger.log('Spreadsheet configured successfully for Sheet ID: ' + SHEET_ID);
}

function setupHeaderFormat(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#064e3b'); // Emerald-900
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

function logAction(ss, action, detail, user) {
  var logSheet = ss.getSheetByName(SHEET_LOGS);
  if (!logSheet) return;
  logSheet.appendRow([
    'LOG-' + new Date().getTime().toString().slice(-6),
    Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss'),
    action,
    detail,
    user
  ]);
}

function readSheetAsObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}
