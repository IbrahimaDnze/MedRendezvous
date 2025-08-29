import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Barrière d'erreurs globale pour afficher un message convivial
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // Journaliser pour debug
    console.error('Erreur interceptée par GlobalErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
          padding: 24
        }}>
          <div style={{
            maxWidth: 640,
            width: '100%',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 8px', color: '#2a3eb1' }}>Une erreur est survenue</h2>
            <p style={{ margin: 0, color: '#475569' }}>
              Veuillez réessayer. Si le problème persiste, actualisez la page ou réessayez plus tard.
            </p>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(90deg, #2a3eb1 0%, #5b6fd6 100%)',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
