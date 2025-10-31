/* ================= Utilities & Defaults ================= */
const $ = id => document.getElementById(id);
const toast = (m,t=1400)=>{ const el=$('toast'); el.textContent=m; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),t); };

let currentUser = null;

const defaultInterFeeders = [
  {sl:1, feeder:'NAM-KAK 33 CKT-I'},
  {sl:2, feeder:'NAM-KAK 132 CKT-II'},
  {sl:3, feeder:'NARAYANPUR'},
  {sl:4, feeder:'UKILERHAT'},
  {sl:5, feeder:'RAJNAGAR'}
];
const defaultMeterFeeders = [
  {sl:1, feeder:'NARAYANPUR', mf:'20000'},
  {sl:2, feeder:'UKILERHAT', mf:'20000'},
  {sl:3, feeder:'RAJNAGAR', mf:'20000'},
  {sl:4, feeder:'INCOMING - 1', mf:'40000'},
  {sl:5, feeder:'INCOMING - 2', mf:'40000'},
  {sl:6, feeder:'33KV CIRCUIT - 1', mf:'-'},
  {sl:7, feeder:'33KV CIRCUIT - 2', mf:'-'}
,
  {sl:8, feeder:'RADHANAGAR CIRCUIT-1', mf:'-'}
];
const defaultPeakFeeders = defaultMeterFeeders.map(f=>({sl:f.sl, feeder:f.feeder}));

const yearlyVMDefaultFeeders = [
  {sl:1, feeder:'INCOMING - 1'},
  {sl:2, feeder:'INCOMING - 2'},
  {sl:3, feeder:'33KV CIRCUIT - 1'},
  {sl:4, feeder:'33KV CIRCUIT - 2'}
];

function pad(n){ return n<10? '0'+n : String(n); }
function formatYMD(y,m,d){ return `${y}-${pad(m)}-${pad(d)}`; }
function formatDDMMYYYY(dateStringOrObj){
  const d = (typeof dateStringOrObj === 'string') ? new Date(dateStringOrObj) : dateStringOrObj;
  if(isNaN(d)) return '';
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}
function nowStamp(){ return new Date().toLocaleString(); }

/* ===== Login UI ===== */
$('operator-login-btn').addEventListener('click', ()=>{ $('login-forms').style.display='block'; $('operator-form').style.display='block'; $('admin-form').style.display='none'; });
$('admin-login-btn').addEventListener('click', ()=>{ $('login-forms').style.display='block'; $('operator-form').style.display='none'; $('admin-form').style.display='block'; });
$('operator-login-cancel').addEventListener('click', ()=>{ $('login-forms').style.display='none'; });
$('admin-login-cancel').addEventListener('click', ()=>{ $('login-forms').style.display='none'; });

$('operator-select').addEventListener('change', (e)=>{ $('operator-other').style.display = e.target.value==='__other__' ? 'inline-block' : 'none'; });
$('operator-login-confirm').addEventListener('click', ()=>{
  let val = $('operator-select').value;
  if(!val) return alert('Choose operator or Other');
  if(val === '__other__'){ val = $('operator-other').value.trim(); if(!val) return alert('Enter operator name'); }
  currentUser = { role:'operator', name: val, email:'' };
  afterLogin();
});
$('admin-login-confirm').addEventListener('click', ()=>{
  const email = $('admin-select').value;
  if(!email) return alert('Choose admin');
  currentUser = { role:'admin', name:'ADMIN', email };
  afterLogin();
});

/* ===== After login setup ===== */
function afterLogin(){
  $('login-screen').style.display='none';
  $('app').style.display='block';
  updateHeader();
  initPeriod();
  initAllTables();
  populateYearSelect();
  bindSaveDropdowns(); // wire the save menus
  setupAutoYearlySync(); // auto sync monthly -> yearly
  loadDraftsIfAny();
  setInterval(()=>{ tickClock(); },1000);
  updateLastLogin();
  updateSignatures();
  toast(`Logged in as ${currentUser.role==='admin' ? currentUser.email : currentUser.name}`);
}
function updateHeader(){ $('id-banner').textContent = currentUser ? (currentUser.role==='admin' ? `Admin (${currentUser.email})` : `${currentUser.name} (Operator)`) : ''; }
function tickClock(){ $('time-banner').textContent = `Current: ${new Date().toLocaleString()}`; }

$('logout-btn').addEventListener('click', ()=>{ if(!confirm('Logout?')) return; currentUser=null; $('app').style.display='none'; $('login-screen').style.display='block'; $('last-login').textContent='Not logged in'; toast('Logged out'); });

