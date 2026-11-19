/* On-device model calls. The key never leaves this phone except as the
   Authorization header to the address in Settings. Spending is capped at $3
   in a Monday–Sunday week. Past the cap, or if the call fails, the built-in
   plan stays in place and the app says so. */

const AI_CAP_MILLI = 300000; /* $3.00, in thousandths of a cent */
const AI_CALL_CAP_MILLI = 100000; /* refuse a single call estimated over $1 */

/* Cents per 1,000,000 tokens, [input, output]. Unknown models are priced high
   so a guess cannot slip under the cap. */
const AI_RATES = {
  'gpt-4o-mini':[15, 60],
  'gpt-4.1-mini':[40, 160],
  'gpt-4.1-nano':[10, 40],
  'gpt-4o':[250, 1000],
  'gpt-4.1':[200, 800],
  'o4-mini':[110, 440]
};

function aiWeekId(date){
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day===0 ? -6 : 1-day;
  d.setDate(d.getDate()+diff);
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dayN = String(d.getDate()).padStart(2,'0');
  return d.getFullYear()+'-'+m+'-'+dayN;
}

function aiRates(model){
  const name = String(model||'').toLowerCase();
  const keys = Object.keys(AI_RATES).sort((a,b)=>b.length-a.length);
  const hit = keys.find(k=>name===k || name.startsWith(k));
  return hit ? AI_RATES[hit] : [1500, 6000];
}

function estimateMilli(model, inChars, outTokens){
  const [pin, pout] = aiRates(model);
  const inTok = Math.ceil(Math.max(0, inChars)/4);
  const cents = (inTok/1e6)*pin + (Math.max(0, outTokens)/1e6)*pout;
  return Math.ceil(cents*1000);
}

function usageMilli(model, usage){
  if(!usage) return 0;
  const [pin, pout] = aiRates(model);
  const cents = ((usage.prompt_tokens||0)/1e6)*pin + ((usage.completion_tokens||0)/1e6)*pout;
  return Math.ceil(cents*1000);
}

function rollSpend(ai, now){
  const id = aiWeekId(now||new Date());
  if(!ai.spend || ai.spend.weekId!==id) ai.spend = { weekId:id, milli:0 };
  return ai.spend;
}

function spendRoom(ai, estimate, now){
  const spend = rollSpend(ai, now);
  if(estimate > AI_CALL_CAP_MILLI) return { ok:false, reason:'call' };
  if(spend.milli + estimate > AI_CAP_MILLI) return { ok:false, reason:'budget' };
  return { ok:true, spend };
}

function formatDollars(milli){
  return '$'+(Math.max(0, milli)/100000).toFixed(2);
}

/* Keep a model suggestion only when it stays close to the built-in number. */
function sanitizeLift(json, week1ById){
  if(!json || typeof json !== 'object') return null;
  const note = String(json.note||'').slice(0, 280);
  const loads = Array.isArray(json.loads) ? json.loads : [];
  const byId = {};
  loads.forEach(row=>{
    if(!row || !LIBRARY[row.id]) return;
    const sug = week1ById[row.id];
    const next = Number(row.week1Kg);
    if(!isFinite(sug) || sug<=0 || !isFinite(next)) return;
    if(next < sug*0.9 || next > sug*1.1) return;
    byId[row.id] = next-sug;
  });
  return { note, byId };
}

function sanitizeRun(json, builtin){
  if(!json || typeof json !== 'object' || !builtin) return null;
  const sessions = builtin.sessions.map(b=>{
    const got = Array.isArray(json.sessions) ? json.sessions.find(s=>s && Number(s.day)===b.dayIdx) : null;
    if(!got) return b;
    let minutes = Math.round(Number(got.minutes));
    if(!isFinite(minutes)) return b;
    const lo = Math.max(8, Math.round(b.minutes*0.7));
    const hi = Math.round(b.minutes*1.3);
    minutes = Math.max(lo, Math.min(hi, minutes));
    let kind = got.kind==='quality' ? 'quality' : 'easy';
    if(b.kind!=='quality' || builtin.pain) kind = 'easy';
    const title = String(got.title||b.title).replace(/\s+/g,' ').slice(0, 80);
    const detail = String(got.detail||b.detail).replace(/\s+/g,' ').slice(0, 240);
    return { dayIdx:b.dayIdx, kind, minutes, title:title||b.title, detail:detail||b.detail };
  });
  return { note:String(json.note||'').slice(0, 280), sessions };
}

