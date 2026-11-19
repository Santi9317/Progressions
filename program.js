/* Training, substitution, and running plans.
   Pure data and functions. The page script owns storage and the screen. */

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/* Four-week wave. Factors are relative to the week-1 working weight.
   Rep ranges follow the public microcycle used by Shortcut to Size
   (volume → hypertrophy → strength → peak). Sessions themselves are original. */
const WEEK_SCHEME = [
  { name:'Volume', reps:'12–15', setsMain:4, setsAcc:3, restMain:90, restAcc:60, factor:1, finisher:'pause' },
  { name:'Hypertrophy', reps:'9–11', setsMain:4, setsAcc:3, restMain:120, restAcc:75, factor:1.08, finisher:'pause' },
  { name:'Strength', reps:'6–8', setsMain:4, setsAcc:3, restMain:150, restAcc:75, factor:1.16, finisher:'drop' },
  { name:'Peak', reps:'3–5', setsMain:4, setsAcc:3, restMain:180, restAcc:90, factor:1.26, finisher:'drop' }
];

const PATTERN_LABEL = {
  horizontal_push:'Horizontal press',
  vertical_push:'Overhead press',
  horizontal_pull:'Row',
  vertical_pull:'Pulldown or pull-up',
  squat:'Squat',
  hinge:'Hinge',
  lunge:'Lunge or split squat',
  leg_curl:'Leg curl',
  leg_ext:'Leg extension',
  calf:'Calf raise',
  lateral:'Lateral raise',
  rear_delt:'Rear delt',
  curl:'Curl',
  tricep:'Triceps',
  core:'Core',
  hip:'Hip'
};

const EQUIP_LABEL = {
  barbell:'Barbell', dumbbell:'Dumbbell', cable:'Cable', machine:'Machine', smith:'Smith', bodyweight:'Bodyweight'
};

const LIBRARY = {};
function ex(id, name, pattern, equip, step, startLb, inc, cue, reps){
  LIBRARY[id] = { id, name, pattern, equip, step, startLb, inc, cue, reps: reps || '' };
}

ex('bb-bench','Barbell Bench Press','horizontal_push','barbell','bar',95,'upper','Lie on a flat bench, feet planted. Lower the bar to mid-chest with elbows about 45° from your sides, then press up without bouncing.');
ex('db-bench','Dumbbell Bench Press','horizontal_push','dumbbell','db',40,'upper','Press the dumbbells from chest level until they nearly meet over you. Keep the descent slow.');
ex('mach-chest','Machine Chest Press','horizontal_push','machine','pin',50,'upper','Set the seat so the handles meet your mid-chest. Press until the arms are long without locking hard, then return under control.');
ex('smith-bench','Smith Bench Press','horizontal_push','smith','bar',85,'upper','Set the bench under the Smith bar so the bar meets mid-chest. Unhook, lower, and press. Keep your feet planted.');
ex('inc-db-press','Incline Dumbbell Press','horizontal_push','dumbbell','db',30,'upper','Set the bench around 30°. Press up and slightly in from the upper chest.');
ex('inc-mach','Incline Machine Press','horizontal_push','machine','pin',45,'upper','Use the incline chest machine. Press through the upper chest and stop short of a hard lockout.');
ex('cable-press','Standing Cable Press','horizontal_push','cable','pin',25,'upper','Set two cables at chest height and press forward. Stand tall so the torso does the bracing, not the lower back.');
ex('cable-fly','Cable Fly','horizontal_push','cable','pin',20,'iso','Cables at chest height. Soft elbows, bring the handles together in front of the chest, and let the chest stretch on the way back.');
ex('inc-cable-fly','Incline Cable Fly','horizontal_push','cable','pin',15,'iso','Set the cables low and bring the handles up toward the upper chest so the upper chest does the work.');
ex('low-high-fly','Low-to-High Cable Fly','horizontal_push','cable','pin',15,'iso','From low pulleys, sweep the handles up to collarbone height. Pause where the chest squeezes.');
ex('pec-deck','Pec Deck','horizontal_push','machine','pin',40,'iso','Seat height so the pads meet the forearms. Bring the pads together and open until you feel a chest stretch.');

