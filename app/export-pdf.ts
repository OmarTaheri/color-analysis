'use client';
import {toCanvas,getFontEmbedCSS} from 'html-to-image';
import {jsPDF} from 'jspdf';

/** Capture the rendered website, rather than maintaining a second PDF design. */
export async function exportWebsitePDF(source:HTMLElement){
 await document.fonts.ready;
 const width=Math.round(source.getBoundingClientRect().width);
 const clone=source.cloneNode(true) as HTMLElement;
 clone.classList.add('pdf-export-surface');
 clone.removeAttribute('data-opening');
 clone.setAttribute('aria-hidden','true');
 clone.inert=true;
 Object.assign(clone.style,{position:'absolute',left:'-100000px',top:'0',width:`${width}px`,pointerEvents:'none'});
 clone.querySelectorAll('.opening,.cursor,.skip-link,.notice,.menu-panel,[data-slot="dialog-content"],[data-slot="dialog-overlay"]').forEach(n=>n.remove());
 clone.querySelectorAll<HTMLElement>('*').forEach(el=>{
  el.style.animation='none';el.style.transition='none';
  if(el.classList.contains('reveal')||el.classList.contains('intro-line')||el.classList.contains('hero-word')){el.style.opacity='1';el.style.transform='none'}
  if(el.classList.contains('intro-media')){el.style.removeProperty('width');el.style.transform='none'}
  if(el.classList.contains('scene-image')||el.parentElement?.classList.contains('scene-image')||el.classList.contains('hero-frame'))el.style.transform='none';
 });
 const sourceSlides=Array.from(source.querySelectorAll<HTMLElement>('.hero-slide'));
 const visible=sourceSlides.reduce((best,el,i)=>Number(getComputedStyle(el).opacity)>Number(getComputedStyle(sourceSlides[best]).opacity)?i:best,0);
 clone.querySelectorAll<HTMLElement>('.hero-slide').forEach((el,i)=>{if(i!==visible)el.remove();else{el.style.opacity='1';el.style.transform='none';el.querySelector<HTMLElement>('.hero-slide-inner')!.style.transform='none'}});
 clone.querySelectorAll('video').forEach(video=>{const image=document.createElement('img');image.src=video.poster;image.alt=video.getAttribute('aria-label')||'Film frame';image.className=video.className;image.style.cssText='width:100%;height:100%;object-fit:cover;display:block';video.replaceWith(image)});
 clone.querySelectorAll('canvas,iframe').forEach(n=>n.remove());
 clone.querySelectorAll('.hero-tabs button').forEach(n=>{(n as HTMLElement).style.transform='none'});
 clone.querySelectorAll('.hero-copy p').forEach(n=>{(n as HTMLElement).style.opacity='1'});
 clone.querySelectorAll('button[disabled]').forEach(n=>n.removeAttribute('disabled'));
 clone.querySelectorAll('button.export,.footer .square-button,.menu-toggle,.image-open').forEach(n=>n.remove());
 clone.querySelectorAll('details').forEach(n=>n.open=true);
 const intro=document.createElement('section');
 intro.className='pdf-intro pdf-section';
 intro.innerHTML='<div><h2>Explore the interactive website.</h2><p>Move the colours, open the scenes and watch the video online. Click the link or scan the QR code for the full experience.</p><a href="https://film.omartaheri.com">https://film.omartaheri.com</a></div><a class="pdf-qr-link" href="https://film.omartaheri.com"><img src="/qr.svg" alt="Scan to open the website" width="160" height="160"/></a>';
 clone.querySelector('main')!.prepend(intro);
 clone.querySelector('.youtube-video')?.setAttribute('data-pdf-link','https://www.youtube.com/watch?v=GBRUa4TZqHk');
 const videoLabel=clone.querySelector('.youtube-play b');if(videoLabel)videoLabel.textContent='Open video on YouTube';
 const gallery=clone.querySelector<HTMLElement>('.scenes');
 if(gallery){
  const cards=Array.from(gallery.querySelectorAll<HTMLElement>('.scene-card'));
  for(let i=0;i<cards.length;i+=2){
   const sheet=gallery.cloneNode(false) as HTMLElement;sheet.removeAttribute('id');sheet.classList.add('pdf-scene-page');
   const heading=gallery.querySelector('.section-heading')!.cloneNode(true);sheet.appendChild(heading);
   const grid=document.createElement('div');grid.className='scene-grid';cards.slice(i,i+2).forEach(card=>grid.appendChild(card));sheet.appendChild(grid);
   gallery.before(sheet);
  }
  gallery.remove();
 }
 document.body.appendChild(clone);
 try{
  await Promise.all(Array.from(clone.querySelectorAll('img')).map(im=>{im.loading='eager';return im.decode().catch(()=>{throw new Error('An image could not be loaded for PDF export')})}));
  const fontEmbedCSS=await getFontEmbedCSS(clone);
  const sections=Array.from(clone.querySelectorAll<HTMLElement>('.pdf-section'));
  let pdf:jsPDF|undefined;
  for(const section of sections){
   const bounds=section.getBoundingClientRect();const w=Math.ceil(bounds.width),h=Math.ceil(bounds.height);
   if(!w||!h)continue;
   const canvas=await toCanvas(section,{width:w,height:h,pixelRatio:Math.min(1.5,14000/h),fontEmbedCSS,backgroundColor:getComputedStyle(section).backgroundColor==='rgba(0, 0, 0, 0)'?'#efeeec':getComputedStyle(section).backgroundColor,skipAutoScale:false});
   const pageW=297,pageH=297*h/w;const orientation=pageW>pageH?'landscape':'portrait';
   if(!pdf)pdf=new jsPDF({orientation,unit:'mm',format:[pageW,pageH],compress:true});else pdf.addPage([pageW,pageH],orientation);
   pdf.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',0,0,pageW,pageH,undefined,'FAST');
   // Raster artwork needs explicit PDF link annotations for clickable areas.
   section.querySelectorAll<HTMLElement>('a[href],[data-pdf-link]').forEach(el=>{
    const url=el.getAttribute('data-pdf-link')||el.getAttribute('href');
    if(!url||!/^https?:\/\//.test(url))return;
    const r=el.getBoundingClientRect();if(!r.width||!r.height)return;
    pdf!.link((r.left-bounds.left)*pageW/w,(r.top-bounds.top)*pageH/h,r.width*pageW/w,r.height*pageH/h,{url});
   });
   canvas.width=1;canvas.height=1;
  }
  if(!pdf)throw new Error('No website sections to export');
  pdf.setProperties({title:'The Wolf of Wall Street — Omar Taheri',subject:'The Wolf of Wall Street: colour analysis',creator:'The Colour of Excess / website export'});
  pdf.save('The Wolf of Wall Street — Omar Taheri.pdf');
  return URL.createObjectURL(pdf.output('blob'));
 }finally{clone.remove()}
}
