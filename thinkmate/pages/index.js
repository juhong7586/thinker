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
  const getWindowSize = () => ({
    width: (typeof window !== 'undefined') ? Math.max(200, Math.round(window.innerWidth))*0.9 : 900,
    height: (typeof window !== 'undefined') ? Math.max(200, Math.round(window.innerHeight))*0.9 : 600
  });
  const [size, setSize] = useState(getWindowSize);

  const [signedIn, setSignedIn] = useState(false);
  const [signedUser, setSignedUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const set = () => {
     // if container exists, use its size; otherwise fall back to window size
     if (node) {
        const bb = node.getBoundingClientRect();
        setSize({
          width: Math.max(200, Math.round(bb.width)),
          height: Math.max(200, Math.round(bb.height)),
        });
     } else if (typeof window !== 'undefined') {
       setSize(getWindowSize());
     } 
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

  // when signedUser is present, fetch their groups
  useEffect(() => {
    if (!signedUser) return;
    let mounted = true;
    const sid = signedUser?.id;
    if (!sid) return;
    fetch(`/api/groups?studentId=${sid}`).then(r => r.json()).then(data => {
      if (!mounted) return;
      setGroups(data.groups || []);
      // select first group by default if any
      if ((data.groups || []).length > 0) setSelectedGroup(data.groups[0]);
    }).catch(err => {
      console.error('Failed to load groups', err);
      if (mounted) setGroups([]);
    });
    return () => { mounted = false };
  }, [signedUser]);

    return (
        <>
         <Head>
        <title>ThinkMate</title>
        <meta name="description"  />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <main className={styles.mainContent}>
          <InterestVisualization width={size.width} height={size.height} signedUser={signedUser} selectedGroup={selectedGroup} />
          {/* <div className="panelGroup">
          <Link href="/analysis">
            <button className={styles.pageButton} style={{
              }}>Go to Analysis</button>
              
          </Link>
          <Link href="/survey">
              <button className={styles.pageButton} style={{
                
              }}>Survey</button>
              </Link>
</div> */}
        </main>
        <div>
          <div style={{  position: 'absolute', top: '6vh', left: '2vw' }}>
            {signedIn ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <SignedInNameBox signedUser={signedUser} onLogout={() => { localStorage.removeItem('thinkmate_user'); setSignedIn(false); setSignedUser(null); router.reload(); }} />

              {/* group selector */}
              {groups.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.95)', padding: '0.5rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: '#333', marginBottom: 6 }}>Working group</div>
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    {groups.map(g => (
                      <button key={g.id} onClick={() => setSelectedGroup(g)} style={{ padding: '6px 8px', borderRadius: 6, border: selectedGroup?.id === g.id ? '2px solid #333' : '1px solid #ddd', background: selectedGroup?.id === g.id ? '#f3f4f6' : 'white', cursor: 'pointer' }}>{g.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <button className={styles.pageButton} style={{border: '2px solid rgba(94, 77, 77, 0.8)'}}>Login</button>
            </Link>
          )}</div>
          
        </div>
        
        
      </div>
      
        </>
    )
}