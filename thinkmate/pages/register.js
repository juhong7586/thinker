import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useState } from 'react'
import { api } from '../utils/api'
import { useRouter } from 'next/router'

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [color, setColor] = useState('#FFB347')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setError('')
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return }
    setLoading(true)
    try {
      const student = await api.createStudent(name.trim(), email.trim(), color)
      localStorage.setItem('thinkmate_user', JSON.stringify(student))
      router.push('/')
    } catch (e) {
      console.error(e)
      setError('Failed to register. See console for details.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Head><title>Register - ThinkMate</title></Head>
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 380, background: 'rgba(255,255,255,0.95)', padding: '2rem', borderRadius: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <h2 style={{ marginTop: 0 }}>Register</h2>
          <p style={{ color: '#555' }}>Create your student profile</p>
          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

          <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" style={{ width: '95%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }} />

          <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ width: '95%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }} />

          <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Personal color</label>
          <input value={color} onChange={(e) => setColor(e.target.value)} type="color" style={{ width: '5rem', height: '5rem', padding: '0.5rem', border: 'none', marginBottom: 12 }} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleRegister} disabled={loading} className={styles.pageButton} style={{ width: '100%', height: '2.8rem' }}>{loading ? 'Registering...' : 'Register'}</button>
            <Link href="/">
              <button style={{ width: '6rem', height: '2.8rem', borderRadius: '2rem', border: '1px solid #ddd', background: '#fff' }}>Back</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
