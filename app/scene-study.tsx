'use client';
import {useEffect,useRef,useState} from 'react';
import {scenes} from './content';
import raw from './measurements.json';
import mainColours from './scene-colours.json';
import ScenePalette from './scene-palette';
import {pointFromPosition,pointPosition,recolourPixels,swatchPixels,pixelsToHex,type ColourPoint} from './color-adjustments';

export default function SceneStudy({scene}:{scene:typeof scenes[number]}){
 const m=(raw as Record<string,typeof raw['18']>)[scene.image];
 const colours=(mainColours as Record<string,(ColourPoint&{hex:string})[]>)[scene.image];
 const [targets,setTargets]=useState<ColourPoint[]>(colours.map(p=>({...p})));
 const [dragging,setDragging]=useState<number|null>(null);
 const [resetKey,setResetKey]=useState(0);
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 const image=useRef<HTMLImageElement>(null),canvas=useRef<HTMLCanvasElement>(null),wheel=useRef<HTMLDivElement>(null);
 const source=useRef<ImageData|null>(null);
 const swatches=pixelsToHex(recolourPixels(swatchPixels(colours.map(p=>p.hex)),colours,targets));
 const changed=targets.some((p,i)=>p.hue!==colours[i]?.hue||p.saturation!==colours[i]?.saturation);
 const update=(index:number,point:ColourPoint)=>{if(!ready)return;setTargets(t=>t.map((v,i)=>i===index?point:v))};
 const prepare=()=>{
  const im=image.current,c=canvas.current;if(!im||!c)return;
  try{const scale=Math.min(1,900/im.naturalWidth);c.width=Math.round(im.naturalWidth*scale);c.height=Math.round(im.naturalHeight*scale);
   const ctx=c.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(im,0,0,c.width,c.height);source.current=ctx.getImageData(0,0,c.width,c.height);setReady(true);
  }catch{setFailed(true)}
 };
 useEffect(()=>{if(!ready||!source.current)return;const id=requestAnimationFrame(()=>{const base=source.current!,ctx=canvas.current?.getContext('2d');if(ctx)ctx.putImageData(new ImageData(recolourPixels(base.data,colours,targets),base.width,base.height),0,0)});return()=>cancelAnimationFrame(id)},[colours,targets,ready]);
 const move=(index:number,x:number,y:number)=>{const r=wheel.current?.getBoundingClientRect();if(r)update(index,pointFromPosition(x,y,r.left+r.width/2,r.top+r.height/2,r.width*.46,targets[index].hue))};
 return <div className="scene-study">
  <div className="scene-preview"><img ref={image} className="dialog-image" src={'/stills/'+scene.image+'.webp'} alt={scene.location} onLoad={prepare} style={{display:changed&&ready?'none':'block'}}/><canvas ref={canvas} role="img" aria-label={scene.location+' with your colour changes'} style={{display:changed&&ready?'block':'none'}}/><div className="popup-palette"><h4>{changed?'Your colours':'Main colours'}</h4><ScenePalette hexes={swatches}/></div></div>
  <div className="adjustment-heading"><h3>Try changing the colours</h3><button type="button" className="colour-reset" onClick={()=>{setTargets(colours.map(p=>({...p})));setDragging(null);setResetKey(k=>k+1)}}><span key={resetKey} aria-hidden="true">↺</span> Reset</button></div>
  <p className="adjustment-help">Move any dot in any direction. Around the wheel changes the colour; closer to the centre makes it softer.</p>
  <div className="adjustment-controls">
   <div className="hue-control"><div ref={wheel} className="adjustment-wheel" data-dragging={dragging!==null} data-edited={changed} role="group" aria-label="Picture colours">
    <div className="adjustment-wheel-hole"><span>COLOUR</span><b>360°</b></div>
    <svg viewBox="0 0 100 100" aria-hidden="true">{targets.map((p,i)=>{const pos=pointPosition(p);return <line key={i} x1="50" y1="50" x2={pos.x} y2={pos.y}/>})}{targets.length>1&&<polyline points={targets.map(p=>{const pos=pointPosition(p);return pos.x+','+pos.y}).join(' ')} fill="none"/>}</svg>
    {targets.map((p,i)=>{const pos=pointPosition(p);return <button type="button" className="adjustment-wheel-dot" key={i} disabled={!ready} aria-label={'Colour '+(i+1)+': '+Math.round(p.hue)+' degrees, '+Math.round(p.saturation*100)+'% strength. Use arrow keys to move.'} style={{left:pos.x+'%',top:pos.y+'%',background:swatches[i],zIndex:dragging===i?5:2}} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);setDragging(i)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(i,e.clientX,e.clientY)}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);setDragging(null)}} onPointerCancel={()=>setDragging(null)} onLostPointerCapture={()=>setDragging(null)} onKeyDown={e=>{const step=e.shiftKey?5:1;let x=pos.x,y=pos.y;if(e.key==='ArrowRight')x+=step;else if(e.key==='ArrowLeft')x-=step;else if(e.key==='ArrowUp')y-=step;else if(e.key==='ArrowDown')y+=step;else return;e.preventDefault();update(i,pointFromPosition(x,y,50,50,46,p.hue))}}><span>{i+1}</span></button>})}
   </div><p>{scene.scheme}</p><small>{colours.length?colours.length+' colours from this picture':'Loading picture colours…'}</small></div>
   {failed&&<p role="status">The colour editor could not load. Please reopen this scene.</p>}
   <div className="original-metrics"><h4>Original picture</h4>{[['Colour strength',m.saturation],['Brightness',m.brightness],['Contrast',m.contrast]].map(([label,value])=><div className="original-metric" key={label}><span>{label}<b>{value}<small> / 100</small></b></span><div className="original-metric-track" aria-hidden="true"><i style={{width:value+'%'}}/></div></div>)}</div>
  </div>
  <div className="scene-reading"><h4>What this shows about the story</h4><p>{scene.detail}</p><h4>What to look at</h4><p>{scene.evidence}</p><h4>Why the story matters</h4><p>{scene.counter}</p></div>
 </div>
}
