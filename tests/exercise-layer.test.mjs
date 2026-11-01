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
  window:{addEventListener(){}}, navigator:{}, location:{reload(){}}, localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout(){},clearTimeout(){},FileReader:class {},crypto:{randomUUID:()=>"test-client"}
});
vm.runInContext(source,context);
const run=code=>vm.runInContext(code,context);
const plain=code=>JSON.parse(JSON.stringify(run(code)));
const fresh=()=>run(`for(const key of Object.keys(log))delete log[key]; for(const key of Object.keys(today))delete today[key]; Object.assign(today,{templateId:"fullA",doneExercises:[],actuals:{},exerciseChoices:{},state:"green",strength:true}); templateId="fullA";state="green";`);

assert.equal(new Set(plain("Object.values(EXERCISE_IDS)")).size,plain("Object.keys(EXERCISE_IDS)").length);
assert.equal(run("GYM_MOVEMENTS.length"),11);
assert.equal(run("STANDALONE_GYM_MOVEMENTS.length"),5);
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
const standaloneGym=plain("STANDALONE_GYM_MOVEMENTS");
const standalonePatterns={
  machine_hip_abduction:"accessory",machine_calf_extension:"accessory",machine_leg_curl:"hinge",machine_leg_extension:"squat",machine_rear_delt:"accessory"
};
for(const {id,nm,base} of standaloneGym){
  assert.equal(run(`LIBRARY_ITEMS[${JSON.stringify(nm)}].equipment`),"gym");
  assert.equal(run(`LIBRARY_ITEMS[${JSON.stringify(nm)}].plan.w`),null);
  assert.equal(plain(`defaultActual(${JSON.stringify(nm)},LIBRARY_ITEMS[${JSON.stringify(nm)}].plan)`).weight,null);
  assert.equal(run(`movementMeta(${JSON.stringify(nm)}).pattern`),standalonePatterns[id]);
  assert.equal(run(`Object.values(ALTERNATIVE_IDS).flat().includes(${JSON.stringify(id)})`),false,`${id}: must stay out of template replacement slots`);
  assert.equal(run(`Object.values(TEMPLATES).some(template=>planItems(template).some(item=>item.exerciseId===${JSON.stringify(id)}))`),false,`${id}: must stay free-combination only`);
  run(`log['2026-01-01']={actuals:{[${JSON.stringify(base)}]:{weight:99,sets:7,reps:3,rir:1}}};`);
  assert.equal(run(`lastActual(${JSON.stringify(nm)})`),null,`${id}: must not inherit another exercise's history`);
  run(`writeExerciseActual(log['2026-01-01'],${JSON.stringify(nm)},{weight:40,sets:2,reps:15,rir:3});`);
  assert.equal(run(`lastActual(${JSON.stringify(nm)}).weight`),40);
  assert.equal(run(`lastActual(${JSON.stringify(base)}).weight`),99);
  run(`delete log['2026-01-01'];`);
}
assert.deepEqual(plain('STANDALONE_GYM_MOVEMENTS.map(item=>item.nm)'),["髋外展（器械）","Calf Extension（器械）","Leg Curl（器械）","Leg Extension（器械）","Rear Delt（器械）"]);
run('templateId="custom";today.templateId="custom";renderTemplateControls();');
for(const {nm} of standaloneGym) assert.ok(nodes.get("#customPicker").innerHTML.includes(nm),`${nm}: expected in free-combination picker`);
fresh();
run(`log['2026-10-25']={templateId:'custom',strength:true,doneExercises:['Leg Curl（器械）'],actuals:{machine_leg_curl:{weight:40,sets:2,reps:15,rir:3}}};`);
assert.deepEqual(plain('moveSeries("Leg Curl（器械）")'),[{key:"2026-10-25",w:40}]);
assert.ok(run('buildCSV().includes("machine_leg_curl")'));
assert.ok(run('buildCoachReviewSummary().includes("Leg Curl（器械）")'));
fresh();
assert.equal(run('TEMPLATES.fullA.title'),"Gym Full Body A");
assert.equal(run('TEMPLATES.fullB.title'),"Gym Full Body B");
assert.deepEqual(plain('planItems(TEMPLATES.fullA).map(item=>item.exerciseId)'),["machine_leg_press","machine_shoulder_press","cable_row","cable_rdl","cable_lateral_raise","machine_calf_press"]);
assert.deepEqual(plain('planItems(TEMPLATES.fullB).map(item=>item.exerciseId)'),["machine_chest_press","machine_lat_pulldown","machine_leg_press","cable_rdl","cable_face_pull","cable_pallof_press"]);
assert.equal(run('planItems(TEMPLATES.fullA).every(item=>item.equipment==="gym")&&planItems(TEMPLATES.fullB).every(item=>item.equipment==="gym")'),true);
assert.deepEqual(plain('slotOptions(planItems(TEMPLATES.fullB)[0])'),["machine_chest_press","machine_incline_press"]);
assert.deepEqual(new Set(plain('patternsForEntry({templateId:"fullA",strength:true,doneExercises:planItems(TEMPLATES.fullA).map(item=>item.nm)})')),new Set(["squat","push","pull","hinge"]));
assert.deepEqual(new Set(plain('patternsForEntry({templateId:"fullB",strength:true,doneExercises:planItems(TEMPLATES.fullB).map(item=>item.nm)})')),new Set(["push","pull","squat","hinge"]));
run(`log['2026-01-02']={actuals:{machine_chest_press:{weight:45,sets:3,reps:10,rir:2},machine_incline_press:{weight:30,sets:2,reps:8,rir:1},"上斜俯卧撑(扶桌沿)":{sets:2,reps:9,rir:3}}};`);
assert.equal(run('lastActual("Chest Press（器械）").weight'),45);
assert.equal(run('lastActual("Incline Press（器械）").weight'),30);
assert.equal(run('lastActual("上斜俯卧撑(扶桌沿)").reps'),9);
assert.ok(run('detailActualHTML("Chest Press（器械）","2026-01-03",log["2026-01-02"]).includes("lb")'));
assert.ok(run('trendText("Chest Press（器械）",[{key:"2026-01-01",w:40},{key:"2026-01-08",w:45}]).includes("40lb → 45lb")'));
assert.ok(run('trendText("Chest Press（器械）",[{key:"2026-01-01",w:45},{key:"2026-01-08",w:45},{key:"2026-01-15",w:45}]).includes("机器最小可用档位")'));
assert.ok(!run('trendText("Chest Press（器械）",[{key:"2026-01-01",w:45},{key:"2026-01-08",w:45},{key:"2026-01-15",w:45}]).includes("半磅")'));

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
run('today.doneExercises=["高脚杯深蹲"]; writeExerciseActual(today,"高脚杯深蹲",{weight:13,sets:3,reps:12,rir:2});');
assert.equal(run('readExerciseActual(today,"Leg Press（器械）")'),null);
assert.equal(run('readExerciseActual(today,"高脚杯深蹲").weight'),13);
assert.deepEqual(plain('completedNames(today)'),["高脚杯深蹲"]);
run('writeExerciseActual(today,"Leg Press（器械）",{weight:60,sets:2,reps:10,rir:3});');
assert.equal(run('readExerciseActual(today,"高脚杯深蹲").weight'),13);
assert.equal(run('readExerciseActual(today,"Leg Press（器械）").weight'),60);
assert.equal(run('entryTemplateTitle(today)'),"Full Body A（旧家庭记录）");

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
assert.equal(run('planItems(TEMPLATES.accessory).every(item=>ACCESSORY_USE[item.nm])'),true);
assert.equal(run('Object.values(EXERCISE_IDS).every(id=>Object.prototype.hasOwnProperty.call(PREP_NEEDS_BY_ID,id))'),true);
assert.equal(run('Object.values(LIBRARY_ITEMS).every(item=>Array.isArray(item.prepNeeds))'),true);
assert.deepEqual(plain('LIBRARY_ITEMS["高脚杯深蹲"].prepNeeds'),["ankle","knee","hip"]);
assert.deepEqual(plain('LIBRARY_ITEMS["收下巴(Chin Tuck)"].prepNeeds'),[]);
for(const name of ["伟大伸展 / 猫式伸展","泡沫轴推墙上回旋(前锯)","死虫式(屈膝点地)","侧平板","毛巾滑动腿弯举"]){
  assert.ok(run(`planItems(TEMPLATES.accessory).some(item=>item.nm===${JSON.stringify(name)})`),`${name}: expected in Accessory`);
}
assert.ok(plain('planItems(currentPlan()).every(item=>item.inactive)'));
assert.equal(nodes.get("#checkinBtn").hidden,true);
assert.ok(nodes.get("#pBody").innerHTML.includes("Lower Squat / Lower Hinge · 练前"));
assert.ok(!nodes.get("#pBody").innerHTML.includes("· 可选"));
run('templateId="fullA";today.templateId=templateId;renderPlan();');
assert.ok(nodes.get("#pBody").innerHTML.includes("推荐热身（可选）"));
assert.ok(run('WARMUP_LIBRARY.some(item=>item.need==="knee"&&item.name.includes("舒适幅度"))'));
assert.ok(nodes.get("#pBody").innerHTML.includes("练后舒展(可选)"));
assert.ok(nodes.get("#pBody").innerHTML.includes("想活动一下刚才用到的部位时,可以从这里选;不需要做完。"));
assert.ok(nodes.get("#pBody").innerHTML.includes("不要求精确百分比。器械按实际可用的较低档位选。"));
assert.ok(!/促进恢复|减少酸痛|加速代谢|维持关节活动度/.test(nodes.get("#pBody").innerHTML));
assert.ok(run('derivedPreparationActions(currentPlan(),WARMUP_LIBRARY,5).length<=5'));
assert.ok(run('derivedPreparationActions(currentPlan(),POST_STRETCH_LIBRARY,5).length<=5'));
assert.equal(run('derivedPreparationActions(currentPlan(),WARMUP_LIBRARY,5).every((item,index,list)=>index===0||({dynamic:0,mobility:1}[list[index-1].phase]<=({dynamic:0,mobility:1}[item.phase])))'),true);
assert.deepEqual(plain('specificWarmupTargets(currentPlan()).map(item=>movementMeta(item.nm).pattern)'),["squat","push","pull","hinge"]);
assert.ok(!nodes.get("#pBody").innerHTML.includes('aria-label="记录 360° 腹式呼吸"'));
assert.ok(!nodes.get("#pBody").innerHTML.includes("切换到在家"));
run('templateId="push";today.templateId=templateId;renderPlan();');
const locationChoice=nodes.get("#pBody").innerHTML;
assert.ok(locationChoice.includes("切换到健身房"));
assert.ok(!locationChoice.includes("同一训练模式的替代实现"));
run('setPlanLocation(today,"push","gym");');
assert.equal(run('planLocation(today,"push")'),"gym");
assert.ok(plain('planItems(currentPlan()).map(item=>item.exerciseId)').includes("machine_shoulder_press"));
run('setPlanLocation(today,"push","home");');
assert.equal(run('planLocation(today,"push")'),"home");

