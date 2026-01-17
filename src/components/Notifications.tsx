import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => prev.filter(n => {
        const elapsed = Date.now() - parseInt(n.id);
        return elapsed < (n.duration || 5000);
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-cyan-50 border-cyan-200 text-cyan-700'
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => {
        const Icon = icons[notification.type];
        return (
          <div
            key={notification.id}
            className={`${colors[notification.type]} p-4 rounded-lg border shadow-lg flex items-center gap-3 max-w-md animate-fade-in`}
            role="alert"
          >
            <Icon size={20} />
            <p className="flex-1">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-current opacity-50 hover:opacity-100"
            >
              <X size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
}