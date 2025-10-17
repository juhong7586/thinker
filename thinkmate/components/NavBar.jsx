import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Nav.module.css'

export default function NavBar({ signedUser }) {
  const router = useRouter()
  return (
    <header className={styles.nav}>
      <div className={styles.left} onClick={() => router.push('/')}>ThinkMate</div>
      <nav className={styles.links}>
        <Link href="/">Home</Link>
        <Link href="/survey">Survey</Link>
        <Link href="/analysis">Analysis</Link>
      </nav>
      {/* <div className={styles.right}>
        {signedUser ? (
          <div className={styles.user}>
            <div className={styles.dot} style={{ background: signedUser.studentColor || signedUser.student?.studentColor || '#FFB347' }} />
            <div className={styles.name}>{signedUser.user?.name}</div>
          </div>
        ) : (
          <div className={styles.actions}>
            <Link href="/register"><button className={styles.actionBtn}>Register</button></Link>
            <Link href="/login"><button className={styles.actionBtnPrimary}>Login</button></Link>
          </div>
        )}
      </div> */}
    </header>
  )
}