ex('db-ohp','Seated Dumbbell Press','vertical_push','dumbbell','db',30,'upper','Sit tall, dumbbells at the shoulders, and press overhead without arching the lower back.');
ex('mach-shoulder','Machine Shoulder Press','vertical_push','machine','pin',40,'upper','Handles start near the shoulders. Press up and stop before the shoulders shrug to the ears.');
ex('arnold','Arnold Press','vertical_push','dumbbell','db',25,'upper','Start with palms toward you at the shoulders, rotate the palms forward as you press, and reverse it on the way down.');
ex('smith-ohp','Smith Shoulder Press','vertical_push','smith','bar',55,'upper','Sit on an upright bench under the Smith bar. Press from the upper chest to just overhead.');

ex('cable-lateral','Cable Lateral Raise','lateral','cable','pin',10,'iso','Stand side-on to a low cable. Raise the far arm to shoulder height, leading with the elbow, and lower slowly.');
ex('cable-lateral-1','Single-Arm Cable Lateral','lateral','cable','pin',10,'iso','One arm at a time from a low cable. Stop at shoulder height and keep the torso still.');
ex('db-lateral','Dumbbell Lateral Raise','lateral','dumbbell','db',10,'iso','Soft elbows, raise the dumbbells out to the side to shoulder height, and resist the drop.');

ex('bb-row','Barbell Row','horizontal_pull','barbell','bar',95,'upper','Hinge until the torso is near 45°, then pull the bar to the lower chest. Keep the back flat.');
ex('db-row','One-Arm Dumbbell Row','horizontal_pull','dumbbell','db',35,'upper','One hand and knee on a bench. Pull the dumbbell to the hip, not the armpit, and lower until the shoulder stretches.');
ex('seat-row','Seated Cable Row','horizontal_pull','cable','pin',60,'upper','Sit tall, pull the handle to the ribs, and let the shoulders reach forward on the return.');
ex('mach-row','Machine Row','horizontal_pull','machine','pin',55,'upper','Chest against the pad. Pull the handles toward the lower ribs and pause.');
ex('sa-cable-row','Single-Arm Cable Row','horizontal_pull','cable','pin',30,'upper','One arm, from a mid pulley. Pull the elbow past the ribs and keep the shoulders square.');
ex('chest-row','Chest-Supported Dumbbell Row','horizontal_pull','dumbbell','db',30,'upper','Lie face down on an incline bench and row both dumbbells to the hips. The bench keeps the lower back out of it.');

ex('lat-pd','Lat Pulldown','vertical_pull','cable','pin',70,'upper','Grip just outside the shoulders. Pull the bar to the upper chest, elbows down, and control the rise.');
ex('neutral-pd','Neutral-Grip Pulldown','vertical_pull','cable','pin',70,'upper','Palms facing each other. Pull to the collarbone and let the shoulders rise at the top.');
ex('assist-pullup','Assisted Pull-Up','vertical_pull','machine','pin',50,'assist','A lower assistance number is harder. Pull the chest toward the bar and lower until the arms are long.');
ex('straight-arm','Straight-Arm Pulldown','vertical_pull','cable','pin',25,'iso','Arms stay nearly straight. Pull the bar from overhead down to the thighs by driving the shoulders down.');

ex('face-pull','Face Pull','rear_delt','cable','pin',25,'iso','Rope at face height. Pull toward the nose and finish with the hands outside the ears.');
ex('rev-pec','Reverse Pec Deck','rear_delt','machine','pin',40,'iso','Face the pad. Open the arms until the rear shoulders squeeze, then return slowly.');

ex('bb-curl','Barbell Curl','curl','barbell','bar',45,'iso','Elbows stay under the shoulders. Curl without swinging the torso.');
ex('hammer','Hammer Curl','curl','dumbbell','db',20,'iso','Palms face each other. Curl and lower until the arms are straight.');
ex('inc-curl','Incline Dumbbell Curl','curl','dumbbell','db',20,'iso','Bench at about 45°. Let the arms hang so the biceps stretch, then curl.');
ex('cable-curl','Cable Curl','curl','cable','pin',25,'iso','Low cable, elbows pinned. Squeeze at the top and lower all the way.');
ex('conc-curl','Concentration Curl','curl','dumbbell','db',15,'iso','Sit, elbow braced on the inner thigh, and curl without moving the shoulder.');

ex('rope-pushdown','Rope Pushdown','tricep','cable','pin',30,'iso','Elbows at your sides. Spread the rope at the bottom and let it rise only to about 90°.');
ex('oh-cable-ext','Overhead Cable Extension','tricep','cable','pin',25,'iso','Face away from a high cable, hands behind the head, and extend the elbows overhead.');
ex('oh-ext','Overhead Dumbbell Extension','tricep','dumbbell','db',25,'iso','Both hands on one dumbbell. Lower it behind the head and extend without flaring the elbows.');
ex('dip-assist','Assisted Dip','tricep','machine','pin',40,'assist','A lower assistance number is harder. Lean slightly for chest, stay upright for triceps, and go as deep as the shoulders allow.');
ex('skull','EZ-Bar Skull Crusher','tricep','barbell','bar',40,'iso','Lie on a bench and lower the bar toward the forehead by bending only the elbows, then extend.');

