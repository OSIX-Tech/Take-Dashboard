import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

const AnimatedLayout = ({ children }) => {
  const containerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Page enter animation - simple fade in
    const tl = gsap.timeline();
    
    tl.fromTo(container,
      { 
        opacity: 0
      },
      { 
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      }
    );

    // Animate children elements with class 'animate-item' - simple fade
    const elements = container.querySelectorAll('.animate-item');
    if (elements.length > 0) {
      tl.fromTo(elements,
        {
          opacity: 0
        },
        {
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out'
        },
        '-=0.2'
      );
    }

    return () => {
      tl.kill();
    };
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
};

export default AnimatedLayout;