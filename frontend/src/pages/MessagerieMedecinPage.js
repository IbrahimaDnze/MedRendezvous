import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from '../components/GlobalSnackbar';
import { useNotifications } from '../hooks/useNotifications';
import MessageNotification from '../components/MessageNotification';

const MessagerieMedecinPage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { showSnackbar } = useSnackbar();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/users/messages/conversations`, {
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
    };
    
    loadConversations();
  }, [token, showSnackbar]);

  // Détecter le paramètre conversation dans l'URL et ouvrir la conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');

    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        console.log('Conversation sélectionnée via URL :', conversation);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, '/messagerie');
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/messages/conversations`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/users/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const messagesData = response.data.messages || [];
      setMessages(messagesData);

      // Marquer les messages comme lus quand on ouvre la conversation
      if (messagesData.length > 0) {
        try {
          await axios.patch(`${API_BASE_URL}/api/users/messages/${conversationId}/marquer-lus`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Mettre à jour le compteur local
          setConversations(prev => prev.map(conv => 
            conv._id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          ));
        } catch (error) {
          console.error('Erreur lors du marquage des messages comme lus:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      showSnackbar('Erreur lors du chargement des messages', 'error');
    }
  }, [token, showSnackbar]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await axios.post(`${API_BASE_URL}/api/users/messages/${selectedConversation._id}`, {
        content: newMessage,
        type: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages([...messages, response.data.message]);
      setNewMessage('');

      // Mettre à jour la conversation
      const updatedConversations = conversations.map(conv => 
        conv._id === selectedConversation._id 
          ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date() }
          : conv
      );
      setConversations(updatedConversations);

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
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/users/messages/${selectedMessage._id}`, {
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
    if (!selectedConversation) return;

    try {
      setQuitting(true);
      await axios.post(`${API_BASE_URL}/api/users/messages/${selectedConversation._id}/quitter`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fermer seulement la conversation active, garder le patient dans la liste
      setSelectedConversation(null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gérer l'affichage des notifications en temps réel
  useEffect(() => {
    if (notifications.length > 0 && !activeNotification) {
      const latestNotification = notifications[0];
      if (latestNotification.type === 'message') {
        setActiveNotification(latestNotification);
        
        // Auto-fermer la notification après 5 secondes
        setTimeout(() => {
          setActiveNotification(null);
        }, 5000);
      }
    }
  }, [notifications, activeNotification]);

  const handleCloseNotification = () => {
    setActiveNotification(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    setActiveNotification(null);
  };

  // Fonctions pour la gestion des fichiers
  const handleFileSelect = (event) => {
    console.log('=== DÉBOGAGE SÉLECTION FICHIER ===');
    console.log('Event:', event);
    console.log('Files:', event.target.files);
    
    const file = event.target.files[0];
    console.log('Fichier sélectionné:', file);
    
    if (file) {
      console.log('Taille du fichier:', file.size);
      console.log('Type du fichier:', file.type);
      
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log('Fichier trop volumineux');
        showSnackbar('Le fichier est trop volumineux. Taille maximum : 10MB', 'error');
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      console.log('Types autorisés:', allowedTypes);
      console.log('Type du fichier dans la liste:', allowedTypes.includes(file.type));
      
      if (!allowedTypes.includes(file.type)) {
        console.log('Type de fichier non supporté');
        showSnackbar('Type de fichier non supporté. Formats acceptés : images, PDF, documents', 'error');
        return;
      }
      
      console.log('Fichier validé, mise à jour du state');
      setSelectedFile(file);
    } else {
      console.log('Aucun fichier sélectionné');
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation) return;

    try {
      console.log('=== DÉBOGAGE ENVOI FICHIER ===');
      console.log('Fichier sélectionné:', selectedFile);
      console.log('Conversation:', selectedConversation._id);
      
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedFile.type.startsWith('image/') ? 'image' : 'file');

      console.log('FormData créé:', formData);

      const response = await axios.post(`${API_BASE_URL}/api/users/messages/${selectedConversation._id}/file`, formData, {
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
      console.error('=== ERREUR ENVOI FICHIER ===');
      console.error('Erreur complète:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      showSnackbar('Erreur lors de l\'envoi du fichier', 'error');
      setUploadingFile(false);
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patient.nom.toLowerCase().includes(search.toLowerCase()) ||
    conv.patient.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
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
          Communiquez avec vos patients
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
        {/* Liste des patients */}
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
              {unreadCount > 0 && (
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
              
          {conversations.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune conversation disponible
            </Typography>
          ) : (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {conversations.map((conversation) => (
                <Box
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2.5,
                    cursor: 'pointer',
                    bgcolor: selectedConversation?._id === conversation._id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                        bgcolor: selectedConversation?._id === conversation._id 
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
                      borderRadius: '0 2px 2px 0',
                      zIndex: 1
                    } : {}
                  }}
                >
                  <Avatar 
                    src={conversation.patient?.avatar} 
                    sx={{ 
                      mr: 2, 
                      width: 48, 
                      height: 48,
                      bgcolor: '#3b82f6',
                      fontSize: '1.2rem',
                      fontWeight: 600
                    }}
                  >
                    {conversation.patient?.nom?.charAt(0) || 'P'}
                        </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: conversation.unreadCount > 0 ? 800 : 600, 
                        color: conversation.unreadCount > 0 ? '#1a1a1a' : '#1a1a1a',
                        fontSize: '0.95rem',
                        noWrap: true,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                              {conversation.patient?.nom || 'Patient'}
                            </Typography>
                            {conversation.unreadCount > 0 && (
                              <Box
                                sx={{
                            bgcolor: '#ef4444',
                                  color: 'white',
                                  borderRadius: '50%',
                            width: 22,
                            height: 22,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                                }}
                              >
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                              </Box>
                            )}
                          </Box>
                    <Typography variant="body2" sx={{ 
                      color: conversation.unreadCount > 0 ? '#3b82f6' : '#666',
                      fontSize: '0.8rem',
                      noWrap: true,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: conversation.unreadCount > 0 ? 700 : 400
                    }}>
                      {conversation.unreadCount > 0 ? (
                        `📬 ${conversation.unreadCount} message${conversation.unreadCount > 1 ? 's' : ''} non lu${conversation.unreadCount > 1 ? 's' : ''}`
                      ) : (
                        conversation.rdv ? (
                          `📅 RDV: ${new Date(conversation.rdv.date).toLocaleDateString('fr-FR')} à ${conversation.rdv.heure}`
                        ) : (
                          '💬 Aucun rendez-vous associé'
                        )
                              )}
                            </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#999',
                      fontSize: '0.75rem'
                    }}>
                              {conversation.derniereActivite ? 
                                new Date(conversation.derniereActivite).toLocaleDateString('fr-FR') : 
                                'Nouvelle conversation'
                              }
                            </Typography>
                          </Box>
                </Box>
              ))}
                  </Box>
                )}
        </Box>

        {/* Zone de chat */}
        <Box sx={{ 
          flex: 1, 
            display: 'flex',
          flexDirection: 'column',
          bgcolor: 'rgba(255,255,255,0.95)'
          }}>
            {selectedConversation ? (
              <>
                {/* En-tête de la conversation */}
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {selectedConversation.patient?.nom?.charAt(0) || 'P'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedConversation.patient?.nom || 'Patient'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedConversation.patient?.email || 'Email non disponible'}
                      </Typography>
                    </Box>
                    </Box>
                    <Tooltip title="Fermer la conversation">
                      <IconButton
                        onClick={handleQuitterConversation}
                        disabled={quitting}
                        sx={{
                          color: '#dc2626',
                          '&:hover': {
                            bgcolor: 'rgba(220, 38, 38, 0.08)'
                          }
                        }}
                      >
                        <ExitToAppIcon />
                      </IconButton>
                    </Tooltip>
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
                  console.log('Message:', message);
                  console.log('User:', user);
                  console.log('Message expediteur ID:', message.expediteur?._id);
                  console.log('User ID:', user?.userId);
                  console.log('Is own message:', message.expediteur?._id === user?.userId);
                  
                  console.log('=== DÉBOGAGE MESSAGE MÉDECIN ===');
                  console.log('Message complet:', message);
                  console.log('User complet:', user);
                  console.log('Message expediteur ID:', message.expediteur?._id);
                  console.log('User ID:', user?.userId);
                  console.log('User _id:', user?._id);
                  
                  const isOwnMessage = message.expediteur?._id === user?._id;
                  
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
                          src={selectedConversation.patient?.avatar} 
                          sx={{
                            mr: 1.5, 
                            width: 32, 
                            height: 32,
                            bgcolor: '#3b82f6',
                            alignSelf: 'flex-end',
                            flexShrink: 0
                          }}
                        >
                          {selectedConversation.patient?.nom?.charAt(0) || 'P'}
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
                          '&:hover': {
                            '& .message-menu': {
                              opacity: 1
                            }
                          }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                            {isOwnMessage ? (
                              <MedicalServicesIcon sx={{ fontSize: '0.8rem', opacity: 0.8 }} />
                            ) : (
                              <PersonIcon sx={{ fontSize: '0.8rem', opacity: 0.8 }} />
                            )}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                opacity: 0.8,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem'
                              }}
                            >
                              {isOwnMessage ? 'Vous (Médecin)' : `${message.expediteur?.nom || 'Patient'}`}
                            </Typography>
                          {isOwnMessage && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, message)}
                              className="message-menu"
                              sx={{
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
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
                        {/* Affichage du contenu du message */}
                        {message.type === 'image' ? (
                          <Box sx={{ mb: 1 }}>
                            <img 
                              src={`${API_BASE_URL}/uploads/${message.contenu}`}
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
                                link.href = `${API_BASE_URL}/uploads/${message.contenu}`;
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
                            border: '1px solid rgba(0,0,0,0.1)'
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
                                  link.href = `${API_BASE_URL}/uploads/${message.contenu}`;
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
                          <Typography variant="body1">
                            {message.contenu}
                          </Typography>
                        )}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mt: 1
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.7
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
                                    fontSize: '0.8rem', 
                                    color: '#3b82f6',
                                    opacity: 0.8
                                  }} 
                                />
                              ) : (
                                <CheckIcon 
                                  sx={{ 
                                    fontSize: '0.8rem', 
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
                </Box>
                
                {/* Scroll automatique vers le bas */}
                <div ref={messagesEndRef} />

                {/* Zone de saisie */}
                <Box sx={{ 
                  p: 3, 
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'rgba(248,250,252,0.8)'
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
                      onClick={selectedFile ? handleSendFile : handleSendMessage}
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
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Aucune conversation sélectionnée
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Sélectionnez une conversation dans la liste pour commencer à discuter avec votre patient
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
        <MenuItem onClick={handleDeleteMessage} disabled={deleting}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          {deleting ? 'Suppression...' : 'Supprimer le message'}
        </MenuItem>
      </Menu>

      {/* Notification en temps réel */}
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

export default MessagerieMedecinPage; 