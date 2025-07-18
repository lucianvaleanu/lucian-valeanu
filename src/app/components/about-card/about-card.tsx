'use client'

import { useState, useEffect } from 'react'
import styles from './about-card.module.css'

export default function AboutCard() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 400)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={isVisible ? `${styles.aboutCard} ${styles.visible}` : `${styles.aboutCard} ${styles.hidden}`}>
            <div className={styles.aboutHeader}>
                <h2 className={styles.title}>About Me</h2>
                <div className={styles.titleLine}></div>
            </div>

            <div className={styles.aboutContent}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Background</h3>
                    <p className={styles.text}>         
                        I&apos;m a recent graduate from &ldquo;Babeș-Bolyai&rdquo; university, holding a BSc in Computer Science.
                        I&apos;m a huge geek with a strong passion for full-stack development and a growing interest in artificial intelligence.
                        When I&apos;m not coding, you&apos;ll probably find me experimenting with photography or adding creative touches through digital sketches. You can explore some of my personal work in the &apos;viața la țară&apos; section.
                        If you&apos;re curious about my professional experience, feel free to check out my CV <a href="/curriculum-vitae.pdf">here</a>.
                    </p>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Skills</h3>
                    <div className={styles.skillsList}>
                        <span className={styles.skill}>React</span>
                        <span className={styles.skill}>Next.js</span>
                        <span className={styles.skill}>TypeScript</span>
                        <span className={styles.skill}>Node.js</span>
                        <span className={styles.skill}>Angular</span>
                        <span className={styles.skill}>MySQL</span>
                        <span className={styles.skill}>PostgreSQL</span>
                        <span className={styles.skill}>Azure Services</span>

                    </div>
                </div>
            </div>
        </div>
    );
}
