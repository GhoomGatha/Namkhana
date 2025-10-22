
/* ===== FIX: Proper toggle for Save All buttons ===== */
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




/* ===== FIX: Proper toggle for Save All buttons ===== */
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

/* ===== Yearly Interruption & Yearly Meter row creators ===== */
function createYearlyInterRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const keys=['transientNos','transientMin','sustainedNos','sustainedMin','plannedNos','plannedMin','emergencyNos','emergencyMin'];
  keys.forEach(k=>{ const td=document.createElement('td'); td.contentEditable=true; td.textContent = d[k]!==undefined? d[k] : ''; td.addEventListener('input', ()=>{ yearlyInterRecalc(); }); tr.appendChild(td); });
  const tdTot=document.createElement('td'); tdTot.className='total-outage calc locked'; tdTot.contentEditable=false; tdTot.textContent = d.total||''; tr.appendChild(tdTot);
  const tdAvail=document.createElement('td'); tdAvail.className='availability calc locked'; tdAvail.contentEditable=false; tdAvail.textContent = d.avail||''; tr.appendChild(tdAvail);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  return tr;
}

function createYearlyMeterRow(d={}, fixed=false){
  const tr=document.createElement('tr');
  if(fixed) tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; if(fixed) tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = !fixed; if(fixed){ tdF.contentEditable=false; tdF.style.fontWeight='700'; } tr.appendChild(tdF);
  const tdStart=document.createElement('td'); tdStart.className='start'; tdStart.contentEditable=true; tdStart.textContent = d.start||''; tdStart.addEventListener('input', ()=>{ yearlyMeterRecalc(); }); tr.appendChild(tdStart);
  const tdEnd=document.createElement('td'); tdEnd.className='end'; tdEnd.contentEditable=true; tdEnd.textContent = d.end||''; tdEnd.addEventListener('input', ()=>{ yearlyMeterRecalc(); }); tr.appendChild(tdEnd);
  const tdAdv=document.createElement('td'); tdAdv.className='advance calc locked'; tdAdv.contentEditable=false; tdAdv.textContent = d.advance||''; tr.appendChild(tdAdv);
  const tdMf=document.createElement('td'); tdMf.className='mf'; tdMf.contentEditable=false; tdMf.textContent = d.mf||''; tdMf.style.fontWeight='700'; tr.appendChild(tdMf);
  const tdTotal=document.createElement('td'); tdTotal.className='totalunit calc locked'; tdTotal.contentEditable=false; tdTotal.textContent = d.total||''; tr.appendChild(tdTotal);
  tr.appendChild(makeRemarkTD(d.remarks||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  if(!fixed) makeRowTrashButton(tr);
  return tr;
}

/* ===== Yearly recalculations ===== */
function yearlyInterRecalc(){
  // Determine target year from the Year selector; fallback to period-start year
  let ySel = document.getElementById('year-select');
  let y = ySel && ySel.value ? Number(ySel.value) : (function(){
    const ps = document.getElementById('period-start');
    if(ps && ps.value){ try{ return new Date(ps.value).getFullYear(); }catch(e){} }
    return new Date().getFullYear();
  })();
  const isLeap = (y % 4 === 0) && (y % 100 !== 0 || y % 400 === 0);
  const totalMinsYear = (isLeap ? 366 : 365) * 24 * 60;

  document.querySelectorAll('#table-yearly-inter tbody tr').forEach(tr=>{
    const transientMin = Number(tr.children[3].textContent || 0);
    const sustainedMin  = Number(tr.children[5].textContent || 0);
    const plannedMin    = Number(tr.children[7].textContent || 0);
    const emergencyMin  = Number(tr.children[9].textContent || 0);
    const rowSum = transientMin + sustainedMin + plannedMin + emergencyMin;
    const totCell = tr.querySelector('.total-outage');
    if(!totCell.dataset.overridden) totCell.textContent = fmtNumberRaw(rowSum);
    const availCell = tr.querySelector('.availability');
    const avail = ((totalMinsYear - Number(totCell.textContent||0)) / totalMinsYear) * 100;
    if(!availCell.dataset.overridden) availCell.textContent = isFinite(avail) ? fmtNumberRaw(avail)+'%' : '';
  });
}

function yearlyMeterRecalc(){
  document.querySelectorAll('#table-yearly-meter tbody tr').forEach(tr=>{
    const start = Number(tr.querySelector('.start') ? tr.querySelector('.start').textContent : 0);
    const end = Number(tr.querySelector('.end') ? tr.querySelector('.end').textContent : 0);
    const mfRaw = tr.querySelector('.mf') ? tr.querySelector('.mf').textContent.trim() : '';
    const mf = (mfRaw === '-' || mfRaw === '' || isNaN(Number(mfRaw))) ? NaN : Number(mfRaw);
    const adv = end - start;
    const advCell = tr.querySelector('.advance');
    const totCell = tr.querySelector('.totalunit');
    if(advCell && !advCell.dataset.overridden) advCell.textContent = fmtNumberRaw(adv);
    if(totCell && !totCell.dataset.overridden) totCell.textContent = isNaN(mf) ? '' : fmtNumberRaw(adv * mf);
  });
}

/* ===== Gather monthly interruption & meter rows for yearly aggregation ===== */
function gatherMonthlyInterruptionRows(){
  const rows = [];
  interBody.querySelectorAll('tr').forEach(tr=>{
    const feeder = tr.children[1].textContent.trim();
    const transientNos = Number(tr.children[2].textContent.trim() || 0);
    const transientMin = Number(tr.children[3].textContent.trim() || 0);
    const sustainedNos = Number(tr.children[4].textContent.trim() || 0);
    const sustainedMin = Number(tr.children[5].textContent.trim() || 0);
    const plannedNos = Number(tr.children[6].textContent.trim() || 0);
    const plannedMin = Number(tr.children[7].textContent.trim() || 0);
    const emergencyNos = Number(tr.children[8].textContent.trim() || 0);
    const emergencyMin = Number(tr.children[9].textContent.trim() || 0);
    if(feeder) rows.push({feeder, transientNos, transientMin, sustainedNos, sustainedMin, plannedNos, plannedMin, emergencyNos, emergencyMin});
  });
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith('namkhana_interruption_')){
      try{
        const payload = JSON.parse(localStorage.getItem(k));
        payload.rows.forEach(r=>{
          const feeder = r[1];
          if(!feeder) return;
          rows.push({
            feeder,
            transientNos: Number(r[2])||0,
            transientMin: Number(r[3])||0,
            sustainedNos: Number(r[4])||0,
            sustainedMin: Number(r[5])||0,
            plannedNos: Number(r[6])||0,
            plannedMin: Number(r[7])||0,
            emergencyNos: Number(r[8])||0,
            emergencyMin: Number(r[9])||0
          });
        });
      }catch(e){}
    }
  });
  return rows;
}

function gatherMonthlyMeterRowsForYearly(){
  const rows = [];
  meterBody.querySelectorAll('tr').forEach(tr=>{
    const feeder = tr.children[1].textContent.trim();
    const start = Number(tr.children[2].textContent.trim() || 0);
    const end = Number(tr.children[3].textContent.trim() || 0);
    const totalunit = Number(tr.children[6].textContent.trim() || 0);
    const mf = tr.children[5].textContent.trim();
    if(feeder) rows.push({feeder, start, end, totalunit, mf});
  });
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith('namkhana_meter_')){
      try{
        const payload = JSON.parse(localStorage.getItem(k));
        payload.rows.forEach(r=>{
          const feeder = r[1]; if(!feeder) return;
          const start = Number(r[2])||0;
          const end = Number(r[3])||0;
          const totalunit = Number(r[6])||0;
          const mf = r[5]||'';
          rows.push({feeder, start, end, totalunit, mf});
        });
      }catch(e){}
    }
  });
  return rows;
}

/* ===== Fill yearly tables from monthly aggregates ===== */
function fillYearlyFromMonthly(){
  const interRows = gatherMonthlyInterruptionRows();
  const grouped = {};
  interRows.forEach(r=>{
    const key = r.feeder;
    if(!grouped[key]) grouped[key] = {transientNos:0, transientMin:0, sustainedNos:0, sustainedMin:0, plannedNos:0, plannedMin:0, emergencyNos:0, emergencyMin:0};
    grouped[key].transientNos += r.transientNos||0;
    grouped[key].transientMin += r.transientMin||0;
    grouped[key].sustainedNos += r.sustainedNos||0;
    grouped[key].sustainedMin += r.sustainedMin||0;
    grouped[key].plannedNos += r.plannedNos||0;
    grouped[key].plannedMin += r.plannedMin||0;
    grouped[key].emergencyNos += r.emergencyNos||0;
    grouped[key].emergencyMin += r.emergencyMin||0;
  });
  const yInterBody = document.querySelector('#table-yearly-inter tbody');
  yInterBody.innerHTML = '';
  const feederList = defaultInterFeeders.map(f=>f.feeder);
  let idx=1;
  feederList.forEach(feeder=>{
    const g = grouped[feeder] || {};
    yInterBody.appendChild(createYearlyInterRow({
      sl: idx++,
      feeder,
      transientNos: g.transientNos||0,
      transientMin: g.transientMin||0,
      sustainedNos: g.sustainedNos||0,
      sustainedMin: g.sustainedMin||0,
      plannedNos: g.plannedNos||0,
      plannedMin: g.plannedMin||0,
      emergencyNos: g.emergencyNos||0,
      emergencyMin: g.emergencyMin||0
    }, true));
  });

  const meterRows = gatherMonthlyMeterRowsForYearly();
  const latestByFeeder = {};
  meterRows.forEach(r=>{
    const key = r.feeder;
    if(!latestByFeeder[key]) latestByFeeder[key] = r;
    else {
      if(r.end > latestByFeeder[key].end) latestByFeeder[key] = r;
    }
  });
  const yMeterBody = document.querySelector('#table-yearly-meter tbody');
  yMeterBody.innerHTML = '';
  const meterList = defaultMeterFeeders.map(f=>f.feeder);
  let midx=1;
  meterList.forEach(feeder=>{
    const data = latestByFeeder[feeder] || {};
    yMeterBody.appendChild(createYearlyMeterRow({
      sl: midx++,
      feeder,
      start: data.start || '',
      end: data.end || '',
      mf: (data.mf !== undefined) ? data.mf : ( (defaultMeterFeeders.find(x=>x.feeder===feeder)||{}).mf || '' ),
      total: data.totalunit || ''
    }, true));
  });

  yearlyInterRecalc();
  yearlyMeterRecalc();
}

/* ===== Wire yearly add/clear/save buttons and auto-sync ===== */
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('y-inter-add').addEventListener('click', ()=>{ document.querySelector('#table-yearly-inter tbody').appendChild(createYearlyInterRow({sl: nextManualIndex(document.querySelector('#table-yearly-inter tbody'))}, false)); });
  document.getElementById('y-inter-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Yearly Interruption (keeps Sl. No. and Feeder)?')){ clearOperatorOnly(document.querySelector('#table-yearly-inter tbody'),'table-yearly-inter'); yearlyInterRecalc(); toast('Yearly Interruption cleared'); }});
  document.getElementById('y-inter-save').addEventListener('click', ()=> saveDraftGeneric('yearly_interruption', document.querySelector('#table-yearly-inter tbody')));

  document.getElementById('y-meter-add').addEventListener('click', ()=>{ document.querySelector('#table-yearly-meter tbody').appendChild(createYearlyMeterRow({sl: nextManualIndex(document.querySelector('#table-yearly-meter tbody'))}, false)); });
  document.getElementById('y-meter-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Yearly Meter (keeps Sl. No., Feeder and M.F.)?')){ clearOperatorOnly(document.querySelector('#table-yearly-meter tbody'),'table-yearly-meter'); yearlyMeterRecalc(); toast('Yearly Meter cleared'); }});
  document.getElementById('y-meter-save').addEventListener('click', ()=> saveDraftGeneric('yearly_meter', document.querySelector('#table-yearly-meter tbody')));

  fillYearlyFromMonthly();
});

/* ===== numbering helper ===== */
function nextManualIndex(tbody){
  const rows = Array.from(tbody.querySelectorAll('tr'));
  let max = 0;
  rows.forEach(tr=>{
    const v = parseInt(tr.children[0].textContent);
    if(!isNaN(v) && v > max) max = v;
  });
  return max + 1;
}

/* ===== initialize tables ===== */
function initAllTables(){
  interBody.innerHTML=''; meterBody.innerHTML=''; peakBody.innerHTML=''; vmBody.innerHTML=''; equipBody.innerHTML='';
  defaultInterFeeders.forEach(f => interBody.appendChild(createInterRowLocked({sl:f.sl, feeder:f.feeder})));
  defaultMeterFeeders.forEach(f => meterBody.appendChild(createMeterRowLocked({sl:f.sl, feeder:f.feeder, mf:f.mf})));
  defaultPeakFeeders.forEach(f => peakBody.appendChild(createPeakRow({sl:f.sl, feeder:f.feeder}, true)));
  // Monthly VM default (reset proper numbering)
const skipList = [1,2,3,8];
let vmIndex = 1;
defaultPeakFeeders.forEach(f => { 
  if (skipList.includes(f.sl)) return; 
  vmBody.appendChild(createVMRow({ sl: vmIndex++, feeder: f.feeder }, true)); 
});

  // Yearly defaults:
  yearlyPeakBody.innerHTML=''; yearlyVmBody.innerHTML='';
  defaultMeterFeeders.forEach(f => yearlyPeakBody.appendChild(createPeakRow({sl:f.sl, feeder:f.feeder}, true)));
  yearlyVMDefaultFeeders.forEach((f, idx) => yearlyVmBody.appendChild(createVMRow({sl: idx+1, feeder: f.feeder}, true)));

  interRecalc(); meterRecalc(); yearlyRecalc();
}

/* ===== locked-monthly helper functions (preserve baseline) ===== */
function createInterRowLocked(d){
  const tr=document.createElement('tr'); tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable=false; tdF.style.fontWeight='700'; tr.appendChild(tdF);
  const keys=['transientNos','transientMin','sustainedNos','sustainedMin','plannedNos','plannedMin','emergencyNos','emergencyMin'];
  keys.forEach(k=>{
    const td=document.createElement('td'); td.contentEditable=true; td.textContent = d[k] !== undefined ? d[k] : ''; td.addEventListener('input', ()=>{ interRecalc(); triggerYearlySync(); });
    tr.appendChild(td);
  });
  const tdTot=document.createElement('td'); tdTot.className='total-outage calc locked'; tdTot.contentEditable=false; tdTot.textContent = ''; tr.appendChild(tdTot);
  const tdAvail=document.createElement('td'); tdAvail.className='availability calc locked'; tdAvail.contentEditable=false; tdAvail.textContent = ''; tr.appendChild(tdAvail);
  tr.appendChild(makeRemarkTD(''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  return tr;
}
function createMeterRowLocked(d){
  const tr=document.createElement('tr'); tr.setAttribute('data-fixed','true');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; tdSl.style.fontWeight='700'; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable=false; tdF.style.fontWeight='700'; tr.appendChild(tdF);
  const tdStart=document.createElement('td'); tdStart.className='start'; tdStart.contentEditable=true; tdStart.textContent = ''; tdStart.addEventListener('input', ()=>{ meterRecalc(); triggerYearlySync(); }); tr.appendChild(tdStart);
  const tdEnd=document.createElement('td'); tdEnd.className='end'; tdEnd.contentEditable=true; tdEnd.textContent = ''; tdEnd.addEventListener('input', ()=>{ meterRecalc(); triggerYearlySync(); }); tr.appendChild(tdEnd);
  const tdAdv=document.createElement('td'); tdAdv.className='advance calc locked'; tdAdv.contentEditable=false; tdAdv.textContent = ''; tr.appendChild(tdAdv);
  const tdMf=document.createElement('td'); tdMf.className='mf'; tdMf.contentEditable=false; tdMf.textContent = d.mf||''; tdMf.style.fontWeight='700'; tr.appendChild(tdMf);
  const tdTotal=document.createElement('td'); tdTotal.className='totalunit calc locked'; tdTotal.contentEditable=false; tdTotal.textContent = ''; tr.appendChild(tdTotal);
  tr.appendChild(makeRemarkTD(''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  return tr;
}

/* ===== calculations ===== */
function fmtNumberRaw(n){
  if(n === '' || n === null || isNaN(Number(n))) return '';
  const num = Number(n);
  const s3 = num.toFixed(3);
  if(s3.endsWith('.000')) return String(Math.trunc(num));
  return s3.replace(/\.?0+$/,'');
}
function periodMinutes(){
  const s = new Date($('period-start').value + 'T00:00:00');
  const e = new Date($('period-end').value + 'T23:59:59');
  const mins = Math.round((e - s) / 60000) + 1;
  return mins > 0 ? mins : 30*24*60;
}
function interRecalc(){
  const mins = periodMinutes();
  interBody.querySelectorAll('tr').forEach(tr=>{
    const transientMin = Number(tr.children[3].textContent || 0);
    const sustainedMin = Number(tr.children[5].textContent || 0);
    const plannedMin = Number(tr.children[7].textContent || 0);
    const emergencyMin = Number(tr.children[9].textContent || 0);
    const rowSum = transientMin + sustainedMin + plannedMin + emergencyMin;
    const totCell = tr.querySelector('.total-outage');
    if(!totCell.dataset.overridden) totCell.textContent = fmtNumberRaw(rowSum);
    const availCell = tr.querySelector('.availability');
    const avail = ((mins - Number(totCell.textContent||0))/mins)*100;
    if(!availCell.dataset.overridden) availCell.textContent = isFinite(avail) ? fmtNumberRaw(avail)+'%' : '';
  });
}
function meterRecalc(){
  meterBody.querySelectorAll('tr').forEach(tr=>{
    const start = Number(tr.querySelector('.start') ? tr.querySelector('.start').textContent : 0);
    const end = Number(tr.querySelector('.end') ? tr.querySelector('.end').textContent : 0);
    const mfRaw = tr.querySelector('.mf') ? tr.querySelector('.mf').textContent.trim() : '';
    const mf = (mfRaw === '-' || mfRaw === '' || isNaN(Number(mfRaw))) ? NaN : Number(mfRaw);
    const adv = end - start;
    const advCell = tr.querySelector('.advance');
    const totCell = tr.querySelector('.totalunit');
    if(advCell && !advCell.dataset.overridden) advCell.textContent = fmtNumberRaw(adv);
    if(totCell && !totCell.dataset.overridden) totCell.textContent = isNaN(mf) ? '' : fmtNumberRaw(adv * mf);
  });
}

/* ===== add rows handlers ===== */
$('inter-add').addEventListener('click', ()=>{ interBody.appendChild(createInterRowEditable({sl: nextManualIndex(interBody)})); });
$('meter-add').addEventListener('click', ()=>{ meterBody.appendChild(createMeterRowEditable({sl: nextManualIndex(meterBody)})); });
$('peak-add').addEventListener('click', ()=>{ peakBody.appendChild(createPeakRow({sl: nextManualIndex(peakBody)}, false)); });
$('vm-add').addEventListener('click', ()=>{ vmBody.appendChild(createVMRow({sl: nextManualIndex(vmBody)}, false)); });

// Yearly add rows (operator-added => deletable)
$('y-peak-add').addEventListener('click', ()=>{ yearlyPeakBody.appendChild(createPeakRow({sl: nextManualIndex(yearlyPeakBody)}, false)); });
$('y-vm-add').addEventListener('click', ()=>{ yearlyVmBody.appendChild(createVMRow({sl: nextManualIndex(yearlyVmBody)}, false)); });

/* ===== create editable rows used when operator adds rows (for monthly) ===== */
function createInterRowEditable(d={}){
  const tr=document.createElement('tr');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = true; tr.appendChild(tdF);
  const keys=['transientNos','transientMin','sustainedNos','sustainedMin','plannedNos','plannedMin','emergencyNos','emergencyMin'];
  keys.forEach(k=>{ const td=document.createElement('td'); td.contentEditable=true; td.textContent=''; td.addEventListener('input', ()=>{ interRecalc(); triggerYearlySync(); }); tr.appendChild(td); });
  const tdTot=document.createElement('td'); tdTot.className='total-outage calc locked'; tdTot.contentEditable=false; tdTot.textContent=''; tr.appendChild(tdTot);
  const tdAvail=document.createElement('td'); tdAvail.className='availability calc locked'; tdAvail.contentEditable=false; tdAvail.textContent=''; tr.appendChild(tdAvail);
  tr.appendChild(makeRemarkTD(''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  makeRowTrashButton(tr);
  return tr;
}
function createMeterRowEditable(d={}){
  const tr=document.createElement('tr');
  const tdSl=document.createElement('td'); tdSl.textContent = d.sl||''; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = d.feeder||''; tdF.contentEditable = true; tr.appendChild(tdF);
  const tdStart=document.createElement('td'); tdStart.className='start'; tdStart.contentEditable=true; tdStart.textContent = ''; tdStart.addEventListener('input', ()=>{ meterRecalc(); triggerYearlySync(); }); tr.appendChild(tdStart);
  const tdEnd=document.createElement('td'); tdEnd.className='end'; tdEnd.contentEditable=true; tdEnd.textContent = ''; tdEnd.addEventListener('input', ()=>{ meterRecalc(); triggerYearlySync(); }); tr.appendChild(tdEnd);
  const tdAdv=document.createElement('td'); tdAdv.className='advance calc locked'; tdAdv.contentEditable=false; tdAdv.textContent = ''; tr.appendChild(tdAdv);
  const tdMf=document.createElement('td'); tdMf.className='mf'; tdMf.contentEditable = true; tdMf.textContent = ''; tdMf.addEventListener('input', ()=>{ meterRecalc(); triggerYearlySync(); }); tr.appendChild(tdMf);
  const tdTotal=document.createElement('td'); tdTotal.className='totalunit calc locked'; tdTotal.contentEditable=false; tdTotal.textContent = ''; tr.appendChild(tdTotal);
  tr.appendChild(makeRemarkTD(''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  makeRowTrashButton(tr);
  return tr;
}

/* ===== Clear operator-only fields ===== */
function clearOperatorOnly(tableBody, tableId){
  tableBody.querySelectorAll('tr').forEach(tr=>{
    const tds = Array.from(tr.children);
    tds.forEach((td, idx)=>{
      const remark = td.querySelector && td.querySelector('.remark-text');
      if(remark){ remark.textContent = ''; return; }
      if(idx === 0 || idx === 1) return;
      if(tableId === 'table-meter' && idx === 5) return;
      if(td.classList && (td.classList.contains('calc'))){
        delete td.dataset.overridden;
        td.textContent = '';
        return;
      }
      if(td.isContentEditable) td.textContent = '';
      else {
        const childEditable = td.querySelector('[contenteditable]');
        if(childEditable) childEditable.textContent = '';
      }
    });
  });
}
$('inter-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Interruption (keeps Sl. No. and Feeder)?')){ clearOperatorOnly(interBody,'table-inter'); interRecalc(); toast('Interruption cleared'); }});
$('meter-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Meter (keeps Sl. No., Feeder and M.F.)?')){ clearOperatorOnly(meterBody,'table-meter'); meterRecalc(); toast('Meter cleared'); }});
$('peak-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Peak (keeps Sl. No. and Feeder)?')){ clearOperatorOnly(peakBody,'table-peak'); toast('Peak cleared'); }});
$('vm-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Max/Min Voltage (keeps Sl. No. and Feeder)?')){ clearOperatorOnly(vmBody,'table-vm'); toast('VM cleared'); }});
$('y-peak-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Yearly Peak (keeps Sl. No. and Feeder)?')){ clearOperatorOnly(yearlyPeakBody,'table-yearly-peak'); toast('Yearly Peak cleared'); }});
$('y-vm-clear').addEventListener('click', ()=>{ if(confirm('Clear only editable entries in Yearly VM (keeps Sl. No. and Feeder)?')){ clearOperatorOnly(yearlyVmBody,'table-yearly-vminmax'); toast('Yearly VM cleared'); }});

