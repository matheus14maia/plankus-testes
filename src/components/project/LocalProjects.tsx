import React, { useState } from 'react';
import './Projects.css'; // Reutilizando o mesmo estilo
import { Project, User } from '../../utils/types';
import AddLocalProjectPanel from './panel/AddLocalProjectPanel';

interface LocalProjectsProps {
  onProjectSelect: (project: Project) => void;
  projects: Project[];
  currentUser: User | null;
  refreshProjects: () => void;
  loading: boolean;
}

const LocalProjects: React.FC<LocalProjectsProps> = ({ onProjectSelect, projects, currentUser, refreshProjects, loading }) => {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  // URL para download do seu app desktop (coloque o link real aqui)
  const downloadUrl = "https://storage.googleapis.com/servidor-local/Servidor%20Local%20e%20PotreeConverter.zip";

  const localProjects = projects.filter(p => p.url && p.url.includes("127.0.0.1"));

  if (loading) {
    return (
      <div className="loading-container-projects">
        <div className="spinner-projects"></div>
        <p>Carregando projetos Locais...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="projects-header">
        <h1>Projetos Locais</h1>
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
          <button className="download-button">Baixar Servidor Local</button>
        </a>
      </div>

      {currentUser?.role_id === 3 && (
        <button
          onClick={() => setIsAddPanelOpen(true)}
          className="add-project-button"
        >
          Adicionar Projeto Local
        </button>
      )}

      <div className="projects-list">
        {localProjects.length > 0 ? (
          localProjects.map(project => (
            <div key={project.id} className="project-item">
              <strong>{project.name}</strong>
              <p>{project.description || 'Sem descrição'}</p>
              <button onClick={() => onProjectSelect(project)}>Abrir Projeto Local</button>
            </div>
          ))
        ) : (
          <p>Nenhum projeto local encontrado. Adicione um novo projeto ou verifique se seu servidor local está rodando.</p>
        )}
      </div>

      {isAddPanelOpen && (
        <AddLocalProjectPanel
          onClose={() => setIsAddPanelOpen(false)}
          currentUser={currentUser}
          onProjectAdded={refreshProjects}
        />
      )}
    </div>
  );
};

export default LocalProjects;
