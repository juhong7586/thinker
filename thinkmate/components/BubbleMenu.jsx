import { useState, useRef, useEffect } from 'react';

import styles from '../styles/Rational.module.css';

const DEFAULT_ITEMS = [
  {
    label: 'home',
    href: '#',
    ariaLabel: 'Home',
    rotation: -8,
    hoverStyles: { bgColor: '#4B252A', textColor: '#ffffff' }
  },
  {
    label: 'about',
    href: '#',
    ariaLabel: 'About',
    rotation: 8,
    hoverStyles: { bgColor: '#4E3727', textColor: '#ffffff' }
  },
  {
    label: 'projects',
    href: '#',
    ariaLabel: 'Documentation',
    rotation: 8,
    hoverStyles: { bgColor: '#19322D', textColor: '#ffffff' }
  },
  {
    label: 'blog',
    href: '#',
    ariaLabel: 'Blog',
    rotation: 8,
    hoverStyles: { bgColor: '#284221', textColor: '#ffffff' }
  },
  {
    label: 'contact',
    href: '#',
    ariaLabel: 'Contact',
    rotation: -8,
    hoverStyles: { bgColor: '#D1B174', textColor: '#ffffff' }
  }
];

export default function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  menuAriaLabel = 'Toggle menu',
  menuBg = '#fff',
  menuContentColor = '#111',
  useFixedPosition = false,
  alwaysVisible = false,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(Boolean(alwaysVisible));
  const [showOverlay, setShowOverlay] = useState(Boolean(alwaysVisible));

  const overlayRef = useRef(null);
  const bubblesRef = useRef([]);
  const labelRefs = useRef([]);
  const gsapRef = useRef(null);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;
  const containerClassName = [styles['bubble-menu'], useFixedPosition ? styles.fixed : styles.absolute, className]
    .filter(Boolean)
    .join(' ');

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);

    if (!overlay || !bubbles.length) return;

    let active = true;

    const init = async () => {
      if (!gsapRef.current) {
        try {
          const mod = await import('gsap');
          gsapRef.current = mod.gsap;
        } catch (e) {
          // If dynamic import fails, bail silently (no animation)
          console.warn('GSAP failed to load dynamically', e);
          return;
        }
      }

      if (!active) return;
      const gs = gsapRef.current;

      if (isMenuOpen) {
        gs.set(overlay, { display: 'flex' });
        gs.killTweensOf([...bubbles, ...labels]);
        gs.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
        gs.set(labels, { y: 100, autoAlpha: 0 });

        bubbles.forEach((bubble, i) => {
          const delay = i * staggerDelay + gs.utils.random(-0.05, 0.05);
          const tl = gs.timeline({ delay });

          tl.to(bubble, {
            scale: 1,
            duration: animationDuration,
            ease: animationEase
          });
          if (labels[i]) {
            tl.to(
              labels[i],
              {
                y: 0,
                autoAlpha: 1,
                duration: animationDuration,
                ease: 'power3.out'
              },
              `-=${animationDuration * 0.9}`
            );
          }
        });
      } else if (showOverlay) {
        gs.killTweensOf([...bubbles, ...labels]);
        gs.to(labels, {
          y: 24,
          autoAlpha: 0,
          duration: 0.2,
          ease: 'power3.in'
        });
        gs.to(bubbles, {
          scale: 0,
          duration: 0.2,
          ease: 'power3.in',
          onComplete: () => {
            gs.set(overlay, { display: 'none' });
            setShowOverlay(false);
          }
        });
      }
    };

    init();
    return () => { active = false; };
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleResize = async () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        const isDesktop = window.innerWidth >= 900;

        if (!gsapRef.current) {
          try {
            const mod = await import('gsap');
            gsapRef.current = mod.gsap;
          } catch (e) {
            return;
          }
        }
        const gs = gsapRef.current;

        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = isDesktop ? (item.rotation ?? 0) : 0;
            gs.set(bubble, { rotation });
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen, menuItems]);

  // compute an inline override style when the menu should always be visible
  const overlayInlineStyle = alwaysVisible
    ? { position: 'relative', inset: 'auto', display: 'flex', pointerEvents: 'auto' }
    : undefined;

  return (
    <>

        <div
          ref={overlayRef}
          className={`${styles['bubble-menu-items']} ${useFixedPosition ? styles.fixed : styles.absolute}`}
          aria-hidden={!isMenuOpen && !alwaysVisible}
          style={overlayInlineStyle}
        >
          <ul className={styles['pill-list']} role="menu" aria-label="Menu links">
            {menuItems.map((item, idx) => (
              <li key={idx} role="none" className={styles['pill-col']}>
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className={styles['pill-link']}
                  style={{
                    '--item-rot': `${item.rotation ?? 0}deg`,
                    '--pill-bg': menuBg,
                    '--pill-color': menuContentColor,
                    '--hover-bg': item.hoverStyles?.bgColor || '#f3f4f6',
                    '--hover-color': item.hoverStyles?.textColor || menuContentColor
                  }}
                  ref={el => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <span
                    className={styles['pill-label']}
                    ref={el => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

    </>
  );
}
