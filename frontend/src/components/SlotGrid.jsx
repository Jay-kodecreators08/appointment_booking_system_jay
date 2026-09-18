import { formatTime } from '../utils/format';

const TITLES = {
  BOOKED: 'Already booked',
  BREAK: 'Doctor break',
  PAST: 'Time has passed',
  AVAILABLE: 'Available',
};

export default function SlotGrid({ slots, selected, onSelect }) {
  if (!slots.length) {
    return <p className="empty-state-message">No slots for this date.</p>;
  }

  return (
    <div className="slot-grid">
      {slots.map((slot) => {
        const disabled = !slot.isAvailable;
        const isSelected = selected === slot.startTime;
        let className = 'slot-btn';
        if (isSelected) className += ' slot-selected';
        else if (slot.isBreak) className += ' slot-break';
        else if (slot.isBooked) className += ' slot-booked';
        else if (slot.isPast) className += ' slot-past';

        return (
          <button
            key={slot.startTime}
            type="button"
            className={className}
            disabled={disabled}
            onClick={() => onSelect(slot)}
            title={TITLES[slot.status] || 'Available'}
          >
            {formatTime(slot.startTime)}
            {slot.isBreak && <span className="slot-tag">Break</span>}
          </button>
        );
      })}
    </div>
  );
}
