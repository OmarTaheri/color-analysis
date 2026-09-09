import gsap from 'gsap';
import {CustomEase} from 'gsap/CustomEase';

export function heroEase(){
 gsap.registerPlugin(CustomEase);
 CustomEase.create('slideshow-wipe','0.625, 0.05, 0, 1');
}

/** Keep both images moving until the shared edge has cleared the viewport. */
export function transitionHero(before:HTMLElement,after:HTMLElement,direction:number,done:()=>void){
 const outgoing=before.querySelector('.hero-slide-inner');
 const incoming=after.querySelector('.hero-slide-inner');
 gsap.set(after,{opacity:1,zIndex:2});
 gsap.set(before,{zIndex:1});
 return gsap.timeline({defaults:{duration:1.5,ease:'slideshow-wipe'},onComplete:()=>{
  gsap.set(before,{opacity:0,xPercent:0});
  gsap.set(outgoing,{xPercent:0});
  gsap.set(after,{zIndex:1});
  done();
 }})
 .to(before,{xPercent:-direction*100},0)
 .to(outgoing,{xPercent:direction*75},0)
 .fromTo(after,{xPercent:direction*100},{xPercent:0},0)
 .fromTo(incoming,{xPercent:-direction*75},{xPercent:0},0);
}