/* ===== Draft save/restore (monthly + yearly) ===== */
function periodKey(){ return $('period-start').value + '_' + $('period-end').value; }
function saveDraftGeneric(type, tbody){
  if(!currentUser) return alert('Login first');
  const who = currentUser.role==='admin' ? 'ADMIN' : currentUser.name.replace(/\s+/g,'_');
  const key = `namkhana_${type}_${periodKey()}_${who}`;
  const payload = { who, start:$('period-start').value, end:$('period-end').value, rows:[], savedAt: nowStamp() };
  tbody.querySelectorAll('tr').forEach(tr=>{
    const cols = Array.from(tr.children).map(td=>{
      const r = td.querySelector && td.querySelector('.remark-text');
      if(r) return r.textContent.trim();
      return td.textContent.trim();
    });
    payload.rows.push(cols);
  });
  localStorage.setItem(key, JSON.stringify(payload));
  toast(`${type} saved locally`);
  // trigger yearly sync after save
  triggerYearlySync();
}
$('inter-save').addEventListener('click', ()=> saveDraftGeneric('interruption', interBody));
$('meter-save').addEventListener('click', ()=> saveDraftGeneric('meter', meterBody));
$('peak-save').addEventListener('click', ()=> saveDraftGeneric('peak', peakBody));
$('vm-save').addEventListener('click', ()=> saveDraftGeneric('vm', vmBody));
$('y-peak-save').addEventListener('click', ()=> saveDraftGeneric('yearly_peak', yearlyPeakBody));
$('y-vm-save').addEventListener('click', ()=> saveDraftGeneric('yearly_vm', yearlyVmBody));

function loadDraftsIfAny(){
  if(!currentUser) return;
  const types = [
    {key:'interruption', tbody: interBody},
    {key:'meter', tbody: meterBody},
    {key:'peak', tbody: peakBody},
    {key:'vm', tbody: vmBody},
    {key:'yearly_peak', tbody: yearlyPeakBody},
    {key:'yearly_vm', tbody: yearlyVmBody}
  ];
  types.forEach(t=>{
    const who = currentUser.role==='admin' ? 'ADMIN' : currentUser.name.replace(/\s+/g,'_');
    const key = `namkhana_${t.key}_${periodKey()}_${who}`;
    const raw = localStorage.getItem(key);
    if(raw){
      if(confirm(`Found saved draft for ${t.key}. Restore?`)){
        const data = JSON.parse(raw);
        t.tbody.innerHTML='';
        data.rows.forEach(r=>{
          if(t.key==='interruption'){
            t.tbody.appendChild(createInterRowFromArray(r));
          } else if(t.key==='meter'){
            t.tbody.appendChild(createMeterRowFromArray(r));
          } else if(t.key==='peak' || t.key==='yearly_peak'){
            t.tbody.appendChild(createPeakRow({sl:r[0], feeder:r[1], peak:r[2], date:r[3], time:r[4], remarks:r[5]}, false));
          } else if(t.key==='vm' || t.key==='yearly_vm'){
            t.tbody.appendChild(createVMRow({sl:r[0], feeder:r[1], max:r[2], maxDate:r[3], maxTime:r[4], min:r[5], minDate:r[6], minTime:r[7], remarks:r[8]}, false));
          }
        });
        toast(`${t.key} restored`);
      }
    }
  });
}

/* converters for draft restore */
function createInterRowFromArray(r){
  const tr=document.createElement('tr');
  const tdSl=document.createElement('td'); tdSl.textContent = r[0]||''; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = r[1]||''; tdF.contentEditable=true; tr.appendChild(tdF);
  for(let i=2;i<=9;i++){ const td=document.createElement('td'); td.contentEditable=true; td.textContent = r[i]||''; td.addEventListener('input', ()=> interRecalc()); tr.appendChild(td); }
  const tdTot=document.createElement('td'); tdTot.className='total-outage calc locked'; tdTot.contentEditable=false; tdTot.textContent = r[10]||''; tr.appendChild(tdTot);
  const tdAvail=document.createElement('td'); tdAvail.className='availability calc locked'; tdAvail.contentEditable=false; tdAvail.textContent = r[11]||''; tr.appendChild(tdAvail);
  tr.appendChild(makeRemarkTD(r[12]||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  makeRowTrashButton(tr);
  return tr;
}
function createMeterRowFromArray(r){
  const tr=document.createElement('tr');
  const tdSl=document.createElement('td'); tdSl.textContent = r[0]||''; tr.appendChild(tdSl);
  const tdF=document.createElement('td'); tdF.textContent = r[1]||''; tdF.contentEditable=true; tr.appendChild(tdF);
  const tdStart=document.createElement('td'); tdStart.className='start'; tdStart.contentEditable=true; tdStart.textContent = r[2]||''; tdStart.addEventListener('input', ()=> meterRecalc()); tr.appendChild(tdStart);
  const tdEnd=document.createElement('td'); tdEnd.className='end'; tdEnd.contentEditable=true; tdEnd.textContent = r[3]||''; tdEnd.addEventListener('input', ()=> meterRecalc()); tr.appendChild(tdEnd);
  const tdAdv=document.createElement('td'); tdAdv.className='advance calc locked'; tdAdv.contentEditable=false; tdAdv.textContent = r[4]||''; tr.appendChild(tdAdv);
  const tdMf=document.createElement('td'); tdMf.className='mf'; tdMf.contentEditable=true; tdMf.textContent = r[5]||''; tdMf.addEventListener('input', ()=> meterRecalc()); tr.appendChild(tdMf);
  const tdTotal=document.createElement('td'); tdTotal.className='totalunit calc locked'; tdTotal.contentEditable=false; tdTotal.textContent = r[6]||''; tr.appendChild(tdTotal);
  tr.appendChild(makeRemarkTD(r[7]||''));
  const tdTrash=document.createElement('td'); tr.appendChild(tdTrash);
  makeRowTrashButton(tr);
  return tr;
}

/* ===== export helpers & header formatting (DD-MM-YYYY, yearly period) ===== */

function cloneTableForExport(tbl){
  const clone = tbl.cloneNode(true);
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  clone.querySelectorAll('.remark-text').forEach(div => {
    const td = document.createElement('td');
    td.textContent = div.textContent;
    div.parentNode.replaceWith(td);
  });

  function formatISOtoDDMM(iso){
    if(!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(!m) return iso;
    const yyyy = m[1], mm = m[2], dd = m[3];
    return dd + '/' + mm + '/' + yyyy;
  }
  function normalizeHourHHmm(v){
    if(!v) return '';
    const hh = String(v).slice(0,2);
    const n = Number(hh);
    if(isNaN(n)) return v;
    const h = ('0'+Math.max(0, Math.min(23, n))).slice(-2);
    return h + ':00';
  }

  clone.querySelectorAll('input').forEach(inp => {
    const td = document.createElement('td');
    if(inp.type === 'date') td.textContent = formatISOtoDDMM(inp.value);
    else if(inp.type === 'time') td.textContent = normalizeHourHHmm(inp.value);
    else td.textContent = inp.value;
    inp.parentNode.replaceWith(td);
  });

  clone.querySelectorAll('button').forEach(b => b.remove());
  return clone.outerHTML;
}
/* Yearly header: show only title + Period (01-01-YYYY → DD-MM-YYYY), NO 'Prepared by' line here */
function yearlyHeaderHTML(title, year){
  // compute period start=01-01-year, end = today if year==current else 31-12-year
  const now = new Date();
  let endStr;
  if(Number(year) === now.getFullYear()){
    endStr = formatDDMMYYYY(now);
  } else {
    endStr = `31-12-${year}`;
  }
  const startStr = `01-01-${year}`;
  return `<div style="text-align:center;margin-bottom:8px"><h2>Namkhana 33/11 KV Sub Station</h2><div style="font-weight:700">${title}</div><div style="margin-top:6px">Period: ${startStr} → ${endStr}</div><hr style="margin-top:8px"/></div>`;
}
/* Monthly / generic header uses period start/end from UI but in DD-MM-YYYY */
function headerHTML(title){
  const s = $('period-start').value ? formatDDMMYYYY($('period-start').value) : '';
  const e = $('period-end').value ? formatDDMMYYYY($('period-end').value) : '';
  return `<div style="text-align:center;margin-bottom:8px"><h2>Namkhana 33/11 KV Sub Station</h2><div style="font-weight:700">${title}</div><div style="margin-top:6px">Period: ${s} → ${e}</div><hr style="margin-top:8px"/></div>`;
}
async function exportHTMLToPDF(html, filename){
  if(!currentUser) return alert('Login first');
  const container=document.createElement('div'); container.style.padding='12px'; container.innerHTML=html;
  document.body.appendChild(container);
  const opt={margin:10, filename, html2canvas:{scale:3, useCORS:true}, jsPDF:{orientation:'landscape',unit:'pt',format:'a4'}};
  try{
    await html2pdf().from(container).set(opt).save();
    toast('PDF exported');
  }catch(e){ console.error(e); toast('Export failed'); }
  finally{ document.body.removeChild(container); }
}
function downloadBlob(filename, mime, content){
  const blob = (content instanceof Blob) ? content : new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 500);
}

/* ===== Save dropdown wiring & handlers (fixed) ===== */
function bindSaveDropdowns(){
  // Toggle for top-level & sub save menus
  document.querySelectorAll('.save-menu > button').forEach(btn=>{
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      const wrapper = btn.closest('.save-menu');
      if(!wrapper) return;
      const opts = wrapper.querySelector('.save-options');
      document.querySelectorAll('.save-options').forEach(o=>{ if(o !== opts) o.style.display='none'; });
      if(opts) opts.style.display = opts.style.display === 'block' ? 'none' : 'block';
    });
  });

  // Close on outside click
  document.addEventListener('click', function(e){
    if(!e.target.closest('.save-menu')){
      document.querySelectorAll('.save-options').forEach(o=>o.style.display='none');
    }
  });

  // Per-sub save option buttons
  document.querySelectorAll('.save-options button[data-save]').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const mode = btn.getAttribute('data-save');
      const sub = btn.getAttribute('data-sub');
      const year = $('year-select') ? $('year-select').value : null;
      await handleSubSave(mode, sub, year);
      btn.closest('.save-options').style.display='none';
    });
  });

  // Save All monthly
  $('save-all-options').querySelectorAll('button[data-mode]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const mode = btn.getAttribute('data-mode');
      await handleSaveAllMonthly(mode);
      $('save-all-options').style.display='none';
    });
  });

  // Save All yearly
  $('save-yearly-all-options').querySelectorAll('button[data-mode]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const mode = btn.getAttribute('data-mode');
      await handleSaveAllYearly(mode);
      $('save-yearly-all-options').style.display='none';
    });
  });
}

/* generic per-sub save */
async function handleSubSave(mode, sub, year){
  if(!currentUser) return alert('Login first');
  const map = {
    'interruption': {tbl: $('table-inter'), title:'Interruption Report'},
    'meter': {tbl: $('table-meter'), title:'Secure Meter Readings'},
    'peak': {tbl: $('table-peak'), title:'Peak Load (A)'},
    'vminmax': {tbl: $('table-vm'), title:'Max & Min Voltage'},
    'y-peak': {tbl: $('table-yearly-peak'), title:'Yearly Peak Load'},
    'y-vminmax': {tbl: $('table-yearly-vm'), title:'Yearly Max & Min Voltage'}
  };
  const item = map[sub];
  if(!item) return;
  const tblHtml = cloneTableForExport(item.tbl);
  // choose header: yearly uses special yearlyHeaderHTML (no prepared by), monthly/generic uses headerHTML
  const titleHtml = (sub && sub.startsWith('y-')) ? yearlyHeaderHTML(item.title, year) : headerHTML(item.title);
  const html = titleHtml + tblHtml + `<div style="margin-top:10px;font-size:12px">Prepared & Sent by ${currentUser.role==='admin' ? currentUser.email : currentUser.name} — ${formatDDMMYYYY(new Date())} ${new Date().toLocaleTimeString()}</div>`;
  if(mode === 'pdf' || mode === 'all'){ await exportHTMLToPDF(html, `${item.title.replace(/\s+/g,'_')}_${year||$('period-start').value}.pdf`); toast(`${item.title} saved as PDF`); }
  if(mode === 'xlsx' || mode === 'all'){
    const tmp=document.createElement('div'); tmp.innerHTML = tblHtml; const table = tmp.querySelector('table');
    const ws = XLSX.utils.table_to_sheet(table, {raw:true});
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, item.title.substring(0,31));
    const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
    const blob = new Blob([wbout],{type:'application/octet-stream'});
    downloadBlob(`${item.title.replace(/\s+/g,'_')}_${year||$('period-start').value}.xlsx`, 'application/octet-stream', blob);
    toast(`${item.title} saved as XLSX`);
  }
  
}

/* Save All Monthly */
async function handleSaveAllMonthly(mode){
  if(!currentUser) return alert('Login first');
  const sections = [
    {id:'table-inter', title:'Report 1: Interruption', sheet:'Interruption'},
    {id:'table-meter', title:'Report 2: Secure Meter', sheet:'Meter'},
    {id:'table-peak', title:'Report 3: Peak Load (A)', sheet:'PeakLoad'},
    {id:'table-vm', title:'Report 4: Max & Min Voltage', sheet:'Voltage'}
  ];
  let combinedHTML = `<div style="text-align:center"><h1>Namkhana 33/11 KV Sub Station</h1><div>Combined Monthly Reports</div><div>Period: ${formatDDMMYYYY($('period-start').value)} → ${formatDDMMYYYY($('period-end').value)}</div><hr/></div>`;
  const wb = XLSX.utils.book_new();
  for (let i = 0; i < sections.length; i++) {
  const s = sections[i];
  const tbl = $(s.id);
  const tblHtml = cloneTableForExport(tbl);
  combinedHTML += `<h3 style="margin-top:12px">${s.title}</h3>` + tblHtml;
  combinedHTML += `<div style="margin-top:6px;font-size:12px">Prepared & Sent by ${currentUser.role==='admin' ? currentUser.email : currentUser.name} — ${formatDDMMYYYY(new Date())} ${new Date().toLocaleTimeString()}</div>`;
  if (i < sections.length - 1) {
    combinedHTML += `<div style="page-break-after:always"></div>`;
  }
  const tmp=document.createElement('div'); tmp.innerHTML = tblHtml; const t = tmp.querySelector('table');
  const ws = XLSX.utils.table_to_sheet(t, {raw:true});
  XLSX.utils.book_append_sheet(wb, ws, s.sheet.substring(0,31));
}
if(mode === 'pdf' || mode === 'all'){ await exportHTMLToPDF(combinedHTML, `Combined_Monthly_Reports_${$('period-start').value}.pdf`); toast('Combined saved as PDF'); }
  if(mode === 'xlsx' || mode === 'all'){ const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'}); const blob = new Blob([wbout], {type:'application/octet-stream'}); downloadBlob(`Combined_Monthly_Reports_${$('period-start').value}.xlsx`, 'application/octet-stream', blob); toast('Combined saved as XLSX'); }
  
}

/* Save All Yearly */
async function handleSaveAllYearly(mode){
  if(!currentUser) return alert('Login first');
  const year = $('year-select').value;
  const sections = [
    {id:'table-yearly-inter', title:'Yearly Report: Interruption', sheet:'YearlyInterruption'},
    {id:'table-yearly-meter', title:'Yearly Report: Secure Meter', sheet:'YearlyMeter'},
    {id:'table-yearly-peak', title:'Yearly Report: Peak Load', sheet:'YearlyPeak'},
    {id:'table-yearly-vm', title:'Yearly Report: MaxMinVoltage', sheet:'YearlyVoltage'}
  ];
  // Yearly header includes start 01-01-year and end as today or 31-12-year; remove "prepared by" in header per request
  const now = new Date();
  const endStr = (Number(year) === now.getFullYear()) ? formatDDMMYYYY(now) : `31-12-${year}`;
  const startStr = `01-01-${year}`;
  let combinedHTML = `<div style="text-align:center"><h1>Namkhana 33/11 KV Sub Station</h1><div>Combined Yearly Reports</div><div>Year: ${year}</div><div>Period: ${startStr} → ${endStr}</div><hr/></div>`;
  const wb = XLSX.utils.book_new();
  for (let i = 0; i < sections.length; i++) {
  const s = sections[i];
  const tbl = $(s.id);
  const tblHtml = cloneTableForExport(tbl);
  combinedHTML += `<h3 style="margin-top:12px">${s.title}</h3>` + tblHtml;
  combinedHTML += `<div style="margin-top:6px;font-size:12px">Prepared & Sent by ${currentUser.role==='admin' ? currentUser.email : currentUser.name} — ${formatDDMMYYYY(new Date())} ${new Date().toLocaleTimeString()}</div>`;
  if (i < sections.length - 1) {
    combinedHTML += `<div style="page-break-after:always"></div>`;
  }
  const tmp=document.createElement('div'); tmp.innerHTML = tblHtml; const t = tmp.querySelector('table');
  const ws = XLSX.utils.table_to_sheet(t, {raw:true});
  XLSX.utils.book_append_sheet(wb, ws, s.sheet.substring(0,31));
}
if(mode === 'pdf' || mode === 'all'){ await exportHTMLToPDF(combinedHTML, `Combined_Yearly_Reports_${year}.pdf`); toast('Yearly combined saved as PDF'); }
  if(mode === 'xlsx' || mode === 'all'){ const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'}); const blob = new Blob([wbout], {type:'application/octet-stream'}); downloadBlob(`Combined_Yearly_Reports_${year}.xlsx`, 'application/octet-stream', blob); toast('Yearly combined saved as XLSX'); }
  
}

/* ===== Yearly aggregation from monthly (auto-sync) ===== */
function gatherMonthlyPeakRows(){
  const rows = [];
  peakBody.querySelectorAll('tr').forEach(tr=>{
    const feeder = tr.children[1].textContent.trim();
    const peak = Number(tr.children[2].textContent.trim() || NaN);
    const date = tr.children[3].textContent.trim();
    const time = tr.children[4].textContent.trim();
    if(feeder) rows.push({feeder, peak, date, time});
  });
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith('namkhana_peak_')){
      try{
        const payload = JSON.parse(localStorage.getItem(k));
        payload.rows.forEach(r=>{
          const feeder = r[1]; const peak = Number(r[2])||NaN; const date = r[3]||''; const time = r[4]||'';
          if(feeder) rows.push({feeder, peak, date, time});
        });
      }catch(e){}
    }
  });
  return rows;
}
function gatherMonthlyVMRows(){
  const rows = [];
  vmBody.querySelectorAll('tr').forEach(tr=>{
    const feeder = tr.children[1].textContent.trim();
    const max = Number(tr.children[2].textContent.trim() || NaN);
    const maxDate = tr.children[3].textContent.trim();
    const maxTime = tr.children[4].textContent.trim();
    const min = Number(tr.children[5].textContent.trim() || NaN);
    const minDate = tr.children[6].textContent.trim();
    const minTime = tr.children[7].textContent.trim();
    if(feeder) rows.push({feeder, max, maxDate, maxTime, min, minDate, minTime});
  });
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith('namkhana_vm_')){
      try{
        const payload = JSON.parse(localStorage.getItem(k));
        payload.rows.forEach(r=>{
          const feeder = r[1]; const max = Number(r[2])||NaN; const maxDate = r[3]||''; const maxTime = r[4]||'';
          const min = Number(r[5])||NaN; const minDate = r[6]||''; const minTime = r[7]||'';
          if(feeder) rows.push({feeder, max, maxDate, maxTime, min, minDate, minTime});
        });
      }catch(e){}
    }
  });
  return rows;
}

