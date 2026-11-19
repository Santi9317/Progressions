/* Meals and the shopping list. Recipes are the ones already in the app. */

const NUTRITION = {
  training:{cal:2400,protein:185,carbs:240,fat:70},
  rest:{cal:2100,protein:175,carbs:200,fat:70},
  meals:{
    breakfast:[
      {name:"Eggs & Oats",timing:"Within 1hr of waking",detail:"3 scrambled eggs + ½ cup oats + banana. ~500 cal, 35g protein. Fast and filling.",
        recipe:{ingredients:[{item:"Eggs",qty:3,unit:"large"},{item:"Rolled oats",qty:0.5,unit:"cup"},{item:"Banana",qty:1,unit:""}],
          steps:["Cook oats with water or milk per package directions.","Scramble eggs in a nonstick pan over medium heat.","Slice banana and serve alongside."]}},
      {name:"Greek Yogurt Bowl",timing:"Within 1hr of waking",detail:"1 cup full-fat Greek yogurt + berries + granola + honey. ~450 cal, 30g protein. 5 minutes.",
        recipe:{ingredients:[{item:"Full-fat Greek yogurt",qty:1,unit:"cup"},{item:"Mixed berries",qty:0.5,unit:"cup"},{item:"Granola",qty:0.25,unit:"cup"},{item:"Honey",qty:1,unit:"tbsp"}],
          steps:["Add yogurt to a bowl.","Top with berries and granola.","Drizzle honey over the top."]}},
      {name:"Turkey & Egg Wrap",timing:"Within 1hr of waking",detail:"3 eggs + 2oz turkey in a flour tortilla with salsa. ~500 cal, 40g protein.",
        recipe:{ingredients:[{item:"Eggs",qty:3,unit:"large"},{item:"Deli turkey",qty:2,unit:"oz"},{item:"Flour tortilla",qty:1,unit:""},{item:"Salsa",qty:2,unit:"tbsp"}],
          steps:["Scramble the eggs.","Warm the tortilla, layer turkey and scrambled eggs.","Top with salsa, fold and roll into a wrap."]}}
    ],
    lunch:[
      {name:"Chicken Rice Bowl",timing:"Midday",detail:"Pan-seared chicken thigh over white rice + roasted broccoli + soy-sesame drizzle. ~550 cal, 45g protein. Under $4.",
        recipe:{ingredients:[{item:"Chicken thighs",qty:6,unit:"oz"},{item:"White rice (cooked)",qty:1,unit:"cup"},{item:"Broccoli",qty:1,unit:"cup"},{item:"Soy sauce",qty:1,unit:"tbsp"},{item:"Sesame oil",qty:1,unit:"tsp"}],
          steps:["Pan-sear chicken thigh until cooked through, ~6-7 min per side.","Roast or steam broccoli.","Serve chicken and broccoli over rice, drizzle with soy sauce and sesame oil."]}},
      {name:"Ground Turkey Taco Bowl",timing:"Midday",detail:"Seasoned turkey over rice + black beans + salsa + sour cream. ~600 cal, 50g protein.",
        recipe:{ingredients:[{item:"Ground turkey",qty:6,unit:"oz"},{item:"White rice (cooked)",qty:1,unit:"cup"},{item:"Black beans",qty:0.5,unit:"cup"},{item:"Salsa",qty:2,unit:"tbsp"},{item:"Sour cream",qty:1,unit:"tbsp"}],
          steps:["Brown ground turkey in a pan with taco seasoning.","Warm black beans.","Build the bowl over rice with turkey, beans, salsa and sour cream."]}},
      {name:"Tuna Avocado Wrap",timing:"Midday",detail:"Canned tuna + avocado + lemon in a wrap with greens. ~450 cal, 40g protein. No cooking needed.",
        recipe:{ingredients:[{item:"Canned tuna",qty:5,unit:"oz"},{item:"Avocado",qty:0.5,unit:""},{item:"Lemon",qty:0.5,unit:""},{item:"Tortilla wrap",qty:1,unit:""},{item:"Mixed greens",qty:1,unit:"cup"}],
          steps:["Mix drained tuna with mashed avocado and a squeeze of lemon.","Lay greens on the wrap and add the tuna mixture.","Fold and roll tightly."]}}
    ],
    dinner:[
      {name:"Salmon & Sweet Potato",timing:"Evening",detail:"Pan-seared salmon + microwaved sweet potato + steamed green beans. ~600 cal, 45g protein. 20 min.",
        recipe:{ingredients:[{item:"Salmon fillet",qty:6,unit:"oz"},{item:"Sweet potato",qty:1,unit:"medium"},{item:"Green beans",qty:1,unit:"cup"}],
          steps:["Microwave or bake the sweet potato until soft.","Pan-sear salmon skin-side down until crisp, then flip to finish, ~8 min total.","Steam green beans and plate everything together."]}},
      {name:"Steak Stir Fry",timing:"Evening",detail:"Thin-sliced flank steak + bell peppers + onion + soy sauce over rice. ~550 cal, 45g protein. 20 min.",
        recipe:{ingredients:[{item:"Flank steak",qty:6,unit:"oz"},{item:"Bell pepper",qty:1,unit:""},{item:"Onion",qty:0.5,unit:""},{item:"Soy sauce",qty:1,unit:"tbsp"},{item:"White rice (cooked)",qty:1,unit:"cup"}],
          steps:["Slice steak thin against the grain.","Stir-fry steak, peppers and onion in a hot pan with soy sauce for a few minutes until cooked.","Serve over rice."]}},
      {name:"Shrimp & Pasta",timing:"Evening",detail:"Shrimp in garlic butter + whole wheat pasta + cherry tomatoes. ~550 cal, 40g protein. 20 min.",
        recipe:{ingredients:[{item:"Shrimp",qty:6,unit:"oz"},{item:"Whole wheat pasta",qty:2,unit:"oz"},{item:"Garlic",qty:2,unit:"cloves"},{item:"Butter",qty:1,unit:"tbsp"},{item:"Cherry tomatoes",qty:1,unit:"cup"}],
          steps:["Cook pasta according to package directions.","Sauté garlic in butter, add shrimp and cherry tomatoes until shrimp is pink.","Toss with the cooked pasta."]}},
      {name:"Sheet Pan Chicken Thighs",timing:"Evening",detail:"Chicken thighs + broccoli + red onion, 425°F for 25 min. ~500 cal, 45g protein. Near zero cleanup.",
        recipe:{ingredients:[{item:"Chicken thighs",qty:18,unit:"oz"},{item:"Broccoli",qty:1,unit:"cup"},{item:"Red onion",qty:0.5,unit:""}],
          steps:["Toss chicken thighs, broccoli and red onion with oil, salt and pepper on a sheet pan.","Roast at 425°F for 25 minutes.","Let rest a few minutes before serving."]}}
    ]
  }
};
const MEAL_SLOTS=[{id:'breakfast',label:'Breakfast'},{id:'lunch',label:'Lunch'},{id:'dinner',label:'Dinner'}];
const AISLE_OF={
  'Eggs':'Protein','Deli turkey':'Protein','Chicken thighs':'Protein','Ground turkey':'Protein','Canned tuna':'Protein','Salmon fillet':'Protein','Flank steak':'Protein','Shrimp':'Protein',
  'Full-fat Greek yogurt':'Dairy','Sour cream':'Dairy','Butter':'Dairy',
  'Banana':'Produce','Mixed berries':'Produce','Broccoli':'Produce','Avocado':'Produce','Lemon':'Produce','Mixed greens':'Produce','Sweet potato':'Produce','Green beans':'Produce','Bell pepper':'Produce','Onion':'Produce','Cherry tomatoes':'Produce','Garlic':'Produce','Red onion':'Produce',
  'Rolled oats':'Pantry','Granola':'Pantry','Honey':'Pantry','Flour tortilla':'Pantry','Salsa':'Pantry','White rice (cooked)':'Pantry','Soy sauce':'Pantry','Sesame oil':'Pantry','Black beans':'Pantry','Tortilla wrap':'Pantry','Whole wheat pasta':'Pantry'
};
const AISLE_ORDER=['Produce','Protein','Dairy','Pantry','Other'];

