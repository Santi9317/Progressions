import { readFileSync } from 'fs';
import vm from 'vm';
import assert from 'assert';

const ctx = { console, Math, Date, Object, String, Number, Array, JSON, isFinite, parseFloat, parseInt };
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('../program.js', import.meta.url), 'utf8'), ctx);
vm.runInContext(readFileSync(new URL('../ai.js', import.meta.url), 'utf8'), ctx);
vm.runInContext(readFileSync(new URL('../nutrition.js', import.meta.url), 'utf8'), ctx);

const settings = { unit:'lbs', incKg:2.27 };
const empty = { loads:{}, patternNudge:{} };
const bench = ctx.LIBRARY['bb-bench'];
const machine = ctx.LIBRARY['mach-chest'];
const squat = ctx.LIBRARY['back-squat'];

const w1 = ctx.plateValue(ctx.suggestKg(bench, 1, empty, settings), bench, 'lbs');
assert.strictEqual(w1, 95, 'week 1 bench starts at 95');
const w2 = ctx.plateValue(ctx.suggestKg(bench, 2, { loads:{ 'bb-bench':95/2.2046 }, patternNudge:{} }, settings), bench, 'lbs');
assert.ok(w2 > 95 && w2 < 110, 'week 2 is a step up, got '+w2);

const machineStart = ctx.plateValue(ctx.suggestKg(machine, 1, empty, settings), machine, 'lbs');
assert.notStrictEqual(machineStart, w1, 'a machine press does not copy the barbell');

function log(id, week, lb, result){
  const ex = ctx.LIBRARY[id];
  return { v:2, type:'lift', week, dayIdx:0, exercises:[{ performedId:id, weightKg:lb/2.2046, result, pattern:ex.pattern }] };
}
let rebuilt = ctx.rebuildTraining([
  log('bb-bench', 1, 95, 'hit'),
  log('bb-bench', 2, 102.5, 'hit'),
  log('bb-bench', 3, 110, 'hit'),
  log('bb-bench', 4, 120, 'hit')
], {}, settings);
assert.ok(rebuilt.patternNudge.horizontal_push >= 1, 'a peak hit nudges the pattern');
const next = ctx.plateValue(ctx.suggestKg(bench, 5, rebuilt, settings), bench, 'lbs');
assert.ok(next >= 100, 'next block bench is heavier, got '+next);
const freshMachine = ctx.plateValue(ctx.suggestKg(machine, 5, rebuilt, settings), machine, 'lbs');
assert.ok(freshMachine < next - 20, 'new press is not given the barbell load, got '+freshMachine+' vs '+next);

const short = ctx.rebuildTraining([log('back-squat', 1, 95, 'short')], {}, settings);
const afterShort = ctx.plateValue(ctx.suggestKg(squat, 2, short, settings), squat, 'lbs');
assert.ok(afterShort < 140, 'a short set does not jump the squat, got '+afterShort);

const subs = ctx.substitutesFor(bench);
assert.ok(subs.every(s => s.pattern==='horizontal_push' && s.id!=='bb-bench'));
assert.ok(subs.some(s => s.equip!=='barbell'));

const painful = ctx.planRuns({ level:'consistent', daysPerWeek:2, logs:[{ minutes:30, rpe:5, pain:true, at:1 }] });
assert.ok(painful.pain);
assert.ok(painful.sessions.every(s => s.kind==='easy' && s.minutes<=15));

const base = ctx.planRuns({ level:'new', daysPerWeek:2, logs:[] });
const moved = ctx.planRuns({ level:'new', daysPerWeek:2, logs:[{ minutes:20, rpe:5, at:1 },{ minutes:20, rpe:6, at:2 }] });
assert.strictEqual(moved.sessions[1].minutes, base.sessions[1].minutes+5);

const hard = ctx.planRuns({ level:'consistent', daysPerWeek:2, logs:[{ minutes:40, rpe:9, at:1 },{ minutes:40, rpe:5, at:2 }] });
const calm = ctx.planRuns({ level:'consistent', daysPerWeek:2, logs:[{ minutes:40, rpe:5, at:1 },{ minutes:40, rpe:5, at:2 }] });
assert.ok(hard.sessions[1].minutes < calm.sessions[1].minutes, 'high effort trims the week');
assert.strictEqual(calm.sessions[0].kind, 'quality');
assert.strictEqual(calm.sessions[0].dayIdx, 1, 'quality run is not the day after squats');

