'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {scenes} from './content';
import raw from './measurements.json';
import {hueFromPoint,paletteHues,recolourPixels} from './color-adjustments';

export default function SceneStudy({scene,palette}:{scene:typeof scenes[number];palette:ReactNode}){
 const m=(raw as Record<string,typeof raw['18']>)[scene.image];
 const hues=useMemo(()=>paletteHues(scene.image===147?[...m.palette,{hue:342,sat:42,share:12}]:m.palette),[m,scene.image]);
 const [targets,setTargets]=useState(hues);
 const [compare,setCompare]=useState(false);
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 const image=useRef<HTMLImageElement>(null),canvas=useRef<HTMLCanvasElement>(null),wheel=useRef<HTMLDivElement>(null);
 const source=useRef<ImageData|null>(null);
 const changed=targets.some((h,i)=>h!==hues[i]);
 const update=(index:number,hue:number)=>{if(!ready)return;setCompare(false);setTargets(t=>t.map((v,i)=>i===index?hue:v))};
 const prepare=()=>{
  const im=image.current,c=canvas.current;if(!im||!c)return;
  try{const scale=Math.min(1,900/im.naturalWidth);c.width=Math.round(im.naturalWidth*scale);c.height=Math.round(im.naturalHeight*scale);
   const ctx=c.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(im,0,0,c.width,c.height);source.current=ctx.getImageData(0,0,c.width,c.height);setReady(true);
  }catch{setFailed(true)}
 };
 useEffect(()=>{if(!ready||!source.current)return;const id=requestAnimationFrame(()=>{const base=source.current!,ctx=canvas.current?.getContext('2d');if(ctx)ctx.putImageData(new ImageData(recolourPixels(base.data,hues,targets),base.width,base.height),0,0)});return()=>cancelAnimationFrame(id)},[hues,targets,ready]);
 const move=(index:number,x:number,y:number)=>{const r=wheel.current?.getBoundingClientRect();if(r)update(index,hueFromPoint(x,y,r.left+r.width/2,r.top+r.height/2))};
 return <div className="scene-study">
  <div className="scene-preview"><img ref={image} className="dialog-image" src={'/stills/'+scene.image+'.webp'} alt={scene.location} onLoad={prepare} style={{display:changed&&!compare&&ready?'none':'block'}}/><canvas ref={canvas} role="img" aria-label={scene.location+' with your colour changes'} style={{display:changed&&!compare&&ready?'block':'none'}}/><div className="popup-palette"><h4>Main colours in the original picture</h4>{palette}</div></div>
  <div className="adjustment-heading"><h3>Try changing the colours</h3><button type="button" onClick={()=>{setTargets([...hues]);setCompare(false)}}>Reset</button></div>
  <p className="adjustment-help">Drag a dot around the wheel to change that colour in the picture.</p>
  <div className="adjustment-controls">
   <div className="hue-control"><div ref={wheel} className="adjustment-wheel" role="group" aria-label="Picture colours">
    <div className="adjustment-wheel-hole"><span>COLOUR</span><b>360°</b></div>
    <svg viewBox="0 0 100 100" aria-hidden="true">{targets.map((h,i)=><line key={i} x1="50" y1="50" x2={50+40*Math.sin(h*Math.PI/180)} y2={50-40*Math.cos(h*Math.PI/180)}/>)}</svg>
    {targets.map((h,i)=><button type="button" role="slider" className="adjustment-wheel-dot" key={i} disabled={!ready} aria-label={'Colour '+(i+1)} aria-valuemin={0} aria-valuemax={359} aria-valuenow={h} aria-valuetext={h+' degrees'} style={{left:(50+40*Math.sin(h*Math.PI/180))+'%',top:(50-40*Math.cos(h*Math.PI/180))+'%'}} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);move(i,e.clientX,e.clientY)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(i,e.clientX,e.clientY)}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onKeyDown={e=>{const step=e.shiftKey?10:1;let value=h;if(e.key==='ArrowRight'||e.key==='ArrowUp')value=(h+step)%360;else if(e.key==='ArrowLeft'||e.key==='ArrowDown')value=(h-step+360)%360;else if(e.key==='Home')value=0;else if(e.key==='End')value=359;else return;e.preventDefault();update(i,value)}}/>)}
   </div><p>{scene.scheme}</p></div>
   {failed&&<p role="status">The colour editor could not load. Please reopen this scene.</p>}
   <div className="original-metrics"><h4>Original picture</h4>{[['Colour strength',m.saturation],['Brightness',m.brightness],['Contrast',m.contrast]].map(([label,value])=><div className="original-metric" key={label}><span>{label}<b>{value}<small> / 100</small></b></span><div className="original-metric-track" aria-hidden="true"><i style={{width:value+'%'}}/></div></div>)}</div>
  </div>
  <button type="button" className="compare-original" aria-pressed={compare} onClick={()=>setCompare(!compare)}>{compare?'Back to my changes':'Show original'}</button>
  <div className="scene-reading"><h4>What this shows about the story</h4><p>{scene.detail}</p><h4>What to look at</h4><p>{scene.evidence}</p><h4>Why the story matters</h4><p>{scene.counter}</p></div>
 </div>
}
