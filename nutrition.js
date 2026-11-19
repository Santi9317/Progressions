/* Weekly meals and the shopping list.
   A week is either written by the model or taken from the built-in kitchen.
   Amounts are what you buy at a US grocery store, not metric lab units. */

const NUTRITION = {
  training:{cal:2400,protein:185,carbs:240,fat:70},
  rest:{cal:2100,protein:175,carbs:200,fat:70},
  meals:{ breakfast:[], lunch:[], dinner:[] }
};

function ing(item, qty, unit, aisle, staple){
  return { item, qty, unit, aisle, staple:!!staple };
}
function dish(name, minutes, cost, description, ingredients, steps){
  return {
    name, minutes, cost, description, detail:description,
    timing:'',
    recipe:{ ingredients, steps }
  };
}

NUTRITION.meals.breakfast = [
  dish('Eggs and oats', 12, 2.5, 'Scrambled eggs, a bowl of oats, and a banana. High protein, one pan, and cheap enough to shop for every week.', [
    ing('Eggs', 3, 'large', 'Dairy'), ing('Rolled oats', 0.5, 'cup', 'Pantry'), ing('Banana', 1, 'each', 'Produce')
  ], ['Cook the oats with water until thick, about 3 minutes.', 'Scramble the eggs in a nonstick pan over medium heat.', 'Slice the banana and eat it with the eggs and oats.']),
  dish('Yogurt berry cup', 5, 2.25, 'Thick yogurt with frozen berries, a little granola, and honey. No cooking, and it keeps you full until lunch.', [
    ing('Plain Greek yogurt', 0.75, 'cup', 'Dairy'), ing('Frozen mixed berries', 0.5, 'cup', 'Frozen'), ing('Granola', 0.25, 'cup', 'Pantry'), ing('Honey', 1, 'tsp', 'Pantry', true)
  ], ['Spoon the yogurt into a bowl.', 'Top with berries and granola.', 'Drizzle the honey and eat it cold.']),
  dish('Turkey egg wrap', 10, 3, 'Eggs and deli turkey rolled in a tortilla with salsa. Fast protein when the morning is short.', [
    ing('Eggs', 3, 'large', 'Dairy'), ing('Deli turkey', 2, 'oz', 'Protein'), ing('Flour tortilla', 1, 'each', 'Bakery'), ing('Salsa', 2, 'tbsp', 'Pantry')
  ], ['Scramble the eggs.', 'Warm the tortilla and layer the turkey and eggs.', 'Add salsa, roll it tight, and eat.']),
  dish('Cottage cheese toast', 8, 2.5, 'Toast piled with cottage cheese and tomato. Salty, high in protein, and done in the time the bread takes.', [
    ing('Low-fat cottage cheese', 0.75, 'cup', 'Dairy'), ing('Whole wheat bread', 2, 'slice', 'Bakery'), ing('Tomato', 1, 'each', 'Produce'), ing('Black pepper', 0.5, 'tsp', 'Pantry', true)
  ], ['Toast the bread.', 'Spoon on the cottage cheese and add tomato slices.', 'Pepper it and serve.']),
  dish('Peanut banana oats', 8, 1.75, 'Oats stirred with peanut butter, banana, and milk. A cheap bowl that still has some protein.', [
    ing('Rolled oats', 0.5, 'cup', 'Pantry'), ing('Banana', 1, 'each', 'Produce'), ing('Peanut butter', 1, 'tbsp', 'Pantry'), ing('Milk', 1, 'cup', 'Dairy')
  ], ['Cook the oats in the milk.', 'Stir in the peanut butter.', 'Slice the banana on top.']),
  dish('Spinach egg scramble', 12, 2.75, 'Eggs scrambled with a pile of spinach and a little cheddar, plus toast. A green breakfast that still feels like breakfast.', [
    ing('Eggs', 3, 'large', 'Dairy'), ing('Baby spinach', 2, 'cup', 'Produce'), ing('Shredded cheddar', 1, 'oz', 'Dairy'), ing('Whole wheat bread', 1, 'slice', 'Bakery')
  ], ['Wilt the spinach in a pan with a splash of water.', 'Add the eggs and cheddar and scramble until just set.', 'Toast the bread and serve it on the side.']),
  dish('Black bean breakfast taco', 12, 2.5, 'Eggs and black beans in a tortilla with salsa. Uses half a can, so the rest waits for another meal.', [
    ing('Black beans (15 oz)', 0.5, 'can', 'Pantry'), ing('Eggs', 2, 'large', 'Dairy'), ing('Flour tortilla', 1, 'each', 'Bakery'), ing('Salsa', 2, 'tbsp', 'Pantry'), ing('Avocado', 0.25, 'each', 'Produce')
  ], ['Warm the beans with the salsa.', 'Scramble the eggs.', 'Fill the tortilla with beans, eggs, and avocado.']),
  dish('Apple peanut toast', 7, 2.25, 'Peanut butter toast, an apple, and a side of yogurt. No pan, and the pieces are all sold in a normal grocery aisle.', [
    ing('Whole wheat bread', 2, 'slice', 'Bakery'), ing('Peanut butter', 2, 'tbsp', 'Pantry'), ing('Apple', 1, 'each', 'Produce'), ing('Plain Greek yogurt', 0.75, 'cup', 'Dairy')
  ], ['Toast the bread and spread the peanut butter.', 'Eat it with the apple and the yogurt.'])
];