function yearlyRecalc(){
  // Yearly Peak: take max peak per feeder from monthly
  const feeders = Array.from(new Set(defaultMeterFeeders.map(f=>f.feeder)));
  const peakRows = gatherMonthlyPeakRows();
  yearlyPeakBody.innerHTML = '';
  feeders.forEach((feederName, idx)=>{
    const sl = idx+1;
    const matches = peakRows.filter(r=>r.feeder===feederName).filter(r=>!isNaN(Number(r.peak)));
    const best = matches.length ? matches.reduce((a,b)=> (a.peak>=b.peak? a: b)) : null;
    yearlyPeakBody.appendChild(createPeakRow({sl, feeder:feederName, peak: best? best.peak : '', date: best? best.date:'' , time: best? best.time : ''}, true));
  });

  // Yearly VM: only the specified default feeders (IN-1, IN-2, 33KV-1,33KV-2)
  const vmRows = gatherMonthlyVMRows();
  yearlyVmBody.innerHTML = '';
  yearlyVMDefaultFeeders.forEach((f, idx)=>{
    const sl = idx+1;
    const matches = vmRows.filter(r=>r.feeder===f.feeder);
    const maxVals = matches.map(m=>m.max).filter(n=>!isNaN(n));
    const minVals = matches.map(m=>m.min).filter(n=>!isNaN(n));
    const bestMax = maxVals.length ? Math.max(...maxVals) : '';
    const bestMin = minVals.length ? Math.min(...minVals) : '';
    let maxDate='', maxTime='', minDate='', minTime='';
    const maxMatch = matches.find(m => m.max === bestMax);
    if(maxMatch){ maxDate = maxMatch.maxDate; maxTime = maxMatch.maxTime; }
    const minMatch = matches.find(m => m.min === bestMin);
    if(minMatch){ minDate = minMatch.minDate; minTime = minMatch.minTime; }
    yearlyVmBody.appendChild(createVMRow({sl, feeder:f.feeder, max: bestMax, maxDate, maxTime, min: bestMin, minDate, minTime}, true));
  });
}

/* ===== Auto-sync wiring: whenever Monthly peak/vm table content changes, update Yearly ===== */
let yearlySyncDebounce = null;
function triggerYearlySync(){
  if(yearlySyncDebounce) clearTimeout(yearlySyncDebounce);
  yearlySyncDebounce = setTimeout(()=>{ yearlyRecalc(); toast('Yearly updated from Monthly'); }, 600);
}
function setupAutoYearlySync(){
  peakBody.addEventListener('input', ()=> triggerYearlySync());
  vmBody.addEventListener('input', ()=> triggerYearlySync());
  // MutationObserver to catch row additions/deletions
  const moConfig = {childList:true, subtree:true, characterData:true};
  const mo = new MutationObserver(mutations => {
    let changed=false;
    for(const m of mutations){
      if(m.target && (peakBody.contains(m.target) || vmBody.contains(m.target) || peakBody === m.target || vmBody === m.target)){
        changed = true; break;
      }
    }
    if(changed) triggerYearlySync();
  });
  mo.observe(peakBody, moConfig);
  mo.observe(vmBody, moConfig);
}

/* wire yearly recalc button */
$('yearly-recalc').addEventListener('click', ()=>{ yearlyRecalc(); toast('Yearly recalculated from Monthly'); });

/* ===== UI toggles ===== */
$('save-all-btn').addEventListener('click', (e)=>{ const opts = $('save-all-options'); opts.style.display = opts.style.display==='block' ? 'none' : 'block'; });
$('save-yearly-all-btn').addEventListener('click', ()=>{ const opts = $('save-yearly-all-options'); opts.style.display = opts.style.display==='block' ? 'none' : 'block'; });

/* ===== Year select population (2019 -> 2050) ===== */
function populateYearSelect(){
  const sel = $('year-select');
  sel.innerHTML='';
  const start = 2019;
  const end = 2050;
  const current = new Date().getFullYear();
  for(let y=start; y<=end; y++){
    const opt = document.createElement('option'); opt.value = String(y); opt.textContent = String(y);
    if(y === current) opt.selected = true;
    sel.appendChild(opt);
  }
}

/* ===== placeholders and boot ===== */
function markUnsaved(type){ /* placeholder */ }
function markUnsavedAll(){ /* placeholder */ }

document.addEventListener('DOMContentLoaded', ()=>{ initPeriod(); /* actual init after login */ });

/* ===== last login and signatures ===== */
function updateLastLogin(){
  if(currentUser) {
    const who = currentUser.role==='admin' ? `${currentUser.email} (Admin)` : `${currentUser.name} (Operator)`;
    $('last-login').textContent = `Last login: ${who} — ${nowStamp()}`;
  } else {
    $('last-login').textContent = 'Not logged in';
  }
}
function updateSignatures(){
  document.querySelectorAll('.signature').forEach(sig=>{
    sig.textContent=`Prepared by ${currentUser ? currentUser.name : '---'} — Sent on ${formatDDMMYYYY(new Date())} ${new Date().toLocaleTimeString()}`;
  });
}

/* ===== commented auto-login for testing ===== */
/*
currentUser = { role:'operator', name:'Pallab Baran Das', email:'' };
afterLogin();
*/


/* ===== FIX: Proper toggle for Save All buttons ===== */
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




(function(){
  function attachInputListeners(tbody){
    if(!tbody) return;
    tbody.querySelectorAll('td[contenteditable], td .remark-text').forEach(el=>{
      if(el.dataset.autosynced) return;
      el.dataset.autosynced = '1';
      el.addEventListener('input', ()=>{ try{ fillYearlyFromMonthly(); }catch(e){ console.warn(e); } });
    });
  }
  const interBody = document.querySelector('#table-inter tbody');
  const meterBody = document.querySelector('#table-meter tbody');
  const peakBody = document.querySelector('#table-peak tbody');
  const vmBody = document.querySelector('#table-vm tbody');

  attachInputListeners(interBody);
  attachInputListeners(meterBody);
  attachInputListeners(peakBody);
  attachInputListeners(vmBody);

  const observerConfig = { childList: true, subtree: true, characterData: true };
  const onMonthlyChange = (mutationsList)=>{
    let changed = false;
    for(const m of mutationsList){
      if(m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)){ changed = true; break; }
      if(m.type === 'characterData'){ changed = true; break; }
    }
    if(changed){
      attachInputListeners(interBody);
      attachInputListeners(meterBody);
      attachInputListeners(peakBody);
      attachInputListeners(vmBody);
      try{ fillYearlyFromMonthly(); }catch(e){ console.warn(e); }
    }
  };

  const monthlyContainers = [interBody, meterBody, peakBody, vmBody].filter(Boolean);
  monthlyContainers.forEach(tb=>{
    try{
      const obs = new MutationObserver(onMonthlyChange);
      obs.observe(tb, observerConfig);
    }catch(e){}
  });

  const ids = [
    'inter-add','meter-add','peak-add','vm-add',
    'inter-clear','meter-clear','peak-clear','vm-clear',
    'inter-save','meter-save','peak-save','vm-save'
  ];
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click', ()=>{ 
      setTimeout(()=>{ try{ fillYearlyFromMonthly(); }catch(e){} }, 150); 
    });
  });

  const saveAllBtn = document.getElementById('save-all-btn');
  if(saveAllBtn) saveAllBtn.addEventListener('click', ()=>{ setTimeout(()=>{ try{ fillYearlyFromMonthly(); }catch(e){} }, 400); });

  const yrRecalc = document.getElementById('yearly-recalc');
  if(yrRecalc) yrRecalc.addEventListener('click', ()=>{ setTimeout(()=>{ try{ fillYearlyFromMonthly(); }catch(e){} }, 200); });

  try{ fillYearlyFromMonthly(); }catch(e){}
})();



document.addEventListener('DOMContentLoaded', function(){
  const ys = document.getElementById('year-select');
  if(ys){
    ys.addEventListener('change', function(){
      try{ fillYearlyFromMonthly(); }catch(e){}
      try{ yearlyInterRecalc(); }catch(e){}
    });
  }
});



/* ===== v1.9.13 Safety & Audit Polish ===== */

/* ---- 1) Export Header Metadata (DOM element so most exporters pick it up) ---- */
function buildExportHeader(title){
  const ps = document.getElementById('period-start');
  const pe = document.getElementById('period-end');
  const monthStr = (ps && ps.value) ? new Date(ps.value).toLocaleDateString(undefined, {month:'long', year:'numeric'}) : '';
  const opEl = document.getElementById('operator-name') || document.querySelector('[data-operator-name]');
  const operator = opEl ? (opEl.value || opEl.textContent || '').trim() : '';
  const div = document.createElement('div');
  div.className = 'export-header';
  div.innerHTML = `Namkhana 33/11 kV Substation<br>${title}${monthStr?(" – " + monthStr):""}${operator?("<br>Operator: "+operator):""}`;
  return div;
}
function ensurePanelExportHeader(panelId, title){
  const panel = document.getElementById(panelId);
  if(!panel) return;
  if(!panel.querySelector('.export-header')){
    const hdr = buildExportHeader(title);
    panel.insertBefore(hdr, panel.firstChild);
  }else{
    const hdr = panel.querySelector('.export-header');
    const fresh = buildExportHeader(title);
    hdr.innerHTML = fresh.innerHTML;
  }
}

/* ---- 2) Smart Auto-Save (every 120s) ---- */
let _autosaveTimer = null;
function startAutoSave(){
  try{ if(_autosaveTimer) clearInterval(_autosaveTimer); }catch(e){}
  _autosaveTimer = setInterval(()=>{
    try{
      const interBody = document.querySelector('#table-inter tbody');
      const meterBody = document.querySelector('#table-meter tbody');
      const peakBody  = document.querySelector('#table-peak tbody');
      const vmBody    = document.querySelector('#table-vm tbody');
      if(interBody) saveDraftGeneric('monthly_interruption_autosave', interBody);
      if(meterBody) saveDraftGeneric('monthly_meter_autosave', meterBody);
      if(peakBody)  saveDraftGeneric('monthly_peak_autosave', peakBody);
      if(vmBody)    saveDraftGeneric('monthly_vm_autosave', vmBody);
      // yearly autosave (light)
      const yInterBody = document.querySelector('#table-yearly-inter tbody');
      const yMeterBody = document.querySelector('#table-yearly-meter tbody');
      if(yInterBody) saveDraftGeneric('yearly_interruption_autosave', yInterBody);
      if(yMeterBody) saveDraftGeneric('yearly_meter_autosave', yMeterBody);
      try{ toast('💾 Auto-saved'); }catch(e){}
    }catch(e){ console.warn('autosave error', e); }
  }, 120000);
}

/* ---- 3) Date Validation for Monthly Period ---- */
function isValidDate(d){ return d instanceof Date && !isNaN(d.getTime()); }
function validatePeriodDates(){
  const psEl = document.getElementById('period-start');
  const peEl = document.getElementById('period-end');
  if(!psEl || !peEl) return true;
  const ps = new Date(psEl.value); const pe = new Date(peEl.value);
  const ok = isValidDate(ps) && isValidDate(pe) && ps <= pe;
  let banner = document.getElementById('period-warn');
  if(!banner){
    banner = document.createElement('div');
    banner.id = 'period-warn';
    banner.className = 'warn-banner';
    banner.textContent = '⚠️ Invalid date range. Please set a valid Period Start and End.';
    const parent = psEl.closest('.card') || document.body;
    parent.insertBefore(banner, parent.firstChild);
  }
  banner.classList.toggle('show', !ok);
  // optionally disable calc buttons if invalid
  const recalcBtn = document.getElementById('yearly-recalc');
  if(recalcBtn) recalcBtn.disabled = !ok;
  return ok;
}

/* ---- 4) Confirm Before Clear ---- */
(function(){
  const orig = window.clearOperatorOnly;
  window.clearOperatorOnly = function(tbody, tableId){
    if(!confirm('⚠️ Are you sure you want to clear all operator-entered data?')) return;
    try{ if(typeof addAudit==='function') addAudit(tableId || 'table', 'Clear Data'); }catch(e){}
    return orig ? orig(tbody, tableId) : undefined;
  };
})();

/* ---- 5) Local Audit Log (offline) ---- */
function addAudit(tab, action){
  try{
    const key='auditLog';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ tab, action, time: new Date().toLocaleString() });
    localStorage.setItem(key, JSON.stringify(arr));
  }catch(e){ console.warn('audit log error', e); }
}

/* Hook audit into common actions */
document.addEventListener('DOMContentLoaded', function(){
  // Start autosave
  startAutoSave();
  // Validate dates on load & when changed
  validatePeriodDates();
  ['period-start','period-end'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener('change', ()=>{ validatePeriodDates(); ensurePanelExportHeader('panel-monthly','Monthly Report'); ensurePanelExportHeader('panel-yearly','Yearly Report'); });
  });

  // Ensure export headers exist for main panels
  ensurePanelExportHeader('panel-monthly','Monthly Report');
  ensurePanelExportHeader('panel-yearly','Yearly Report');

  // Wire audit on buttons if present
  const ids = [
    'inter-add','meter-add','peak-add','vm-add',
    'inter-clear','meter-clear','peak-clear','vm-clear',
    'inter-save','meter-save','peak-save','vm-save',
    'y-inter-add','y-meter-add','y-inter-clear','y-meter-clear','y-inter-save','y-meter-save',
    'yearly-recalc','save-all-btn'
  ];
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click', ()=> addAudit(id, 'click'));
  });

  // Audit on table edits (lightweight)
  document.querySelectorAll('table td[contenteditable="true"]').forEach(td=>{
    td.addEventListener('input', ()=> addAudit(td.closest('table')?.id || 'table', 'edit'));
  });
});



(function(){
  const yearlyPanels = ['panel-y-inter','panel-y-meter','panel-y-peak','panel-y-vminmax'];
  const yearlyTables = ['table-yearly-inter','table-yearly-meter','table-yearly-peak','table-yearly-vm'];

  function withYearlyPanelsShown(run){
    // Save current display for panels and tables, then force-show offscreen to avoid flicker
    const saved = [];
    yearlyPanels.forEach(pid=>{
      const p = document.getElementById(pid);
      if(!p) return;
      saved.push([p, p.style.display, p.style.visibility, p.style.position, p.style.left, p.style.top]);
      p.style.visibility = 'hidden';
      p.style.display = 'block';
      p.style.position = 'absolute';
      p.style.left = '-99999px';
      p.style.top = '0';
    });
    yearlyTables.forEach(tid=>{
      const t = document.getElementById(tid);
      if(!t) return;
      saved.push([t, t.style.display]);
      t.style.display = '';
    });
    try{ run(); } finally {
      // Restore after a brief delay to let export capture DOM
      setTimeout(()=>{
        saved.forEach(arr=>{
          const el = arr[0];
          if(!el) return;
          if(arr.length===2){
            el.style.display = arr[1];
          }else{
            el.style.display = arr[1];
            el.style.visibility = arr[2];
            el.style.position = arr[3];
            el.style.left = arr[4];
            el.style.top = arr[5];
          }
        });
      }, 600);
    }
  }

  // Intercept Yearly "Save ▼ → Save All" clicks BEFORE the app's own handler
  function interceptYearlySaveAll(){
    const selector = [
      '#panel-y-inter [data-save="all"]',
      '#panel-y-meter [data-save="all"]',
      '#panel-y-peak [data-save="all"]',
      '#panel-y-vminmax [data-save="all"]'
    ].join(',');
    document.querySelectorAll(selector).forEach(btn=>{
      // avoid double binding
      if(btn.dataset.yearlyAllHooked) return;
      btn.dataset.yearlyAllHooked = '1';
      btn.addEventListener('click', function preExportCapture(ev){
        // Run before default handlers (capture phase)
      }, true);
      btn.addEventListener('click', function preExportBubble(ev){
        // Force-show all yearly panels during export
        withYearlyPanelsShown(function(){});
      }, false);
    });
  }

  // Also hook the global "Save All" button if it exists
  function interceptGlobalSaveAll(){
    const btn = document.getElementById('save-all-btn');
    if(!btn || btn.dataset.yearlyAllHooked) return;
    btn.dataset.yearlyAllHooked = '1';
    btn.addEventListener('click', function(){
      // Ensure yearly tables visible for any combined yearly export path
      withYearlyPanelsShown(function(){});
    }, true);
  }

  // Observe DOM for dropdowns being created lazily
  const ready = ()=>{
    interceptYearlySaveAll();
    interceptGlobalSaveAll();
  };
  document.addEventListener('DOMContentLoaded', ready);
  // Retry a few times in case menus render later
  let tries = 0; const timer = setInterval(()=>{ tries++; ready(); if(tries>8) clearInterval(timer); }, 600);
})();



