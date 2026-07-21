import React, { useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import './Stepper.css';

/**
 * Stepper is a granular, memoized input component for incrementing/decrementing numeric values.
 * Isolated to prevent sibling components from re-rendering during state updates.
 */
const Stepper = React.memo(({ value, onChange, min = 0, max = 99, label }) => {
  const handleDec = useCallback(() => {
    if (value > min) onChange(value - 1);
  }, [value, min, onChange]);

  const handleInc = useCallback(() => {
    if (value < max) onChange(value + 1);
  }, [value, max, onChange]);

  const handleInputChange = useCallback((e) => {
    if (e.target.value === '') {
      onChange(''); // Allow empty while typing
      return;
    }
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    
    if (val > max) val = max;
    onChange(val);
  }, [max, onChange]);

  const handleBlur = useCallback((e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < min) {
      onChange(min);
    }
  }, [min, onChange]);

  return (
    <div className="stepper-container">
      {label && <span className="stepper-label">{label}</span>}
      <div className="stepper-controls">
        <button 
          className="stepper-btn" 
          onClick={handleDec} 
          disabled={value <= min}
          aria-label="Decrease"
        >
          <Minus size={20} />
        </button>
        <input 
          type="number"
          className="stepper-input" 
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          inputMode="numeric"
          aria-label={label || "Value"}
        />
        <button 
          className="stepper-btn" 
          onClick={handleInc} 
          disabled={value >= max}
          aria-label="Increase"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
});

Stepper.displayName = 'Stepper';
export default Stepper;
