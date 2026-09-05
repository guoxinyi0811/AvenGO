import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Execute the actual app script with an in-memory DOM/storage double. No user data or network.
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(), storage=new Map();
function element(){return {value:"",innerHTML:"",textContent:"",hidden:false,dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getAttribute(){return null;},querySelectorAll(){return [];},querySelector(){return element();},appendChild(){},remove(){},click(){}};}
const context=vm.createContext({console,Date,Intl,URL,Blob,AbortController,TextEncoder,
  document:{querySelector(key){if(!nodes.has(key))nodes.set(key,element());return nodes.get(key);},querySelectorAll(){return [];},createElement:element,body:element(),addEventListener(){}},
  window:{addEventListener(){}}, navigator:{}, location:{reload(){}}, localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){},clearTimeout(){},FileReader:class {},crypto:{randomUUID:()=>"test-client"}
});
vm.runInContext(source,context);
const run=code=>vm.runInContext(code,context);
const plain=code=>JSON.parse(JSON.stringify(run(code)));
const fresh=()=>run(`for(const key of Object.keys(log))delete log[key]; for(const key of Object.keys(today))delete today[key]; Object.assign(today,{templateId:"fullA",doneExercises:[],actuals:{},exerciseChoices:{},state:"green",strength:true}); templateId="fullA";state="green";`);

assert.equal(new Set(plain("Object.values(EXERCISE_IDS)")).size,plain("Object.keys(EXERCISE_IDS)").length);
assert.equal(run("GYM_MOVEMENTS.length"),9);
assert.ok(run('EXERCISE_BY_ID.machine_chest_press.nm !== EXERCISE_BY_ID.machine_incline_press.nm'));
assert.ok(!/machine_chest_or_incline_press|cable_leg_curl|barbell_/.test(run("JSON.stringify(EXERCISE_IDS)")));

fresh();
const gymPairs=plain("GYM_MOVEMENTS");
for(const [id,name,base] of gymPairs){
  run(`log['2026-01-01']={actuals:{[${JSON.stringify(base)}]:{weight:99,sets:7,reps:[3,2],rir:1,customField:'keep'}}};`);
  assert.equal(run(`lastActual(${JSON.stringify(name)})`),null,`${id}: must not read Home history`);
  const expected=plain(`defaultActual(${JSON.stringify(name)},LIBRARY_ITEMS[${JSON.stringify(name)}].plan)`);
  assert.equal(expected.weight,null);
  assert.notEqual(expected.sets,7);
  run(`writeExerciseActual(log['2026-01-01'],${JSON.stringify(name)},{weight:45,sets:2,reps:[10,9],rir:3});`);
  assert.equal(run(`lastActual(${JSON.stringify(name)}).weight`),45);
  assert.equal(run(`lastActual(${JSON.stringify(base)}).weight`),99);
  assert.equal(run(`movementMeta(${JSON.stringify(base)}).pattern === movementMeta(${JSON.stringify(name)}).pattern`),true);
  run(`delete log['2026-01-01'];`);
}
run(`log['2026-01-02']={actuals:{machine_chest_press:{weight:45,sets:3,reps:10,rir:2},machine_incline_press:{weight:30,sets:2,reps:8,rir:1},"上斜俯卧撑(扶桌沿)":{sets:2,reps:9,rir:3}}};`);
assert.equal(run('lastActual("Chest Press（器械）").weight'),45);
assert.equal(run('lastActual("Incline Press（器械）").weight'),30);
assert.equal(run('lastActual("上斜俯卧撑(扶桌沿)").reps'),9);

fresh();
run('templateId="lowerHinge";today.templateId=templateId;');
let names=plain('planItems(currentPlan()).filter(item=>!item.inactive&&item.plan).map(item=>item.nm)');
assert.ok(names.includes("哑铃罗马尼亚硬拉"));
assert.ok(names.includes("B-stance RDL"));
assert.ok(!names.includes("单腿 RDL"));
run('setExerciseChoice(today,templateId,"b_stance_rdl","single_leg_rdl");');
names=plain('planItems(currentPlan()).filter(item=>!item.inactive&&item.plan).map(item=>item.nm)');
assert.ok(names.includes("哑铃罗马尼亚硬拉")&&names.includes("单腿 RDL")&&!names.includes("B-stance RDL"));
assert.equal(run('planItems(currentPlan()).find(item=>item.nm==="单腿 RDL").dose.g'),"各 2 组 × 6–8");
run('templateId="pull";today.templateId=templateId;');
assert.equal(run('planItems(currentPlan()).find(item=>item.nm==="拉力带坐姿划船").inactive'),true);
run('setExerciseChoice(today,templateId,"band_seated_row","band_seated_row");');
assert.equal(run('planItems(currentPlan()).find(item=>item.nm==="拉力带坐姿划船").inactive'),false);

