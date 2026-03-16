// âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// LIFE OS TvdS â Apps Script Web App Backend
// Deploy as: Execute as "Me", Who has access "Anyone"
// 
// Instructions:
// 1. Open your Google Sheet
// 2. Extensions â Apps Script
// 3. Replace all code with this file
// 4. Click Deploy â New Deployment â Web App
// 5. Execute as: Me | Access: Anyone
// 6. Copy the deployment URL â paste into Life OS settings
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const SHEET_ID = '17IXrGN11g8Fm8AjROr_W9_99xz1q_jqCdb8AQOFIX2s';

// Sheet definitions â columns per tab
const SCHEMAS = {
  Todos:         ['id','title','category','priority','due','notes','done','createdAt','aiBreakdown'],
  Notes:         ['id','title','body','category','tags','createdAt','updatedAt'],
  Time:          ['id','date','title','category','start','end','duration','notes','createdAt'],
  Journal:       ['id','date','body','mood','tags','createdAt'],
  GQ_Patrol:     ['id','date','type','odometer','litres','cost_per_l','total_cost','km_l','notes'],
  GU_Patrol:     ['id','date','type','odometer','litres','cost_per_l','total_cost','km_l','notes'],
  HomeInventory: ['id','category','name','qty','unit','location','serial','warranty','purchase_date','cost','notes'],
  PrimaStock:    ['id','category','name','qty','unit','supplier','reorder_at','cost_per_unit','notes','updatedAt'],
};

function doGet(e) {
  const action = e.parameter.action || 'read';
  const sheet  = e.parameter.sheet  || 'Todos';
  try {
    if (action === 'read') return jsonResponse(readSheet(sheet));
    if (action === 'ping') return jsonResponse({ ok: true, timestamp: new Date().toISOString() });
  } catch(err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); }
  catch { return jsonResponse({ error: 'Invalid JSON' }); }
  
  const { action, sheet } = body;
  try {
    if (action === 'append') return jsonResponse(appendRow(sheet, body.row));
    if (action === 'write')  return jsonResponse(writeAll(sheet, body.rows));
    if (action === 'update') return jsonResponse(updateRow(sheet, body.id, body.patch));
    if (action === 'delete') return jsonResponse(deleteRow(sheet, body.id));
    if (action === 'upsert') return jsonResponse(upsertRow(sheet, body.row));
    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch(err) {
    return jsonResponse({ error: err.message });
  }
}

// âââ SHEET OPERATIONS âââââââââââââââââââââââââââââââââââ

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const schema = SCHEMAS[name];
    if (schema) sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
  }
  return sheet;
}

function readSheet(name) {
  const sheet = getOrCreateSheet(name);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { rows: [], headers: data[0] || [] };
  const [headers, ...rows] = data;
  return {
    rows: rows.map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] === '' ? '' : r[i]);
      return obj;
    }),
    headers
  };
}

function appendRow(name, row) {
  const sheet = getOrCreateSheet(name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(h => row[h] !== undefined ? row[h] : '');
  sheet.appendRow(rowData);
  return { ok: true, id: row.id };
}

function writeAll(name, rows) {
  const sheet = getOrCreateSheet(name);
  sheet.clearContents();
  const schema = SCHEMAS[name] || Object.keys(rows[0] || {});
  sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
  if (rows.length) {
    const data = rows.map(r => schema.map(h => r[h] !== undefined ? r[h] : ''));
    sheet.getRange(2, 1, data.length, schema.length).setValues(data);
  }
  return { ok: true, count: rows.length };
}

function updateRow(name, id, patch) {
  const sheet = getOrCreateSheet(name);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  if (idCol < 0) return { error: 'No id column' };
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      Object.entries(patch).forEach(([k, v]) => {
        const col = headers.indexOf(k);
        if (col >= 0) sheet.getRange(i + 1, col + 1).setValue(v);
      });
      return { ok: true, id };
    }
  }
  return { error: 'Row not found: ' + id };
}

function deleteRow(name, id) {
  const sheet = getOrCreateSheet(name);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { ok: true, id };
    }
  }
  return { error: 'Row not found' };
}

function upsertRow(name, row) {
  const existing = readSheet(name).rows.find(r => String(r.id) === String(row.id));
  if (existing) return updateRow(name, row.id, row);
  return appendRow(name, row);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// âââ UTILITY FUNCTIONS ââââââââââââââââââââââââââââââââââ

// Call this manually to set up all sheet tabs at once
function setupAllSheets() {
  Object.keys(SCHEMAS).forEach(name => getOrCreateSheet(name));
  Logger.log('All sheets created: ' + Object.keys(SCHEMAS).join(', '));
}

// Call this to load the Monday tasks directly
function loadMondayTasks() {
  const now = new Date().toISOString();
  const todos = [
    {id:1742120001,title:'Draft MR DIY settlement letter',category:'prima-finance',priority:'urgent',due:'2026-03-16',notes:'R1.65M+ outstanding. Structured settlement offer.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120002,title:'Ask Alicia to compile supplier payment list',category:'prima-finance',priority:'urgent',due:'2026-03-16',notes:'Need list before drafting deferral mails.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120003,title:'Draft Technibook meeting brief for tomorrow',category:'prima-finance',priority:'urgent',due:'2026-03-16',notes:'Xero BS accuracy, CoA redesign, Alicia allocation rules.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120004,title:'Send Santi staff ratings â short-time or retrenchment prep',category:'prima-ops',priority:'urgent',due:'2026-03-16',notes:'Section 189 â do not delay.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120005,title:'Decide on electrical inspection R36 000 (COC + surge protection)',category:'prima-finance',priority:'high',due:'2026-03-17',notes:'Required by insurer. Risk: policy lapse if deferred.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120006,title:'Follow up landlord â building space surrender meeting',category:'prima-finance',priority:'high',due:'2026-03-17',notes:'Kevin Padayachee / Soretha, Fort Knox / Investicore.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120007,title:'Quote: Awwthentic',category:'prima-ops',priority:'high',due:'',notes:'',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120008,title:'Quote: Pick n Pay Pod',category:'prima-ops',priority:'high',due:'',notes:'',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120009,title:'Quote: Plato',category:'prima-ops',priority:'high',due:'',notes:'',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120010,title:'Invoice Dischem',category:'prima-finance',priority:'high',due:'2026-03-16',notes:'Send immediately.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120011,title:'Oasis Pod â confirm billable and invoice',category:'prima-finance',priority:'high',due:'2026-03-16',notes:'Finished but never collected.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120012,title:'Call Pieer â joint site visits Wonderboom and Greenside',category:'prima-ops',priority:'high',due:'2026-03-17',notes:'Problems at both sites.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120013,title:'Arrange vinyl for House Strachan',category:'prima-ops',priority:'normal',due:'',notes:'Coordinate delivery and install.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120014,title:'Order vinyl for H&H East Rand Mall',category:'prima-ops',priority:'normal',due:'',notes:'Place order for install schedule.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120015,title:'KFC sites â measure and survey for quoting',category:'prima-ops',priority:'normal',due:'',notes:'Schedule visits and take measurements.',done:'0',createdAt:now,aiBreakdown:''},
  ];
  writeAll('Todos', todos);
  Logger.log('Loaded ' + todos.length + ' tasks into Todos sheet');
}
