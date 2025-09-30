import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import InterestVisualization from '../components/visualization/InterestVisualization'


export default function Home() {
    return (
        <>
         <Head>
        <title>ThinkMate - AI 협업 아이디어 플랫폼</title>
        <meta name="description" content="학생들의 관심사를 시각화하고 AI가 프로젝트 아이디어를 제안하는 협업 플랫폼" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        
        
        <main className={styles.mainContent}>
          <InterestVisualization />
        </main>
      </div>
        </>
    )
}