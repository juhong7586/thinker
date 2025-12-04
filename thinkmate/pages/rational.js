import Head from 'next/head';
import styles from '../styles/Home.module.css';
import SlopeChart from '../components/visualization/slopeChart';
import CreativityScatter from '../components/visualization/creativityScatterPlot'; 
import BeeSwarmPlot from '../components/visualization/beeSwarmPlot';
import GravityScatterPlot from '../components/visualization/gravity';
import GroupBarChart from '../components/visualization/groupBarChart';
import { useState, useMemo, useEffect, use } from 'react';
import { motion } from 'motion/react';


import itemsList from './api/data/news';
import useCountryStats from '../hooks/useCountryStats';
import CardGallery from '../components/cardGallery';
import FlipCards from '../components/flipCards';
import { line } from 'd3';



const serverHostName = process.env.DATABRICKS_SERVER_HOSTNAME;
const token = process.env.DATABRICKS_TOKEN;
const httpPath = process.env.DATABRICKS_HTTP_PATH;

export default function RationalPage({ countries = []}) {
  // Component state must be created inside the component using hooks
  const [country, setCountry] = useState(null);
  // Use the client-safe SWR hook which fetches from `/api/data/getStudentsByCountry`
  // This avoids importing server-only modules into the browser bundle.
  const { data: studentData } = useCountryStats(country);
  
  // Ensure we render strings for country buttons (memoized to avoid re-computation)
  const countryList = useMemo(() => {
    if (!Array.isArray(countries)) return [];
    return countries.map((c, i) => (typeof c === 'string' ? c : (c?.country ?? `country-${i}`)));
  }, [countries]);

  // Split-button state: controls the floating split control on the left
  const [splitMenuOpen, setSplitMenuOpen] = useState(false);
  const [splitSelected, setSplitSelected] = useState(country || (countryList.length ? countryList[0] : null));

  // Keep the split-selected label in sync with the active `country`.
  useEffect(() => {
    if (country) {
      setSplitSelected(country);
    } else if (!country && countryList && countryList.length > 0) {
      // fallback to first country when none selected
      setSplitSelected(countryList[0]);
    }
  }, [country, countryList]);

  // // If `country` is falsy we pass through the original array (show all).
  const filteredStudentData = useMemo(() => {
    if (!Array.isArray(studentData)) return [];
    if (!country)  return studentData;
    return studentData.filter((r) => {
      if (!r) return false;
      const rowCountry = r.country ?? r.Country ?? r.country_name ?? r.countryName ?? null;
      return rowCountry === country;
    });
  }, [studentData, country]);

  // If `country` is a string (name), find its full data object from `countries`.
  const selectedCountryData = country && Array.isArray(countries)
    ? countries.find((c) => c.country === country) || null
    : null;


  // Bar filter state: { grade, gender }
  const [barFilter, setBarFilter] = useState({ grade: null, gender: null });

  const creativityRows = useMemo(() => {
    if (!Array.isArray(filteredStudentData)) return [];
    const { grade: fGrade, gender: fGender } = barFilter || {};
    return filteredStudentData.filter((r) => {
      if (!r) return false;
      if (fGrade) {
        const rowGrade = r.grade ?? r.ST001D01T ?? '';
        if (String(rowGrade) !== String(fGrade)) return false;
      }
      if (fGender) {
        const rowGender = r.gender ?? r.ST004D01T ?? null;
        // In dataset gender encoding might be 1 (female) / 2 (male) or strings
        if (fGender === 'female' && String(rowGender) !== '1') return false;
        if (fGender === 'male' && String(rowGender) !== '2') return false;
      }
      return true;
    });
  }, [filteredStudentData, barFilter]);

  const handleBarClick = ({ grade, gender }) => {
    // toggle same selection
    if (barFilter.grade === grade && barFilter.gender === gender) {
      setBarFilter({ grade: null, gender: null });
    } else {
      setBarFilter({ grade, gender });
    }
  };


  return (
    <>
    
      <Head>
        <title>Rational — ThinkMate</title>
        <meta name="description" content="Rational info: how empathy and creativity relate" />
      </Head>
      {/* Floating split control: main = reselect (opens small list), arrow = apply/fetch (sets country) */}
      <div className={styles.floatingSplit}>
        <motion.button
          className={styles.floatingSplitMain}
          aria-haspopup="menu"
          aria-expanded={splitMenuOpen}
          onClick={() => setSplitMenuOpen((s) => !s)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.1 }}
        >
          <span style={{ fontSize: 14, color: '#111' }}>{splitSelected || 'All'}</span>
        </motion.button>

     
        {splitMenuOpen && countryList.length > 0 && (
          <div className={styles.floatingSplitMenu} role="menu">
            {countryList.map((c) => (
              <button
                key={c}
                className={styles.floatingSplitMenuItem}
                onClick={() => {
                  setSplitSelected(c);
                  setCountry(c);
                  setSplitMenuOpen(false);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    <div className={styles.title} style={{ maxWidth: '100%', margin: '3rem auto', textAlign: 'center', fontFamily: 'NanumSquareNeo' }}>
      <p style={{fontWeight:'600', fontSize:'1.5rem'}}>Empathy in Student: Unlocking creative solutions to social challenges</p>
         
    </div>
    <div style={{overflowX: 'hidden'}}>
      <CardGallery cardsList={itemsList} />
    </div>
    <div style={{  alignItems: 'center' , textAlign: 'center', fontFamily: 'NanumSquareNeo', maxWidth: '90%', margin: '1rem auto', paddingBottom: '4rem' }}>
     
          <p className={styles.subtitle} style={{ fontSize: '1.2rem', lineHeight: 2, padding: '5rem 0'}}>
          What would these issues mean for our students? 
          <br />They do think these problems are important, however, they do not think they should make a difference.
          <br />How would these problems impact on them? Would it be okay to let them ignore these issues?
          <br />As someone to guide our students, how can we solve them?</p>
          <p className={styles.subtitle} style={{ fontSize: '1.3rem'}}><i>Please select your country.</i></p>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0', padding: '2rem 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: '100%' }}>
            {countryList.length === 0 ? (
              <div style={{ color: '#666' }}>Loading countries…</div>
            ) : (
              countryList.map((c) => (
                  <motion.button
                    key={c}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCountry(c)}
                    className={
                      `${styles.countryButton} ${country === c ? styles.countryButtonActive : ""}`
                    }
                  >
                    {c}
                  </motion.button>
              ))
            )}
          </div>
        </div>
        </div>
      {country === null ? (
              <div style={{ color: '#AAA', fontStyle: 'italic', fontWeight: '800', padding: '5rem', textAlign: 'center', fontSize: '1.3rem'}}>Select country to see the data.</div>
            ) : (
              <>
          <div className={styles.subtitle} style={{ textAlign: 'center', fontFamily: 'NanumSquareNeo', fontSize: '1.125rem' }}>
            <p style={{ marginTop: 8, paddingBottom: '1rem' }}><strong>Selected country:</strong> {country}</p>
            <SlopeChart currentCountry={country} countryData={countries} />

            <div className={styles.subtitle} style={{ lineHeight: 1.4, paddingTop: '2rem', paddingBottom: '3rem' }}>
              {selectedCountryData ? (
                selectedCountryData.overallScore < selectedCountryData.socialSuccess ? (
                  <div>
                    {selectedCountryData.country} has more creativity specific to social problem solving than overall creativity.
                    <br /> Hover over the country and check others with the same level of overall creativity.
                    <br /> Do all our students have higher creativity in social problem solving than overall creativity?
                  </div>
                ) : selectedCountryData.overallScore > selectedCountryData.socialSuccess ? (
                  <div>
                    {selectedCountryData.country} has higher overall creativity than the specific creativity to social problem solving.
                    <br /> Hover over the country and check others with the same level of overall creativity.
                    <br /> Do all our students have higher overall creativity than creativity in social problem solving?
                  </div>
                ) : (
                  <div>
                    {selectedCountryData.country} has similar overall creativity and social success.
                    <br /> Hover over the country and check others with the same level of overall creativity.
                    <br /> Do all our students have similar level of creativity for all domains?
                  </div>
                )
              ) : (
                <div>Summary data not available for <strong>{country}</strong>.</div>
              )}
            </div>

        <BeeSwarmPlot studentRows={filteredStudentData} />
        <div className={styles.subtitle} >
        <p style={{lineHeight: 1.6 }}>
          Look at the distribution of creativity scores among students.
          <br />Here, one dot represents one student.
          </p>
          <div className={styles.subtitle}>
           {selectedCountryData ? (
                selectedCountryData.overallScore < selectedCountryData.socialSuccess ? (
                   <div> Even though the social problem solving creativity seems high in average,
                    <br /> there are many students who have low.</div>
                ) : selectedCountryData.overallScore > selectedCountryData.socialSuccess ? (
                   <div>
            {selectedCountryData.country} has lower social problem solving creativity than overall.
              </div>
            ) : (
              <div>
                Even though the social problem solving creativity seems moderate on average,
                <br /> there are many students who have low.
              </div>          
            )    
          ):null
        }
        </div>
        </div>
        <p style={{ color: '#333', paddingBottom: '6rem', fontStyle: 'italic', lineHeight: 1.6 }}>
          What makes the difference?
          <br />How can we solve this problem?</p>
          <h3 style={{ color: '#333', paddingTop: '3rem' }}>We can find the hint in <strong>empathy.</strong></h3>
          <div style={{ color: '#333', lineHeight: 1.6, background: 'linear-gradient(180deg, #eeebe3ff 0%, #ffffff 100%)', padding: '1rem 2rem', borderRadius: '8px', marginTop: '1rem'  }}>
            <p>
              As one of the abilities of future 2030 skills suggested by OECD,
              <br /> empathy is defined as the ability to understand another&#39;s emotional state or condition.
            </p>

            <p>
              It includes the ability to
            </p>
           <FlipCards />
            <p>
              As a foundation for citizenship and responsibility toward society,
              <br /> empathy mediates other social-emotional skills such as tolerance, cooperation, and teamwork.
              <br /> Empathetic students are more likely to engage in social problem solving and creative thinking to address societal challenges.
            </p>
          </div>
          <p style={{fontSize: '0.85rem', fontStyle: 'italic', paddingBottom: '7rem', color: '#888'}}>Doron, 2017; Feshbach, 1978; Grant & Berry, 2011; Hope, 2014; Kripal & Reiter-Palmon, 2024; OECDa, 2019; Spinrad et al., 2006; Steponavičius et al., 2023; Wray‐Lake, 2011</p>
        {/* <LollipopChart currentCountry={country} countryData={countries} />
        
                  <p className={styles.subtitle} style={{ lineHeight: 1.6 }}>
          <br /> Chart above is about confidence in self-directed learning and empathy.
          <br />Even after accounting for students' and schools' socio-economic profile, and mathematics performance,
          <br />We can see that more empathic students tend to have higher confidence in self-directed learning.
          <br />
        </p> */}

         <h3 style={{ color: '#333', paddingTop: '3rem' }}>Let&#39;s take a deep look.</h3>
         
        <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', gap: '2rem', paddingTop: '2rem', height: '500px' }}>
          
          <div style={{width: '50%'}}>
         <p className={styles.subtitle} style={{ lineHeight: 1.6 }} id="bar-explanation">  
          According to the OECD reports, 
          <br /><strong>Older </strong> students tend to report higher empathy than younger students.
          <br /> Also, interestingly, <strong>female</strong> students tend to report higher empathy.
          </p>
          <p className={styles.subtitle} style={{ lineHeight: 1.6 }}>  
          <h3>How&#39;s your class like?</h3> 
          Left bar chart shows the average empathy scores 
          <br /> by grade and gender in <strong>{country}</strong>.
          <br /> 

          <br /> The darker bar is for female students, 
          <br />and the lighter one is for male students.
          <br /> Click the bars to filter the students in the chart below.
         </p>
        </div>
        <GroupBarChart studentRows={filteredStudentData} onBarClick={handleBarClick} style={{ width: '50%' }} />
          </div>
          <p style={{ fontSize: '3rem', alignSelf: 'center' }}> ↓ </p>
           <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', gap: '2rem', height: '500px' }}>
        <CreativityScatter studentRows={creativityRows} onBarClick={handleBarClick} selectedBar={barFilter} />
        </div>
          

    <div style={{ fontFamily: 'NanumSquareNeo', paddingTop: '7rem', paddingBottom: '0rem',fontWeight: '600', textAlign: 'center', background: 'linear-gradient(180deg, #fff 0%, #020202 30%)' }}>
      <h3 style={{ color: '#333' }}>So, what can we do for students&#39; future?</h3>
      <p style={{lineHeight: 1.6, fontWeight: 400}}> We need to foster students&#39; social problem solving skills. 
        <br /> For that, we need to provide learning experiences to think about their society. </p>
        <GravityScatterPlot currentCountry={country} studentRows={filteredStudentData} />        
    </div>


    <div style={{ background: '#020202', paddingTop: '0rem' }}>
      <div>
        <p style={{ fontSize: '1.5rem', color: '#ccc', textAlign: 'center', fontWeight: '600', paddingTop: '4rem', paddingBottom: '2rem' }}>
          Data & References
        </p>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
         <p style={{ fontSize: '1.2rem', color: '#ccc', textAlign: 'left', maxWidth: '90%', margin: '0 auto', lineHeight: 1.6 }}>
          Data
        </p>
        <p style={{ fontSize: '0.75rem', color: '#ccc', textAlign: 'left', maxWidth: '90%', margin: '0 auto', paddingBottom: '2rem', lineHeight: 1.6 }}>
          <ul>
            OECD PISA 2022 Database, https://www.oecd.org/pisa/data/2022database/
          </ul>
          </p>
        <p style={{ fontSize: '1.2rem', color: '#ccc', textAlign: 'left', maxWidth: '90%', margin: '0 auto', lineHeight: 1.6 }}>
          References
        </p>
        <p style={{ fontSize: '0.75rem', color: '#ccc', textAlign: 'left', maxWidth: '90%', margin: '0 auto', paddingBottom: '4rem', lineHeight: 1.6 }}>
          <ul>
            <li>Doron, E. (2017). Fostering creativity in school aged children through perspective taking and visual media based short term intervention program. Thinking Skills and Creativity, 23, 150–160. https://doi.org/10.1016/j.tsc.2016.12.003</li>
            <li>Feshbach, N. D. (1978). Empathy in children: Some theoretical and empirical considerations. In N. Eisenberg-Berg (Ed.), Development of prosocial behavior (pp. 213–231). Academic Press.</li>
            <li>Grant, A. M., & Berry, J. W. (2011). The necessity of others is the mother of invention: Intrinsic and prosocial motivations, perspective taking, and creativity. The Academy of Management Journal, 54, 73–96. https://doi.org/10.5465/AMJ.2011.59215085</li>
            <li>Hope, E. (2014), “The role of sociopolitical attitudes and civic education in the civic engagement of black youth”, Journal of Research on Adolescence, Vol. 24/3, pp. 460-470.</li>
            <li>Kripal, S. J., & Reiter-Palmon, R. (2024). The role of empathy in problem construction and creative problem solving. Learning and Individual Differences, 114, 102501. https://doi.org/10.1016/j.lindif.2024.102501</li>
            <li>OECDa (2019), OECD Future of education and skills 2030: OECD Learning compass 20230 a series of concept notes, OECD Publishing, Paris.</li>
            <li>OECDb (2024), Social and emotional skills for better lives: Findings from the OECD survey on social and emotional Skills 2023, OECD Publishing, Paris, https://doi.org/10.1787/35ca7b7c-en.</li>
            <li>Spinrad, T. L., Eisenberg, N., Cumberland, A., Fabes, R. A., Valiente, C., Shepard, S. A., Reiser, M., Losoya, S. H., & Guthrie, I. K. (2006). Relation of emotion-related regulation to children's social competence: a longitudinal study. Emotion (Washington, D.C.), 6(3), 498–510. https://doi.org/10.1037/1528-3542.6.3.498</li>
            <li>Steponavičius, M., C. Gress-Wright and A. Linzarini (2023), “Social and emotional skills: Latest evidence on teachability and impact on life outcomes”, OECD Education Working Papers, No. 304, OECD Publishing, Paris, https://doi.org/10.1787/ba34f086-en.</li>
            <li>Wray‐Lake, L. (2011), “The developmental roots of social responsibility in childhood and adolescence.”, New directions for child and adolescent development, Vol. 2011/134, pp. 11-25.</li>
           </ul>
        </p>
        </div> 
    </div>
    </div>
    </div>
    </>
        )} 

    </>
  );
}

export async function getStaticProps() {
    // Use the SWR hook to fetch per-country student rows (client-safe)
  
  // SQL used to build the country summary. Keep this local so it's easy to reuse.
  const sql = 'SELECT * FROM workspace.students.emp_cr_by_country';

  try {
    
    let rows = [];

    if (serverHostName && token && httpPath) {
      // Try using the @databricks/sql client if env vars are provided.
      // Use await to ensure the query completes before returning props.
      try {
        // Dynamically import the Databricks client to avoid bundling server-only CJS into the client
        const mod = await import('@databricks/sql');
        const { DBSQLClient } = mod;
        const client = new DBSQLClient();
        const connectOptions = { token, host: serverHostName, path: httpPath };
        await client.connect(connectOptions);
        const session = await client.openSession();
        const queryOperation = await session.executeStatement(sql, { runAsync: true });
        const result = await queryOperation.fetchAll();
        await queryOperation.close();
        await session.close();
        await client.close();
        rows = result || [];

      } catch (err) {
        console.error('Databricks client query failed, falling back to API route:', err.message || err);
        rows = [];
      }
    }

    // Normalize returned rows (support both array-of-objects and array-of-arrays)
    const countries = (rows || [])
      .map(r => {
        if (!r) return null;
        // If row is an object with keys
        if (typeof r === 'object' && !Array.isArray(r) && r.country) {
          return {
            country: r.country,
            overallScore: Number(r.overallScore ?? r.overall_score ?? 0),
            socialSuccess: Number(r.socialSuccess ?? r.social_success ?? 0),
            empathyScore: Number(r.empathy_score ?? r.empathy_score ?? 0)
          };
        }
        // If row is an array-like result [country, overallScore, socialSuccess, cnt]
        if (Array.isArray(r)) {
          return {
            country: r[0],
            overallScore: Number(r[1] ?? 0),
            socialSuccess: Number(r[2] ?? 0),
            empathyScore: Number(r[3] ?? 0)
          };
        }
        return null;
      })
      .filter(Boolean);

    return {
      props: { countries },
      revalidate: 86400
    };

  } catch (err) {
    console.error('getStaticProps unexpected error:', err);
    return { props: { countries: [] } };
  }
}