ex('back-squat','Barbell Back Squat','squat','barbell','bar',135,'lower','Bar on the upper back, feet about shoulder width. Sit to at least parallel and drive through the whole foot.');
ex('smith-squat','Smith Squat','squat','smith','bar',95,'lower','Feet slightly in front of the bar. Sit down and stand, keeping the heels down.');
ex('goblet-squat','Goblet Squat','squat','dumbbell','db',40,'lower','Hold one dumbbell at the chest. Elbows inside the knees at the bottom, torso tall.');
ex('leg-press','Leg Press','squat','machine','pin',180,'lower','Feet shoulder width on the platform. Lower until the knees are near 90° and do not let the lower back round.');
ex('leg-press-high','Leg Press, Feet High','squat','machine','pin',160,'lower','Feet higher on the platform so the hips and hamstrings take more of the load. Keep the lower back against the pad.');

ex('bb-rdl','Barbell Romanian Deadlift','hinge','barbell','bar',95,'lower','Soft knees, push the hips back, and lower the bar along the legs until the hamstrings stretch. Stand by driving the hips forward.');
ex('db-rdl','Dumbbell Romanian Deadlift','hinge','dumbbell','db',40,'lower','Dumbbells in front of the thighs. Hinge until you feel the hamstrings, then stand tall.');
ex('sl-rdl','Single-Leg Romanian Deadlift','hinge','dumbbell','db',30,'lower','One dumbbell in the opposite hand. Hinge on the standing leg and keep the hips square.');
ex('deadlift','Deadlift','hinge','barbell','bar',135,'lower','Bar over mid-foot, brace, and push the floor away. Stand all the way up, then lower along the legs.');
ex('hip-thrust','Barbell Hip Thrust','hinge','barbell','bar',95,'lower','Upper back on a bench, bar over the hips. Drive the hips up until the torso is level with the thighs.');
ex('cable-pullthrough','Cable Pull-Through','hinge','cable','pin',30,'lower','Face away from a low cable. Reach through the legs and stand by squeezing the glutes.');

ex('db-lunge','Walking Dumbbell Lunge','lunge','dumbbell','db',25,'lower','Step forward until both knees are near 90°, then push into the next step. Torso stays tall.');
ex('bulgarian','Bulgarian Split Squat','lunge','dumbbell','db',25,'lower','Rear foot on a bench. Drop the back knee toward the floor and keep the front heel down.');
ex('step-up','Dumbbell Step-Up','lunge','dumbbell','db',20,'lower','Use a bench you can own. Drive through the top foot and do not push off the back toes.');
ex('reverse-lunge','Reverse Lunge','lunge','dumbbell','db',25,'lower','Step backward into the lunge and return to standing. Easier on the knee than a long forward step.');

ex('lying-curl','Lying Leg Curl','leg_curl','machine','pin',50,'iso','Hips stay on the pad. Curl the heels toward the glutes and lower slowly.');
ex('seat-curl','Seated Leg Curl','leg_curl','machine','pin',50,'iso','Pad on the lower shin. Curl under the seat and pause where the hamstrings squeeze.');

ex('leg-ext','Leg Extension','leg_ext','machine','pin',60,'iso','Knees line up with the pivot. Extend until the legs are straight and lower without slamming the stack.');

ex('stand-calf','Standing Calf Raise','calf','machine','pin',100,'iso','Pause at the top and let the heels drop below the step at the bottom.');
ex('seated-calf','Seated Calf Raise','calf','machine','pin',70,'iso','The seated machine loads the soleus. Full stretch at the bottom, pause at the top.');
ex('legpress-calf','Leg Press Calf Raise','calf','machine','pin',180,'iso','Balls of the feet on the bottom of the leg-press platform. Press through the toes, then let the heels drop.');

