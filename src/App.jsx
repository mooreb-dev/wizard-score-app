import React, { useState, useRef, useEffect, useCallback } from 'react';
import SetupScreen from './components/SetupScreen';
import GameHeader from './components/GameHeader';
import BiddingPhase from './components/BiddingPhase';
import ResultsPhase from './components/ResultsPhase';
import Leaderboard from './components/Leaderboard';
import EndgameScreen from './components/EndgameScreen';
import ScoreTable from './components/ScoreTable';
import ErrorBoundary from './components/ErrorBoundary';
import { Logger } from './utils/logger';
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react';
import './App.css';

/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string} name
 * @property {number} [totalScore]
 * @property {number} [lastDelta]
 */

/**
 * @typedef {Object} RoundHistoryEntry
 * @property {number} round
 * @property {Record<string, number>} bids
 * @property {Record<string, number>} tricksWon
 * @property {Record<string, number>} deltas
 * @property {Record<string, number>} totals
 */

/**
 * Defines the sequential states of the application flow.
 * @enum {string}
 */
const PHASE = {
  SETUP: 'SETUP',
  BIDDING: 'BIDDING',
  RESULTS: 'RESULTS',
  ENDGAME: 'ENDGAME',
};

// --- Custom Hooks ---

/**
 * Tracks user activity (mouse, touch, scroll) to manage a global idle state.
 * This is used to conditionally hide UI elements like pagination dots for a cleaner aesthetic during gameplay.
 */
const useIdleTimer = (timeoutMs = 2500) => {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef(null);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    resetIdleTimer();
    const eventOptions = { passive: true };
    
    window.addEventListener('mousemove', resetIdleTimer, eventOptions);
    window.addEventListener('touchstart', resetIdleTimer, eventOptions);
    window.addEventListener('scroll', resetIdleTimer, true);
    
    return () => {
      window.removeEventListener('mousemove', resetIdleTimer, eventOptions);
      window.removeEventListener('touchstart', resetIdleTimer, eventOptions);
      window.removeEventListener('scroll', resetIdleTimer, true);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [resetIdleTimer]);

  return isIdle;
};

// --- Helper Functions ---

/**
 * Core business logic: Calculates score delta per standard Wizard rules.
 * Exact prediction yields +20 points plus 10 per trick.
 * Incorrect prediction deducts 10 points per trick missed.
 */
const calculateScoreDelta = (bid, won) => {
  // Strict defensive validation to prevent NaN propagation
  if (typeof bid !== 'number' || typeof won !== 'number') return 0;
  return bid === won 
    ? 20 + (won * 10) 
    : -Math.abs(bid - won) * 10;
};

// --- Sub-Components ---

