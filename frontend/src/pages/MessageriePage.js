import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from '../components/GlobalSnackbar';
import { useNotifications } from '../hooks/useNotifications';
import MessageNotification from '../components/MessageNotification';

const MessageriePage = () => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState('');
  const [activeNotification, setActiveNotification] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { showSnackbar } = useSnackbar();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const conversationsData = response.data.conversations || [];
      setConversations(conversationsData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      showSnackbar('Erreur lors du chargement des conversations', 'error');
      setLoading(false);
    }
  }, [token, showSnackbar]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const messagesData = response.data.messages || [];
      setMessages(messagesData);
      
      // Marquer les messages comme lus
      try {
        await axios.patch(`http://localhost:5000/api/users/messages/${conversationId}/marquer-lus`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Mettre à jour le compteur local
        setConversations(prev => prev.map(conv => 
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));
      } catch (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      showSnackbar('Erreur lors du chargement des messages', 'error');
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Détecter le paramètre conversation dans l'URL et ouvrir la conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        setSelectedMedecin(conversation);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, '/messagerie');
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedMedecin) {
      fetchMessages(selectedMedecin._id);
    }
  }, [selectedMedecin, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedMedecin) return;

    try {
      setSending(true);
      const response = await axios.post(`http://localhost:5000/api/users/messages/${selectedMedecin._id}`, {
        content: newMessage,
        type: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages([...messages, response.data.message]);
      setNewMessage('');
      showSnackbar('Message envoyé', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      showSnackbar('Erreur lors de l\'envoi du message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      setDeleting(true);
      await axios.delete(`http://localhost:5000/api/users/messages/${selectedMessage._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Supprimer le message de la liste locale
      setMessages(messages.filter(msg => msg._id !== selectedMessage._id));
      showSnackbar('Message supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      showSnackbar('Erreur lors de la suppression du message', 'error');
    } finally {
      setDeleting(false);
      setAnchorEl(null);
      setSelectedMessage(null);
    }
  };

  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleQuitterConversation = async () => {
    if (!selectedMedecin) return;

    try {
      setQuitting(true);
      await axios.post(`http://localhost:5000/api/users/messages/${selectedMedecin._id}/quitter`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fermer seulement la conversation active, garder le médecin dans la liste
      setSelectedMedecin(null);
      setMessages([]);
      showSnackbar('Conversation fermée', 'success');
    } catch (error) {
      console.error('Erreur lors de la fermeture de la conversation:', error);
      showSnackbar('Erreur lors de la fermeture de la conversation', 'error');
    } finally {
      setQuitting(false);
      setAnchorEl(null);
      setSelectedMessage(null);
    }
  };

  // Fonctions pour la gestion des fichiers
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        showSnackbar('Le fichier est trop volumineux. Taille maximum : 20MB', 'error');
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        showSnackbar('Type de fichier non supporté. Formats acceptés : images, PDF, documents', 'error');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedMedecin) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedFile.type.startsWith('image/') ? 'image' : 'file');

      const response = await axios.post(`http://localhost:5000/api/users/messages/${selectedMedecin._id}/file`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessages([...messages, response.data.data]);
      setSelectedFile(null);
      setUploadingFile(false);
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      showSnackbar('Fichier envoyé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du fichier:', error);
      showSnackbar('Erreur lors de l\'envoi du fichier', 'error');
      setUploadingFile(false);
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  // Gestion des notifications
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latestMessageNotification = notifications.find(n => n.type === 'message');
      if (latestMessageNotification) {
        setActiveNotification(latestMessageNotification);
        // Auto-fermer après 5 secondes
        setTimeout(() => {
          setActiveNotification(null);
        }, 5000);
      }
    }
  }, [notifications]);

  const handleCloseNotification = () => {
    setActiveNotification(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    setActiveNotification(null);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
      display: 'flex',
      flexDirection: 'column',
      py: 6,
      px: 2,
    }}>
      <Typography variant="h3" sx={{ 
        fontWeight: 900, 
        mb: 1, 
        color: '#2a3eb1', 
        fontSize: { xs: 32, md: 48 }, 
        letterSpacing: 2, 
        textShadow: '0 4px 16px #c2e9fb',
        textAlign: 'center'
      }}>
        Messagerie
      </Typography>
      <Typography variant="body1" sx={{ 
        color: '#4f4f4f', 
        mb: 5, 
        fontSize: 22, 
        fontWeight: 500, 
        letterSpacing: 1, 
        textShadow: '0 2px 8px #fff',
        textAlign: 'center'
      }}>
        Communiquez avec vos médecins
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        height: '70vh',
        maxHeight: '700px',
        gap: 0, 
        maxWidth: 1000, 
        mx: 'auto', 
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Liste des médecins */}
        <Box sx={{ 
          width: 320, 
          bgcolor: 'rgba(248,250,252,0.95)',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header de la liste */}
          <Box sx={{
            p: 3,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            bgcolor: 'rgba(255,255,255,0.9)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 800, 
                color: '#1a1a1a',
                fontSize: '1.25rem',
                letterSpacing: '-0.5px'
              }}>
                Messages
              </Typography>
              {unreadCount && unreadCount > 0 && (
                <Box
                  sx={{
                    bgcolor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700
                  }}
                >
                  {unreadCount}
                </Box>
              )}
            </Box>
            <Typography variant="body2" sx={{ 
              color: '#666',
              mt: 0.5,
              fontSize: '0.875rem'
            }}>
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          
          {/* Barre de recherche */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher un médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0,0,0,0.08)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(59, 130, 246, 0.3)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6'
                  }
                }
              }}
            />
          </Box>
          {conversations.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune conversation disponible
            </Typography>
          ) : (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {conversations
                .filter(conversation => 
                  conversation.medecin?.nom?.toLowerCase().includes(search.toLowerCase()) ||
                  conversation.medecin?.specialite?.toLowerCase().includes(search.toLowerCase())
                )
                .map((conversation) => (
                <Box
                  key={conversation._id}
                  onClick={() => setSelectedMedecin(conversation)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2.5,
                    cursor: 'pointer',
                    bgcolor: selectedMedecin?._id === conversation._id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: selectedMedecin?._id === conversation._id 
                        ? 'rgba(59, 130, 246, 0.12)' 
                        : 'rgba(0,0,0,0.02)'
                    },
                    // Indicateur de message non lu (barre bleue à gauche)
                    '&::before': conversation.unreadCount > 0 ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: '#3b82f6',
                      borderRadius: '0 2px 2px 0'
                    } : {}
                  }}
                >
                  <Avatar 
                    src={conversation.medecin?.avatar} 
                    sx={{ 
                      mr: 2.5, 
                      width: 48, 
                      height: 48,
                      bgcolor: selectedMedecin?._id === conversation._id ? '#3b82f6' : '#e5e7eb',
                      border: selectedMedecin?._id === conversation._id ? '2px solid #3b82f6' : '2px solid transparent'
                    }}
                  >
                    {conversation.medecin?.nom?.charAt(0) || 'M'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: conversation.unreadCount > 0 ? 800 : 600,
                        color: '#1a1a1a',
                        fontSize: '0.95rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        Dr. {conversation.medecin?.nom || 'Médecin'}
                      </Typography>
                      {conversation.unreadCount > 0 && (
                        <Box
                          sx={{
                            bgcolor: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            minWidth: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            px: 0.5
                          }}
                        >
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: conversation.unreadCount > 0 ? '#3b82f6' : '#666',
                      fontSize: '0.8rem',
                      fontWeight: conversation.unreadCount > 0 ? 700 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversation.unreadCount > 0 ? '📬 Nouveau message' : conversation.medecin?.specialite || 'Spécialité'}
                    </Typography>
                    {conversation.rdv && (
                      <Typography variant="caption" sx={{ 
                        color: '#666',
                        fontSize: '0.75rem',
                        display: 'block',
                        mt: 0.5
                      }}>
                        📅 RDV: {new Date(conversation.rdv.date).toLocaleDateString('fr-FR')} à {conversation.rdv.heure}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Zone de chat */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: 'rgba(255,255,255,0.98)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {selectedMedecin ? (
            <>
              {/* En-tête */}
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                <Avatar 
                  src={selectedMedecin.medecin?.avatar} 
                  sx={{ 
                    mr: 2.5, 
                    width: 40, 
                    height: 40,
                    bgcolor: '#3b82f6'
                  }}
                >
                  {selectedMedecin.medecin?.nom?.charAt(0) || 'M'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: '#1a1a1a',
                    fontSize: '1.1rem'
                  }}>
                    Dr. {selectedMedecin.medecin?.nom || 'Médecin'}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    fontSize: '0.875rem'
                  }}>
                    {selectedMedecin.medecin?.specialite || 'Spécialité'}
                  </Typography>
                  {selectedMedecin.medecin?.hopital && (
                    <Typography variant="body2" sx={{ 
                      color: '#9c27b0',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {selectedMedecin.medecin.hopital}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#10b981',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    mr: 1
                  }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#10b981'
                    }} />
                    En ligne
                  </Box>
                  <IconButton
                    onClick={handleQuitterConversation}
                    disabled={quitting}
                    sx={{
                      color: '#dc2626',
                      '&:hover': {
                        bgcolor: 'rgba(220, 38, 38, 0.08)'
                      }
                    }}
                    title="Fermer la conversation"
                  >
                    <ExitToAppIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'rgba(248,250,252,0.5)'
              }}>
                {messages.map((message) => {
                  // Simplifier la logique de détection
                  const isOwnMessage = message.expediteur?._id === user?._id || message.expediteur?._id === user?.userId;
                  
                  return (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        mb: 1.5,
                        px: 2,
                        width: '100%'
                      }}
                    >
                      {!isOwnMessage && (
                        <Avatar 
                          src={selectedMedecin.medecin?.avatar} 
                          sx={{ 
                            mr: 1.5, 
                            width: 32, 
                            height: 32,
                            bgcolor: '#3b82f6',
                            alignSelf: 'flex-end',
                            flexShrink: 0
                          }}
                        >
                          {selectedMedecin.medecin?.nom?.charAt(0) || 'M'}
                        </Avatar>
                      )}
                      <Box
                        sx={{
                          p: 2.5,
                          maxWidth: '65%',
                          minWidth: '120px',
                          bgcolor: isOwnMessage 
                            ? '#3b82f6' 
                            : 'white',
                          color: isOwnMessage ? 'white' : '#1a1a1a',
                          borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          wordBreak: 'break-word',
                          boxShadow: isOwnMessage 
                            ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                            : '0 2px 8px rgba(0,0,0,0.08)',
                          border: isOwnMessage ? 'none' : '1px solid rgba(0,0,0,0.06)',
                          position: 'relative',
                          fontSize: '0.95rem',
                          lineHeight: 1.4,
                          flexShrink: 0,
                          '&::before': isOwnMessage ? {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            right: -8,
                            width: 0,
                            height: 0,
                            border: '8px solid transparent',
                            borderTopColor: '#3b82f6',
                            borderBottom: 'none',
                            borderRight: 'none',
                          } : {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: -8,
                            width: 0,
                            height: 0,
                            border: '8px solid transparent',
                            borderTopColor: 'white',
                            borderBottom: 'none',
                            borderLeft: 'none',
                          }
                        }}
                      >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        {isOwnMessage ? (
                          <PersonIcon sx={{ fontSize: '0.8rem', opacity: 0.8 }} />
                        ) : (
                          <MedicalServicesIcon sx={{ fontSize: '0.8rem', opacity: 0.8 }} />
                        )}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.8,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            letterSpacing: '0.3px',
                            color: isOwnMessage ? 'rgba(255,255,255,0.9)' : 'rgba(26,26,26,0.7)'
                          }}
                        >
                          {isOwnMessage ? 'Vous' : `Dr. ${message.expediteur?.nom || 'Médecin'}`}
                        </Typography>
                      </Box>
                                                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          {/* Affichage du contenu du message */}
                          {message.type === 'image' ? (
                            <Box sx={{ mb: 1, flex: 1 }}>
                              <img 
                                src={`http://localhost:5000/uploads/${message.contenu}`}
                                alt="Image"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '300px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `http://localhost:5000/uploads/${message.contenu}`;
                                  link.download = message.contenu;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              />
                            </Box>
                          ) : message.type === 'file' ? (
                            <Box sx={{ 
                              mb: 1, 
                              p: 2, 
                              bgcolor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                              borderRadius: 2,
                              border: '1px solid rgba(0,0,0,0.1)',
                              flex: 1
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachFileIcon sx={{ fontSize: '1.5rem', opacity: 0.7 }} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {message.contenu}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    Fichier joint
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `http://localhost:5000/uploads/${message.contenu}`;
                                    link.download = message.contenu;
                                    link.target = '_blank';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  sx={{ color: isOwnMessage ? 'white' : '#3b82f6' }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                              {message.contenu}
                              {isOwnMessage && ' ✅'} {/* Indicateur visuel pour les messages envoyés */}
                            </Typography>
                          )}
                          {isOwnMessage && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, message)}
                              sx={{
                                ml: 1,
                                color: 'rgba(255,255,255,0.7)',
                                '&:hover': {
                                  color: 'rgba(255,255,255,0.9)',
                                  bgcolor: 'rgba(255,255,255,0.1)'
                                }
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mt: 1
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: isOwnMessage ? 0.7 : 0.5,
                              fontSize: '0.65rem',
                              fontWeight: 500
                            }}
                          >
                            {new Date(message.dateEnvoi).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                          {isOwnMessage && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {message.vu ? (
                                <CheckCircleIcon 
                                  sx={{ 
                                    fontSize: '0.7rem', 
                                    color: '#3b82f6',
                                    opacity: 0.8
                                  }} 
                                />
                              ) : (
                                <CheckIcon 
                                  sx={{ 
                                    fontSize: '0.7rem', 
                                    color: '#9ca3af',
                                    opacity: 0.6
                                  }} 
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                    </Box>
                  </Box>
                );
              })}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* Scroll automatique vers le bas */}
              <Box sx={{ 
                height: '1px', 
                overflow: 'hidden' 
              }} />

              {/* Zone de saisie */}
              <Box sx={{ 
                p: 3, 
                borderTop: '1px solid rgba(0,0,0,0.08)',
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'flex-end',
                  bgcolor: 'rgba(248,250,252,0.8)',
                  borderRadius: '24px',
                  p: 1.5,
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  {/* Input file caché */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  
                  {/* Bouton d'attachement */}
                  <IconButton
                    onClick={handleAttachFile}
                    disabled={uploadingFile}
                    sx={{ 
                      color: '#6b7280',
                      '&:hover': { 
                        color: '#3b82f6',
                        bgcolor: 'rgba(59, 130, 246, 0.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={1}
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending || uploadingFile}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        border: 'none',
                        bgcolor: 'transparent',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.95rem',
                        color: '#1a1a1a',
                        '&::placeholder': {
                          color: '#9ca3af',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                  
                  {/* Bouton d'envoi */}
                  <IconButton
                    disabled={(!newMessage.trim() && !selectedFile) || sending || uploadingFile}
                    onClick={() => {
                      console.log('=== CLIC BOUTON ENVOI ===');
                      console.log('selectedFile:', selectedFile);
                      console.log('newMessage:', newMessage);
                      console.log('sending:', sending);
                      console.log('uploadingFile:', uploadingFile);
                      
                      if (selectedFile) {
                        console.log('Appel de handleSendFile');
                        handleSendFile();
                      } else {
                        console.log('Appel de handleSend');
                        handleSend();
                      }
                    }}
                    sx={{ 
                      bgcolor: (newMessage.trim() || selectedFile) ? '#3b82f6' : '#e5e7eb',
                      color: 'white',
                      width: 40,
                      height: 40,
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        bgcolor: (newMessage.trim() || selectedFile) ? '#2563eb' : '#d1d5db',
                        transform: 'scale(1.05)'
                      },
                      '&:disabled': { 
                        bgcolor: '#e5e7eb',
                        transform: 'none'
                      }
                    }}
                  >
                    {(sending || uploadingFile) ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  </IconButton>
                </Box>
                
                {/* Affichage du fichier sélectionné */}
                {selectedFile && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'rgba(59, 130, 246, 0.1)', 
                    borderRadius: 2,
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFileIcon sx={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        sx={{ color: '#6b7280' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              p: 4
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Sélectionnez un médecin pour commencer à discuter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Vos conversations avec les médecins apparaîtront ici
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Menu contextuel pour supprimer les messages */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)'
          }
        }}
      >
        <MenuItem 
          onClick={handleDeleteMessage}
          disabled={deleting}
          sx={{
            color: '#dc2626',
            '&:hover': {
              bgcolor: 'rgba(220, 38, 38, 0.08)'
            }
          }}
        >
          <ListItemIcon>
            <DeleteIcon sx={{ color: '#dc2626' }} />
          </ListItemIcon>
          {deleting ? 'Suppression...' : 'Supprimer le message'}
        </MenuItem>
      </Menu>

      {/* Notification de message en temps réel */}
      {activeNotification && (
        <MessageNotification
          notification={activeNotification}
          onClose={handleCloseNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </Box>
  );
};

export default MessageriePage;