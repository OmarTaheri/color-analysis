export function hueFromPoint(x:number,y:number,cx:number,cy:number){
 return (Math.round(Math.atan2(x-cx,cy-y)*180/Math.PI)+360)%360;
}
export const hueDistance=(a:number,b:number)=>Math.abs(((a-b+540)%360)-180);
export function paletteHues(palette:{hue:number;sat:number;share:number}[]){
 const selected:number[]=[];
 for(const p of [...palette].sort((a,b)=>b.share-a.share)){
  if(p.sat>=12&&selected.every(h=>hueDistance(h,p.hue)>=35))selected.push(p.hue);
 }
 return selected.length?selected.slice(0,4):[palette[0]?.hue??0];
}
export function recolourPixels(source:Uint8ClampedArray,from:number[],to:number[]){
 const result=new Uint8ClampedArray(source);
 if(from.every((h,i)=>h===to[i]))return result;
 const shifts=from.map((h,i)=>((to[i]-h+540)%360)-180);
 const table=Array.from({length:360},(_,h)=>{
  let total=0,weight=0;
  from.forEach((f,i)=>{const w=Math.exp(-Math.pow(hueDistance(h,f)/35,2)/2);total+=w*shifts[i];weight+=w});
  return (h+total/Math.max(1,weight)+360)%360;
 });
 for(let i=0;i<source.length;i+=4){
  const r=source[i]/255,g=source[i+1]/255,b=source[i+2]/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  if(delta===0)continue;
  let h=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;
  h=(h*60+360)%360;
  const sector=table[Math.round(h)%360]/60,x=delta*(1-Math.abs(sector%2-1));
  const rgb=sector<1?[delta,x,0]:sector<2?[x,delta,0]:sector<3?[0,delta,x]:sector<4?[0,x,delta]:sector<5?[x,0,delta]:[delta,0,x];
  for(let c=0;c<3;c++)result[i+c]=Math.round((rgb[c]+min)*255);
 }
 return result;
}
