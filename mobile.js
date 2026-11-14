let rotationPaused=false;const portraitQuery=matchMedia('(orientation: portrait)');
let mobileBattleFullscreen=false;
function isMobileBattleDevice(){return mobileQuery.matches&&(navigator.maxTouchPoints>0||matchMedia('(pointer: coarse)').matches)}
async function enterMobileBattleFullscreen(){
 if(!isMobileBattleDevice())return;
 const target=$('.game-layout');
 try{if(!document.fullscreenElement&&!document.webkitFullscreenElement){if(target.requestFullscreen)await target.requestFullscreen({navigationUI:'hide'});else if(target.webkitRequestFullscreen)await target.webkitRequestFullscreen();else return}mobileBattleFullscreen=true;if(state==='menu'){await exitMobileBattleFullscreen();return}}catch{mobileBattleFullscreen=false}
}
async function exitMobileBattleFullscreen(){
 if(!mobileBattleFullscreen)return;mobileBattleFullscreen=false;
 try{if(document.fullscreenElement&&document.exitFullscreen)await document.exitFullscreen();else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)await document.webkitExitFullscreen()}catch{/* Keep game navigation usable if the browser already exited. */}
}
const mobileQuery=matchMedia('(max-width: 900px), (pointer: coarse) and (max-width: 1100px)'),touchPointers=new Map();
function releaseTouchControls(){touchPointers.clear();for(const code of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyD'])keys[code]=false;document.querySelectorAll('.touch-button').forEach(b=>b.classList.remove('pressed'))}
function syncMobileScreen(){const selection=state==='menu';if(selection)rotationPaused=false;document.body.dataset.mobileScreen=selection?'selection':'game';document.body.classList.toggle('mobile-layout',mobileQuery.matches);$('#touch-controls').setAttribute('aria-hidden',String(!mobileQuery.matches));document.querySelectorAll('.touch-button').forEach(b=>b.disabled=state!=='playing');$('#touch-reset').hidden=matchMode!=='training';if(state!=='playing')releaseTouchControls();if(mobileQuery.matches&&portraitQuery.matches&&!selection&&(state==='playing'||state==='intro')){rotationPaused=true;pause()}}
function pressTouch(button,event){event.preventDefault();if(state!=='playing')return;button.setPointerCapture?.(event.pointerId);button.classList.add('pressed');const code=button.dataset.code,action=button.dataset.action;touchPointers.set(event.pointerId,{button,code});if(code){keys[code]=true;handleMoveKey(code)}if(action==='punch')handleMoveKey('KeyA');if(action==='kick')handleMoveKey('KeyS');if(action==='special')attack(fighters[0],'special');if(action==='uppercut'){fighters[0].jumpQueued=0;pendingStrike=null;attack(fighters[0],'uppercut')}if(action==='sweep'){pendingStrike=null;attack(fighters[0],'sweep')};button.blur()}
function releaseTouch(event){const held=touchPointers.get(event.pointerId);if(!held)return;touchPointers.delete(event.pointerId);held.button.classList.remove('pressed');if(held.code)keys[held.code]=[...touchPointers.values()].some(p=>p.code===held.code)}
for(const button of document.querySelectorAll('.touch-button')){button.addEventListener('pointerdown',e=>pressTouch(button,e));button.addEventListener('pointerup',releaseTouch);button.addEventListener('pointercancel',releaseTouch);button.addEventListener('lostpointercapture',releaseTouch);button.addEventListener('contextmenu',e=>e.preventDefault())}
$('#touch-pause').onclick=pause;$('#touch-reset').onclick=resetTraining;mobileQuery.addEventListener('change',syncMobileScreen);addEventListener('blur',releaseTouchControls);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseTouchControls()});syncMobileScreen();

function updateOrientation(){releaseTouchControls();if(rotationPaused&&!portraitQuery.matches&&state==='paused'){rotationPaused=false;pause()}syncMobileScreen()}portraitQuery.addEventListener('change',updateOrientation);$('#rotate-back').onclick=()=>{rotationPaused=false;quitMatch()};$('#touch-sound').onclick=()=>{$('#sound').onclick();$('#touch-sound').textContent=sound?'SOUND ON':'SOUND OFF'};


