import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export const useNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/notifications/non-lues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.notifications?.length || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;
    
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/lire/${notificationId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour la liste locale
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  }, [token]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Polling pour les nouvelles notifications (toutes les 10 secondes)
  useEffect(() => {
    fetchUnreadNotifications();
    
    const interval = setInterval(fetchUnreadNotifications, 10000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchUnreadNotifications,
    markAsRead,
    addNotification
  };
}; 