function aiEndpoint(){
  const base = String((state.ai && state.ai.baseUrl) || 'https://api.openai.com/v1').trim().replace(/\/+$/, '');
  if(!/^https:\/\//i.test(base)) return '';
  return base+'/chat/completions';
}

let aiBusy = false;

async function askModel(messages){
  if(!state.ai || !String(state.ai.key||'').trim()) return { ok:false, reason:'nokey' };
  if(aiBusy) return { ok:false, reason:'busy' };
  const model = state.ai.model || 'gpt-4o-mini';
  const url = aiEndpoint();
  if(!url){
    flagAlert('ai', 'The model address has to start with https. The built-in plan is on.', true);
    return { ok:false, reason:'url' };
  }
  const bodyObj = { model, temperature:0.2, messages };
  const est = estimateMilli(model, JSON.stringify(bodyObj).length+800, 600);
  const room = spendRoom(state.ai, est);
  if(!room.ok){
    const text = room.reason==='call'
      ? 'That request looked too expensive, so it was not sent. The built-in plan is on.'
      : 'This week’s $3 limit is used, so the built-in plan is on.';
    flagAlert('budget', text, true);
    return { ok:false, reason:room.reason };
  }
  aiBusy = true;
  try{
    let res = await fetch(url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+String(state.ai.key).trim() },
      body:JSON.stringify(Object.assign({ response_format:{ type:'json_object' } }, bodyObj))
    });
    if(res.status===400){
      res = await fetch(url, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+String(state.ai.key).trim() },
        body:JSON.stringify(bodyObj)
      });
    }
    if(!res.ok){
      flagAlert('ai', 'The model request was declined ('+res.status+'). The built-in plan is on.', true);
      return { ok:false, reason:'http' };
    }
    const data = await res.json();
    const billed = usageMilli(model, data.usage);
    state.ai.spend.milli += billed || est;
    save();
    const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    let json = null;
    try{ json = JSON.parse(text); }catch(e){
      const m = String(text||'').match(/\{[\s\S]*\}/);
      if(m){ try{ json = JSON.parse(m[0]); }catch(err){ json = null; } }
    }
    if(!json){
      flagAlert('ai', 'The model reply could not be read. The built-in plan is on.', true);
      return { ok:false, reason:'parse' };
    }
    return { ok:true, json };
  }catch(e){
    flagAlert('ai', 'The model could not be reached. The built-in plan is on.', true);
    return { ok:false, reason:'network' };
  }finally{
    aiBusy = false;
  }
}

function liftPrompt(week){
  const b = blockOf(week);
  const rows = [];
  WEEK_SHAPE.forEach((shape, di)=>{
    if(shape.type!=='lift') return;
    dayTemplate(week, di).slots.forEach(s=>{
      const w1 = week1Kg(s.exercise, state.training, state.settings);
      rows.push({ id:s.exercise.id, name:s.exercise.name, pattern:s.exercise.pattern, week1Kg:Math.round(w1*100)/100 });
    });
  });
  const recent = state.logs.filter(l=>l.v===2 && l.type==='lift').slice(-8).map(l=>({
    week:l.week, day:l.name,
    sets:(l.exercises||[]).map(e=>({ id:e.performedId, name:e.name, kg:e.weightKg, result:e.result }))
  }));
  return {
    messages:[
      { role:'system', content:'You adjust week-1 working weights for a lifter. Reply with JSON only: {"note":"","loads":[{"id":"","week1Kg":0}]}. Only include ids you change. Each week1Kg must stay within 10% of the given week1Kg. Do not invent ids. note is one or two sentences.' },
      { role:'user', content:JSON.stringify({ block:b.block.name, weekInBlock:b.weekInBlock, scheme:b.scheme.name, exercises:rows, recent }) }
    ],
    rows
  };
}

function runPrompt(){
  const builtin = planRuns(state.running);
  return {
    builtin,
    messages:[
      { role:'system', content:'You adjust a week of running. Reply with JSON only: {"note":"","sessions":[{"day":1,"kind":"easy","minutes":30,"title":"","detail":""}]}. Keep every session within 30% of the given minutes. kind may be "quality" only if the given session is quality. If pain is true, every session stays easy. Do not add sessions.' },
      { role:'user', content:JSON.stringify({
        level:state.running.level,
        days:state.running.daysPerWeek,
        pain:builtin.pain,
        note:builtin.note,
        sessions:builtin.sessions.map(s=>({ day:s.dayIdx, kind:s.kind, minutes:s.minutes, title:s.title, detail:s.detail })),
        recent:(state.running.logs||[]).slice(-6)
      }) }
    ]
  };
}

async function personalizeLift(force){
  if(!String(state.ai.key||'').trim()) return;
  const key = String(Math.floor((Math.max(1,state.currentWeek)-1)/4));
  if(!force && state.training.ai && String(state.training.ai.blockKey)===key) return;
  const packed = liftPrompt(state.currentWeek);
  const res = await askModel(packed.messages);
  if(!res.ok) return;
  const week1 = {};
  packed.rows.forEach(r=>{ week1[r.id]=r.week1Kg; });
  const clean = sanitizeLift(res.json, week1);
  if(!clean){
    flagAlert('ai', 'The model’s lifting suggestion was outside the safe range. The built-in plan is on.', true);
    return;
  }
  state.training.ai = { blockKey:Number(key), byId:clean.byId, note:clean.note };
  save();
  renderAll();
}

this.AI_CAP_MILLI = AI_CAP_MILLI;

async function personalizeRun(force){
  if(!String(state.ai.key||'').trim()) return;
  const sig = runSignature(state.running);
  if(!force && state.running.ai && state.running.ai.sig===sig) return;
  const packed = runPrompt();
  const res = await askModel(packed.messages);
  if(!res.ok) return;
  const clean = sanitizeRun(res.json, packed.builtin);
  if(!clean){
    flagAlert('ai', 'The model’s running suggestion was outside the safe range. The built-in plan is on.', true);
    return;
  }
  state.running.ai = { sig, note:clean.note, sessions:clean.sessions };
  save();
  renderAll();
}
