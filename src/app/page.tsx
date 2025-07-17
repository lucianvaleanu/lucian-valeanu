"use client"

import { useState, useEffect } from 'react';
import TitleCard from './components/title-card/title-card';
import ProfileCard from './components/profile-card/profile-card';
import AboutCard from './components/about-card/about-card';
import Navbar from './components/navbar/navbar';
import styles from './page.module.css';

export default function Home() {
  const [showTitleCard, setShowTitleCard] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'viata-la-tara'>('home');
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    console.log('hasVisitedBefore:', hasVisitedBefore); // Debug log
    
    if (hasVisitedBefore === 'true') {
      console.log('Returning visitor - showing profile card immediately');
      setShowTitleCard(false);
      setShowProfileCard(true);
      setIsFirstVisit(false);
    } else {
      console.log('First time visitor - showing title card');
      setShowTitleCard(true);
      setShowProfileCard(false);
      setIsFirstVisit(true);
    }
  }, []);

  useEffect(() => {
    (window as Window & typeof globalThis & { resetFirstVisit?: () => void }).resetFirstVisit = () => {
      localStorage.removeItem('hasVisitedBefore');
      window.location.reload();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        localStorage.removeItem('hasVisitedBefore');
        window.location.reload();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTitleCardFadeComplete = () => {
    localStorage.setItem('hasVisitedBefore', 'true');
    
    setShowTitleCard(false);
    setShowProfileCard(true);
  };

  const handleNavigate = (page: 'home' | 'about' | 'viata-la-tara') => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      
      {showTitleCard && isFirstVisit && (
        <TitleCard onFadeComplete={handleTitleCardFadeComplete} />
      )}
      
      {currentPage === 'home' && showProfileCard && <ProfileCard />}
      
      {currentPage === 'about' && <AboutCard />}
      
      {currentPage === 'viata-la-tara' && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#718096',
          fontFamily: 'Roboto, sans-serif'
        }}>
          <h2>Viața la Țară</h2>
          <p>Coming soon...</p>
        </div>
      )}
    </div>
  );
}