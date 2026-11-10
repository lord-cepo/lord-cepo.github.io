(function(root){
'use strict';
class LennardJones2D {
 constructor(cols=14,rows=14){if(rows%2)throw Error('Servono righe pari per la periodicità triangolare');this.cols=cols;this.rows=rows;this.N=cols*rows;this.T=.2;this.density=.9;this.displacement=.12;this.cutoff=2.5;this.bins=90;this.reset();}
 wrap(x,L){return x-L*Math.floor(x/L);}
 minimum(x,L){return x-L*Math.round(x/L);}
 pair(r2){if(r2>=this.cutoff*this.cutoff)return 0;if(r2<1e-16)return Infinity;const q=1/r2,q6=q*q*q;return 4*q6*(q6-1)-this.shift;}
 reset(){this.a=Math.sqrt(2/(Math.sqrt(3)*this.density));this.Lx=this.cols*this.a;this.Ly=this.rows*this.a*Math.sqrt(3)/2;const q=1/(this.cutoff*this.cutoff),q6=q*q*q;this.shift=4*q6*(q6-1);this.x=new Float64Array(this.N);this.y=new Float64Array(this.N);for(let row=0;row<this.rows;row++)for(let col=0;col<this.cols;col++){const i=row*this.cols+col;this.x[i]=(col+.5*(row%2))*this.a;this.y[i]=row*this.a*Math.sqrt(3)/2;}this.attempts=0;this.accepted=0;this.U=this.energy();this.clearMeasurements();}
 clearMeasurements(){this.hist=new Float64Array(this.bins);this.samples=0;this.burnUntil=this.attempts/this.N+100;this.lastSample=-Infinity;this.history=[];this.psiSum=0;this.localSum=0;}
 particleEnergy(i,x,y){let e=0;for(let j=0;j<this.N;j++)if(j!==i){const dx=this.minimum(x-this.x[j],this.Lx),dy=this.minimum(y-this.y[j],this.Ly);e+=this.pair(dx*dx+dy*dy);}return e;}
 energy(){let e=0;for(let i=0;i<this.N;i++)for(let j=i+1;j<this.N;j++){const dx=this.minimum(this.x[i]-this.x[j],this.Lx),dy=this.minimum(this.y[i]-this.y[j],this.Ly);e+=this.pair(dx*dx+dy*dy);}return e;}
 step(){const i=Math.floor(Math.random()*this.N),x=this.wrap(this.x[i]+(2*Math.random()-1)*this.displacement,this.Lx),y=this.wrap(this.y[i]+(2*Math.random()-1)*this.displacement,this.Ly);const dE=this.particleEnergy(i,x,y)-this.particleEnergy(i,this.x[i],this.y[i]);this.attempts++;if(dE<=0||(this.T>0&&Math.random()<Math.exp(-dE/this.T))){this.x[i]=x;this.y[i]=y;this.U+=dE;this.accepted++;return true;}return false;}
 sweep(n=1){for(let i=0;i<n*this.N;i++)this.step();}
 observe(record=true){const N=this.N,rmax=Math.min(this.Lx,this.Ly)/2,dr=rmax/this.bins,counts=new Float64Array(this.bins),re=new Float64Array(N),im=new Float64Array(N),local=new Float64Array(N);let real=0,imag=0,localTotal=0;
 for(let i=0;i<N;i++){const nearest=[];for(let j=0;j<N;j++)if(j!==i){const dx=this.minimum(this.x[j]-this.x[i],this.Lx),dy=this.minimum(this.y[j]-this.y[i],this.Ly),r2=dx*dx+dy*dy;if(j>i){const k=Math.floor(Math.sqrt(r2)/dr);if(k<this.bins)counts[k]+=2;}nearest.push([r2,dx,dy]);}nearest.sort((a,b)=>a[0]-b[0]);for(let k=0;k<6;k++){const theta=Math.atan2(nearest[k][2],nearest[k][1]);re[i]+=Math.cos(6*theta)/6;im[i]+=Math.sin(6*theta)/6;}local[i]=Math.hypot(re[i],im[i]);real+=re[i];imag+=im[i];localTotal+=local[i];}
 const global=Math.hypot(real,imag)/N,meanLocal=localTotal/N,sweep=this.attempts/N;const fresh=record&&sweep-this.lastSample>=10;if(fresh){this.lastSample=sweep;this.history.push({sweep,global,local:meanLocal});if(this.history.length>500)this.history.shift();if(sweep>=this.burnUntil){for(let k=0;k<this.bins;k++)this.hist[k]+=counts[k];this.samples++;this.psiSum+=global;this.localSum+=meanLocal;}}
 const gr=new Float64Array(this.bins),area=this.Lx*this.Ly;for(let k=0;k<this.bins;k++){const shell=Math.PI*((k+1)**2-k*k)*dr*dr;gr[k]=(this.samples?this.hist[k]/this.samples:counts[k])*area/(N*(N-1)*shell);}
 return {global,meanLocal,local,re,im,gr,dr,rmax,sweep,samples:this.samples,meanGlobal:this.samples?this.psiSum/this.samples:null,meanLocalSample:this.samples?this.localSum/this.samples:null};}
}
root.LennardJones2D=LennardJones2D;if(typeof module!=='undefined')module.exports=LennardJones2D;
})(globalThis);