/* ===== Tabs ===== */
function activateMainTab(tab){
  document.querySelectorAll('.main-tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(s=>s.style.display='none');
  document.querySelector(`.main-tab[data-tab="${tab}"]`).classList.add('active');
  $(tab).style.display='block';
  if(tab==='monthly') activateSubTab('interruption');
  if(tab==='yearly') activateYearSubTab('y-peak');
}
document.querySelectorAll('.main-tab').forEach(t=>t.addEventListener('click', ()=> activateMainTab(t.dataset.tab)));
function activateSubTab(sub){
  document.querySelectorAll('.sub-tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.subpanel').forEach(p=>p.style.display='none');
  const sel = document.querySelector(`.sub-tab[data-sub="${sub}"]`);
  if(sel) sel.classList.add('active');
  if(sub==='interruption') $('panel-interruption').style.display='block';
  if(sub==='meter') $('panel-meter').style.display='block';
  if(sub==='peak') $('panel-peak').style.display='block';
  if(sub==='vminmax') $('panel-vminmax').style.display='block';
}
document.querySelectorAll('.sub-tab').forEach(st=>st.addEventListener('click', ()=> activateSubTab(st.dataset.sub)));
function activateYearSubTab(sub){
  document.querySelectorAll('.sub-tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('[data-yearsub]').forEach(x=>x.classList.remove('active'));
  const sel = document.querySelector(`.sub-tab[data-yearsub="${sub}"]`);
  if(sel) sel.classList.add('active');
  document.querySelectorAll('.subpanel').forEach(p=>p.style.display='none');
  if(sub==='y-inter') $('panel-y-inter').style.display='block';
  if(sub==='y-meter') $('panel-y-meter').style.display='block';
  if(sub==='y-peak') $('panel-y-peak').style.display='block';
  if(sub==='y-vminmax') $('panel-y-vminmax').style.display='block';
}
document.querySelectorAll('.sub-tab[data-yearsub]').forEach(st=>st.addEventListener('click', ()=> activateYearSubTab(st.dataset.yearsub)));

/* ===== Period helper ===== */
function initPeriod(){
  const today = new Date();
  let y = today.getFullYear(), m = today.getMonth() - 1;
  if(m < 0){ m = 11; y--; }
  const start = new Date(y, m, 1);
  const end = new Date(y, m+1, 0);
  $('period-start').value = formatYMD(start.getFullYear(), start.getMonth()+1, start.getDate());
  $('period-end').value = formatYMD(end.getFullYear(), end.getMonth()+1, end.getDate());
}
$('reset-period').addEventListener('click', ()=>{ initPeriod(); toast('Period reset to previous month'); });

/* ===== Table refs ===== */
const interBody = document.querySelector('#table-inter tbody');
const meterBody = document.querySelector('#table-meter tbody');
const peakBody = document.querySelector('#table-peak tbody');
const vmBody = document.querySelector('#table-vm tbody');
const yearlyInterBody = document.querySelector('#table-yearly-inter tbody');
const yearlyMeterBody = document.querySelector('#table-yearly-meter tbody');
const yearlyPeakBody = document.querySelector('#table-yearly-peak tbody');
const yearlyVmBody = document.querySelector('#table-yearly-vm tbody');
const equipBody = document.querySelector('#table-equip tbody');

/* ===== helpers to create rows ===== */
function makeRemarkTD(text=''){
  const td = document.createElement('td');
  const div = document.createElement('div');
  div.className='remark-text'; div.contentEditable = true; div.textContent = text || '';
  td.appendChild(div);
  return td;
}
function makeRowTrashButton(tr){
  const td = tr.lastElementChild;
  td.innerHTML = '';
  const btn = document.createElement('button');
  btn.className='trash-btn';
  btn.title = 'Delete this row';
  btn.innerText = '🗑️';
  btn.addEventListener('click', (e)=>{ e.stopPropagation(); if(!confirm('Delete this row?')) return; tr.remove(); markUnsavedAll(); triggerYearlySync(); });
  td.appendChild(btn);
}
function createInterRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const keys=['transientNos','transientMin','sustainedNos','sustainedMin','plannedNos','plannedMin','emergencyNos','emergencyMin'];
  keys.forEach(k=>{
    const td=document.createElement('td');
    td.contentEditable=true;
    td.textContent = d[k]!==undefined? d[k] : '';
    td.addEventListener('input', ()=>{ interRecalc(tr); markUnsaved('interruption'); triggerYearlySync(); });
    tr.appendChild(td);
  });
  const tdTot=document.createElement('td'); tdTot.className='total-outage calc locked'; tdTot.contentEditable=false; tdTot.textContent = d.total||''; tr.appendChild(tdTot);
  const tdAvail=document.createElement('td'); tdAvail.className='availability calc locked'; tdAvail.contentEditable=false; tdAvail.textContent = d.avail||''; tr.appendChild(tdAvail);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  interRecalc(tr);
  return tr;
}
function createMeterRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const tdStart=document.createElement('td'); tdStart.className='start'; tdStart.contentEditable=true; tdStart.textContent = d.start||''; tdStart.addEventListener('input', ()=>{ meterRecalc(tr); markUnsaved('meter'); triggerYearlySync(); }); tr.appendChild(tdStart);
  const tdEnd=document.createElement('td'); tdEnd.className='end'; tdEnd.contentEditable=true; tdEnd.textContent = d.end||''; tdEnd.addEventListener('input', ()=>{ meterRecalc(tr); markUnsaved('meter'); triggerYearlySync(); }); tr.appendChild(tdEnd);
  const tdAdv=document.createElement('td'); tdAdv.className='advance calc locked'; tdAdv.contentEditable=false; tdAdv.textContent = d.advance||''; tr.appendChild(tdAdv);
  const tdMf=document.createElement('td'); tdMf.className='mf'; tdMf.contentEditable=false; tdMf.textContent = d.mf||''; tdMf.style.fontWeight='700'; tr.appendChild(tdMf);
  const tdTotal=document.createElement('td'); tdTotal.className='totalunit calc locked'; tdTotal.contentEditable=false; tdTotal.textContent = d.total||''; tr.appendChild(tdTotal);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  meterRecalc(tr);
  return tr;
}
function createPeakRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const tdPeak=document.createElement('td'); tdPeak.contentEditable=true; tdPeak.textContent = d.peak||''; tdPeak.addEventListener('input', ()=>{ markUnsaved('peak'); triggerYearlySync(); }); tr.appendChild(tdPeak);
  const tdDate=document.createElement('td'); tdDate.contentEditable=true; tdDate.textContent = d.date ? formatDDMMYYYY(d.date) : ''; tr.appendChild(tdDate);
  const tdTime=document.createElement('td'); tdTime.contentEditable=true; tdTime.textContent = d.time||''; tr.appendChild(tdTime);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  return tr;
}
function createVMRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const tdMax=document.createElement('td'); tdMax.contentEditable=true; tdMax.textContent = d.max||''; tdMax.addEventListener('input', ()=>{ markUnsaved('vm'); triggerYearlySync(); }); tr.appendChild(tdMax);
  const tdMaxDate=document.createElement('td'); tdMaxDate.contentEditable=true; tdMaxDate.textContent = d.maxDate ? formatDDMMYYYY(d.maxDate) : ''; tr.appendChild(tdMaxDate);
  const tdMaxTime=document.createElement('td'); tdMaxTime.contentEditable=true; tdMaxTime.textContent = d.maxTime||''; tr.appendChild(tdMaxTime);
  const tdMin=document.createElement('td'); tdMin.contentEditable=true; tdMin.textContent = d.min||''; tdMin.addEventListener('input', ()=>{ markUnsaved('vm'); triggerYearlySync(); }); tr.appendChild(tdMin);
  const tdMinDate=document.createElement('td'); tdMinDate.contentEditable=true; tdMinDate.textContent = d.minDate ? formatDDMMYYYY(d.minDate) : ''; tr.appendChild(tdMinDate);
  const tdMinTime=document.createElement('td'); tdMinTime.contentEditable=true; tdMinTime.textContent = d.minTime||''; tr.appendChild(tdMinTime);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  return tr;
}
function createEquipRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tds = ['equipment', 'id', 'rating', 'location', 'status'].map(k=>{
    const td=document.createElement('td'); td.contentEditable=true; td.textContent = d[k]||'';
    td.addEventListener('input', ()=> markUnsaved('equip'));
    return td;
  });
  tr.append(...tds);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  return tr;
}

