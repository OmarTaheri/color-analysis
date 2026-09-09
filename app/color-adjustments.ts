export type ColourPoint={hue:number;saturation:number};
export const hueDistance=(a:number,b:number)=>Math.abs(((a-b+540)%360)-180);
export function rgbToHsv(r:number,g:number,b:number){
 r/=255;g/=255;b/=255;const value=Math.max(r,g,b),min=Math.min(r,g,b),delta=value-min;
 let hue=delta===0?0:value===r?((g-b)/delta)%6:value===g?(b-r)/delta+2:(r-g)/delta+4;
 return {hue:(hue*60+360)%360,saturation:value===0?0:delta/value,value};
}
export function pointFromPosition(x:number,y:number,cx:number,cy:number,radius:number,previousHue=0):ColourPoint{
 const dx=x-cx,dy=cy-y,distance=Math.hypot(dx,dy);
 return {hue:distance<.01?previousHue:(Math.atan2(dx,dy)*180/Math.PI+360)%360,saturation:Math.min(1,distance/radius)};
}
export function pointPosition(point:ColourPoint){const angle=point.hue*Math.PI/180;return {x:50+46*point.saturation*Math.sin(angle),y:50-46*point.saturation*Math.cos(angle)}};
export function sampleColours(pixels:Uint8ClampedArray):ColourPoint[]{
 const bins=Array.from({length:36},()=>({weight:0,x:0,y:0,s:0,count:0}));let count=0;
 for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<128)continue;const p=rgbToHsv(pixels[i],pixels[i+1],pixels[i+2]);if(p.saturation<.10||p.value<.08)continue;
  const b=bins[Math.floor(p.hue/10)%36],w=p.saturation*p.value;b.weight+=w;b.x+=Math.cos(p.hue*Math.PI/180)*w;b.y+=Math.sin(p.hue*Math.PI/180)*w;b.s+=p.saturation*w;b.count++;count++;
 }
 const groups=bins.map((_,i)=>{const neighbours=[bins[(i+35)%36],bins[i],bins[(i+1)%36]];return neighbours.reduce((a,b)=>({weight:a.weight+b.weight,x:a.x+b.x,y:a.y+b.y,s:a.s+b.s,count:a.count+b.count}),{weight:0,x:0,y:0,s:0,count:0})}).sort((a,b)=>b.weight-a.weight);
 const selected:ColourPoint[]=[];
 for(const g of groups){if(g.weight===0||g.weight<groups[0].weight*.06||g.count<count*.008)continue;
  const hue=(Math.atan2(g.y,g.x)*180/Math.PI+360)%360;
  if(selected.every(p=>hueDistance(p.hue,hue)>32))selected.push({hue,saturation:g.s/g.weight});if(selected.length===4)break;
 }
 return selected.length?selected:[{hue:0,saturation:0}];
}
export function recolourPixels(source:Uint8ClampedArray,from:ColourPoint[],to:ColourPoint[]){
 const result=new Uint8ClampedArray(source);
 if(from.every((p,i)=>p.hue===to[i].hue&&p.saturation===to[i].saturation))return result;
 const shifts=from.map((p,i)=>({hue:((to[i].hue-p.hue+540)%360)-180,saturation:to[i].saturation-p.saturation}));
 const table=Array.from({length:360},(_,h)=>{let hue=0,saturation=0,weight=0;from.forEach((p,i)=>{const w=Math.exp(-Math.pow(hueDistance(h,p.hue)/30,2)/2);hue+=w*shifts[i].hue;saturation+=w*shifts[i].saturation;weight+=w});return {hue:hue/Math.max(1,weight),saturation:saturation/Math.max(1,weight)}});
 for(let i=0;i<source.length;i+=4){const p=rgbToHsv(source[i],source[i+1],source[i+2]),shift=table[Math.round(p.hue)%360];
  const influence=Math.min(1,p.saturation/.1),sat=Math.max(0,Math.min(1,p.saturation+shift.saturation*influence));
  const h=(p.hue+shift.hue+360)%360,delta=p.value*sat,min=p.value-delta,sector=h/60,x=delta*(1-Math.abs(sector%2-1));
  const rgb=sector<1?[delta,x,0]:sector<2?[x,delta,0]:sector<3?[0,delta,x]:sector<4?[0,x,delta]:sector<5?[x,0,delta]:[delta,0,x];
  for(let c=0;c<3;c++)result[i+c]=Math.round((rgb[c]+min)*255);
 }return result;
}
