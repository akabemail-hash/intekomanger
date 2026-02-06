import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  sendNotification: (message: string, targetType: 'all' | 'role' | 'users', targetValue?: string | string[]) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children?: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sendNotification = (message: string, targetType: 'all' | 'role' | 'users', targetValue?: string | string[]) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      date: new Date().toISOString(),
      isRead: false,
      targetType,
      targetValue
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  // Note: unreadCount here is global. In a real app, filtering happens per user.
  // We will handle filtering in the Layout/Display component using the current user context.
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, sendNotification, markAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};