/* ===== Yearly Interruption & Yearly Meter row creators (same as monthly for structure) ===== */
function createYearlyInterRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const keys=['transientNos','transientMin','sustainedNos','sustainedMin','plannedNos','plannedMin','emergencyNos','emergencyMin'];
  keys.forEach(k=>{
    const td=document.createElement('td');
    td.contentEditable=true;
    td.textContent = d[k]!==undefined? d[k] : '';
    td.addEventListener('input', ()=>{ yearlyInterRecalc(); markUnsavedYearly('y-inter'); });
    tr.appendChild(td);
  });
  const tdTot=document.createElement('td'); tdTot.className='total-outage calc locked'; tdTot.contentEditable=false; tdTot.textContent = d.total||''; tr.appendChild(tdTot);
  const tdAvail=document.createElement('td'); tdAvail.className='availability calc locked'; tdAvail.contentEditable=false; tdAvail.textContent = d.avail||''; tr.appendChild(tdAvail);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  yearlyInterRecalcRow(tr); // Calc on load
  return tr;
}
function createYearlyMeterRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const tdStart=document.createElement('td'); tdStart.className='start'; tdStart.contentEditable=true; tdStart.textContent = d.start||''; tdStart.addEventListener('input', ()=>{ yearlyMeterRecalc(); markUnsavedYearly('y-meter'); }); tr.appendChild(tdStart);
  const tdEnd=document.createElement('td'); tdEnd.className='end'; tdEnd.contentEditable=true; tdEnd.textContent = d.end||''; tdEnd.addEventListener('input', ()=>{ yearlyMeterRecalc(); markUnsavedYearly('y-meter'); }); tr.appendChild(tdEnd);
  const tdAdv=document.createElement('td'); tdAdv.className='advance calc locked'; tdAdv.contentEditable=false; tdAdv.textContent = d.advance||''; tr.appendChild(tdAdv);
  const tdMf=document.createElement('td'); tdMf.className='mf'; tdMf.contentEditable=false; tdMf.textContent = d.mf||''; tdMf.style.fontWeight='700'; tr.appendChild(tdMf);
  const tdTotal=document.createElement('td'); tdTotal.className='totalunit calc locked'; tdTotal.contentEditable=false; tdTotal.textContent = d.total||''; tr.appendChild(tdTotal);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  yearlyMeterRecalcRow(tr); // Calc on load
  return tr;
}

/* ===== Recalculation logic ===== */
const totalMinutesInYear = 365.25 * 24 * 60; // 525960 (approx, considering leap year)

function interRecalcRow(tr){
  const tds = tr.querySelectorAll('td');
  let totalMin = 0;
  for(let i=2; i<=8; i+=2){
    const minutes = parseFloat(tds[i+1].textContent) || 0;
    totalMin += minutes;
  }
  const totalOutageTD = tds[10];
  totalOutageTD.textContent = totalMin.toFixed(0);

  const availability = ((totalMinutesInYear - totalMin) / totalMinutesInYear) * 100;
  tds[11].textContent = availability.toFixed(3) + '%';
}
function interRecalc(){ interBody.querySelectorAll('tr').forEach(interRecalcRow); }
function meterRecalcRow(tr){
  const tds = tr.querySelectorAll('td');
  const start = parseFloat(tds[2].textContent) || 0;
  const end = parseFloat(tds[3].textContent) || 0;
  const mf = parseFloat(tds[5].textContent) || 1; // MF should be set, default to 1 for safety
  
  if(mf == '-'){ // MF is not numerical for this feeder
    tds[4].textContent = '-';
    tds[6].textContent = '-';
    return;
  }
  
  const advance = Math.abs(end - start);
  tds[4].textContent = advance.toFixed(2);
  const total = advance * mf;
  tds[6].textContent = total.toFixed(2);
}
function meterRecalc(){ meterBody.querySelectorAll('tr').forEach(meterRecalcRow); }

function yearlyInterRecalcRow(tr){
  const tds = tr.querySelectorAll('td');
  let totalMin = 0;
  for(let i=2; i<=8; i+=2){
    const minutes = parseFloat(tds[i+1].textContent) || 0;
    totalMin += minutes;
  }
  const totalOutageTD = tds[10];
  totalOutageTD.textContent = totalMin.toFixed(0);

  const availability = ((totalMinutesInYear - totalMin) / totalMinutesInYear) * 100;
  tds[11].textContent = availability.toFixed(3) + '%';
}
function yearlyInterRecalc(){ yearlyInterBody.querySelectorAll('tr').forEach(yearlyInterRecalcRow); markUnsavedYearly('y-inter'); }

function yearlyMeterRecalcRow(tr){
  const tds = tr.querySelectorAll('td');
  const start = parseFloat(tds[2].textContent) || 0;
  const end = parseFloat(tds[3].textContent) || 0;
  const mf = parseFloat(tds[5].textContent) || 1; // MF should be set, default to 1 for safety
  
  if(tds[5].textContent == '-'){ // MF is not numerical for this feeder
    tds[4].textContent = '-';
    tds[6].textContent = '-';
    return;
  }
  
  const advance = Math.abs(end - start);
  tds[4].textContent = advance.toFixed(2);
  const total = advance * mf;
  tds[6].textContent = total.toFixed(2);
}
function yearlyMeterRecalc(){ yearlyMeterBody.querySelectorAll('tr').forEach(yearlyMeterRecalcRow); markUnsavedYearly('y-meter'); }


