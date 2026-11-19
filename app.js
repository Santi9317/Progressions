/* Progressions. Self-paced days, a 4-week lifting wave, running that follows
   what you logged, and an optional model that stays inside a $3 weekly cap. */

const APP_VERSION = '4';
const SK = 'prog_v1';
const FORWARD_PREVIEW_DAYS = 27;

let state = {
  currentWeek:1, currentDayIdx:0, viewOffset:0,
  logs:[], legacyLogs:[],
  menu:{choices:{},made:{},bought:{}},
  settings:{unit:'lbs',incKg:2.27,level:'advanced',restSec:90,chime:true},
  training:{seed:{},loads:{},patternNudge:{},sessionSub:{},blockSub:{},ai:null,welcome:false,carried:false,migrated:false},
  running:{level:'consistent',daysPerWeek:2,logs:[],ai:null},
  ai:{baseUrl:'https://api.openai.com/v1',model:'gpt-4o-mini',key:'',spend:{weekId:'',milli:0},alerts:[]},
  setProgress:{},
  weightUnitFixed:true
};

let activeTab = 'today';
let mealsPane = 'menu';
let shopOnlyUnmade = false;
let mealWeekOffset = 0;
const draft = {};

function load(){
  try{
    const raw = localStorage.getItem(SK) || sessionStorage.getItem(SK);
    if(raw){
      const parsed = JSON.parse(raw);
      state = Object.assign({}, state, parsed);
      state.settings = Object.assign({unit:'lbs',incKg:2.27,level:'advanced',restSec:90,chime:true}, parsed.settings||{});
      state.training = Object.assign({seed:{},loads:{},patternNudge:{},sessionSub:{},blockSub:{},ai:null,welcome:false,carried:false,migrated:false}, parsed.training||{});
      state.running = Object.assign({level:'consistent',daysPerWeek:2,logs:[],ai:null}, parsed.running||{});
      state.ai = Object.assign({baseUrl:'https://api.openai.com/v1',model:'gpt-4o-mini',key:'',spend:{weekId:'',milli:0},alerts:[]}, parsed.ai||{});
    }
  }catch(e){}
  migrate();
}

function save(){
  try{
    const data = JSON.stringify(state);
    localStorage.setItem(SK, data);
    sessionStorage.setItem(SK, data);
  }catch(e){}
}

function migrate(){
  ensureMenu();
  if(!state.setProgress || typeof state.setProgress !== 'object') state.setProgress = {};
  if(typeof state.viewOffset !== 'number') state.viewOffset = 0;
  if(typeof state.currentWeek !== 'number') state.currentWeek = 1;
  if(typeof state.currentDayIdx !== 'number'){
    const dow = new Date().getDay();
    state.currentDayIdx = [6,0,1,2,3,4,5][dow];
  }
  if(!state.ai.alerts) state.ai.alerts = [];
  if(!state.ai.baseUrl) state.ai.baseUrl = 'https://api.openai.com/v1';
  if(!state.ai.model) state.ai.model = 'gpt-4o-mini';
  if(!state.running.logs) state.running.logs = [];
  if(!state.training.sessionSub) state.training.sessionSub = {};
  if(!state.training.blockSub) state.training.blockSub = {};
  if(!state.training.seed) state.training.seed = {};
  if(!state.legacyLogs) state.legacyLogs = [];
  rollSpend(state.ai);
  if(!state.training.migrated){
    if(state.basePlan) state.weightUnitFixed = fixLegacyWeights(state.basePlan, !!state.weightUnitFixed);
    const old = Array.isArray(state.logs) ? state.logs.filter(l=>l && l.v!==2) : [];
    if(old.length) state.legacyLogs = state.legacyLogs.concat(old);
    state.logs = Array.isArray(state.logs) ? state.logs.filter(l=>l && l.v===2) : [];
    state.training.seed = seedFromLegacy(state.basePlan, true);
    state.training.carried = Object.keys(state.training.seed).length > 0;
    state.training.welcome = state.training.carried || old.length>0;
    state.currentWeek = 1;
    state.currentDayIdx = 0;
    state.viewOffset = 0;
    state.setProgress = {};
    state.training.migrated = true;
  }
  commitLoads();
  save();
}

function commitLoads(){
  const rebuilt = rebuildTraining(state.logs, state.training.seed, state.settings);
  state.training.loads = rebuilt.loads;
  state.training.patternNudge = rebuilt.patternNudge;
}

