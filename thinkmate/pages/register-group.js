import Head from 'next/head'
import { useState } from 'react'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function RegisterGroup() {
  const [mode, setMode] = useState('create') // 'create' or 'join'
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [created, setCreated] = useState(null)
  const [foundGroup, setFoundGroup] = useState(null)
  const [message, setMessage] = useState('')

  const handleCreate = async () => {
    setMessage('')
    if (!groupName.trim()) return setMessage('Group name required')
    if (!inviteCode.trim()) return setMessage('Invite code required')
    try {
      const payload = { name: groupName.trim(), description: groupDesc.trim(), inviteCode: inviteCode.trim(), teacherId: teacherId.trim() }
      // make the requested destructured object available locally
      
      const res = await fetch('/api/groups/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('create failed')
      const data = await res.json()
      setCreated(data.group)
      setMessage('Group created — share invite code with classmates')
    } catch (err) {
      console.error(err)
      setMessage('Failed to create group')
    }
  }

  const handleJoin = async () => {
    setMessage('')
    if (!inviteCode.trim()) return setMessage('Invite code required')
    try {
      // find group by inviteCode
      const code = inviteCode.trim()
      const res = await fetch(`/api/groups?inviteCode=${encodeURIComponent(code)}`)
      if (!res.ok) throw new Error('lookup failed')
      const data = await res.json()
      const g = (data.groups || [])[0]
      if (!g) return setMessage('No group found with that invite code')
      // set as found group and let the user explicitly join
      setFoundGroup(g)
      setMessage(`Found group: ${g.name}`)
    } catch (err) {
      console.error(err)
      setMessage('Failed to join group')
    }
  }

  const handleConfirmJoin = async (group) => {
    setMessage('')
    const g = group || foundGroup
    if (!g) return setMessage('No group selected')
    try {
      // try to get signed user (student) from localStorage so we can send studentId
      let studentId = null
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('thinkmate_user') : null
        if (raw) {
          const su = JSON.parse(raw)
          studentId = su?.id || null
        }
      } catch {
        // ignore parse errors
      }

      const res = await fetch('/api/groups/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupId: g.id, inviteCode: inviteCode.trim(), studentId: studentId }) })
      if (!res.ok) throw new Error('join failed')
      const data = await res.json()
      setCreated(data.group || g)
      setFoundGroup(null)
      setMessage(`Joined group: ${data.group?.name || g.name}`)
    } catch (err) {
      console.error(err)
      setMessage('Failed to join group')
    }
  }

  return (
    <>
      <Head><title>Register Group - ThinkMate</title></Head>
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 720, background: 'rgba(255,255,255,0.95)', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
          <h2 style={{ marginTop: 0 }}>Register or Join a Group</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setMode('create')} style={{ padding: '6px 10px', borderRadius: 8, background: mode === 'create' ? '#f3f4f6' : 'white' }}>Create</button>
                <button onClick={() => setMode('join')} style={{ padding: '6px 10px', borderRadius: 8, background: mode === 'join' ? '#f3f4f6' : 'white' }}>Join by code</button>
              </div>

              {mode === 'create' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: 6 }}>Group name</label>
                  <input value={groupName} onChange={e => setGroupName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8 }} />
                  <label style={{ display: 'block', marginBottom: 6 }}>Description (optional)</label>
                  <textarea value={groupDesc} onChange={e => setGroupDesc(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8 }} />
                  <label style={{ display: 'block', marginBottom: 6 }}>Invite code</label>
                  <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={{ width: '40%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8 }} />
                  <label style={{ display: 'block', marginBottom: 6 }}>Teacher ID (optional)</label>
                  <input value={teacherId} onChange={e => setTeacherId(e.target.value)} style={{ width: '40%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCreate} className={styles.pageButton}>Create group</button>
                    <Link href='/'><button style={{ border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px' }}>Back</button></Link>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', marginBottom: 6 }}>Enter invite code</label>
                  <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={{ width: '40%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8 }} />
                  {foundGroup ? (
                    <div style={{ marginTop: 12, padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fafafa' }}>
                      <div><strong>{foundGroup.name}</strong> (id {foundGroup.id})</div>
                      {foundGroup.description && <div style={{ color: '#666', marginTop: 6 }}>{foundGroup.description}</div>}
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button onClick={() => handleConfirmJoin(foundGroup)} className={styles.pageButton}>Join group</button>
                        <button onClick={() => setFoundGroup(null)} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px' }}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleJoin} className={styles.pageButton}>Find group</button>
                    <Link href='/'><button style={{ border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px' }}>Back</button></Link>
                  </div>
                </div>
              )}

              {message && <div style={{ marginTop: 12, color: '#444' }}>{message}</div>}
              {created && <div style={{ marginTop: 12 }}>Current group: <strong>{created.name}</strong> (id {created.id})</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