/* ===== Add Row Buttons ===== */
$('inter-add').addEventListener('click', ()=>{ interBody.appendChild(createInterRow({})); markUnsaved('interruption'); });
$('meter-add').addEventListener('click', ()=>{ meterBody.appendChild(createMeterRow({})); markUnsaved('meter'); });
$('peak-add').addEventListener('click', ()=>{ peakBody.appendChild(createPeakRow({})); markUnsaved('peak'); });
$('vm-add').addEventListener('click', ()=>{ vmBody.appendChild(createVMRow({})); markUnsaved('vminmax'); });
$('y-inter-add').addEventListener('click', ()=>{ yearlyInterBody.appendChild(createYearlyInterRow({})); markUnsavedYearly('y-inter'); });
$('y-meter-add').addEventListener('click', ()=>{ yearlyMeterBody.appendChild(createYearlyMeterRow({})); markUnsavedYearly('y-meter'); });
$('y-peak-add').addEventListener('click', ()=>{ yearlyPeakBody.appendChild(createPeakRow({})); markUnsavedYearly('y-peak'); });
$('y-vm-add').addEventListener('click', ()=>{ yearlyVmBody.appendChild(createVMRow({})); markUnsavedYearly('y-vminmax'); });

/* ===== Clear Data Buttons ===== */
$('inter-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Interruption data for this period?')) return; initTable(interBody, defaultInterFeeders, createInterRow); markUnsaved('interruption'); });
$('meter-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Meter data for this period?')) return; initTable(meterBody, defaultMeterFeeders, createMeterRow); markUnsaved('meter'); });
$('peak-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Peak Load data for this period?')) return; initTable(peakBody, defaultPeakFeeders, createPeakRow); markUnsaved('peak'); });
$('vm-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Max/Min Voltage data for this period?')) return; initTable(vmBody, yearlyVMDefaultFeeders, createVMRow); markUnsaved('vminmax'); });
$('y-inter-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Yearly Interruption data?')) return; initTable(yearlyInterBody, defaultInterFeeders, createYearlyInterRow); markUnsavedYearly('y-inter'); });
$('y-meter-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Yearly Meter data?')) return; initTable(yearlyMeterBody, defaultMeterFeeders, createYearlyMeterRow); markUnsavedYearly('y-meter'); });
$('y-peak-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Yearly Peak Load data?')) return; initTable(yearlyPeakBody, defaultPeakFeeders, createPeakRow); markUnsavedYearly('y-peak'); });
$('y-vm-clear').addEventListener('click', ()=>{ if(!confirm('Clear ALL Yearly Max/Min Voltage data?')) return; initTable(yearlyVmBody, yearlyVMDefaultFeeders, createVMRow); markUnsavedYearly('y-vminmax'); });

/* ===== Init Tables ===== */
function initTable(body, defaultData, createRowFn, includeFixedRows=true){
  body.innerHTML = '';
  if(includeFixedRows){ defaultData.forEach(d=>body.appendChild(createRowFn(d, true))); }
}
function initAllTables(){
  initTable(interBody, defaultInterFeeders, createInterRow);
  initTable(meterBody, defaultMeterFeeders, createMeterRow);
  initTable(peakBody, defaultPeakFeeders, createPeakRow);
  initTable(vmBody, yearlyVMDefaultFeeders, createVMRow);
  initTable(equipBody, [], createEquipRow, false);

  // Yearly tables init (empty by default, populated by sync or save)
  initTable(yearlyInterBody, defaultInterFeeders, createYearlyInterRow);
  initTable(yearlyMeterBody, defaultMeterFeeders, createYearlyMeterRow);
  initTable(yearlyPeakBody, defaultPeakFeeders, createPeakRow);
  initTable(yearlyVmBody, yearlyVMDefaultFeeders, createVMRow);
}

/* ===== Save Draft Logic (Local Storage) ===== */
function getData(tableBody, isYearly=false){
  const data = [];
  const rows = tableBody.querySelectorAll('tr');
  const period = isYearly ? $('year-select').value : `${$('period-start').value}_${$('period-end').value}`;
  const tableId = tableBody.parentNode.parentNode.id.replace('panel-', '');

  rows.forEach(tr=>{
    const d = {};
    const tds = tr.querySelectorAll('td');
    if(tableId.includes('inter')){
      d.feeder=tds[1].textContent;
      d.transientNos=tds[2].textContent; d.transientMin=tds[3].textContent;
      d.sustainedNos=tds[4].textContent; d.sustainedMin=tds[5].textContent;
      d.plannedNos=tds[6].textContent; d.plannedMin=tds[7].textContent;
      d.emergencyNos=tds[8].textContent; d.emergencyMin=tds[9].textContent;
      d.total=tds[10].textContent; d.avail=tds[11].textContent;
      d.remarks=tds[12].querySelector('.remark-text').textContent;
    } else if (tableId.includes('meter')){
      d.feeder=tds[1].textContent; d.start=tds[2].textContent; d.end=tds[3].textContent;
      d.advance=tds[4].textContent; d.mf=tds[5].textContent; d.total=tds[6].textContent;
      d.remarks=tds[7].querySelector('.remark-text').textContent;
    } else if (tableId.includes('peak')){
      d.feeder=tds[1].textContent; d.peak=tds[2].textContent; d.date=tds[3].textContent;
      d.time=tds[4].textContent; d.remarks=tds[5].querySelector('.remark-text').textContent;
    } else if (tableId.includes('vm')){
      d.feeder=tds[1].textContent;
      d.max=tds[2].textContent; d.maxDate=tds[3].textContent; d.maxTime=tds[4].textContent;
      d.min=tds[5].textContent; d.minDate=tds[6].textContent; d.minTime=tds[7].textContent;
      d.remarks=tds[8].querySelector('.remark-text').textContent;
    } else if (tableId.includes('equip')){
      d.equipment=tds[0].textContent; d.id=tds[1].textContent; d.rating=tds[2].textContent;
      d.location=tds[3].textContent; d.status=tds[4].textContent; d.remarks=tds[5].querySelector('.remark-text').textContent;
    }
    data.push(d);
  });
  
  const notes = tableBody.parentNode.querySelector('.note-row td').textContent;
  const who = currentUser ? (currentUser.role==='admin' ? `Admin (${currentUser.email})` : currentUser.name) : 'Guest/Unknown';
  
  return { period, data, notes, who, timestamp: nowStamp() };
}

function saveData(sub, isYearly=false){
  const tableBody = isYearly ? document.querySelector(`#table-yearly-${sub.replace('y-','')} tbody`) : document.querySelector(`#table-${sub} tbody`);
  const data = getData(tableBody, isYearly);
  const key = isYearly ? `yearly_${sub}_${$('year-select').value}` : `draft_${sub}_${data.period}`;
  localStorage.setItem(key, JSON.stringify(data));
  markSaved(sub);
  updateLastLogin();
  toast(`Draft saved for ${sub} (${isYearly?'Yearly':'Monthly'})`);
}

