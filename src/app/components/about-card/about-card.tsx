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
                        i’m a recent graduate from babeș-bolyai university, holding a bsc in computer science.
                        i’m a huge geek with a strong passion for full-stack development and a growing interest in artificial intelligence.

                        when i’m not coding, you’ll probably find me experimenting with photography or adding creative touches through digital sketches. you can explore some of my personal work in the ‘viața la țară’ section.

                        if you’re curious about my professional experience, feel free to check out my cv <a href="/curriculum-vitae.pdf">here</a>.
                    </p>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Skills</h3>
                    <div className={styles.skillsList}>
                        <span className={styles.skill}>React</span>
                        <span className={styles.skill}>Next.js</span>
                        <span className={styles.skill}>TypeScript</span>
                        <span className={styles.skill}>Node.js</span>
                        <span className={styles.skill}>CSS</span>
                        <span className={styles.skill}>Plumbing</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Interests</h3>
                    <p className={styles.text}>
                        Digital art, minimalist design, sustainable technology, and helping people
                        with both their code problems and plumbing emergencies.
                    </p>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Philosophy</h3>
                    <p className={styles.quote}>
                        &ldquo;Whether it&rsquo;s code or pipes, everything should flow smoothly.&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