function esc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function unit(){ return state.settings.unit==='kg' ? 'kg' : 'lbs'; }
function fmtPlate(n){
  if(!isFinite(n)) return '0';
  if(Math.abs(n-Math.round(n))<0.05) return String(Math.round(n));
  return String(Math.round(n*100)/100);
}
function toKg(val){
  const n = parseFloat(val);
  if(!isFinite(n)) return NaN;
  return unit()==='lbs' ? n/2.2046 : n;
}
function incDisplay(kg, u){
  const n = (u||unit())==='lbs' ? kg*2.2046 : kg;
  const rounded = Math.round(n*4)/4;
  if(Math.abs(rounded-Math.round(rounded))<0.05) return String(Math.round(rounded));
  return String(rounded);
}
function dateLabel(){
  return new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function currentAbsoluteDay(){ return (state.currentWeek-1)*7+state.currentDayIdx; }
function viewAbsoluteDay(){ return currentAbsoluteDay()+state.viewOffset; }
function viewWeek(){ return Math.floor(viewAbsoluteDay()/7)+1; }
function viewDayIndex(){ return ((viewAbsoluteDay()%7)+7)%7; }
function phaseName(week){ return blockOf(week).scheme.name; }
function isLogged(dayIdx, week){
  week = week || viewWeek();
  return state.logs.some(l=>l && l.v===2 && l.week===week && l.dayIdx===dayIdx);
}
function logEntry(week, dayIdx){
  return state.logs.find(l=>l && l.v===2 && l.week===week && l.dayIdx===dayIdx);
}
function setKey(week, dayIdx, slot, id){ return week+':'+dayIdx+':'+slot+':'+id; }
function draftKey(week, dayIdx, slot){ return week+':'+dayIdx+':'+slot; }

function flagAlert(kind, text, toastIt){
  if(!state.ai.alerts) state.ai.alerts = [];
  const prev = state.ai.alerts.find(a=>a.kind===kind);
  if(prev && prev.text===text){
    renderAlerts();
    return;
  }
  state.ai.alerts = state.ai.alerts.filter(a=>a.kind!==kind);
  state.ai.alerts.unshift({ kind, text, at:Date.now() });
  state.ai.alerts = state.ai.alerts.slice(0, 6);
  save();
  renderAlerts();
  if(toastIt) toast(text);
}

function loggedThisBlock(id, week){
  const key = Math.floor((Math.max(1, week)-1)/4);
  return state.logs.some(l=>l.v===2 && l.type==='lift' && Math.floor((l.week-1)/4)===key && (l.exercises||[]).some(e=>e.performedId===id));
}

function displayKg(ex, week, dayIdx, slot){
  const d = draft[draftKey(week, dayIdx, slot)];
  if(d && typeof d.weightKg==='number') return d.weightKg;
  const ai = state.training.ai;
  const blockKey = Math.floor((Math.max(1, week)-1)/4);
  if(ai && ai.blockKey===blockKey && ai.byId && typeof ai.byId[ex.id]==='number' && !loggedThisBlock(ex.id, week)){
    const loads = Object.assign({}, state.training.loads);
    loads[ex.id] = week1Kg(ex, state.training, state.settings)+ai.byId[ex.id];
    const view = Object.assign({}, state.training, { loads });
    return suggestKg(ex, week, view, state.settings);
  }
  return suggestKg(ex, week, state.training, state.settings);
}

function displayRuns(){
  const builtin = planRuns(state.running);
  const ai = state.running.ai;
  const sig = runSignature(state.running);
  if(ai && ai.sig===sig && Array.isArray(ai.sessions) && ai.sessions.length===builtin.sessions.length){
    return { note:ai.note || builtin.note, pain:builtin.pain, level:builtin.level, days:builtin.days, sessions:ai.sessions, source:'ai' };
  }
  return Object.assign({ source:'builtin' }, builtin);
}

function runForDay(week, dayIdx){
  const plan = displayRuns();
  return plan.sessions.find(s=>s.dayIdx===dayIdx) || null;
}

function changeDay(delta){
  const next = state.viewOffset+delta;
  const abs = currentAbsoluteDay()+next;
  if(abs<0 || next>FORWARD_PREVIEW_DAYS) return;
  state.viewOffset = next;
  save();
  renderToday();
  if(activeTab==='meals') renderMeals();
}

function calcStreak(){
  let abs = currentAbsoluteDay();
  if(!isLogged(state.currentDayIdx, state.currentWeek)) abs -= 1;
  let n = 0;
  while(abs>=0){
    const w = Math.floor(abs/7)+1;
    const d = abs%7;
    if(!isLogged(d, w)) break;
    n++;
    abs--;
  }
  return n;
}

function rewindIfJustCompleted(week, dayIdx){
  const abs = (week-1)*7+dayIdx;
  if(abs!==currentAbsoluteDay()-1) return;
  if(state.currentDayIdx===0){
    if(state.currentWeek>1){ state.currentWeek--; state.currentDayIdx = 6; }
  }else state.currentDayIdx--;
  state.viewOffset = 0;
}

function advance(){
  state.currentDayIdx++;
  if(state.currentDayIdx>6){ state.currentDayIdx = 0; state.currentWeek++; }
  state.viewOffset = 0;
}

function canUndo(week, dayIdx){
  const abs = (week-1)*7+dayIdx;
  return abs===currentAbsoluteDay()-1;
}

function undoDay(week, dayIdx){
  if(!canUndo(week, dayIdx)) return;
  const idx = state.logs.findIndex(l=>l && l.v===2 && l.week===week && l.dayIdx===dayIdx);
  if(idx<0) return;
  const removed = state.logs.splice(idx, 1)[0];
  if(removed.run){
    const ri = state.running.logs.findIndex(r=>r.at===removed.run.at);
    if(ri>=0) state.running.logs.splice(ri, 1);
    state.running.ai = null;
  }
  rewindIfJustCompleted(week, dayIdx);
  commitLoads();
  save();
  toast('Session removed');
  renderAll();
}

function collectLift(week, dayIdx){
  const day = dayTemplate(week, dayIdx);
  return day.slots.map(s=>{
    const performed = performedExercise(week, dayIdx, s.slot, s.id, state.training);
    const d = draft[draftKey(week, dayIdx, s.slot)] || {};
    const kg = performed.step==='bw' ? 0 : (typeof d.weightKg==='number' ? d.weightKg : displayKg(performed, week, dayIdx, s.slot));
    return {
      slotId:s.slot,
      pattern:performed.pattern,
      prescribedId:s.id,
      performedId:performed.id,
      name:performed.name,
      weightKg:kg,
      reps:repTarget(performed, day.scheme),
      result:d.result==='short'||d.result==='easy' ? d.result : 'hit',
      setsChecked:state.setProgress[setKey(week, dayIdx, s.slot, performed.id)]||0,
      sets:setsFor(s.role, day.scheme),
      role:s.role
    };
  });
}

function logCurrent(){
  if(state.viewOffset!==0){ toast('Back on the current day, then log it'); return; }
  const week = state.currentWeek;
  const dayIdx = state.currentDayIdx;
  if(isLogged(dayIdx, week)) return;
  const day = dayTemplate(week, dayIdx);
  if(day.type==='run'){ logRunDay(dayIdx, true); return; }
  if(day.type==='lift'){
    const exercises = collectLift(week, dayIdx);
    state.logs.push({ v:2, week, dayIdx, type:'lift', name:day.label, date:dateLabel(), timestamp:Date.now(), exercises });
    exercises.forEach(e=>{ delete state.setProgress[setKey(week, dayIdx, e.slotId, e.performedId)]; });
    commitLoads();
  }else{
    state.logs.push({ v:2, week, dayIdx, type:'mobility', name:'Mobility', date:dateLabel(), timestamp:Date.now() });
  }
  advance();
  save();
  stopRest(false);
  toast(day.type==='mobility' ? 'Rest day logged' : 'Logged. On to the next day.');
  renderAll();
  afterLog(day.type);
}

function logRunDay(dayIdx, advanceDay){
  const week = state.currentWeek;
  const session = runForDay(week, dayIdx) || { dayIdx, title:'Easy run', minutes:20, kind:'easy' };
  const d = draft['run:'+week+':'+dayIdx] || {};
  const minutes = Math.max(1, Math.round(Number(d.minutes)||session.minutes));
  const km = d.km ? Math.round(Number(d.km)*100)/100 : 0;
  const rpe = Math.min(10, Math.max(1, Math.round(Number(d.rpe)||5)));
  let entry = (state.running.logs||[]).find(r=>r.week===week && r.dayIdx===dayIdx);
  if(!entry){
    entry = { at:Date.now(), week, dayIdx, minutes, km, rpe, pain:!!d.pain, title:session.title };
    state.running.logs.push(entry);
    state.running.ai = null;
  }
  const completeDay = advanceDay || (dayIdx===state.currentDayIdx && !isLogged(dayIdx, week));
  if(completeDay && !isLogged(dayIdx, week)){
    state.logs.push({ v:2, week, dayIdx, type:'run', name:session.title, date:dateLabel(), timestamp:Date.now(), run:entry });
    if(dayIdx===state.currentDayIdx) advance();
  }
  save();
  stopRest(false);
  toast(entry.pain ? 'Logged. Next week stays easy.' : 'Run logged.');
  renderAll();
  afterLog('run');
}

function afterLog(type){
  if(!String(state.ai.key||'').trim()) return;
  if(type==='run') personalizeRun(true);
  if(type==='lift' && blockOf(state.currentWeek).weekInBlock===1 && state.currentDayIdx===0 && state.currentWeek>1){
    personalizeLift(true);
  }
}

function renderAlerts(){
  const el = document.getElementById('alerts');
  if(!el) return;
  const items = [];
  if(state.training.welcome){
    items.push('<div class="alert welcome" role="status"><span>New 4-week block is ready. Weights from your last plan were scaled into this rep range where the exercise matched. Earlier sessions are kept under Lift.</span><button type="button" data-dismiss="welcome" aria-label="Dismiss">✕</button></div>');
  }
  (state.ai.alerts||[]).forEach(a=>{
    items.push('<div class="alert" role="status"><span>'+esc(a.text)+'</span><button type="button" data-dismiss="'+esc(a.kind)+'" aria-label="Dismiss">✕</button></div>');
  });
  el.innerHTML = items.join('');
}

function renderToday(){
  const week = viewWeek();
  const dayIdx = viewDayIndex();
  const day = dayTemplate(week, dayIdx);
  const b = blockOf(week);
  const label = document.getElementById('day-label');
  const sub = document.getElementById('day-sublabel');
  const weekLabel = document.getElementById('week-label');
  const badge = document.getElementById('week-phase');
  const bar = document.getElementById('week-progress');
  const pill = document.getElementById('today-pill');
  if(label) label.textContent = day.day;
  if(sub) sub.textContent = day.label+' · Day '+(dayIdx+1)+' of 7';
  if(weekLabel) weekLabel.textContent = 'Week '+week+' · '+b.scheme.name;
  if(badge) badge.textContent = b.block.name;
  if(bar) bar.style.width = Math.round((dayIdx/7)*100)+'%';
  const prev = document.getElementById('prev-day');
  const next = document.getElementById('next-day');
  if(prev) prev.disabled = viewAbsoluteDay()<=0;
  if(next) next.disabled = state.viewOffset>=FORWARD_PREVIEW_DAYS;
  if(pill){
    const here = state.viewOffset===0;
    pill.textContent = here ? 'Current' : 'Back to today';
    pill.classList.toggle('jump', !here);
  }
  const host = document.getElementById('day-content');
  if(!host) return;
  const logged = logEntry(week, dayIdx);
  const preview = state.viewOffset>0;
  let html = '';
  if(preview) html += '<p class="menu-hint">Preview. Logging stays on the current day.</p>';
  if(state.training.carried && state.training.welcome && day.type==='lift'){
    html += '<p class="menu-hint">Change any weight. What you log is what the next week is built from.</p>';
  }
  if(day.type==='lift') html += renderLiftDay(week, dayIdx, day, logged);
  else if(day.type==='run') html += renderRunDay(week, dayIdx, logged);
  else html += renderMobilityDay(week, dayIdx, day, logged);
  html += renderNutritionCard(week, dayIdx, day);
  host.innerHTML = html;
  const hd = document.getElementById('header-date');
  if(hd) hd.textContent = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

function renderLiftDay(week, dayIdx, day, logged){
  const tags = day.tags.map(t=>'<span class="info-tag tag-lift">'+esc(t)+'</span>').join('');
  let body = '<div class="section-block"><div class="info-card" style="border-bottom:0.5px solid var(--border)"><div>'+tags+'</div><p style="margin-top:8px">'+esc(day.scheme.reps)+' on the main lifts · rest '+Math.round(day.scheme.restMain/60)+' min. '+esc(finisherText(day.scheme))+'</p></div>';
  body += '<div class="mobility-block"><div class="mobility-title">Prep</div>'+day.mobility.map(m=>'<button type="button" class="mobility-item" data-move="'+esc(m)+'"><span class="mobility-item-left"><span class="mobility-dot"></span><span>'+esc(m)+'</span></span></button>').join('')+'</div>';
  day.slots.forEach(s=>{
    const prescribed = s.exercise;
    const performed = performedExercise(week, dayIdx, s.slot, s.id, state.training);
    const saved = logged && logged.exercises ? logged.exercises.find(e=>e.slotId===s.slot) : null;
    const ex = saved ? (LIBRARY[saved.performedId]||performed) : performed;
    const sets = setsFor(s.role, day.scheme);
    const reps = repTarget(ex, day.scheme);
    const kg = saved ? saved.weightKg : displayKg(ex, week, dayIdx, s.slot);
    const plate = ex.step==='bw' ? '' : fmtPlate(plateValue(kg, ex, unit()));
    const result = saved ? (saved.result||'hit') : ((draft[draftKey(week, dayIdx, s.slot)]||{}).result||'hit');
    const swapped = ex.id!==prescribed.id;
    const note = saved ? '' : loadNote(ex, week);
    const checked = saved ? (saved.setsChecked||0) : (state.setProgress[setKey(week, dayIdx, s.slot, ex.id)]||0);
    const showChecked = saved && !saved.setsChecked ? sets : checked;
    let pips = '';
    for(let i=0;i<sets;i++){
      const on = i<showChecked;
      if(logged) pips += '<button type="button" class="set-pip'+(on?' done':'')+'" disabled aria-pressed="'+(on?'true':'false')+'">'+(i+1)+'</button>';
      else pips += '<button type="button" class="set-pip'+(on?' done':'')+'" data-pip="'+i+'" data-day="'+dayIdx+'" data-slot="'+s.slot+'" aria-label="Set '+(i+1)+' of '+esc(ex.name)+'">'+(i+1)+'</button>';
    }
    body += '<article class="lift-card">';
    body += '<div class="lift-top"><button type="button" class="ex-name-btn" data-info="'+esc(ex.id)+'"><span class="ex-name">'+esc(ex.name)+(swapped?'<span class="tap-arrow">↺</span>':'')+'</span><span class="ex-note">'+esc(PATTERN_LABEL[ex.pattern]||'')+' · '+esc(EQUIP_LABEL[ex.equip]||'')+'</span></button>';
    if(!logged) body += '<button type="button" class="quiet-btn" data-swap="'+s.slot+'" data-day="'+dayIdx+'">Swap</button>';
    body += '</div>';
    body += '<div class="ex-note" style="margin-top:6px">'+sets+' × '+esc(reps)+(swapped?' · instead of '+esc(prescribed.name):'')+'</div>';
    if(ex.step!=='bw'){
      body += '<div class="lift-load"><input class="plate" inputmode="decimal" '+(logged?'disabled':'')+' data-weight="'+s.slot+'" data-day="'+dayIdx+'" aria-label="Weight for '+esc(ex.name)+'" value="'+esc(plate)+'"><span>'+unit()+'</span></div>';
    }else body += '<div class="ex-note">Bodyweight</div>';
    if(note) body += '<p class="ex-note">'+esc(note)+'</p>';
    body += '<div class="set-row">'+pips+'</div>';
    body += '<div class="result-row" role="group" aria-label="How did '+esc(ex.name)+' feel">';
    ['hit','short','easy'].forEach(r=>{
      const on = result===r;
      body += '<button type="button" class="'+(on?'on '+r:'')+'" data-result="'+r+'" data-day="'+dayIdx+'" data-slot="'+s.slot+'" '+(logged?'disabled':'')+'>'+r.charAt(0).toUpperCase()+r.slice(1)+'</button>';
    });
    body += '</div></article>';
  });
  body += logButton(week, dayIdx, logged, 'Log workout');
  body += '</div>';
  return body;
}

function loadNote(ex){
  if(ex.step==='bw') return '';
  if(ex.inc==='assist') return 'Assistance weight. A lower number is harder, and it is not increased for you.';
  if(state.training.loads && typeof state.training.loads[ex.id]==='number') return '';
  const nudge = (state.training.patternNudge && state.training.patternNudge[ex.pattern]) || 0;
  if(nudge>0) return 'New exercise. The start includes a small bump because this movement has been going well. Set it on the first set.';
  return 'New exercise. This start is its own weight, not a copy of another lift.';
}

function logButton(week, dayIdx, logged, label){
  if(state.viewOffset>0) return '';
  if(logged && week===state.currentWeek && dayIdx===state.currentDayIdx) return '<button type="button" class="log-btn logged" data-skip="1">Next day</button>';
  if(logged && canUndo(week, dayIdx)) return '<button type="button" class="log-btn logged" data-unlog="'+dayIdx+'">Logged · Undo</button>';
  if(logged) return '<button type="button" class="log-btn logged" disabled>Logged</button>';
  if(week===state.currentWeek && dayIdx===state.currentDayIdx) return '<button type="button" class="log-btn ready" data-log="1">'+label+'</button>';
  return '';
}

function renderRunDay(week, dayIdx, logged){
  const plan = displayRuns();
  const session = plan.sessions.find(s=>s.dayIdx===dayIdx) || plan.sessions[0];
  const saved = logged && logged.run;
  const d = draft['run:'+week+':'+dayIdx] || {};
  const minutes = saved ? saved.minutes : (d.minutes||session.minutes);
  const km = saved ? (saved.km||'') : (d.km||'');
  const rpe = saved ? saved.rpe : (d.rpe||5);
  const pain = saved ? saved.pain : !!d.pain;
  const source = plan.source==='ai' ? 'Adjusted by the model' : 'Built-in plan';
  let html = '<div class="section-block"><div class="info-card">';
  html += '<span class="info-tag tag-burn">'+esc(session.kind==='quality'?'Quality':'Easy')+'</span><span class="info-tag tag-rest">'+esc(source)+'</span>';
  html += '<p style="margin-top:8px"><strong>'+esc(session.title)+'</strong> · '+esc(session.minutes)+' min planned</p>';
  html += '<p>'+esc(session.detail)+'</p>';
  html += '<p class="ex-note">'+esc(plan.note)+'</p></div>';
  html += '<div class="lift-card">';
  html += fieldNum('Minutes', 'data-run-min', minutes, logged);
  html += fieldNum('Kilometers', 'data-run-km', km, logged);
  html += '<label class="run-field">Effort <select data-run-rpe '+(logged?'disabled':'')+'>'+rpeOptions(rpe)+'</select></label>';
  html += '<label class="made-toggle" style="margin-top:8px"><input type="checkbox" data-run-pain '+(pain?'checked':'')+' '+(logged?'disabled':'')+'> Something hurt</label>';
  html += '</div>';
  html += logButton(week, dayIdx, logged, 'Log run');
  html += '</div>';
  return html;
}

function fieldNum(label, attr, value, locked){
  return '<label class="run-field">'+label+' <input inputmode="decimal" '+attr+' value="'+esc(value)+'" '+(locked?'disabled':'')+'></label>';
}
function rpeOptions(selected){
  let html = '';
  for(let i=1;i<=10;i++) html += '<option value="'+i+'"'+(Number(selected)===i?' selected':'')+'>'+i+(i<=3?' easy':i>=8?' hard':'')+'</option>';
  return html;
}

function renderMobilityDay(week, dayIdx, day, logged){
  let html = '<div class="section-block"><div class="info-card"><span class="info-tag tag-flex">Mobility</span><span class="info-tag tag-rest">Rest from lifting</span><p style="margin-top:8px">Easy ranges of motion. This is the recovery day. A short walk is fine. The optional longer run, when you have one, is on the Run tab.</p></div>';
  html += '<div class="mobility-block"><div class="mobility-title">Flow</div>'+day.items.map(m=>'<button type="button" class="mobility-item" data-move="'+esc(m)+'"><span class="mobility-item-left"><span class="mobility-dot"></span><span>'+esc(m)+'</span></span></button>').join('')+'</div>';
  html += logButton(week, dayIdx, logged, 'Log rest day');
  html += '</div>';
  return html;
}

function renderNutritionCard(week, dayIdx, day){
  const train = isTrainingDay(day.type);
  const nut = train ? NUTRITION.training : NUTRITION.rest;
  const made = MEAL_SLOTS.filter(s=>isMealMade(week, dayIdx, s.id)).length;
  let html = '<div class="section-block" style="margin-top:12px"><div class="section-header" data-toggle="nut-'+dayIdx+'" data-chev="nut-chev"><div class="section-header-left"><div class="section-icon icon-food">🍽</div><div><div class="section-title">Meals</div><div class="section-meta" id="nut-meta-'+dayIdx+'">'+made+'/3 meals · '+nut.cal+' cal · '+(train?'Training day':'Rest day')+'</div></div></div><span class="section-chevron" id="nut-chev">▼</span></div>';
  html += '<div class="section-body" id="nut-'+dayIdx+'"><div class="macro-row">';
  [['Cal',nut.cal],['Protein',nut.protein+'g'],['Carbs',nut.carbs+'g'],['Fat',nut.fat+'g']].forEach(pair=>{
    html += '<div class="macro-cell"><div class="macro-val">'+pair[1]+'</div><div class="macro-label">'+pair[0]+'</div></div>';
  });
  html += '</div>';
  MEAL_SLOTS.forEach(slot=>{
    const meal = chosenMeal(week, dayIdx, slot.id);
    const on = isMealMade(week, dayIdx, slot.id);
    html += '<div class="meal-row'+(on?' made':'')+'"><div class="meal-top"><label class="made-toggle"><input type="checkbox" data-made-slot="'+slot.id+'" data-day="'+dayIdx+'" '+(on?'checked':'')+'> '+slot.label+'</label><button type="button" class="recipe-link" data-recipe="'+slot.id+'" data-idx="'+mealIndex(week, dayIdx, slot.id)+'">Recipe</button></div><div class="meal-name">'+esc(meal.name)+'</div><div class="meal-detail">'+esc(meal.detail)+'</div></div>';
  });
  html += '</div></div>';
  return html;
}

function renderLift(){
  const host = document.getElementById('lift-body');
  if(!host) return;
  const week = state.currentWeek;
  const b = blockOf(week);
  const lifts = state.logs.filter(l=>l.v===2 && l.type==='lift');
  let html = '<div class="screen-title">Lift</div>';
  html += '<p class="menu-hint">Block '+(b.index+1)+' of '+BLOCKS.length+' · week '+b.weekInBlock+' of 4. '+esc(b.block.blurb)+'</p>';
  html += '<div class="scheme">';
  WEEK_SCHEME.forEach((s,i)=>{
    html += '<div class="'+(i+1===b.weekInBlock?'on':'')+'"><strong>'+esc(s.name)+'</strong><span>'+esc(s.reps)+'</span></div>';
  });
  html += '</div>';
  html += '<p class="menu-hint">Four weeks climb from higher reps to a heavy week, in the spirit of a linear microcycle. The menu then changes. Main patterns stay, so strength carries. A new exercise never inherits another lift’s weight. Hit keeps the climb. Short holds you where you were. Easy adds a bit now. Peak week adds the increase when you hit it.</p>';
  if(state.training.ai && state.training.ai.blockKey===Math.floor((week-1)/4) && state.training.ai.note){
    html += '<div class="settings-note">Model note: '+esc(state.training.ai.note)+'</div>';
  }
  html += '<button type="button" class="quiet-btn" data-refresh="lift" style="margin:8px 0 14px">Refresh loads with the model</button>';
  html += '<div class="stats-grid"><div class="stat-card"><div class="stat-val">'+lifts.length+'</div><div class="stat-label">Lifts logged</div></div><div class="stat-card"><div class="stat-val">'+calcStreak()+'</div><div class="stat-label">Day streak</div></div></div>';
  html += '<div style="font-size:13px;font-weight:600;margin:6px 0 8px">This block</div>';
  WEEK_SHAPE.forEach((shape, di)=>{
    if(shape.type!=='lift') return;
    const day = dayTemplate(week, di);
    html += '<button type="button" class="shop-link" data-jump="'+di+'" style="margin-bottom:8px">'+esc(DAY_NAMES[di])+' · '+esc(day.label)+'</button>';
  });
  html += '<div style="font-size:13px;font-weight:600;margin:14px 0 8px">Recent sessions</div>';
  const recent = state.logs.filter(l=>l.v===2).slice().reverse().slice(0, 8);
  if(!recent.length && !(state.legacyLogs||[]).length) html += '<div class="empty-state">No sessions yet.</div>';
  recent.forEach(l=>{
    html += '<div class="history-item"><div class="history-date">Week '+l.week+' · '+esc(l.date||'')+'</div><div class="history-title">'+esc(l.name||l.type)+'</div><div class="history-detail">'+esc(historyDetail(l))+'</div></div>';
  });
  if((state.legacyLogs||[]).length){
    html += '<p class="menu-hint">'+state.legacyLogs.length+' earlier sessions from the previous plan are saved on this phone.</p>';
  }
  html += '<p class="menu-hint">Equipment is what a Blink or PureGym floor usually has: racks, barbells, dumbbells, cables, a Smith machine, and the common pin-select machines. Swap when a station is taken.</p>';
  host.innerHTML = html;
}

function historyDetail(l){
  if(l.type==='lift' && l.exercises){
    const short = l.exercises.filter(e=>e.result==='short').length;
    const easy = l.exercises.filter(e=>e.result==='easy').length;
    return l.exercises.length+' exercises'+(short?' · '+short+' short':'')+(easy?' · '+easy+' easy':'');
  }
  if(l.run) return l.run.minutes+' min'+(l.run.km?' · '+l.run.km+' km':'')+(l.run.pain?' · pain':'')+' · effort '+l.run.rpe;
  return 'Recovery';
}

function renderRun(){
  const host = document.getElementById('run-body');
  if(!host) return;
  const plan = displayRuns();
  const source = plan.source==='ai' ? 'Adjusted by the model' : 'Built-in plan';
  let html = '<div class="screen-title">Run</div>';
  html += '<p class="menu-hint" id="run-note">'+esc(plan.note)+'</p>';
  html += '<p class="ex-note" id="run-source">'+esc(source)+' · week '+state.currentWeek+'</p>';
  html += '<div class="settings-row"><label for="run-level">Running</label><select id="run-level"><option value="new"'+(state.running.level==='new'?' selected':'')+'>New to it</option><option value="consistent"'+(state.running.level!=='new'&&state.running.level!=='experienced'?' selected':'')+'>Consistent</option><option value="experienced"'+(state.running.level==='experienced'?' selected':'')+'>Experienced</option></select></div>';
  html += '<div class="settings-row"><label for="run-days">Days per week</label><select id="run-days"><option value="2"'+(state.running.daysPerWeek!==3?' selected':'')+'>2</option><option value="3"'+(state.running.daysPerWeek===3?' selected':'')+'>3</option></select></div>';
  html += '<button type="button" class="quiet-btn" data-refresh="run" style="margin:8px 0 14px">Refresh runs with the model</button>';
  plan.sessions.forEach(s=>{
    const logged = logEntry(state.currentWeek, s.dayIdx);
    html += '<article class="section-block" style="padding:12px 14px;margin-bottom:10px">';
    html += '<div class="history-title">'+esc(DAY_NAMES[s.dayIdx])+' · '+esc(s.title)+'</div>';
    html += '<div class="history-detail">'+s.minutes+' min · '+(s.kind==='quality'?'quality':'easy')+'</div>';
    html += '<p class="menu-detail">'+esc(s.detail)+'</p>';
    if(!(logged && logged.type==='run')){
      html += '<button type="button" class="log-btn ready" data-log-run="'+s.dayIdx+'" style="width:100%;margin:10px 0 0">Log this run</button>';
    }else html += '<p class="ex-note" style="margin-top:8px">Logged this week.</p>';
    html += '</article>';
  });
  const runs = (state.running.logs||[]).slice().reverse().slice(0, 6);
  html += '<div style="font-size:13px;font-weight:600;margin:8px 0">Recent runs</div>';
  if(!runs.length) html += '<div class="empty-state">No runs logged yet. The first week is a start, and the next one follows what you record.</div>';
  runs.forEach(r=>{
    html += '<div class="history-item"><div class="history-date">'+esc(r.title||'Run')+'</div><div class="history-detail">'+r.minutes+' min'+(r.km?' · '+r.km+' km':'')+' · effort '+r.rpe+(r.pain?' · pain':'')+'</div></div>';
  });
  html += '<p class="menu-hint">Most minutes stay easy, the way polarized running is built. One quicker session shows up only after you are past the new-runner stage, and it sits before the heavy squat day. Pain or an effort of 8 or more shortens the next week.</p>';
  host.innerHTML = html;
}

function renderMeals(){
  const week = Math.max(1, viewWeek()+mealWeekOffset);
  const stats = weekMealStats(week);
  const weekEl = document.getElementById('meals-week');
  if(weekEl) weekEl.textContent = 'Week '+week+' · '+phaseName(week)+' · '+stats.made+' of '+stats.total+' cooked';
  const prev = document.getElementById('meals-prev');
  const next = document.getElementById('meals-next');
  if(prev) prev.disabled = week<=1;
  if(next) next.disabled = mealWeekOffset>=3;
  const menuBtn = document.getElementById('pane-menu');
  const shopBtn = document.getElementById('pane-shop');
  if(menuBtn){ menuBtn.classList.toggle('active', mealsPane!=='shop'); menuBtn.setAttribute('aria-selected', mealsPane!=='shop'?'true':'false'); }
  if(shopBtn){ shopBtn.classList.toggle('active', mealsPane==='shop'); shopBtn.setAttribute('aria-selected', mealsPane==='shop'?'true':'false'); }
  const body = document.getElementById('meals-body');
  if(!body) return;
  body.innerHTML = mealsPane==='shop' ? renderShopPane(week, stats) : renderMenuPane(week);
}

function renderMenuPane(week){
  let html = '<p class="menu-hint">Check a meal after you cook it. Change any meal and the shopping list follows.</p>';
  for(let di=0;di<7;di++){
    const day = dayTemplate(week, di);
    const kind = day.type==='lift' ? 'Lifting' : day.type==='run' ? 'Running' : 'Rest';
    const nut = isTrainingDay(day.type) ? NUTRITION.training : NUTRITION.rest;
    html += '<section class="menu-day"><div class="menu-day-h"><strong>'+day.day+'</strong><span>'+kind+' · '+nut.cal+' cal</span></div>';
    MEAL_SLOTS.forEach(slot=>{
      const idx = mealIndex(week, di, slot.id);
      const meal = NUTRITION.meals[slot.id][idx];
      const made = isMealMade(week, di, slot.id);
      html += '<div class="menu-slot'+(made?' made':'')+'"><label class="made-hit"><input type="checkbox" data-meal-made data-week="'+week+'" data-day="'+di+'" data-slot="'+slot.id+'" '+(made?'checked':'')+' aria-label="Mark '+slot.label+' on '+day.day+' made"></label><div><div class="meal-timing">'+slot.label+'</div><select data-meal-choice data-week="'+week+'" data-day="'+di+'" data-slot="'+slot.id+'" aria-label="'+slot.label+' for '+day.day+'">'+mealOptions(slot.id, idx)+'</select><div class="menu-detail">'+esc(meal.detail)+'</div></div><button type="button" class="recipe-link" data-recipe="'+slot.id+'" data-idx="'+idx+'">Recipe</button></div>';
    });
    html += '</section>';
  }
  return html;
}

function renderShopPane(week, stats){
  const items = buildWeekShoppingList(week, shopOnlyUnmade);
  const boughtN = items.filter(item=>state.menu.bought[buyKey(week, item.item, item.unit)]).length;
  const leftBuy = items.length-boughtN;
  let list = '';
  if(!items.length) list = '<div class="empty-state">Every meal this week is marked made, so this filtered list is empty.</div>';
  else {
    let aisle = '';
    items.forEach(item=>{
      if(item.aisle!==aisle){ aisle = item.aisle; list += '<div class="aisle-label">'+aisle+'</div>'; }
      const bought = !!state.menu.bought[buyKey(week, item.item, item.unit)];
      const u = item.unit ? ' '+esc(item.unit) : '';
      list += '<label class="shop-item'+(bought?' bought':'')+'"><input type="checkbox" data-shop-item data-week="'+week+'" data-item="'+esc(item.item)+'" data-unit="'+esc(item.unit)+'" '+(bought?'checked':'')+'><span><span class="shop-name">'+fmtQty(item.qty)+u+' '+esc(item.item)+'</span><span class="shop-uses">'+esc(usesLabel(item.uses))+'</span></span></label>';
    });
  }
  return '<div class="shop-summary">'+leftBuy+' to buy · '+stats.left+' meals still to cook</div><div class="shop-tools"><label class="made-toggle"><input type="checkbox" data-shop-unmade '+(shopOnlyUnmade?'checked':'')+'> Still to cook</label><div class="shop-actions"><button type="button" class="quiet-btn" data-copy-list>Copy</button><button type="button" class="quiet-btn" data-clear-shop data-week="'+week+'">Clear</button></div></div>'+list;
}

function renderSettings(){
  const u = unit();
  const unitEl = document.getElementById('set-unit');
  if(!unitEl) return;
  unitEl.value = u;
  document.getElementById('set-inc').value = incDisplay(state.settings.incKg, u);
  document.getElementById('set-inc-label').textContent = 'Upper-body increase ('+u+')';
  document.getElementById('set-level').value = state.settings.level==='intermediate' ? 'intermediate' : 'advanced';
  document.getElementById('set-rest').value = String(state.settings.restSec||90);
  document.getElementById('set-chime').checked = state.settings.chime!==false;
  document.getElementById('set-base').value = state.ai.baseUrl || 'https://api.openai.com/v1';
  document.getElementById('set-model').value = state.ai.model || 'gpt-4o-mini';
  document.getElementById('set-key').value = state.ai.key || '';
  const milli = rollSpend(state.ai).milli || 0;
  document.getElementById('spend-label').textContent = formatDollars(milli)+' of $3.00 this week';
  const fill = document.getElementById('spend-fill');
  if(fill){
    fill.style.width = Math.min(100, (milli/AI_CAP_MILLI)*100)+'%';
    fill.style.background = milli>=AI_CAP_MILLI ? 'var(--burn)' : 'var(--lift)';
  }
}

function saveSettings(){
  const u = document.getElementById('set-unit').value==='kg' ? 'kg' : 'lbs';
  const shown = parseFloat(document.getElementById('set-inc').value);
  if(isFinite(shown) && shown>0) state.settings.incKg = u==='lbs' ? shown/2.2046 : shown;
  state.settings.unit = u;
  state.settings.level = document.getElementById('set-level').value==='intermediate' ? 'intermediate' : 'advanced';
  state.settings.restSec = parseInt(document.getElementById('set-rest').value, 10)||90;
  state.settings.chime = document.getElementById('set-chime').checked;
  const base = document.getElementById('set-base').value.trim() || 'https://api.openai.com/v1';
  state.ai.baseUrl = base;
  state.ai.model = document.getElementById('set-model').value.trim() || 'gpt-4o-mini';
  state.ai.key = document.getElementById('set-key').value.trim();
  save();
  renderSettings();
  renderAll();
}

function onUnitChange(){
  const next = document.getElementById('set-unit').value==='kg' ? 'kg' : 'lbs';
  const prev = unit();
  const shown = parseFloat(document.getElementById('set-inc').value);
  if(next!==prev && isFinite(shown)){
    const kg = prev==='lbs' ? shown/2.2046 : shown;
    state.settings.incKg = kg;
    document.getElementById('set-inc').value = incDisplay(kg, next);
  }
  state.settings.unit = next;
  save();
  renderSettings();
  renderAll();
}

function onLevelChange(){
  const level = document.getElementById('set-level').value==='intermediate' ? 'intermediate' : 'advanced';
  state.settings.level = level;
  const u = unit();
  const suggested = level==='intermediate' ? (u==='lbs'?2.5:1.25) : (u==='lbs'?5:2.5);
  state.settings.incKg = u==='lbs' ? suggested/2.2046 : suggested;
  save();
  renderSettings();
}

function showTab(tab){
  if(activeTab==='settings' && tab!=='settings') saveSettings();
  activeTab = tab;
  document.querySelectorAll('.tab-bar button').forEach(btn=>{
    const on = btn.dataset.tab===tab;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on?'true':'false');
  });
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.id==='screen-'+tab));
  const main = document.querySelector('main');
  if(main) main.scrollTop = 0;
  if(tab==='today') renderToday();
  if(tab==='lift'){ renderLift(); personalizeLift(false); }
  if(tab==='run'){ renderRun(); personalizeRun(false); }
  if(tab==='meals') renderMeals();
  if(tab==='settings') renderSettings();
}

