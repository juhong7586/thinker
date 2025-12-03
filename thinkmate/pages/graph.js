import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import InterestVisualization from '../components/visualization/InterestVisualization'
import { useRouter } from 'next/router'


// ai result is passed into visualization via props

function SignedInNameBox({ signedUser, onLogout }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ paddingTop:50}}>
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
  const [aiPending, setAiPending] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const lastAiResultRef = useRef(null);
  const prevAiPendingRef = useRef(false);

  // Watch localStorage keys for AI pending/result so we can show a loading overlay
  useEffect(() => {
    let mounted = true;
    const check = () => {
      try {
        const pending = localStorage.getItem('thinkmate.ai.pending');
        const resultRaw = localStorage.getItem('thinkmate.ai.result');
        if (!mounted) return;
        setAiPending(Boolean(pending));
        try {
          setAiResult(resultRaw ? JSON.parse(resultRaw) : null);
        } catch {
          setAiResult(resultRaw || null);
        }
        // If we transitioned from pending -> not pending and a new result appeared, refresh once
        const hadPending = !!prevAiPendingRef.current;
        const nowPending = Boolean(pending);
        const hasResult = !!resultRaw;
        if (hadPending && !nowPending && hasResult && resultRaw !== lastAiResultRef.current) {
          // remember the result so we don't reload repeatedly
          lastAiResultRef.current = resultRaw;
          // do a single soft reload using next/router so client state refreshes
          setTimeout(() => {
            try {
              router.replace(router.asPath);
            } catch {
              window.location.reload();
            }
          }, 250);
        }
        prevAiPendingRef.current = nowPending;
      } catch {
        if (!mounted) return;
        setAiPending(false);
        setAiResult(null);
      }
    };
    // initialize previous pending flag from storage on mount
    try { prevAiPendingRef.current = Boolean(localStorage.getItem('thinkmate.ai.pending')); } catch { prevAiPendingRef.current = false; }
    check();
    const onStorage = (e) => {
      if (e.key && (e.key.startsWith('thinkmate.ai.'))) check();
    };
    window.addEventListener('storage', onStorage);

    // also poll occasionally for same-tab updates
    const iv = setInterval(check, 1000);
    return () => { mounted = false; window.removeEventListener('storage', onStorage); clearInterval(iv); };
  }, [router]);

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

  // check localStorage for saved userrun 
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

  // centralized logout that also clears local saved interests and AI keys
  const handleLogout = () => {
    try {
      localStorage.removeItem('thinkmate_user');
      localStorage.removeItem('thinkmate.newInterests');
      localStorage.removeItem('thinkmate.ai.pending');
      localStorage.removeItem('thinkmate.ai.result');
      localStorage.removeItem('thinkmate.ai.payload');
    } catch (e) {
      // ignore
    }
    // clear client state for AI UI and user
    setAiPending(false);
    setAiResult(null);
    setSignedIn(false);
    setSignedUser(null);
    // soft reload so other pages refresh their state
    try { router.reload(); } catch (e) { window.location.reload(); }
  };

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
          <InterestVisualization width={size.width} height={size.height} signedUser={signedUser} selectedGroup={selectedGroup} aiResult={aiResult} />
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
          <div style={{  position: 'absolute', top: '6vh', left: '2vw',  paddingTop:50 }}>
            {signedIn ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <SignedInNameBox signedUser={signedUser} onLogout={handleLogout}style={{ paddingTop:300}}/>

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
              <button className={styles.pageButton} style={{border: '1px solid rgba(64, 74, 37, 0.8)'}}>Login</button>
            </Link>
          )}</div>
          
        </div>
        
        
      </div>
      {/* AI Loading Overlay */}
      {aiPending && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,8,15,0.45)' }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 12px 40px rgba(2,6,23,0.6)', minWidth: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Analyzing your responses</div>
            <div style={{ marginBottom: 12, color: '#444' }}>Our AI is preparing personalized feedback — this may take a moment.</div>
            <div style={{ height: 8, background: '#eef2ff', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', background: '#6b46c1', transition: 'width 1s linear 2s' }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => { try { localStorage.removeItem('thinkmate.ai.pending'); } catch(e){}; setAiPending(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#eee', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Result Toast */}
      {aiResult && (
        <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 9999 }}>
          <div style={{ background: 'white', padding: 12, borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', minWidth: 260 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>AI Feedback Ready</div>
            <div style={{ maxWidth: 420, whiteSpace: 'pre-wrap', color: '#222' }}>
              {aiResult.error ? (
                <div style={{ color: '#b91c1c' }}>Error: {aiResult.error}</div>
              ) : typeof aiResult === 'string' ? (
                aiResult
              ) : aiResult.reply ? (
                (() => {
                  // show only numbered items 2 and 3 from the AI reply
                  const raw = (typeof aiResult === 'string') ? aiResult : (aiResult.reply || JSON.stringify(aiResult));
                  console.log(raw);
                  const text = String(raw || '');
                  const lines = text.split(/\r?/);
                  const itemRe = /^\s*(\d+)[\.)]\s*(.*)$/; // matches '1. foo' or '2) bar'
                  const items = {};
                  let cur = null;
                  for (let ln of lines) {
                    const m = ln.match(itemRe);
                    if (m) {
                      cur = Number(m[1]);
                      items[cur] = (items[cur] || '') + m[2].trim();
                    } else if (cur !== null) {
                      // continuation line for current item
                      const t = ln.trim();
                      if (t) items[cur] = items[cur] + ' ' + t;
                    }
                  }
                  const out = [];
                  [2,3].forEach(i => { if (items[i]) out.push(items[i].trim()); });
                  if (out.length) return out.join('\n\n');
                  // fallback: show a portion of reply
                  return text.slice(30, 1000);
                })()
              ) : (
                JSON.stringify(aiResult, null, 2)
              )}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button onClick={() => { try { localStorage.removeItem('thinkmate.ai.result'); setAiResult(null); } catch(e){} }} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#eef2ff', cursor: 'pointer' }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
      
        </>
    )
}
