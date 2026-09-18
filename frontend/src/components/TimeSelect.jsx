import { useEffect, useRef, useState } from 'react';
import { formatTime, timeOptions } from '../utils/format';

const OPTIONS = timeOptions(15);

export default function TimeSelect({ name, value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pick = (time) => {
    onChange({ target: { name, value: time } });
    setOpen(false);
  };

  return (
    <div className="time-select" ref={ref}>
      <button
        type="button"
        className="time-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
      >
        {value ? formatTime(value) : 'Select time'}
        <span className="time-select-caret">&#9662;</span>
      </button>
      {/* Keeps native form semantics (required validation, form reset) without rendering the native widget */}
      <input type="hidden" name={name} value={value} required={required} />
      {open && (
        <ul className="time-select-menu" role="listbox">
          {OPTIONS.map((t) => (
            <li key={t}>
              <button
                type="button"
                className={`time-select-option${t === value ? ' time-select-option-active' : ''}`}
                onClick={() => pick(t)}
              >
                {formatTime(t)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