function fmtQty(n){
  const x=Math.round(Number(n)*100)/100;
  if(!isFinite(x))return'0';
  if(Math.abs(x-Math.round(x))<0.001)return String(Math.round(x));
  return String(x);
}
function ensureMenu(){
  if(!state.menu||typeof state.menu!=='object')state.menu={};
  if(!state.menu.choices)state.menu.choices={};
  if(!state.menu.made)state.menu.made={};
  if(!state.menu.bought)state.menu.bought={};
}
function defaultMealIndex(dayIdx,slot){
  const list=NUTRITION.meals[slot];
  return dayIdx%list.length;
}
function mealKey(week,dayIdx,slot){return week+':'+dayIdx+':'+slot;}
function mealIndex(week,dayIdx,slot){
  ensureMenu();
  const list=NUTRITION.meals[slot];
  const stored=state.menu.choices[mealKey(week,dayIdx,slot)];
  if(typeof stored==='number'&&stored>=0&&stored<list.length)return stored;
  return defaultMealIndex(dayIdx,slot);
}
function chosenMeal(week,dayIdx,slot){return NUTRITION.meals[slot][mealIndex(week,dayIdx,slot)];}
function isMealMade(week,dayIdx,slot){ensureMenu();return !!state.menu.made[mealKey(week,dayIdx,slot)];}
function setMealMade(week,dayIdx,slot,on){
  ensureMenu();
  const k=mealKey(week,dayIdx,slot);
  if(on)state.menu.made[k]=true;else delete state.menu.made[k];
  save();
}
function setMealChoice(week,dayIdx,slot,idx){
  ensureMenu();
  const n=parseInt(idx,10);
  const k=mealKey(week,dayIdx,slot);
  if(n===defaultMealIndex(dayIdx,slot))delete state.menu.choices[k];
  else state.menu.choices[k]=n;
  save();
}
function buyKey(week,item,unit){return week+':'+item+'|'+(unit||'');}
function weekMealStats(week){
  let made=0;
  const total=7*MEAL_SLOTS.length;
  for(let di=0;di<7;di++) MEAL_SLOTS.forEach(s=>{if(isMealMade(week,di,s.id))made++;});
  return {made,total,left:total-made};
}
function mealOptions(slot,selected){
  return NUTRITION.meals[slot].map((m,i)=>'<option value="'+i+'"'+(i===selected?' selected':'')+'>'+esc(m.name)+'</option>').join('');
}
function buildWeekShoppingList(week,onlyUnmade){
  const agg={};
  for(let di=0;di<7;di++){
    MEAL_SLOTS.forEach(slot=>{
      if(onlyUnmade&&isMealMade(week,di,slot.id))return;
      const meal=chosenMeal(week,di,slot.id);
      if(!meal||!meal.recipe)return;
      meal.recipe.ingredients.forEach(ing=>{
        const key=ing.item+'|'+(ing.unit||'');
        if(!agg[key])agg[key]={item:ing.item,unit:ing.unit||'',qty:0,uses:[]};
        agg[key].qty+=ing.qty;
        const label=DAY_NAMES[di].slice(0,3)+' '+meal.name;
        if(!agg[key].uses.includes(label))agg[key].uses.push(label);
      });
    });
  }
  return Object.keys(agg).map(k=>agg[k]).map(row=>({...row,aisle:AISLE_OF[row.item]||'Other'})).sort((a,b)=>{
    const d=AISLE_ORDER.indexOf(a.aisle)-AISLE_ORDER.indexOf(b.aisle);
    return d||a.item.localeCompare(b.item);
  });
}
function usesLabel(uses){
  if(uses.length<=2)return uses.join(' · ');
  return uses.slice(0,2).join(' · ')+' · +'+(uses.length-2);
}
function shoppingListText(week){
  const items=buildWeekShoppingList(week,shopOnlyUnmade).filter(item=>!state.menu.bought[buyKey(week,item.item,item.unit)]);
  if(!items.length)return '';
  const lines=['Week '+week+' shopping list',''];
  let aisle='';
  items.forEach(item=>{
    if(item.aisle!==aisle){aisle=item.aisle;lines.push(aisle);}
    lines.push('- '+fmtQty(item.qty)+(item.unit?' '+item.unit:'')+' '+item.item);
  });
  return lines.join('\n');
}
function clearShopChecks(week){
  ensureMenu();
  Object.keys(state.menu.bought).forEach(k=>{if(k.startsWith(week+':'))delete state.menu.bought[k];});
  save();
}
