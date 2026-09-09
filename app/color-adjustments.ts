export type Adjustments = {hue:number;saturation:number;brightness:number;contrast:number};
export const original:Adjustments = {hue:0,saturation:100,brightness:100,contrast:100};
export function colourFilter(values:Adjustments){
 return `hue-rotate(${values.hue}deg) saturate(${values.saturation}%) brightness(${values.brightness}%) contrast(${values.contrast}%)`;
}
export function hueFromPoint(x:number,y:number,cx:number,cy:number){
 return (Math.round(Math.atan2(x-cx,cy-y)*180/Math.PI)+360)%360;
}
