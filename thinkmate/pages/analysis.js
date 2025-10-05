import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Analysis.module.css'
import homeStyles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import SelectScaffold from '../components/selectScaffold'

export default function Analysis() {
  const containerRef = useRef();
  const [size, setSize] = useState({ width: '97vw', height: '97vh' });
  const [selectedOption, setSelectedOption] = useState(null);
  const question = "What ideas are emerging?";
  const particleCount = 30;

  
  // persist selection
  useEffect(() => {
    try {
      if (selectedOption) localStorage.setItem('analysis.selectedOption', selectedOption);
    } catch (e) {}
  }, [selectedOption]);


  useEffect(() => { 
    // Create ambient floating particles inside the page container (fallback to body)
    // Use a JS-driven RAF loop to update transforms so animation works reliably.
    const parent = containerRef.current || document.body;
    const particleNodes = [];

    // create particles with per-particle motion params
    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.position = 'absolute';
      el.style.left = Math.random() * 100 + '%';
      el.style.top = Math.random() * 100 + '%';
      el.style.width = '4px';
      el.style.height = '4px';
      el.style.background = 'rgba(255, 255, 255, 0.4)';
      el.style.borderRadius = '50%';
      el.style.pointerEvents = 'none';

      // store motion parameters
      const phase = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.8; // Hz-like multiplier
      const amp = 8 + Math.random() * 28; // pixel amplitude

      parent.appendChild(el);
      particleNodes.push({ el, phase, speed, amp });
    }

    let rafId = null;
    const start = performance.now();

    const tick = (now) => {
      const t = (now - start) / 1000; // seconds
      for (const p of particleNodes) {
        const dx = Math.sin(t * p.speed + p.phase) * p.amp;
        const dy = Math.cos(t * (p.speed * 0.9) + p.phase) * (p.amp * 0.7);
        // apply transform; keep left/top as base and move via translate
        p.el.style.transform = `translate(${dx}px, ${dy}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      for (const p of particleNodes) {
        if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
      }
    };
  }, [particleCount]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const set = () => {
      const bb = node.getBoundingClientRect();
      setSize({
        width: Math.max(200, Math.round(bb.width)),
        height: Math.max(200, Math.round(bb.height)),
      });
    };
    set();

    const ro = new ResizeObserver(set);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

    return (
        <>
         <Head>
          
        <title>ThinkMate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
  <div className={styles.wrapper} ref={containerRef}>
  
  <div className={styles.breathingCircle}></div>
        <div className={styles.breathingContainer}>
          <div className={styles.question}>
          {question}
        </div>
        <div className={homeStyles.mainContent} style={{width: '100vw'}}> 
          <div id="selectBox" className={styles.selectBox}>
            <button
              className={`${styles.selectButton} ${selectedOption === 'own' ? styles.selected : ''}`}
              onClick={() => setSelectedOption('own')}
              style={{ color: selectedOption === 'own' ? 'rgba(141, 47, 87, 0.8)' : '' }}
            >I have my own idea</button>

            <button
              className={`${styles.selectButton} ${selectedOption === 'example' ? styles.selected : ''}`}
              onClick={() => setSelectedOption('example')}
              style={{ color: selectedOption === 'example' ? 'rgba(176, 88, 125, 0.8)' : '' }}
            >I need example</button>

            <button
              className={`${styles.selectButton} ${selectedOption === 'none' ? styles.selected : ''}`}
              onClick={() => setSelectedOption('none')}
              style={{ 
                color: selectedOption === 'none' ? 'rgba(210, 138, 168, 0.8)' : '' }}
            >I don't have an idea</button>
          </div>
        </div>
          {/* Pass selection down to scaffold */}
            <SelectScaffold selection={selectedOption} />
          <div>
            <Link href="/result">
              <button className={homeStyles.pageButton} style={{
                position: 'absolute',
                width: '12rem',
                height: '3rem',
                bottom: '11rem',
                right: '3rem',
                fontFamily: 'Georgia, Times New Roman, Times, serif',
              }}>Let's get started</button>
            </Link>
          </div>
        </div>
      </div>
      </>
    )
}