window.addEventListener('load', function(){

  // ===== Helpers: date format conversion =====
  function parseDDMMtoISO(ddmmyyyy){
    if(!ddmmyyyy) return '';
    const m = ddmmyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if(!m) return '';
    const dd = m[1], mm = m[2], yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  function formatISOtoDDMM(iso){
    if(!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(!m) return '';
    const yyyy = m[1], mm = m[2], dd = m[3];
    return `${dd}/${mm}/${yyyy}`;
  }
  function normalizeHourHHmm(v){
    if(!v) return '';
    const hh = String(v).slice(0,2);
    const n = Number(hh);
    if(isNaN(n)) return '';
    const h = ('0'+Math.max(0, Math.min(23, n))).slice(-2);
    return h + ':00';
  }

  // ===== Safe override: createPeakRow to add date/time inputs =====
  if (typeof createPeakRow === 'function'){
    const _createPeakRow = createPeakRow;
    window.createPeakRow = function(d={}, fixed=false){
      const tr = _createPeakRow(d, fixed);
      // Ensure Date + Time cells exist at positions 3 and 4
      // If there are already inputs, leave them
      const dateTd = tr.children[3];
      const timeTd = tr.children[4];
      if(dateTd && !dateTd.querySelector('input[type="date"]')){
        const inDate = document.createElement('input');
        inDate.type = 'date';
        inDate.value = (d.date && d.date.includes('/')) ? parseDDMMtoISO(d.date) : (d.date || '');
        inDate.addEventListener('change', ()=>{ try{ if(typeof triggerYearlySync==='function') triggerYearlySync(); }catch(e){} });
        dateTd.innerHTML = ''; dateTd.appendChild(inDate);
      }
      if(timeTd && !timeTd.querySelector('input[type="time"]')){
        const inTime = document.createElement('input');
        inTime.type = 'time';
        inTime.step = 3600;
        inTime.value = normalizeHourHHmm(d.time||'');
        inTime.addEventListener('change', ()=>{
          inTime.value = normalizeHourHHmm(inTime.value);
          try{ if(typeof triggerYearlySync==='function') triggerYearlySync(); }catch(e){}
        });
        timeTd.innerHTML = ''; timeTd.appendChild(inTime);
      }
      return tr;
    }
  }

  // ===== Safe override: createVMRow to add max/min date/time inputs =====
  if (typeof createVMRow === 'function'){
    const _createVMRow = createVMRow;
    window.createVMRow = function(d={}, fixed=false){
      const tr = _createVMRow(d, fixed);
      const maxDateTd = tr.children[3], maxTimeTd = tr.children[4];
      const minDateTd = tr.children[6], minTimeTd = tr.children[7];
      if(maxDateTd && !maxDateTd.querySelector('input[type="date"]')){
        const inMaxDate = document.createElement('input');
        inMaxDate.type = 'date';
        inMaxDate.value = (d.maxDate && d.maxDate.includes('/')) ? parseDDMMtoISO(d.maxDate) : (d.maxDate || '');
        inMaxDate.addEventListener('change', ()=>{ try{ if(typeof triggerYearlySync==='function') triggerYearlySync(); }catch(e){} });
        maxDateTd.innerHTML=''; maxDateTd.appendChild(inMaxDate);
      }
      if(maxTimeTd && !maxTimeTd.querySelector('input[type="time"]')){
        const inMaxTime = document.createElement('input');
        inMaxTime.type='time'; inMaxTime.step=3600;
        inMaxTime.value = normalizeHourHHmm(d.maxTime||'');
        inMaxTime.addEventListener('change', ()=>{ inMaxTime.value = normalizeHourHHmm(inMaxTime.value); try{ if(typeof triggerYearlySync==='function') triggerYearlySync(); }catch(e){} });
        maxTimeTd.innerHTML=''; maxTimeTd.appendChild(inMaxTime);
      }
      if(minDateTd && !minDateTd.querySelector('input[type="date"]')){
        const inMinDate = document.createElement('input');
        inMinDate.type='date';
        inMinDate.value = (d.minDate && d.minDate.includes('/')) ? parseDDMMtoISO(d.minDate) : (d.minDate || '');
        inMinDate.addEventListener('change', ()=>{ try{ if(typeof triggerYearlySync==='function') triggerYearlySync(); }catch(e){} });
        minDateTd.innerHTML=''; minDateTd.appendChild(inMinDate);
      }
      if(minTimeTd && !minTimeTd.querySelector('input[type="time"]')){
        const inMinTime = document.createElement('input');
        inMinTime.type='time'; inMinTime.step=3600;
        inMinTime.value = normalizeHourHHmm(d.minTime||'');
        inMinTime.addEventListener('change', ()=>{ inMinTime.value = normalizeHourHHmm(inMinTime.value); try{ if(typeof triggerYearlySync==='function') triggerYearlySync(); }catch(e){} });
        minTimeTd.innerHTML=''; minTimeTd.appendChild(inMinTime);
      }
      return tr;
    }
  }

  // ===== Wrap saveDraftGeneric to persist date/time inputs =====
  if (typeof saveDraftGeneric === 'function'){
    const _saveDraftGeneric = saveDraftGeneric;
    window.saveDraftGeneric = function(key, tbody){
      // augment rows so inputs are serialized
      tbody.querySelectorAll('tr').forEach(tr=>{
        Array.from(tr.children).forEach(td=>{
          const inp = td.querySelector && (td.querySelector('input[type="date"]') || td.querySelector('input[type="time"]'));
          if(inp){
            // mirror input value into td dataset so original serializer can read td.textContent if needed
            if(inp.type==='date'){
              td.setAttribute('data-serial', formatISOtoDDMM(inp.value));
            }else{
              td.setAttribute('data-serial', (inp.value||''));
            }
          }else{
            td.removeAttribute && td.removeAttribute('data-serial');
          }
        });
      });
      return _saveDraftGeneric(key, tbody);
    }
  }

  // ===== Wrap cloneTableForExport to render inputs as plain text =====
  if (typeof cloneTableForExport === 'function'){
    const _clone = cloneTableForExport;
    window.cloneTableForExport = function(tbl){
      const cloneHTML = _clone(tbl);
      const tmp = document.createElement('div');
      tmp.innerHTML = cloneHTML;
      tmp.querySelectorAll('input[type="date"]').forEach(inp=>{
        const td = document.createElement('td'); td.textContent = formatISOtoDDMM(inp.value);
        inp.parentNode.replaceWith(td);
      });
      tmp.querySelectorAll('input[type="time"]').forEach(inp=>{
        const td = document.createElement('td'); td.textContent = normalizeHourHHmm(inp.value);
        inp.parentNode.replaceWith(td);
      });
      return tmp.innerHTML;
    }
  }

  // ===== Wrap clearOperatorOnly to skip date/time inputs =====
  if (typeof clearOperatorOnly === 'function'){
    const _clear = clearOperatorOnly;
    window.clearOperatorOnly = function(tbody, tableId){
      // Temporarily protect inputs by tagging them un-clearable
      const protectedInputs = [];
      tbody.querySelectorAll('input[type="date"], input[type="time"]').forEach(i=>{
        const p = i.parentNode;
        if(p){
          protectedInputs.push(p);
          p.setAttribute('data-protect', '1');
        }
      });
      const res = _clear(tbody, tableId);
      // restore text in protected cells (clear may have emptied them)
      protectedInputs.forEach(p=>{
        if(p && p.getAttribute('data-protect')==='1'){
          const inp = p.querySelector('input');
          if(inp){
            // ensure input remains intact
          }else{
            // if removed, recreate minimal input
            const type = p.previousElementSibling && p.previousElementSibling.querySelector ? (p.previousElementSibling.querySelector('input[type="time"]')?'date':'time') : 'date';
            const x = document.createElement('input'); x.type = type; if(type==='time') x.step=3600;
            p.innerHTML=''; p.appendChild(x);
          }
          p.removeAttribute('data-protect');
        }
      });
      return res;
    }
  }

  // ===== Extend monthly gatherers to include date/time from inputs =====
  window.gatherMonthlyPeakRows = function(){
    const rows = [];
    const peakBody = document.querySelector('#table-peak tbody');
    if(peakBody){
      peakBody.querySelectorAll('tr').forEach(tr=>{
        const feeder = tr.children[1]?.textContent.trim() || '';
        const peak = Number(tr.children[2]?.textContent.trim() || NaN);
        const date = tr.children[3]?.querySelector('input[type="date"]') ? formatISOtoDDMM(tr.children[3].querySelector('input').value) : (tr.children[3]?.textContent.trim() || '');
        const time = tr.children[4]?.querySelector('input[type="time"]') ? normalizeHourHHmm(tr.children[4].querySelector('input').value) : (tr.children[4]?.textContent.trim() || '');
        if(feeder) rows.push({feeder, peak, date, time});
      });
    }
    // include drafts previously saved (compat)
    Object.keys(localStorage).forEach(k=>{
      if(k.startsWith('namkhana_peak_')){
        try{
          const payload = JSON.parse(localStorage.getItem(k));
          (payload.rows||[]).forEach(r=>{
            const feeder = r[1]; const peak = Number(r[2])||NaN; const date = r[3]||''; const time = r[4]||'';
            if(feeder) rows.push({feeder, peak, date, time});
          });
        }catch(e){}
      }
    });
    return rows;
  };

  window.gatherMonthlyVMRows = function(){
    const rows = [];
    const vmBody = document.querySelector('#table-vm tbody');
    if(vmBody){
      vmBody.querySelectorAll('tr').forEach(tr=>{
        const feeder = tr.children[1]?.textContent.trim() || '';
        const max = Number(tr.children[2]?.textContent.trim() || NaN);
        const maxDate = tr.children[3]?.querySelector('input[type="date"]') ? formatISOtoDDMM(tr.children[3].querySelector('input').value) : (tr.children[3]?.textContent.trim() || '');
        const maxTime = tr.children[4]?.querySelector('input[type="time"]') ? normalizeHourHHmm(tr.children[4].querySelector('input').value) : (tr.children[4]?.textContent.trim() || '');
        const min = Number(tr.children[5]?.textContent.trim() || NaN);
        const minDate = tr.children[6]?.querySelector('input[type="date"]') ? formatISOtoDDMM(tr.children[6].querySelector('input').value) : (tr.children[6]?.textContent.trim() || '');
        const minTime = tr.children[7]?.querySelector('input[type="time"]') ? normalizeHourHHmm(tr.children[7].querySelector('input').value) : (tr.children[7]?.textContent.trim() || '');
        if(feeder) rows.push({feeder, max, maxDate, maxTime, min, minDate, minTime});
      });
    }
    Object.keys(localStorage).forEach(k=>{
      if(k.startsWith('namkhana_vm_')){
        try{
          const payload = JSON.parse(localStorage.getItem(k));
          (payload.rows||[]).forEach(r=>{
            const feeder = r[1]; const max = Number(r[2])||NaN; const maxDate = r[3]||''; const maxTime = r[4]||'';
            const min = Number(r[5])||NaN; const minDate = r[6]||''; const minTime = r[7]||'';
            if(feeder) rows.push({feeder, max, maxDate, maxTime, min, minDate, minTime});
          });
        }catch(e){}
      }
    });
    return rows;
  };

  // ===== Enhance yearly sync to carry date/time for peak & vm =====
  function writeYearlyPeakVMFromMonthly(){
    const peakRows = (typeof gatherMonthlyPeakRows==='function') ? gatherMonthlyPeakRows() : [];
    const vmRows   = (typeof gatherMonthlyVMRows==='function') ? gatherMonthlyVMRows() : [];
    const peakByFeeder = {};
    peakRows.forEach(r=>{
      if(!r || !r.feeder) return;
      const key = r.feeder;
      if(!(key in peakByFeeder) || (Number(r.peak)||-Infinity) > (Number(peakByFeeder[key].peak)||-Infinity)){
        peakByFeeder[key] = {peak:r.peak, date:r.date, time:r.time};
      }
    });
    const vmByFeeder = {};
    vmRows.forEach(r=>{
      if(!r || !r.feeder) return;
      const key = r.feeder;
      if(!vmByFeeder[key]) vmByFeeder[key] = {max:-Infinity,maxDate:'',maxTime:'',min:Infinity,minDate:'',minTime:''};
      if((Number(r.max)||-Infinity) > (vmByFeeder[key].max||-Infinity)){
        vmByFeeder[key].max = r.max; vmByFeeder[key].maxDate = r.maxDate; vmByFeeder[key].maxTime = r.maxTime;
      }
      if((Number(r.min)||Infinity) < (vmByFeeder[key].min||Infinity)){
        vmByFeeder[key].min = r.min; vmByFeeder[key].minDate = r.minDate; vmByFeeder[key].minTime = r.minTime;
      }
    });

    const yPeakBody = document.querySelector('#table-yearly-peak tbody');
    if(yPeakBody){
      yPeakBody.querySelectorAll('tr').forEach(tr=>{
        const feeder = tr.children[1]?.textContent.trim() || '';
        const d = peakByFeeder[feeder];
        if(d){
          if(tr.children[2]) tr.children[2].textContent = (d.peak!=null && d.peak!=='' ? d.peak : '');
          if(tr.children[3]) tr.children[3].textContent = d.date || '';
          if(tr.children[4]) tr.children[4].textContent = d.time || '';
        }
      });
    }
    const yVmBody = document.querySelector('#table-yearly-vm tbody');
    if(yVmBody){
      yVmBody.querySelectorAll('tr').forEach(tr=>{
        const feeder = tr.children[1]?.textContent.trim() || '';
        const d = vmByFeeder[feeder];
        if(d){
          if(tr.children[2]) tr.children[2].textContent = (d.max!=null && d.max!=='' ? d.max : '');
          if(tr.children[3]) tr.children[3].textContent = d.maxDate || '';
          if(tr.children[4]) tr.children[4].textContent = d.maxTime || '';
          if(tr.children[5]) tr.children[5].textContent = (d.min!=null && d.min!=='' ? d.min : '');
          if(tr.children[6]) tr.children[6].textContent = d.minDate || '';
          if(tr.children[7]) tr.children[7].textContent = d.minTime || '';
        }
      });
    }
  }

  // Hook into existing yearly sync points
  if(typeof triggerYearlySync === 'function'){
    const _trigger = triggerYearlySync;
    window.triggerYearlySync = function(){
      try{ _trigger(); }catch(e){}
      try{ writeYearlyPeakVMFromMonthly(); }catch(e){}
    };
  }else{
    // No trigger present → run on demand
    document.addEventListener('input', function(ev){
      if(ev.target && (ev.target.type==='date' || ev.target.type==='time')){
        try{ writeYearlyPeakVMFromMonthly(); }catch(e){}
      }
    });
  }

  // Initial run after load
  try{ writeYearlyPeakVMFromMonthly(); }catch(e){}
});



window.addEventListener('load', () => {
  const foot = document.querySelector('footer');
  if(foot && !foot.querySelector('.footer-line-2')){
    const line2 = document.createElement('p');
    line2.className = 'footer-line-2';
    line2.textContent = 'Crafted with ❤️ for WBSEDCL by Vedant — v1.0';
    foot.appendChild(line2);
  }
});



window.addEventListener('load', () => {
  const loginContainer = document.querySelector('#login-container, .login-container, #login-page, body');
  if(loginContainer){
    const footer = document.createElement('div');
    footer.id = 'login-footer';
    footer.innerHTML = `© 2025 WBSEDCL Kakdwip Division — Namkhana Sub Station<br>Crafted with ❤️ for WBSEDCL by Vedant — v1.0`;
    document.body.appendChild(footer);
  }
  // Hide footer after login
  // Removed old observer(() => {
    const mainPanel = document.querySelector('#main-panel');
    if(mainPanel && mainPanel.style.display !== 'none'){
      const lf = document.getElementById('login-footer');
      if(lf) lf.style.display = 'none';
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});



(function(){
  function isVisible(el){
    if(!el) return false;
    const cs = getComputedStyle(el);
    if(cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return !!(rect.width || rect.height);
  }
  function getVisibleAppFooter(){
    const footers = Array.from(document.querySelectorAll('footer'));
    return footers.find(f => f.id !== 'login-footer' && isVisible(f));
  }
  function isAppShown(){
    const candidates = ['#main-panel','#panel-monthly','#panel-yearly','.reports-section','#reports'];
    return candidates.some(sel => isVisible(document.querySelector(sel))) || !!getVisibleAppFooter();
  }
  function ensureLoginFooter(){
    // If app already shown at load, do not add login footer
    if(isAppShown()) return;
    if(document.getElementById('login-footer')) return;
    const lf = document.createElement('div');
    lf.id = 'login-footer';
    lf.innerHTML = '© 2025 WBSEDCL Kakdwip Division — Namkhana Sub Station<br>Crafted with ❤️ for WBSEDCL by Vedant — v1.0';
    document.body.appendChild(lf);
  }
  function removeLoginFooter(){
    const lf = document.getElementById('login-footer');
    if(lf){
      lf.style.transition = 'opacity .4s ease';
      lf.style.opacity = '0';
      setTimeout(()=>{ lf.remove(); }, 450);
    }
  }
  // On DOM ready: add only if still on login
  window.addEventListener('load', ()=>{
    ensureLoginFooter();
    // Poll for app visibility and remove login footer once detected
    let tries = 0;
    const iv = setInterval(()=>{
      tries++;
      if(isAppShown()){
        removeLoginFooter();
        clearInterval(iv);
      } else if(tries > 40){ // stop after ~32s
        clearInterval(iv);
      }
    }, 800);
  });
  // Also observe mutations as a secondary signal
  const mo = new MutationObserver(()=>{ if(isAppShown()) removeLoginFooter(); });
  mo.observe(document.documentElement || document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['style','class']});
})();



window.addEventListener('load', () => {
  // Wrap existing login box inside a glass card dynamically
  const loginBox = document.querySelector('#login-container, .login-container, #login-page');
  if(loginBox && !document.getElementById('login-card')){
    const content = loginBox.innerHTML;
    loginBox.innerHTML = `<div id="login-card">${content}<div class='login-tagline'>West Bengal State Electricity Distribution Company Limited</div></div>`;
  }

  // Maintain dark/light theme preference
  try {
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(e) {}
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  if(header && !header.querySelector('.header-right')){
    const logo = header.querySelector('img, .logo');
    const textBlock = document.createElement('div');
    textBlock.className = 'header-right';
    textBlock.innerHTML = `
      <h1>Namkhana 33/11 KV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana</h3>`;
    const wrapper = document.createElement('div');
    wrapper.className = 'header-left';
    if(logo) wrapper.appendChild(logo.cloneNode(true));
    header.innerHTML = '';
    header.appendChild(wrapper);
    header.appendChild(textBlock);
  }
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  if(header && !header.querySelector('.header-text-block')){
    const block = document.createElement('div');
    block.className = 'header-text-block';
    block.innerHTML = `
      <h1>Namkhana 33/11 KV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana</h3>`;
    header.appendChild(block);
  }
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  if(header && !header.querySelector('.header-text-block')){
    const block = document.createElement('div');
    block.className = 'header-text-block';
    block.innerHTML = `
      <h1>Namkhana 33/11 kV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana, Pin-743357</h3>
      <h4>📱 9332793668 ✉️ nmksubstation@gmail.com</h4>`;
    header.appendChild(block);
  }
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  if(header && !header.querySelector('.header-text-block')){
    const block = document.createElement('div');
    block.className = 'header-text-block';
    block.innerHTML = `
      <h1>Namkhana 33/11 kV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana, Pin-743357</h3>
      <h4>📱 9332793668 ✉️ nmksubstation@gmail.com</h4>`;
    header.appendChild(block);
  }
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  header.innerHTML = `
    <div class='header-text-block'>
      <h1>Namkhana 33/11 kV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana, Pin - 743357</h3>
      <h4>📱 9332793668 ✉️ nmksubstation@gmail.com</h4>
    </div>`;
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  header.innerHTML = `
    <div class='header-text-block'>
      <h1>Namkhana 33/11 kV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana, Pin - 743357</h3>
      <h4>📱 9332793668 ✉️ nmksubstation@gmail.com</h4>
    </div>`;
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  header.innerHTML = `
    <div class='header-text-block'>
      <h1>Namkhana 33/11 kV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana, Pin - 743357</h3>
      <h4>📱 9332793668 ✉️ nmksubstation@gmail.com</h4>
    </div>`;
});



window.addEventListener('load', () => {
  const header = document.querySelector('header');
  header.innerHTML = `
    <div class='header-text-block'>
      <h1>Namkhana 33/11 kV Sub Station</h1>
      <h2>Kakdwip Division, WBSEDCL</h2>
      <h3>Narayanpur, Namkhana, Pin - 743357</h3>
      <h4>📱 9332793668 ✉️ nmksubstation@gmail.com</h4>
    </div>`;
});



(function(){
  const LS = window.localStorage;
  const ADMIN_EMAILS = new Set(['nmksubstation@gmail.com','namkhanasubstation@gmail.com','tech.kakdwipdiv@wbsedcl.in']);
  function $(id){ return document.getElementById(id); }
  function toast(msg){ const t=document.createElement('div'); t.className='admin-toast'; t.textContent=msg; document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),200); },1500); }
  function now(){ const d=new Date(); return d.toISOString().replace('T',' ').slice(0,19); }

  /* === Create Admin TAB + PANEL as true main-tab === */
  function ensureAdminTab(){
    if(document.querySelector('.main-tab[data-tab="admin"]')) return;
    const eq = document.querySelector('.main-tab[data-tab="equipment"]'); if(!eq) return;
    const b=document.createElement('button'); b.className='main-tab'; b.dataset.tab='admin'; b.textContent='🛠️ Admin Dashboard';
    b.addEventListener('click', ()=> activateMainTab('admin'));
    eq.after(b);
  }
  function ensureAdminPanel(){
    if($('admin')) return;
    const eqP=$('equipment'); if(!eqP) return;
    const panel=document.createElement('div');
    panel.id='admin'; panel.className='tab-content'; panel.style.display='none';
    panel.innerHTML = `
      <div class="adm-row cards">
        <div class="adm-card"><div class="label">Operators</div><div class="value" id="adm-ops">0</div></div>
        <div class="adm-card"><div class="label">Monthly Reports</div><div class="value" id="adm-monthly">0</div></div>
        <div class="adm-card"><div class="label">Pending Yearly Sync</div><div class="value" id="adm-sync">0</div></div>
        <div class="adm-card"><div class="label">Last Update</div><div class="value" id="adm-last">—</div></div>
      </div>

      <div class="adm-row" id="adm-charts">
        <div class="adm-section"><h4>Monthly Load Trend (A/kWh)</h4><div class="adm-chart"><canvas id="chart-load"></canvas></div></div>
        <div class="adm-section"><h4>Voltage Variation (Max–Min)</h4><div class="adm-chart"><canvas id="chart-volt"></canvas></div></div>
        <div class="adm-section"><h4>Interruption Summary (Hours)</h4><div class="adm-chart"><canvas id="chart-int"></canvas></div></div>
      </div>

      <div class="adm-grid-2" style="margin-top:10px;">
        <div class="adm-section">
          <h4>Operator Management</h4>
          <input id="op-name" class="adm-input" placeholder="Operator Name">
          <input id="op-uid" class="adm-input" placeholder="Login ID (unique)">
          <input id="op-email" class="adm-input" placeholder="Email (optional)">
          <select id="op-status" class="adm-select"><option value="active">Active</option><option value="disabled">Disabled</option></select>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
            <button id="btn-add-op" class="adm-btn">Add Operator</button>
            <button id="btn-del-op" class="adm-btn ghost">Delete Operator</button>
            <button id="btn-toggle-op" class="adm-btn ghost">Enable/Disable</button>
          </div>
          <div style="overflow:auto; max-height:240px; margin-top:8px;">
            <table id="table-ops" style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead><tr style="background:#f8fafc"><th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Name</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">UserID</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Status</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Email</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
        </div>

        <div class="adm-section">
          <h4>Global Search & Tools</h4>
          <input id="adm-search" class="adm-input" placeholder="Search feeder / month / value / operator">
          <div style="display:flex;gap:8px;margin:8px 0;flex-wrap:wrap;">
            <button id="adm-search-btn" class="adm-btn">Search</button>
            <button id="btn-recalc" class="adm-btn">Recalculate Yearly</button>
            <button id="btn-export-all" class="adm-btn ghost">Export All</button>
            <button id="btn-audit-csv" class="adm-btn ghost">Export Audit CSV</button>
          </div>
          <div id="adm-search-results" style="max-height:240px;overflow:auto;border:1px solid #e5e7eb;border-radius:10px;padding:8px;background:#fff;"></div>
        </div>
      </div>
    `;
    eqP.after(panel);
  }

  /* === Data helpers === */
  function setJSON(k,v){ LS.setItem(k, JSON.stringify(v)); }
  function getJSON(k,fb){ try{ return JSON.parse(LS.getItem(k)) ?? fb }catch(e){ return fb } }
  function updateCards(){
    const ops = getJSON('admin_operators',[]).length;
    let monthly=0; Object.keys(localStorage).forEach(k=>{ if(k.startsWith('namkhana_peak_')||k.startsWith('namkhana_vm_')||k.startsWith('namkhana_interruption_')||k.startsWith('namkhana_secure_')) monthly++; });
    let pending=0; try{
      const yP=document.querySelector('#table-yearly-peak tbody'), yV=document.querySelector('#table-yearly-vm tbody');
      [yP,yV].forEach(t=>{ if(!t) return; t.querySelectorAll('tr').forEach(tr=>{ Array.from(tr.children).slice(2).forEach(td=>{ if(!td.textContent.trim()) pending++; }); }); });
    }catch(e){}
    const last = (getJSON('admin_audit_log',[])[0]?.ts)||'—';
    const set = (id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
    set('adm-ops',ops); set('adm-monthly',monthly); set('adm-sync',pending>0?1:0); set('adm-last',last);
  }
  function logAudit(msg){ const log=getJSON('admin_audit_log',[]); log.unshift({ts:now(),msg}); setJSON('admin_audit_log',log); updateCards(); }

  /* === Operators === */
  function renderOperators(){
    const tb = document.querySelector('#table-ops tbody'); if(!tb) return;
    tb.innerHTML=''; getJSON('admin_operators',[]).forEach(op=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td style="padding:8px;border-bottom:1px solid #e5e7eb;">${op.name||''}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${op.uid||''}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${op.status||'active'}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${op.email||''}</td>`;
      tb.appendChild(tr);
    });
  }
  function bindOperatorButtons(){
    $('btn-add-op')?.addEventListener('click',()=>{
      const name=$('op-name').value.trim();
      const uid=$('op-uid').value.trim();
      const email=$('op-email').value.trim();
      const status=$('op-status').value;
      if(!uid){ alert('UserID required'); return; }
      const ops=getJSON('admin_operators',[]);
      if(ops.find(o=>o.uid===uid)){ alert('UserID exists'); return; }
      ops.push({name,uid,email,status}); setJSON('admin_operators',ops);
      renderOperators(); updateCards(); logAudit('Added operator '+uid);
    });
    $('btn-del-op')?.addEventListener('click',()=>{
      const uid=$('op-uid').value.trim(); if(!uid){ alert('Enter UserID'); return; }
      const ops=getJSON('admin_operators',[]).filter(o=>o.uid!==uid); setJSON('admin_operators',ops);
      renderOperators(); updateCards(); logAudit('Deleted operator '+uid);
    });
    $('btn-toggle-op')?.addEventListener('click',()=>{
      const uid=$('op-uid').value.trim();
      const ops=getJSON('admin_operators',[]); const f=ops.find(o=>o.uid===uid); if(!f){ alert('Not found'); return; }
      f.status = f.status==='active' ? 'disabled' : 'active'; setJSON('admin_operators',ops);
      renderOperators(); logAudit('Toggled operator '+uid+' to '+f.status);
    });
  }

  /* === Search & actions === */
  function bindSearchAndActions(){
    $('adm-search-btn')?.addEventListener('click',()=>{
      const q=($('adm-search').value||'').toLowerCase(); const out=$('adm-search-results');
      if(!q){ out.innerHTML='<i>Enter a keyword</i>'; return; }
      let res=[];
      document.querySelectorAll('table').forEach(tbl=>{
        if(tbl.id && (tbl.id.includes('yearly')||tbl.id.includes('table-')||tbl.id.includes('secure'))){
          tbl.querySelectorAll('tr').forEach(tr=>{ const txt=tr.innerText.toLowerCase(); if(txt.includes(q)) res.push({table:tbl.id, row:txt.slice(0,140)}); });
        }
      });
      out.innerHTML = res.map(r=>`<div style="padding:6px;border-bottom:1px solid #e5e7eb;"><b>${r.table}</b><br><span style="color:#6b7280">${r.row}</span></div>`).join('') || '<i>No matches</i>';
      logAudit('Searched: '+q);
    });
    $('btn-recalc')?.addEventListener('click',()=>{
      try{ window.triggerYearlySync && window.triggerYearlySync(); }catch(e){}
      try{ window.yearlyRecalc && window.yearlyRecalc(); }catch(e){}
      alert('Yearly recalculation triggered'); logAudit('Recalculated Yearly Reports');
    });
    $('btn-export-all')?.addEventListener('click',()=>{
      const btns=Array.from(document.querySelectorAll('button,a')).filter(b=>/save all|export all/i.test(b.textContent));
      if(btns[0]) btns[0].click(); else alert('No combined export button found');
      logAudit('Export All triggered');
    });
    $('btn-audit-csv')?.addEventListener('click',()=>{
      const log=getJSON('admin_audit_log',[]);
      const csv='Time,Event\n'+log.map(r=>`"${r.ts}","${(r.msg||'').replace(/"/g,'""')}"`).join('\n');
      const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='admin_audit_log.csv'; document.body.appendChild(a); a.click(); a.remove();
    });
  }

  /* === Charts: fixed height + ResizeObserver + Lazy mount === */
  let chartsBuilt=false;
  function buildCharts(){
    if(chartsBuilt) return; chartsBuilt=true;
    function ensureChart(cb){
      if(window.Chart){ cb(); return; }
      const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'; s.onload=cb; document.head.appendChild(s);
    }
    ensureChart(()=>{
      const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const loadData=new Array(12).fill(0), voltData=new Array(12).fill(0), intData=new Array(12).fill(0);
      try{
        const secureTbody=document.querySelector('#table-secure tbody');
        if(secureTbody){ secureTbody.querySelectorAll('tr').forEach(tr=>{
          const monthIdx=(new Date().getMonth())%12;
          const v=Number(tr.children[2]?.textContent.trim()||0); loadData[monthIdx]+=v;
        });}
      }catch(e){}
      try{
        const vmTbody=document.querySelector('#table-vm tbody');
        if(vmTbody){ vmTbody.querySelectorAll('tr').forEach(tr=>{
          const max=Number(tr.children[2]?.textContent.trim()||0);
          const min=Number(tr.children[5]?.textContent.trim()||0);
          const monthIdx=(new Date().getMonth())%12; voltData[monthIdx]=Math.max(voltData[monthIdx], (max-min));
        });}
      }catch(e){}
      try{
        const intTbody=document.querySelector('#table-interruption tbody');
        if(intTbody){ intTbody.querySelectorAll('tr').forEach(tr=>{
          const hrs=Number(tr.children[4]?.textContent.trim()||0);
          const monthIdx=(new Date().getMonth())%12; intData[monthIdx]+=hrs;
        });}
      }catch(e){}

      const common={responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'#e5e7eb'}}}};
      const lc=new Chart(document.getElementById('chart-load'), {type:'line', data:{labels:months, datasets:[{data:loadData, tension:.3, borderWidth:2}]}, options:common});
      const vc=new Chart(document.getElementById('chart-volt'), {type:'bar', data:{labels:months, datasets:[{data:voltData}]}, options:common});
      const ic=new Chart(document.getElementById('chart-int'),  {type:'bar', data:{labels:months, datasets:[{data:intData}]},  options:common});

      // ResizeObserver to keep charts crisp without layout thrash
      const ro=new ResizeObserver(()=>{ lc.resize(); vc.resize(); ic.resize(); });
      document.querySelectorAll('.adm-chart').forEach(el=>ro.observe(el));
    });
  }

  /* === Show Admin (after login) === */
  function showAdminUI(){
    ensureAdminTab(); ensureAdminPanel();
    updateCards(); renderOperators(); bindOperatorButtons(); bindSearchAndActions();
    // Only build charts when admin tab becomes visible
    if(typeof activateMainTab==='function'){ activateMainTab('admin'); }
    // Use IntersectionObserver to lazy-init charts
    const adminPanel = $('admin');
    if(!adminPanel) return;
    const io=new IntersectionObserver((entries)=>{
      if(entries.some(e=>e.isIntersecting)){ buildCharts(); io.disconnect(); }
    }, {root:null, threshold:0.2});
    io.observe(adminPanel);
  }

  /* === Bind to your existing admin login controls === */
  function bindAdminLogin(){
    const loginBtn = document.getElementById('admin-login-confirm');
    const cancelBtn = document.getElementById('admin-login-cancel');
    const selectEl = document.getElementById('admin-select');
    if(!loginBtn || !selectEl) return;
    loginBtn.addEventListener('click', ()=>{
      const email=(selectEl.value||'').trim().toLowerCase();
      if(!email){ alert('Please choose an Admin.'); return; }
      if(!ADMIN_EMAILS.has(email)){ alert('Not an authorized Admin email.'); return; }
      LS.setItem('namkhana_role','admin');
      toast('✅ Admin access granted');
      showAdminUI();
    });
    cancelBtn?.addEventListener('click', ()=>{ LS.removeItem('namkhana_role'); });
  }

  /* === Remove Admin UI on logout === */
  function bindLogoutCleanup(){
    function reset(){
      LS.removeItem('namkhana_role');
      document.querySelector('.main-tab[data-tab="admin"]')?.remove();
      document.getElementById('admin')?.remove();
    }
    document.body.addEventListener('click', (e)=>{
      const t=e.target, txt=(t.textContent||'').trim().toLowerCase();
      if(/logout|sign out|signout/.test(txt) || t.id==='logout-btn'){ reset(); }
    }, true);
  }

  window.addEventListener('load', ()=>{
    // Clean slate on load
    document.querySelector('.main-tab[data-tab="admin"]')?.remove();
    document.getElementById('admin')?.remove();
    bindAdminLogin();
    bindLogoutCleanup();
  });
})();