NUTRITION.meals.lunch = [
  dish('Chicken rice bowl', 25, 3.5, 'Pan-seared chicken thigh over rice with broccoli. The rice is measured dry, the way the bag is sold.', [
    ing('Chicken thighs', 0.4, 'lb', 'Protein'), ing('Long grain white rice', 0.33, 'cup', 'Pantry'), ing('Broccoli', 0.5, 'lb', 'Produce'), ing('Soy sauce', 1, 'tbsp', 'Pantry', true), ing('Sesame oil', 1, 'tsp', 'Pantry', true)
  ], ['Simmer the rice in water until tender, about 15 minutes.', 'Sear the chicken in a covered pan until cooked through, 6 to 7 minutes a side.', 'Steam or roast the broccoli and drizzle soy sauce and sesame oil over the bowl.']),
  dish('Turkey taco bowl', 20, 3.5, 'Seasoned ground turkey with rice, black beans, salsa, and a spoon of sour cream. One skillet and a pot of rice.', [
    ing('Ground turkey', 0.4, 'lb', 'Protein'), ing('Long grain white rice', 0.33, 'cup', 'Pantry'), ing('Black beans (15 oz)', 0.5, 'can', 'Pantry'), ing('Salsa', 0.25, 'cup', 'Pantry'), ing('Sour cream', 2, 'tbsp', 'Dairy'), ing('Chili powder', 1, 'tsp', 'Pantry', true)
  ], ['Cook the rice.', 'Brown the turkey with the chili powder.', 'Add the beans and salsa, then serve over rice with sour cream.']),
  dish('Tuna avocado wrap', 10, 3.25, 'Canned tuna mashed with avocado and lemon, rolled with greens. No cooking, and the tuna is the cheap shelf-stable kind.', [
    ing('Chunk light tuna (5 oz)', 1, 'can', 'Protein'), ing('Avocado', 0.5, 'each', 'Produce'), ing('Lemon', 0.5, 'each', 'Produce'), ing('Flour tortilla', 1, 'each', 'Bakery'), ing('Mixed greens', 1, 'cup', 'Produce')
  ], ['Drain the tuna and mix it with the avocado and lemon.', 'Lay the greens on the tortilla, add the tuna, and roll.']),
  dish('Chickpea salad', 10, 2.75, 'A cold chopped salad of chickpeas, cucumber, and tomato. It packs well and the only bottle you need is already in most kitchens.', [
    ing('Chickpeas (15 oz)', 1, 'can', 'Pantry'), ing('Cucumber', 1, 'each', 'Produce'), ing('Tomato', 1, 'each', 'Produce'), ing('Red onion', 0.25, 'each', 'Produce'), ing('Olive oil', 1, 'tbsp', 'Pantry', true), ing('Lemon', 0.5, 'each', 'Produce')
  ], ['Rinse the chickpeas.', 'Chop the cucumber, tomato, and onion.', 'Toss with olive oil and lemon.']),
  dish('Egg fried rice', 15, 2, 'Day-of fried rice from dry rice, eggs, and a bag of frozen vegetables. Cheaper than takeout and done in one pan after the rice cooks.', [
    ing('Long grain white rice', 0.33, 'cup', 'Pantry'), ing('Eggs', 2, 'large', 'Dairy'), ing('Frozen mixed vegetables', 1, 'cup', 'Frozen'), ing('Soy sauce', 1, 'tbsp', 'Pantry', true), ing('Sesame oil', 1, 'tsp', 'Pantry', true)
  ], ['Cook the rice and let it sit a minute.', 'Scramble the eggs in a hot pan, then add the vegetables and rice.', 'Season with soy sauce and sesame oil.']),
  dish('Lentil toast', 12, 2.25, 'Warm lentils on toast with spinach and lemon. A can of lentils is the whole protein, so there is nothing to brown.', [
    ing('Lentils (15 oz)', 1, 'can', 'Pantry'), ing('Whole wheat bread', 2, 'slice', 'Bakery'), ing('Baby spinach', 1, 'cup', 'Produce'), ing('Lemon', 0.5, 'each', 'Produce')
  ], ['Heat the lentils with the spinach until the leaves wilt.', 'Toast the bread and spoon the lentils on top.', 'Finish with lemon.']),
  dish('Turkey bean chili', 25, 3, 'A small pot of turkey, beans, and tomatoes, with toast on the side. It tastes like chili without a long ingredient list.', [
    ing('Ground turkey', 0.35, 'lb', 'Protein'), ing('Black beans (15 oz)', 0.5, 'can', 'Pantry'), ing('Diced tomatoes (15 oz)', 0.5, 'can', 'Pantry'), ing('Chili powder', 1, 'tsp', 'Pantry', true), ing('Whole wheat bread', 1, 'slice', 'Bakery')
  ], ['Brown the turkey with the chili powder.', 'Add the beans and tomatoes and simmer 10 minutes.', 'Toast the bread and serve it beside the chili.']),
  dish('Chicken salad sandwich', 10, 3, 'Canned chicken mixed with yogurt on bread and greens. A deli sandwich without the deli price.', [
    ing('Canned chicken (12.5 oz)', 0.5, 'can', 'Protein'), ing('Plain Greek yogurt', 1, 'tbsp', 'Dairy'), ing('Whole wheat bread', 2, 'slice', 'Bakery'), ing('Mixed greens', 1, 'cup', 'Produce')
  ], ['Stir the chicken with the yogurt.', 'Pile it on bread with the greens.'])
];

