import React, { useState, useMemo } from 'react';
import { Trophy, RefreshCw, Flame, TrendingDown, TrendingUp, Skull } from 'lucide-react';
import './EndgameScreen.css';

export default function EndgameScreen({ players, roundHistory, onNewGame }) {
  const [showStats, setShowStats] = useState(false);

  // Sort players descending
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedPlayers[0];

  const stats = useMemo(() => {
    let bestStreak = { player: '-', count: 0 };
    let worstStreak = { player: '-', count: 0 };
    let mostPoints = { player: '-', points: 0 };
    let biggestLoss = { player: '-', points: 0 };

    if (!roundHistory || roundHistory.length === 0) {
      return { bestStreak, worstStreak, mostPoints, biggestLoss };
    }

    const currentStreaks = {};
    players.forEach(p => {
      currentStreaks[p.id] = { type: null, count: 0 };
    });

    roundHistory.forEach(round => {
      players.forEach(p => {
        const delta = round.deltas[p.id];
        const isHit = round.bids[p.id] === round.tricksWon[p.id];

        // Max points / Biggest loss
        if (delta > mostPoints.points) {
          mostPoints = { player: p.name, points: delta };
        }
        if (delta < biggestLoss.points) {
          biggestLoss = { player: p.name, points: delta };
        }

        // Streaks
        const playerStreak = currentStreaks[p.id];
        const currentType = isHit ? 'hit' : 'miss';

        if (playerStreak.type === currentType) {
          playerStreak.count += 1;
        } else {
          playerStreak.type = currentType;
          playerStreak.count = 1;
        }

        if (playerStreak.type === 'hit' && playerStreak.count > bestStreak.count) {
          bestStreak = { player: p.name, count: playerStreak.count };
        }
        if (playerStreak.type === 'miss' && playerStreak.count > worstStreak.count) {
          worstStreak = { player: p.name, count: playerStreak.count };
        }
      });
    });

    return { bestStreak, worstStreak, mostPoints, biggestLoss };
  }, [players, roundHistory]);

  if (!showStats) {
    return (
      <div className="endgame-splash animate-fade-in">
        <div className="confetti-container">
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
        </div>
        <div className="splash-content">
          <Trophy size={80} color="var(--accent-purple)" className="splash-icon" />
          <h1 className="splash-title">We have a Winner!</h1>
          <h2 className="splash-winner-name">{winner.name}</h2>
          <p className="splash-score">{winner.totalScore} points</p>
          
          <button className="btn-primary view-stats-btn" onClick={() => setShowStats(true)}>
            View Match Stats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="endgame-screen animate-slide-in">
      <div className="podium-card card">
        <div className="winner-header">
          <Trophy size={48} color="var(--accent-purple)" className="winner-icon" />
          <h2>{winner.name} Wins!</h2>
          <p className="winning-score">{winner.totalScore} points</p>
        </div>

        <div className="match-stats-section">
          <h3>Match Superlatives</h3>
          <div className="stats-grid">
            <div className="stat-card best-streak">
              <Flame size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Hot Streak</span>
                <span className="stat-value">{stats.bestStreak.player} ({stats.bestStreak.count} hits)</span>
              </div>
            </div>
            
            <div className="stat-card worst-streak">
              <Skull size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Cold Streak</span>
                <span className="stat-value">{stats.worstStreak.player} ({stats.worstStreak.count} misses)</span>
              </div>
            </div>

            <div className="stat-card most-points">
              <TrendingUp size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Best Round</span>
                <span className="stat-value">{stats.mostPoints.player} (+{stats.mostPoints.points})</span>
              </div>
            </div>

            <div className="stat-card biggest-loss">
              <TrendingDown size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Biggest Loss</span>
                <span className="stat-value">{stats.biggestLoss.player} ({stats.biggestLoss.points})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="final-standings">
          <h3>Final Standings</h3>
          <div className="standings-list">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="standing-row">
                <span className="standing-rank">#{index + 1}</span>
                <span className="standing-name">{player.name}</span>
                <span className="standing-score">{player.totalScore}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary full-width new-game-btn" onClick={onNewGame}>
          <RefreshCw size={20} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
          New Game
        </button>
      </div>
    </div>
  );
}
