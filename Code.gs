/**
 * The Client Service Mirror — Google Apps Script backend
 * Serves the test page, saves results to this
 * Google Sheet, builds the summary report, and creates participant PDFs.
 */

var CONFIG = {
  // The Google Sheet that receives results
  SPREADSHEET_ID: '1N8EWTlC36hAXxJ5zU2gXPuFgs7RgbjtyI0jQ12v2nhg',
  RESPONSES_SHEET: 'Responses Tab',   // must match your tab name
  SUMMARY_SHEET: 'Summary',
  COMPLETED_SHEET: 'Completion List', // must match your tab name
  // Set to true to also email each participant a copy of their PDF.
  // (Gmail quota: ~100/day on personal accounts, ~1,500/day on Workspace.)
  EMAIL_COPY_TO_PARTICIPANT: false,
  TIMEZONE: Session.getScriptTimeZone()
};

var HEADERS = [
  'Timestamp', 'Submission ID', 'Full name', 'Email', 'Role', 'Department', 'Attempt #',
  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10',
  'A count', 'B count', 'C count', 'D count', 'Result', 'Top profile(s)', 'Minutes taken'
];
// Column letters used by the Summary formulas (keep in sync with HEADERS)
var COL = { id: 'B', email: 'D', role: 'E', dept: 'F', q1: 'H', result: 'V', top: 'W', minutes: 'X' };

/* ───────────── Web app ───────────── */

function doGet(e) {
  var appUrl = ScriptApp.getService().getUrl();
  var t = HtmlService.createTemplateFromFile('Index');
  t.contentJson = JSON.stringify(CONTENT);
  t.appUrl = appUrl;
  return t.evaluate()
    .setTitle(CONTENT.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ───────────── Saving results ───────────── */

function submitResult(p) {
  var clean = validate_(p);
  var score = score_(clean.answers);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = ensureResponsesSheet_();
    var last = sh.getLastRow();

    // Ignore duplicate submissions (e.g. a retry after a slow connection)
    if (last > 1) {
      var dup = sh.getRange(2, 2, last - 1, 1).createTextFinder(clean.submissionId).matchEntireCell(true).findNext();
      if (dup) {
        return { ok: true, duplicate: true, attempt: sh.getRange(dup.getRow(), 7).getValue() };
      }
    }

    // Attempt number per email
    var attempt = 1;
    if (last > 1) {
      var emails = sh.getRange(2, 4, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).toLowerCase() === clean.email) attempt++;
      }
    }

    var row = [
      new Date(), clean.submissionId, clean.name, clean.email, clean.role, clean.department, attempt
    ].concat(clean.answers).concat([
      score.counts.A, score.counts.B, score.counts.C, score.counts.D,
      score.result, score.topNames.join(', '), clean.minutes
    ]);
    sh.appendRow(row);

    // Add the person to the Completion List tab
    var cl = ensureCompletionSheet_();
    cl.appendRow([clean.name, clean.email, clean.role, clean.department, row[0], attempt, score.result]);
  } finally {
    lock.releaseLock();
  }

  if (CONFIG.EMAIL_COPY_TO_PARTICIPANT) {
    try {
      var pdf = buildPdfBlob_(clean, score);
      MailApp.sendEmail({
        to: clean.email,
        subject: 'Your result: ' + CONTENT.title,
        htmlBody: 'Hi ' + esc_(clean.name.split(' ')[0]) + ',<br><br>Your answers and profile are attached.<br><br>' + esc_(CONTENT.title),
        attachments: [pdf]
      });
    } catch (err) { console.warn('Email failed: ' + err); }
  }
  return { ok: true, attempt: attempt };
}

/* ───────────── PDF for the participant ───────────── */

function makePdf(p) {
  var clean = validate_(p);
  var score = score_(clean.answers);
  var blob = buildPdfBlob_(clean, score);
  return { fileName: blob.getName(), base64: Utilities.base64Encode(blob.getBytes()) };
}

