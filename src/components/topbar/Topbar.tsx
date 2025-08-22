import React, { useState } from 'react';
import './Topbar.css';
import { Icon } from '@iconify/react';
import { useAuth0 } from '@auth0/auth0-react';

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const { logout, user } = useAuth0(); // Adiciona o 'user' para pegar os dados do usuário
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Abre ou fecha o menu
  };

  const handleLogout = () => {
    logout({
      logoutParams: { returnTo: window.location.origin }, // Passa returnTo dentro de logoutParams
    });
  };

  const renderProfileIcon = () => {
    // Verifica se há uma foto válida e se a URL não é uma string vazia
    if (user?.picture) {
      return (
        <img
          src={user.picture}
          alt="Foto de perfil"
          width="35"
          height="35"
          style={{ borderRadius: '50%' }}
          onError={(e) => (e.currentTarget.style.display = 'none')} // Oculta a imagem caso falhe ao carregar
        />
      );
    }
    return <Icon icon="mdi:account-circle" width="35" color="#361bbc" />; // Ícone padrão
  };

  return (
    <div id="principal-topbar-container">
      <button className="topbar-icon-button" onClick={toggleSidebar}>
        <Icon icon="mdi:menu" width="24" color="#361bbc" />
      </button>
      <div className="topbar-logo">
        <img src="/assets/logo.png" alt="Logo" />
      </div>
      <div className="topbar-profile-icon">
        <button onClick={toggleMenu}>
          {renderProfileIcon()}
        </button>

        {isMenuOpen && (
          <div className="profile-dropdown-menu">
            <ul>
              <li><button>Perfil</button></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