ex('plank','Plank','core','bodyweight','bw',0,'none','Forearms under the shoulders. A straight line from head to heels, glutes on, hips level.', '30–45 sec');
ex('side-plank','Side Plank','core','bodyweight','bw',0,'none','Elbow under the shoulder. Hips up, body in one line. Switch sides each set.', '20–30 sec');
ex('dead-bug','Dead Bug','core','bodyweight','bw',0,'none','Lower back stays on the floor. Reach the opposite arm and leg away and move slowly.', '8 / side');
ex('hanging-knee','Hanging Knee Raise','core','bodyweight','bw',0,'none','From a pull-up bar, lift the knees toward the chest without swinging.', '8–12');
ex('cable-crunch','Cable Crunch','core','cable','pin',30,'iso','Kneel facing a high cable. Round the spine and crunch the ribs toward the pelvis.');
ex('pallof','Pallof Press','core','cable','pin',20,'iso','Stand side-on to a mid cable. Press the handle straight out and hold the ribs still.', '10 / side');
ex('woodchop','Cable Woodchop','core','cable','pin',20,'iso','From a high cable, pull diagonally across the body by rotating the hips and ribs together.', '10 / side');
ex('ab-wheel','Ab Wheel','core','bodyweight','bw',0,'none','Knees down. Roll out only as far as the lower back stays braced, then pull back.', '6–10');
ex('abductor','Abductor Machine','hip','machine','pin',70,'iso','Sit tall and press the knees out. This is a small glute muscle, so keep the reps smooth.');

const WEEK_SHAPE = [
  { type:'lift', key:'push' },
  { type:'run', which:0 },
  { type:'lift', key:'lowerS' },
  { type:'lift', key:'pull' },
  { type:'run', which:1 },
  { type:'lift', key:'lowerP' },
  { type:'mobility' }
];

function slot(id, role){ return [id, role]; }

const BLOCKS = [
  {
    name:'Barbell strength',
    blurb:'Racks, a barbell, and cables. The main lifts stay put so you can add weight. The rep target changes every week.',
    push:{ label:'Upper push', tags:['Strength','Chest · Shoulders · Triceps'],
      slots:[slot('bb-bench','main'),slot('inc-db-press','main'),slot('cable-fly','acc'),slot('db-ohp','main'),slot('cable-lateral','acc'),slot('rope-pushdown','acc')],
      mobility:['Doorway chest stretch — 40 sec each side','Arm circles — 20 sec','Open-book rotation — 5 each side'] },
    lowerS:{ label:'Lower strength', tags:['Strength','Squat · Hinge'],
      slots:[slot('back-squat','main'),slot('bb-rdl','main'),slot('db-lunge','acc'),slot('lying-curl','acc'),slot('stand-calf','acc'),slot('plank','acc')],
      mobility:['Hip flexor stretch — 40 sec each side','Leg swings — 8 each','Bodyweight squat — 8 slow'] },
    pull:{ label:'Upper pull', tags:['Strength','Back · Biceps · Rear delts'],
      slots:[slot('bb-row','main'),slot('lat-pd','main'),slot('seat-row','acc'),slot('face-pull','acc'),slot('bb-curl','acc'),slot('hammer','acc')],
      mobility:['Dead hang — 20 sec','Cat-cow — 6','Thread the needle — 5 each side'] },
    lowerP:{ label:'Lower physique', tags:['Physique','Quads · Hamstrings · Calves'],
      slots:[slot('leg-press','main'),slot('bulgarian','main'),slot('seat-curl','acc'),slot('leg-ext','acc'),slot('seated-calf','acc'),slot('hanging-knee','acc')],
      mobility:['Figure-4 stretch — 40 sec each','Hamstring reach — 40 sec','Ankle circles — 20 sec each'] }
  },
  {
    name:'Machines and dumbbells',
    blurb:'A fresh menu on the same movement patterns. Loads you already logged stay on that exercise. A new exercise starts at its own weight.',
    push:{ label:'Upper push', tags:['Physique','Chest · Shoulders · Triceps'],
      slots:[slot('db-bench','main'),slot('mach-chest','main'),slot('inc-cable-fly','acc'),slot('mach-shoulder','main'),slot('db-lateral','acc'),slot('oh-cable-ext','acc')],
      mobility:['Floor pec stretch — 40 sec','Wall slides — 8','T-spine rotation — 5 each side'] },
    lowerS:{ label:'Lower strength', tags:['Strength','Squat · Hinge'],
      slots:[slot('smith-squat','main'),slot('db-rdl','main'),slot('step-up','acc'),slot('seat-curl','acc'),slot('legpress-calf','acc'),slot('dead-bug','acc')],
      mobility:['90/90 sit — 30 sec each','World’s greatest stretch — 3 each side','Glute bridge — 10'] },
    pull:{ label:'Upper pull', tags:['Physique','Back · Biceps'],
      slots:[slot('db-row','main'),slot('neutral-pd','main'),slot('mach-row','acc'),slot('rev-pec','acc'),slot('inc-curl','acc'),slot('cable-curl','acc')],
      mobility:['Child’s pose — 40 sec','Scapular pull-up — 6','Neck side bend — 20 sec each'] },
    lowerP:{ label:'Lower physique', tags:['Physique','Single leg · Hamstrings'],
      slots:[slot('leg-press-high','main'),slot('reverse-lunge','main'),slot('lying-curl','acc'),slot('leg-ext','acc'),slot('stand-calf','acc'),slot('cable-crunch','acc')],
      mobility:['Couch stretch — 40 sec each','Seated hamstring — 40 sec','Calf stretch on a step — 30 sec each'] }
  },
  {
    name:'Cables and single-leg',
    blurb:'More unilateral work and cables, which a busy floor usually has free when the racks are taken.',
    push:{ label:'Upper push', tags:['Physique','Cables · Shoulders'],
      slots:[slot('inc-mach','main'),slot('cable-press','main'),slot('low-high-fly','acc'),slot('arnold','main'),slot('cable-lateral-1','acc'),slot('dip-assist','acc')],
      mobility:['Lat stretch on a bar — 30 sec','Shoulder circles — 20 sec','Bench thoracic extension — 5'] },
    lowerS:{ label:'Lower strength', tags:['Strength','Unilateral'],
      slots:[slot('goblet-squat','main'),slot('sl-rdl','main'),slot('reverse-lunge','acc'),slot('seat-curl','acc'),slot('seated-calf','acc'),slot('side-plank','acc')],
      mobility:['Ankle rock — 8 each','Hip airplane hold — 20 sec each','Deep squat hold — 30 sec'] },
    pull:{ label:'Upper pull', tags:['Strength','Pull-up · Row'],
      slots:[slot('sa-cable-row','main'),slot('assist-pullup','main'),slot('straight-arm','acc'),slot('face-pull','acc'),slot('conc-curl','acc'),slot('hammer','acc')],
      mobility:['Doorway pec stretch — 40 sec each','Band-less pull-apart — 12','Cat-cow — 6'] },
    lowerP:{ label:'Lower physique', tags:['Physique','Hinge · Core'],
      slots:[slot('bulgarian','main'),slot('hip-thrust','main'),slot('cable-pullthrough','acc'),slot('leg-ext','acc'),slot('stand-calf','acc'),slot('pallof','acc')],
      mobility:['Pigeon or figure-4 — 40 sec each','Supine twist — 30 sec each','Easy walk — 3 min'] }
  }
];