fresh();
run('today.doneExercises=["高脚杯深蹲"]; writeExerciseActual(today,"高脚杯深蹲",{weight:13,sets:3,reps:12,rir:2});setExerciseChoice(today,"fullA","goblet_squat","machine_leg_press");');
assert.equal(run('readExerciseActual(today,"Leg Press（器械）")'),null);
assert.equal(run('readExerciseActual(today,"高脚杯深蹲").weight'),13);
assert.deepEqual(plain('completedNames(today)'),["高脚杯深蹲"]);
run('writeExerciseActual(today,"Leg Press（器械）",{weight:60,sets:2,reps:10,rir:3});setExerciseChoice(today,"fullA","goblet_squat","goblet_squat");');
assert.equal(run('readExerciseActual(today,"高脚杯深蹲").weight'),13);
assert.equal(run('readExerciseActual(today,"Leg Press（器械）").weight'),60);

fresh();
run(`Object.assign(log,{
 '2026-02-10':{templateId:'push',completed:false,strength:true,doneExercises:['哑铃罗马尼亚硬拉']},
 '2026-02-11':{templateId:'lowerSquat',completed:true,strength:true,doneExercises:['高脚杯深蹲','臀桥 / 单腿臀桥']},
 '2026-02-12':{templateId:'push',completed:true,strength:true,doneExercises:['上斜俯卧撑(扶桌沿)']},
 '2026-02-14':{templateId:'pull',completed:true,strength:true,doneExercises:['单臂哑铃划船']}
});`);
assert.deepEqual(plain('Object.fromEntries(Object.entries(patternLedger("2026-02-15")).map(([p,v])=>[p,v.days]))'),{squat:4,hinge:5,push:3,pull:1});
for(const [id,name,base] of gymPairs){
  assert.deepEqual(plain(`patternsForEntry({templateId:"fullA",doneExercises:[${JSON.stringify(name)}],strength:true})`),plain(`patternsForEntry({templateId:"fullA",doneExercises:[${JSON.stringify(base)}],strength:true})`));
}
assert.deepEqual(plain('patternsForEntry({templateId:"fullA",doneExercises:[],completed:true})'),[]);
assert.deepEqual(plain('completedNames({day:"A",doneA:["高脚杯深蹲"],doneB:[]})'),["高脚杯深蹲"]);

fresh();
run('templateId="accessory";today.templateId=templateId;renderPlan();renderCheckin();');
assert.equal(run('TEMPLATES.accessory.title'),"Accessory");
assert.equal(run('TEMPLATES.accessory.short'),"Accessory");
assert.equal(run('new Set(planItems(TEMPLATES.accessory).map(item=>item.nm)).size'),21);
for(const name of ["伟大伸展 / 猫式伸展","泡沫轴推墙上回旋(前锯)","死虫式(屈膝点地)","侧平板","毛巾滑动腿弯举"]){
  assert.ok(run(`planItems(TEMPLATES.accessory).some(item=>item.nm===${JSON.stringify(name)})`),`${name}: expected in Accessory`);
}
assert.ok(plain('planItems(currentPlan()).every(item=>item.inactive)'));
assert.equal(nodes.get("#checkinBtn").hidden,true);
run('templateId="fullA";today.templateId=templateId;renderPlan();');
assert.ok(nodes.get("#pBody").innerHTML.includes("推荐准备"));
assert.ok(!nodes.get("#pBody").innerHTML.includes('aria-label="记录 360° 腹式呼吸"'));
const locationChoice=nodes.get("#pBody").innerHTML;
assert.ok(locationChoice.includes("切换：在家 / 健身房"));
assert.ok(!locationChoice.includes("同一训练模式的替代实现"));

fresh();
run(`log['2026-01-03']={templateId:'push',doneExercises:['Chest Press（器械）'],strength:true,unknown:'keep',actuals:{machine_chest_press:{weight:45,sets:3,reps:[10,9],rir:2}},exerciseChoices:{push:{incline_pushup:'machine_chest_press'}}};`);
const backup=run('JSON.stringify(backupPayload())');
run(`doImport(${JSON.stringify(backup)});`);
assert.equal(run('log["2026-01-03"].unknown'),"keep");
assert.equal(run('readExerciseActual(log["2026-01-03"],"Chest Press（器械）").weight'),45);
assert.ok(run('buildCSV().includes("machine_chest_press")'));
assert.ok(run('buildCSV().includes("machine_display")'));
assert.equal(run('backupPayload().version'),5);
assert.equal(run('AEROBIC_TYPES.includes("跑步机")&&AEROBIC_TYPES.includes("椭圆机")&&AEROBIC_TYPES.includes("划船机")&&AEROBIC_TYPES.includes("原地踏步")'),true);