(function(){
  const LS = window.localStorage;
  function $(id){ return document.getElementById(id); }
  function getOps(){ try{return JSON.parse(LS.getItem('admin_operators'))||[]}catch(e){return []} }
  function setOps(list){ LS.setItem('admin_operators', JSON.stringify(list)); }
  function toast2(msg){ const t=document.createElement('div'); t.className='admin-toast'; t.textContent=msg; document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),200); },1400); }

  /* Seed the four operators once */
  function seedOperatorsIfEmpty(){
    const cur = getOps();
    if(cur && cur.length) return;
    const seed = [
      {name:'Pallab Baran Das', uid:'pallab', email:'pallabbarandas@gmail.com', mobile:'9732846604', status:'active'},
      {name:'Sukumar Ghosh', uid:'sukumar', email:'ghoshsukamar8@gmail.com', mobile:'9647156504', status:'active'},
      {name:'Ashok Ghouri', uid:'ashok', email:'ashokghorui1982@gmail.com', mobile:'9732616346', status:'active'},
      {name:'Surajit Jana', uid:'surajit', email:'janasurajit123@gmail.com', mobile:'7679564486', status:'active'}
    ];
    setOps(seed);
  }

  /* Enhance Operator panel UI (adds Mobile field + Actions + Inline edit) */
  function enhanceOperatorUI(){
    const opsTbl = document.getElementById('table-ops');
    if(!opsTbl) return;
    const thead = opsTbl.querySelector('thead');
    if(thead && !thead.dataset.enhanced){
      thead.dataset.enhanced = '1';
      thead.innerHTML = '<tr>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Name</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">UserID</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Email</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Mobile</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Status</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Actions</th>' +
      '</tr>';
    }
    // Add "Mobile" input to the add form if missing
    if(!document.getElementById('op-mobile')){
      const emailEl = document.getElementById('op-email');
      if(emailEl){
        const mob = document.createElement('input');
        mob.id='op-mobile'; mob.className='adm-input'; mob.placeholder='Mobile';
        emailEl.insertAdjacentElement('afterend', mob);
      }
    }
  }

  function renderOps(){
    const opsTbl = document.getElementById('table-ops'); if(!opsTbl) return;
    const tb = opsTbl.querySelector('tbody');
    tb.innerHTML='';
    getOps().forEach(op=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Name"><input class="adm-inline" value="${op.name||''}" data-field="name"></td>
        <td data-label="UserID"><input class="adm-inline" value="${op.uid||''}" data-field="uid" disabled></td>
        <td data-label="Email"><input class="adm-inline" value="${op.email||''}" data-field="email"></td>
        <td data-label="Mobile"><input class="adm-inline" value="${op.mobile||''}" data-field="mobile"></td>
        <td data-label="Status">
          <select class="adm-inline" data-field="status">
            <option value="active"${op.status==='active'?' selected':''}>Active</option>
            <option value="disabled"${op.status==='disabled'?' selected':''}>Disabled</option>
          </select>
        </td>
        <td data-label="Actions">
          <button class="adm-action primary" data-act="save" data-uid="${op.uid}">Save</button>
          <button class="adm-action" data-act="delete" data-uid="${op.uid}">Delete</button>
        </td>`;
      tb.appendChild(tr);
    });
  }

  function bindRowActions(){
    const tb = document.querySelector('#table-ops tbody');
    if(!tb || tb.dataset.bound) return;
    tb.dataset.bound='1';
    tb.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-act]'); if(!btn) return;
      const uid = btn.getAttribute('data-uid');
      const act = btn.getAttribute('data-act');
      let ops = getOps();
      const idx = ops.findIndex(o=>o.uid===uid);
      if(idx<0) return;
      if(act==='delete'){
        if(!confirm('Delete operator '+uid+'?')) return;
        ops.splice(idx,1); setOps(ops); renderOps(); toast2('Operator deleted');
        return;
      }
      if(act==='save'){
        // read the row inputs
        const row = btn.closest('tr');
        const updated = {...ops[idx]};
        row.querySelectorAll('[data-field]').forEach(inp=>{
          updated[inp.getAttribute('data-field')] = inp.value.trim();
        });
        ops[idx] = updated; setOps(ops); toast2('Saved');
      }
    });
  }

  function bindAddButtons(){
    const add = document.getElementById('btn-add-op');
    const del = document.getElementById('btn-del-op');
    const tog = document.getElementById('btn-toggle-op');
    if(add && !add.dataset.bound){
      add.dataset.bound='1';
      add.addEventListener('click', ()=>{
        const name = (document.getElementById('op-name').value||'').trim();
        const uid  = (document.getElementById('op-uid').value||'').trim();
        const email= (document.getElementById('op-email').value||'').trim();
        const mobile= (document.getElementById('op-mobile').value||'').trim();
        const status= (document.getElementById('op-status').value||'active');
        if(!uid){ alert('UserID required'); return; }
        const ops=getOps();
        if(ops.find(x=>x.uid===uid)){ alert('UserID exists'); return; }
        ops.push({name,uid,email,mobile,status}); setOps(ops);
        renderOps(); toast2('Operator added');
      });
    }
    if(del && !del.dataset.bound){
      del.dataset.bound='1';
      del.addEventListener('click', ()=>{
        const uid=(document.getElementById('op-uid').value||'').trim();
        if(!uid){ alert('Enter UserID to delete'); return; }
        const filtered=getOps().filter(x=>x.uid!==uid); setOps(filtered);
        renderOps(); toast2('Operator deleted');
      });
    }
    if(tog && !tog.dataset.bound){
      tog.dataset.bound='1';
      tog.addEventListener('click', ()=>{
        const uid=(document.getElementById('op-uid').value||'').trim();
        const ops=getOps(); const f=ops.find(x=>x.uid===uid);
        if(!f){ alert('User not found'); return; }
        f.status = (f.status==='active'?'disabled':'active'); setOps(ops); renderOps(); toast2('Status toggled');
      });
    }
  }

  /* Kick in when Admin panel exists */
  const observer = new MutationObserver(()=>{
    const panel = document.getElementById('admin');
    if(!panel || panel.dataset.opsReady) return;
    seedOperatorsIfEmpty();
    enhanceOperatorUI();
    renderOps();
    bindRowActions();
    bindAddButtons();
    panel.dataset.opsReady='1';
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});

  window.addEventListener('load', ()=>{
    if(document.getElementById('admin')){
      seedOperatorsIfEmpty(); enhanceOperatorUI(); renderOps(); bindRowActions(); bindAddButtons();
      document.getElementById('admin').dataset.opsReady='1';
    }
  });
})();



(function(){
  const LS = window.localStorage;
  function $(id){ return document.getElementById(id); }
  function text(el){ return (el && (el.textContent||'')).trim().toLowerCase(); }
  function toast(msg){ const t=document.createElement('div'); t.className='admin-toast'; t.textContent=msg; document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),200); },1500); }

  /* ===================== GLOBAL SEARCH (fixed & extended) ===================== */
  function bindFixedGlobalSearch(){
    const btn = document.getElementById('adm-search-btn');
    const box = document.getElementById('adm-search');
    const out = document.getElementById('adm-search-results');
    if(!btn || !box || !out) return;
    btn.addEventListener('click', ()=>{
      const q=(box.value||'').trim().toLowerCase();
      if(!q){ out.innerHTML='<i>Enter a keyword</i>'; return; }
      btn.disabled = true; const old=btn.textContent; btn.textContent='Searching…';
      const scopes = [
        '#table-ops',                 // Admin operators
        '#table-peak',                // Monthly Peak Load
        '#table-vm',                  // Monthly Voltage
        '#table-interruption',        // Monthly Interruption
        '#table-secure',              // Monthly Secure Meter
        '#table-meter',               // Monthly Meter (if exists)
        '#table-yearly-peak',         // Yearly Peak
        '#table-yearly-vm',           // Yearly Voltage
        '#table-y-peak',              // Alt Yearly ids (fallbacks)
        '#table-y-vm',
        '#table-y-inter',
        '#table-y-meter',
        'table'                       // final fallback
      ];
      const results = [];
      const seen = new Set();
      for(const sel of scopes){
        document.querySelectorAll(sel).forEach(tbl=>{
          tbl.querySelectorAll('tr').forEach(tr=>{
            const line = tr.innerText || '';
            const lt = line.toLowerCase();
            if(lt.includes(q)){
              const key = sel+'|'+lt.slice(0,160);
              if(seen.has(key)) return;
              seen.add(key);
              results.push({table: tbl.id||'(table)', row: line.trim().slice(0,260)});
            }
          });
        });
      }
      const limited = results.slice(0,25);
      out.innerHTML = limited.length
        ? limited.map(r=>`<div style="padding:6px;border-bottom:1px solid #e5e7eb;"><b>${r.table}</b><br><span style="color:#6b7280">${r.row}</span></div>`).join('')
        : '<i>No matches</i>';
      btn.disabled = false; btn.textContent = old;
      toast('🔎 Search updated');
    });
  }

  /* ===================== EXPORT ALL (robust trigger) ===================== */
  function bindFixedExportAll(){
    const btn = document.getElementById('btn-export-all');
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      // Try common patterns in the app
      const candidates = [
        '[data-export="all"]',
        '#save-all-dropdown',
        'button[title*="Save All"]',
        'button:contains("Save All")',
        'button:contains("Export All")',
        'a:contains("Save All")',
        'a:contains("Export All")'
      ];
      let triggered = false;
      for(const sel of candidates){
        // :contains is not a real selector; emulate
        if(sel.includes(':contains')){
          const txt = sel.match(/:contains\("(.+)"\)/)[1].toLowerCase();
          const tag = sel.split(':')[0];
          document.querySelectorAll(tag).forEach(el=>{
            if(text(el).includes(txt) && !triggered){ el.click(); triggered = true; }
          });
          if(triggered) break;
        }else{
          const el = document.querySelector(sel);
          if(el){ el.click(); triggered = true; break; }
        }
      }
      // Fallback: click any visible export/save buttons in sections
      if(!triggered){
        const perSection = Array.from(document.querySelectorAll('button,a')).filter(x=>/save|export/i.test(x.textContent||''));
        if(perSection[0]){ perSection[0].click(); triggered = true; }
      }
      toast(triggered ? '✅ Combined Export triggered' : '⚠️ Export action not found');
    });
  }

  /* ===================== CHARTS — Auto Sync (All four) ===================== */
  let charts = { load:null, volt:null, inter:null, secure:null };
  let chartBuilt = false;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function parseNumber(s){
    const n = parseFloat(String(s||'').replace(/[, A-Za-z]/g,''));
    return isFinite(n) ? n : 0;
    }

  function collectData(){
    const nowM = (new Date()).getMonth();
    const byMonthLoad = new Array(12).fill(0);
    const byMonthVolt = new Array(12).fill(0);
    const byMonthInter= new Array(12).fill(0);
    const byMonthSecure= new Array(12).fill(0);

    // Peak Load: #table-peak -> 3rd column numeric
    try{
      const tb = document.querySelector('#table-peak tbody');
      if(tb){
        tb.querySelectorAll('tr').forEach(tr=>{
          const val = parseNumber(tr.children[2]?.textContent);
          const m = nowM; // if month is not in row, attribute to current month
          byMonthLoad[m] += val;
        });
      }
    }catch(e){}

    // Voltage Variation: #table-vm -> (Max - Min) columns (assumed 3rd & 6th)
    try{
      const tb = document.querySelector('#table-vm tbody');
      if(tb){
        tb.querySelectorAll('tr').forEach(tr=>{
          const max = parseNumber(tr.children[2]?.textContent);
          const min = parseNumber(tr.children[5]?.textContent);
          const diff = Math.max(0, max - min);
          const m = nowM;
          byMonthVolt[m] = Math.max(byMonthVolt[m], diff);
        });
      }
    }catch(e){}

    // Interruption: #table-interruption -> Hours 5th column
    try{
      const tb = document.querySelector('#table-interruption tbody');
      if(tb){
        tb.querySelectorAll('tr').forEach(tr=>{
          const hrs = parseNumber(tr.children[4]?.textContent);
          const m = nowM;
          byMonthInter[m] += hrs;
        });
      }
    }catch(e){}

    // Secure Meter: #table-secure -> Reading 3rd column
    try{
      const tb = document.querySelector('#table-secure tbody') || document.querySelector('#table-meter tbody');
      if(tb){
        tb.querySelectorAll('tr').forEach(tr=>{
          const val = parseNumber(tr.children[2]?.textContent);
          const m = nowM;
          byMonthSecure[m] += val;
        });
      }
    }catch(e){}

    return { byMonthLoad, byMonthVolt, byMonthInter, byMonthSecure };
  }

  function ensureChartJs(cb){
    if(window.Chart){ cb(); return; }
    const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    s.onload=cb; document.head.appendChild(s);
  }

  function buildOrUpdateCharts(){
    const data = collectData();
    const opts = { responsive:true, maintainAspectRatio:false, animation:{duration:600}, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false}}, y:{grid:{color:'#e5e7eb'}} } };

    // Ensure canvases exist (Admin v1.9.16e layout)
    const elL = document.getElementById('chart-load');
    const elV = document.getElementById('chart-volt');
    const elI = document.getElementById('chart-int');
    // If secure chart doesn't exist visually, reuse 'int' for data sync only
    // (keeping three charts on dashboard; secure data stays calculated)
    if(!elL || !elV || !elI) return;

    if(!charts.load){
      charts.load = new Chart(elL, { type:'line', data:{ labels:months, datasets:[{ data:data.byMonthLoad, borderWidth:2, tension:.3 }]}, options:opts });
    } else {
      charts.load.data.datasets[0].data = data.byMonthLoad; charts.load.update();
    }
    if(!charts.volt){
      charts.volt = new Chart(elV, { type:'bar', data:{ labels:months, datasets:[{ data:data.byMonthVolt }]}, options:opts });
    } else {
      charts.volt.data.datasets[0].data = data.byMonthVolt; charts.volt.update();
    }
    if(!charts.inter){
      charts.inter = new Chart(elI, { type:'bar', data:{ labels:months, datasets:[{ data:data.byMonthInter }]}, options:opts });
    } else {
      charts.inter.data.datasets[0].data = data.byMonthInter; charts.inter.update();
    }

    // Keep secure data computed for future secure-specific chart if needed
    LS.setItem('admin_secure_monthly_series', JSON.stringify(data.byMonthSecure));
  }

  // Observer to auto-refresh charts when monthly tables change
  let mo;
  function startAutoSyncObserver(){
    if(mo) return;
    mo = new MutationObserver((mutations)=>{
      // If any table cell text changed, refresh charts
      const need = mutations.some(m=> (m.target && (m.type==='childList' || m.type==='characterData')) );
      if(need) buildOrUpdateCharts();
    });
    const watchIds = ['table-peak','table-vm','table-interruption','table-secure','table-meter'];
    watchIds.forEach(id=>{
      const el = document.getElementById(id);
      if(el) mo.observe(el, {subtree:true, childList:true, characterData:true});
    });
  }

  // When Admin tab becomes active, (re)build charts and ensure observer
  const tabWatch = new MutationObserver(()=>{
    const admin = document.getElementById('admin');
    if(admin && admin.style.display !== 'none'){
      ensureChartJs(()=>{ buildOrUpdateCharts(); startAutoSyncObserver(); });
    }
  });
  tabWatch.observe(document.documentElement, {subtree:true, attributes:true, attributeFilter:['style','class']});

  // Also run once on load if admin already visible
  window.addEventListener('load', ()=>{
    bindFixedGlobalSearch();
    bindFixedExportAll();
    const admin = document.getElementById('admin');
    if(admin && admin.style.display !== 'none'){
      ensureChartJs(()=>{ buildOrUpdateCharts(); startAutoSyncObserver(); });
    }
  });
})();



(function(){
  const LS = window.localStorage;
  const isAdmin = ()=> (LS.getItem('namkhana_role')==='admin');
  const TABLE_IDS = [
    // Monthly
    'table-interruption','table-meter','table-secure','table-peak','table-vm',
    // Yearly (common ids used in your builds)
    'table-yearly-peak','table-yearly-vm','table-y-peak','table-y-vm','table-y-inter','table-y-meter'
  ];

  function fmtTS(d=new Date()){
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2,'0');
    const min = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`; // DD-MM-YYYY HH:mm:ss
  }

  function toast(msg){
    const t=document.createElement('div'); t.className='admin-toast'; t.textContent=msg;
    document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),200); },1500);
  }

  /* ===== History (per table) ===== */
  function histKey(id){ return 'admin_hist_'+id; }
  function histLoad(id){ try{return JSON.parse(LS.getItem(histKey(id))||'[]')}catch(e){return []} }
  function histPush(id, theadHTML, tbodyHTML){
    const arr = histLoad(id);
    arr.unshift({ts: fmtTS(), thead: theadHTML, tbody: tbodyHTML});
    LS.setItem(histKey(id), JSON.stringify(arr.slice(0,5)));
  }

  /* ===== Build admin toolbar for a table ===== */
  function buildToolbar(table){
    if(!table || table.dataset.adminToolbar) return;
    table.dataset.adminToolbar = '1';
    const bar = document.createElement('div');
    bar.className = 'admin-toolbar';
    bar.innerHTML = `
      <div class="admin-menu">
        <button class="admin-button">⚙️ Admin Controls ▾</button>
        <div class="dropdown">
          <button data-act="add-row">➕ Add Row</button>
          <button data-act="delete-row">🗑️ Delete Row</button>
          <button data-act="add-col">➕ Add Column</button>
          <button data-act="delete-col">🗑️ Delete Column</button>
          <button data-act="rename-cols">✏️ Rename Columns</button>
          <button data-act="save">💾 Save All Changes</button>
          <button data-act="recalc">🔄 Recalculate All</button>
          <button data-act="restore">⏪ Restore Version</button>
          <button data-act="resize">📐 Resize Columns</button>
          <button data-act="compact">🧭 Toggle Compact View</button>
          <button data-act="freeze">📌 Freeze/Unfreeze Columns</button>
        </div>
      </div>`;
    // place immediately before table within same parent (top-left)
    table.parentElement.insertBefore(bar, table);

    // only show for admins
    if(isAdmin()) bar.style.display='flex';

    const btn = bar.querySelector('.admin-button');
    const dd  = bar.querySelector('.dropdown');
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      document.querySelectorAll('.admin-toolbar .dropdown.open').forEach(x=>x.classList.remove('open'));
      dd.classList.toggle('open');
    });
    document.addEventListener('click', ()=> dd.classList.remove('open'));

    dd.addEventListener('click', (e)=>{
      const act = e.target?.getAttribute('data-act');
      if(!act) return;
      handleAction(table, act);
      dd.classList.remove('open');
    });
  }

  /* ===== Actions ===== */
  function handleAction(table, act){
    const thead = table.querySelector('thead'); const tbody = table.querySelector('tbody');
    if(!thead || !tbody){ toast('⚠️ Table has no thead/tbody'); return; }
    const id = table.id || 'table';

    function colCount(){ return (thead.querySelectorAll('th')||[]).length; }
    function rowCount(){ return (tbody.querySelectorAll('tr')||[]).length; }

    if(act==='add-row'){
      const cols = colCount();
      const tr = document.createElement('tr');
      for(let i=0;i<cols;i++){
        const td = document.createElement('td');
        td.contentEditable = true;
        if(i===0){ td.textContent = String(rowCount()+1); } // Sl. No.
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
      toast('➕ Row added');
    }

    if(act==='delete-row'){
      const rows = tbody.querySelectorAll('tr');
      if(rows.length===0){ toast('No rows to delete'); return; }
      if(!confirm('Delete last row?')) return;
      rows[rows.length-1].remove();
      toast('🗑️ Row deleted');
    }

    if(act==='add-col'){
      const th = document.createElement('th'); th.textContent='New Column'; th.contentEditable = true;
      th.classList.add('th-resizable'); const handle=document.createElement('div'); handle.className='col-resizer'; th.appendChild(handle);
      thead.querySelector('tr')?.appendChild(th);
      tbody.querySelectorAll('tr').forEach(tr=>{
        const td=document.createElement('td'); td.contentEditable = true; tr.appendChild(td);
      });
      toast('➕ Column added');
    }

    if(act==='delete-col'){
      const trh = thead.querySelector('tr'); if(!trh) return;
      const ths = trh.querySelectorAll('th');
      if(ths.length<=1){ toast('Cannot remove last column'); return; }
      trh.removeChild(ths[ths.length-1]);
      tbody.querySelectorAll('tr').forEach(tr=>{ const tds=tr.querySelectorAll('td'); if(tds.length) tr.removeChild(tds[tds.length-1]); });
      toast('🗑️ Column deleted');
    }

    if(act==='rename-cols'){
      thead.querySelectorAll('th').forEach(th=> th.contentEditable = !th.isContentEditable);
      toast('✏️ Rename mode toggled');
    }

    if(act==='save'){
      histPush(id, thead.innerHTML, tbody.innerHTML);
      // trigger app saves if any
      try{ window.saveAllDrafts && window.saveAllDrafts(); }catch(e){}
      // recalc and chart refresh
      try{ window.triggerYearlySync && window.triggerYearlySync(); }catch(e){}
      try{ window.yearlyRecalc && window.yearlyRecalc(); }catch(e){}
      try{ window.buildOrUpdateCharts && window.buildOrUpdateCharts(); }catch(e){}
      toast('💾 Saved ' + fmtTS());
    }

    if(act==='recalc'){
      try{ window.triggerYearlySync && window.triggerYearlySync(); }catch(e){}
      try{ window.yearlyRecalc && window.yearlyRecalc(); }catch(e){}
      try{ window.buildOrUpdateCharts && window.buildOrUpdateCharts(); }catch(e){}
      toast('🔄 Recalculated');
    }

    if(act==='restore'){
      const modal = document.getElementById('admin-restore-modal');
      const list = document.getElementById('restore-list');
      list.innerHTML='';
      const hist = histLoad(id);
      if(hist.length===0){ list.innerHTML='<i>No versions saved yet</i>'; }
      hist.forEach((h,idx)=>{
        const b=document.createElement('button'); b.textContent = `${idx+1}. ${h.ts}`;
        b.addEventListener('click', ()=>{
          thead.innerHTML = h.thead; tbody.innerHTML = h.tbody;
          try{ window.buildOrUpdateCharts && window.buildOrUpdateCharts(); }catch(e){}
          modal.style.display='none'; toast('⏪ Restored '+h.ts);
        });
        list.appendChild(b);
      });
      modal.style.display='flex';
      document.getElementById('restore-cancel').onclick = ()=> modal.style.display='none';
    }

    if(act==='resize'){
      const ths = thead.querySelectorAll('th');
      ths.forEach(th=>{
        if(!th.classList.contains('th-resizable')){
          th.classList.add('th-resizable');
          const handle=document.createElement('div'); handle.className='col-resizer'; th.appendChild(handle);
        }
      });
      enableResize(table);
      toast('📐 Resize enabled (drag column edges)');
    }

    if(act==='compact'){
      table.classList.toggle('compact-view');
      toast('🧭 Compact view toggled');
    }

    if(act==='freeze'){
      table.classList.toggle('freeze-first');
      toast('📌 Freeze/Unfreeze first column');
    }
  }

  function enableResize(table){
    let startX, startW, targetTh;
    table.addEventListener('mousedown', (e)=>{
      const handle = e.target.closest('.col-resizer'); if(!handle) return;
      targetTh = handle.parentElement; startX = e.pageX; startW = targetTh.offsetWidth;
      document.body.style.cursor='col-resize';
      function onMove(ev){
        const dx = ev.pageX - startX;
        const w = Math.max(50, startW + dx);
        targetTh.style.width = w+'px';
      }
      function onUp(){
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor='default';
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  /* ===== Inject toolbars for known tables (only for admins) ===== */
  function injectAll(){
    if(!isAdmin()) return;
    TABLE_IDS.forEach(id=>{
      const t = document.getElementById(id);
      if(t) buildToolbar(t);
    });
  }

  /* Observe DOM so late-mounted tables get toolbars too */
  const mo = new MutationObserver(()=> injectAll());
  mo.observe(document.documentElement, {childList:true, subtree:true});

  window.addEventListener('load', ()=> injectAll());
})();



(function(){
  const LS = localStorage;

  function isAdmin(){
    if(window.currentUser && typeof window.currentUser==='object'){
      return String(window.currentUser.role||'').toLowerCase()==='admin';
    }
    return LS.getItem('namkhana_role')==='admin';
  }
  function purgeOperatorToolbar(){
    if(!isAdmin()){
      document.querySelectorAll('.admin-toolbar').forEach(el=>el.remove());
    }
  }

  window.handleAction = function(table, act){
    if(!isAdmin() || !table) return;
    const thead = table.querySelector('thead'), tbody = table.querySelector('tbody');
    if(!thead || !tbody){ alert('Table missing header/body'); return; }
    const headRow = thead.querySelector('tr');
    const colCount = ()=> headRow ? headRow.children.length : 0;
    const rowCount = ()=> tbody.querySelectorAll('tr').length;

    function fmtTS(d=new Date()){
      const dd=String(d.getDate()).padStart(2,'0');
      const mm=String(d.getMonth()+1).padStart(2,'0');
      const yy=d.getFullYear();
      const hh=String(d.getHours()).padStart(2,'0');
      const mi=String(d.getMinutes()).padStart(2,'0');
      const ss=String(d.getSeconds()).padStart(2,'0');
      return `${dd}-${mm}-${yy} ${hh}:${mi}:${ss}`;
    }
    function toast(msg){
      const t=document.createElement('div'); t.className='admin-toast'; t.textContent=msg;
      document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show'));
      setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),180); },1400);
    }
    function saveSnapshot(){
      try{
        const key='admin_hist_'+(table.id||'table');
        const list=JSON.parse(LS.getItem(key)||'[]');
        list.unshift({ts:fmtTS(),thead:thead.innerHTML,tbody:tbody.innerHTML});
        LS.setItem(key,JSON.stringify(list.slice(0,5)));
      }catch(e){}
    }

    if(act==='add-row'){
      const tr=document.createElement('tr');
      for(let i=0;i<colCount();i++){
        const td=document.createElement('td'); td.contentEditable=true;
        if(i===0) td.textContent=rowCount()+1;
        tr.appendChild(td);
      }
      tbody.appendChild(tr); toast('➕ Row added'); return;
    }

    if(act==='delete-row'){
      const rows=tbody.querySelectorAll('tr');
      if(rows.length===0){ alert('No rows to delete'); return; }
      if(!confirm('Delete the last row?')) return;
      rows[rows.length-1].remove();
      Array.from(tbody.querySelectorAll('tr')).forEach((tr,i)=>{
        if(tr.children[0]) tr.children[0].textContent=String(i+1);
      });
      toast('🗑️ Row deleted'); return;
    }

    if(act==='add-col'){
      const th=document.createElement('th'); th.textContent='New Column'; th.contentEditable=true;
      th.classList.add('th-resizable'); const h=document.createElement('div'); h.className='col-resizer'; th.appendChild(h);
      (headRow||thead.appendChild(document.createElement('tr'))).appendChild(th);
      tbody.querySelectorAll('tr').forEach(tr=>{const td=document.createElement('td');td.contentEditable=true;tr.appendChild(td);});
      toast('➕ Column added'); return;
    }

    if(act==='delete-col'){
      if(!headRow || headRow.children.length<=1){ alert('Cannot delete last column'); return; }
      const last=headRow.children.length-1;
      headRow.removeChild(headRow.children[last]);
      tbody.querySelectorAll('tr').forEach(tr=>{if(tr.children.length>last) tr.removeChild(tr.children[last]);});
      toast('🗑️ Column deleted'); return;
    }

    if(act==='rename-cols'){
      thead.querySelectorAll('th').forEach(th=> th.contentEditable=!th.isContentEditable);
      toast('✏️ Rename mode toggled'); return;
    }

    if(act==='save'){
      saveSnapshot();
      try{window.saveAllDrafts&&window.saveAllDrafts();}catch(e){}
      try{window.triggerYearlySync&&window.triggerYearlySync();}catch(e){}
      try{window.yearlyRecalc&&window.yearlyRecalc();}catch(e){}
      toast('💾 Saved '+fmtTS()); return;
    }

    if(act==='recalc'){
      try{window.triggerYearlySync&&window.triggerYearlySync();}catch(e){}
      try{window.yearlyRecalc&&window.yearlyRecalc();}catch(e){}
      toast('🔄 Recalculated'); return;
    }

    if(act==='resize'){
      thead.querySelectorAll('th').forEach(th=>{
        if(!th.classList.contains('th-resizable')){
          th.classList.add('th-resizable');
          const r=document.createElement('div');r.className='col-resizer';th.appendChild(r);
        }
      });
      if(!table.dataset.resizeBound){
        table.dataset.resizeBound='1';
        let startX,startW,targetTh;
        table.addEventListener('mousedown',(e)=>{
          const handle=e.target.closest('.col-resizer');if(!handle) return;
          targetTh=handle.parentElement;startX=e.pageX;startW=targetTh.offsetWidth;
          document.body.style.cursor='col-resize';
          function onMove(ev){const w=Math.max(60,startW+(ev.pageX-startX));targetTh.style.width=w+'px';}
          function onUp(){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);document.body.style.cursor='default';}
          document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
        });
      }
      toast('📐 Resize ready'); return;
    }

    if(act==='compact'){table.classList.toggle('compact-view');toast('🧭 Compact view toggled');return;}
    if(act==='freeze'){table.classList.toggle('freeze-first');toast('📌 Freeze/Unfreeze first column');return;}
  };

  function injectAdminToolbars(){
    if(!isAdmin()){purgeOperatorToolbar();return;}
    document.querySelectorAll('table[id^="table-"]').forEach(tbl=>{
      if(tbl.dataset.adminToolbar) return;
      const bar=document.createElement('div');
      bar.className='admin-toolbar';
      bar.innerHTML=`<div class="admin-menu">
        <button class="admin-button">⚙️ Admin Controls ▾</button>
        <div class="dropdown">
          <button data-act="add-row">➕ Add Row</button>
          <button data-act="delete-row">🗑️ Delete Row</button>
          <button data-act="add-col">➕ Add Column</button>
          <button data-act="delete-col">🗑️ Delete Column</button>
          <button data-act="rename-cols">✏️ Rename Columns</button>
          <button data-act="save">💾 Save All Changes</button>
          <button data-act="recalc">🔄 Recalculate All</button>
          <button data-act="resize">📐 Resize Columns</button>
          <button data-act="compact">🧭 Toggle Compact View</button>
          <button data-act="freeze">📌 Freeze/Unfreeze Columns</button>
        </div></div>`;
      tbl.parentElement.insertBefore(bar,tbl);
      tbl.dataset.adminToolbar='1';
      bar.style.display='flex';
      const btn=bar.querySelector('.admin-button'),dd=bar.querySelector('.dropdown');
      btn.addEventListener('click',(e)=>{e.stopPropagation();document.querySelectorAll('.admin-toolbar .dropdown.open').forEach(x=>x.classList.remove('open'));dd.classList.toggle('open');});
      document.addEventListener('click',()=>dd.classList.remove('open'));
      dd.addEventListener('click',(e)=>{const act=e.target&&e.target.getAttribute('data-act');if(act)window.handleAction(tbl,act);dd.classList.remove('open');});
    });
  }

  const prevAfterLogin=window.afterLogin;
  window.afterLogin=function(){try{prevAfterLogin&&prevAfterLogin();}catch(e){}if(isAdmin())injectAdminToolbars();else purgeOperatorToolbar();};
  window.addEventListener('load',()=>{if(isAdmin())injectAdminToolbars();else purgeOperatorToolbar();});
  new MutationObserver(()=>{if(isAdmin())injectAdminToolbars();else purgeOperatorToolbar();}).observe(document.documentElement,{childList:true,subtree:true});
})();





