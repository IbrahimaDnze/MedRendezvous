import React, { useEffect, useRef, useState } from 'react';

const NotificationSound = ({ play, onPlayComplete }) => {
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);

  // Initialiser l'AudioContext au premier clic utilisateur
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Suspendre l'AudioContext jusqu'à ce qu'il soit nécessaire
        await ctx.suspend();
        setAudioContext(ctx);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'AudioContext:', error);
      }
    };

    // Initialiser l'AudioContext au premier clic utilisateur
    const handleUserInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (play && audioContext) {
      const playNotificationSound = async () => {
        try {
          // Reprendre l'AudioContext si il est suspendu
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // Configuration du son
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Fréquence
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);

          if (onPlayComplete) {
            setTimeout(onPlayComplete, 300);
          }
        } catch (error) {
          console.error('Erreur lors de la lecture du son de notification:', error);
          // En cas d'erreur, appeler quand même onPlayComplete
          if (onPlayComplete) {
            setTimeout(onPlayComplete, 300);
          }
        }
      };

      playNotificationSound();
    }
  }, [play, onPlayComplete, audioContext]);

  return null; // Ce composant ne rend rien visuellement
};

export default NotificationSound; 