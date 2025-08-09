import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Slow fade-in from top animation for page headers
export const usePageHeader = () => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(element,
      { 
        opacity: 0, 
        y: -80,
        scale: 1
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 1.8,
        ease: 'power2.out'
      }
    );
  }, []);

  return ref;
};

// Slow staggered animation for list items
export const useListAnimation = (selector = '.list-item') => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const items = element.querySelectorAll(selector);
    
    gsap.fromTo(items,
      { 
        opacity: 0, 
        y: -50
      },
      { 
        opacity: 1, 
        y: 0,
        duration: 1.2,
        stagger: 0.25,
        ease: 'power2.out',
        delay: 0.3
      }
    );
  }, [selector]);

  return ref;
};

// Slow scroll-triggered animations
export const useScrollAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(element,
      { 
        opacity: 0, 
        y: -60
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          end: 'bottom 10%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return ref;
};

// Card grid animation
export const useCardGrid = () => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const cards = element.querySelectorAll('.card-item');
    
    cards.forEach((card, index) => {
      gsap.fromTo(card,
        { 
          opacity: 0, 
          y: -70,
          scale: 1
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          delay: index * 0.3,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return ref;
};