function buildPdfBlob_(c, score) {
  var date = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'd MMMM yyyy');
  var ink = '#1B1A23', night = '#243748', muted = '#5A696B', line = '#DDE6EE';
  var h = [];
  h.push('<html><body style="font-family:Arial,Helvetica,sans-serif;color:' + ink + ';font-size:10.5pt;line-height:1.45;">');
  h.push('<div style="background:' + night + ';color:#fff;padding:20px 24px;">' +
    '<div style="font-size:8.5pt;color:#84ACB6;margin-bottom:4px;">Assessment report</div>' +
    '<div style="font-size:20pt;font-weight:bold;">' + esc_(CONTENT.title) + '</div>' +
    '<div style="font-size:10pt;color:#CDDBE6;">' + esc_(CONTENT.subtitle) + '</div></div>' +
    '<table style="width:100%;border-collapse:collapse;"><tr>' +
    ['#2683C6', '#3394BA', '#57B6C0', '#76BDA7'].map(function (c) { return '<td style="height:5px;background:' + c + ';"></td>'; }).join('') +
    '</tr></table>');

  h.push('<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:10pt;">' +
    pdfMeta_('Name', c.name) + pdfMeta_('Email', c.email) +
    pdfMeta_('Role', c.role) + pdfMeta_('Department', c.department) +
    pdfMeta_('Completed', date) + '</table>');

  // Result headline
  score.top.forEach(function (k) {
    var pr = CONTENT.profiles[k];
    h.push('<div style="border-left:6px solid ' + pr.color + ';padding:6px 0 6px 14px;margin:14px 0 6px;">' +
      '<div style="font-size:9pt;color:' + muted + ';">' + (score.top.length > 1 ? 'Shared profile' : 'Your profile') + '</div>' +
      '<div style="font-size:20pt;font-weight:bold;color:' + pr.text + ';">' + esc_(pr.name) + '</div>' +
      '<div style="font-size:11pt;font-weight:bold;">' + esc_(pr.headline) + '</div></div>');
  });
  if (score.top.length > 1) h.push('<p style="color:' + muted + ';">' + esc_(CONTENT.tieNote) + '</p>');

  // Score table
  h.push('<table style="width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:10pt;"><tr>');
  ['A', 'B', 'C', 'D'].forEach(function (k) {
    var pr = CONTENT.profiles[k];
    h.push('<td style="width:25%;border:1px solid ' + line + ';padding:8px;border-top:4px solid ' + pr.color + ';">' +
      '<div style="font-size:9pt;color:' + muted + ';">' + k + ' ' + esc_(pr.short) + '</div>' +
      '<div style="font-size:16pt;font-weight:bold;color:' + pr.text + ';">' + score.counts[k] + ' / 10</div></td>');
  });
  h.push('</tr></table>');

  // Answers
  h.push('<div style="font-size:13pt;font-weight:bold;margin:18px 0 6px;">Your answers</div>');
  h.push('<table style="width:100%;border-collapse:collapse;font-size:9.5pt;">');
  CONTENT.questions.forEach(function (q, i) {
    var a = c.answers[i], pr = CONTENT.profiles[a];
    h.push('<tr><td style="vertical-align:top;width:22px;padding:7px 4px;border-bottom:1px solid ' + line + ';font-weight:bold;">' + (i + 1) + '</td>' +
      '<td style="padding:7px 4px;border-bottom:1px solid ' + line + ';"><div style="font-weight:bold;">' + esc_(q.q) + '</div>' +
      '<div style="margin-top:3px;"><span style="color:' + pr.text + ';font-weight:bold;">' + a + '.</span> ' + esc_(q.options[a]) + '</div></td>' +
      '<td style="vertical-align:top;width:110px;padding:7px 4px;border-bottom:1px solid ' + line + ';color:' + pr.text + ';font-size:8.5pt;font-weight:bold;">' + esc_(pr.short) + '</td></tr>');
  });
  h.push('</table>');

  // Profile write-ups
  h.push('<p style="color:' + muted + ';margin-top:16px;font-style:italic;">' + esc_(CONTENT.mirrorNote) + '</p>');
  score.top.forEach(function (k) {
    var pr = CONTENT.profiles[k];
    h.push('<div style="margin-top:18px;border-top:3px solid ' + pr.color + ';padding-top:8px;">' +
      '<div style="font-size:15pt;font-weight:bold;color:' + pr.text + ';">' + esc_(pr.name) + '</div>' +
      '<div style="font-weight:bold;margin-bottom:6px;">' + esc_(pr.headline) + '</div>');
    pr.body.forEach(function (para) { h.push('<p style="margin:0 0 7px;">' + esc_(para) + '</p>'); });
    h.push('<div style="font-weight:bold;margin-top:10px;">What your clients may say</div>' +
      '<p style="margin:3px 0 8px;font-style:italic;">“' + esc_(pr.clientsSay) + '”</p>' +
      '<div style="font-weight:bold;">Your blind spot</div><p style="margin:3px 0 8px;">' + esc_(pr.blindSpot) + '</p>' +
      '<div style="font-weight:bold;">Your next 30 days</div><ul style="margin:3px 0 0 18px;padding:0;">');
    pr.next30.forEach(function (s) { h.push('<li style="margin-bottom:4px;">' + esc_(s) + '</li>'); });
    h.push('</ul></div>');
  });

  h.push('</body></html>');
  var safeName = c.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Participant';
  return Utilities.newBlob(h.join(''), 'text/html', 'mirror.html')
    .getAs('application/pdf')
    .setName('Client_Service_Mirror_' + safeName + '.pdf');
}

