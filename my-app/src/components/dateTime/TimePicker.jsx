import { Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './TimePicker.css';

const TimePicker = ({ value, onChange }) => {
  const [hours, setHours] = useState(value.hours.toString());
  const [minutes, setMinutes] = useState(value.minutes.toString().padStart(2, '0'));
  const [period, setPeriod] = useState(value.period);
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);

  // Sync with external value changes
  useEffect(() => {
    setHours(value.hours.toString());
    setMinutes(value.minutes.toString().padStart(2, '0'));
    setPeriod(value.period);
  }, [value]);

const validateHours = (h, currentPeriod = period) => {
  let num = parseInt(h, 10) || 1;
  if (isNaN(num)) num = 1;
  
  if (currentPeriod === 'AM') {
    // For AM: only allow 7-12, if below 7 set to 7, if above 12 set to 12
    if (num < 7) num = 7;
    if (num > 12) num = 12;
  } else {
    // For PM: only allow 1-9, if below 1 set to 1, if above 9 set to 9
    if (num < 1) num = 1;
    if (num > 9) num = 9;
  }
  
  return num;
};

  const validateMinutes = (m) => {
    let num = parseInt(m, 10) || 0;
    if (isNaN(num)) num = 0;
    return Math.min(59, Math.max(0, num));
  };

const handleHoursChange = (e) => {
  const val = e.target.value.replace(/\D/g, '');
  
  if (val === '') {
    setHours(val);
    return;
  }
  
  const numVal = parseInt(val, 10);
  
  // Check bounds based on period
  let maxAllowed, minAllowed;
  if (period === 'AM') {
    minAllowed = 7;
    maxAllowed = 12;
  } else {
    minAllowed = 1;
    maxAllowed = 9;
  }
  
  // Allow input if within bounds
  if (numVal >= minAllowed && numVal <= maxAllowed) {
    setHours(val);
    
    // Auto-advance to minutes when 2 digits entered or when hour is > 1 and user types second digit
    if (val.length >= 2 || (val.length === 1 && parseInt(val, 10) > 1)) {
      setTimeout(() => {
        minutesRef.current.focus();
        minutesRef.current.select();
      }, 0);
    }
  } else {
    // If out of bounds, set to closest valid value
    const validated = validateHours(val, period);
    setHours(validated.toString());
  }
};  

  const handleMinutesChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    
    // Prevent input if it would exceed 59
    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 59)) {
      setMinutes(val.padStart(val.length === 1 ? 1 : 2, '0'));
    }
  };

const commitChanges = () => {
  const validatedHours = validateHours(hours, period);
  const validatedMinutes = validateMinutes(minutes);
  
  setHours(validatedHours.toString());
  setMinutes(validatedMinutes.toString().padStart(2, '0'));
  
  onChange({
    hours: validatedHours,
    minutes: validatedMinutes,
    period: period
  });
};

const handleHoursBlur = () => {
  const validated = validateHours(hours, period);
  setHours(validated.toString());
  commitChanges();
};

  const handleMinutesBlur = () => {
    const validated = validateMinutes(minutes);
    setMinutes(validated.toString().padStart(2, '0'));
    commitChanges();
  };

const handleHoursKeyDown = (e) => {
  // Allow navigation and editing keys
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
    return;
  }
  
  // Move to minutes on Enter
  if (e.key === 'Enter') {
    minutesRef.current.focus();
    minutesRef.current.select();
    return;
  }
  
  // Only allow numeric input
  if (!/\d/.test(e.key)) {
    e.preventDefault();
    return;
  }
  
  // Check if the new value would be valid
  const currentValue = e.target.value;
  const newValue = currentValue + e.key;
  const numValue = parseInt(newValue, 10);
  
  // Check bounds based on period
  let maxAllowed;
  if (period === 'AM') {
    maxAllowed = 12;
  } else {
    maxAllowed = 9;
  }
  
  if (numValue > maxAllowed) {
    e.preventDefault();
  }
};

  const handleMinutesKeyDown = (e) => {
    // Allow navigation and editing keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return;
    }
    
    // Only allow numeric input
    if (!/\d/.test(e.key)) {
      e.preventDefault();
      return;
    }
    
    // Check if the new value would be valid
    const currentValue = e.target.value;
    const newValue = currentValue + e.key;
    const numValue = parseInt(newValue, 10);
    
    if (numValue > 59) {
      e.preventDefault();
    }
  };

const togglePeriod = () => {
  const newPeriod = period === 'AM' ? 'PM' : 'AM';
  const currentHours = parseInt(hours, 10) || 1;
  
  // Validate hours for the new period
  let validatedHours = currentHours;
  if (newPeriod === 'AM') {
    // Switching to AM: ensure hour is between 7-12
    if (currentHours < 7) validatedHours = 7;
    if (currentHours > 12) validatedHours = 12;
  } else {
    // Switching to PM: ensure hour is between 1-9
    if (currentHours < 1) validatedHours = 1;
    if (currentHours > 9) validatedHours = 9;
  }
  
  setHours(validatedHours.toString());
  setPeriod(newPeriod);
  
  onChange({
    hours: validatedHours,
    minutes: validateMinutes(minutes),
    period: newPeriod
  });
};

  return (
    <div className="time-picker-container">
      <div className="time-display">
        <Clock size={16} />
        <div className="time-input-group">
          <input
            ref={hoursRef}
            type="text"
            value={hours}
            onChange={handleHoursChange}
            onBlur={handleHoursBlur}
            onKeyDown={handleHoursKeyDown}
            onClick={(e) => e.target.select()}
            className="time-input"
            maxLength={2}
            aria-label="Hours"
          />
          <span className="time-separator">:</span>
          <input
            ref={minutesRef}
            type="text"
            value={minutes}
            onChange={handleMinutesChange}
            onBlur={handleMinutesBlur}
            onKeyDown={handleMinutesKeyDown}
            onClick={(e) => e.target.select()}
            className="time-input"
            maxLength={2}
            aria-label="Minutes"
          />
          <button 
            onClick={togglePeriod}
            className="period-toggle"
            aria-label="Toggle AM/PM"
          >
            {period}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePicker;