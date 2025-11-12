import Head from 'next/head';
import BubbleMenu from '../components/BubbleMenu';
import styles from '../styles/Home.module.css';
import SlopeChart from '../components/visualization/slopeChart';
import LollipopChart from '../components/visualization/lollipopChart';
import ScatterPlot from '../components/visualization/scatterPlot'; 
import CreativityScatter from '../components/visualization/creativityScatter';
import GravityScatterPlot from '../components/visualization/gravity';
import CurvyChart from '../components/visualization/curvyChart';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as d3 from 'd3';

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
  // Component state must be created inside the component using hooks
  const [country, setCountry] = useState(null);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    // load country list from CSV so labels match the charts
    d3.csv('/data/emp_cr_by_country.csv')
      .then(rows => {
        const list = rows.map(r => r.country).filter(Boolean);
        const unique = Array.from(new Set(list));
        setCountries(unique);
      })
      .catch(err => console.error('Failed to load country list:', err));
  }, []);


  
  return (
    <>
    
      <Head>
        <title>Rational — ThinkMate</title>
        <meta name="description" content="Rational info: how empathy and creativity relate" />
      </Head>
    <div className={styles.title} style={{ maxWidth: '100%', margin: '3rem auto', textAlign: 'center' }}>
      <p style={{fontWeight:'600', fontSize:'1.5rem'}}>Empathy in Student: Unlocking creative solutions to social challenges</p>
         
    </div>
    <div style={{ maxWidth: '100%', margin: '1rem auto', padding: '4rem 0' }}>
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
    </div>
    <div style={{  alignItems: 'center' , textAlign: 'center'}}>
     
          <p className={styles.subtitle} style={{ fontSize: '1.3rem', lineHeight: 2, padding: '5rem 0'}}>
          What would these issues mean for our students? 
          <br />They do think these problems are important, however, they do not think they should make a difference.
          <br />How would these problems impact on them? Would it be okay to let them ignore these issues?
          <br />As someone to guide our students, how can we solve them?</p>
          <p className={styles.subtitle} style={{ fontSize: '1.3rem'}}><i>Please select your country.</i></p>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0', padding: '2rem 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: '100%' }}>
            {countries.length === 0 ? (
              <div style={{ color: '#666' }}>Loading countries…</div>
            ) : (
              countries.map(c => (
                <motion.button
                  key={c}
                  onClick={() => setCountry(c)}
                  aria-pressed={country === c}
                  style={{
                    padding: country === c ? '8px 16px' : '6px 12px',
                    borderRadius: 18,
                    border: country === c ? '2px solid #111' : '1px solid #ddd',
                    background: country === c ? '#f3f4f6' : '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transformOrigin: 'center'
                  }}
                  animate={country === c ? { scale: 1.1 } : { scale: 1 }}
                  transition ={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {c}
                  </motion.button>
              ))
            )}
          </div>
        </div>

        {country && (
          <p style={{ textAlign: 'center', marginTop: 8 }}><strong>Selected country:</strong> {country}</p>
        )}
          <SlopeChart currentCountry={country} />
          <p className={styles.subtitle} style={{ fontSize: '1rem', lineHeight: 1.6 }}>
          IT is really a problem, especially comparing between students. </p>

        <CreativityScatter currentCountry={country} />
        <p className={styles.subtitle} style={{ fontSize: '1rem', lineHeight: 1.6 }}>
          
          Look at the distribution of empathy and creativity scores among students.
          <br />Compare number of students between overall creativity and social problem solving creativity.
          <br /> Although they possess high creativity, they struggle when the problems narrow down to social problems.
          <br /> This is directly related to the unsolved conflicts within our society.</p>

        <h3 className={styles.subtitle} style={{ fontWeight: 700, textAlign: 'center', fontStyle: 'italic' }}>How can we solve this problem?</h3>
        <LollipopChart currentCountry={country} />
        <p style={{ lineHeight: 1.6 }}>
          We can find hint in empathy. Chart above is about confidence in self-directed learning, and social and emotional skills.
          <br />It shows change in the index of confidence in self-directed learning index with a one-unit increase in each of the social and emotional skills (SES) indices after accounting for students' and schools' socio-economic profile, and mathematics performance. 
          <br />We can see that students who has higher empathy score tends to have higher confidence in self-directed learning index.
        </p>
        <ScatterPlot currentCountry={country} />
          
    </div>
    <div style={{ background: 'linear-gradient(to bottom, #ffffff, #0e0e0e)', width: '100vw', padding: '40px 0' , height: '30vh'}}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>What can we do for students' future?</h1>
    </div>
    <div style={{ background: '#0e0e0e', width: '100vw' }}>
      <GravityScatterPlot currentCountry={country} />
    </div>
    
    </>
  );
}

