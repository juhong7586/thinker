import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Rational() {
  return (
    <>
      <Head>
        <title>Rational — ThinkMate</title>
        <meta name="description" content="Rational info: how empathy and creativity relate" />
      </Head>

      <div className={styles.container}>
        <main className={styles.mainContent} style={{ maxWidth: 900, padding: '3rem 1.5rem' }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0 }}>Rational</h1>
            <div style={{ color: '#666', marginTop: 8 }}>Understanding how empathy and creativity interact</div>
          </div>

          <section style={{ lineHeight: 1.6, color: '#222' }}>
            <h3>Brief overview</h3>
            <p>
              The "Rational" perspective emphasizes clear thinking, analysis, and evidence-based decision making. It does
              not exclude feelings or imagination — instead, it benefits when those human qualities are harnessed in service of
              well-reasoned outcomes.
            </p>
          </section>

          <section style={{ marginTop: 18, lineHeight: 1.6 }}>
            <h3>How empathy and creativity relate</h3>
            <p>
              Empathy and creativity are deeply connected. Empathy — the ability to understand and resonate with another person's
              feelings and perspective — supplies the raw material that creative thinking transforms into meaningful solutions.
            </p>

            <h4>Key ways they interact</h4>
            <ul>
              <li><strong>Empathy seeds insight:</strong> By listening and imagining another person's world, you discover unmet needs and surprising constraints that spark creative ideas.</li>
              <li><strong>Creativity shapes empathy into form:</strong> Creative skills translate empathetic insight into prototypes, stories, and experiments that others can experience and evaluate.</li>
              <li><strong>Balance with analysis:</strong> Empathy and creative exploration produce options; rational evaluation helps pick the best ones — ensuring ideas are feasible, ethical, and effective.</li>
              <li><strong>Emotional resonance drives adoption:</strong> Solutions that feel understood and humane are more likely to be accepted and used — creativity that honors empathy often wins.</li>
            </ul>
          </section>

          <section style={{ marginTop: 18, lineHeight: 1.6 }}>
            <h3>Practical tips (for thinkers who lead with rationality)</h3>
            <ol>
              <li>Practice active listening: ask open questions, reflect back feelings, and avoid jumping straight to solutions.</li>
              <li>Use quick experiments: build low-cost prototypes or role-play scenarios that let you test whether your idea resonates emotionally.</li>
              <li>Invite diverse perspectives: empathy grows when you include voices different from your own — it expands the creative search space.</li>
              <li>Apply clear evaluation criteria: once you have empathetic ideas, assess them using constraints like feasibility, impact, cost, and alignment with values.</li>
            </ol>
          </section>

          <section style={{ marginTop: 18 }}>
            <h3>Short exercise</h3>
            <p>
              Next time you solve a problem, try this quick loop:
            </p>
            <ol>
              <li>Spend 5 minutes interviewing or imagining a target person.</li>
              <li>Write down 3 emotions or unmet needs you observed.</li>
              <li>Generate 5 rapid ideas (no judgment) that respond to those needs.</li>
              <li>Pick the top idea and list 3 concrete reasons it could succeed or fail.</li>
            </ol>
          </section>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <Link href="/">
              <a style={{ padding: '8px 12px', borderRadius: 8, background: '#eef2ff', textDecoration: 'none' }}>Back</a>
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