fresh();
run(`log['2026-01-03']={templateId:'push',doneExercises:['Chest Press（器械）'],strength:true,unknown:'keep',actuals:{machine_chest_press:{weight:45,sets:3,reps:[10,9],rir:2}},exerciseChoices:{push:{incline_pushup:'machine_chest_press'}}};`);
const backup=run('JSON.stringify(backupPayload())');
run(`doImport(${JSON.stringify(backup)});`);
assert.equal(run('log["2026-01-03"].unknown'),"keep");
assert.equal(run('readExerciseActual(log["2026-01-03"],"Chest Press（器械）").weight'),45);
assert.ok(run('buildCSV().includes("machine_chest_press")'));
assert.ok(run('buildCSV()').includes('"Chest Press（器械）","push","horizontal","45"'));
assert.ok(!run('buildCSV().includes("machine_display")'));
assert.ok(run('buildCSV().includes("aerobic_machine_reading")'));
run('log["2026-01-06"]={venue:"other",venueLabel:"朋友家"};cleanupDay("2026-01-06");');
assert.equal(run('log["2026-01-06"].venueLabel'),"朋友家");
assert.equal(run('hasActivity(log["2026-01-06"])'),false);
assert.ok(run('buildCSV().includes("venue_label")&&buildCSV().includes("朋友家")'));
assert.ok(!run('buildCoachReviewSummary().includes("朋友家")'));
assert.equal(run('backupPayload().version'),6);
assert.ok(run('Array.isArray(backupPayload().customExercises)'));
assert.equal(run('AEROBIC_TYPES.includes("跑步机")&&AEROBIC_TYPES.includes("椭圆机")&&AEROBIC_TYPES.includes("划船机")&&AEROBIC_TYPES.includes("原地踏步")'),true);
run('log["2026-01-05"]={aerobic:{type:"划船机",minutes:20,reading:"阻力 5 · 3000m",unknown:"keep"}};setAeroRec(log["2026-01-05"],"划船机",25,"阻力 6 · 3200m");');
assert.deepEqual(plain('log["2026-01-05"].aerobic'),{type:"划船机",minutes:25,reading:"阻力 6 · 3200m",unknown:"keep"});
assert.ok(run('buildCSV().includes("阻力 6 · 3200m")'));
run('today.aerobic={type:"跑步机",minutes:20,reading:"速度 3.2 · 坡度 4"};syncAeroUI();');
assert.equal(nodes.get("#aeroReading").value,"速度 3.2 · 坡度 4");
assert.equal(nodes.get("#aeroReading").hidden,false);
assert.ok(html.includes('data-dt="none" aria-pressed="false">有氧日</button>'));
assert.ok(!html.includes('data-s="red" aria-pressed="false"><span class="level-mark">轻量</span>'));
for(const removed of ["安静地安排，也如实地记录","动作、有氧和备注都会自动保存在本机","日常记录保存在本机 · AI 复盘仅在主动生成时发送精简力量摘要","怎么安排 · 先运行，再按账本调整","什么时候加量 · 怎么加","器械替换 · 你家里没有的那些","追踪什么 · 只留有用的信息"]) assert.ok(!html.includes(removed),`${removed}: expected removed`);

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
  for(const field of ["setup","start","breath","tempo","sequence","feel","errors"])assert.ok(run(`GYM_DETAILS.${id}.${field}`),`${id}.${field}`);
}
for(const {id} of standaloneGym){
  for(const field of ["setup","start","breath","tempo","sequence","feel","errors"])assert.ok(run(`GYM_DETAILS.${id}.${field}`),`${id}.${field}`);
}
assert.ok(run('GYM_DETAILS.cable_row.setup.includes("Dual Row 坐姿划船机")'));
assert.ok(!run('GYM_DETAILS.cable_row.setup.includes("龙门架")'));
assert.ok(run('detailHTML(GYM_DETAILS.cable_row).indexOf("器械设置") < detailHTML(GYM_DETAILS.cable_row).indexOf("起始姿势")'));
assert.ok(!run('detailHTML(DETAILS["高脚杯深蹲"]).includes("器械设置")'));
assert.ok(!run('LIBRARY_ITEMS["Cable Row"].dose.g').startsWith("各"));
assert.ok(run('LIBRARY_ITEMS["Cable Lateral Raise"].dose.g').startsWith("各"));

