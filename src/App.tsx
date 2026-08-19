/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, UserStats } from './types';
import { loadUserStats, saveUserStats, checkBadges } from './utils/storage';
import { sounds } from './utils/persian';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PracticeView } from './components/PracticeView';
import { LearnView } from './components/LearnView';
import { ConceptView } from './components/ConceptView';
import { TricksView } from './components/TricksView';
import { SpeedChallengeView } from './components/SpeedChallengeView';
import { RecordsView } from './components/RecordsView';
import { ProfileView } from './components/ProfileView';
import { SummaryView } from './components/SummaryView';
import { AboutView } from './components/AboutView';
import { PythagorasView } from './components/PythagorasView';
import { WorksheetView } from './components/WorksheetView';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('concept');
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats());
  const [focusedTableForPractice, setFocusedTableForPractice] = useState<number | null>(null);
  const [isGameSessionActive, setIsGameSessionActive] = useState<boolean>(false);

  // View keys to force remount of subview state when top-level nav is tapped
  const [viewKeys, setViewKeys] = useState<Record<AppView, number>>({
    concept: 0,
    tricks: 0,
    summary: 0,
    practice: 0,
    learn: 0,
    speed: 0,
    records: 0,
    profile: 0,
    about: 0,
    pythagoras: 0,
    worksheet: 0,
  });

  // Load and save user stats sync & audio setup
  useEffect(() => {
    const loaded = loadUserStats();
    const verified = checkBadges(loaded);
    setUserStats(verified);
    sounds.setSettings(verified.soundEnabled);
    sounds.preloadKeyAudio();
  }, []);

  // Update sound settings whenever soundEnabled changes
  useEffect(() => {
    sounds.setSettings(userStats.soundEnabled);
  }, [userStats.soundEnabled]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, viewKeys]);

  const handleUpdateStats = (newStats: UserStats) => {
    const checked = checkBadges(newStats);
    setUserStats(checked);
    saveUserStats(checked);
  };

  const handleToggleSound = () => {
    if (userStats.soundEnabled) {
      sounds.stopSpeech();
    }
    const updated = { ...userStats, soundEnabled: !userStats.soundEnabled };
    handleUpdateStats(updated);
  };

  const handleNavigate = (view: AppView) => {
    if (view !== 'speed') {
      setFocusedTableForPractice(null);
    }
    setIsGameSessionActive(false);
    // Increment view key so any active subview/detail state resets to root
    setViewKeys((prev) => ({
      ...prev,
      [view]: prev[view] + 1,
    }));
    setCurrentView(view);
  };

  const handleStartTablePractice = (tableNum: number) => {
    setFocusedTableForPractice(tableNum);
    setViewKeys((prev) => ({
      ...prev,
      speed: prev.speed + 1,
    }));
    setCurrentView('speed');
  };

  const handleStartWeaknessPractice = () => {
    handleNavigate('practice');
  };

  return (
    <div className="min-h-screen bg-amber-50/60 text-slate-800 font-['Estedad',sans-serif] selection:bg-amber-200 flex flex-col dir-rtl">
      
      {/* Header */}
      {!isGameSessionActive && (
        <Header
          stats={userStats}
          onToggleSound={handleToggleSound}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'concept' && (
          <ConceptView
            key={`concept-${viewKeys.concept}`}
            stats={userStats}
            onStartTablePractice={handleStartTablePractice}
            onNavigateToPractice={() => handleNavigate('practice')}
          />
        )}

        {currentView === 'tricks' && (
          <TricksView
            key={`tricks-${viewKeys.tricks}`}
            onNavigateToPractice={() => handleNavigate('practice')}
          />
        )}

        {currentView === 'summary' && (
          <SummaryView
            key={`summary-${viewKeys.summary}`}
            stats={userStats}
            onStartPractice={() => handleNavigate('practice')}
            onNavigateToLearn={() => handleNavigate('learn')}
          />
        )}

        {currentView === 'practice' && (
          <PracticeView
            key={`practice-${viewKeys.practice}`}
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onNavigateToLearn={() => handleNavigate('learn')}
            onSessionActiveStateChange={setIsGameSessionActive}
          />
        )}

        {currentView === 'learn' && (
          <LearnView
            key={`learn-${viewKeys.learn}`}
            stats={userStats}
            onStartTablePractice={handleStartTablePractice}
            onNavigateToConcept={() => handleNavigate('concept')}
            onNavigateToPythagoras={() => handleNavigate('pythagoras')}
            onNavigateToWorksheet={() => handleNavigate('worksheet')}
          />
        )}

        {currentView === 'speed' && (
          <SpeedChallengeView
            key={`speed-${viewKeys.speed}-${focusedTableForPractice ?? 'all'}`}
            stats={userStats}
            initialTable={focusedTableForPractice}
            onUpdateStats={handleUpdateStats}
            onBackToMenu={() => {
              if (focusedTableForPractice) {
                setFocusedTableForPractice(null);
                handleNavigate('learn');
              } else {
                handleNavigate('practice');
              }
            }}
          />
        )}

        {currentView === 'records' && (
          <RecordsView
            key={`records-${viewKeys.records}`}
            stats={userStats}
            onStartTablePractice={handleStartTablePractice}
            onNavigateToSpeed={() => handleNavigate('speed')}
            onNavigateToPractice={() => handleNavigate('practice')}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            key={`profile-${viewKeys.profile}`}
            stats={userStats}
            onUpdateStats={handleUpdateStats}
            onStartFocusedPractice={handleStartWeaknessPractice}
            onNavigateToRecords={() => handleNavigate('records')}
            onNavigateToAbout={() => handleNavigate('about')}
            onNavigateToPythagoras={() => handleNavigate('pythagoras')}
            onNavigateToWorksheet={() => handleNavigate('worksheet')}
          />
        )}

        {currentView === 'about' && (
          <AboutView
            key={`about-${viewKeys.about}`}
            stats={userStats}
            onBack={() => handleNavigate('profile')}
          />
        )}

        {currentView === 'pythagoras' && (
          <PythagorasView
            key={`pythagoras-${viewKeys.pythagoras}`}
            stats={userStats}
            onBack={() => handleNavigate('learn')}
            onStartPractice={handleStartTablePractice}
          />
        )}

        {currentView === 'worksheet' && (
          <WorksheetView
            key={`worksheet-${viewKeys.worksheet}`}
            onBack={() => handleNavigate('learn')}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {!isGameSessionActive && (
        <BottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
        />
      )}

    </div>
  );
}