const monday = ctx.aiWeekId(new Date(2026, 10, 16));
const thursday = ctx.aiWeekId(new Date(2026, 10, 19));
const sunday = ctx.aiWeekId(new Date(2026, 10, 22));
const nextMonday = ctx.aiWeekId(new Date(2026, 10, 23));
assert.strictEqual(monday, '2026-11-16');
assert.strictEqual(thursday, monday);
assert.strictEqual(sunday, monday);
assert.strictEqual(nextMonday, '2026-11-23');

const est = ctx.estimateMilli('gpt-4o-mini', 4000, 500);
const unknown = ctx.estimateMilli('some-new-model', 4000, 500);
assert.ok(unknown > est*10, 'unknown models are priced high');
const ai = { spend:{ weekId:'2026-11-16', milli:290000 } };
const room = ctx.spendRoom(ai, 20000, new Date(2026, 10, 19));
assert.strictEqual(room.ok, false);
assert.strictEqual(room.reason, 'budget');
const ok = ctx.spendRoom({ spend:{ weekId:'2026-11-16', milli:0 } }, est, new Date(2026, 10, 19));
assert.strictEqual(ok.ok, true);
const pricey = ctx.spendRoom({ spend:{ weekId:'2026-11-16', milli:0 } }, 150000, new Date(2026, 10, 19));
assert.strictEqual(pricey.reason, 'call');

const clean = ctx.sanitizeLift({ note:'Up a hair', loads:[{ id:'bb-bench', week1Kg:42 }, { id:'nope', week1Kg:10 }, { id:'mach-chest', week1Kg:80 }] }, { 'bb-bench':40, 'mach-chest':40 });
assert.ok(Math.abs(clean.byId['bb-bench']-2)<0.001);
assert.strictEqual(clean.byId['mach-chest'], undefined);
assert.strictEqual(clean.byId.nope, undefined);

const runClean = ctx.sanitizeRun({
  note:'Slightly shorter',
  sessions:[{ day:1, kind:'quality', minutes:5, title:'Go', detail:'x' }, { day:4, kind:'quality', minutes:100, title:'Long', detail:'y' }]
}, { pain:false, sessions:[{ dayIdx:1, kind:'quality', minutes:30, title:'Strides', detail:'easy' }, { dayIdx:4, kind:'easy', minutes:30, title:'Easy run', detail:'easy' }] });
assert.ok(runClean.sessions[0].minutes >= 21);
assert.strictEqual(runClean.sessions[1].kind, 'easy');
assert.ok(runClean.sessions[1].minutes <= 39);

const legacy = ctx.seedFromLegacy([
  { exercises:[{ name:'Barbell Bench Press', weight:135/2.2046 }] }
], true);
const seeded = ctx.plateValue(ctx.suggestKg(bench, 1, { loads:legacy, patternNudge:{} }, settings), bench, 'lbs');
assert.ok(seeded < 135 && seeded > 90, 'old 6–8 bench is scaled into the volume week, got '+seeded);

ctx.state = {
  currentWeek:1,
  ai:{ key:'' },
  menu:{ choices:{}, made:{}, bought:{}, plans:{}, history:[], staples:{ 'olive oil':true, salt:true, 'black pepper':true }, salt:0, prefs:{ diet:'omnivore', avoid:'', likes:'', note:'', minutes:25, servings:1 } }
};
ctx.save = ()=>{};
ctx.shopOnlyUnmade = false;
ctx.esc = s=>String(s);

const mondayMeal = ctx.fallbackMeal(1, 0, 'breakfast');
const nextWeekMeal = ctx.fallbackMeal(2, 0, 'breakfast');
assert.notStrictEqual(mondayMeal.name, nextWeekMeal.name, 'a new training week is not the same breakfast');
assert.ok(mondayMeal.description && mondayMeal.description.length>20);
assert.ok(mondayMeal.recipe.ingredients.every(item=>item.unit!=='g' && item.unit!=='ml'));

const later = ctx.rotationKey(1, new Date(2026, 10, 23));
const earlier = ctx.rotationKey(1, new Date(2026, 10, 16));
assert.notStrictEqual(later, earlier, 'a new calendar week rotates the built-in menu');

