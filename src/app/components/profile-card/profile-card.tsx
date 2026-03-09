'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './profile-card.module.css'
import { Github, Linkedin } from 'lucide-react'
import { Mail } from 'lucide-react'

export default function ProfileCard() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 200)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={isVisible ? `${styles.profileCard} ${styles.visible}` : `${styles.profileCard} ${styles.hidden}`}>
                <div className={styles.profileImage}>
                    <Image 
                        src="/profile-picture.jpg" 
                        alt="Lucian Văleanu" 
                        className={styles.image}
                        width={130}
                        height={130}
                        priority
                    />
                </div>

                <div className={styles.profileInfo}>
                    <h2 className={styles.name}>
                        <span className={styles.firstName}>lucian</span> văleanu
                    </h2>
                    
                    <div className={styles.details}>
                        <p className={styles.description}>
                            Crafting digital experiences with code, creating art and fixing pipes.
                        </p>
                        
                        <div className={styles.contactInfo}>
                            <a href="mailto:valeanuluciangeorge@gmail.com" className={styles.contactItem}>
                                <span className={styles.contactIcon}><Mail /></span>
                            </a>
                            
                            <a href="https://github.com/lucianvaleanu" className={styles.contactItem} target="_blank" rel="noopener noreferrer">
                                <span className={styles.contactIcon}><Github /></span>
                            </a>
                            
                            <a href="https://linkedin.com/in/lucian-valeanu" className={styles.contactItem} target="_blank" rel="noopener noreferrer">
                                <span className={styles.contactIcon}><Linkedin /></span>
                            </a>
                        </div>
                    </div>
                </div>
        </div>
    );
}
