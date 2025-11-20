import '../styles/fonts.css'
import '../styles/Home.module.css'
import NavBar from '../components/NavBar'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }) {
  const [signedUser, setSignedUser] = useState(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('thinkmate_user')
      if (raw) setSignedUser(JSON.parse(raw))
    } catch (e) { setSignedUser(null) }
  }, [])

  return (
    <>
      {!Component.hideNav && <NavBar signedUser={signedUser} />}
      <Component {...pageProps} />
    </>
  )
}