const FEEDER_LIST = [
  'NARAYANPUR','UKILERHAT','RAJNAGAR','INCOMING - 1','INCOMING - 2','33KV CIRCUIT - 1','33KV CIRCUIT - 2','RADHANAGAR CIRCUIT - 1'
];
let _faChartMonthly=null, _faChartYearly=null, _faCurrentFeeder=null;

function faPopulateYearOptions(){
  const sel = document.getElementById('fa-year'); if(!sel) return;
  sel.innerHTML='';
  const now = new Date(); 
  for(let y=now.getFullYear()+1; y>=now.getFullYear()-3; y--){
    const o=document.createElement('option'); o.value=String(y); o.textContent=String(y); sel.appendChild(o);
  }
  sel.value = String(now.getFullYear());
}

function faRenderGrid(){
  const grid = document.getElementById('fa-grid'); if(!grid) return;
  grid.innerHTML = FEEDER_LIST.map(name=>`
    <div class="fa-card" data-feeder="${name}">
      <div class="fa-card-title">⚡ ${name}</div>
      <div class="fa-card-sub">Tap to view monthly & yearly charts</div>
    </div>
  `).join('');
}

function faBindGrid(){
  document.querySelectorAll('.fa-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const name = card.getAttribute('data-feeder');
      _faCurrentFeeder = name;
      faOpenModal(name);
    });
  });
}

