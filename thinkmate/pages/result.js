import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Analysis.module.css'
import homeStyles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import ChatBox from '../components/ChatBox'

export default function Result() {
    return(
        <>
            <Head>
                <title>ThinkMate</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.wrapper}>
                <div style={{ position: 'absolute', background: "linear-gradient(#fff, #B4A499)" }}>
                            <ChatBox />
                        </div>
            </div>
        </>
    )
}