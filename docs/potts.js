(function(root){
'use strict';
class PottsModel {
 constructor(L=96,q=3){this.L=L;this.q=q;this.T=.8;this.reset();}
 criticalTemperature(){return 1/Math.log(1+Math.sqrt(this.q));}
 reset(random=false){const L=this.L,N=L*L;this.s=new Uint8Array(N);this.counts=new Int32Array(this.q);this.neighbors=new Uint32Array(N*4);for(let i=0;i<N;i++){const x=i%L,y=Math.floor(i/L);this.neighbors.set([y*L+(x+1)%L,y*L+(x+L-1)%L,((y+1)%L)*L+x,((y+L-1)%L)*L+x],4*i);const a=random?Math.floor(Math.random()*this.q):0;this.s[i]=a;this.counts[a]++;}this.attempts=0;this.accepted=0;this.H=this.energy();}
 delta(i,b){const a=this.s[i];let d=0;for(let k=0;k<4;k++){const neighbor=this.s[this.neighbors[4*i+k]];d+=(neighbor===a?1:0)-(neighbor===b?1:0);}return d;}
 step(){const i=Math.floor(Math.random()*this.s.length),a=this.s[i];let b=Math.floor(Math.random()*(this.q-1));if(b>=a)b++;const d=this.delta(i,b);this.attempts++;if(d<=0||(this.T>0&&Math.random()<Math.exp(-d/this.T))){this.s[i]=b;this.counts[a]--;this.counts[b]++;this.H+=d;this.accepted++;return true;}return false;}
 sweep(n=1){for(let k=0;k<n*this.s.length;k++)this.step();}
 energy(){let e=0;for(let i=0;i<this.s.length;i++){if(this.s[i]===this.s[this.neighbors[4*i]])e--;if(this.s[i]===this.s[this.neighbors[4*i+2]])e--;}return e;}
 order(){return (this.q*Math.max(...this.counts)/this.s.length-1)/(this.q-1);}
}
root.PottsModel=PottsModel;if(typeof module!=='undefined')module.exports=PottsModel;
})(globalThis);