const Sidebar = React.memo(({ 
  isExpanded, 
  onToggle, 
  players, 
  onEndGameEarly, 
  onQuitToSetup 
}) => (
  <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
    <div 
      className="sidebar-mobile-toggle" 
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={18} color="var(--accent-purple)" />
        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Leaderboard</span>
      </div>
      {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
    </div>
    
    <Leaderboard players={players || []} />
    
    <div className="sidebar-footer">
      <button 
        className="btn-primary" 
        style={{ width: '100%', backgroundColor: 'var(--success-green)' }} 
        onClick={onEndGameEarly}
        type="button"
      >
        End Game Early
      </button>
      <button 
        className="btn-primary" 
        style={{ width: '100%', backgroundColor: 'var(--error-red)' }} 
        onClick={onQuitToSetup}
        type="button"
      >
        Quit to Setup
      </button>
    </div>
  </div>
));

Sidebar.displayName = 'Sidebar';

const PaginationDots = React.memo(({ isIdle, activePage, onScrollToPage }) => (
  <div className={`pagination-dots ${isIdle ? 'hidden' : ''}`}>
    <button 
      className={`dot ${activePage === 0 ? 'active' : ''}`} 
      onClick={() => onScrollToPage(0)}
      aria-label="Go to Game Phase"
      type="button"
    />
    <button 
      className={`dot ${activePage === 1 ? 'active' : ''}`} 
      onClick={() => onScrollToPage(1)}
      aria-label="Go to Score Table"
      type="button"
    />
  </div>
));

PaginationDots.displayName = 'PaginationDots';

// --- Main Component ---

export default function App() {
  // Game State
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [players, setPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [lockedBids, setLockedBids] = useState({});
  const [roundHistory, setRoundHistory] = useState([]);
  
  // UI State
  const [activePage, setActivePage] = useState(0); 
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const isIdle = useIdleTimer(2500);

  // --- Handlers with Try/Catch Wrappers ---

  /** Initializes game state and derives max rounds based on player count (60 card deck). */
  const handleStartGame = useCallback((initialPlayers) => {
    try {
      if (!Array.isArray(initialPlayers) || initialPlayers.length === 0) {
        throw new Error('Invalid or empty initial players payload received.');
      }
      
      const playersWithScores = initialPlayers.map(p => ({
        ...p,
        totalScore: 0,
        lastDelta: 0
      }));
      
      setPlayers(playersWithScores);
      setMaxRounds(Math.floor(60 / initialPlayers.length));
      setCurrentRound(1);
      setDealerIndex(0);
      setRoundHistory([]);
      setPhase(PHASE.BIDDING);
    } catch (error) {
      Logger.error('App:handleStartGame', error, { initialPlayers });
    }
  }, []);

  /** Freezes bids and transitions to the trick-resolution phase. */
  const handleLockBids = useCallback((bids) => {
    try {
      if (!bids || Object.keys(bids).length === 0) {
        throw new Error('Attempted to lock undefined or empty bids object.');
      }
      setLockedBids(bids);
      setPhase(PHASE.RESULTS);
    } catch (error) {
      Logger.error('App:handleLockBids', error, { bids });
    }
  }, []);

  /** Calculates deltas, archives the round data, and advances the game state. */
  const handleEndRound = useCallback((tricksWon) => {
    try {
      if (!tricksWon || Object.keys(tricksWon).length === 0) {
        throw new Error('Received invalid tricksWon payload.');
      }

      const deltas = {};
      const totals = {};

      const updatedPlayers = players.map(player => {
        const bid = lockedBids[player.id];
        const won = tricksWon[player.id];
        
        // Ensure structural data integrity across all player records
        if (bid === undefined || won === undefined) {
          throw new Error(`Data corruption: Missing bid or tricks won for player ${player.id}`);
        }

        const scoreDelta = calculateScoreDelta(bid, won);

        deltas[player.id] = scoreDelta;
        totals[player.id] = (player.totalScore || 0) + scoreDelta;

        return {
          ...player,
          totalScore: totals[player.id],
          lastDelta: scoreDelta
        };
      });

      const historyEntry = {
        round: currentRound,
        bids: { ...lockedBids },
        tricksWon: { ...tricksWon },
        deltas,
        totals
      };

      setRoundHistory(prev => [...prev, historyEntry]);
      setPlayers(updatedPlayers);

      // Branch to endgame if deck capacity was reached
      if (currentRound >= maxRounds) {
        setPhase(PHASE.ENDGAME);
        setActivePage(0);
      } else {
        setCurrentRound(prev => prev + 1);
        setDealerIndex(prev => (prev + 1) % players.length);
        setPhase(PHASE.BIDDING);
        scrollToPage(0);
      }
    } catch (error) {
      Logger.error('App:handleEndRound', error, { tricksWon, lockedBids, currentRound });
    }
  }, [players, lockedBids, currentRound, maxRounds]);

  const handleNewGame = useCallback(() => {
    try {
      setPhase(PHASE.SETUP);
      setPlayers([]);
      setRoundHistory([]);
      setActivePage(0);
    } catch (error) {
      Logger.error('App:handleNewGame', error);
    }
  }, []);

  // --- Scrolling Logic ---

  /** Synchronizes UI active pagination state with physical scroll position. */
  const handleScroll = useCallback(() => {
    try {
      if (!scrollContainerRef.current) return;
      
      const { scrollTop, clientHeight } = scrollContainerRef.current;
      if (clientHeight === 0) return; 
      
      const pageIndex = Math.round(scrollTop / clientHeight);
      if (pageIndex !== activePage) {
        setActivePage(pageIndex);
      }
    } catch (error) {
      Logger.error('App:handleScroll', error);
    }
  }, [activePage]);

  const scrollToPage = useCallback((index) => {
    try {
      if (!scrollContainerRef.current) return;
      
      const { clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: index * clientHeight,
        behavior: 'smooth'
      });
      setActivePage(index);
    } catch (error) {
      Logger.error('App:scrollToPage', error, { targetIndex: index });
    }
  }, []);

  const handleMainContentClick = useCallback(() => {
    // Auto-collapse sidebar on mobile breakpoints when interacting with main UI
    if (isSidebarExpanded && window.innerWidth <= 900) {
      setIsSidebarExpanded(false);
    }
  }, [isSidebarExpanded]);

  // --- Render Helpers ---

  const renderGamePhase = () => {
    switch (phase) {
      case PHASE.SETUP:
        return <SetupScreen onStartGame={handleStartGame} />;
      case PHASE.BIDDING:
        return (
          <>
            <GameHeader currentRound={currentRound} maxRounds={maxRounds} />
            <BiddingPhase 
              players={players} 
              currentRound={currentRound} 
              onLockBids={handleLockBids} 
            />
          </>
        );
      case PHASE.RESULTS:
        return (
          <>
            <GameHeader currentRound={currentRound} maxRounds={maxRounds} />
            <ResultsPhase 
              players={players} 
              currentRound={currentRound} 
              lockedBids={lockedBids} 
              onEndRound={handleEndRound} 
              onBack={() => setPhase(PHASE.BIDDING)}
            />
          </>
        );
      case PHASE.ENDGAME:
        return (
          <EndgameScreen 
            players={players} 
            roundHistory={roundHistory}
            onNewGame={handleNewGame} 
          />
        );
      default:
        return null;
    }
  };

  const isGameActive = phase !== PHASE.SETUP && phase !== PHASE.ENDGAME;

  return (
    <ErrorBoundary>
      <div className="app-container">
        {phase !== PHASE.SETUP && (
          <Sidebar 
            isExpanded={isSidebarExpanded}
            onToggle={() => setIsSidebarExpanded(prev => !prev)}
            players={players}
            onEndGameEarly={() => {
              setPhase(PHASE.ENDGAME);
              setActivePage(0);
              setIsSidebarExpanded(false);
            }}
            onQuitToSetup={handleNewGame}
          />
        )}

        <main className="main-content" onClick={handleMainContentClick}>
          {isGameActive && (
            <PaginationDots 
              isIdle={isIdle} 
              activePage={activePage} 
              onScrollToPage={scrollToPage} 
            />
          )}

          <div 
            className="scroll-container" 
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <div className="page game-page">
              <div className="page-content">
                {renderGamePhase()}
              </div>
            </div>

            {isGameActive && (
              <div className="page ledger-page">
                <div className="page-content">
                  <ScoreTable players={players} roundHistory={roundHistory} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
