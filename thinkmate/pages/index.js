import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import InterestVisualization from '../components/visualization/InterestVisualization'
import { useRouter } from 'next/router'


function SignedInNameBox({ signedUser, onLogout }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div onClick={() => setOpen(v => !v)} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.95)', padding: '0.5rem 0.75rem', borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{signedUser?.user?.name || 'Student'}</div>
        <div style={{ fontSize: '0.72rem', color: '#666' }}>{signedUser?.user?.email || ''}</div>
      </div>
      {open && (
        <div style={{ marginTop: 8, background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <button onClick={() => { setOpen(false); onLogout(); }} style={{  display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'center', cursor: 'pointer' }}>Logout</button>
        </div>
      )}
    </div>
  )
}


export default function Home() {
    const containerRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [signedIn, setSignedIn] = useState(false);
  const [signedUser, setSignedUser] = useState(null);
  const router = useRouter();

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

  // check localStorage for saved user
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thinkmate_user')
      setSignedIn(!!saved)
      if (saved) {
        try { setSignedUser(JSON.parse(saved)) } catch { setSignedUser(null) }
      }
    } catch (e) {
      setSignedIn(false)
    }
  }, [])

    return (
        <>
         <Head>
        <title>ThinkMate</title>
        <meta name="description" content="학생들의 관심사를 시각화하고 AI가 프로젝트 아이디어를 제안하는 협업 플랫폼" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <main className={styles.mainContent}>
          <InterestVisualization width={size.width} height={size.height} />
          <Link href="/analysis">
            <button className={styles.pageButton} style={{
                position: 'absolute',
                width: '12rem',
                height: '3rem',
                bottom: '5.5vh',
                right: '6vw',
              }}>Go to Analysis</button>
              
          </Link>
          <Link href="/survey">
              <button className={styles.pageButton} style={{
                position: 'absolute',
                width: '12rem',
                height: '3rem',
                bottom: '5.5vh',
                right: '22vw',
              }}>Survey</button>
              </Link>
        </main>
        <div>
          <div style={{  position: 'absolute', top: '6vh', left: '2vw' }}>
            {signedIn ? (
            <SignedInNameBox signedUser={signedUser} onLogout={() => { localStorage.removeItem('thinkmate_user'); setSignedIn(false); setSignedUser(null); router.reload(); }} />
          ) : (
            <Link href="/login">
              <button style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.95)', padding: '0.8rem 1.5rem', borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', stroke: 'none' }}>Login</button>
            </Link>
          )}</div>
          
        </div>
        
        
      </div>
      
        </>
    )
}