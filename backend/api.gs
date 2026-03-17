// =========================================================
// LIFE OS TvdS — Apps Script Web App Backend
// Deploy as: Execute as "Me", Who has access "Anyone"
//
// Instructions:
// 1. Open your Google Sheet
// 2. Extensions → Apps Script
// 3. Replace all code with this file
// 4. Click Deploy → New Deployment → Web App
// 5. Execute as: Me | Access: Anyone
// 6. Copy the deployment URL → paste into Life OS settings
// =========================================================

const SHEET_ID = '17IXrGN11g8Fm8AjROr_W9_99xz1q_jqCdb8AQOFIX2s';

// Sheet definitions — columns per tab
const SCHEMAS = {
  Todos:         ['id','title','category','priority','due','notes','done','createdAt','aiBreakdown','status','progress','updatedAt'],
  Notes:         ['id','title','body','category','tags','createdAt','updatedAt'],
  Time:          ['id','date','title','category','start','end','duration','notes','createdAt'],
  Journal:       ['id','date','body','mood','tags','createdAt'],
  GQ_Patrol:     ['id','date','type','odometer','litres','cost_per_l','total_cost','km_l','notes'],
  GU_Patrol:     ['id','date','type','odometer','litres','cost_per_l','total_cost','km_l','notes'],
  HomeInventory: ['id','category','name','qty','unit','location','serial','warranty','purchase_date','cost','notes'],
  PrimaStock:    ['id','category','name','qty','unit','supplier','reorder_at','cost_per_unit','notes','updatedAt'],
};

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || 'read';
  const sheet  = p.sheet  || 'Todos';
  try {
    if (action === 'read') return jsonResponse(readSheet(sheet));
    if (action === 'ping') return jsonResponse({ ok: true, timestamp: new Date().toISOString() });
    if (action === 'calendar') return jsonResponse(listCalEvents(p.days || 14));
    if (action === 'emails')  return jsonResponse(listUnreadEmails(p.max || 50));
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
    if (action === 'cal_create') return jsonResponse(createCalEvent(body.event));
    if (action === 'cal_delete') return jsonResponse(deleteCalEvent(body.eventId));
    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch(err) {
    return jsonResponse({ error: err.message });
  }
}

// --- SHEET OPERATIONS ---

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
      headers.forEach((h, i) => {
        let v = r[i];
        // Convert Date objects to YYYY-MM-DD strings to avoid timezone shift in JSON
        if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        obj[h] = v === '' ? '' : v;
      });
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

// --- GOOGLE CALENDAR ---

function listCalEvents(days) {
  var cal = CalendarApp.getDefaultCalendar();
  var now = new Date();
  var d = Number(days) || 14;
  var end = new Date(now.getTime() + d * 86400000);
  var events = cal.getEvents(now, end);
  return {
    events: events.map(function(e) {
      return {
        id: e.getId(),
        title: e.getTitle(),
        date: fmtCalDate(e.getStartTime()),
        start: e.isAllDayEvent() ? 'All day' : fmtCalTime(e.getStartTime()),
        end: e.isAllDayEvent() ? '' : fmtCalTime(e.getEndTime()),
        allDay: e.isAllDayEvent(),
        location: e.getLocation() || '',
        description: e.getDescription() || ''
      };
    })
  };
}

function createCalEvent(ev) {
  var cal = CalendarApp.getDefaultCalendar();
  var event;
  if (ev.allDay || !ev.time || ev.time === 'All day') {
    event = cal.createAllDayEvent(ev.title, new Date(ev.date + 'T00:00:00'));
  } else {
    var startStr = ev.date + 'T' + ev.time + ':00';
    var durMin = +ev.duration || 60;
    var start = new Date(startStr);
    var end = new Date(start.getTime() + durMin * 60000);
    event = cal.createEvent(ev.title, start, end);
  }
  if (ev.location) event.setLocation(ev.location);
  if (ev.description) event.setDescription(ev.description);
  return { ok: true, id: event.getId(), title: ev.title };
}

function deleteCalEvent(eventId) {
  try {
    var cal = CalendarApp.getDefaultCalendar();
    var event = cal.getEventById(eventId);
    if (event) { event.deleteEvent(); return { ok: true }; }
    return { error: 'Event not found' };
  } catch(err) {
    return { error: err.message };
  }
}

function fmtCalDate(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function fmtCalTime(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'HH:mm');
}

// --- GMAIL ---

function listUnreadEmails(max) {
  var limit = Math.min(Number(max) || 50, 100);
  var threads = GmailApp.search('is:unread in:inbox', 0, limit);
  var emails = [];
  for (var i = 0; i < threads.length; i++) {
    var t = threads[i];
    var msgs = t.getMessages();
    var last = msgs[msgs.length - 1];
    emails.push({
      threadId: t.getId(),
      messageId: last.getId(),
      from: last.getFrom(),
      to: last.getTo(),
      subject: t.getFirstMessageSubject(),
      snippet: last.getPlainBody().substring(0, 300),
      date: Utilities.formatDate(last.getDate(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
      labels: t.getLabels().map(function(l) { return l.getName(); }),
      isStarred: t.hasStarredMessages(),
      messageCount: msgs.length
    });
  }
  return { emails: emails, total: emails.length };
}

// --- UTILITY FUNCTIONS ---

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
    {id:1742120004,title:'Send Santi staff ratings — short-time or retrenchment prep',category:'prima-ops',priority:'urgent',due:'2026-03-16',notes:'Section 189 — do not delay.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120005,title:'Decide on electrical inspection R36 000 (COC + surge protection)',category:'prima-finance',priority:'high',due:'2026-03-17',notes:'Required by insurer. Risk: policy lapse if deferred.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120006,title:'Follow up landlord — building space surrender meeting',category:'prima-finance',priority:'high',due:'2026-03-17',notes:'Kevin Padayachee / Soretha, Fort Knox / Investicore.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120007,title:'Quote: Awwthentic',category:'prima-ops',priority:'high',due:'',notes:'',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120008,title:'Quote: Pick n Pay Pod',category:'prima-ops',priority:'high',due:'',notes:'',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120009,title:'Quote: Plato',category:'prima-ops',priority:'high',due:'',notes:'',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120010,title:'Invoice Dischem',category:'prima-finance',priority:'high',due:'2026-03-16',notes:'Send immediately.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120011,title:'Oasis Pod — confirm billable and invoice',category:'prima-finance',priority:'high',due:'2026-03-16',notes:'Finished but never collected.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120012,title:'Call Pieer — joint site visits Wonderboom and Greenside',category:'prima-ops',priority:'high',due:'2026-03-17',notes:'Problems at both sites.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120013,title:'Arrange vinyl for House Strachan',category:'prima-ops',priority:'normal',due:'',notes:'Coordinate delivery and install.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120014,title:'Order vinyl for H&H East Rand Mall',category:'prima-ops',priority:'normal',due:'',notes:'Place order for install schedule.',done:'0',createdAt:now,aiBreakdown:''},
    {id:1742120015,title:'KFC sites — measure and survey for quoting',category:'prima-ops',priority:'normal',due:'',notes:'Schedule visits and take measurements.',done:'0',createdAt:now,aiBreakdown:''},
  ];
  writeAll('Todos', todos);
  Logger.log('Loaded ' + todos.length + ' tasks into Todos sheet');
}