function renderAll(){
  renderAlerts();
  renderToday();
  if(activeTab==='lift') renderLift();
  if(activeTab==='run') renderRun();
  if(activeTab==='meals') renderMeals();
  if(activeTab==='settings') renderSettings();
}

function openSwap(dayIdx, slot){
  const week = viewWeek();
  const prescribed = dayTemplate(week, dayIdx).slots[slot];
  const current = performedExercise(week, dayIdx, slot, prescribed.id, state.training);
  const keep = !!(state.training.blockSub||{})[subKey('block', week, dayIdx, slot)];
  const options = [];
  if(current.id!==prescribed.id) options.push(prescribed.exercise);
  substitutesFor(current).forEach(a=>options.push(a));
  const rows = options.map(a=>{
    const kg = suggestKg(a, week, state.training, state.settings);
    const w = a.step==='bw' ? 'Bodyweight' : fmtPlate(plateValue(kg, a, unit()))+' '+unit();
    return '<button type="button" class="sub-pick'+(a.id===current.id?' on':'')+'" data-pick="'+a.id+'" data-day="'+dayIdx+'" data-slot="'+slot+'"><span>'+esc(a.name)+'</span><span class="sub-meta">'+esc(EQUIP_LABEL[a.equip]||'')+' · '+esc(w)+'</span></button>';
  }).join('');
  openModal('If this station is taken', '<p>Same movement, different station. The weight shown is for the exercise you switch to.</p><label class="made-toggle" style="margin:10px 0 12px"><input type="checkbox" id="keep-block" '+(keep?'checked':'')+'> Keep for this 4-week block</label>'+rows);
}