NUTRITION.meals.dinner = [
  dish('Salmon and sweet potato', 20, 6.5, 'Pan-seared salmon, a microwaved sweet potato, and green beans. The pricier plate of the week, still one grocery fillet.', [
    ing('Salmon fillet', 0.4, 'lb', 'Protein'), ing('Sweet potato', 1, 'medium', 'Produce'), ing('Green beans', 0.5, 'lb', 'Produce')
  ], ['Pierce the sweet potato and microwave until soft, about 5 minutes.', 'Sear the salmon skin-side down, then flip, about 8 minutes total.', 'Steam the green beans and plate them together.']),
  dish('Sirloin stir fry', 20, 5, 'Thin sirloin with peppers and onion over rice. A cheaper steak cut, sliced so a little meat goes across the plate.', [
    ing('Sirloin steak', 0.4, 'lb', 'Protein'), ing('Bell pepper', 1, 'each', 'Produce'), ing('Onion', 0.5, 'each', 'Produce'), ing('Soy sauce', 1, 'tbsp', 'Pantry', true), ing('Long grain white rice', 0.33, 'cup', 'Pantry')
  ], ['Cook the rice.', 'Slice the steak thin and stir-fry it with the pepper and onion.', 'Add soy sauce and serve over the rice.']),
  dish('Shrimp pasta', 20, 5, 'Shrimp tossed with garlic, butter, whole wheat pasta, and tomatoes. A bag of frozen shrimp is enough for this and another night.', [
    ing('Shrimp', 0.4, 'lb', 'Protein'), ing('Whole wheat pasta', 2, 'oz', 'Pantry'), ing('Garlic', 2, 'clove', 'Produce'), ing('Butter', 1, 'tbsp', 'Dairy'), ing('Cherry tomatoes', 1, 'cup', 'Produce')
  ], ['Boil the pasta.', 'Melt the butter, soften the garlic, and cook the shrimp with the tomatoes until the shrimp are pink.', 'Toss with the pasta.']),
  dish('Sheet pan chicken', 30, 3.5, 'Chicken thighs, broccoli, and red onion on one pan at 425°F. Almost no cleanup, and thighs stay moist.', [
    ing('Chicken thighs', 0.5, 'lb', 'Protein'), ing('Broccoli', 0.5, 'lb', 'Produce'), ing('Red onion', 0.5, 'each', 'Produce'), ing('Olive oil', 1, 'tbsp', 'Pantry', true)
  ], ['Heat the oven to 425°F.', 'Toss the chicken, broccoli, and onion with oil, salt, and pepper on a sheet pan.', 'Roast 25 minutes and rest a few minutes.']),
  dish('Tilapia and potatoes', 25, 4, 'Baked tilapia with potatoes and green beans. Tilapia is the inexpensive fish, and the rest is produce.', [
    ing('Tilapia fillets', 0.4, 'lb', 'Protein'), ing('Russet potatoes', 0.5, 'lb', 'Produce'), ing('Green beans', 0.5, 'lb', 'Produce'), ing('Lemon', 0.5, 'each', 'Produce')
  ], ['Heat the oven to 425°F.', 'Cut the potatoes and start them on a pan for 15 minutes.', 'Add the fish and green beans and bake until the fish flakes, about 10 minutes. Finish with lemon.']),
  dish('Bean burrito bowl', 15, 2.5, 'Rice, a whole can of black beans, salsa, cheddar, and greens. Meatless, filling, and built from the pantry.', [
    ing('Black beans (15 oz)', 1, 'can', 'Pantry'), ing('Long grain white rice', 0.33, 'cup', 'Pantry'), ing('Salsa', 0.5, 'cup', 'Pantry'), ing('Shredded cheddar', 0.25, 'cup', 'Dairy'), ing('Mixed greens', 1, 'cup', 'Produce')
  ], ['Cook the rice and heat the beans in the salsa.', 'Put the greens in a bowl and top with rice, beans, and cheddar.']),
  dish('Turkey meatballs and pasta', 25, 3.5, 'Small turkey meatballs simmered in canned tomatoes with pasta. The seasoning is a jar you buy once.', [
    ing('Ground turkey', 0.4, 'lb', 'Protein'), ing('Whole wheat pasta', 2, 'oz', 'Pantry'), ing('Diced tomatoes (15 oz)', 0.5, 'can', 'Pantry'), ing('Italian seasoning', 1, 'tsp', 'Pantry', true), ing('Olive oil', 1, 'tsp', 'Pantry', true)
  ], ['Roll the turkey into small balls and brown them in oil.', 'Add the tomatoes and seasoning and simmer 10 minutes.', 'Boil the pasta and toss it with the sauce.']),
  dish('Egg and zucchini skillet', 20, 3, 'Eggs cooked with zucchini, pepper, and chickpeas. A light dinner that still covers protein without buying meat.', [
    ing('Eggs', 3, 'large', 'Dairy'), ing('Zucchini', 0.5, 'lb', 'Produce'), ing('Bell pepper', 1, 'each', 'Produce'), ing('Chickpeas (15 oz)', 0.5, 'can', 'Pantry'), ing('Olive oil', 1, 'tsp', 'Pantry', true)
  ], ['Soften the zucchini and pepper in oil.', 'Add the chickpeas, then pour in the eggs and cook until set.'])
];

