import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Nav.module.css'
import PillNav from '../components/pillNav'


export default function NavBar({ signedUser }) {
  const router = useRouter()

  const logo = '/logo.png';
  return (
    <header className={styles.nav}>
      <div className={styles.left} onClick={() => router.push('/')}>ThinkMate</div>
      <div className={styles.right}>
      
  <PillNav
      logo={logo}

      logoAlt="Company Logo"
      items={[
          { label: 'Home', href: '/' },
          { label: 'Rational', href: '/rational' },
          { label: 'Register Group', href: '/register-group' },
          { label: 'Survey', href: '/survey' },
          { label: 'Analysis', href: '/analysis' }
        ]}
        activeHref="/"
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="rgba(255, 255, 255, 0)"
        pillColor="rgba(255, 255, 255, 0)"
        hoveredPillTextColor="#000000"
        pillTextColor="#000000"
      />
    
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
      </div>
    </header>
  )
}