function pdfMeta_(label, value) {
  return '<tr><td style="width:120px;padding:3px 0;color:#5A696B;">' + label + '</td><td style="padding:3px 0;font-weight:bold;">' + esc_(value) + '</td></tr>';
}

/* ───────────── Scoring & validation ───────────── */

function score_(answers) {
  var counts = { A: 0, B: 0, C: 0, D: 0 };
  answers.forEach(function (a) { counts[a]++; });
  var max = Math.max(counts.A, counts.B, counts.C, counts.D);
  var top = ['A', 'B', 'C', 'D'].filter(function (k) { return counts[k] === max; });
  var topNames = top.map(function (k) { return CONTENT.profiles[k].short; });
  return { counts: counts, top: top, topNames: topNames, result: top.length > 1 ? 'Mixed' : topNames[0] };
}

function validate_(p) {
  if (!p) throw new Error('No data received.');
  var s = function (v, n) { return String(v == null ? '' : v).trim().slice(0, n || 200); };
  var c = {
    submissionId: s(p.submissionId, 60),
    name: s(p.name, 120),
    email: s(p.email, 160).toLowerCase(),
    role: s(p.role, 80),
    department: s(p.department, 120),
    minutes: Number(p.minutes) > 0 ? Math.round(Number(p.minutes) * 10) / 10 : '',
    answers: (p.answers || []).map(function (a) { return String(a).toUpperCase(); })
  };
  if (!c.name) throw new Error('Name is missing.');
  if (!c.role) throw new Error('Role is missing.');
  if (!c.department) throw new Error('Department is missing.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) throw new Error('Email looks invalid.');
  if (c.answers.length !== CONTENT.questions.length || c.answers.some(function (a) { return 'ABCD'.indexOf(a) < 0 || a.length !== 1; })) {
    throw new Error('Answers are incomplete.');
  }
  if (!c.submissionId) c.submissionId = Utilities.getUuid();
  return c;
}

function esc_(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ───────────── Sheet setup & summary report ───────────── */

function getSs_() {
  if (CONFIG.SPREADSHEET_ID) return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open the Google Sheet and run "Mirror Test → Set up sheets" once.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function ensureResponsesSheet_() {
  var ss = getSs_();
  var sh = findSheet_(ss, CONFIG.RESPONSES_SHEET);
  if (!sh) sh = ss.insertSheet(CONFIG.RESPONSES_SHEET);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
      .setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#243748');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('d mmm yyyy, h:mm am/pm');
    sh.setColumnWidth(1, 150); sh.setColumnWidth(3, 170); sh.setColumnWidth(4, 210);
    sh.setColumnWidth(5, 170); sh.setColumnWidth(6, 170);
    sh.setColumnWidths(8, 14, 46);
    sh.setColumnWidth(22, 140); sh.setColumnWidth(23, 200);

    // Colour the Result column by profile
    var rng = sh.getRange(COL.result + '2:' + COL.result);
    var rules = ['A', 'B', 'C', 'D'].map(function (k) {
      var pr = CONTENT.profiles[k];
      return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(pr.short)
        .setBackground(pr.color).setFontColor(pr.on).setRanges([rng]).build();
    });
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Mixed')
      .setBackground('#CDDBE6').setFontColor('#1B1A23').setRanges([rng]).build());
    sh.setConditionalFormatRules(rules);
  }
  return sh;
}

function setupSheets() {
  var ss = getSs_();
  ensureResponsesSheet_();
  var R = "'" + ensureResponsesSheet_().getName() + "'!";
  var sm = ss.getSheetByName(CONFIG.SUMMARY_SHEET);
  if (sm) { sm.getCharts().forEach(function (c) { sm.removeChart(c); }); sm.clear(); }
  else sm = ss.insertSheet(CONFIG.SUMMARY_SHEET, 0);
  sm.setHiddenGridlines(true);

  var ink = '#1B1A23';
  sm.getRange('A1').setValue(CONTENT.title + ' · Summary').setFontSize(18).setFontWeight('bold').setFontColor(ink);
  sm.getRange('A2').setValue('Updates automatically as people finish the test.').setFontColor('#5A696B');

  // Headline numbers
  var kpi = [
    ['Completions', '=COUNTA(' + R + COL.id + '2:' + COL.id + ')'],
    ['Unique participants', '=IFERROR(COUNTUNIQUE(FILTER(' + R + COL.email + '2:' + COL.email + ',' + R + COL.email + '2:' + COL.email + '<>"")),0)'],
    ['Average minutes', '=IFERROR(ROUND(AVERAGE(' + R + COL.minutes + '2:' + COL.minutes + '),1),"")'],
    ['Last completion', '=IFERROR(IF(MAX(' + R + 'A2:A)=0,"",MAX(' + R + 'A2:A)),"")']
  ];
  sm.getRange(4, 1, kpi.length, 2).setValues(kpi);
  sm.getRange('A4:A7').setFontColor('#5A696B');
  sm.getRange('B4:B7').setFontWeight('bold').setFontSize(13).setHorizontalAlignment('left');
  sm.getRange('B7').setNumberFormat('d mmm yyyy, h:mm am/pm');

  // Profile distribution
  sm.getRange('A9:D9').setValues([['Profile', 'Clear result', 'Incl. ties', 'Share of completions']]);
  var rows = [];
  ['A', 'B', 'C', 'D'].forEach(function (k, i) {
    var pr = CONTENT.profiles[k], r = 10 + i;
    rows.push([k + ' ' + pr.short,
      '=COUNTIF(' + R + COL.result + '2:' + COL.result + ',"' + pr.short + '")',
      '=COUNTIF(' + R + COL.top + '2:' + COL.top + ',"*' + pr.short + '*")',
      '=IFERROR(C' + r + '/$B$4,0)']);
  });
  rows.push(['Mixed (tied)', '=COUNTIF(' + R + COL.result + '2:' + COL.result + ',"Mixed")', '', '=IFERROR(B14/$B$4,0)']);
  sm.getRange(10, 1, rows.length, 4).setValues(rows);
  sm.getRange('D10:D14').setNumberFormat('0%');
  styleHeader_(sm.getRange('A9:D9'));
  ['A', 'B', 'C', 'D'].forEach(function (k, i) {
    sm.getRange(10 + i, 1).setFontColor(CONTENT.profiles[k].text).setFontWeight('bold');
  });

  // Answer pattern per question
  sm.getRange('A17').setValue('How people answered each scenario').setFontWeight('bold').setFontColor(ink).setFontSize(12);
  sm.getRange('A18:E18').setValues([['Scenario', 'A', 'B', 'C', 'D']]);
  styleHeader_(sm.getRange('A18:E18'));
  var qRows = [];
  for (var q = 0; q < CONTENT.questions.length; q++) {
    var colLetter = String.fromCharCode(COL.q1.charCodeAt(0) + q);
    var rr = [ 'Q' + (q + 1) + '  ' + CONTENT.questions[q].q ];
    ['A', 'B', 'C', 'D'].forEach(function (k) {
      rr.push('=COUNTIF(' + R + colLetter + '2:' + colLetter + ',"' + k + '")');
    });
    qRows.push(rr);
  }
  sm.getRange(19, 1, qRows.length, 5).setValues(qRows);
  sm.getRange(19, 1, qRows.length, 1).setWrap(true);
  var heat = sm.getRange(19, 2, qRows.length, 4);
  heat.setHorizontalAlignment('center');
  var rule = SpreadsheetApp.newConditionalFormatRule().setGradientMinpoint('#FFFFFF')
    .setGradientMaxpoint('#8FCCD3').setRanges([heat]).build();
  sm.setConditionalFormatRules([rule]);

  // Breakdown by role and by department
  sm.getRange('G17').setValue('By role').setFontWeight('bold').setFontColor(ink).setFontSize(12);
  sm.getRange('G18').setFormula('=IFERROR(QUERY(' + R + 'A1:X,"select ' + COL.role + ', count(' + COL.id + ') where ' + COL.id +
    ' is not null group by ' + COL.role + ' pivot ' + COL.result + '",1),"No completions yet")');
  sm.getRange('G30').setValue('By department').setFontWeight('bold').setFontColor(ink).setFontSize(12);
  sm.getRange('G31').setFormula('=IFERROR(QUERY(' + R + 'A1:X,"select ' + COL.dept + ', count(' + COL.id + ') where ' + COL.id +
    ' is not null group by ' + COL.dept + ' pivot ' + COL.result + '",1),"No completions yet")');

  sm.setColumnWidth(1, 380); sm.setColumnWidths(2, 4, 90); sm.setColumnWidth(6, 30); sm.setColumnWidth(7, 160);

  // Chart
  var chart = sm.newChart().asPieChart()
    .addRange(sm.getRange('A10:B14'))
    .setPosition(4, 7, 0, 0)
    .setOption('title', 'Profiles (clear results + mixed)')
    .setOption('pieHole', 0.45)
    .setOption('legend', { position: 'right' })
    .setOption('slices', {
      0: { color: CONTENT.profiles.A.color }, 1: { color: CONTENT.profiles.B.color },
      2: { color: CONTENT.profiles.C.color }, 3: { color: CONTENT.profiles.D.color }, 4: { color: '#CDDBE6' }
    })
    .setOption('width', 460).setOption('height', 260)
    .build();
  sm.insertChart(chart);

  buildCompletionList_(ss);

  SpreadsheetApp.getActive() && SpreadsheetApp.getActive().toast('Sheets are ready.', CONTENT.title, 5);
}

/* ───────── Completion List tab (filled by the script on every submission) ───────── */

var COMPLETED_HEADERS = ['Name', 'Work Email', 'Role', 'Department', 'Completed on', 'Attempt', 'Result'];

// Finds a tab by name, ignoring capital letters and extra spaces
function findSheet_(ss, name) {
  var want = String(name).trim().toLowerCase();
  var all = ss.getSheets();
  for (var i = 0; i < all.length; i++) {
    if (all[i].getName().trim().toLowerCase() === want) return all[i];
  }
  return null;
}

function ensureCompletionSheet_() {
  var ss = getSs_();
  var cl = findSheet_(ss, CONFIG.COMPLETED_SHEET);
  if (!cl) {
    cl = ss.insertSheet(CONFIG.COMPLETED_SHEET, 0);
    cl.getRange(1, 1, 1, COMPLETED_HEADERS.length).setValues([COMPLETED_HEADERS]);
    styleHeader_(cl.getRange(1, 1, 1, COMPLETED_HEADERS.length));
    cl.setFrozenRows(1);
  }
  cl.getRange('E:E').setNumberFormat('d mmm yyyy, h:mm am/pm');
  return cl;
}

function buildCompletionList_(ss) {
  ensureCompletionSheet_();
}

// Menu: refill the Completion List from everything already in the Responses tab
function rebuildCompletionList() {
  var sh = ensureResponsesSheet_();
  var cl = ensureCompletionSheet_();
  var lastCl = cl.getLastRow();
  if (lastCl > 1) cl.getRange(2, 1, lastCl - 1, COMPLETED_HEADERS.length).clearContent();
  var last = sh.getLastRow();
  if (last < 2) { SpreadsheetApp.getActive().toast('No completions yet.', CONTENT.title, 5); return; }
  var data = sh.getRange(2, 1, last - 1, HEADERS.length).getValues()
    .filter(function (r) { return r[1]; })                       // has a Submission ID
    .map(function (r) { return [r[2], r[3], r[4], r[5], r[0], r[6], r[21]]; });
  if (data.length) cl.getRange(2, 1, data.length, COMPLETED_HEADERS.length).setValues(data);
  SpreadsheetApp.getActive().toast(data.length + ' names added to the Completion List.', CONTENT.title, 5);
}

function styleHeader_(rng) {
  rng.setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#243748');
}

/* ───────────── Sheet menu ───────────── */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Mirror Test')
    .addItem('Set up sheets / rebuild summary', 'setupSheets')
    .addItem('Rebuild completion list from responses', 'rebuildCompletionList')
    .addItem('Show test link', 'showLinks')
    .addToUi();
}

function showLinks() {
  var url = ScriptApp.getService().getUrl();
  var ui = SpreadsheetApp.getUi();
  if (!url) {
    ui.alert('Deploy the web app first: Deploy → New deployment → Web app. Then try again.');
    return;
  }
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial;color:#1B1A23;font-size:14px;line-height:1.5">' +
    '<p><b>Test link</b> (share this):<br><input style="width:100%;padding:6px" value="' + url + '" onclick="this.select()"></p></div>'
  ).setWidth(460).setHeight(130);
  ui.showModalDialog(html, CONTENT.title);
}