const MEAL_SLOTS = [{id:'breakfast',label:'Breakfast'},{id:'lunch',label:'Lunch'},{id:'dinner',label:'Dinner'}];
const AISLE_ORDER = ['Produce','Protein','Dairy','Bakery','Frozen','Pantry','Other'];
const US_UNIT_MAP = {
  lb:'lb', lbs:'lb', pound:'lb', pounds:'lb',
  oz:'oz', ounce:'oz', ounces:'oz',
  cup:'cup', cups:'cup',
  tbsp:'tbsp', tablespoon:'tbsp', tablespoons:'tbsp',
  tsp:'tsp', teaspoon:'tsp', teaspoons:'tsp',
  'fl oz':'fl oz', floz:'fl oz',
  large:'large', medium:'medium', small:'small',
  each:'each', count:'each', ct:'each',
  bunch:'bunch', bunches:'bunch',
  head:'head', heads:'head',
  clove:'clove', cloves:'clove',
  can:'can', cans:'can',
  package:'package', packages:'package', pkg:'package',
  bag:'bag', bags:'bag',
  slice:'slice', slices:'slice',
  stick:'stick', sticks:'stick',
  dozen:'dozen', pint:'pint', quart:'quart',
  jar:'jar', bottle:'bottle'
};
const STAPLE_CHOICES = ['olive oil','vegetable oil','salt','black pepper','soy sauce','sesame oil','vinegar','garlic powder','chili powder','cumin','paprika','italian seasoning','butter','cooking spray','honey'];

function normName(s){ return String(s||'').trim().toLowerCase().replace(/\s+/g,' '); }
function clampServings(n){
  const x = Math.round(Number(n)||1);
  if(!isFinite(x)) return 1;
  return Math.max(1, Math.min(4, x));
}
function cloneMeal(meal){ return JSON.parse(JSON.stringify(meal)); }

function canonicalUnit(unit){
  const raw = String(unit||'').trim().toLowerCase();
  if(US_UNIT_MAP[raw]) return US_UNIT_MAP[raw];
  return '';
}

/* Grams and milliliters become the unit a US shelf tag uses. */
function convertToUs(qty, unit){
  const n = Number(qty);
  if(!isFinite(n) || n<=0) return null;
  const u = String(unit||'').trim().toLowerCase();
  if(u==='g' || u==='gram' || u==='grams'){
    const oz = n/28.3495;
    if(oz>=16) return { qty:Math.round((oz/16)*100)/100, unit:'lb' };
    return { qty:Math.round(oz*100)/100, unit:'oz' };
  }
  if(u==='kg' || u==='kilogram' || u==='kilograms') return { qty:Math.round(n*2.2046*100)/100, unit:'lb' };
  if(u==='ml' || u==='milliliter' || u==='milliliters'){
    const floz = n/29.5735;
    if(floz>=4) return { qty:Math.round(floz*100)/100, unit:'fl oz' };
    if(floz>=0.4) return { qty:Math.round(floz*2*100)/100, unit:'tbsp' };
    return { qty:Math.round(floz*6*100)/100, unit:'tsp' };
  }
  if(u==='l' || u==='liter' || u==='litre' || u==='liters' || u==='litres'){
    return { qty:Math.round(n*33.814*100)/100, unit:'fl oz' };
  }
  const c = canonicalUnit(u);
  if(!c) return null;
  return { qty:Math.round(n*100)/100, unit:c };
}

function guessAisle(item, unit){
  const name = normName(item);
  if(unit==='can' || /frozen/.test(name)){
    if(/frozen/.test(name)) return 'Frozen';
  }
  if(/frozen/.test(name)) return 'Frozen';
  if(/bread|tortilla|bun|bagel|pita/.test(name)) return 'Bakery';
  if(/yogurt|milk|cheese|cheddar|cottage|butter|sour cream|egg/.test(name)) return 'Dairy';
  if(/chicken|turkey|beef|steak|sirloin|salmon|shrimp|tuna|tilapia|pork|sausage|fish/.test(name)) return 'Protein';
  if(/banana|berry|berries|broccoli|avocado|lemon|lime|green|spinach|potato|pepper|onion|tomato|garlic|apple|lettuce|carrot|cucumber|cilantro|cabbage|zucchini|mushroom|bean|salad/.test(name) && unit!=='can') return 'Produce';
  return 'Pantry';
}

