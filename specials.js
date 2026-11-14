const handshakeSheet=new Image();handshakeSheet.src='handshake-poses.png';
let slowMotionRemaining=0;
function specialTimeStep(realDt){if(state!=='playing')return realDt;const slow=slowMotionRemaining>0;slowMotionRemaining=Math.max(0,slowMotionRemaining-realDt);return realDt*(slow?.22:1)}
const specialProps=new Image();specialProps.src='rupees-megaphone.png';const potholeArt=new Image();potholeArt.src='pothole.png';const treeArt=new Image();treeArt.src='uprooted-tree.png';
const supporterSheet=new Image();supporterSheet.src='generic-supporters.png';
const specialDefs=[
 {id:'notes',name:'Note Rain',effect:'Rupee tornado + knockback',damage:24,color:'#c8f866'},
 {id:'speech',name:'Bhashan Blast',effect:'Damage + stun',damage:20,color:'#ffd66b'},
 {id:'coalition',name:'Coalition Breaker',effect:'Handshake + ground slam',damage:30,color:'#ff9866'},
 {id:'crowd',name:'Andhbakt Attack',effect:'Damage + crowd rush',damage:26,color:'#e9c4ff'},
 {id:'pothole',name:'Pothole Trap',effect:'Damage + trap · jump to evade',damage:25,color:'#d6b383'},
 {id:'trees',name:'39 A Development',effect:'Damage + tree barrage',damage:28,color:'#96db69'}
];
const difficultyDefs={easy:{speed:105,reaction:[.85,1.45],damage:.7,guard:.12},normal:{speed:155,reaction:[.4,.95],damage:1,guard:.25},hard:{speed:205,reaction:[.22,.5],damage:1.2,guard:.4}};
let selectedSpecial='notes',selectedDifficulty='normal',matchDifficulty='normal',specialEffects=[];
function chargeHit(f,type,blocked){f.combo=f.comboTimer>0?f.combo+1:1;f.comboTimer=1.2;const multiplier=f.combo>=4?2:f.combo===3?1.5:f.combo===2?1.25:1;f.energy=Math.min(100,f.energy+(type==='kick'?32:24)*multiplier*(blocked?.5:1))}
function castSpecial(f){if(f.energy<100)return false;f.energy=0;f.combo=0;f.comboTimer=0;const def=specialDefs.find(d=>d.id===f.special),target=fighters.find(o=>o!==f);specialEffects.push({def,owner:f,dir:f.dir,x:f.x+f.dir*45,y:f.y-80,targetX:target.x,age:0,life:def.id==='coalition'?2.8:def.id==='notes'?3.5:1.7,hits:0,target,anchor:f.x,approachAge:0,connected:false});$('#status').textContent=def.name.toUpperCase();playSound(def.id==='coalition'?'slam':def.id);return true}
function updateSpecials(dt){resolveClashes();
 for(const e of specialEffects){if(e.cancelled)continue;e.age+=dt;const target=fighters.find(f=>f!==e.owner);if(!target)continue;const id=e.def.id;
 if(id==='coalition'&&!e.connected){e.approachAge+=dt;e.age=0;e.owner.stun=Math.max(e.owner.stun,.1);e.dir=target.x>=e.owner.x?1:-1;e.owner.dir=e.dir;const desired=Math.max(45,Math.min(1155,target.x-e.dir*112)),delta=desired-e.owner.x;e.owner.x+=Math.sign(delta)*Math.min(Math.abs(delta),650*dt);e.owner.walk+=dt*16;if(Math.abs(e.owner.x-desired)<3&&e.owner.y>=floor&&target.y>=floor&&!target.blocking){e.connected=true;e.anchor=e.owner.x;e.age=0}else if(e.approachAge>3.2){e.age=e.life;continue}}
 if(id==='coalition'&&e.connected){e.owner.x=e.anchor;e.owner.y=floor;e.owner.vy=0;e.owner.dir=e.dir;e.owner.stun=Math.max(e.owner.stun,.1);target.x=Math.max(45,Math.min(1155,e.anchor+e.dir*112));target.y=floor;target.vy=0;target.dir=-e.dir;target.stun=Math.max(target.stun,.1)}
 if(id==='notes'&&e.engulfing){e.engulfAge+=dt;e.x=e.victimX;target.x=e.victimX;target.stun=Math.max(target.stun,.12);target.specialReaction=Math.max(target.specialReaction,.12);target.y=floor-12-Math.sin(e.engulfAge*9)*6;target.vy=0;if(e.engulfAge>=1.8){target.x=Math.max(45,Math.min(1155,target.x+e.dir*95));target.vy=-160;e.age=e.life;e.engulfing=false}continue}
 if(['notes','speech','crowd','trees'].includes(id))e.x+=e.dir*(id==='notes'?265:id==='speech'?600:id==='crowd'?460:510)*dt;
 let contact=false;
 if(id==='pothole')contact=e.age>.4&&Math.abs(target.x-e.targetX)<82&&target.y>floor-65;
 else if(id==='coalition')contact=e.connected&&e.age>1.9&&Math.abs(target.y-e.owner.y)<80;
 else contact=Math.abs(e.x-target.x)<(id==='crowd'?100:65)&&Math.abs((id==='crowd'?floor-65:e.y)-(target.y-75))<(id==='crowd'?115:90);
 const maxHits=1;if(!roundFinishing&&target.hp>0&&contact&&e.hits<maxHits&&(id!=='coalition'||e.age>1.9)){
  const blocked=damage(target,e.def.damage/maxHits,e.dir,{special:true});e.hits++;
  if(!blocked){slowMotionRemaining=.8;target.specialReaction=.38;target.stun=Math.max(target.stun,.38);$('#hp'+(fighters.indexOf(target)+1)).style.transition='width .75s ease-out';target.combo=0;target.comboTimer=0;if(id==='notes'){e.engulfing=true;e.engulfAge=0;e.victimX=target.x;e.x=target.x;e.life=e.age+1.8}if(id==='crowd')target.x=Math.max(45,Math.min(1155,target.x+e.dir*95));if(id==='speech')target.stun=1.15;if(id==='pothole'){target.stun=.9;target.trapped=.9}if(id==='coalition'){target.stun=.65;shake=20}}
 }
 }
 specialEffects=specialEffects.filter(e=>e.age<e.life&&e.x>-250&&e.x<1450);
}
function star(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.4:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
function drawSpecials(){for(const e of specialEffects){ctx.save();const id=e.def.id,t=e.age;ctx.globalAlpha=Math.min(1,(e.life-t)*3);ctx.shadowColor=e.def.color;ctx.shadowBlur=12;
 if(id==='notes')drawNoteTornado(e,true);
 if(id==='speech'){for(let i=0;i<4;i++){ctx.strokeStyle=e.def.color;ctx.lineWidth=5-i;ctx.beginPath();ctx.ellipse(e.x-e.dir*i*24,e.y,15+i*6,32+i*15,0,-1.5,1.5);ctx.stroke()}ctx.save();ctx.translate(e.owner.x,e.owner.y);ctx.scale(e.owner.dir,1);ctx.shadowBlur=0;if(specialProps.complete&&specialProps.naturalWidth){ctx.drawImage(specialProps,specialProps.naturalWidth/2,0,specialProps.naturalWidth/2,specialProps.naturalHeight,25,-170,85,85);const hand=fighterImages.get(e.owner.id);if(hand?.complete&&hand.naturalWidth){const sw=hand.naturalWidth/4,sh=hand.naturalHeight/2;ctx.drawImage(hand,sw+sw*.61,sh+sh*.25,sw*.25,sh*.17,-82+180*.61,-174+180*.25,180*.25,180*.17)}}ctx.restore()}
 if(id==='coalition'&&e.connected){const target=e.target;if(t>=1.9&&t<2.5){ctx.strokeStyle='#f4d49b';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(target.x,floor+1,(t-1.9)*170,10+(t-1.9)*25,0,0,7);ctx.stroke();for(let i=0;i<8;i++)star(target.x+Math.cos(i)*65,floor-10-Math.abs(Math.sin(i))*30,5,'#f9df9c')}}
 if(id==='crowd'){
  ctx.shadowBlur=0;
  const members=[{kind:1,d:80,z:15,size:158},{kind:2,d:150,z:18,size:153},{kind:3,d:210,z:15,size:156},{kind:0,d:0,z:0,size:177},{kind:3,d:73,z:0,size:172},{kind:1,d:147,z:0,size:174}];
  if(supporterSheet.complete&&supporterSheet.naturalWidth){const sw=supporterSheet.naturalWidth/4,sh=supporterSheet.naturalHeight/2;
   for(let i=0;i<members.length;i++){const m=members[i],phase=t*15+i*1.7,row=Math.floor(phase/Math.PI)%2;ctx.save();ctx.translate(e.x-e.dir*m.d,floor-m.z);ctx.scale(e.dir,1);ctx.fillStyle='#090a0a25';ctx.beginPath();ctx.ellipse(0,1,30,5,0,0,7);ctx.fill();ctx.drawImage(supporterSheet,m.kind*sw,row*sh,sw,sh,-m.size*.45,-m.size*.975+Math.sin(phase)*2,m.size,m.size);ctx.restore()}
  }
  drawCrowdDust(e,t);

 }
 if(id==='pothole'&&potholeArt.complete&&potholeArt.naturalWidth){const grow=Math.min(1,t*3),w=230*grow,h=116*grow;ctx.shadowBlur=0;ctx.drawImage(potholeArt,0,potholeArt.naturalHeight*.65,potholeArt.naturalWidth,potholeArt.naturalHeight*.35,e.targetX-w/2,floor-55*grow+h*.65,w,h*.35)}
 if(id==='trees'&&treeArt.complete&&treeArt.naturalWidth){ctx.shadowBlur=0;for(let i=0;i<3;i++){ctx.save();ctx.translate(e.x-e.dir*i*85,e.y+Math.sin(t*8+i)*16);ctx.rotate(e.dir*(t*5+i*.8));ctx.drawImage(treeArt,-48,-95,96,190);ctx.restore()}}
 ctx.restore()}}
function updateCombatHUD(){const bubble=$('#attack-cloud'),active=specialEffects[specialEffects.length-1];bubble.hidden=!active;if(active){const label=active.def.name.toUpperCase();if(bubble.textContent!==label)bubble.textContent=label;bubble.dataset.corner=active.owner===fighters[0]?'player':'cpu'}fighters.forEach((f,i)=>{const n=i+1;$('#special-name'+n).textContent=specialDefs.find(d=>d.id===f.special).name;$('#energy-label'+n).textContent=f.energy>=100?'SPECIAL READY · SPACE':Math.floor(f.energy)+' / 100';$('#en'+n).parentElement.classList.toggle('ready',f.energy>=100);$('#combo'+n).textContent=f.combo>1&&f.comboTimer>0?f.combo+' HIT COMBO ×'+(f.combo>=4?'2':f.combo===3?'1.5':'1.25'):''})}


function drawGroundSpecials(){for(const e of specialEffects){if(e.def.id==='notes'){drawNoteTornado(e,false);continue}if(e.def.id!=='pothole'||!potholeArt.complete||!potholeArt.naturalWidth)continue;const grow=Math.min(1,e.age*3);ctx.save();ctx.globalAlpha=Math.min(1,(e.life-e.age)*3);ctx.drawImage(potholeArt,e.targetX-115*grow,floor-55*grow,230*grow,116*grow);ctx.restore()}}
function coalitionScene(f){return specialEffects.find(e=>e.def.id==='coalition'&&e.connected&&(e.owner===f||e.target===f))}
function coalitionTransform(f){const e=coalitionScene(f);if(!e||e.target!==f)return;const t=e.age;if(t<1.05)return;if(t<1.65){const p=(t-1.05)/.6;ctx.translate(-e.dir*25*p,-135*Math.sin(p*Math.PI/2));ctx.rotate(e.dir*p*Math.PI*.65)}else if(t<1.93){const p=(t-1.65)/.28;ctx.translate(e.dir*40*p,-135*(1-p));ctx.rotate(e.dir*(Math.PI*.65+p*Math.PI*.85))}else if(t<2.45){ctx.translate(e.dir*40,-35);ctx.rotate(e.dir*Math.PI/2)}else{const p=Math.max(0,(2.8-t)/.35);ctx.translate(e.dir*40*p,-35*p);ctx.rotate(e.dir*Math.PI/2*p)}}

function drawHandshakePose(f){const e=coalitionScene(f);if(!e||e.age>=1.05||!handshakeSheet.complete||!handshakeSheet.naturalWidth)return false;const index=roster.findIndex(r=>r.id===f.id),sw=handshakeSheet.naturalWidth/3,sh=handshakeSheet.naturalHeight/2;ctx.translate(0,Math.sin(e.age*10)*1.2);ctx.drawImage(handshakeSheet,index%3*sw,Math.floor(index/3)*sh,sw,sh,-75.6,-174,180,180);return true}

function drawCrowdDust(e,t){
 ctx.save();ctx.shadowBlur=0;
 // Long, low wake under the running group.
 for(let i=0;i<14;i++){
  const x=e.x-e.dir*(i*22+8),y=floor+3,r=25+(i%3)*6;
  const haze=ctx.createRadialGradient(x,y,0,x,y,r);haze.addColorStop(0,'#bb925c65');haze.addColorStop(.55,'#ba996143');haze.addColorStop(1,'#b8935f00');ctx.fillStyle=haze;ctx.beginPath();ctx.ellipse(x,y,r*1.5,r*.42,0,0,Math.PI*2);ctx.fill();
 }
 // Layered billows rise with each footfall; keep them below the knees.
 for(let i=0;i<23;i++){
  const age=(t*1.9+i*.137)%1,trail=i*12+age*30;
  const x=e.x-e.dir*trail+Math.sin(i*2.1+t*4)*5,y=floor-4-age*(24+i%3*5),r=11+age*17+i%3*3;
  ctx.save();ctx.globalAlpha*=Math.min(1,t*5)*(1-age)*.85;
  const cloud=ctx.createRadialGradient(x-r*.25,y-r*.3,r*.1,x,y,r);
  cloud.addColorStop(0,'#f1d8a6');cloud.addColorStop(.35,'#d6b682e6');cloud.addColorStop(.75,'#ae895ba0');cloud.addColorStop(1,'#a8825300');
  ctx.fillStyle=cloud;ctx.beginPath();ctx.ellipse(x,y,r*1.25,r*.83,Math.sin(i)*.25,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 // A few tiny pieces of kicked-up grit catch the warm streetlight.
 for(let i=0;i<14;i++){const age=(t*2.8+i*.19)%1,x=e.x-e.dir*(i*20+age*35),y=floor-4-Math.sin(age*Math.PI)*(12+i%4*5);ctx.globalAlpha=Math.min(1,(e.life-t)*3)*(1-age)*.65;ctx.fillStyle=i%2?'#f1d7a0':'#967144';ctx.beginPath();ctx.arc(x,y,1+i%2*.6,0,Math.PI*2);ctx.fill()}
 ctx.restore();
}

function drawNoteTornado(e,front){
 ctx.save();ctx.shadowBlur=0;const t=e.age,engulf=!!e.engulfing,build=engulf?Math.min(1,e.engulfAge*5):.52,fade=Math.min(1,(e.life-t)*3);ctx.globalAlpha=fade;
 const height=engulf?235:150,bottom=engulf?floor+5:e.y+77;
 // Wide spiral crown narrows towards the ground, enclosing the whole body.
 for(let j=0;j<22;j++){const level=j/21,angle=t*6+j*1.9,radius=(22+level*76)*build,depth=Math.sin(angle);if((depth>=0)!==front)continue;const x=e.x+Math.cos(angle)*radius,y=bottom-level*height,r=16+level*20;
  const smoke=ctx.createRadialGradient(x,y,1,x,y,r);smoke.addColorStop(0,front?'#cfccb54d':'#e0dccf66');smoke.addColorStop(.6,'#bdb6a132');smoke.addColorStop(1,'#bdb6a100');ctx.fillStyle=smoke;ctx.beginPath();ctx.ellipse(x,y,r*1.6,r*.7,angle*.1,0,Math.PI*2);ctx.fill();
 }
 ctx.lineWidth=1.4;for(let j=0;j<6;j++){const y=bottom-j*height/6,r=(25+j*13)*build;ctx.strokeStyle=front?'#dbdfab44':'#e6d8bb33';ctx.beginPath();ctx.ellipse(e.x,y,r,8+j*2,0,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke()}
 for(let i=0;i<52;i++){const level=(i/52+t*.17)%1,angle=t*6.5+i*2.399,depth=Math.sin(angle);if((depth>=0)!==front)continue;const radius=(22+level*78)*build,x=e.x+Math.cos(angle)*radius,y=bottom-level*height,size=24+(depth+1)*7;
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(angle)*.7+Math.cos(t*2+i)*.15);ctx.scale(.6+Math.abs(depth)*.4,1);if(specialProps.complete&&specialProps.naturalWidth)ctx.drawImage(specialProps,0,0,specialProps.naturalWidth/2,specialProps.naturalHeight,-size/2,-size/2,size,size);ctx.restore();
 }
 ctx.restore();
}
