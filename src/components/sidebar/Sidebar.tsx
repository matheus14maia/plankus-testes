import React from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean; // Define se a sidebar está aberta
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  return (
    <div id="principal-sidebar" className={isOpen ? 'principal-sidebar-open' : 'principal-sidebar-closed'}>
      <div className="principal-sidebar-content">
        <button
          className="sidebar-button"
          onClick={() => {navigate('/manage');}}
        >
          Gerenciamento de Projetos
        </button>
        <div className="sidebar-divider" />
        <button
          className="sidebar-button"
          onClick={() => {navigate('/userManagement');}}
        >
          Gerenciamento de Usuários
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
