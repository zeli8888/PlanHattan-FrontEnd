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

  const validateHours = (h) => {
    let num = parseInt(h, 10) || 1;
    if (isNaN(num)) num = 1;
    return Math.min(12, Math.max(1, num));
  };

  const validateMinutes = (m) => {
    let num = parseInt(m, 10) || 0;
    if (isNaN(num)) num = 0;
    return Math.min(59, Math.max(0, num));
  };

  const handleHoursChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    
    // Prevent input if it would exceed 12
    if (val === '' || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 12)) {
      setHours(val);
      
      // Auto-advance to minutes when 2 digits entered or when hour is > 1 and user types second digit
      if (val.length >= 2 || (val.length === 1 && parseInt(val, 10) > 1)) {
        setTimeout(() => {
          minutesRef.current.focus();
          minutesRef.current.select();
        }, 0);
      }
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
    const validatedHours = validateHours(hours);
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
    const validated = validateHours(hours);
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
    
    if (numValue > 12) {
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
    setPeriod(newPeriod);
    onChange({
      hours: validateHours(hours),
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