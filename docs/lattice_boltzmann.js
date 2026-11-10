(function(root){
'use strict';
const CX=[0,1,0,-1,0,1,-1,-1,1],CY=[0,0,1,0,-1,1,1,-1,-1],W=[4/9,1/9,1/9,1/9,1/9,1/36,1/36,1/36,1/36],OP=[0,3,4,1,2,7,8,5,6];
class D2Q9{
 constructor(nx=160,ny=64){this.nx=nx;this.ny=ny;this.tau=.65;this.force=.00001;this.obstacle=true;this.reset();}
 equilibrium(q,r,u,v){const cu=CX[q]*u+CY[q]*v;return W[q]*r*(1+3*cu+4.5*cu*cu-1.5*(u*u+v*v));}
 reset(){const N=this.nx*this.ny;this.f=new Float64Array(N*9);this.next=new Float64Array(N*9);this.solid=new Uint8Array(N);this.rho=new Float64Array(N);this.ux=new Float64Array(N);this.uy=new Float64Array(N);this.t=0;for(let y=0;y<this.ny;y++)for(let x=0;x<this.nx;x++){const i=y*this.nx+x;this.solid[i]=y===0||y===this.ny-1||(this.obstacle&&(x-this.nx*.3)**2+(y-this.ny*.5)**2<8**2);for(let q=0;q<9;q++)this.f[i*9+q]=W[q];}this.fields();this.mass0=this.mass;}
 fields(){let mass=0,max=0;for(let i=0;i<this.solid.length;i++){if(this.solid[i])continue;let r=0,u=0,v=0;for(let q=0;q<9;q++){const f=this.f[i*9+q];r+=f;u+=f*CX[q];v+=f*CY[q];}if(!Number.isFinite(r)||r<=0)throw Error('Densità non valida');this.rho[i]=r;this.ux[i]=(u+this.force/2)/r;this.uy[i]=v/r;mass+=r;max=Math.max(max,Math.hypot(this.ux[i],this.uy[i]));}this.mass=mass;this.maxSpeed=max;}
 step(count=1){const nx=this.nx,ny=this.ny,omega=1/this.tau;for(let t=0;t<count;t++){this.next.fill(0);for(let y=1;y<ny-1;y++)for(let x=0;x<nx;x++){const i=y*nx+x;if(this.solid[i])continue;let r=0,mx=0,my=0;for(let q=0;q<9;q++){let f=this.f[i*9+q];r+=f;mx+=CX[q]*f;my+=CY[q]*f;}const u=(mx+this.force/2)/r,v=my/r;for(let q=0;q<9;q++){const cu=CX[q]*u+CY[q]*v;const source=W[q]*(1-omega/2)*(3*(CX[q]-u)+9*cu*CX[q])*this.force;const post=this.f[i*9+q]*(1-omega)+omega*this.equilibrium(q,r,u,v)+source;const j=(y+CY[q])*nx+(x+CX[q]+nx)%nx;if(this.solid[j])this.next[i*9+OP[q]]=post;else this.next[j*9+q]=post;}}[this.f,this.next]=[this.next,this.f];this.t++;}this.fields();}
}
root.D2Q9=D2Q9;if(typeof module!=='undefined')module.exports=D2Q9;
})(globalThis);
