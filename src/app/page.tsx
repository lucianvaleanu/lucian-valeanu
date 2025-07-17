"use client"

import { useState, useEffect } from 'react';
import TitleCard from './components/title-card/title-card';
import ProfileCard from './components/profile-card/profile-card';
import './page.module.css';

export default function Home() {
  const [showTitleCard, setShowTitleCard] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
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

  // Helper function to reset for testing (can be called from browser console)
  useEffect(() => {
    // Add to window for testing
    (window as any).resetFirstVisit = () => {
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

  return (
    <>
      {showTitleCard && isFirstVisit && (
        <TitleCard onFadeComplete={handleTitleCardFadeComplete} />
      )}
      {showProfileCard && <ProfileCard />}
    </>
  );
}