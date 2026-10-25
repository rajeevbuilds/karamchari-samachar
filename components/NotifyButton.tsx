'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';

type State = 'hidden' | 'idle' | 'busy' | 'on';

function toKeyBytes(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

// "Get alerts" button: asks the reader's permission once, then they get a
// notification on this device whenever a new post is published. Hidden where
// the browser cannot do it (some iPhones need the site added to the home
// screen first), where the reader has blocked notifications, or until the
// site has its notification key set up.
export default function NotifyButton({ variant }: { variant: 'bar' | 'button' }) {
  const [state, setState] = useState<State>('hidden');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
        if (Notification.permission === 'denied') return;
        const res = await fetch('/api/push/key');
        if (!res.ok) return;
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setState(existing ? 'on' : 'idle');
      } catch {
        // Anything unexpected: just keep the button hidden.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function turnOn() {
    setState('busy');
    setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'hidden' : 'idle');
        return;
      }
      const { key } = await (await fetch('/api/push/key')).json();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKeyBytes(key) });
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        await sub.unsubscribe();
        throw new Error('save failed');
      }
      setState('on');
      setMessage('Alerts are on');
    } catch {
      setState('idle');
      setMessage('Could not turn on alerts');
    }
  }

  async function turnOff() {
    setState('busy');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('idle');
      setMessage('Alerts are off');
    } catch {
      setState('on');
    }
  }

  if (state === 'hidden') return null;
  const on = state === 'on';
  const Icon = on ? BellRing : Bell;
  const onClick = on ? turnOff : turnOn;
  const colour = on ? 'bg-leaf' : 'bg-brass';

  if (variant === 'bar') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={state === 'busy'}
        title={on ? 'Alerts are on. Tap to turn off.' : 'Get a notification when a new post is published'}
        className={`inline-flex items-center gap-1.5 rounded-full ${colour} px-3 py-1 font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white print:hidden`}
      >
        <Icon size={14} aria-hidden="true" />
        <span>{on ? 'Alerts on' : 'Get alerts'}</span>
      </button>
    );
  }

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={onClick}
        disabled={state === 'busy'}
        className={`inline-flex items-center gap-2 rounded-full ${colour} px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-maroon`}
      >
        <Icon size={18} aria-hidden="true" />
        {on ? 'Alerts are on (tap to turn off)' : 'Get alerts on this device'}
      </button>
      <p className="mt-1 text-xs text-ink/50" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
