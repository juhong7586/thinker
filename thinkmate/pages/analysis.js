import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Analysis.module.css'
import homeStyles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import SelectScaffold from '../components/selectScaffold'
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


  // Bubbles component handles ambient particles (keeps this page simple)

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
      
  <div className={styles.wrapper} ref={containerRef} style={{
      backgroundImage: "url('/water.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
    <div className={styles.breathingContainer}>
      <div className={styles.breathingCircle}></div>
      <Bubbles count={particleCount} className="particleContainer" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
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