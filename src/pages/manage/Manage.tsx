import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Projects from '../../components/project/Projects';
import WelcomeModal from '../../components/welcomeModal/WelcomeModal';
import './Manage.css';
import { Project } from '../../utils/types';


const Manage: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // A chave no localStorage nos ajuda a lembrar da escolha do usuário
    const hasDismissedWelcome = localStorage.getItem('hasDismissedPlankusViewerModal');

    if (!hasDismissedWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleProjectSelect = (project: Project) => {
    console.log(`Projeto ${project.id} selecionado`);
    navigate('/principal', { state: { project } }); // 🔹 Passa os dados do projeto para Principal.tsx
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcome(false);
  };

  const handleDismissForever = () => {
    localStorage.setItem('hasDismissedPlankusViewerModal', 'true');
    setShowWelcome(false);
  };

  if (!isAuthenticated) {
    return <p>Você precisa estar logado para acessar esta página.</p>;
  }

  return (
    <div id="manage-screen" className="manage-container">
      <div id="manage-topbar-container">
        <Topbar toggleSidebar={toggleSidebar} />
      </div>
      <div className="main-content">
        <div className={isSidebarOpen ? "manage-sidebar-open" : "manage-sidebar-closed"}>
          <Sidebar isOpen={isSidebarOpen} />
        </div>
        <div className="manage-content-area">
          <div className="manage-header">
            <h1>Gerenciar Projetos</h1>
            <a
              href="https://storage.googleapis.com/servidor-local/Plankus%20Viewer%20Setup%201.0.0.exe"
              className="download-viewer-button"
              download
            >
              Baixar Plankus Viewer
            </a>
          </div>
          <Projects onProjectSelect={handleProjectSelect} />
        </div>
      </div>
      {showWelcome && (
        <WelcomeModal
          onClose={handleCloseWelcomeModal}
          onDismissForever={handleDismissForever}
        />
      )}
    </div>
  );
};

export default Manage;