// Custom catalog: immutable UUID identity, nullable pattern, prep needs, rename continuity and no cross-history.
fresh();
run('templateId="custom";today.templateId="custom";');
const customSquat=plain('createCustomExercise("自定义深蹲","squat",null,["ankle","knee"])');
assert.ok(customSquat.id.startsWith("custom_"));
assert.equal(run('createCustomExercise("  自定义深蹲  ","hinge").id'),customSquat.id);
assert.equal(run('createCustomExercise("高脚杯深蹲","hinge").id'),"goblet_squat");
assert.deepEqual(plain(`customExerciseRegistry[${JSON.stringify(customSquat.id)}].prepNeeds`),["ankle","knee"]);
run(`today.selectedExercises=["自定义深蹲"];today.doneExercises=["自定义深蹲"];writeExerciseActual(today,"自定义深蹲",{weight:22,sets:3,reps:10,rir:2});`);
assert.deepEqual(plain('patternsForEntry(today)'),["squat"]);
assert.ok(plain('derivedPreparationActions(currentPlan(),WARMUP_LIBRARY,5).map(item=>item.need)').includes("knee"));
assert.equal(run(`readExerciseActual(today,${JSON.stringify(customSquat.id)}).weight`),22);
assert.equal(run('readExerciseActual(today,"高脚杯深蹲")'),null);
assert.equal(run(`renameCustomExercise(${JSON.stringify(customSquat.id)},"朋友家深蹲").ok`),true);
assert.equal(run(`exerciseName(${JSON.stringify(customSquat.id)})`),"朋友家深蹲");
assert.equal(run('exerciseName("自定义深蹲")'),"朋友家深蹲");
assert.equal(run('readExerciseActual(today,"朋友家深蹲").weight'),22);
assert.deepEqual(plain('completedNames(today)'),["朋友家深蹲"]);
const customUnclassified=plain('createCustomExercise("未知器械动作",null,null,["shoulder"])');
assert.equal(customUnclassified.id,"custom_test-client-2");
run('today.selectedExercises=["未知器械动作"];today.doneExercises=["未知器械动作"];writeExerciseActual(today,"未知器械动作",{weight:17,sets:2,reps:9,rir:3});log[todayKey]=today;');
assert.equal(run('movementMeta("未知器械动作").pattern'),null);
assert.deepEqual(plain('patternsForEntry(today)'),[]);
assert.ok(plain('allWeightedMoves()').includes("未知器械动作"));
assert.ok(run('buildCoachReviewSummary().includes("未知器械动作")'));
assert.ok(!run('buildCoachReviewSummary().includes("venue")'));