function pickSub(dayIdx, slot, id){
  const week = viewWeek();
  const prescribed = dayTemplate(week, dayIdx).slots[slot].id;
  const keepEl = document.getElementById('keep-block');
  const keep = !!(keepEl && keepEl.checked);
  const sk = subKey('session', week, dayIdx, slot);
  const bk = subKey('block', week, dayIdx, slot);
  if(id===prescribed){
    delete state.training.sessionSub[sk];
    delete state.training.blockSub[bk];
  }else if(keep){
    state.training.blockSub[bk] = id;
    delete state.training.sessionSub[sk];
  }else{
    state.training.sessionSub[sk] = id;
    delete state.training.blockSub[bk];
  }
  delete draft[draftKey(week, dayIdx, slot)];
  save();
  closeModal();
  renderAll();
}

function openInfo(id){
  const ex = LIBRARY[id];
  if(!ex) return;
  openModal(ex.name, '<p>'+esc(ex.cue)+'</p><p>'+esc(PATTERN_LABEL[ex.pattern]||'')+' · '+esc(EQUIP_LABEL[ex.equip]||'')+'</p>');
}

function showRecipe(cat, idx){
  const meal = NUTRITION.meals[cat] && NUTRITION.meals[cat][idx];
  if(!meal || !meal.recipe){ openModal(meal?meal.name:'Recipe', '<p>No recipe for this one.</p>'); return; }
  const ing = meal.recipe.ingredients.map(i=>'<li>'+fmtQty(i.qty)+(i.unit?' '+esc(i.unit):'')+' '+esc(i.item)+'</li>').join('');
  const steps = meal.recipe.steps.map(s=>'<li>'+esc(s)+'</li>').join('');
  openModal(meal.name, '<p>'+esc(meal.detail)+'</p><h4>Ingredients</h4><ul>'+ing+'</ul><h4>Steps</h4><ul>'+steps+'</ul>');
}

