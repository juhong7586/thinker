import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import CardSwap, { Card } from '../components/CardSwap'

// Dynamic client-only import: the gallery uses WebGL and must run in the browser.
const CircularGallery = dynamic(() => import('../components/circularGallery'), { ssr: false })

export default function HomeIntro() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>ThinkMate — Welcome</title>
        <meta name="description" content="Welcome to ThinkMate" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <div style={{ textAlign: 'left', paddingLeft: 80, paddingTop: 40, lineHeight: 1 }}>
      <h1 style={{fontSize: 48}}>THINKMATE</h1>
      <h3 style={{ fontWeight: 'normal' }}> Find your topic.</h3>
    </div>
        {/* Card-based navigation over the gallery */}
        <div style={{ position: 'absolute', left: 80, bottom: -300, zIndex: 10 }}>
          <div style={{ height: 600, position: 'relative' }}>
              <CardSwap cardDistance={200} verticalDistance={70} delay={4500} pauseOnHover={false} autoSwap={false}>
                <Card style={{ background: 'rgba(255,255,255,0.95)', color: '#111' }}>
                  <h3 style={{ margin: 0 }}>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { router.push('/graph') }}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Graph
                    </span>
                  </h3>
                  <p style={{ marginTop: 8 }}>Open the interactive graph view</p>
                </Card>

                <Card style={{ background: 'rgba(255,255,255,0.95)', color: '#111' }}>
                  <h3 style={{ margin: 0 }}>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { router.push('/rational') }}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Rational
                    </span>
                  </h3>
                  <p style={{ marginTop: 8 }}>Read the rationale and methods</p>
                </Card>

                <Card style={{ background: 'rgba(255,255,255,0.95)', color: '#111' }}>
                  <h3 style={{ margin: 0 }}>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { router.push('/analysis') }}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Analysis
                    </span>
                  </h3>
                  <p style={{ marginTop: 8 }}>View visualizations and insights</p>
                </Card>

                <Card style={{ background: 'rgba(255,255,255,0.95)', color: '#111'}}>
                  <h3 style={{ margin: 0 }}>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { router.push('/survey') }}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Survey
                    </span>
                  </h3>
                  <p style={{ marginTop: 8 }}>Take the survey</p>
                </Card>

                <Card style={{ background: 'rgba(255,255,255,0.95)', color: '#111' }}>
                  <h3 style={{ margin: 0 }}>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => {router.push('/result') }}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Results
                    </span>
                  </h3>
                  <p style={{ marginTop: 8 }}>See previous results</p>
                </Card>

                <Card style={{ background: 'rgba(255,255,255,0.95)', color: '#111' }}>
                  <h3 style={{ margin: 0 }}>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { router.push('/login') }}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Login
                    </span>
                  </h3>
                  <p style={{ marginTop: 8 }}>Sign in to save your progress</p>
                </Card>
              </CardSwap>
          </div>
        </div>

     
    </>
  )
}

// Hide the site navigation on this landing/intro page
HomeIntro.hideNav = true