// Different imported ID with the same normalized name reuses the local ID and remaps the imported log.
const remoteBackup={format:"avengo-backup",version:6,customExercises:[{id:"custom_remote-uuid",name:"未知器械动作",normalizedName:"未知器械动作",pattern:"pull",subPattern:"horizontal",prepNeeds:["wrist"],unknownDefinition:"keep"}],log:{"2026-04-01":{templateId:"custom",strength:true,doneExercises:["未知器械动作"],selectedExercises:["未知器械动作"],actuals:{"custom_remote-uuid":{weight:31,sets:3,reps:8,rir:2,unknownActual:"keep"}},unknownEntry:"keep"}}};
run(`doImport(${JSON.stringify(JSON.stringify(remoteBackup))});`);
assert.equal(run('exerciseIdFor(log["2026-04-01"].doneExercises[0])'),customUnclassified.id);
assert.equal(run(`log["2026-04-01"].actuals[${JSON.stringify(customUnclassified.id)}].weight`),31);
assert.equal(run(`log["2026-04-01"].actuals[${JSON.stringify(customUnclassified.id)}].unknownActual`),"keep");
assert.equal(run('log["2026-04-01"].unknownEntry'),"keep");

// A v6 backup restores catalog definitions and history together; older envelopes remain accepted below.
const customRoundtrip=run('JSON.stringify(backupPayload())');
run('customExercises.splice(0,customExercises.length);localStorage.removeItem(CUSTOM_EXERCISE_KEY);for(const key of Object.keys(log))delete log[key];');
run(`doImport(${JSON.stringify(customRoundtrip)});`);
assert.ok(run('customExercises.some(item=>item.id.startsWith("custom_")&&item.prepNeeds.length)'));
assert.equal(run(`readExerciseActual(log["2026-04-01"],${JSON.stringify(customUnclassified.id)}).weight`),31);
assert.ok(run('backupPayload().customExercises.every(item=>item.normalizedName&&Array.isArray(item.prepNeeds))'));