function fmtQty(n){
  const x = Math.round(Number(n)*100)/100;
  if(!isFinite(x)) return '0';
  if(Math.abs(x-Math.round(x))<0.001) return String(Math.round(x));
  return String(x);
}
function fmtMoney(n){
  const x = Math.round(Number(n)*100)/100;
  if(!isFinite(x)) return '$0';
  return '$'+x.toFixed(2);
}
function groceryName(item, qty, unit){
  const name = String(item||'');
  if(unit==='each' && Number(qty)>1 && !/s$/i.test(name)) return name+'s';
  return name;
}
function fmtFrac(n){
  const x = Math.round(Number(n)*4)/4;
  const whole = Math.floor(x+1e-6);
  const frac = Math.round((x-whole)*4);
  const marks = ['', '¼', '½', '¾'];
  const mark = marks[frac]||'';
  if(whole && mark) return whole+mark;
  if(whole) return String(whole);
  return mark||'0';
}

function ensureMenu(){
  if(!state.menu || typeof state.menu!=='object') state.menu = {};
  if(!state.menu.choices) state.menu.choices = {};
  if(!state.menu.made) state.menu.made = {};
  if(!state.menu.bought) state.menu.bought = {};
  if(!state.menu.plans) state.menu.plans = {};
  if(!state.menu.history) state.menu.history = [];
  if(!state.menu.prefs) state.menu.prefs = {};
  const prefs = state.menu.prefs;
  if(!prefs.diet) prefs.diet = 'omnivore';
  if(typeof prefs.avoid!=='string') prefs.avoid = '';
  if(typeof prefs.likes!=='string') prefs.likes = '';
  if(typeof prefs.note!=='string') prefs.note = '';
  prefs.minutes = Math.max(10, Math.min(40, Math.round(Number(prefs.minutes)||25)));
  prefs.servings = clampServings(prefs.servings);
  if(!state.menu.staples) state.menu.staples = { 'olive oil':true, salt:true, 'black pepper':true };
  if(typeof state.menu.salt!=='number') state.menu.salt = 0;
  return state.menu;
}
function menuPrefs(){ return ensureMenu().prefs; }

function menuSig(week, now){
  const p = menuPrefs();
  const anchor = (typeof aiWeekId==='function') ? aiWeekId(now||new Date()) : '';
  return [anchor, week, state.menu.salt||0, p.diet, normName(p.avoid), normName(p.likes), p.minutes, p.servings, normName(p.note)].join('|');
}

function slotBias(slot){ return slot==='lunch' ? 3 : slot==='dinner' ? 6 : 0; }

function rotationKey(week, now){
  const anchor = (typeof aiWeekId==='function') ? aiWeekId(now||new Date()) : '0';
  let n = 0;
  for(let i=0;i<anchor.length;i++) n += anchor.charCodeAt(i);
  const salt = (state && state.menu && state.menu.salt) || 0;
  return n + salt*13 + Number(week)*3;
}

function fallbackMeal(week, dayIdx, slot, used){
  const list = NUTRITION.meals[slot] || NUTRITION.meals.breakfast;
  const start = Math.abs(rotationKey(week) + Number(dayIdx) + slotBias(slot)) % list.length;
  for(let i=0;i<list.length;i++){
    const meal = list[(start+i)%list.length];
    if(used && used.has(normName(meal.name))) continue;
    const copy = cloneMeal(meal);
    copy.timing = slot==='breakfast' ? 'Morning' : slot==='lunch' ? 'Midday' : 'Evening';
    return scaleMeal(copy, menuPrefs().servings);
  }
  const copy = cloneMeal(list[start]);
  copy.timing = slot==='breakfast' ? 'Morning' : slot==='lunch' ? 'Midday' : 'Evening';
  return scaleMeal(copy, menuPrefs().servings);
}

function scaleMeal(meal, servings){
  const s = clampServings(servings);
  if(s===1) return meal;
  meal.recipe.ingredients.forEach(item=>{ item.qty = Math.round(item.qty*s*100)/100; });
  meal.cost = Math.round((meal.cost||0)*s*100)/100;
  return meal;
}

function normalizeMeal(raw, servings){
  if(!raw || typeof raw!=='object') return null;
  const day = Number(raw.day);
  const slot = String(raw.slot||'');
  if(!['breakfast','lunch','dinner'].includes(slot)) return null;
  if(!isFinite(day) || day<0 || day>6) return null;
  const name = String(raw.name||'').replace(/\s+/g,' ').trim().slice(0, 80);
  const description = String(raw.description||raw.detail||'').replace(/\s+/g,' ').trim().slice(0, 400);
  if(name.length<3 || description.length<12) return null;
  let minutes = Math.round(Number(raw.minutes));
  if(!isFinite(minutes)) minutes = 20;
  if(minutes<5 || minutes>40) return null;
  let cost = Number(raw.cost);
  if(!isFinite(cost)) cost = 4;
  if(cost<0.5 || cost>9) return null;
  const src = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const ingredients = [];
  src.forEach(item=>{
    if(!item) return;
    const converted = convertToUs(item.qty, item.unit);
    if(!converted) return;
    let qty = converted.qty;
    let unit = converted.unit;
    const label = String(item.item||'').replace(/\s+/g,' ').trim().slice(0, 60);
    if(!label || qty<=0 || qty>30) return;
    if(unit==='dozen' && /egg/.test(normName(label))){ qty = Math.round(qty*12*100)/100; unit = 'large'; }
    const aisleOk = AISLE_ORDER.indexOf(item.aisle)>=0 && item.aisle!=='Other';
    ingredients.push({
      item:label,
      qty:Math.round(qty*clampServings(servings)*100)/100,
      unit,
      aisle: aisleOk ? item.aisle : guessAisle(label, unit),
      staple: !!item.staple
    });
  });
  if(ingredients.length<2 || ingredients.length>10) return null;
  const stepsSrc = Array.isArray(raw.steps) ? raw.steps : [];
  const steps = stepsSrc.map(s=>String(s||'').replace(/\s+/g,' ').trim()).filter(s=>s.length>2 && s.length<240).slice(0, 6);
  if(steps.length<2) return null;
  const meal = dish(name, minutes, Math.round(cost*clampServings(servings)*100)/100, description, ingredients, steps);
  meal.timing = slot==='breakfast' ? 'Morning' : slot==='lunch' ? 'Midday' : 'Evening';
  meal.day = day;
  meal.slot = slot;
  return meal;
}