function openModal(title, bodyHtml){
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  const closeBtn = overlay.querySelector('.modal-close');
  if(closeBtn) closeBtn.focus();
}
function closeModal(){
  document.getElementById('modal-overlay').classList.remove('show');
  document.body.style.overflow = '';
}
function closeModalBg(e){ if(e.target.id==='modal-overlay') closeModal(); }

function toast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 2400);
}

function toggle(bodyId, chevId){
  const body = document.getElementById(bodyId);
  const chev = document.getElementById(chevId);
  if(!body) return;
  body.classList.toggle('open');
  if(chev) chev.classList.toggle('open');
}

let restTimer = null, restUntil = 0, restTotal = 90, audioCtx = null;
function unlockAudio(){
  try{
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if(audioCtx.state==='suspended') audioCtx.resume();
  }catch(e){}
}
function chime(){
  if(state.settings.chime===false) return;
  try{
    unlockAudio();
    if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = 880;
    o.type = 'sine';
    const t = audioCtx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t+0.38);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t+0.4);
  }catch(e){}
}
function startRest(seconds, label){
  unlockAudio();
  restTotal = seconds || state.settings.restSec || 90;
  restUntil = Date.now()+restTotal*1000;
  document.getElementById('rest-label').textContent = label || 'Rest';
  document.getElementById('rest-bar').classList.add('show');
  document.body.classList.add('resting');
  tickRest();
  if(restTimer) clearInterval(restTimer);
  restTimer = setInterval(tickRest, 250);
}
function tickRest(){
  const leftMs = restUntil-Date.now();
  if(leftMs<=0){ stopRest(true); return; }
  const left = Math.ceil(leftMs/1000);
  document.getElementById('rest-time').textContent = Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
  const fill = document.getElementById('rest-fill');
  if(fill) fill.style.transform = 'scaleX('+(leftMs/(restTotal*1000))+')';
}
function stopRest(done){
  if(restTimer){ clearInterval(restTimer); restTimer = null; }
  restUntil = 0;
  const bar = document.getElementById('rest-bar');
  if(bar) bar.classList.remove('show');
  document.body.classList.remove('resting');
  if(!done) return;
  try{ if(navigator.vibrate) navigator.vibrate([180,80,180]); }catch(e){}
  chime();
  toast('Rest done');
}

