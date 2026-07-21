import React, { useState, useEffect } from 'react';
import { Plus, X, UserPlus } from 'lucide-react';
import './SetupScreen.css';

const ROSTER_KEY = 'wizard_roster';

export default function SetupScreen({ onStartGame }) {
  const [roster, setRoster] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Load roster from localStorage on mount
  useEffect(() => {
    const savedRoster = localStorage.getItem(ROSTER_KEY);
    if (savedRoster) {
      try {
        setRoster(JSON.parse(savedRoster));
      } catch (e) {
        console.error("Failed to parse roster", e);
      }
    }
  }, []);

  const saveRoster = (newRoster) => {
    setRoster(newRoster);
    localStorage.setItem(ROSTER_KEY, JSON.stringify(newRoster));
  };

  const handleAddFromRoster = (name) => {
    if (selectedPlayers.length >= 6) return;
    if (selectedPlayers.some(p => p.name === name)) return; // Already selected
    
    setSelectedPlayers([...selectedPlayers, { id: Date.now().toString() + Math.random(), name }]);
  };

  const handleRemovePlayer = (id) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== id));
  };

  const handleAddNewPlayer = (e) => {
    e.preventDefault();
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) return;
    if (selectedPlayers.length >= 6) return;
    
    // Add to selected players
    setSelectedPlayers([...selectedPlayers, { id: Date.now().toString() + Math.random(), name: trimmedName }]);
    
    // Add to roster if not exists
    if (!roster.includes(trimmedName)) {
      saveRoster([...roster, trimmedName]);
    }
    
    setNewPlayerName('');
  };

  const handleStartGame = () => {
    if (selectedPlayers.length >= 3 && selectedPlayers.length <= 6) {
      onStartGame(selectedPlayers);
    }
  };

  const availableRoster = roster.filter(name => !selectedPlayers.some(p => p.name === name));
  const canStart = selectedPlayers.length >= 3 && selectedPlayers.length <= 6;

  return (
    <div className="setup-screen animate-slide-in">
      <div className="setup-card card">
        <div className="setup-header">
          <h2>Game Setup</h2>
          <p>Select 3 to 6 players to begin</p>
        </div>

        <div className="setup-sections">
          
          {/* Selected Players */}
          <div className="setup-section">
            <h3>Selected Players ({selectedPlayers.length}/6)</h3>
            <div className="selected-players-list">
              {selectedPlayers.length === 0 && (
                <div className="empty-message">No players selected.</div>
              )}
              {selectedPlayers.map((player, index) => (
                <div key={player.id} className="selected-player-chip">
                  <span className="player-number">{index + 1}</span>
                  <span className="player-name">{player.name}</span>
                  <button 
                    className="remove-chip-btn"
                    onClick={() => handleRemovePlayer(player.id)}
                    aria-label="Remove player"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {selectedPlayers.length < 3 && (
              <div className="warning-text">Need at least {3 - selectedPlayers.length} more.</div>
            )}
            {selectedPlayers.length === 6 && (
              <div className="success-text">Max players reached.</div>
            )}
          </div>

          <hr className="divider" />

          {/* Add New Player */}
          <div className="setup-section">
            <h3>Add New Player</h3>
            <form onSubmit={handleAddNewPlayer} className="add-player-form">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Type a name..."
                maxLength={15}
                disabled={selectedPlayers.length >= 6}
              />
              <button 
                type="submit" 
                className="btn-primary add-btn"
                disabled={!newPlayerName.trim() || selectedPlayers.length >= 6}
              >
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* Roster Selection */}
          {availableRoster.length > 0 && (
            <div className="setup-section">
              <h3>Previous Players</h3>
              <div className="roster-chips">
                {availableRoster.map(name => (
                  <button 
                    key={name} 
                    className="roster-chip"
                    onClick={() => handleAddFromRoster(name)}
                    disabled={selectedPlayers.length >= 6}
                  >
                    <UserPlus size={16} />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="setup-footer">
          <button 
            className="btn-primary start-btn"
            onClick={handleStartGame}
            disabled={!canStart}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