function sanitizeMeals(json, week, servings){
  const accepted = {};
  const used = new Set();
  const incoming = json && Array.isArray(json.meals) ? json.meals : [];
  incoming.forEach(raw=>{
    const meal = normalizeMeal(raw, servings);
    if(!meal) return;
    const key = meal.day+':'+meal.slot;
    const id = normName(meal.name);
    if(accepted[key] || used.has(id)) return;
    accepted[key] = meal;
    used.add(id);
  });
  const meals = {};
  let filled = 0;
  for(let di=0; di<7; di++){
    MEAL_SLOTS.forEach(slot=>{
      const key = di+':'+slot.id;
      if(accepted[key]){
        const meal = accepted[key];
        delete meal.day;
        delete meal.slot;
        meals[key] = meal;
      }else{
        meals[key] = fallbackMeal(week, di, slot.id, used);
        used.add(normName(meals[key].name));
        filled++;
      }
    });
  }
  return {
    note:String(json && json.note || '').replace(/\s+/g,' ').trim().slice(0, 280),
    meals,
    accepted:21-filled
  };
}

function menuFromModel(json, week, servings){
  const clean = sanitizeMeals(json, week, servings);
  if(!clean || clean.accepted<14) return null;
  return clean;
}

function weekHasActivity(week){
  ensureMenu();
  const prefix = String(week)+':';
  const made = Object.keys(state.menu.made).some(k=>k.startsWith(prefix) && state.menu.made[k]);
  const bought = Object.keys(state.menu.bought).some(k=>k.startsWith(prefix) && state.menu.bought[k]);
  return made || bought;
}

function menuIsCurrent(plan, week, now){
  if(!plan || !plan.meals) return false;
  if(plan.sig!==menuSig(week, now)) return false;
  const keyed = !!(state.ai && String(state.ai.key||'').trim());
  if(keyed && plan.source!=='ai') return false;
  return true;
}

function installMenu(week, clean, source){
  ensureMenu();
  const key = String(week);
  const prev = state.menu.plans[key];
  const meals = {};
  for(let di=0; di<7; di++){
    MEAL_SLOTS.forEach(slot=>{
      const id = di+':'+slot.id;
      if(prev && prev.meals && prev.meals[id] && isMealMade(week, di, slot.id)) meals[id] = prev.meals[id];
      else meals[id] = clean.meals[id];
    });
  }
  state.menu.plans[key] = {
    source:source==='ai' ? 'ai' : 'builtin',
    note:clean.note||'',
    sig:menuSig(week),
    anchor:(typeof aiWeekId==='function') ? aiWeekId(new Date()) : '',
    at:Date.now(),
    meals
  };
}

function installBuiltinMenu(week){
  const used = new Set();
  const meals = {};
  for(let di=0; di<7; di++){
    MEAL_SLOTS.forEach(slot=>{
      const meal = fallbackMeal(week, di, slot.id, used);
      used.add(normName(meal.name));
      meals[di+':'+slot.id] = meal;
    });
  }
  const note = 'A built-in week of simple meals. It changes when the week changes, and a model menu replaces it when a key is saved.';
  installMenu(week, { note, meals, accepted:0 }, 'builtin');
}

function ensureWeekMenu(week){
  ensureMenu();
  if(!state.menu.plans[String(week)]) installBuiltinMenu(week);
  return state.menu.plans[String(week)];
}

function clearWeekProgress(week){
  ensureMenu();
  const prefix = String(week)+':';
  Object.keys(state.menu.made).forEach(k=>{ if(k.startsWith(prefix)) delete state.menu.made[k]; });
  Object.keys(state.menu.bought).forEach(k=>{ if(k.startsWith(prefix)) delete state.menu.bought[k]; });
}

