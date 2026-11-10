(function(root){
'use strict';
const radius=.22,halfWall=.06,red0=-3,blue0=2,v0=2,m=1,M=2;
const hit1=(-radius-halfWall-red0)/v0;
const vr=(m-M)/(m+M)*v0,vw=2*m/(m+M)*v0;
const hit2=hit1+(blue0-radius-halfWall)/vw;
const wallAtHit2=vw*(hit2-hit1),wallAfter=(M-m)/(M+m)*vw,blueAfter=2*M/(M+m)*vw;
function state(t){
 return {red:t<hit1?red0+v0*t:-radius-halfWall+vr*(t-hit1),wall:t<hit1?0:t<hit2?vw*(t-hit1):wallAtHit2+wallAfter*(t-hit2),blue:t<hit2?blue0:blue0+blueAfter*(t-hit2),vr:t<hit1?v0:vr,vw:t<hit1?0:t<hit2?vw:wallAfter,vb:t<hit2?0:blueAfter};
}
root.TransferDemo={state,hit1,hit2,m,M};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),red='#d24c3a',blue='#2477b5';let time=0,playing=true,previous=0;
function canvas(id){const el=$(id),r=el.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);el.width=Math.round(r.width*d);el.height=Math.round(r.height*d);const c=el.getContext('2d');c.scale(d,d);return {c,w:r.width,h:r.height};}
function ball(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fill();}
function mechanics(){const {c,w,h}=canvas('mechanics'),s=state(Math.min(time,4.2)),scale=Math.min(w/10,h/5),X=x=>w/2+(x-.8)*scale,y=h*.52;
 c.strokeStyle='#e5e9ef';c.lineWidth=1;c.beginPath();c.moveTo(25,y+.3*scale);c.lineTo(w-25,y+.3*scale);c.stroke();
 c.fillStyle='#64748b';c.fillRect(X(s.wall)-halfWall*scale,y-1.2*scale,2*halfWall*scale,2.4*scale);
 ball(c,X(s.red),y,radius*scale,red);ball(c,X(s.blue),y,radius*scale,blue);
 c.font='16px Segoe UI';c.textAlign='center';c.fillStyle='#64748b';c.fillText('Movable wall',X(s.wall),y-1.2*scale-16);
}
function packets(){const {c,w,h}=canvas('packets'),left=w*.24,right=w*.76,y=h*.68,r=Math.min(19,w*.035),size=Math.min(23,w*.04),gap=size*.22,binY=h*.34;
 ball(c,left,y,r,red);ball(c,right,y,r,blue);
 function bin(x,color){c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(x-size*3.1,binY-size*.7);c.lineTo(x-size*3.1,binY+size*.75);c.lineTo(x+size*3.1,binY+size*.75);c.lineTo(x+size*3.1,binY-size*.7);c.stroke();}
 bin(left,red);bin(right,blue);
 const start=left-2*(size+gap),u=Math.max(0,Math.min(1,(time-1.1)/1.8)),smooth=u*u*(3-2*u);
 c.fillStyle=red;for(let i=0;i<4;i++)c.fillRect(start+i*(size+gap)-size/2,binY-size/2,size,size);
 const x0=start+4*(size+gap),x=x0+(right-x0)*smooth,yblock=binY-Math.sin(Math.PI*u)*h*.18;
 c.fillStyle=u===1?blue:red;c.fillRect(x-size/2,yblock-size/2,size,size);
 c.font='16px Segoe UI';c.textAlign='center';c.fillStyle='#64748b';c.fillText('Energy',w/2,binY-size-20);
}
function draw(){mechanics();packets();$('seek').value=Math.round(time*100);$('time').textContent=time.toFixed(1).replace('.',',')+' s';}
function tick(now){if(playing){if(previous)time+=(now-previous)/1000;if(time>5.3)time=0;draw();}previous=now;requestAnimationFrame(tick);}
$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pause':'Play';previous=0;};
$('reset').onclick=()=>{time=0;previous=0;draw();};
$('seek').oninput=()=>{time=Number($('seek').value)/100;draw();};
new ResizeObserver(draw).observe(document.querySelector('.animations'));draw();requestAnimationFrame(tick);
})(typeof window==='undefined'?globalThis:window);
