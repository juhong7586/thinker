import Head from 'next/head';
import BubbleMenu from '../components/BubbleMenu';
import styles from '../styles/Home.module.css';
import SlopeChart from '../components/visualization/slopeChart';

const items = [
  {
    label: '‘Men don’t know why they became unhappy’: the toxic gender war dividing South Korea',
    href: 'https://www.theguardian.com/society/2025/sep/20/inside-saturday-south-korea-gender-war',
    ariaLabel: 'Home',
    rotation: -2,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    label: 'Gender, generation gap on full display in exit poll showing entrenched differences',
    href: 'https://koreajoongangdaily.joins.com/news/2025-06-03/national/2025presidential/Gender-generation-gap-on-full-display-in-exit-poll-showing-entrenched-differences/2322105',
    ariaLabel: 'About',
    rotation: 4,
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
  },
  {
    label: 'South Korea’s deep political divide',
    href: 'https://www.koreaherald.com/article/10508049',
    ariaLabel: 'Projects',
    rotation: 2,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'For cash-strapped South Koreans, the class conflict in "Squid Game" is deadly serious',
    href: 'https://www.npr.org/2021/11/06/1053163060/class-conflict-and-economic-hardship-in-squid-game-is-real-for-many-south-korean',
    ariaLabel: 'Blog',
    rotation: -1,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'S. Korea has 3rd highest social conflict index among OECD countries',
    href: 'https://english.hani.co.kr/arti/english_edition/e_national/912156.html',
    ariaLabel: 'Contact',
    rotation: 4,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  }
];

export default function RationalPage() {
  return (
    <>
      <Head>
        <title>Rational — ThinkMate</title>
        <meta name="description" content="Rational info: how empathy and creativity relate" />
      </Head>
    <div className={styles.title} style={{ maxWidth: '100%', margin: '3rem auto', textAlign: 'center' }}>
 <p style={{fontWeight:'600', fontSize:'1.5rem'}}>Empathy in Student: Unlocking creative solutions to social challenges</p>
         
    </div>
      <div style={{ padding: '2rem' }}>
        {/* BubbleMenu placed at the top of the page */}
        <BubbleMenu
          logo={<span style={{ fontWeight: 700 }}>RB</span>}
          items={items}
          menuAriaLabel="Toggle navigation"
          menuBg="#ffffff"
          menuContentColor="#111111"
          useFixedPosition={false}
          alwaysVisible={true}
          animationEase="back.out(1.5)"
          animationDuration={0.5}
          staggerDelay={0.12}
        />

        <main style={{ maxWidth: 900, margin: '3rem auto' }}>
           <p className={styles.subtitle} style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
          What would these issues mean for our students? <p style={{fontStyle:'italic'}}>Surprisingly, they are not interested in them.</p>
          <br />How would these problems impact on them? Would it be okay to let them ignore these issues?
          <br />As someone to guide our students, how can we solve them?</p>
            <SlopeChart />
          <section style={{ marginTop: 18 }}>
            <h3>How empathy and creativity relate</h3>
            <p style={{ lineHeight: 1.6 }}>
              Empathy — the ability to understand and resonate with another person's feelings and perspective — supplies the raw material
              that creative thinking transforms into meaningful solutions. Use the menu to explore sample sections.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}