const MOBILITY = [
  ['World’s greatest stretch — 3 each side','90/90 hip switches — 8 each side','Open books — 6 each side','Dead hang — 2 × 20 sec','Couch stretch — 45 sec each side'],
  ['Cat-cow — 8','Half-kneeling hip flexor — 45 sec each','Wall slides — 8','Ankle rocks — 8 each','Squat hold with easy breathing — 45 sec'],
  ['Side-lying windmill — 5 each','Figure-4 stretch — 45 sec each','Scapular push-ups — 8','Calf stretch on a step — 30 sec each','Easy walk — 5 min']
];

/* Old plan seeds, in pounds, used only to convert a never-edited legacy save. */
const LEGACY_LB = [
  { 'Barbell Bench Press':135, 'Incline Dumbbell Press':40, 'Cable Lateral Raises':15, 'Dumbbell Overhead Press':35, 'Cable Tricep Pushdown':40, 'Overhead Tricep Extension':30 },
  { 'Barbell Back Squat':185, 'Romanian Deadlift':135, 'Walking Lunges (Dumbbell)':30, 'Leg Extension':80, 'Seated Calf Raise':90, 'Cable Woodchop':25, 'Plank':0 },
  null,
  { 'Deadlift':225, 'Barbell Row':135, 'Lat Pulldown (Cable)':100, 'Face Pulls (Cable)':35, 'Incline Dumbbell Curl':25, 'Hammer Curl':25 },
  { 'Hip Thrust (Barbell)':185, 'Bulgarian Split Squat':35, 'Lying Leg Curl':60, 'Abductor Machine':100, 'Standing Calf Raise':100, 'Hanging Knee Raise':0, 'Ab Wheel Rollout':0 }
];
const LEGACY_NAME = {
  'Barbell Bench Press':'bb-bench','Incline Dumbbell Press':'inc-db-press','Cable Lateral Raises':'cable-lateral',
  'Dumbbell Overhead Press':'db-ohp','Cable Tricep Pushdown':'rope-pushdown','Overhead Tricep Extension':'oh-ext',
  'Barbell Back Squat':'back-squat','Romanian Deadlift':'bb-rdl','Walking Lunges (Dumbbell)':'db-lunge',
  'Leg Extension':'leg-ext','Seated Calf Raise':'seated-calf','Cable Woodchop':'woodchop','Plank':'plank',
  'Deadlift':'deadlift','Barbell Row':'bb-row','Lat Pulldown (Cable)':'lat-pd','Face Pulls (Cable)':'face-pull',
  'Incline Dumbbell Curl':'inc-curl','Hammer Curl':'hammer','Hip Thrust (Barbell)':'hip-thrust',
  'Bulgarian Split Squat':'bulgarian','Lying Leg Curl':'lying-curl','Abductor Machine':'abductor',
  'Standing Calf Raise':'stand-calf','Hanging Knee Raise':'hanging-knee','Ab Wheel Rollout':'ab-wheel'
};

