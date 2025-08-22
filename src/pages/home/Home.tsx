import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import axios from 'axios';

const Home: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const token = await getAccessTokenSilently();
          console.log('Token de acesso obtido:', token);
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/validate`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Usuário autorizado:', response.data);
          navigate('/manage');
        } catch (error) {
          console.error('Erro ao validar o usuário:', error);
          alert('Acesso negado. Verifique sua autenticação.');
        } finally {
          setLoading(false);
        }
      }
    };    
    checkAuthentication();
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  const handleLogin = () => {
    loginWithRedirect(); // Redireciona para a página de login Auth0
  };

  if (loading) {
    return (
      <div className="loading-container-login">
        <div className="spinner-login"></div>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <nav className="home-top-bar">
        <div className="home-logo">
          <img src="/assets/logo.png" alt="Logo" />
        </div>
        <div className="home-login-form">
          <button onClick={handleLogin}>Login</button>
        </div>
      </nav>

      <main className="home-content">
        <section className="home-company-section">
          <div className="home-company-info">
            <h1>Sobre nossa empresa</h1>
            <br />
            <p>
              Nossa missão é assegurar excelência e precisão na construção, desde o projeto até a execução, fomentando eficiência e sustentabilidade em cada projeto.
            </p>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <p>Contate-nos: contato@plankus.com</p>
        <p>Telefone: +55 (62) 99848-0221</p>
      </footer>
    </div>
  );
};

export default Home;