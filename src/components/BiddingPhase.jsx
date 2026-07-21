import React, { useState, useMemo, useCallback } from 'react';
import Stepper from './Stepper';
import './Phase.css'; // Shared styles for bidding and results

/**
 * BiddingPhase handles the prediction input for all players at the start of a round.
 * Tracks total bids relative to available tricks to visually indicate overbid/underbid status.
 */
const BiddingPhase = React.memo(({ players, currentRound, onLockBids }) => {
  // Lazy initialize state to map each player ID to a bid value of 0
  const [bids, setBids] = useState(() => {
    const initialBids = {};
    players.forEach(p => {
      initialBids[p.id] = 0;
    });
    return initialBids;
  });

  // Derived state: Calculates the sum of all current bids. Memoized to avoid loop recalculation.
  const totalBids = useMemo(() => {
    return Object.values(bids).reduce((sum, val) => sum + val, 0);
  }, [bids]);

  const isOverbid = totalBids > currentRound;
  const isUnderbid = totalBids < currentRound;
  const isEven = totalBids === currentRound;

  const handleBidChange = useCallback((id, newBid) => {
    setBids(prev => ({ ...prev, [id]: newBid }));
  }, []);

  const handleLockBids = useCallback(() => {
    onLockBids(bids);
  }, [bids, onLockBids]);

  return (
    <div className="phase-container animate-slide-in">
      <div className="phase-card card">
        <div className="phase-header">
          <h2>Bidding Phase</h2>
          <p>Predict how many tricks you will win</p>
        </div>

        <div className="stats-bar">
          <div className="stat-box">
            <span className="stat-label">Available Tricks</span>
            <span className="stat-value">{currentRound}</span>
          </div>
          <div className={`stat-box ${isOverbid ? 'overbid' : isUnderbid ? 'underbid' : 'even'}`}>
            <span className="stat-label">Total Bid</span>
            <span className="stat-value">{totalBids}</span>
          </div>
        </div>

        <div className="players-grid">
          {players.map(player => (
            <div key={player.id} className="player-row">
              <div className="player-name">{player.name}</div>
              <Stepper 
                value={bids[player.id]} 
                onChange={(val) => handleBidChange(player.id, val)} 
                min={0} 
                max={currentRound} 
              />
            </div>
          ))}
        </div>

        <div className="phase-footer">
          <button className="btn-primary full-width" onClick={handleLockBids}>
            Lock Bids
          </button>
        </div>
      </div>
    </div>
  );
});

BiddingPhase.displayName = 'BiddingPhase';
export default BiddingPhase;