function blockOf(week){
  const w = Math.max(1, week|0);
  const index = Math.floor((w-1)/4) % BLOCKS.length;
  const cycle = Math.floor((w-1)/4);
  const weekInBlock = ((w-1)%4)+1;
  return { index, cycle, weekInBlock, scheme:WEEK_SCHEME[weekInBlock-1], block:BLOCKS[index] };
}

function dayTemplate(week, dayIdx){
  const b = blockOf(week);
  const shape = WEEK_SHAPE[dayIdx];
  const day = DAY_NAMES[dayIdx];
  if(shape.type==='lift'){
    const spec = b.block[shape.key];
    return {
      type:'lift', day, label:spec.label, tags:spec.tags, mobility:spec.mobility,
      scheme:b.scheme, blockIndex:b.index, blockName:b.block.name,
      slots:spec.slots.map((pair,i)=>({ slot:i, id:pair[0], role:pair[1], exercise:LIBRARY[pair[0]] }))
    };
  }
  if(shape.type==='run'){
    return { type:'run', day, label:'Run', which:shape.which, tags:['Running'], scheme:b.scheme, blockName:b.block.name, blockIndex:b.index };
  }
  return { type:'mobility', day, label:'Mobility', tags:['Mobility','Rest'], items:MOBILITY[b.index], scheme:b.scheme, blockName:b.block.name, blockIndex:b.index };
}

function subKey(kind, week, dayIdx, slot){
  if(kind==='block') return Math.floor((Math.max(1,week)-1)/4)+':'+dayIdx+':'+slot;
  return week+':'+dayIdx+':'+slot;
}

function performedExercise(week, dayIdx, slot, prescribedId, training){
  training = training || {};
  const session = (training.sessionSub||{})[subKey('session', week, dayIdx, slot)];
  const block = (training.blockSub||{})[subKey('block', week, dayIdx, slot)];
  const id = session || block || prescribedId;
  return LIBRARY[id] || LIBRARY[prescribedId];
}

function substitutesFor(ex){
  return Object.keys(LIBRARY).map(id=>LIBRARY[id]).filter(o=>o.pattern===ex.pattern && o.id!==ex.id)
    .sort((a,b)=>((a.equip===ex.equip)-(b.equip===ex.equip)) || a.name.localeCompare(b.name));
}

function incKgFor(ex, settings){
  const base = (settings && settings.incKg) || 2.27;
  if(ex.inc==='lower') return base*2;
  if(ex.inc==='iso') return base*0.5;
  if(ex.inc==='upper') return base;
  return 0;
}

function plateStep(ex, unit){
  if(ex.step==='bw') return 0;
  if(unit==='kg') return ex.step==='bar' ? 1.25 : 2.5;
  return ex.step==='bar' ? 2.5 : 5;
}

function roundPlateKg(kg, ex, unit){
  if(!kg || ex.step==='bw') return 0;
  const step = plateStep(ex, unit);
  const raw = unit==='kg' ? kg : kg*2.2046;
  const n = Math.round(raw/step)*step;
  return unit==='kg' ? n : n/2.2046;
}

function plateValue(kg, ex, unit){
  if(!kg || ex.step==='bw') return 0;
  const step = plateStep(ex, unit);
  const raw = unit==='kg' ? kg : kg*2.2046;
  const n = Math.round(raw/step)*step;
  return Math.round(n*100)/100;
}