function loadData(sub, tableBody, createRowFn, defaultData, isYearly=false){
  const period = isYearly ? $('year-select').value : `${$('period-start').value}_${$('period-end').value}`;
  const key = isYearly ? `yearly_${sub}_${period}` : `draft_${sub}_${period}`;
  const draft = localStorage.getItem(key);
  
  // Equipment is handled separately as it's not period-based
  if(sub === 'equip'){
    const equipDraft = localStorage.getItem('draft_equip');
    if(equipDraft){
      const data = JSON.parse(equipDraft);
      initTable(equipBody, [], createEquipRow, false);
      data.data.forEach(d => equipBody.appendChild(createEquipRow(d, false)));
      toast(`Equipment draft loaded.`);
    }
    return;
  }
  
  if(draft){
    const data = JSON.parse(draft);
    initTable(tableBody, defaultData, createRowFn);
    // Re-populate table with saved data. Skip fixed rows as initTable already added them.
    const savedDataRows = data.data.filter(d => !defaultData.some(fd => fd.feeder === d.feeder));
    savedDataRows.forEach(d => tableBody.appendChild(createRowFn(d, false)));
    
    // Update fixed rows
    defaultData.forEach(defaultD => {
      const savedD = data.data.find(d => d.feeder === defaultD.feeder);
      if(savedD){
        const row = tableBody.querySelector(`tr[data-fixed="true"] td:nth-child(2)`)?.parentNode;
        if(row){
          const fixedTds = row.querySelectorAll('td');
          if(sub.includes('inter')){
             fixedTds[2].textContent=savedD.transientNos; fixedTds[3].textContent=savedD.transientMin;
             fixedTds[4].textContent=savedD.sustainedNos; fixedTds[5].textContent=savedD.sustainedMin;
             fixedTds[6].textContent=savedD.plannedNos; fixedTds[7].textContent=savedD.plannedMin;
             fixedTds[8].textContent=savedD.emergencyNos; fixedTds[9].textContent=savedD.emergencyMin;
          } else if (sub.includes('meter')){
            fixedTds[2].textContent=savedD.start; fixedTds[3].textContent=savedD.end;
          } else if (sub.includes('peak')){
            fixedTds[2].textContent=savedD.peak; fixedTds[3].textContent=savedD.date; fixedTds[4].textContent=savedD.time;
          } else if (sub.includes('vm')){
            fixedTds[2].textContent=savedD.max; fixedTds[3].textContent=savedD.maxDate; fixedTds[4].textContent=savedD.maxTime;
            fixedTds[5].textContent=savedD.min; fixedTds[6].textContent=savedD.minDate; fixedTds[7].textContent=savedD.minTime;
          }
          if(sub.includes('inter')) yearlyInterRecalcRow(row);
          if(sub.includes('meter')) yearlyMeterRecalcRow(row);
        }
      }
    });

    // Update notes and signature
    const noteRow = tableBody.parentNode.querySelector('.note-row td');
    if(noteRow) noteRow.textContent = data.notes;
    
    updateSignatures(sub, data.who, data.timestamp);
    toast(`Draft loaded for ${sub} (${isYearly?'Yearly':'Monthly'})`);
    markSaved(sub);
  } else {
    // If no draft, ensure fresh start
    initTable(tableBody, defaultData, createRowFn);
    const noteRow = tableBody.parentNode.querySelector('.note-row td');
    if(noteRow) noteRow.textContent = 'Special Notes: ';
    updateSignatures(sub);
  }
  // Re-calculate all to update computed columns
  if(sub==='interruption') interRecalc();
  if(sub==='meter') meterRecalc();
  if(sub==='y-inter') yearlyInterRecalc();
  if(sub==='y-meter') yearlyMeterRecalc();
}

function loadDraftsIfAny(){
  loadData('interruption', interBody, createInterRow, defaultInterFeeders);
  loadData('meter', meterBody, createMeterRow, defaultMeterFeeders);
  loadData('peak', peakBody, createPeakRow, defaultPeakFeeders);
  loadData('vminmax', vmBody, createVMRow, yearlyVMDefaultFeeders);
  loadData('equip', equipBody, createEquipRow, []);
  
  // Load initial yearly data
  loadData('y-inter', yearlyInterBody, createYearlyInterRow, defaultInterFeeders, true);
  loadData('y-meter', yearlyMeterBody, createYearlyMeterRow, defaultMeterFeeders, true);
  loadData('y-peak', yearlyPeakBody, createPeakRow, defaultPeakFeeders, true);
  loadData('y-vminmax', yearlyVmBody, createVMRow, yearlyVMDefaultFeeders, true);
}

// Bind save draft buttons
$('inter-save').addEventListener('click', ()=> saveData('interruption'));
$('meter-save').addEventListener('click', ()=> saveData('meter'));
$('peak-save').addEventListener('click', ()=> saveData('peak'));
$('vm-save').addEventListener('click', ()=> saveData('vminmax'));
$('y-inter-save').addEventListener('click', ()=> saveData('y-inter', true));
$('y-meter-save').addEventListener('click', ()=> saveData('y-meter', true));
$('y-peak-save').addEventListener('click', ()=> saveData('y-peak', true));
$('y-vm-save').addEventListener('click', ()=> saveData('y-vminmax', true));
// Bind to period change
$('period-start').addEventListener('change', ()=> loadDraftsIfAny());
$('period-end').addEventListener('change', ()=> loadDraftsIfAny());
$('year-select').addEventListener('change', ()=> loadDraftsIfAny());


/* ===== Save/Unsaved State Management ===== */
function markUnsaved(sub){
  document.querySelector(`#${sub} [id="${sub}-save"]`).classList.add('btn-primary');
  document.querySelector(`#${sub} [id="${sub}-save"]`).classList.remove('btn-ghost');
}
function markSaved(sub){
  document.querySelector(`#${sub} [id="${sub}-save"]`).classList.add('btn-ghost');
  document.querySelector(`#${sub} [id="${sub}-save"]`).classList.remove('btn-primary');
}
function markUnsavedAll(){
  ['interruption','meter','peak','vminmax'].forEach(markUnsaved);
}
function markUnsavedYearly(sub){
  document.querySelector(`#yearly [id="${sub}-save"]`).classList.add('btn-primary');
  document.querySelector(`#yearly [id="${sub}-save"]`).classList.remove('btn-ghost');
}
function markSavedYearly(sub){
  document.querySelector(`#yearly [id="${sub}-save"]`).classList.add('btn-ghost');
  document.querySelector(`#yearly [id="${sub}-save"]`).classList.remove('btn-primary');
}

