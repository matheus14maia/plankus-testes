import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./Principal.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import BarraDeFerramentas from "../../components/BarraDeFerramentas";
import useResize from "./UseResize"; // Importa o hook customizado
import { useLocation } from 'react-router-dom';
import { Project } from "../../utils/types";

const Principal: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { width, height } = useResize(); // Usa o hook para obter tamanho da janela
  const location = useLocation();
  const project: Project | undefined = location.state?.project; // 🔹 Obtém os dados do projeto passado pelo Manage.tsx

  if (!project) {
    return <p>Erro: Nenhum projeto foi selecionado.</p>;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Verifica se o usuário está autenticado e exibe mensagem de bloqueio ou o conteúdo principal
  if (!isAuthenticated) {
    return <p>Você precisa estar logado para acessar esta página.</p>;
  }

  // Calcula largura da área principal com base no estado da sidebar
  const contentWidth = isSidebarOpen ? width - 200 : width; // Sidebar ocupa 200px quando aberta
  const contentHeight = height - 60; // Subtrai a altura da topbar

  return (
    <div id="principal-screen" className="principal-container">
      <div id="principal-topbar-container">
        <Topbar toggleSidebar={toggleSidebar} />
      </div>
      <div className="main-content">
        <div
          className={
            isSidebarOpen ? "principal-sidebar-open" : "principal-sidebar-closed"
          }
        >
          <Sidebar isOpen={isSidebarOpen} />
        </div>
        <div
          className="principal-content-area"
          style={{
            width: contentWidth,
            height: contentHeight,
          }}
        >
          {/* Renderiza a visualização ativa com base no estado */}
          <BarraDeFerramentas project={project} />
        </div>
      </div>
    </div>
  );
};

export default Principal;