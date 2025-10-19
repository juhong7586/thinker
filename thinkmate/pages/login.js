import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Prefill from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thinkmate_user')
      if (saved) {
        const obj = JSON.parse(saved)
        if (obj && obj.user && obj.user.name) setName(obj.user.name)
        if (obj && obj.user && obj.user.email) setEmail(obj.user.email)
      }
    } catch (e) { /* ignore */ }
  }, [])

  const handleLogin = async () => {
    setError('')
    if (!name.trim() || !email.trim()) {
      setError('Please provide both name and email')
      return
    }
    setLoading(true)
    try {
      // fetch all students and try to find existing by email
      const students = await api.getStudents()
      const found = students.find(s => s.user?.email?.toLowerCase() === email.trim().toLowerCase())
      let student
      if (found) {
        student = found
      } else {
        // Create new student (server will create User + Student)
        student = await api.createStudent(name.trim(), email.trim(), '#FFB347')
      }

      // Persist to localStorage so user doesn't need to register again
      localStorage.setItem('thinkmate_user', JSON.stringify(student))

      // Redirect to home
      router.push('/')
    } catch (err) {
      console.error(err)
      setError('Failed to login. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - ThinkMate</title>
      </Head>
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 360, background: 'rgba(255,255,255,0.95)', padding: '1rem', borderRadius: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Sign in</h2>
          <p style={{ marginTop: 0, color: '#555', marginBottom: '1rem' }}>Enter your name and email. We'll remember you on this device.</p>

          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

          <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your name" style={{ width: '90%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 12 }} />

          <label style={{ display: 'block', fontSize: 13, color: '#333', marginBottom: 6 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" style={{ width: '90%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 14 }} />

          <div style={{ display: 'flex', gap:'1rem' }}>
            
            <button onClick={handleLogin} disabled={loading} className={styles.pageButton} style={{ width: '100%', height: '2.8rem' }}>{loading ? 'Signing in...' : 'Sign in'}</button>
           <Link href="/register">
                            <button className={styles.pageButton} style={{
                              width: '8rem',
                              height: '3rem'
                            }}>Register</button>
                          </Link>
            
            <Link href="/">

              <button style={{ width: '6rem', height: '2.8rem', borderRadius: 8, border: '1px solid #ddd', background: '#fff' }}>Back</button>
            </Link>
            
          </div>
        </div>
      </div>
    </>
  )
}
