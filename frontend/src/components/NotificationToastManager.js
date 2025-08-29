import React, { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';
import NotificationSound from './NotificationSound';
import { useAuth } from '../contexts/AuthContext';

const NotificationToastManager = ({ notifications = [], onMarkAsRead, onCloseNotification }) => {
  const { user } = useAuth();
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    // Filtrer les nouvelles notifications non lues
    let newNotifications = notifications.filter(notif => 
      notif.statut === 'non_lu' && 
      !activeNotifications.find(active => active._id === notif._id)
    );

    // Si le rôle est patient ou medecin, on retire les notifications de type 'message'
    if (user && (user.role === 'patient' || user.role === 'medecin')) {
      newNotifications = newNotifications.filter(notif => notif.type !== 'message');
    }

    if (newNotifications.length > 0) {
      setPlaySound(true);
      newNotifications.forEach((notification, index) => {
        setTimeout(() => {
          setActiveNotifications(prev => [...prev, notification]);
        }, index * 500);
      });
    }
  }, [notifications, activeNotifications, user]);

  const handleCloseNotification = async (notificationId) => {
    // Marquer comme lue d'abord
    if (onMarkAsRead) {
      await onMarkAsRead(notificationId);
    }
    // Puis supprimer de la liste locale
    setActiveNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    if (onCloseNotification) {
      onCloseNotification(notificationId);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  // Filtrer aussi l'affichage des notifications actives
  let filteredActiveNotifications = activeNotifications;
  if (user && (user.role === 'patient' || user.role === 'medecin')) {
    filteredActiveNotifications = activeNotifications.filter(notif => notif.type !== 'message');
  }

  return (
    <>
      <NotificationSound 
        play={playSound} 
        onPlayComplete={() => setPlaySound(false)}
      />
      {filteredActiveNotifications.map((notification, index) => (
        <NotificationToast
          key={notification._id}
          notification={notification}
          onClose={() => handleCloseNotification(notification._id)}
          onMarkAsRead={handleMarkAsRead}
          style={{
            top: 20 + (index * 120),
            right: 20,
          }}
        />
      ))}
    </>
  );
};

export default NotificationToastManager; 