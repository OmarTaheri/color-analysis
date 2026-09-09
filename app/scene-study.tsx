'use client';
import {useState} from 'react';
import {scenes} from './content';
import {colourFilter,hueFromPoint,original,type Adjustments} from './color-adjustments';

export default function SceneStudy({scene}:{scene:typeof scenes[number]}){
 const [values,setValues]=useState<Adjustments>({...original});
 const [compare,setCompare]=useState(false);
 const update=(key:keyof Adjustments,value:number)=>{setCompare(false);setValues(v=>({...v,[key]:value}))};
 const angle=values.hue*Math.PI/180;
 return <div className="scene-study">
  <img className="dialog-image" src={`/stills/${scene.image}.webp`} alt={scene.location} style={{filter:colourFilter(compare?original:values)}}/>
  <div className="adjustment-heading"><h3>Try changing the colours</h3><button type="button" onClick={()=>{setValues({...original});setCompare(false)}}>Reset</button></div>
  <p className="adjustment-help">Move the dot or the sliders to change this picture. At 0° and 100%, you see the original colours.</p>
  <div className="adjustment-controls">
   <div className="hue-control">
    <div className="adjustment-wheel" role="slider" tabIndex={0} aria-label="Colour shift" aria-valuemin={0} aria-valuemax={359} aria-valuenow={values.hue} aria-valuetext={`${values.hue} degrees`} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();update('hue',hueFromPoint(e.clientX,e.clientY,r.left+r.width/2,r.top+r.height/2))}} onPointerMove={e=>{if(!e.currentTarget.hasPointerCapture(e.pointerId))return;const r=e.currentTarget.getBoundingClientRect();update('hue',hueFromPoint(e.clientX,e.clientY,r.left+r.width/2,r.top+r.height/2))}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onKeyDown={e=>{const step=e.shiftKey?10:1;let hue=values.hue;if(e.key==='ArrowRight'||e.key==='ArrowUp')hue=(hue+step)%360;else if(e.key==='ArrowLeft'||e.key==='ArrowDown')hue=(hue-step+360)%360;else if(e.key==='Home')hue=0;else if(e.key==='End')hue=359;else return;e.preventDefault();update('hue',hue)}}>
     <div className="adjustment-wheel-hole"><span>Colour shift</span><b>{values.hue}°</b></div>
     <span className="adjustment-wheel-dot" style={{left:`${50+40*Math.sin(angle)}%`,top:`${50-40*Math.cos(angle)}%`}}/>
    </div>
    <p>Drag the dot to shift the colours.</p>
   </div>
   <div className="adjustment-sliders">{([
    ['saturation','Colour strength','Lower makes the colours softer. Higher makes them stronger.'],
    ['brightness','Brightness','Lower makes the picture darker. Higher makes it lighter.'],
    ['contrast','Contrast','Higher makes the light and dark areas stand apart.']
   ] as const).map(([key,label,help])=><label key={key} className="adjustment-slider"><span>{label}<output>{values[key]}%</output></span><input type="range" min={0} max={200} step={1} value={values[key]} aria-label={label} aria-valuetext={`${values[key]} percent`} onChange={e=>update(key,Number(e.target.value))}/><small>{help}</small></label>)}</div>
  </div>
  <button type="button" className="compare-original" aria-pressed={compare} onClick={()=>setCompare(!compare)}>{compare?'Back to my changes':'Show original'}</button>
  <div className="scene-reading"><h4>What this shows about the story</h4><p>{scene.detail}</p><h4>What to look at</h4><p>{scene.evidence}</p><h4>Why the story matters</h4><p>{scene.counter}</p></div>
 </div>
}