function mealKey(week, dayIdx, slot){ return week+':'+dayIdx+':'+slot; }
function chosenMeal(week, dayIdx, slot){
  ensureMenu();
  const plan = state.menu.plans[String(week)];
  const meal = plan && plan.meals && plan.meals[dayIdx+':'+slot];
  if(meal) return meal;
  return fallbackMeal(week, dayIdx, slot);
}
function isMealMade(week, dayIdx, slot){ ensureMenu(); return !!state.menu.made[mealKey(week, dayIdx, slot)]; }
function setMealMade(week, dayIdx, slot, on){
  ensureMenu();
  const k = mealKey(week, dayIdx, slot);
  if(on){
    state.menu.made[k] = true;
    rememberUsed(week, dayIdx, slot);
  }else delete state.menu.made[k];
  save();
}
function rememberUsed(week, dayIdx, slot){
  const meal = chosenMeal(week, dayIdx, slot);
  const id = mealKey(week, dayIdx, slot)+':'+normName(meal.name);
  if(state.menu.history.some(row=>row.id===id)) return;
  state.menu.history.unshift({ id, at:Date.now(), week, dayIdx, slot, meal:cloneMeal(meal) });
  state.menu.history = state.menu.history.slice(0, 80);
}
function replaceSlotMeal(week, dayIdx, slot, meal){
  ensureWeekMenu(week);
  state.menu.plans[String(week)].meals[dayIdx+':'+slot] = cloneMeal(meal);
  save();
}
function buyKey(week, item, unit){ return week+':'+normName(item)+'|'+(unit||''); }
function weekMealStats(week){
  let made = 0;
  const total = 7*MEAL_SLOTS.length;
  for(let di=0; di<7; di++) MEAL_SLOTS.forEach(s=>{ if(isMealMade(week, di, s.id)) made++; });
  return { made, total, left:total-made };
}
function weekCost(week){
  let cost = 0;
  for(let di=0; di<7; di++) MEAL_SLOTS.forEach(s=>{ cost += Number(chosenMeal(week, di, s.id).cost)||0; });
  return Math.round(cost);
}
function mealChoices(week, dayIdx, slot){
  const current = chosenMeal(week, dayIdx, slot);
  const options = [{ value:'', name:current.name }];
  (NUTRITION.meals[slot]||[]).forEach((meal, i)=>{
    if(normName(meal.name)===normName(current.name)) return;
    options.push({ value:'lib:'+i, name:meal.name });
  });
  return options;
}
function mealOptions(week, dayIdx, slot){
  return mealChoices(week, dayIdx, slot).map(opt=>'<option value="'+opt.value+'"'+(opt.value===''?' selected':'')+'>'+esc(opt.name)+'</option>').join('');
}
function applyMealChoice(week, dayIdx, slot, value){
  if(!value || value.indexOf('lib:')!==0) return;
  const list = NUTRITION.meals[slot]||[];
  const meal = list[parseInt(value.slice(4), 10)];
  if(!meal) return;
  const copy = cloneMeal(meal);
  copy.timing = slot==='breakfast' ? 'Morning' : slot==='lunch' ? 'Midday' : 'Evening';
  replaceSlotMeal(week, dayIdx, slot, scaleMeal(copy, menuPrefs().servings));
}

function shopAmount(item, qty, unit){
  const name = normName(item);
  if((unit==='large' || unit==='each') && /egg/.test(name)){
    const dozens = Math.max(1, Math.ceil(qty/12));
    return { qty:dozens, unit:'dozen', label: dozens===1 ? '1 dozen' : dozens+' dozen' };
  }
  if(unit==='lb'){
    const lb = Math.ceil(qty*4)/4;
    return { qty:lb, unit:'lb', label:fmtFrac(lb)+' lb' };
  }
  if(unit==='oz'){
    if(qty>=14){
      const lb = Math.ceil((qty/16)*4)/4;
      return { qty:lb, unit:'lb', label:fmtFrac(lb)+' lb' };
    }
    const oz = Math.ceil(qty);
    return { qty:oz, unit:'oz', label:oz+' oz' };
  }
  if(unit==='cup'){
    if(/yogurt|cottage/.test(name)){
      const tubs = Math.max(1, Math.ceil((qty*8)/32));
      return { qty:tubs, unit:'tub', label:tubs+' (32 oz) tub'+(tubs>1?'s':'') };
    }
    if(/milk/.test(name) && !/buttermilk/.test(name)){
      if(qty<=1) return { qty:1, unit:'quart', label:'1 quart' };
      const half = Math.max(1, Math.ceil(qty/8));
      return { qty:half, unit:'half gallon', label:half===1 ? '1 half gallon' : half+' half gallons' };
    }
    if(/rice|oats|rolled oats/.test(name)){
      const cups = Math.ceil(qty*2)/2;
      const bag = Math.max(1, Math.ceil(cups*0.45*2)/2);
      return { qty:cups, unit:'cup', label:fmtFrac(cups)+' cup'+(cups>1?'s':''), hint:'about a '+fmtFrac(bag)+' lb bag' };
    }
    const cups = Math.ceil(qty*4)/4;
    return { qty:cups, unit:'cup', label:fmtFrac(cups)+' cup'+(cups>1?'s':'') };
  }
  if(unit==='can'){
    const n = Math.max(1, Math.ceil(qty));
    return { qty:n, unit:'can', label:n+' can'+(n>1?'s':'') };
  }
  if(unit==='tbsp' || unit==='tsp' || unit==='fl oz'){
    const n = Math.ceil(qty*2)/2;
    return { qty:n, unit, label:fmtFrac(n)+' '+unit };
  }
  const n = Math.max(1, Math.ceil(qty));
  if(unit==='each') return { qty:n, unit:'each', label:String(n) };
  const plural = n===1 ? unit : unit+'s';
  return { qty:n, unit, label:n+' '+plural };
}

