'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';

// A date box that always reads DD/MM/YYYY, whatever language the visitor's
// browser is set to (the browser's own date box follows that setting, which
// is month-first on many computers). The value passed in and out is an ISO
// string, "YYYY-MM-DD", or '' while the date is empty or incomplete. A small
// calendar button opens the browser's calendar for picking.

const MESSAGE = 'Enter a valid date as DD/MM/YYYY';

function isoToText(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

// Digits only -> "dd/mm/yyyy" with slashes added as the person types.
function formatTyped(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// "dd/mm/yyyy" -> ISO if it is a real calendar date, else ''.
function textToIso(text: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return '';
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return '';
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > last) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export default function DateInput({
  id,
  value,
  onChange,
  className = '',
  required = false,
}: {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  required?: boolean;
}) {
  const [text, setText] = useState(isoToText(value));
  const [touched, setTouched] = useState(false);
  const textRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  // Follow the value when the parent changes it (reset, picking from the
  // calendar) — but leave half-typed text alone while the parent has none.
  useEffect(() => {
    if (value && value !== textToIso(text)) setText(isoToText(value));
    if (!value && text && textToIso(text)) setText('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const valid = textToIso(text) !== '';
  const showError = touched && text !== '' && !valid;

  // Let a surrounding <form> block submission with the browser's own message.
  useEffect(() => {
    textRef.current?.setCustomValidity(text !== '' && !valid ? MESSAGE : '');
  }, [text, valid]);

  function type(raw: string) {
    const next = formatTyped(raw);
    setText(next);
    onChange(textToIso(next));
  }

  function openCalendar() {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.focus();
      picker.click();
    }
  }

  return (
    <div>
      <div className="relative">
        <input
          ref={textRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD/MM/YYYY"
          maxLength={10}
          required={required}
          value={text}
          onChange={(e) => type(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          className={`${className} pr-10`}
        />
        <button
          type="button"
          onClick={openCalendar}
          aria-label="Open calendar"
          className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-ink/50 hover:text-maroon"
        >
          <CalendarDays size={18} aria-hidden="true" />
        </button>
        {/* The browser's calendar, used only for picking; kept out of sight. */}
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={value}
          min="1900-01-01"
          max="2100-12-31"
          onChange={(e) => {
            setText(isoToText(e.target.value));
            onChange(e.target.value);
          }}
          className="absolute right-0 bottom-0 h-0 w-0 opacity-0 pointer-events-none"
        />
      </div>
      {showError && <p className="text-xs text-red-600 mt-1">{MESSAGE}</p>}
    </div>
  );
}
