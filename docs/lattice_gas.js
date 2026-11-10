(function(root){
'use strict';
class LatticeGas {
 constructor(L=128,rho=.4,g=.2){this.mode="local";this.L=L;this.g=g;this.T=.4;this.n=new Uint8Array(L*L);this.p=[];this.attempts=0;this.accepted=0;this.reset(rho);}
 reset(rho=.4,random=false){this.n.fill(0);this.p=[];const N=Math.round(this.n.length*rho);if(random){const ids=Array.from(this.n.keys());for(let k=0;k<N;k++){const j=k+Math.floor(Math.random()*(ids.length-k));[ids[k],ids[j]]=[ids[j],ids[k]];this.p.push(ids[k]);this.n[ids[k]]=1;}}else for(let i=0;i<N;i++){this.p.push(i);this.n[i]=1;}this.attempts=this.accepted=0;}
 neighbors(i){const L=this.L,x=i%L,y=Math.floor(i/L);return [y*L+(x+1)%L,y*L+(x+L-1)%L,y<L-1?i+L:-1,y>0?i-L:-1];}
 delta(a,b){let ca=0,cb=0;for(const j of this.neighbors(a))if(j>=0&&j!==b)ca+=this.n[j];for(const j of this.neighbors(b))if(j>=0&&j!==a)cb+=this.n[j];return ca-cb+this.g*(Math.floor(b/this.L)-Math.floor(a/this.L));}
 step(){this.attempts++;let k,a,b;if(this.mode==="global"){a=Math.floor(Math.random()*this.n.length);b=Math.floor(Math.random()*(this.n.length-1));if(b>=a)b++;if(this.n[a]===this.n[b])return false;if(!this.n[a])[a,b]=[b,a];k=this.p.indexOf(a);}else{k=Math.floor(Math.random()*this.p.length);a=this.p[k];b=this.neighbors(a)[Math.floor(Math.random()*4)];}if(b<0||this.n[b])return false;const d=this.delta(a,b);if(d<=0||(this.T>0&&Math.random()<Math.exp(-d/this.T))){this.n[a]=0;this.n[b]=1;this.p[k]=b;this.accepted++;return true;}return false;}
 sweep(count=1){for(let k=0;k<count*this.p.length;k++)this.step();}
 energy(){let E=0,L=this.L;for(let i=0;i<this.n.length;i++)if(this.n[i]){E+=this.g*Math.floor(i/L);E-=this.n[Math.floor(i/L)*L+(i%L+1)%L];if(i+L<this.n.length)E-=this.n[i+L];}return E;}
}
root.LatticeGas=LatticeGas;if(typeof module!=='undefined')module.exports=LatticeGas;
})(globalThis);
