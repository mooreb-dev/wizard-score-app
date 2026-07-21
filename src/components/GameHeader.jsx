import React from 'react';

export default function GameHeader({ currentRound, maxRounds }) {
  return (
    <div className="header animate-slide-in">
      <h1>Wizard Scorekeeper</h1>
      <div className="header-subtitle">
        Round {currentRound} of {maxRounds}
      </div>
    </div>
  );
}
