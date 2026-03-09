"use client"

import { useState, useEffect } from 'react'
import styles from './title-card.module.css'

interface TitleCardProps {
  onFadeComplete?: () => void;
}

export default function TitleCard({ onFadeComplete }: TitleCardProps){
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            
            setTimeout(() => {
                onFadeComplete?.();
            }, 500);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFadeComplete]);

    return(
        <main className={`${styles.mainBody} ${!isVisible ? styles.fadeOut : ''}`}>
            <div className={styles.titleAndSubtitle}>
                <h1 className={styles.title}> <span className={styles.highlightedText}>lucian</span> văleanu </h1>
                <h2 className={styles.subtitle}>developer, artist and plumber </h2>
            </div>
        </main>
    );
}