/* ===== Export Logic (XLSX, PDF) ===== */
function tableToAOA(table, title, notes){
  const aoa = [];
  const header = [...table.querySelector('thead tr').children].slice(0, -1).map(th => th.textContent.trim());
  aoa.push([title]);
  aoa.push(header);
  
  const bodyRows = table.querySelectorAll('tbody tr');
  bodyRows.forEach(tr=>{
    const row = [...tr.children].slice(0, -1).map((td,i)=>{
      if(td.classList.contains('remark-text')) return td.textContent.trim();
      return td.textContent.trim();
    });
    aoa.push(row);
  });
  
  aoa.push([]); // Spacer
  aoa.push(['Notes: ' + notes]);
  return aoa;
}
function sheetsFromTables(tableData){
  const sheets = {};
  tableData.forEach(item=>{
    const table = item.table;
    const aoa = [];
    
    // Title
    aoa.push([item.title]);
    aoa.push([]);
    
    // Header
    const headerRow = [...table.querySelector('thead tr').children].slice(0, -1).map(th => th.textContent.trim());
    aoa.push(headerRow);
    
    // Body
    const bodyRows = table.querySelectorAll('tbody tr');
    bodyRows.forEach(tr=>{
      const row = [...tr.children].slice(0, -1).map(td => td.textContent.trim());
      aoa.push(row);
    });
    
    aoa.push([]); // Spacer
    aoa.push(['Special Notes: ' + item.notes]);
    aoa.push(['Generated By: ' + item.who]);
    aoa.push(['Timestamp: ' + item.timestamp]);
    
    sheets[item.sheetName] = XLSX.utils.aoa_to_sheet(aoa);
  });
  return sheets;
}

function exportXLSX(data){
  const wb = XLSX.utils.book_new();
  const sheets = sheetsFromTables(data);
  Object.keys(sheets).forEach(name => {
    XLSX.utils.book_append_sheet(wb, sheets[name], name);
  });
  const filename = data[0].period.replace(/[^a-zA-Z0-9]/g, '_') + '.xlsx';
  XLSX.writeFile(wb, filename);
  toast(`Exported ${data.length} sheets to ${filename}`);
}

function exportPDF(data, title){
  const content = document.createElement('div');
  content.style.maxWidth = '1100px';
  content.style.margin = '0 auto';
  content.style.padding = '10px';
  
  data.forEach(item=>{
    const div = document.createElement('div');
    div.classList.add('card', 'pdf-export-page');
    div.style.pageBreakAfter = 'always';
    
    const header = document.createElement('div');
    header.className = 'export-header';
    header.innerHTML = `Report: ${item.title} (${item.period})`;
    div.appendChild(header);

    const tableClone = item.table.cloneNode(true);
    tableClone.querySelector('thead th:last-child').remove(); // Remove empty header trash column
    tableClone.querySelectorAll('tbody tr').forEach(tr=>{
      if(tr.lastElementChild) tr.lastElementChild.remove(); // Remove trash button column
    });
    
    div.appendChild(tableClone.parentNode.cloneNode(true));
    
    const note = document.createElement('div');
    note.textContent = 'Special Notes: ' + item.notes;
    note.style.fontStyle = 'italic';
    note.style.marginTop = '10px';
    div.appendChild(note);

    const signature = document.createElement('div');
    signature.innerHTML = `<strong>Generated By:</strong> ${item.who} <br/> <strong>Timestamp:</strong> ${item.timestamp}`;
    signature.style.marginTop = '10px';
    signature.style.fontSize = '12px';
    div.appendChild(signature);

    content.appendChild(div);
  });
  
  // Call html2pdf
  html2pdf().from(content).set({
    margin: 10,
    filename: title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  }).save();
  
  toast(`Exporting ${title} as PDF...`);
}

function gatherData(sub, isYearly=false){
  const period = isYearly ? $('year-select').value : `${$('period-start').value} to ${$('period-end').value}`;
  const data = isYearly ? [
    { id:'y-inter', sheetName:'Yearly-Interruption', title:'Yearly — Interruption Report', table:$('table-yearly-inter'), defaultData:defaultInterFeeders },
    { id:'y-meter', sheetName:'Yearly-Secure-Meter', title:'Yearly — Secure Meter Reading', table:$('table-yearly-meter'), defaultData:defaultMeterFeeders },
    { id:'y-peak', sheetName:'Yearly-Peak-Load', title:'Yearly — Peak Load (A)', table:$('table-yearly-peak'), defaultData:defaultPeakFeeders },
    { id:'y-vminmax', sheetName:'Yearly-VM', title:'Yearly — Max & Min Voltage', table:$('table-yearly-vm'), defaultData:yearlyVMDefaultFeeders }
  ] : [
    { id:'interruption', sheetName:'Monthly-Interruption', title:'Monthly Interruption Report', table:$('table-inter'), defaultData:defaultInterFeeders },
    { id:'meter', sheetName:'Monthly-Secure-Meter', title:'Monthly Secure Meter Reading', table:$('table-meter'), defaultData:defaultMeterFeeders },
    { id:'peak', sheetName:'Monthly-Peak-Load', title:'Monthly Peak Load (A)', table:$('table-peak'), defaultData:defaultPeakFeeders },
    { id:'vminmax', sheetName:'Monthly-VM', title:'Monthly Max & Min Voltage', table:$('table-vm'), defaultData:yearlyVMDefaultFeeders }
  ];
  
  if(sub){ // Single sub-tab export
    const item = data.find(d=>d.id===sub);
    const tableBody = item.table.querySelector('tbody');
    const saveData = getData(tableBody, isYearly);
    return [{
      ...item,
      period,
      notes: saveData.notes,
      who: saveData.who,
      timestamp: saveData.timestamp
    }];
  } else { // Save All export
    return data.map(item=>{
      const tableBody = item.table.querySelector('tbody');
      const saveData = getData(tableBody, isYearly);
      return {
        ...item,
        period,
        notes: saveData.notes,
        who: saveData.who,
        timestamp: saveData.timestamp
      };
    });
  }
}

