/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getImagesFromCSV } from './ImageListUtils';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import AnnotationsPanel from './annotationsPanel/AnnotationsPanel';
import ImagesPanel from './imagesPanel/ImagesPanel';
import SettingsPanel from './settingsPanel/SettingsPanel';

declare const Potree: any;

interface LeftPanelProps {
  viewer: any; // Substitua 'any' pelo tipo correto, se possível
  projectId: number;
  csv_url: string;
  // Adicionar novas props para as configurações
  pointBudget: number;
  setPointBudget: (value: number) => void;
  pointSize: number;
  setPointSize: (value: number) => void;
  pointSizeType: any;
  setPointSizeType: (value: any) => void;
  pointShape: any;
  setPointShape: (value: any) => void;
  useEDL: boolean;
  setUseEDL: (value: boolean) => void;
  course: number;
  setCourse: (value: number) => void;
  pitch: number;
  setPitch: (value: number) => void;
  roll: number;
  setRoll: (value: number) => void;
  images360: any;
  toggleSpheres: () => void;
  spheresVisible: boolean;
  togglePointCloud: () => void;
  pointCloudVisible: boolean;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ 
  viewer, 
  projectId, 
  csv_url,
  pointBudget,
  setPointBudget,
  pointSize,
  setPointSize,
  pointSizeType,
  setPointSizeType,
  pointShape,
  setPointShape,
  useEDL,
  setUseEDL,
  course,
  setCourse,
  pitch,
  setPitch,
  roll,
  setRoll,
  images360,
  toggleSpheres,
  spheresVisible,
  togglePointCloud,
  pointCloudVisible
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracoes'); // Abas: 'anotacoes', 'imagens' ou 'medidas'
  const [annotationsData, setAnnotationsData] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { getAccessTokenSilently } = useAuth0();
  const [expandedSettingsSections, setExpandedSettingsSections] = useState<Set<string>>(
    new Set(['pointCloudSettings'])
  );

  const togglePanel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Atualização periódica das anotações do viewer
  useEffect(() => {
    const updateAnnotationsFromViewer = () => {
      if (viewer?.scene?.annotations?.children) {
        const annotations = viewer.scene.annotations.children.map((annotation: any) => ({
          position: formatPosition(annotation.position),
          title: annotation.title,
          description: annotation.description,
          rawPosition: annotation.position,
        }));
        setAnnotationsData(annotations);
        console.log("🔄 Atualizando anotações do viewer:", annotations);
      }
    };

    const interval = setInterval(updateAnnotationsFromViewer, 10000);
    return () => clearInterval(interval);
  }, [viewer]);

