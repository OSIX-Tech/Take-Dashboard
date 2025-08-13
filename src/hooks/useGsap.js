import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGsapFadeIn = (delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(element,
      { opacity: 0, y: -40 },  // Start from above
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.2,  // Slower animation
        delay,
        ease: "power2.out"
      }
    );
  }, [delay]);

  return ref;
};

export const useGsapSlideIn = (direction = 'down', delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const startX = direction === 'left' ? -100 : direction === 'right' ? 100 : 0;
    const startY = direction === 'up' ? 100 : direction === 'down' ? -100 : 0;

    gsap.fromTo(element,
      { x: startX, y: startY, opacity: 0 },
      { 
        x: 0, 
        y: 0, 
        opacity: 1, 
        duration: 1.5,  // Much slower
        delay,
        ease: "power2.out"
      }
    );
  }, [direction, delay]);

  return ref;
};

export const useGsapScale = (delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(element,
      { scale: 0.95, opacity: 0, y: -30 },  // Start from above with slight scale
      { 
        scale: 1, 
        opacity: 1, 
        y: 0,
        duration: 1,  // Slower animation
        delay,
        ease: "power2.out"
      }
    );
  }, [delay]);

  return ref;
};

export const useGsapScrollTrigger = (animation = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const defaultAnimation = {
      opacity: 0,
      y: -60,  // Start from above
      ...animation
    };

    gsap.fromTo(element, defaultAnimation, {
      opacity: 1,
      y: 0,
      duration: 1.5,  // Much slower
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse"
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return ref;
};

export const useGsapStagger = (selector, delay = 0.2) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const children = element.querySelectorAll(selector);
    
    gsap.fromTo(children,
      { opacity: 0, y: -40 },  // Start from above
      { 
        opacity: 1, 
        y: 0, 
        duration: 1,  // Slower animation
        stagger: delay,  // More delay between items
        ease: "power2.out"
      }
    );
  }, [selector, delay]);

  return ref;
};

// useGsapHover removed for tablet optimization
export const useGsapHover = () => {
  const ref = useRef(null);
  // Hover effects disabled for tablet optimization
  return ref;
};