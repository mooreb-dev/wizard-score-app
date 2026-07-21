import React from 'react';
import './ScoreTable.css';

/**
 * ScoreTable renders the historical ledger of all rounds.
 * Optimized with React.memo to prevent expensive nested map rendering during gameplay ticks.
 */
const ScoreTable = React.memo(({ players, roundHistory }) => {
  return (
    <div className="score-table-container">
      <div className="phase-header">
        <h2>Round Ledger</h2>
      </div>
      
      <div className="table-wrapper">
        <table className="score-table">
          <thead>
            <tr>
              <th className="round-col">Round</th>
              {players.map(player => (
                <th key={player.id} className="player-col">{player.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roundHistory.length === 0 ? (
              <tr>
                <td colSpan={players.length + 1} className="empty-state">
                  No rounds completed yet.
                </td>
              </tr>
            ) : (
              roundHistory.map((history) => (
                <tr key={history.round}>
                  <td className="round-col fw-bold">{history.round}</td>
                  {players.map(player => {
                    const bid = history.bids[player.id];
                    const won = history.tricksWon[player.id];
                    const delta = history.deltas[player.id];
                    const total = history.totals[player.id];
                    
                    return (
                      <td key={player.id} className="player-col">
                        <div className="score-cell">
                          <div className="score-bid-won">
                            Bid: {bid} &bull; Won: {won}
                          </div>
                          <div className={`score-delta ${delta > 0 ? 'positive' : delta < 0 ? 'negative' : ''}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </div>
                          <div className="score-total">{total}</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ScoreTable.displayName = 'ScoreTable';
export default ScoreTable;
