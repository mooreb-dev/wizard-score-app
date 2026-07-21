import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import './Leaderboard.css';

export default function Leaderboard({ players }) {
  const [sortedPlayers, setSortedPlayers] = useState([]);

  useEffect(() => {
    // Sort players by total score, descending
    const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
    setSortedPlayers(sorted);
  }, [players]);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <Trophy size={24} color="var(--accent-purple)" />
        <h2>Leaderboard</h2>
      </div>
      
      <div className="leaderboard-list">
        {sortedPlayers.map((player, index) => {
          const isWinner = index === 0 && player.totalScore > 0;
          
          return (
            <div 
              key={player.id} 
              className={`leaderboard-item ${isWinner ? 'first-place' : ''}`}
            >
              <div className="rank">{index + 1}</div>
              <div className="player-details">
                <div className="player-name">{player.name}</div>
                {player.lastDelta !== undefined && player.lastDelta !== 0 && (
                  <div className={`score-delta ${player.lastDelta > 0 ? 'positive' : 'negative'} animate-fade-out`}>
                    {player.lastDelta > 0 ? '+' : ''}{player.lastDelta}
                  </div>
                )}
              </div>
              <div className="player-score">{player.totalScore}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