fresh();
run(`Object.assign(log,{
  '2026-03-01':{templateId:'fullA',strength:true,doneExercises:['高脚杯深蹲'],actuals:{goblet_squat:{weight:9,sets:3,reps:10,rir:2}}},
  '2026-03-02':{templateId:'fullA',strength:true,doneExercises:['高脚杯深蹲','Leg Press（器械）'],actuals:{goblet_squat:{weight:13,sets:3,reps:[10,10,9],rir:1},machine_leg_press:{weight:50,sets:3,reps:12,rir:3}},aerobic:{type:'散步',minutes:20},period:true},
  '2026-03-03':{aerobic:{type:'跑步机',minutes:25,reading:'速度 3.2 · 坡度 4'}},
  '2026-03-04':{aerobic:{type:'散步',minutes:30}}
});`);
const latest=run('latestDataText("2026-03-04")');
assert.ok(latest.includes('高脚杯深蹲 | 03-02 | 13lb | 3×10/10/9 | RIR1'));
assert.ok(latest.includes('Leg Press（器械） | 03-02 | 50lb | 3×12 | RIR3'));
assert.ok(!latest.includes('高脚杯深蹲 | 03-01'));
assert.ok(latest.includes('散步 | 03-04 | 30min'));
assert.ok(latest.includes('跑步机 | 03-03 | 25min | 速度 3.2 · 坡度 4'));
assert.ok(latest.includes('最近来潮：03-02'));
assert.ok(html.includes('id="copyLatestData"'));
assert.ok(html.includes('id="latestDataFallback"'));
console.log("exercise layer regression tests passed");