function faOpenModal(name){
  const modal = document.getElementById('fa-modal');
  document.getElementById('fa-modal-title').textContent = name;
  document.getElementById('fa-monthly-year').textContent = document.getElementById('fa-year').value;
  modal.classList.add('open');
  setTimeout(()=> faDrawCharts(), 50);
}

function faCloseModal(){
  const modal = document.getElementById('fa-modal');
  modal.classList.remove('open');
  if(_faChartMonthly){ _faChartMonthly.destroy(); _faChartMonthly=null; }
  if(_faChartYearly){ _faChartYearly.destroy(); _faChartYearly=null; }
}

function getCurrentPeriodYearMonth(){
  const ps = document.getElementById('period-start')?.value || '';
  try{ const d=new Date(ps+'T00:00:00'); return {year:d.getFullYear(), month:d.getMonth()}; }catch(e){}
  const t=new Date(); return {year:t.getFullYear(), month:t.getMonth()};
}

function collectFeederMonthlySeries(year, feeder){
  const arr = Array(12).fill(null);
  for(const k of Object.keys(localStorage)){
    try{
      if(!String(k).startsWith('namkhana_peak_')) continue;
      const p=JSON.parse(localStorage.getItem(k));
      const y=new Date(p.start).getFullYear(); if(y!==year) continue;
      const m=new Date(p.start).getMonth();
      (p.rows||[]).forEach(cols=>{
        const fd=(cols[1]||'').trim();
        const v=Number(cols[2]||NaN);
        if(fd===feeder && !isNaN(v)) arr[m] = v;
      });
    }catch(e){}
  }
  const cur = getCurrentPeriodYearMonth();
  if(cur.year === year){
    document.querySelectorAll('#table-peak tbody tr').forEach(tr=>{
      const fd = (tr.children[1]?.textContent||'').trim();
      const v = Number((tr.children[2]?.textContent||'').trim() || NaN);
      if(fd===feeder && !isNaN(v)) arr[cur.month] = v;
    });
  }
  return arr;
}

function collectFeederYearlySeries(feeder){
  const now = new Date();
  const years = [now.getFullYear()-3, now.getFullYear()-2, now.getFullYear()-1, now.getFullYear()];
  const out = {}; years.forEach(y=> out[y]=null);
  for(const k of Object.keys(localStorage)){
    try{
      if(!String(k).startsWith('namkhana_peak_')) continue;
      const p=JSON.parse(localStorage.getItem(k));
      const y=new Date(p.start).getFullYear(); if(!(y in out)) continue;
      let max=null;
      (p.rows||[]).forEach(cols=>{
        const fd=(cols[1]||'').trim();
        const v=Number(cols[2]||NaN);
        if(fd===feeder && !isNaN(v)) max = (max==null)? v : Math.max(max, v);
      });
      if(max!=null) out[y]=max;
    }catch(e){}
  }
  document.querySelectorAll('#table-yearly-peak tbody tr').forEach(tr=>{
    const dateTxt = (tr.children[3]?.textContent||'').trim();
    const dt = (typeof parseDDMMYYYY==='function') ? parseDDMMYYYY(dateTxt) : null;
    const peakA = Number((tr.children[2]?.textContent||'').trim()||NaN);
    const fdTxt = (tr.children[1]?.textContent||'').trim();
    if(dt && !isNaN(peakA) && fdTxt && fdTxt.toUpperCase().includes(feeder.toUpperCase())){
      const y = dt.getFullYear();
      if(out.hasOwnProperty(y)){
        out[y] = (out[y]==null) ? peakA : Math.max(out[y], peakA);
      }
    }
  });
  return out;
}

function faDrawCharts(){
  const feeder = _faCurrentFeeder;
  const y = Number(document.getElementById('fa-year').value || new Date().getFullYear());
  document.getElementById('fa-monthly-year').textContent = y;
  const monthly = collectFeederMonthlySeries(y, feeder);
  const yearlyMap = collectFeederYearlySeries(feeder);
  const yearlyLabels = Object.keys(yearlyMap).map(v=>Number(v)).sort((a,b)=>a-b);
  const yearlyData = yearlyLabels.map(y=> yearlyMap[y]);

  const mctx = document.getElementById('fa-chart-monthly').getContext('2d');
  if(_faChartMonthly) _faChartMonthly.destroy();
  _faChartMonthly = new Chart(mctx, {
    type:'line',
    data:{ labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets:[{ label:'Monthly Peak (A)', data:monthly, tension:.25, fill:false }] },
    options:{ responsive:true, maintainAspectRatio:false, animation:false,
      plugins:{ legend:{position:'bottom'} }, scales:{ y:{ title:{display:true, text:'A'} } } }
  });

  const yctx = document.getElementById('fa-chart-yearly').getContext('2d');
  if(_faChartYearly) _faChartYearly.destroy();
  _faChartYearly = new Chart(yctx, {
    type:'bar',
    data:{ labels: yearlyLabels, datasets:[{ label:'Yearly Max Peak (A)', data: yearlyData }] },
    options:{ responsive:true, maintainAspectRatio:false, animation:false,
      plugins:{ legend:{position:'bottom'} }, scales:{ y:{ title:{display:true, text:'A'} } } }
  });

  const now = new Date(); const hh=String(now.getHours()).padStart(2,'0'), mm=String(now.getMinutes()).padStart(2,'0'), ss=String(now.getSeconds()).padStart(2,'0');
  document.getElementById('fa-updated').textContent = `${hh}:${mm}:${ss}`;
}

function faBindModal(){
  document.getElementById('fa-modal-close')?.addEventListener('click', faCloseModal);
  document.getElementById('fa-modal')?.addEventListener('click', (e)=>{
    if(e.target.id==='fa-modal') faCloseModal();
  });
  document.getElementById('fa-modal-refresh')?.addEventListener('click', faDrawCharts);
  document.getElementById('fa-export')?.addEventListener('click', ()=>{
    try{
      const feeder = _faCurrentFeeder || 'Feeder';
      const pdf = new jspdf.jsPDF({orientation:'portrait', unit:'pt', format:'a4'});
      pdf.setFontSize(14); pdf.text(`Feeder: ${feeder}`, 40, 40);
      const today = new Date(); const dd=String(today.getDate()).padStart(2,'0'), mm=String(today.getMonth()+1).padStart(2,'0'), yy=today.getFullYear();
      pdf.setFontSize(10); pdf.text(`Date: ${dd}-${mm}-${yy}`, 40, 60);
      const img1 = document.getElementById('fa-chart-monthly').toDataURL('image/png', 1.0);
      const img2 = document.getElementById('fa-chart-yearly').toDataURL('image/png', 1.0);
      const maxW = 515;
      pdf.addImage(img1, 'PNG', 40, 80, maxW, 180);
      pdf.addImage(img2, 'PNG', 40, 280, maxW, 180);
      const filename = `Feeder_${feeder.replace(/\s+/g,'_')}_Report_${dd}-${mm}-${yy}.pdf`;
      pdf.save(filename);
    }catch(e){ alert('PDF export failed'); console.warn(e); }
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') faCloseModal(); });
}

function faStart(){
  const tab = document.querySelector('.main-tab[data-tab="feeders-analytics"]');
  if(tab){ tab.style.display = (currentUser && currentUser.role==='admin') ? '' : 'none'; }
  faPopulateYearOptions();
  faRenderGrid();
  faBindGrid();
  faBindModal();
  document.getElementById('fa-year')?.addEventListener('change', ()=>{
    if(document.getElementById('fa-modal').classList.contains('open')) faDrawCharts();
  });
  document.getElementById('fa-refresh')?.addEventListener('click', ()=>{
    faRenderGrid(); faBindGrid(); if(typeof toast==='function') toast('Feeders refreshed');
    if(document.getElementById('fa-modal').classList.contains('open')) faDrawCharts();
  });
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('.main-tab[data-tab="feeders-analytics"]');
    if(t){
      setTimeout(()=>{ faPopulateYearOptions(); faRenderGrid(); faBindGrid(); }, 120);
    }
  });
}

(function(){
  const _orig = window.afterLogin;
  if(typeof _orig==='function'){
    window.afterLogin = function(){
      _orig.apply(this, arguments);
      setTimeout(()=>{ if(currentUser && currentUser.role==='admin') faStart(); }, 250);
    }
  }
})();



/* ===== v1.9.19 Feeders Auto-Discovery + Chart Stability ===== */
let _faChartBusy=false, _faAutoDiscover=true;
try{ _faAutoDiscover = localStorage.getItem('fa_autoDiscover')==='false' ? false : true; }catch(e){}

function faDiscoverFeeders(){
  const set = new Set(['NARAYANPUR','UKILERHAT','RAJNAGAR','INCOMING - 1','INCOMING - 2','33KV CIRCUIT - 1','33KV CIRCUIT - 2','RADHANAGAR CIRCUIT - 1']);
  if(!_faAutoDiscover) return Array.from(set).sort();
  // scan monthly table
  document.querySelectorAll('#table-peak tbody tr').forEach(tr=>{
    const f = (tr.children[1]?.textContent||'').trim(); if(f) set.add(f);
  });
  // scan drafts
  for(const k of Object.keys(localStorage)){
    if(!String(k).startsWith('namkhana_peak_')) continue;
    try{
      const p=JSON.parse(localStorage.getItem(k));
      (p.rows||[]).forEach(cols=>{ const fd=(cols[1]||'').trim(); if(fd) set.add(fd); });
    }catch(e){}
  }
  return Array.from(set).sort();
}

function faRenderGrid(){
  const grid=document.getElementById('fa-grid'); if(!grid) return;
  const feeders=faDiscoverFeeders();
  grid.innerHTML=feeders.map(name=>`
    <div class="fa-card" data-feeder="${name}">
      <div class="fa-card-title">⚡ ${name}</div>
      <div class="fa-card-sub">Tap to view monthly & yearly charts</div>
    </div>
  `).join('');
}

function faToggleAutoDiscover(){
  _faAutoDiscover=!_faAutoDiscover;
  try{localStorage.setItem('fa_autoDiscover',_faAutoDiscover);}catch(e){}
  const btn=document.getElementById('fa-auto');
  if(btn) btn.textContent=_faAutoDiscover?'Auto-Discover: ON':'Auto-Discover: OFF';
  faRenderGrid(); faBindGrid();
}

function faDrawCharts(){
  if(_faChartBusy) return; _faChartBusy=true;
  try{
    const feeder=_faCurrentFeeder;
    const y=Number(document.getElementById('fa-year').value||new Date().getFullYear());
    document.getElementById('fa-monthly-year').textContent=y;
    const monthly=collectFeederMonthlySeries(y,feeder);
    const yearlyMap=collectFeederYearlySeries(feeder);
    const yearlyLabels=Object.keys(yearlyMap).map(v=>Number(v)).sort((a,b)=>a-b);
    const yearlyData=yearlyLabels.map(y=>yearlyMap[y]);
    const mcv=document.getElementById('fa-chart-monthly'), ycv=document.getElementById('fa-chart-yearly');
    if(_faChartMonthly){_faChartMonthly.destroy();_faChartMonthly=null;} if(_faChartYearly){_faChartYearly.destroy();_faChartYearly=null;}
    mcv.width=mcv.width; ycv.width=ycv.width; // reset
    const mctx=mcv.getContext('2d'), yctx=ycv.getContext('2d');
    _faChartMonthly=new Chart(mctx,{type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],datasets:[{label:'Monthly Peak (A)',data:monthly,tension:.25,fill:false}]},options:{responsive:true,animation:false,plugins:{legend:{position:'bottom'}},scales:{y:{title:{display:true,text:'A'}}}}});
    _faChartYearly=new Chart(yctx,{type:'bar',data:{labels:yearlyLabels,datasets:[{label:'Yearly Max Peak (A)',data:yearlyData}]},options:{responsive:true,animation:false,plugins:{legend:{position:'bottom'}},scales:{y:{title:{display:true,text:'A'}}}}});
    const now=new Date();document.getElementById('fa-updated').textContent=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  }catch(e){console.warn('Draw fail',e);} finally{_faChartBusy=false;}
}

function faOpenModal(name){
  if(typeof stopAdminAutoRefresh==='function') stopAdminAutoRefresh();
  if(typeof toast==='function') toast('⏸ Auto-refresh paused while viewing feeder');
  const modal=document.getElementById('fa-modal');
  document.getElementById('fa-modal-title').textContent=name;
  document.getElementById('fa-monthly-year').textContent=document.getElementById('fa-year').value;
  modal.classList.add('open');
  setTimeout(()=>faDrawCharts(),100);
}

function faCloseModal(){
  const modal=document.getElementById('fa-modal');
  modal.classList.remove('open');
  if(typeof startAdminAutoRefresh==='function') startAdminAutoRefresh();
  if(typeof toast==='function') toast('▶️ Auto-refresh resumed');
  if(_faChartMonthly){_faChartMonthly.destroy();_faChartMonthly=null;}
  if(_faChartYearly){_faChartYearly.destroy();_faChartYearly=null;}
}

function faStart(){
  const tab=document.querySelector('.main-tab[data-tab="feeders-analytics"]');
  if(tab){tab.style.display=(currentUser&&currentUser.role==='admin')?'':'none';}
  const btn=document.createElement('button');btn.id='fa-auto';btn.className='btn btn-ghost';btn.textContent=_faAutoDiscover?'Auto-Discover: ON':'Auto-Discover: OFF';btn.onclick=faToggleAutoDiscover;
  const ctrl=document.querySelector('#feeders-analytics label.small');if(ctrl&&!document.getElementById('fa-auto')) ctrl.insertAdjacentElement('afterend',btn);
  faPopulateYearOptions();faRenderGrid();faBindGrid();faBindModal();
}
(function(){const o=window.afterLogin;window.afterLogin=function(){o&&o.apply(this,arguments);setTimeout(()=>{if(currentUser&&currentUser.role==='admin')faStart();},300);};})();



/* v1.9.20 — Admin Summary Overview + PDF export fix */
function faIsAdmin(){ return currentUser && currentUser.role==='admin'; }

function faGetMonthlyValuesForAllFeeders(year){
  // Reads current month values from table-peak (live) and drafts for others (but we need only current month avg)
  const {year:curY, month:curM} = (typeof getCurrentPeriodYearMonth==='function') ? getCurrentPeriodYearMonth() : (function(){ const t=new Date(); return {year:t.getFullYear(),month:t.getMonth()}; })();
  const values = [];
  if(curY === year){
    document.querySelectorAll('#table-peak tbody tr').forEach(tr=>{
      const v = Number((tr.children[2]?.textContent||'').trim()||NaN);
      if(!isNaN(v)) values.push(v);
    });
  }
  // If table empty, fallback to drafts for that month
  if(values.length===0){
    for(const k of Object.keys(localStorage)){
      try{
        if(!String(k).startsWith('namkhana_peak_')) continue;
        const p = JSON.parse(localStorage.getItem(k));
        const y = new Date(p.start).getFullYear(); const m = new Date(p.start).getMonth();
        if(y===year && m===curM){
          (p.rows||[]).forEach(cols=>{
            const v = Number(cols[2]||NaN);
            if(!isNaN(v)) values.push(v);
          });
        }
      }catch(e){}
    }
  }
  return values;
}

function faGetHighestYearlyPeak(){
  let maxV = null;
  // Try Yearly Peak table first
  document.querySelectorAll('#table-yearly-peak tbody tr').forEach(tr=>{
    const v = Number((tr.children[2]?.textContent||'').trim()||NaN);
    if(!isNaN(v)) maxV = (maxV==null) ? v : Math.max(maxV, v);
  });
  if(maxV!=null) return maxV;
  // Fallback to drafts: take max across all namkhana_peak_* rows
  for(const k of Object.keys(localStorage)){
    try{
      if(!String(k).startsWith('namkhana_peak_')) continue;
      const p = JSON.parse(localStorage.getItem(k));
      (p.rows||[]).forEach(cols=>{
        const v = Number(cols[2]||NaN);
        if(!isNaN(v)) maxV = (maxV==null)? v : Math.max(maxV, v);
      });
    }catch(e){}
  }
  return maxV;
}

function faRenderSummary(){
  if(!faIsAdmin()){ const s=document.getElementById('fa-summary'); if(s) s.style.display='none'; return; }
  const year = Number(document.getElementById('fa-year')?.value || new Date().getFullYear());
  const total = document.querySelectorAll('#fa-grid .fa-card').length;
  const vals = faGetMonthlyValuesForAllFeeders(year);
  const avg = (vals.length? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : null);
  const peak = faGetHighestYearlyPeak();
  // Paint
  const swrap = document.getElementById('fa-summary');
  if(!swrap) return;
  swrap.style.display = 'grid';
  const vcount = document.getElementById('fa-sum-count');
  const vavg = document.getElementById('fa-sum-avg');
  const vpeak = document.getElementById('fa-sum-peak');
  if(vcount) vcount.textContent = String(total||0);
  if(vavg) vavg.textContent = (avg!=null? String(avg) : '—');
  if(vpeak) vpeak.textContent = (peak!=null? String(peak) : '—');
}

