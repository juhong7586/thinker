import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import { api } from '../utils/api'
import Link from 'next/link'

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(false)

  // student form
  const [sName, setSName] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sColor, setSColor] = useState('#FFB347')
  const [members, setMembers] = useState([])

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert('Group name required')
    setLoading(true)
    try {
      const res = await fetch('/api/groups/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: groupName.trim(), description: groupDesc.trim(), inviteCode: inviteCode.trim() }) })
      if (!res.ok) throw new Error('Failed to create group')
      const data = await res.json()
      setGroup(data.group)
      alert('Group created')
    } catch (err) {
      console.error(err)
      alert('Could not create group')
    } finally { setLoading(false) }
  }

  const handleAddStudentToGroup = async () => {
    if (!group) return alert('Create group first')
    if (!sName.trim() || !sEmail.trim()) return alert('Student name and email required')
    setLoading(true)
    try {
      // reuse existing client helper to create student
      const student = await api.createStudent(sName.trim(), sEmail.trim(), sColor)
      // add as group member
      const res = await fetch(`/api/groups/${group.id}/add-member`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: student.id }) })
      if (!res.ok) throw new Error('Failed to add member')
      const data = await res.json()
      setMembers(prev => [...prev, { student, member: data.member }])
      setSName(''); setSEmail(''); setSColor('#FFB347')
    } catch (err) {
      console.error(err)
      alert('Failed to add student to group')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Head><title>Create Group - ThinkMate</title></Head>
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 720, background: 'rgba(255,255,255,0.95)', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
          <h2 style={{ marginTop: 0 }}>Create Group</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Group name</label>
              <input value={groupName} onChange={e => setGroupName(e.target.value)} type="text" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }} />
              <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Description</label>
              <textarea value={groupDesc} onChange={e => setGroupDesc(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }} />
              <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Invite code (optional)</label>
              <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} type="text" style={{ width: '50%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCreateGroup} className={styles.pageButton} disabled={loading}>{group ? 'Update group' : 'Create group'}</button>
                <Link href="/"><button style={{ border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px' }}>Back</button></Link>
              </div>
            </div>

            <div style={{ width: 320 }}>
              <h3 style={{ marginTop: 0 }}>Add student</h3>
              <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Name</label>
              <input value={sName} onChange={e => setSName(e.target.value)} type="text" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8 }} />
              <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Email</label>
              <input value={sEmail} onChange={e => setSEmail(e.target.value)} type="email" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 8 }} />
              <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Color</label>
              <input value={sColor} onChange={e => setSColor(e.target.value)} type="color" style={{ width: '4rem', height: '4rem', padding: 6, border: 'none', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddStudentToGroup} className={styles.pageButton} disabled={loading || !group}>{loading ? 'Working...' : 'Add & register'}</button>
              </div>

              {members.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <h4 style={{ margin: 0 }}>Added students</h4>
                  <ul>
                    {members.map((m, idx) => (
                      <li key={idx} style={{ marginTop: 6 }}>{m.student.user.name} — {m.student.user.email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
