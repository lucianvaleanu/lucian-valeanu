"use client"

import { useState, useEffect } from 'react';
import TitleCard from './components/title-card/title-card';
import ProfileCard from './components/profile-card/profile-card';
import AboutCard from './components/about-card/about-card';
import Navbar from './components/navbar/navbar';
import ViataLaTara from './components/viata-la-tara/viata-la-tara';
import styles from './page.module.css';

export default function Home() {
  const [showTitleCard, setShowTitleCard] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'viata-la-tara'>('home');
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
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
    setIsFirstVisit(false);
  };

  const handleNavigate = (page: 'home' | 'about' | 'viata-la-tara') => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.pageContainer}>
      {!isFirstVisit && <Navbar onNavigate={handleNavigate} currentPage={currentPage} />}
      
      {showTitleCard && isFirstVisit && (
        <TitleCard onFadeComplete={handleTitleCardFadeComplete} />
      )}
      
      {currentPage === 'home' && showProfileCard && <ProfileCard />}
      
      {currentPage === 'about' && <AboutCard />}
      
      {currentPage === 'viata-la-tara' && <ViataLaTara />}
    </div>
  );
}