/* Fix: robust PDF export using render sync + html2canvas fallback */
async function faExportPDFClean(){
  try{
    const feeder = _faCurrentFeeder || 'Feeder';
    // Ensure charts have rendered
    await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,120)));
    // Try native canvas first
    let img1 = null, img2 = null;
    try{
      const c1 = document.getElementById('fa-chart-monthly');
      const c2 = document.getElementById('fa-chart-yearly');
      img1 = c1.toDataURL('image/png', 1.0);
      img2 = c2.toDataURL('image/png', 1.0);
      if((img1||'').length < 1000 || (img2||'').length < 1000){ throw new Error('Canvas not ready'); }
    }catch(_){
      // Fallback: html2canvas on their parent containers
      const p1 = document.getElementById('fa-chart-monthly').parentElement;
      const p2 = document.getElementById('fa-chart-yearly').parentElement;
      const cap1 = await html2canvas(p1, {useCORS:true, backgroundColor:'#ffffff', scale:2});
      const cap2 = await html2canvas(p2, {useCORS:true, backgroundColor:'#ffffff', scale:2});
      img1 = cap1.toDataURL('image/png', 1.0);
      img2 = cap2.toDataURL('image/png', 1.0);
    }
    const pdf = new jspdf.jsPDF({orientation:'portrait', unit:'pt', format:'a4'});
    pdf.setFontSize(14); pdf.text(`Feeder: ${feeder}`, 40, 40);
    const today = new Date(); const dd=String(today.getDate()).padStart(2,'0'), mm=String(today.getMonth()+1).padStart(2,'0'), yy=today.getFullYear();
    pdf.setFontSize(10); pdf.text(`Date: ${dd}-${mm}-${yy}`, 40, 60);
    const maxW = 515;
    pdf.addImage(img1, 'PNG', 40, 80, maxW, 180);
    pdf.addImage(img2, 'PNG', 40, 280, maxW, 180);
    const filename = `Feeder_${feeder.replace(/\s+/g,'_')}_Report_${dd}-${mm}-${yy}.pdf`;
    pdf.save(filename);
  }catch(e){
    alert('PDF export failed. Please try again after charts load.');
    console.warn('PDF export error', e);
  }
}

/* Hook summary & export buttons into existing flows */
(function(){
  // Wire export button to new function
  const btn = document.getElementById('fa-export');
  if(btn){ btn.removeEventListener?.('click', ()=>{}); btn.onclick = ()=> faExportPDFClean(); }

  // Refresh summary whenever grid changes or controls are used
  document.getElementById('fa-refresh')?.addEventListener('click', ()=> setTimeout(faRenderSummary, 150));
  document.getElementById('fa-year')?.addEventListener('change', ()=> setTimeout(faRenderSummary, 150));
  document.getElementById('fa-auto')?.addEventListener('click', ()=> setTimeout(faRenderSummary, 150));

  // When tab is activated
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('.main-tab[data-tab="feeders-analytics"]');
    if(t) setTimeout(faRenderSummary, 200);
  });

  // First-time render (after login init from faStart)
  setTimeout(faRenderSummary, 400);
})();



/* v1.9.21 — Admin Summary (Voltage) + PDF Export Fix 2 */

function faGetVoltageExtremes(){
  let maxV=null, minV=null;
  // Try Yearly Voltage table
  document.querySelectorAll('#table-yearly-voltage tbody tr').forEach(tr=>{
    const vMax = Number((tr.children[2]?.textContent||'').trim()||NaN);
    const vMin = Number((tr.children[3]?.textContent||'').trim()||NaN);
    if(!isNaN(vMax)) maxV = (maxV==null)? vMax : Math.max(maxV,vMax);
    if(!isNaN(vMin)) minV = (minV==null)? vMin : Math.min(minV,vMin);
  });
  // Fallback to drafts
  for(const k of Object.keys(localStorage)){
    try{
      if(!String(k).startsWith('namkhana_voltage_')) continue;
      const p = JSON.parse(localStorage.getItem(k));
      (p.rows||[]).forEach(cols=>{
        const vMax = Number(cols[2]||NaN);
        const vMin = Number(cols[3]||NaN);
        if(!isNaN(vMax)) maxV = (maxV==null)? vMax : Math.max(maxV,vMax);
        if(!isNaN(vMin)) minV = (minV==null)? vMin : Math.min(minV,vMin);
      });
    }catch(e){}
  }
  return {maxV, minV};
}

async function faExportPDFFinal(){
  try{
    const feeder = _faCurrentFeeder || 'Feeder';
    const c1 = document.getElementById('fa-chart-monthly').parentElement;
    const c2 = document.getElementById('fa-chart-yearly').parentElement;
    await new Promise(r=>setTimeout(r,300)); // wait render
    const cap1 = await html2canvas(c1,{useCORS:true,backgroundColor:'#fff',scale:2});
    const cap2 = await html2canvas(c2,{useCORS:true,backgroundColor:'#fff',scale:2});
    const img1 = cap1.toDataURL('image/png',1.0);
    const img2 = cap2.toDataURL('image/png',1.0);
    const pdf = new jspdf.jsPDF({orientation:'portrait',unit:'pt',format:'a4'});
    pdf.setFontSize(14); pdf.text(`Feeder: ${feeder}`,40,40);
    const today=new Date();const dd=String(today.getDate()).padStart(2,'0'),mm=String(today.getMonth()+1).padStart(2,'0'),yy=today.getFullYear();
    pdf.setFontSize(10); pdf.text(`Date: ${dd}-${mm}-${yy}`,40,60);
    const maxW=515;
    pdf.addImage(img1,'PNG',40,80,maxW,180);
    pdf.addImage(img2,'PNG',40,280,maxW,180);
    const filename=`Feeder_${feeder.replace(/\s+/g,'_')}_Report_${dd}-${mm}-${yy}.pdf`;
    pdf.save(filename);
    if(typeof toast==='function') toast('✅ PDF saved successfully!');
  }catch(e){
    alert('PDF export failed.');
    console.warn('PDF export error',e);
  }
}

// Override export button handler
(function(){
  const btn=document.getElementById('fa-export');
  if(btn) btn.onclick=()=>faExportPDFFinal();

  // Extend summary to include voltage metrics
  const oldRender = window.faRenderSummary;
  window.faRenderSummary = function(){
    oldRender && oldRender();
    const {maxV,minV}=faGetVoltageExtremes();
    const vMaxEl=document.getElementById('fa-sum-vmax');
    const vMinEl=document.getElementById('fa-sum-vmin');
    if(vMaxEl) vMaxEl.textContent=(maxV!=null? maxV.toFixed(2) : '—');
    if(vMinEl) vMinEl.textContent=(minV!=null? minV.toFixed(2) : '—');
  }
})();



/* v1.9.22b — Admin Summary Export (XLSX only, Admin-only) */

function faInitSummaryExportXLSXOnly(){
  const wrap=document.getElementById('fa-summary-export');
  const btn=document.getElementById('fa-export-xlsx');
  if(!wrap||!btn) return;
  if(currentUser && currentUser.role==='admin'){ wrap.style.display='block'; } else { wrap.style.display='none'; }
  btn.onclick = ()=> faExportSummaryXLSX();
}

function faCollectSummaryData(){
  const arr=[];
  const now=new Date();
  const dd=String(now.getDate()).padStart(2,'0'),mm=String(now.getMonth()+1).padStart(2,'0'),yy=now.getFullYear();
  const dateStr=`${dd}-${mm}-${yy}`;
  const metrics=['count','avg','peak','vmax','vmin'];
  const labels=['Total Feeders','Monthly Avg Load (A)','Highest Yearly Peak (A)','Yearly Max Voltage (V)','Yearly Min Voltage (V)'];
  metrics.forEach((m,i)=>{
    const el=document.getElementById('fa-sum-'+m);
    const val=el?el.textContent.trim():'—';
    arr.push({metric:labels[i],value:val,date:dateStr});
  });
  return arr;
}

function faExportSummaryXLSX(){
  try{
    const data=faCollectSummaryData();
    const admin=currentUser?.email||currentUser?.name||'Administrator';
    const now=new Date();
    const dd=String(now.getDate()).padStart(2,'0'),mm=String(now.getMonth()+1).padStart(2,'0'),yy=now.getFullYear();
    const ws_data=[['Metric','Value','Date','Generated By']];
    data.forEach(r=>ws_data.push([r.metric,r.value,r.date,admin]));
    const wb=XLSX.utils.book_new();
    const ws=XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb,ws,'Feeders_Summary');
    XLSX.writeFile(wb,`All_Feeders_Summary_${dd}-${mm}-${yy}.xlsx`);
    if(typeof toast==='function') toast('✅ Summary Excel file saved successfully!');
  }catch(e){ alert('Excel export failed'); console.error(e); }
}

// Hook after login
(function(){
  const oldAfter=window.afterLogin;
  window.afterLogin=function(){
    if(oldAfter) oldAfter.apply(this, arguments);
    setTimeout(faInitSummaryExportXLSXOnly, 400);
  };
})();



/* v1.9.26 — Modern Operator Management UI Logic */
function renderOperatorCards() {
  const tableBody = document.getElementById('operatorTableBody');
  const cardsContainer = document.getElementById('adminOperatorCards');
  if (!tableBody || !cardsContainer) return;
  cardsContainer.innerHTML = '';
  const rows = tableBody.querySelectorAll('.admin-operator-row');
  rows.forEach(row => {
    const cols = row.querySelectorAll('td');
    const card = document.createElement('div');
    card.className = 'admin-operator-card';
    card.innerHTML = `
      <div>👤 <b>${cols[0].innerText}</b></div>
      <div>📧 ${cols[1].innerText}</div>
      <div>🛠️ ${cols[2].innerText}</div>
      <div>🕒 ${cols[3].innerText}</div>
      <div class="admin-operator-actions">${cols[4].innerHTML}</div>`;
    cardsContainer.appendChild(card);
  });
}

function filterOperators() {
  const query = document.getElementById('adminSearch').value.toLowerCase();
  const filter = document.getElementById('adminFilter').value;
  document.querySelectorAll('#operatorTableBody tr').forEach(row => {
    const text = row.innerText.toLowerCase();
    const match = text.includes(query);
    if (filter === 'all' && match) row.style.display = '';
    else if (filter === 'active' && text.includes('active') && match) row.style.display = '';
    else if (filter === 'disabled' && text.includes('disabled') && match) row.style.display = '';
    else row.style.display = 'none';
  });
  renderOperatorCards();
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderOperatorCards();
  document.getElementById('adminSearch').addEventListener('input', filterOperators);
  document.getElementById('adminFilter').addEventListener('change', filterOperators);
  window.addEventListener('resize', renderOperatorCards);
});



/* ===== v1.9.26b — Admin Control Visibility Guard (Global) ===== */
document.addEventListener('DOMContentLoaded', () => {
  const adminControls = document.querySelectorAll('.admin-control');
  adminControls.forEach(ctrl => ctrl.style.display = 'none');

  setTimeout(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (storedUser && storedUser.role === 'admin') {
        adminControls.forEach(ctrl => ctrl.style.display = 'inline-flex');
      } else {
        adminControls.forEach(ctrl => ctrl.style.display = 'none');
      }
    } catch (e) {
      adminControls.forEach(ctrl => ctrl.style.display = 'none');
    }
  }, 400);
});

window.addEventListener('load', () => {
  const adminControls = document.querySelectorAll('.admin-control');
  const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  adminControls.forEach(ctrl => {
    ctrl.style.display = (storedUser && storedUser.role === 'admin') ? 'inline-flex' : 'none';
  });
});



/* ===== v1.9.26c — Admin Control Safe-Mode (Targeted) ===== */
function isVerifiedAdmin(user){
  if(!user || typeof user !== 'object') return false;
  if(user.role !== 'admin') return false;
  return /@wbsedcl\.in$/i.test(user.email || '');
}

function enforceAdminVisibility(){
  const adminControls = document.querySelectorAll('.admin-control');
  let storedUser;
  try { storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null'); } 
  catch(e){ storedUser = null; }
  const isAdmin = isVerifiedAdmin(storedUser);
  adminControls.forEach(ctrl => ctrl.style.display = isAdmin ? 'inline-flex' : 'none');
}

document.addEventListener('DOMContentLoaded', ()=> {
  enforceAdminVisibility();
  setTimeout(enforceAdminVisibility, 600);
});
window.addEventListener('load', enforceAdminVisibility);
window.addEventListener('storage', enforceAdminVisibility);



/* ===== v1.9.26d — Footer Restore on Logout ===== */
document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer');
  const loginContainer = document.getElementById('login-container');
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  // Show footer on login page if user not logged in
  if (loginContainer && !user && footer) {
    footer.style.display = 'block';
  }

  // React to logout or localStorage clear
  window.addEventListener('storage', e => {
    if (e.key === 'currentUser' && !e.newValue) {
      if (loginContainer && footer) footer.style.display = 'block';
    }
  });

  // Also catch manual logout buttons (if they clear storage)
  const observer = new MutationObserver(() => {
    const loginVisible = document.getElementById('login-container');
    if (loginVisible && footer) footer.style.display = 'block';
  });
  observer.observe(document.body, { childList: true, subtree: true });
});



/* ===== v1.9.27 — Performance & Render Fix ===== */

function fastInit() {
  try {
    enforceAdminVisibility?.();
    renderOperatorCards?.();
    enforceFooterRestore?.();
    console.log("✅ FastInit completed.");
  } catch(e) {
    console.warn("FastInit error:", e);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const start = performance.now();
  setTimeout(() => {
    fastInit();
    console.log("FastInit executed in", Math.round(performance.now() - start), "ms");
  }, 300);
});

// Ensure Admin Dashboard re-renders correctly on tab click
document.addEventListener('DOMContentLoaded', () => {
  const adminTab = document.querySelector('[data-tab="admin-dashboard"], #tab-admin-dashboard, button[onclick*="admin-dashboard"]');
  if(adminTab){
    adminTab.addEventListener('click', () => {
      enforceAdminVisibility?.();
      const adminDash = document.getElementById('admin-dashboard');
      if(adminDash){
        adminDash.style.display = 'block';
        adminDash.style.opacity = '1';
      }
    });
  }
});

// Simplified footer restore logic (no observers)
function enforceFooterRestore(){
  const footer = document.querySelector('footer');
  const loginContainer = document.getElementById('login-container');
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (loginContainer && !user && footer) {
    footer.style.display = 'block';
  }
  window.addEventListener('storage', e => {
    if (e.key === 'currentUser' && !e.newValue) {
      if (loginContainer && footer) footer.style.display = 'block';
    }
  });
}



/* ===== v1.9.27c — Combined Fix (Admin Dashboard Persistence + Footer Restore Final) ===== */

// --- Admin Dashboard Persistence Fix ---
document.addEventListener('DOMContentLoaded', () => {
  const adminSection = document.getElementById('admin-dashboard');
  if (adminSection) {
    adminSection.dataset.persist = 'true';
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (!document.contains(adminSection)) {
          document.body.appendChild(adminSection);
          console.warn('Admin Dashboard auto-restored.');
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Ensure Admin Dashboard visible when clicked
  document.querySelectorAll('[data-tab="admin-dashboard"], #tab-admin-dashboard, button[onclick*="admin-dashboard"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const adminDash = document.getElementById('admin-dashboard');
      if (adminDash) {
        adminDash.style.display = 'block';
        adminDash.style.opacity = '1';
      } else {
        console.warn('Admin Dashboard missing — restoring.');
        fastInit?.();
      }
    });
  });
});

// --- Footer Restore Final Fix ---
function footerRestoreFinal() {
  const footer = document.querySelector('footer');
  const loginContainer = document.getElementById('login-container');
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (!footer) return;

  // Show footer if user not logged in or on login page
  if (!user && loginContainer) {
    footer.style.display = 'block';
  }

  // React to logout or localStorage clear
  window.addEventListener('storage', e => {
    if (e.key === 'currentUser' && !e.newValue && loginContainer) {
      footer.style.display = 'block';
    }
  });

  // Safety recheck every 500 ms in case DOM reloads after logout
  setInterval(() => {
    const userNow = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const loginNow = document.getElementById('login-container');
    if (!userNow && loginNow && footer.style.display !== 'block') {
      footer.style.display = 'block';
    }
  }, 500);
}

window.addEventListener('DOMContentLoaded', footerRestoreFinal);



/* ===== v1.9.27d — Feeders Analytics Tab Visibility Fix ===== */
document.addEventListener('DOMContentLoaded', () => {
  const feedersTab = [...document.querySelectorAll('.main-tab')]
    .find(btn => btn.textContent.toLowerCase().includes('feeders'));
  if (!feedersTab) return;

  try {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const isAdmin = storedUser && storedUser.role === 'admin';
    if (!isAdmin) feedersTab.style.display = 'none';
  } catch (e) {
    feedersTab.style.display = 'none';
  }

  // React dynamically if session changes
  window.addEventListener('storage', e => {
    if (e.key === 'currentUser') {
      const user = JSON.parse(e.newValue || 'null');
      if (!user || user.role !== 'admin') feedersTab.style.display = 'none';
      else feedersTab.style.display = 'inline-flex';
    }
  });
});



/* ===== v1.9.27e — Feeders Analytics Access Restriction Fix ===== */
document.addEventListener('DOMContentLoaded', () => {
  const feedersTab = [...document.querySelectorAll('.main-tab')]
    .find(btn => btn.textContent.toLowerCase().includes('feeders'));
  const feedersSection = document.getElementById('feeders-analytics');

  function applyFeedersAccess() {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const isAdmin = storedUser && storedUser.role === 'admin';
      if (!isAdmin) {
        if (feedersTab) feedersTab.style.display = 'none';
        if (feedersSection) feedersSection.style.display = 'none';
      } else {
        if (feedersTab) feedersTab.style.display = 'inline-flex';
        if (feedersSection) feedersSection.style.display = 'block';
      }
    } catch (e) {
      if (feedersTab) feedersTab.style.display = 'none';
      if (feedersSection) feedersSection.style.display = 'none';
    }
  }

  // Run once on load and again if login state changes
  applyFeedersAccess();
  window.addEventListener('storage', e => {
    if (e.key === 'currentUser') applyFeedersAccess();
  });
});



(function(){
  const LS = window.localStorage;
  const isAdmin = ()=> (LS.getItem('namkhana_role')==='admin' || (window.currentUser && window.currentUser.role==='admin'));

  function cleanOperatorView(){
    if(!isAdmin()){
      document.querySelectorAll('.admin-toolbar').forEach(el=> el.remove());
    }
  }

  function injectAdminToolbars(){
    if(!isAdmin()) { cleanOperatorView(); return; }
    const tables = document.querySelectorAll('table[id^="table-"]');
    tables.forEach(tbl=>{
      if(tbl.dataset.adminToolbar) return;
      // Create toolbar wrapper
      const bar = document.createElement('div');
      bar.className='admin-toolbar';
      bar.innerHTML=`
        <div class="admin-menu">
          <button class="admin-button">⚙️ Admin Controls ▾</button>
          <div class="dropdown">
            <button data-act="add-row">➕ Add Row</button>
            <button data-act="delete-row">🗑️ Delete Row</button>
            <button data-act="add-col">➕ Add Column</button>
            <button data-act="delete-col">🗑️ Delete Column</button>
            <button data-act="rename-cols">✏️ Rename Columns</button>
            <button data-act="save">💾 Save All Changes</button>
            <button data-act="recalc">🔄 Recalculate All</button>
            <button data-act="restore">⏪ Restore Version</button>
            <button data-act="resize">📐 Resize Columns</button>
            <button data-act="compact">🧭 Toggle Compact View</button>
            <button data-act="freeze">📌 Freeze/Unfreeze Columns</button>
          </div>
        </div>`;
      tbl.parentElement.insertBefore(bar, tbl);
      tbl.dataset.adminToolbar='1';
      bar.style.display='flex';

      const btn=bar.querySelector('.admin-button');
      const dd=bar.querySelector('.dropdown');
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        document.querySelectorAll('.admin-toolbar .dropdown.open').forEach(x=>x.classList.remove('open'));
        dd.classList.toggle('open');
      });
      document.addEventListener('click',()=> dd.classList.remove('open'));
      dd.addEventListener('click',e=>{
        const act=e.target.getAttribute('data-act');
        if(act && window.handleAction) window.handleAction(tbl, act);
        dd.classList.remove('open');
      });
    });
  }

  // Observe login events or UI changes
  window.addEventListener('load', ()=>{
    setTimeout(()=>{
      injectAdminToolbars();
      cleanOperatorView();
    },800);
  });

  // Mutation observer to ensure admin sees toolbars dynamically
  const mo=new MutationObserver(()=>{
    if(isAdmin()) injectAdminToolbars(); else cleanOperatorView();
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
})();
