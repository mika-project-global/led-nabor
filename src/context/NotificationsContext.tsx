import React, { createContext, useCallback, useState } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface NotificationsContextType {
  addNotification: (message: string, type: Notification['type'], duration?: number) => void;
  showNotification: (type: Notification['type'], message: string, duration?: number) => void;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: Notification['type'], duration = 5000) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const showNotification = useCallback((type: Notification['type'], message: string, duration = 5000) => {
    addNotification(message, type, duration);
  }, [addNotification]);

  return (
    <NotificationsContext.Provider value={{ addNotification, showNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}