function week1Kg(ex, training, settings){
  if(training.loads && typeof training.loads[ex.id]==='number') return training.loads[ex.id];
  if(ex.step==='bw' || ex.inc==='assist') return ex.startLb/2.2046;
  let kg = ex.startLb/2.2046;
  const nudge = Math.min(4, (training.patternNudge && training.patternNudge[ex.pattern]) || 0);
  if(nudge>0) kg += nudge * incKgFor(ex, settings);
  return kg;
}

function suggestKg(ex, week, training, settings){
  if(!ex || ex.step==='bw') return 0;
  const unit = (settings && settings.unit) || 'lbs';
  if(ex.inc==='assist') return roundPlateKg(week1Kg(ex, training, settings), ex, unit);
  const factor = blockOf(week).scheme.factor;
  return roundPlateKg(week1Kg(ex, training, settings)*factor, ex, unit);
}

function repTarget(ex, scheme){
  if(ex.reps) return ex.reps;
  if(ex.pattern==='calf') return scheme.finisher==='drop' ? '8–12' : '15–20';
  if(ex.pattern==='core') return '10–15';
  return scheme.reps;
}

function setsFor(exRole, scheme){
  return exRole==='main' ? scheme.setsMain : scheme.setsAcc;
}

function restFor(exRole, scheme){
  return exRole==='main' ? scheme.restMain : scheme.restAcc;
}

function finisherText(scheme){
  if(scheme.finisher==='drop') return 'Last set: optional drop set. Finish the reps, take off about 25%, and continue.';
  return 'Last set: optional rest-pause. Finish the reps, rest 15 seconds, then go again.';
}

/* Replay every logged set so undo stays honest. `seed` is the starting week-1 weight. */
function rebuildTraining(logs, seed, settings){
  const loads = Object.assign({}, seed||{});
  const patternNudge = {};
  const training = { loads, patternNudge };
  (logs||[]).filter(l=>l && l.v===2 && l.type==='lift' && l.exercises)
    .slice().sort((a,b)=>a.week-b.week || a.dayIdx-b.dayIdx)
    .forEach(l=>applyLogToLoads(l.exercises, l.week, training, settings));
  return { loads, patternNudge };
}

function applyLogToLoads(entries, week, training, settings){
  const peak = blockOf(week).weekInBlock===4;
  const factor = blockOf(week).scheme.factor;
  (entries||[]).forEach(e=>{
    const ex = LIBRARY[e.performedId];
    if(!ex || ex.step==='bw' || ex.inc==='none' || !e.weightKg) return;
    if(ex.inc==='assist'){
      training.loads[ex.id] = e.weightKg;
      return;
    }
    let week1 = e.weightKg / factor;
    const result = e.result==='short' || e.result==='easy' ? e.result : 'hit';
    const prev = training.loads[ex.id];
    const step = incKgFor(ex, settings) || e.weightKg*0.02;
    /* A clean hit keeps the baseline. Plate rounding should not walk it down. */
    if(result==='hit' && typeof prev==='number' && Math.abs(week1-prev)<=step) week1 = prev;
    if(result==='easy' || (result==='hit' && peak)) week1 += incKgFor(ex, settings);
    if(peak && result!=='short'){
      training.patternNudge[ex.pattern] = (training.patternNudge[ex.pattern]||0)+1;
    }
    training.loads[ex.id] = week1;
  });
}

function seedFromLegacy(basePlan, weightUnitFixed){
  const seed = {};
  if(!basePlan) return seed;
  basePlan.forEach((day, di)=>{
    if(!day || !day.exercises) return;
    day.exercises.forEach(ex=>{
      const id = LEGACY_NAME[ex.name];
      const lib = id && LIBRARY[id];
      if(!lib || lib.step==='bw') return;
      let kg = Number(ex.weight);
      if(!kg) return;
      if(!weightUnitFixed){
        const lb = LEGACY_LB[di] && LEGACY_LB[di][ex.name];
        if(lb && Math.abs(kg-lb)<0.001) kg = lb/2.2046;
      }
      /* Old base was a 6–8 rep working weight, close to this plan's strength week. */
      seed[id] = kg/1.16;
    });
  });
  return seed;
}

function fixLegacyWeights(basePlan, weightUnitFixed){
  if(weightUnitFixed || !basePlan) return true;
  basePlan.forEach((day, di)=>{
    const table = LEGACY_LB[di];
    if(!day || !day.exercises || !table) return;
    day.exercises.forEach(ex=>{
      const lb = table[ex.name];
      if(!lb) return;
      if(Math.abs(Number(ex.weight)-lb)<0.001) ex.weight = lb/2.2046;
    });
  });
  return true;
}

