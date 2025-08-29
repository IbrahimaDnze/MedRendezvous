import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Articles détaillés (à enrichir selon besoin)
const articlesDetails = {
  1: {
    titre: 'Comment bien préparer sa consultation médicale ?',
    texte: `Préparer sa consultation médicale est essentiel pour optimiser le temps avec le professionnel de santé. Voici quelques conseils pratiques :\n\n- Notez tous vos symptômes, même ceux qui vous semblent anodins, ainsi que leur date d’apparition et leur évolution.\n- Faites la liste de vos antécédents médicaux, chirurgicaux et familiaux, ainsi que de vos allergies éventuelles.\n- Apportez vos ordonnances, résultats d’analyses, radios ou comptes rendus d’hospitalisation récents.\n- Préparez une liste de questions à poser au médecin pour ne rien oublier lors de la consultation.\n- Si besoin, faites-vous accompagner par un proche pour vous aider à retenir les informations importantes.\n\nPendant la consultation, n’hésitez pas à demander des explications si un point n’est pas clair. Une bonne préparation permet un diagnostic plus précis, une prise en charge adaptée et favorise une relation de confiance avec votre praticien.`
  },
  2: {
    titre: 'Les avantages de la prise de rendez-vous en ligne',
    texte: `La prise de rendez-vous en ligne révolutionne l’accès aux soins :\n\n- Vous pouvez prendre rendez-vous à tout moment, 24h/24 et 7j/7, sans contrainte d’horaires d’ouverture du secrétariat.\n- Le choix du créneau horaire est facilité, vous visualisez en temps réel les disponibilités des praticiens.\n- Vous évitez les files d’attente téléphoniques et gagnez un temps précieux.\n- Des rappels automatiques par SMS ou email limitent les risques d’oubli.\n- Vous pouvez gérer, modifier ou annuler vos rendez-vous en toute autonomie.\n- L’accès à l’historique de vos rendez-vous et à vos documents médicaux est simplifié.\n\nC’est aussi un moyen de comparer les profils et avis des professionnels, pour choisir celui qui correspond le mieux à vos besoins. La digitalisation du parcours de soins améliore l’expérience patient et optimise l’organisation des cabinets médicaux.`
  },
  3: {
    titre: 'Prévenir plutôt que guérir : l’importance du suivi médical',
    texte: `Le suivi médical régulier est la clé d’une bonne santé sur le long terme.\n\n- Même en l’absence de symptômes, il est recommandé de consulter son médecin pour des bilans de prévention adaptés à son âge et à ses antécédents.\n- Le dépistage précoce de certaines maladies (hypertension, diabète, cancers, etc.) permet une prise en charge rapide et efficace.\n- Le médecin peut vous conseiller sur la vaccination, l’alimentation, l’activité physique et l’hygiène de vie.\n- Un suivi régulier favorise la détection des facteurs de risque et l’adaptation de vos traitements si besoin.\n- C’est aussi l’occasion d’aborder des questions de santé mentale ou de bien-être.\n\nPrendre soin de sa santé, c’est agir avant l’apparition de complications. N’attendez pas d’être malade pour consulter ! Un accompagnement médical personnalisé vous aide à rester en forme et à anticiper les problèmes de santé.`
  }
};


const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articlesDetails[id];

  if (!article) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #fbc2eb 0%, #a6c1ee 100%)' }}>
        <Paper elevation={6} sx={{ p: 5, borderRadius: 5, textAlign: 'center', maxWidth: 420 }}>
          <Typography variant="h5" color="error" sx={{ fontWeight: 700, mb: 2 }}>Article introuvable</Typography>
          <Button onClick={() => navigate(-1)} variant="contained" color="primary" startIcon={<ArrowBackIcon />}>Retour</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #fbc2eb 0%, #a6c1ee 100%)', py: 6 }}>
      <Paper elevation={8} sx={{ maxWidth: 700, width: '100%', mx: 2, p: { xs: 3, md: 6 }, borderRadius: 6, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.13)' }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="secondary"
          sx={{
            mb: 3,
            fontWeight: 800,
            fontSize: 17,
            borderRadius: 99,
            px: 3,
            py: 1.2,
            borderWidth: 2,
            borderColor: 'secondary.main',
            background: 'rgba(245,0,87,0.07)',
            color: 'secondary.main',
            boxShadow: '0 2px 8px 0 rgba(245,0,87,0.10)',
            textTransform: 'none',
            letterSpacing: 1,
            transition: 'all 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #f50057 0%, #1976d2 100%)',
              color: '#fff',
              borderColor: 'primary.main',
              boxShadow: '0 6px 24px 0 rgba(31,38,135,0.13)',
            },
          }}
        >
          Retour aux articles
        </Button>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, color: 'primary.main', letterSpacing: 1, fontSize: { xs: 26, md: 34 } }}>{article.titre}</Typography>
        <Typography variant="body1" sx={{ fontSize: 19, mb: 2, color: 'text.primary', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{article.texte}</Typography>
      </Paper>
    </Box>
  );
};

export default ArticleDetailPage;
