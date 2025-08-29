import React, { useState, useEffect, createContext} from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getSocket } from '../utils/socket';
import API_BASE_URL from '../config/api';

export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Fonction pour récupérer les notifications non lues
  const fetchUnreadNotifications = async () => {
    if (!token || !user) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/non-lues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const unreadNotifications = response.data.notifications || [];
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour localement
      setNotifications(prev => prev.map(notif =>
        notif._id === notificationId ? { ...notif, statut: 'lu' } : notif
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };


  // Connexion Socket.IO et écoute des notifications temps réel
  useEffect(() => {
    if (!token || !user) return;

    fetchUnreadNotifications();

    // Polling en backup (optionnel)
    const interval = setInterval(fetchUnreadNotifications, 10000);

    // Connexion socket
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('join', user._id);

    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    return () => {
      clearInterval(interval);
      socket.off('notification');
    };
  }, [token, user]);

  // Fonction pour tester les notifications (à supprimer en production)
  const testNotification = () => {
    const testNotif = {
      _id: 'test-' + Date.now(),
      titre: 'Test de notification',
      message: 'Ceci est une notification de test pour vérifier le système.',
      type: 'message',
      statut: 'non_lu',
      dateCreation: new Date(),
    };
    
    setNotifications(prev => [testNotif, ...prev]);
  };

  // Fonction pour tester le son de notification
  const testNotificationSound = () => {
    const testNotif = {
      _id: 'test-sound-' + Date.now(),
      titre: 'Test du son',
      message: 'Test du son de notification.',
      type: 'message',
      statut: 'non_lu',
      dateCreation: new Date(),
    };
    
    setNotifications(prev => [testNotif, ...prev]);
  };

  // Exposer les fonctions de test globalement (à supprimer en production)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testNotification = testNotification;
      window.testNotificationSound = testNotificationSound;
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;