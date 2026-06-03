import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function PushAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const handleNewNotification = (e) => {
      const { title, body } = e.detail;
      const newAlert = {
        id: Date.now(),
        title,
        body
      };

      // Play notification sound
      playNotificationSound();

      setAlerts(prev => [...prev, newAlert]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
      }, 6000);
    };

    window.addEventListener('sanjose_push_notification', handleNewNotification);
    return () => {
      window.removeEventListener('sanjose_push_notification', handleNewNotification);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Note: play two consecutive chimes (bell sound)
      const playChime = (freq, time, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = audioCtx.currentTime;
      playChime(880, now, 0.4); // A5
      playChime(1318.51, now + 0.12, 0.6); // E6
    } catch (e) {
      console.warn('Audio context blocked by browser autoplay rules.');
    }
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="push-alerts-container">
      {alerts.map(alert => (
        <div key={alert.id} className="push-alert">
          <div className="push-alert-icon">
            <Bell size={18} />
          </div>
          <div className="push-alert-body">
            <div className="push-alert-title">{alert.title}</div>
            <div className="push-alert-desc">{alert.body}</div>
          </div>
          <button className="push-alert-close" onClick={() => removeAlert(alert.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// Global helper to trigger notifications anywhere in the app
export const triggerNotification = (title, body) => {
  const event = new CustomEvent('sanjose_push_notification', {
    detail: { title, body }
  });
  window.dispatchEvent(event);
  
  // Save notification to simulated DB
  try {
    const saved = localStorage.getItem('sanjose_notifications') || '[]';
    const notificationsList = JSON.parse(saved);
    notificationsList.push({ id: Date.now(), title, body, date: new Date().toISOString() });
    localStorage.setItem('sanjose_notifications', JSON.stringify(notificationsList));
  } catch (e) {
    console.error('Error saving notification:', e);
  }
};