// Single Sub-tab Save Toggle
document.querySelectorAll('.sub-save-toggle').forEach(btn=>btn.addEventListener('click', (e)=>{
  e.stopPropagation();
  const opts = e.target.nextElementSibling;
  document.querySelectorAll('.save-options').forEach(o=>{ if(o !== opts) o.style.display='none'; });
  opts.style.display = opts.style.display==='block' ? 'none' : 'block';
}));
document.querySelectorAll('.y-sub-save-toggle').forEach(btn=>btn.addEventListener('click', (e)=>{
  e.stopPropagation();
  const opts = e.target.nextElementSibling;
  document.querySelectorAll('.save-options').forEach(o=>{ if(o !== opts) o.style.display='none'; });
  opts.style.display = opts.style.display==='block' ? 'none' : 'block';
}));
// Single Sub-tab Save Options
document.querySelectorAll('.sub-save-options button, .y-sub-save-options button').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const sub = btn.dataset.sub;
    const mode = btn.dataset.save;
    const isYearly = sub.startsWith('y-');
    const data = gatherData(sub, isYearly);
    const title = data[0].title + ' Report ' + data[0].period;
    
    if(mode==='pdf' || mode==='all'){ exportPDF(data, title); }
    if(mode==='xlsx' || mode==='all'){ exportXLSX(data); }
    e.target.parentNode.style.display='none'; // hide menu
  });
});

// Save All Toggle (already handled at the top, putting logic here for clarity)
if ($('save-all-btn')) {
  $('save-all-btn').addEventListener('click', (e)=>{
    e.stopPropagation();
    const opts = $('save-all-options');
    document.querySelectorAll('.save-options').forEach(o=>{ if(o !== opts) o.style.display='none'; });
    opts.style.display = opts.style.display==='block' ? 'none' : 'block';
  });
}
if ($('save-yearly-all-btn')) {
  $('save-yearly-all-btn').addEventListener('click', (e)=>{
    e.stopPropagation();
    const opts = $('save-yearly-all-options');
    document.querySelectorAll('.save-options').forEach(o=>{ if(o !== opts) o.style.display='none'; });
    opts.style.display = opts.style.display==='block' ? 'none' : 'block';
  });
}

// Save All Options
$('save-all-options').querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const mode = btn.dataset.mode;
    const data = gatherData(null, false);
    const title = 'Monthly System Reports ' + data[0].period;
    if(mode==='pdf' || mode==='all'){ exportPDF(data, title); }
    if(mode==='xlsx' || mode==='all'){ exportXLSX(data); }
    e.target.parentNode.style.display='none'; // hide menu
  });
});
$('save-yearly-all-options').querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const mode = btn.dataset.mode;
    const data = gatherData(null, true);
    const title = 'Yearly System Reports ' + data[0].period;
    if(mode==='pdf' || mode==='all'){ exportPDF(data, title); }
    if(mode==='xlsx' || mode==='all'){ exportXLSX(data); }
    e.target.parentNode.style.display='none'; // hide menu
  });
});


/* ===== Signature / Footer Logic ===== */
function updateSignatures(sub=null, who='Unsaved Draft', timestamp=nowStamp()){
  const subs = sub ? [sub] : ['interruption','meter','peak','vminmax','y-inter','y-meter','y-peak','y-vminmax'];
  
  subs.forEach(s=>{
    const el = $(`${s.replace('y-','')}-note`);
    if(!el) return;
    
    const isYearly = s.startsWith('y-');
    const tableBody = isYearly ? document.querySelector(`#table-yearly-${s.replace('y-','')} tbody`) : document.querySelector(`#table-${s} tbody`);
    if(!tableBody) return;
    
    const period = isYearly ? $('year-select').value : `${$('period-start').value} to ${$('period-end').value}`;
    
    // Check local storage for the saved draft for the current period/year
    const key = isYearly ? `yearly_${s}_${$('year-select').value}` : `draft_${s}_${$('period-start').value}_${$('period-end').value}`;
    const draft = localStorage.getItem(key);
    
    let displayWho = who;
    let displayTimestamp = timestamp;
    
    if(draft){
      const savedData = JSON.parse(draft);
      displayWho = savedData.who;
      displayTimestamp = savedData.timestamp;
    } else {
      displayWho = 'Unsaved Draft';
      displayTimestamp = nowStamp();
    }
    
    el.innerHTML = `Report Generated by <strong>${displayWho}</strong> on <strong>${displayTimestamp}</strong> for period ${period}.`;
  });
  
  // Update last login banner on main app
  if(currentUser) $('last-login').textContent=`Logged in as ${currentUser.role==='admin' ? currentUser.email : currentUser.name} | Last updated: ${localStorage.getItem('last-update')||'Never'}`;
}

function updateLastLogin(){
  localStorage.setItem('last-update', nowStamp());
  if(currentUser) $('last-login').textContent=`Logged in as ${currentUser.role==='admin' ? currentUser.email : currentUser.name} | Last updated: ${localStorage.getItem('last-update')}`;
}


/* ===== Yearly Sync Logic (Recalculate Yearly from Monthly data) ===== */
function populateYearSelect(){
  const currentYear = new Date().getFullYear();
  const select = $('year-select');
  select.innerHTML = '';
  for(let i=currentYear-3; i<=currentYear+1; i++){
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    if(i===currentYear) opt.selected = true;
    select.appendChild(opt);
  }
}

function setupAutoYearlySync(){
  // Binds the sync trigger to all editable cells in monthly reports
  document.querySelectorAll('#monthly .subpanel table td[contenteditable="true"]').forEach(td=>{
    td.addEventListener('input', triggerYearlySync);
  });
  
  // Binds the recalculate button
  $('yearly-recalc').addEventListener('click', triggerYearlySync);
}