/* Running. Easy-first: most minutes stay conversational. One quality session
   only for people already running, and it sits the day after upper-body work,
   before the heavy squat day. Pain or a hard effort trims the week. */
function planRuns(running){
  const level = running && (running.level==='new' || running.level==='experienced') ? running.level : 'consistent';
  const days = running && running.daysPerWeek===3 ? 3 : 2;
  const logs = ((running && running.logs) || []).slice().sort((a,b)=>(a.at||0)-(b.at||0));
  const recent = logs.slice(-6);
  const pain = recent.some(l=>l && l.pain);
  const finished = recent.filter(l=>l && l.minutes>0 && !l.pain);
  const last3 = finished.slice(-3);
  const avg = last3.length ? last3.reduce((s,l)=>s+Number(l.minutes),0)/last3.length : 0;
  const high = last3.length>0 && last3.some(l=>Number(l.rpe)>=8);
  const caps = { new:40, consistent:55, experienced:80 };
  const floors = { new:15, consistent:20, experienced:25 };
  const seeds = { new:20, consistent:32, experienced:42 };
  let easy = avg || seeds[level];
  let note;
  if(pain){
    const minutes = Math.max(10, Math.min(15, Math.round(easy)));
    note = 'A recent run was marked painful, so this week is short and easy only. Skip the quality session until nothing hurts.';
    return { note, pain:true, level, days, sessions:fillRuns(days, 'easy', minutes, level) };
  }
  if(last3.length>=2 && !high){
    const bump = level==='new' ? 5 : Math.max(3, Math.round(easy*0.08));
    easy += bump;
    note = level==='new'
      ? 'You finished recent runs at a moderate effort, so this week adds about 5 minutes.'
      : 'Recent runs were completed without a high effort, so easy time moves up a little, under 10%.';
  }else if(high){
    easy = Math.round(easy*0.9);
    note = 'A recent run was an 8 or harder. This week trims a little time and keeps the effort easy.';
  }else if(level==='new'){
    note = 'Easy run-walks. Keep it slow enough to speak in full sentences. Add time only after a week you actually finish.';
  }else{
    note = 'Starting week. Log the minutes and the effort, and the next week follows what you did.';
  }
  easy = clamp(Math.round(easy), floors[level], caps[level]);
  const first = level==='new' ? 'easy' : 'quality';
  if(level!=='new' && !pain){
    note += first==='quality' ? ' The quicker session is the day after upper-body lifting, before the heavy squat.' : '';
  }
  return { note, pain:false, level, days, sessions:fillRuns(days, first, easy, level) };
}

function fillRuns(days, firstKind, easy, level){
  const sessions = [
    firstKind==='quality' ? qualitySession(easy, level) : easySession(1, easy, 'Easy run'),
    easySession(4, easy, 'Easy run')
  ];
  if(days>=3){
    const cap = level==='experienced' ? 100 : 65;
    sessions.push(easySession(6, clamp(Math.round(easy*1.25), easy, cap), 'Optional longer easy'));
  }
  return sessions;
}

function easySession(dayIdx, minutes, title){
  return {
    dayIdx, kind:'easy', minutes, title,
    detail:minutes+' min easy, slow enough for full sentences. Walk breaks count. Use a treadmill if the weather is bad.'
  };
}

function qualitySession(easy, level){
  if(level==='experienced' && easy>=35){
    const hard = Math.max(8, Math.round(easy*0.35));
    return {
      dayIdx:1, kind:'quality', minutes:easy, title:'Tempo',
      detail:'10 min easy, then '+hard+' min comfortably hard (a few words, not a sentence), then easy to the end. Stop if the legs feel heavy from lifting.'
    };
  }
  const minutes = clamp(easy, 20, 35);
  return {
    dayIdx:1, kind:'quality', minutes, title:'Strides',
    detail:'Easy jog for most of it, with 6 × 20 seconds a little quicker and a full minute of walking between. Stay well short of a sprint.'
  };
}

function runSignature(running){
  const logs = (running && running.logs) || [];
  const tail = logs.slice(-3).map(l=>[l.minutes, l.rpe, l.pain?1:0, l.km||0].join(':')).join('|');
  return [(running&&running.level)||'', (running&&running.daysPerWeek)||'', logs.length, tail].join('/');
}

function clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)); }

function isTrainingDay(type){ return type==='lift' || type==='run'; }

this.LIBRARY = LIBRARY;
this.WEEK_SCHEME = WEEK_SCHEME;
this.BLOCKS = BLOCKS;