function onPip(dayIdx, slot, pip){
  const week = viewWeek();
  const day = dayTemplate(week, dayIdx);
  const spec = day.slots[slot];
  const ex = performedExercise(week, dayIdx, slot, spec.id, state.training);
  const key = setKey(week, dayIdx, slot, ex.id);
  const cur = state.setProgress[key]||0;
  const sets = setsFor(spec.role, day.scheme);
  const next = pip+1===cur ? pip : pip+1;
  state.setProgress[key] = Math.max(0, Math.min(sets, next));
  save();
  if(next>cur) startRest(restFor(spec.role, day.scheme), ex.name);
  renderToday();
}

function jumpToDay(dayIdx){
  const target = (state.currentWeek-1)*7+dayIdx;
  const offset = target-currentAbsoluteDay();
  if(offset<0 || offset>FORWARD_PREVIEW_DAYS) { showTab('today'); return; }
  state.viewOffset = offset;
  save();
  showTab('today');
}

function onClick(e){
  const t = e.target;
  if(e.target && e.target.id==='modal-overlay'){ closeModal(); return; }
  if(t.closest('#modal-close')){ closeModal(); return; }
  const tab = t.closest('.tab-bar [data-tab]');
  if(tab){ showTab(tab.dataset.tab); return; }
  if(t.closest('#prev-day')){ changeDay(-1); return; }
  if(t.closest('#next-day')){ changeDay(1); return; }
  if(t.closest('#today-pill')){
    if(state.viewOffset!==0){ state.viewOffset = 0; save(); renderToday(); }
    return;
  }
  const dismiss = t.closest('[data-dismiss]');
  if(dismiss){
    const kind = dismiss.dataset.dismiss;
    if(kind==='welcome') state.training.welcome = false;
    else state.ai.alerts = (state.ai.alerts||[]).filter(a=>a.kind!==kind);
    save();
    renderAlerts();
    return;
  }
  if(t.closest('[data-skip]')){ advance(); save(); renderAll(); return; }
  if(t.closest('[data-log]')){ logCurrent(); return; }
  const unlog = t.closest('[data-unlog]');
  if(unlog){ undoDay(viewWeek(), +unlog.dataset.unlog); return; }
  const pip = t.closest('[data-pip]');
  if(pip){ onPip(+pip.dataset.day, +pip.dataset.slot, +pip.dataset.pip); return; }
  const swap = t.closest('[data-swap]');
  if(swap){ openSwap(+swap.dataset.day, +swap.dataset.swap); return; }
  const pick = t.closest('[data-pick]');
  if(pick){ pickSub(+pick.dataset.day, +pick.dataset.slot, pick.dataset.pick); return; }
  const info = t.closest('[data-info]');
  if(info){ openInfo(info.dataset.info); return; }
  const move = t.closest('[data-move]');
  if(move){ openModal('Prep', '<p>'+esc(move.dataset.move)+'</p>'); return; }
  const result = t.closest('[data-result]');
  if(result && !result.disabled){
    const key = draftKey(viewWeek(), +result.dataset.day, +result.dataset.slot);
    draft[key] = Object.assign({ result:'hit' }, draft[key], { result:result.dataset.result });
    renderToday();
    return;
  }
  const recipe = t.closest('[data-recipe]');
  if(recipe){ showRecipe(recipe.dataset.recipe, +recipe.dataset.idx); return; }
  const tog = t.closest('[data-toggle]');
  if(tog && !t.closest('input,select,button.recipe-link')){ toggle(tog.dataset.toggle, tog.dataset.chev); return; }
  const jump = t.closest('[data-jump]');
  if(jump){ jumpToDay(+jump.dataset.jump); return; }
  const refresh = t.closest('[data-refresh]');
  if(refresh){
    if(!String(state.ai.key||'').trim()){ toast('Add an API key in Settings. The built-in plan stays on until then.'); return; }
    if(refresh.dataset.refresh==='run') personalizeRun(true);
    else personalizeLift(true);
    return;
  }
  const logRunBtn = t.closest('[data-log-run]');
  if(logRunBtn){ logRunDay(+logRunBtn.dataset.logRun, false); return; }
  const pane = t.closest('[data-meals-pane]');
  if(pane){ mealsPane = pane.dataset.mealsPane; renderMeals(); return; }
  if(t.closest('#meals-prev')){ if(mealWeekOffset>-viewWeek()+1){ mealWeekOffset--; renderMeals(); } return; }
  if(t.closest('#meals-next')){ if(mealWeekOffset<3){ mealWeekOffset++; renderMeals(); } return; }
  if(t.closest('[data-copy-list]')){ copyShoppingList(); return; }
  const clearShop = t.closest('[data-clear-shop]');
  if(clearShop){
    if(confirm('Clear the check marks on this week’s shopping list?')){ clearShopChecks(+clearShop.dataset.week); renderMeals(); }
    return;
  }
  if(t.closest('#open-shop')){ mealsPane = 'shop'; showTab('meals'); return; }
  if(t.closest('#save-settings')){ saveSettings(); toast('Saved'); return; }
  if(t.closest('#reset-week')){
    if(!confirm('Go back to day 1 of week 1? Logged sessions stay.')) return;
    state.currentWeek = 1; state.currentDayIdx = 0; state.viewOffset = 0;
    save(); renderAll(); toast('Back to day 1');
    return;
  }
  if(t.closest('#clear-history')){
    if(!confirm('Clear logged sessions, run history, and saved weights? Meals and the API key stay.')) return;
    state.logs = []; state.legacyLogs = []; state.setProgress = {};
    state.training.seed = {}; state.training.loads = {}; state.training.patternNudge = {};
    state.training.sessionSub = {}; state.training.blockSub = {}; state.training.ai = null;
    state.training.carried = false;
    state.running.logs = []; state.running.ai = null;
    state.currentWeek = 1; state.currentDayIdx = 0; state.viewOffset = 0;
    commitLoads(); save(); renderAll(); toast('History cleared');
  }
}