  // Carregar as imagens do CSV
  useEffect(() => {
    getImagesFromCSV(csv_url).then((data) => setImages(data));
  }, [csv_url]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredImages = images
    .filter((image) => image.name.toLowerCase().includes(searchQuery))
    .sort((a, b) => a.name.localeCompare(b.name));

  const flyToImage = (position: { x: number; y: number; z: number }) => {
    if (!position || isNaN(position.x) || isNaN(position.y) || isNaN(position.z)) {
      console.error("❌ Posição inválida:", position);
      return;
    }
    const posX = Number(position.x);
    const posY = Number(position.y);
    const posZ = Number(position.z) + 0.5;
    console.log(`📍 Movendo a câmera para: x=${posX}, y=${posY}, z=${posZ}`);
    viewer.scene.view.position.set(posX, posY, posZ);
    viewer.scene.view.lookAt(posX, posY, posZ - 10);
    viewer.render();
  };

  const formatPosition = (position: any) => {
    if (!position) {
      console.warn("⚠️ Posição indefinida, usando padrão.");
    }
    let posArray: [number, number, number];
    if (Array.isArray(position) && position.length === 3) {
      posArray = position as [number, number, number];
    } else if (typeof position === "object" && "x" in position && "y" in position && "z" in position) {
      posArray = [position.x, position.y, position.z];
    } else {
      console.error("❌ Posição inválida:", position);
      return "x: 0.000m, y: 0.000m, z: 0.000m";
    }
    const [x, y, z] = posArray;
    return `x: ${x.toFixed(3)}m, y: ${y.toFixed(3)}m, z: ${z.toFixed(3)}m`;
  };

  // Funções para atualizar e remover anotações
  const handleTitleChange = (index: number, newTitle: string) => {
    const updatedAnnotations = [...annotationsData];
    const annotation = updatedAnnotations[index];
    const oldTitle = annotation.title;
    const oldDescription = annotation.description;
    updatedAnnotations[index].title = newTitle;
    setAnnotationsData(updatedAnnotations);
    updateAnnotationInDB(oldTitle, oldDescription, annotation.rawPosition, { name: newTitle });
  };

  const handleDescriptionChange = (index: number, newDescription: string) => {
    const updatedAnnotations = [...annotationsData];
    const annotation = updatedAnnotations[index];
    const oldTitle = annotation.title;
    const oldDescription = annotation.description;
    updatedAnnotations[index].description = newDescription;
    setAnnotationsData(updatedAnnotations);
    updateAnnotationInDB(oldTitle, oldDescription, annotation.rawPosition, { description: newDescription });
  };

  const applyChanges = (index: number) => {
    if (viewer?.annotationTool?.viewer?.scene?.annotations?.children) {
      const annotation = viewer.scene.annotations.children[index];
      annotation.title = annotationsData[index].title;
      annotation.description = annotationsData[index].description;
      viewer.render();
    }
  };

  const flyToAnnotation = (position: any) => {
    viewer.scene.view.position.set(position.x, position.y, position.z);
    viewer.scene.view.lookAt(position);
    viewer.render();
  };

  const handleDeleteAnnotation = async (index: number) => {
    try {
      const token = await getAccessTokenSilently();
      const annotationToDelete = annotationsData[index];
      if (!annotationToDelete) {
        console.error("❌ Anotação não encontrada na UI.");
        return;
      }
      console.log("🔍 Tentando deletar anotação:", annotationToDelete);
      const annotationId = await findAnnotationId(annotationToDelete.title, annotationToDelete.description, annotationToDelete.rawPosition);
      if (!annotationId) {
        console.error("❌ Anotação não encontrada no banco.");
        alert("Anotação não encontrada no banco.");
        return;
      }
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/annotations/${annotationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`🗑️ Anotação ID ${annotationId} deletada com sucesso.`);
      setAnnotationsData((prev) => prev.filter((_, i) => i !== index));
      const viewerAnnotations = viewer.scene.annotations.children;
      const viewerAnnotationIndex = viewerAnnotations.findIndex(
        (ann: any) =>
          ann.title.trim().toLowerCase() === annotationToDelete.title.trim().toLowerCase() &&
          ann.description.trim().toLowerCase() === annotationToDelete.description.trim().toLowerCase()
      );
      if (viewerAnnotationIndex !== -1) {
        viewer.scene.removeAnnotation(viewerAnnotations[viewerAnnotationIndex]);
        console.log("✅ Anotação removida do viewer.");
      }
      viewer.render();
      alert("✅ Anotação removida com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao remover anotação:", error);
      alert("Erro ao remover anotação do banco.");
    }
  };

  // Funções auxiliares para lidar com o banco de dados
  const findAnnotationId = async (title: string, description: string, position: { x: number; y: number; z: number }) => {
    try {
      const token = await getAccessTokenSilently();
      const { data: annotationsFromDB } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/annotations/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const matchingAnnotation = annotationsFromDB.find(
        (dbAnnotation: any) =>
          dbAnnotation.name.trim().toLowerCase() === title.trim().toLowerCase() &&
          dbAnnotation.description.trim().toLowerCase() === description.trim().toLowerCase() &&
          dbAnnotation.position_x.toFixed(3) === position.x.toFixed(3) &&
          dbAnnotation.position_y.toFixed(3) === position.y.toFixed(3) &&
          dbAnnotation.position_z.toFixed(3) === position.z.toFixed(3)
      );
      return matchingAnnotation ? matchingAnnotation.id : null;
    } catch (error) {
      console.error("❌ Erro ao buscar anotação no banco:", error);
      return null;
    }
  };

  const updateAnnotationInDB = async (oldTitle: string, oldDescription: string, position: { x: number; y: number; z: number }, updatedData: Partial<{ name: string; description: string }>) => {
    try {
      const annotationId = await findAnnotationId(oldTitle, oldDescription, position);
      if (!annotationId) {
        console.error("❌ ID da anotação não encontrado.");
        return;
      }
      const token = await getAccessTokenSilently();
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/annotations/${annotationId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Anotação ID ${annotationId} atualizada no banco.`);
    } catch (error) {
      console.error("❌ Erro ao atualizar anotação:", error);
    }
  };

  // Busca inicial das anotações no banco
  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/annotations/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const annotations = response.data;
        setAnnotationsData(
          annotations.map((annotation: any) => ({
            position: formatPosition({
              x: annotation.position_x,
              y: annotation.position_y,
              z: annotation.position_z
            }),
            title: annotation.name,
            description: annotation.description,
            rawPosition: {
              x: annotation.position_x,
              y: annotation.position_y,
              z: annotation.position_z
            },
          }))
        );

        if (!viewer || !viewer.scene) {
          console.error("❌ Viewer não carregado.");
          return;
        }
        viewer.scene.annotations.removeAllChildren();
        annotations.forEach((annotation: any) => {
          const newAnnotation = new Potree.Annotation({
            position: [annotation.position_x, annotation.position_y, annotation.position_z],
            title: annotation.name,
            description: annotation.description,
            cameraPosition: [annotation.position_x, annotation.position_y, annotation.position_z + 10],
            cameraTarget: [annotation.position_x, annotation.position_y, annotation.position_z],
          });
          viewer.scene.annotations.add(newAnnotation);
          console.log(`✅ Anotação '${annotation.name}' adicionada ao viewer.`);
        });
        viewer.render();
      } catch (error) {
        console.error('❌ Erro ao buscar anotações:', error);
      }
    };

    if (viewer) {
      fetchAnnotations();
    } else {
      console.warn("⏳ Aguardando carregamento do viewer...");
    }
  }, [getAccessTokenSilently, projectId, viewer]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        color: 'white',
        backgroundColor: '#1e2027',
        borderRadius: '0 0.5rem 0.5rem 0',
        border: '1px solid #fff',
        width: isExpanded ? '20%' : '2%',
        height: '100%',
        transition: 'width 0.3s',
        overflow: 'hidden',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Ícone para expandir/encolher */}
      <div
        onClick={togglePanel}
        style={isExpanded ? {
          cursor: 'pointer',
          position: 'absolute',
          top: '50%',
          right: '1%',
          transform: 'translate(-50%, -50%)',
        } : {
          cursor: 'pointer',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Icon
          icon={isExpanded ? 'mdi:chevron-left' : 'mdi:chevron-right'}
          style={{ fontSize: '24px', color: 'white' }}
        />
      </div>

      {isExpanded && (
        <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', marginBottom: '1rem', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('configuracoes')}
              style={{
                color: activeTab === 'configuracoes' ? 'black' : '#cccbcd',
                backgroundColor: activeTab === 'configuracoes' ? '#cccbcd' : '#1e2027',
                border: 'none',
                borderRadius: '0.2rem',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Configurações
            </button>
            <button
              onClick={() => setActiveTab('anotacoes')}
              style={{
                color: activeTab === 'anotacoes' ? 'white' : '#cccbcd',
                backgroundColor: activeTab === 'anotacoes' ? '#cccbcd' : '#1e2027',
                border: 'none',
                borderRadius: '0.2rem',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              Anotações
            </button>
            <button
              onClick={() => setActiveTab('medidas')}
              style={{
                color: activeTab === 'medidas' ? 'white' : '#cccbcd',
                backgroundColor: activeTab === 'medidas' ? '#cccbcd' : '#1e2027',
                border: 'none',
                borderRadius: '0.2rem',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              Medidas
            </button>
            <button
              onClick={() => setActiveTab('imagens')}
              style={{
                color: activeTab === 'imagens' ? 'white' : '#cccbcd',
                backgroundColor: activeTab === 'imagens' ? '#cccbcd' : '#1e2027',
                border: 'none',
                borderRadius: '0.2rem',
                cursor: 'pointer',
              }}
            >
              Imagens
            </button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px', paddingBottom: '20px' }}>
            {activeTab === 'configuracoes' ? ( // Nova aba
              <SettingsPanel
                pointBudget={pointBudget}
                setPointBudget={setPointBudget}
                pointSize={pointSize}
                setPointSize={setPointSize}
                pointSizeType={pointSizeType}
                setPointSizeType={setPointSizeType}
                pointShape={pointShape}
                setPointShape={setPointShape}
                useEDL={useEDL}
                setUseEDL={setUseEDL}
                viewer={viewer}
                expandedSections={expandedSettingsSections}
                setExpandedSections={setExpandedSettingsSections}
                course={course}
                setCourse={setCourse}
                pitch={pitch}
                setPitch={setPitch}
                roll={roll}
                setRoll={setRoll}
                images360={images360}
                toggleSpheres={toggleSpheres}
                spheresVisible={spheresVisible}
                togglePointCloud={togglePointCloud}
                pointCloudVisible={pointCloudVisible}
              />
            ) : activeTab === 'anotacoes' ? (
              <AnnotationsPanel
                annotationsData={annotationsData}
                flyToAnnotation={flyToAnnotation}
                handleTitleChange={handleTitleChange}
                handleDescriptionChange={handleDescriptionChange}
                applyChanges={applyChanges}
                handleDeleteAnnotation={handleDeleteAnnotation}
              />
            ) : activeTab === 'imagens' ? (
              <ImagesPanel
                filteredImages={filteredImages}
                searchQuery={searchQuery}
                handleSearch={handleSearch}
                flyToImage={flyToImage}
              />
            ) : (
              <div>
                {/* Conteúdo da aba de medidas */}
                <p>Conteúdo de medidas aqui...</p>
              </div>
            )}
          </div>
        </div>
      )}
      <style>
        {`
          /* Estilo da barra de rolagem */
          ::-webkit-scrollbar {
            width: 7px;
          }
          ::-webkit-scrollbar-track {
            background-color: #1e2027;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #cccbcd;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

export default LeftPanel;