// Global flag to prevent re-running the sync too quickly
let syncTimeout = null;
function triggerYearlySync(){
  if(syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(yearlyRecalculateAndSave, 1000);
}

function yearlyRecalculateAndSave(){
  // Only proceed if Monthly tab is active, or if explicitly triggered
  if($('monthly').style.display !== 'block' && event?.target?.id !== 'yearly-recalc') return;

  const year = $('year-select').value;
  if(!year) return;
  
  const allMonthlyData = {};
  
  // 1. GATHER ALL MONTHLY DATA FOR THE SELECTED YEAR
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();

  for(let m=0; m<12; m++){
    const monthYear = (new Date(year, m, 1)).getFullYear();
    if(monthYear > currentYear || (monthYear == currentYear && m > currentMonth)){
      // Skip future months
      continue;
    }
    
    const start = new Date(year, m, 1);
    const end = new Date(year, m+1, 0);
    const periodKey = `draft_interruption_${formatYMD(start.getFullYear(), start.getMonth()+1, start.getDate())}_${formatYMD(end.getFullYear(), end.getMonth()+1, end.getDate())}`;
    
    const draft = localStorage.getItem(periodKey);
    if(draft){
      const data = JSON.parse(draft);
      data.data.forEach(row=>{
        if(!allMonthlyData[row.feeder]) allMonthlyData[row.feeder] = { inter: [], meter: [] };
        allMonthlyData[row.feeder].inter.push(row);
      });
    }
    
    const meterPeriodKey = `draft_meter_${formatYMD(start.getFullYear(), start.getMonth()+1, start.getDate())}_${formatYMD(end.getFullYear(), end.getMonth()+1, end.getDate())}`;
    const meterDraft = localStorage.getItem(meterPeriodKey);
    if(meterDraft){
      const data = JSON.parse(meterDraft);
      data.data.forEach(row=>{
        if(!allMonthlyData[row.feeder]) allMonthlyData[row.feeder] = { inter: [], meter: [] };
        allMonthlyData[row.feeder].meter.push(row);
      });
    }
  }

  // 2. PROCESS AND UPDATE YEARLY INTERRUPTIONS
  const yearlyInterData = [];
  defaultInterFeeders.forEach(defaultF=>{
    let totalTransientNos=0, totalTransientMin=0;
    let totalSustainedNos=0, totalSustainedMin=0;
    let totalPlannedNos=0, totalPlannedMin=0;
    let totalEmergencyNos=0, totalEmergencyMin=0;
    
    if(allMonthlyData[defaultF.feeder]){
      allMonthlyData[defaultF.feeder].inter.forEach(mR=>{
        totalTransientNos += parseInt(mR.transientNos) || 0;
        totalTransientMin += parseFloat(mR.transientMin) || 0;
        totalSustainedNos += parseInt(mR.sustainedNos) || 0;
        totalSustainedMin += parseFloat(mR.sustainedMin) || 0;
        totalPlannedNos += parseInt(mR.plannedNos) || 0;
        totalPlannedMin += parseFloat(mR.plannedMin) || 0;
        totalEmergencyNos += parseInt(mR.emergencyNos) || 0;
        totalEmergencyMin += parseFloat(mR.emergencyMin) || 0;
      });
    }
    
    yearlyInterData.push({
      sl: defaultF.sl,
      feeder: defaultF.feeder,
      transientNos: totalTransientNos, transientMin: totalTransientMin,
      sustainedNos: totalSustainedNos, sustainedMin: totalSustainedMin,
      plannedNos: totalPlannedNos, plannedMin: totalPlannedMin,
      emergencyNos: totalEmergencyNos, emergencyMin: totalEmergencyMin
    });
  });
  
  // Clear and repopulate yearly inter table
  initTable(yearlyInterBody, [], createYearlyInterRow, false); // Clear all
  yearlyInterData.forEach(d => yearlyInterBody.appendChild(createYearlyInterRow(d, true)));
  yearlyInterRecalc();
  saveData('y-inter', true);
  
  // 3. PROCESS AND UPDATE YEARLY METER
  const yearlyMeterData = [];
  defaultMeterFeeders.forEach(defaultF=>{
    let firstStart = null;
    let lastEnd = null;
    let mf = defaultF.mf; // Use default MF
    
    if(allMonthlyData[defaultF.feeder]){
      // Sort by month (implied by periodKey, but safer to use the key format)
      const sortedMeterData = allMonthlyData[defaultF.feeder].meter.sort((a,b)=>{
        const keyA = a.period.split('_')[0]; // start date
        const keyB = b.period.split('_')[0]; // start date
        return new Date(keyA) - new Date(keyB);
      });
      
      if(sortedMeterData.length > 0){
        // First reading (Start) of the first month with an entry
        firstStart = sortedMeterData[0].start;
        // Last reading (End) of the last month with an entry
        lastEnd = sortedMeterData[sortedMeterData.length - 1].end;
      }
    }
    
    if(mf !== '-'){
      yearlyMeterData.push({
        sl: defaultF.sl,
        feeder: defaultF.feeder,
        start: firstStart || 0,
        end: lastEnd || 0,
        mf: mf
      });
    } else {
      yearlyMeterData.push({
        sl: defaultF.sl,
        feeder: defaultF.feeder,
        start: firstStart || '',
        end: lastEnd || '',
        mf: mf
      });
    }
  });

  // Clear and repopulate yearly meter table
  initTable(yearlyMeterBody, [], createYearlyMeterRow, false);
  yearlyMeterData.forEach(d => yearlyMeterBody.appendChild(createYearlyMeterRow(d, true)));
  yearlyMeterRecalc();
  saveData('y-meter', true);
  
  toast(`Yearly data for ${year} recalculated and saved.`);
}

/* ===== Initial Setup ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  // Add proper toggle logic for the CDN scripts (redundant but safe to ensure it runs)
  if ($('save-all-btn')) {
    $('save-all-btn').addEventListener('click', (e)=>{
      e.stopPropagation();
      const opts = $('save-all-options');
      document.querySelectorAll('.save-options').forEach(o=>{ if(o !== opts) o.style.display='none'; });
      opts.style.display = opts.style.display==='block' ? 'none' : 'block';
    });
  }
  if ($('save-yearly-all-btn')) {
    $('save-yearly-all-btn').addEventListener('click', (e)=>{
      e.stopPropagation();
      const opts = $('save-yearly-all-options');
      document.querySelectorAll('.save-options').forEach(o=>{ if(o !== opts) o.style.display='none'; });
      opts.style.display = opts.style.display==='block' ? 'none' : 'block';
    });
  }

  // Hide save options when clicking anywhere else
  document.addEventListener('click', ()=>{
    document.querySelectorAll('.save-options').forEach(o=>o.style.display='none');
  });

  // Initial table setup (will be run again in afterLogin)
  initAllTables();
});