function onChange(e){
  const t = e.target;
  if(t.matches('[data-weight]')){
    const kg = toKg(t.value);
    if(!isFinite(kg)) return;
    const key = draftKey(viewWeek(), +t.dataset.day, +t.dataset.weight);
    draft[key] = Object.assign({ result:'hit' }, draft[key], { weightKg:kg });
    return;
  }
  if(t.matches('[data-result]')) return;
  if(t.matches('[data-run-min],[data-run-km],[data-run-rpe],[data-run-pain]')){
    const card = t.closest('.section-block') || document.getElementById('day-content');
    const week = viewWeek();
    const dayIdx = viewDayIndex();
    const key = 'run:'+week+':'+dayIdx;
    const d = draft[key] || {};
    const root = document.getElementById('day-content');
    if(root){
      const min = root.querySelector('[data-run-min]');
      const km = root.querySelector('[data-run-km]');
      const rpe = root.querySelector('[data-run-rpe]');
      const pain = root.querySelector('[data-run-pain]');
      if(min) d.minutes = min.value;
      if(km) d.km = km.value;
      if(rpe) d.rpe = rpe.value;
      if(pain) d.pain = pain.checked;
      draft[key] = d;
    }
    return;
  }
  if(t.matches('[data-made-slot]')){
    setMealMade(viewWeek(), +t.dataset.day, t.dataset.madeSlot, t.checked);
    const row = t.closest('.meal-row');
    if(row) row.classList.toggle('made', t.checked);
    const meta = document.getElementById('nut-meta-'+t.dataset.day);
    if(meta){
      const n = MEAL_SLOTS.filter(s=>isMealMade(viewWeek(), +t.dataset.day, s.id)).length;
      const day = dayTemplate(viewWeek(), +t.dataset.day);
      const train = isTrainingDay(day.type);
      const nut = train ? NUTRITION.training : NUTRITION.rest;
      meta.textContent = n+'/3 meals · '+nut.cal+' cal · '+(train?'Training day':'Rest day');
    }
    return;
  }
  if(t.matches('[data-meal-choice]')){
    setMealChoice(+t.dataset.week, +t.dataset.day, t.dataset.slot, t.value);
    renderToday(); renderMeals(); return;
  }
  if(t.matches('[data-meal-made]')){
    setMealMade(+t.dataset.week, +t.dataset.day, t.dataset.slot, t.checked);
    renderToday(); renderMeals(); return;
  }
  if(t.matches('[data-shop-item]')){
    ensureMenu();
    const week = +t.dataset.week || viewWeek();
    const k = buyKey(week, t.dataset.item, t.dataset.unit||'');
    if(t.checked) state.menu.bought[k] = true; else delete state.menu.bought[k];
    save(); renderMeals(); return;
  }
  if(t.matches('[data-shop-unmade]')){ shopOnlyUnmade = t.checked; renderMeals(); return; }
  if(t.matches('#run-level')){
    state.running.level = t.value;
    state.running.ai = null;
    save(); renderRun(); renderToday(); return;
  }
  if(t.matches('#run-days')){
    state.running.daysPerWeek = t.value==='3' ? 3 : 2;
    state.running.ai = null;
    save(); renderRun(); return;
  }
  if(t.matches('#set-unit')) onUnitChange();
  if(t.matches('#set-level')) onLevelChange();
}