// Full / Compact keep previous values; absent history uses the selected slot's dose.
fresh();
run('templateId="lowerHinge";today.templateId=templateId;state="amber";today.state=state;');
assert.deepEqual(plain('defaultActual("B-stance RDL",planFor("B-stance RDL"))'),{weight:3,sets:1,reps:8,rir:""});
run('log["2026-01-04"]={actuals:{b_stance_rdl:{weight:9,sets:3,reps:[9,8,8],rir:3}}};');
assert.deepEqual(plain('defaultActual("B-stance RDL",planFor("B-stance RDL"))'),{weight:9,sets:3,reps:[9,8,8],rir:3});
run('setExerciseChoice(today,templateId,"b_stance_rdl","single_leg_rdl");');
assert.deepEqual(plain('defaultActual("单腿 RDL",planFor("单腿 RDL"))'),{weight:3,sets:1,reps:6,rir:""});
assert.deepEqual(plain('recommendedEntryActual("Lat Pulldown（器械）",{templateId:"pull",state:"amber",exerciseChoices:{pull:{band_pulldown:"machine_lat_pulldown"}}})'),{weight:null,sets:2,reps:8});

// Updating a legacy actual adds an ID value without altering the original or unknown fields.
fresh();
run('today.actuals={"高脚杯深蹲":{weight:9,sets:2,reps:8,rir:1,customField:"keep"}};writeExerciseActual(today,"高脚杯深蹲",{weight:13,sets:3,reps:[10,9,8],rir:3});');
assert.equal(run('today.actuals["高脚杯深蹲"].weight'),9);
assert.equal(run('today.actuals.goblet_squat.customField'),"keep");
assert.equal(run('readExerciseActual(today,"高脚杯深蹲").weight'),13);
run('writeExerciseActual(today,"高脚杯深蹲",{sets:3,reps:[10,9,8]});');
assert.equal(run('readExerciseActual(today,"高脚杯深蹲").rir'),undefined);
assert.equal(run('readExerciseActual(today,"高脚杯深蹲").weight'),undefined);
assert.equal(run('today.actuals["高脚杯深蹲"].rir'),1);

// Legacy missing fields, extra fields and aliases survive a complete JSON round trip.
fresh();
const legacy={"2026-01-01":{day:"A",state:"amber",completed:true,doneA:["高脚杯深蹲"],doneB:[],extra:{keep:true}},"2026-01-02":{dayType:"aero",aerobic:{type:"散步",minutes:17},note:"synthetic fixture",period:true},"2026-01-03":{actuals:{"哑铃肩推":{weight:6,sets:2,reps:8,unknown:1}}}};
run(`doImport(${JSON.stringify(JSON.stringify({format:"avengo-backup",version:4,log:legacy}))});`);
assert.deepEqual(plain('Object.fromEntries(Object.entries(log).filter(([key])=>key.startsWith("2026-01")))'),legacy);
const roundtrip=run('JSON.stringify(backupPayload())');
fresh();run(`doImport(${JSON.stringify(roundtrip)});`);
for(const [key,entry] of Object.entries(legacy))assert.deepEqual(plain(`log[${JSON.stringify(key)}]`),entry);
assert.deepEqual(plain('completedNames(log["2026-01-03"])'),["哑铃肩推"]);

// Existing parallel records remain editable, but the inactive unilateral option is not a new task.
const past={templateId:"lowerHinge",strength:true,doneExercises:["B-stance RDL","单腿 RDL"],exerciseChoices:{lowerHinge:{b_stance_rdl:"single_leg_rdl"}}};
assert.equal(run(`itemsForEntry(${JSON.stringify(past)}).find(item=>item.nm==="B-stance RDL").historical`),true);
for(const [id] of gymPairs){
  for(const field of ["start","breath","tempo","sequence","feel","errors"])assert.ok(run(`GYM_DETAILS.${id}.${field}`),`${id}.${field}`);
  assert.equal(run(`GYM_DETAILS.${id}.needsReview`),true);
}
assert.ok(!run('LIBRARY_ITEMS["Cable Row"].dose.g').startsWith("各"));
assert.ok(run('LIBRARY_ITEMS["Cable Lateral Raise"].dose.g').startsWith("各"));
console.log("exercise layer regression tests passed");
