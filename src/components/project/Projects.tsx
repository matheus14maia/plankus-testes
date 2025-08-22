import React, { useState, useEffect } from 'react';
import './Projects.css';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { Project } from '../../utils/types';

// Declaração para o TypeScript entender a API completa que o Electron injetará
declare global {
  interface Window {
    electronAPI?: {
      downloadPointCloud: (project: Project) => void;
      onDownloadComplete: (callback: (data: { projectId: number; status: 'success' | 'error' }) => void) => void;
      selectAndServeLocalProject: () => Promise<{ success: boolean; url?: string }>;
    };
  }
}

interface ProjectsProps {
  onProjectSelect: (project: Project) => void;
}

const Projects: React.FC<ProjectsProps> = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const [downloadStatus, setDownloadStatus] = useState<Record<number, string>>({});

  const isElectron = !!window.electronAPI;

  // Efeito para escutar a finalização do download vinda do Electron
  useEffect(() => {
    if (isElectron) {
      const removeListener = window.electronAPI?.onDownloadComplete((data) => {
        const { projectId } = data;
        // Remove o status do projeto, o que reseta o botão
        setDownloadStatus(prev => {
          const newState = { ...prev };
          delete newState[projectId];
          return newState;
        });
      });
      // Função de limpeza para remover o listener quando o componente for desmontado
      return () => removeListener;
    }
  }, [isElectron]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/projects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects(response.data);
      } catch (error) {
        console.error('❌ Erro ao buscar projetos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [getAccessTokenSilently]);

  const handleDownload = (project: Project) => {
    if (!isElectron) {
      alert("Esta funcionalidade está disponível apenas no aplicativo desktop.");
      return;
    }
    window.electronAPI?.downloadPointCloud(project);
    setDownloadStatus(prev => ({ ...prev, [project.id]: 'Baixando...' }));
  };

  const handleOpenLocal = async (project: Project) => {
    if (!isElectron) {
        alert("Esta funcionalidade está disponível apenas no aplicativo desktop.");
        return;
    }
    
    const result = await window.electronAPI?.selectAndServeLocalProject();
    if (result && result.success) {
        // Cria um novo objeto de projeto com a URL local e passa para a função de seleção
        const localProject = { ...project, url: result.url! };
        onProjectSelect(localProject);
        console.log("Projeto local selecionado:", localProject);
    }
  };

  if (loading) {
    return (
      <div className="loading-container-projects">
        <div className="spinner-projects"></div>
        <p>Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="projects-list">
      {projects.length > 0 ? (
        projects.map(project => (
          <div key={project.id} className="project-item">
            <strong>{project.name}</strong>
            <p>{project.description || 'Sem descrição'}</p>
            <div className="project-buttons">
              <button onClick={() => onProjectSelect(project)}>Abrir Projeto Remoto</button>
              <button 
                className="download-cloud-button" 
                onClick={() => handleDownload(project)}
                disabled={!!downloadStatus[project.id]}
              >
                {downloadStatus[project.id] || 'Baixar Nuvem'}
              </button>
              <button 
                className="local-project-button"
                onClick={() => handleOpenLocal(project)}
              >
                Abrir Projeto Local
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Nenhum projeto disponível.</p>
      )}
    </div>
  );
};

export default Projects;
