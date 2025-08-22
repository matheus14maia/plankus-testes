import React from 'react';
import { createRoot } from 'react-dom/client'; // Substituir ReactDOM.render por createRoot
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const container = document.getElementById('root');

// Garantir que o container não seja null
if (!container) {
  throw new Error("O elemento com id 'root' não foi encontrado no DOM.");
}

const root = createRoot(container); // Criar a raiz do React 18

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-ttpalcpkp8qyfu8o.us.auth0.com" // Substitua pelo domínio do seu app no Auth0
      clientId="asu1YUEjpxe3pUXNosPd5E87FokD8AT3" // Substitua pelo Client ID gerado no painel Auth0
      authorizationParams={{
        redirect_uri: window.location.origin, // URL após o login
        audience: 'Plankus_api', // Configurado no painel Auth0 (opcional)
        scope: 'openid profile email', // Escopos necessários
      }}
      cacheLocation="memory" // Garante que o token seja limpo ao fechar a aba
      useRefreshTokens={false} // Garante que o token não seja renovado automaticamente
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
