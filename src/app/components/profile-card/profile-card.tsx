'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './profile-card.module.css'

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
                                <span className={styles.contactIcon}>✉</span>
                                <span className={styles.contactText}>Mail</span>
                            </a>
                            
                            <a href="https://github.com/lucianvaleanu" className={styles.contactItem}>
                                <Image 
                                    src="/github-logo.png" 
                                    alt="GitHub" 
                                    className={styles.contactLogo}
                                    width={20}
                                    height={20}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallbackIcon) {
                                            fallbackIcon.style.display = 'inline';
                                        }
                                    }}
                                />
                                <span className={styles.contactIconFallback} style={{ display: 'none' }}>⚡</span>
                                <span className={styles.contactText}>Github</span>
                            </a>
                            
                            <a href="https://linkedin.com/in/lucian-valeanu" className={styles.contactItem}>
                                <Image 
                                    src="/linkedin-logo.png" 
                                    alt="LinkedIn" 
                                    className={styles.contactLogo}
                                    width={20}
                                    height={20}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallbackIcon) {
                                            fallbackIcon.style.display = 'inline';
                                        }
                                    }}
                                />
                                <span className={styles.contactIconFallback} style={{ display: 'none' }}>💼</span>
                                <span className={styles.contactText}>LinkedIn Profile</span>
                            </a>
                            
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📍</span>
                                <span className={styles.contactText}>Available for Projects</span>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}
