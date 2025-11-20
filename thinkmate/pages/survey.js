import Head from 'next/head'
import styles from '../styles/Analysis.module.css'
import { useEffect, useState, useRef } from 'react'
import SurveyForm from '../components/SurveyForm'
import Bubbles from '../components/bubbles'

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


  // Use Bubbles component to render ambient particles (keeps this page simple)

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
      
  <div
    className={styles.wrapper}
    ref={containerRef}
    style={{
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}
  >
        <div className={styles.breathingContainer}>
          <div className={styles.breathingCircle}></div>
          <Bubbles count={particleCount} className="particleContainer" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
          <SurveyForm width={size.width} height={size.height} />
        </div>
      </div>
      </>
    )
}