function buildWeekShoppingList(week, onlyUnmade){
  ensureMenu();
  const agg = {};
  for(let di=0; di<7; di++){
    MEAL_SLOTS.forEach(slot=>{
      if(onlyUnmade && isMealMade(week, di, slot.id)) return;
      const meal = chosenMeal(week, di, slot.id);
      if(!meal || !meal.recipe) return;
      meal.recipe.ingredients.forEach(item=>{
        const key = normName(item.item)+'|'+(item.unit||'');
        if(!agg[key]) agg[key] = { item:item.item, unit:item.unit||'', qty:0, uses:[], aisle:item.aisle||guessAisle(item.item, item.unit), staple:!!item.staple };
        agg[key].qty += Number(item.qty)||0;
        if(item.staple) agg[key].staple = true;
        const dayName = (typeof DAY_NAMES!=='undefined' ? DAY_NAMES[di] : 'Day').slice(0,3);
        const label = dayName+' '+meal.name;
        if(agg[key].uses.indexOf(label)<0) agg[key].uses.push(label);
      });
    });
  }
  return Object.keys(agg).map(key=>{
    const row = agg[key];
    const shop = shopAmount(row.item, row.qty, row.unit);
    const stocked = !!state.menu.staples[normName(row.item)];
    return {
      item:row.item,
      unit:shop.unit,
      qty:shop.qty,
      label:shop.label,
      hint:shop.hint||'',
      uses:row.uses,
      aisle:AISLE_ORDER.indexOf(row.aisle)>=0 ? row.aisle : 'Other',
      staple:row.staple,
      stocked
    };
  }).sort((a,b)=>{
    const d = AISLE_ORDER.indexOf(a.aisle)-AISLE_ORDER.indexOf(b.aisle);
    return d || a.item.localeCompare(b.item);
  });
}
function usesLabel(uses){
  if(uses.length<=2) return uses.join(' · ');
  return uses.slice(0,2).join(' · ')+' · +'+(uses.length-2);
}
function shoppingListText(week){
  const items = buildWeekShoppingList(week, shopOnlyUnmade).filter(item=>!item.stocked && !state.menu.bought[buyKey(week, item.item, item.unit)]);
  if(!items.length) return '';
  const lines = ['Week '+week+' shopping list', ''];
  let aisle = '';
  items.forEach(item=>{
    if(item.aisle!==aisle){ aisle = item.aisle; lines.push(aisle); }
    lines.push('- '+item.label+' '+item.item+(item.hint?' ('+item.hint+')':''));
  });
  return lines.join('\n');
}
function clearShopChecks(week){
  ensureMenu();
  const prefix = String(week)+':';
  Object.keys(state.menu.bought).forEach(k=>{ if(k.startsWith(prefix)) delete state.menu.bought[k]; });
  save();
}

function recentMealNames(limit){
  ensureMenu();
  const names = [];
  Object.keys(state.menu.plans).forEach(key=>{
    const meals = state.menu.plans[key].meals||{};
    Object.keys(meals).forEach(id=>{ if(meals[id] && meals[id].name) names.push(meals[id].name); });
  });
  state.menu.history.forEach(row=>{ if(row.meal && row.meal.name) names.push(row.meal.name); });
  const seen = {};
  const unique = [];
  names.forEach(name=>{
    const id = normName(name);
    if(seen[id]) return;
    seen[id] = true;
    unique.push(name);
  });
  return unique.slice(0, limit||24);
}

function ingredientLines(meal){
  return (meal.recipe.ingredients||[]).map(item=>fmtQty(item.qty)+' '+item.unit+' '+item.item).join('\n');
}
function parseIngredientLines(text){
  const units = Object.keys(US_UNIT_MAP).sort((a,b)=>b.length-a.length);
  const items = [];
  String(text||'').split('\n').forEach(line=>{
    const trimmed = line.trim();
    if(!trimmed) return;
    const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
    if(!match) return;
    const rest = match[2];
    let unit = 'each';
    let name = rest;
    for(let i=0;i<units.length;i++){
      const u = units[i];
      const re = new RegExp('^'+u.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s+(.+)$','i');
      const hit = rest.match(re);
      if(hit){ unit = canonicalUnit(u); name = hit[1]; break; }
    }
    const converted = convertToUs(match[1], unit);
    if(!converted || !name.trim()) return;
    items.push({
      item:name.trim().slice(0, 60),
      qty:converted.qty,
      unit:converted.unit,
      aisle:guessAisle(name, converted.unit),
      staple:STAPLE_CHOICES.indexOf(normName(name))>=0
    });
  });
  return items;
}

function usedIngredientRollup(){
  ensureMenu();
  const agg = {};
  state.menu.history.forEach(row=>{
    if(!row.meal || !row.meal.recipe) return;
    row.meal.recipe.ingredients.forEach(item=>{
      const key = normName(item.item)+'|'+(item.unit||'');
      if(!agg[key]) agg[key] = { item:item.item, unit:item.unit||'', qty:0 };
      agg[key].qty += Number(item.qty)||0;
    });
  });
  return Object.keys(agg).map(k=>agg[k]).sort((a,b)=>b.qty-a.qty || a.item.localeCompare(b.item));
}
