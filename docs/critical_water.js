(function(root){
'use strict';
const TC=1/(2*Math.log(1+Math.sqrt(2)));
function site(k,p,L){const y=Math.floor(k/(L/2));return 2*k+((y+p)&1);}
function bonds(a,i,L){const x=i%L,y=Math.floor(i/L);return a[y*L+(x+1)%L]+a[y*L+(x+L-1)%L]+a[(i+L)%a.length]+a[(i+a.length-L)%a.length];}
function cpuPass(a,L,T,mu,p,mask,rng=Math.random){for(let k=0;k<a.length/2;k++){const i=site(k,p,L);if(mask){const j=site(k^mask,p,L);if(i>=j||a[i]===a[j])continue;const d=(a[i]-a[j])*(bonds(a,i,L)-bonds(a,j,L));if(d<=0||rng()<Math.exp(-d/T))[a[i],a[j]]=[a[j],a[i]];}else{const d=(2*a[i]-1)*(bonds(a,i,L)+mu);if(d<=0||rng()<Math.exp(-d/T))a[i]^=1;}}}
const shader=`
struct Params { side:u32, parity:u32, mask:u32, seed:u32, T:f32, mu:f32 }
@group(0) @binding(0) var<storage,read_write> a:array<u32>;
@group(0) @binding(1) var<uniform> p:Params;
fn hash(input:u32)->u32 { var v=input;v=(v^(v>>16u))*0x7feb352du;v=(v^(v>>15u))*0x846ca68bu;return v^(v>>16u); }
fn site(k:u32)->u32{return 2u*k+((k/(p.side/2u)+p.parity)&1u);}
fn bonds(i:u32)->f32{let L=p.side;let x=i%L;let y=i/L;let N=L*L;return f32(a[y*L+(x+1u)%L]+a[y*L+(x+L-1u)%L]+a[(i+L)%N]+a[(i+N-L)%N]);}
@compute @workgroup_size(128) fn step(@builtin(global_invocation_id) id:vec3<u32>){
 let k=id.x;if(k>=p.side*p.side/2u){return;}let i=site(k);let r=f32(hash(k^p.seed)>>8u)/16777216.0;
 if(p.mask==0u){let n=a[i];let d=(2.0*f32(n)-1.0)*(bonds(i)+p.mu);if(d<=0.0||r<exp(-d/p.T)){a[i]=1u-n;}return;}
 let j=site(k^p.mask);if(i>=j){return;}let u=a[i];let v=a[j];if(u==v){return;}let d=(f32(u)-f32(v))*(bonds(i)-bonds(j));if(d<=0.0||r<exp(-d/p.T)){a[i]=v;a[j]=u;}
}`;
class CriticalGas{
 constructor(L){this.L=L;this.a=Uint32Array.from({length:L*L},()=>Math.random()<.5?1:0);this.sweeps=0;}
 async gpu(device){const bytes=this.a.byteLength,U=GPUBufferUsage;this.device=device;this.state=device.createBuffer({size:bytes,usage:U.STORAGE|U.COPY_DST|U.COPY_SRC});this.read=device.createBuffer({size:bytes,usage:U.MAP_READ|U.COPY_DST});this.stride=device.limits.minUniformBufferOffsetAlignment;this.params=device.createBuffer({size:this.stride*32,usage:U.UNIFORM|U.COPY_DST});const layout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:'storage'}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:'uniform',hasDynamicOffset:true,minBindingSize:24}}]});const mod=device.createShaderModule({code:shader});const info=await mod.getCompilationInfo();if(info.messages.some(m=>m.type==='error'))throw Error(info.messages.map(m=>m.message).join('\n'));this.pipeline=await device.createComputePipelineAsync({layout:device.createPipelineLayout({bindGroupLayouts:[layout]}),compute:{module:mod,entryPoint:'step'}});this.group=device.createBindGroup({layout,entries:[{binding:0,resource:{buffer:this.state}},{binding:1,resource:{buffer:this.params,size:24}}]});device.queue.writeBuffer(this.state,0,this.a);}
 async advance(T,mu,swaps=true,count=4){const passes=[];for(let t=0;t<count;t++){const first=Math.random()<.5?0:1;for(const p of [first,1-first]){passes.push([p,0]);if(swaps)passes.push([p,1+Math.floor(Math.random()*(this.a.length/2-1))]);}}if(this.pipeline){const d=this.device,enc=d.createCommandEncoder(),params=new ArrayBuffer(this.stride*passes.length);passes.forEach(([p,mask],k)=>{const offset=k*this.stride,u=new Uint32Array(params,offset,4),f=new Float32Array(params,offset+16,2);u.set([this.L,p,mask,Math.floor(Math.random()*4294967296)]);f.set([T,mu]);});d.queue.writeBuffer(this.params,0,params);passes.forEach((_,k)=>{const pass=enc.beginComputePass();pass.setPipeline(this.pipeline);pass.setBindGroup(0,this.group,[k*this.stride]);pass.dispatchWorkgroups(Math.ceil(this.a.length/256));pass.end();});enc.copyBufferToBuffer(this.state,0,this.read,0,this.a.byteLength);d.queue.submit([enc.finish()]);await this.read.mapAsync(GPUMapMode.READ);this.a.set(new Uint32Array(this.read.getMappedRange()));this.read.unmap();}else for(const [p,mask] of passes)cpuPass(this.a,this.L,T,mu,p,mask);this.sweeps+=count;}
 dispose(){for(const b of [this.state,this.read,this.params])b?.destroy();}
}
function clusters(a,L,threshold,block=8){const M=L/block,v=new Float32Array(M*M),used=new Uint8Array(M*M),sizes=[];let total=0;for(let y=0;y<L;y++)for(let x=0;x<L;x++){const n=a[y*L+x];v[Math.floor(y/block)*M+Math.floor(x/block)]+=n/(block*block);total+=n;}for(let i=0;i<v.length;i++)if(!used[i]&&v[i]>=threshold){const queue=[i];used[i]=1;for(let j=0;j<queue.length;j++){const k=queue[j],x=k%M,y=Math.floor(k/M);for(const n of [y*M+(x+1)%M,y*M+(x+M-1)%M,(k+M)%v.length,(k+v.length-M)%v.length])if(!used[n]&&v[n]>=threshold){used[n]=1;queue.push(n);}}sizes.push(queue.length);}return {density:total/a.length,v,M,sizes,largest:sizes.reduce((a,b)=>Math.max(a,b),0)};}
const api={TC,CriticalGas,cpuPass,clusters,site,bonds,shader};root.CriticalWater=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
