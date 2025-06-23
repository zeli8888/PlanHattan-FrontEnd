import { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import './DateTimePicker.css'
const DateTimePicker = ({ value, onChange }) => {
  // State for calendar popup
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value.date.getMonth());
  const [currentYear, setCurrentYear] = useState(value.date.getFullYear());

  // Format helpers
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = () => {
    return `${value.time.hours}:${value.time.minutes.toString().padStart(2, '0')} ${value.time.period}`;
  };

  // Date selection handlers
  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onChange({ ...value, date: newDate });
    setShowDatePicker(false);
  };

  const changeMonth = (increment) => {
    setCurrentMonth(prev => {
      let newMonth = prev + increment;
      if (newMonth > 11) {
        setCurrentYear(year => year + 1);
        return 0;
      }
      if (newMonth < 0) {
        setCurrentYear(year => year - 1);
        return 11;
      }
      return newMonth;
    });
  };


  // Calendar day rendering
  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    
    // Empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value.date.getDate() === day && 
                         value.date.getMonth() === currentMonth && 
                         value.date.getFullYear() === currentYear;
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

const TimePicker = ({ value, onChange, onClose }) => {
    const handleTimeSelect = (newTime) => {
    onChange(newTime); // Update immediately when any time value changes
  };

   return (
    <div className="time-picker-popup">
      <div className="time-columns">
        {/* Hours Column */}
        <div className="time-column">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
            <div
              key={`hour-${h}`}
              className={`time-option ${value.hours === h ? 'selected' : ''}`}
              onClick={() => handleTimeSelect({ ...value, hours: h })}
            >
              {h}
            </div>
          ))}
        </div>
        
        {/* Minutes Column */}
        <div className="time-column">
          {Array.from({ length: 60 }, (_, i) => i).map(m => (
            <div
              key={`minute-${m}`}
              className={`time-option ${value.minutes === m ? 'selected' : ''}`}
              onClick={() => handleTimeSelect({ ...value, minutes: m })}
            >
              {m.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
        
        {/* AM/PM Column */}
        <div className="time-column">
          {['AM', 'PM'].map(p => (
            <div
              key={`period-${p}`}
              className={`time-option ${value.period === p ? 'selected' : ''}`}
              onClick={() => handleTimeSelect({ ...value, period: p })}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
      
      <div className="time-actions">
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
        <button className="now-btn" onClick={() => {
          const now = new Date();
          handleTimeSelect({
            hours: now.getHours() % 12 || 12,
            minutes: now.getMinutes(),
            period: now.getHours() >= 12 ? 'PM' : 'AM'
          });
        }}>Now</button>
      </div>
    </div>
  );
};

  return (
    <div className="date-time-picker">
      {/* Date Picker */}
      <div 
        className="date-display"
        onClick={() => {setShowDatePicker(!showDatePicker);
                 setShowTimePicker(false)}}
      >
        <Calendar size={16} />
        <span>{formatDate(value.date)}</span>
      </div>

      {/* Time Picker */}
      <div 
        className="time-display"
        onClick={() => {
            setShowTimePicker(!showTimePicker);
            setShowDatePicker(false);
            }}
      >
        <Clock size={16} />
        <span>{formatTime()}</span>
      </div>

      {/* Date Picker Popup */}
      {showDatePicker && (
        <div className="calendar-popup">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <h4>
              {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </h4>
            <button onClick={() => changeMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="calendar-weekdays">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {renderCalendar()}
          </div>
          
          <div className="calendar-actions">
            <button onClick={() => setShowDatePicker(false)}>Cancel</button>
            <button onClick={() => {
              const today = new Date();
              onChange({ ...value, date: today });
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
              setShowDatePicker(false);
            }}>Today</button>
          </div>
        </div>
      )}

      {/* Time Picker Popup */}
      {showTimePicker && (
        <TimePicker 
            value={value.time}
            onChange={(time) => onChange({ ...value, time })}
            onClose={() => setShowTimePicker(false)}
        />
        )}
    </div>
  );
};

export default DateTimePicker;