async function copyShoppingList(){
  const week = Math.max(1, viewWeek()+mealWeekOffset);
  const text = shoppingListText(week);
  if(!text){ toast('Nothing left to copy'); return; }
  try{ await navigator.clipboard.writeText(text); toast('Unchecked items copied'); }
  catch(e){ toast('Could not copy the list'); }
}

async function watchUpdates(){
  if(sessionStorage.getItem('prog-just-updated')==='1'){
    sessionStorage.removeItem('prog-just-updated');
    toast('Updated to the latest version');
  }
  const check = async ()=>{
    try{
      const res = await fetch('./version.json?ts='+Date.now(), { cache:'no-store' });
      if(!res.ok) return;
      const data = await res.json();
      if(!data.version || String(data.version)===APP_VERSION){
        const url = new URL(location.href);
        if(url.searchParams.has('v')){
          url.searchParams.delete('v');
          history.replaceState(null, '', url.pathname+url.search+url.hash);
        }
        return;
      }
      if(sessionStorage.getItem('prog-reload')===String(data.version)){
        flagAlert('update', 'A newer version is on the site. If this screen still looks old, delete the home-screen icon once and add it again. After this version, opening the app pulls updates on its own.', false);
        return;
      }
      sessionStorage.setItem('prog-reload', String(data.version));
      sessionStorage.setItem('prog-just-updated', '1');
      const url = new URL(location.href);
      url.searchParams.set('v', data.version);
      location.replace(url.href);
    }catch(e){}
  };
  await check();
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden){ check(); if(restTimer) tickRest(); } });
  if(!('serviceWorker' in navigator)) return;
  try{
    const reg = await navigator.serviceWorker.register('./sw.js', { updateViaCache:'none' });
    const kick = ()=>reg.update().catch(()=>{});
    kick();
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) kick(); });
    if(reg.waiting) reg.waiting.postMessage({ type:'SKIP_WAITING' });
    reg.addEventListener('updatefound', ()=>{
      const nw = reg.installing;
      if(!nw) return;
      nw.addEventListener('statechange', ()=>{
        if(nw.state==='installed' && navigator.serviceWorker.controller) nw.postMessage({ type:'SKIP_WAITING' });
      });
    });
    let once = false;
    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      if(once) return;
      once = true;
      sessionStorage.setItem('prog-just-updated', '1');
      location.reload();
    });
  }catch(e){}
}

load();
renderAll();
document.body.addEventListener('click', onClick);
document.body.addEventListener('change', onChange);
document.getElementById('rest-skip').addEventListener('click', ()=>stopRest(false));
document.addEventListener('keydown', e=>{
  if(e.key!=='Escape') return;
  if(document.getElementById('modal-overlay').classList.contains('show')) closeModal();
  else if(document.getElementById('rest-bar').classList.contains('show')) stopRest(false);
});
watchUpdates();
