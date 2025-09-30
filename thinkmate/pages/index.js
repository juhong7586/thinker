import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import InterestVisualization from '../components/visualization/InterestVisualization'


export default function Home() {
    const containerRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 600 });

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
        <title>ThinkMate - AI 협업 아이디어 플랫폼</title>
        <meta name="description" content="학생들의 관심사를 시각화하고 AI가 프로젝트 아이디어를 제안하는 협업 플랫폼" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <main className={styles.mainContent}>
          <InterestVisualization width={size.width} height={size.height} />
 
        </main>
        
        
      </div>
      
        </>
    )
}