const grams = ctx.sanitizeMeals({
  note:'Mostly oats',
  meals:[{
    day:0, slot:'breakfast', name:'Oat plate',
    description:'A warm bowl of oats with peanut butter and a banana.',
    minutes:10, cost:2,
    ingredients:[
      { item:'Rolled oats', qty:40, unit:'g', aisle:'Pantry' },
      { item:'Banana', qty:1, unit:'each', aisle:'Produce' }
    ],
    steps:['Microwave the oats.','Slice the banana on top.']
  }]
}, 3, 1);
assert.strictEqual(grams.accepted, 1);
const oats = grams.meals['0:breakfast'].recipe.ingredients.find(item=>/oat/i.test(item.item));
assert.strictEqual(oats.unit, 'oz');
assert.ok(grams.meals['0:lunch'].description);
assert.strictEqual(ctx.menuFromModel({ meals:[] }, 3, 1), null);

const full = [];
for(let day=0; day<7; day++){
  ['breakfast','lunch','dinner'].forEach(slot=>{
    full.push({
      day, slot, name:slot+' plate '+day,
      description:'A simple one-pan plate with protein and vegetables.',
      minutes:20, cost:4,
      ingredients:[
        { item:'Chicken thighs', qty:0.4, unit:'lb', aisle:'Protein' },
        { item:'Broccoli', qty:200, unit:'g', aisle:'Produce' }
      ],
      steps:['Cook the chicken.','Cook the broccoli and serve.']
    });
  });
}
const modeled = ctx.menuFromModel({ note:'A fresh week', meals:full }, 4, 1);
assert.ok(modeled);
assert.strictEqual(modeled.accepted, 21);
assert.strictEqual(modeled.meals['2:dinner'].recipe.ingredients[1].unit, 'oz');

ctx.installBuiltinMenu(1);
const plain = {
  name:'Rice plate', description:'Rice and broccoli in one pot.',
  minutes:15, cost:2, timing:'Midday',
  recipe:{ ingredients:[
    { item:'Long grain white rice', qty:0.33, unit:'cup', aisle:'Pantry' },
    { item:'Broccoli', qty:0.5, unit:'lb', aisle:'Produce' }
  ], steps:['Cook the rice.','Cook the broccoli.'] }
};
const eggs = {
  name:'Egg plate', description:'Eggs cooked in one pan with spinach.',
  minutes:10, cost:2, timing:'Morning',
  recipe:{ ingredients:[
    { item:'Eggs', qty:3, unit:'large', aisle:'Dairy' },
    { item:'Olive oil', qty:1, unit:'tsp', aisle:'Pantry', staple:true }
  ], steps:['Heat the oil.','Scramble the eggs.'] }
};
for(let day=0; day<7; day++){
  ['breakfast','lunch','dinner'].forEach(slot=>{
    ctx.state.menu.plans['1'].meals[day+':'+slot] = JSON.parse(JSON.stringify(plain));
  });
}
ctx.state.menu.plans['1'].meals['0:breakfast'] = JSON.parse(JSON.stringify(eggs));
ctx.state.menu.plans['1'].meals['1:breakfast'] = JSON.parse(JSON.stringify(eggs));
const shop = ctx.buildWeekShoppingList(1, false);
const eggRow = shop.find(row=>/egg/i.test(row.item));
assert.strictEqual(eggRow.label, '1 dozen');
assert.strictEqual(ctx.groceryName('Banana', 2, 'each'), 'Bananas');
assert.strictEqual(ctx.fmtMoney(2.5), '$2.50');
assert.strictEqual(eggRow.unit, 'dozen');
const oil = shop.find(row=>/olive oil/i.test(row.item));
assert.strictEqual(oil.stocked, true);
const text = ctx.shoppingListText(1);
assert.ok(text.indexOf('1 dozen Eggs')>=0);
assert.ok(text.indexOf('Olive oil')<0);

const plan = ctx.state.menu.plans['1'];
plan.sig = ctx.menuSig(1, new Date(2026, 10, 16));
plan.source = 'builtin';
assert.strictEqual(ctx.menuIsCurrent(plan, 1, new Date(2026, 10, 16)), true);
assert.strictEqual(ctx.menuIsCurrent(plan, 1, new Date(2026, 10, 23)), false);
ctx.state.ai.key = 'sk-test';
assert.strictEqual(ctx.menuIsCurrent(plan, 1, new Date(2026, 10, 16)), false);
plan.source = 'ai';
plan.sig = ctx.menuSig(1, new Date(2026, 10, 16));
assert.strictEqual(ctx.menuIsCurrent(plan, 1, new Date(2026, 10, 16)), true);
ctx.state.menu.made['1:0:breakfast'] = true;
assert.strictEqual(ctx.weekHasActivity(1), true);

const mealEstimate = ctx.estimateMilli('gpt-4o-mini', 6000, 4200);
assert.ok(mealEstimate < 100000, 'a weekly menu stays under the single-call cap');

console.log('logic ok');
