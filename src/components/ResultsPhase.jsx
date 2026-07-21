import React, { useState, useMemo, useCallback } from 'react';
import Stepper from './Stepper';
import './Phase.css';

/**
 * ResultsPhase collects the actual tricks won by each player at the end of a round.
 * Validates that total tricks won strictly equals the total tricks available in the round.
 */
const ResultsPhase = React.memo(({ players, currentRound, lockedBids, onEndRound, onBack }) => {
  // Lazy initialize state to map each player ID to 0 tricks won initially
  const [tricksWon, setTricksWon] = useState(() => {
    const initialTricks = {};
    players.forEach(p => {
      initialTricks[p.id] = 0;
    });
    return initialTricks;
  });

  // Derived state: Aggregates total tricks entered across all players
  const totalTricksWon = useMemo(() => {
    return Object.values(tricksWon).reduce((sum, val) => sum + val, 0);
  }, [tricksWon]);
  
  // Logical constraint: Total tricks won must match current round count exactly
  const isValid = totalTricksWon === currentRound;

  const handleTricksChange = useCallback((id, won) => {
    setTricksWon(prev => ({ ...prev, [id]: won }));
  }, []);

  const handleEndRound = useCallback(() => {
    if (isValid) {
      onEndRound(tricksWon);
    }
  }, [isValid, tricksWon, onEndRound]);

  return (
    <div className="phase-container animate-slide-in">
      <div className="phase-card card">
        <div className="phase-header">
          <h2>Results Phase</h2>
          <p>Enter the number of tricks each player won</p>
        </div>

        <div className="stats-bar">
          <div className="stat-box">
            <span className="stat-label">Total Tricks in Round</span>
            <span className="stat-value">{currentRound}</span>
          </div>
          <div className={`stat-box ${isValid ? 'even' : 'overbid'}`}>
            <span className="stat-label">Tricks Entered</span>
            <span className="stat-value">{totalTricksWon}</span>
          </div>
        </div>

        <div className="players-grid">
          {players.map(player => (
            <div key={player.id} className="player-row">
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-bid-info">
                  Bid: {lockedBids[player.id]}
                </div>
              </div>
              <Stepper 
                value={tricksWon[player.id]} 
                onChange={(val) => handleTricksChange(player.id, val)} 
                min={0} 
                max={currentRound} 
                label="Won"
              />
            </div>
          ))}
        </div>

        <div className="phase-footer">
          {!isValid && (
            <div className="warning-message">
              The total tricks won ({totalTricksWon}) must exactly equal the total tricks in the round ({currentRound}).
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-secondary full-width" 
              onClick={onBack}
              style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
            >
              Back to Bids
            </button>
            <button 
              className="btn-primary full-width" 
              onClick={handleEndRound}
              disabled={!isValid}
              style={{ flex: 2 }}
            >
              End Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ResultsPhase.displayName = 'ResultsPhase';
export default ResultsPhase;
