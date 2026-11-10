/* Quanti indistinguibili: proposta simmetrica tra scatole, inclusi passi nulli. */
(function(global){
'use strict';
function simulate(seed=20261030,rule='box',steps=10000){
 let state=seed>>>0;const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
 // Uniform stars-and-bars sampling: choose 99 separator positions among 399.
 function uniformOccupancy(){
  const result=Array(100).fill(0);let box=0,separators=99;
  for(let position=0;position<399;position++){
   if(random()<separators/(399-position)){box++;separators--;}
   else result[box]++;
  }
  return result;
 }
 const boxes=rule==='independent-box'?uniformOccupancy():Array(100).fill(0);
 if(rule!=='independent-box')for(let q=0;q<300;q++)boxes[Math.floor(random()*100)]++;
 const history=[boxes.slice()];
 for(let t=0;t<steps;t++){
  if(rule==='independent-box'){
   const next=uniformOccupancy();
   for(let i=0;i<100;i++)boxes[i]=next[i];
   history.push(boxes.slice());
   continue;
  }
  if(rule==='independent'){
   boxes.fill(0);
   for(let q=0;q<300;q++)boxes[Math.floor(random()*100)]++;
   history.push(boxes.slice());
   continue;
  }
  let source;
  if(rule==='packet'){let q=Math.floor(random()*300);source=0;while(q>=boxes[source])q-=boxes[source++];}
  else source=Math.floor(random()*100);
  const target=Math.floor(random()*100);
  if(boxes[source]>0){boxes[source]--;boxes[target]++;}
  history.push(boxes.slice());
 }
 const energy=history.map(b=>b.slice(0,50).reduce((a,v)=>a+v,0));
 let sum=0;const means=energy.map((v,t)=>(sum+=v)/(t+1));
 return {history,energy,means,seed,rule};
}
function theory(rule){
 if(rule==='independent')rule='packet';
 const p=[rule==='packet'?Math.pow(.99,300):99/399];
 for(let n=0;n<300;n++)p.push(p[n]*(rule==='packet'?(300-n)/(n+1)/99:(300-n)/(398-n)));
 return p;
}
global.EnergyBoxes={simulate,theory};
})(typeof window==='undefined'?globalThis:window);
