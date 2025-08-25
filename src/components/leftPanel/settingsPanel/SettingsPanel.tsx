// src/components/leftPanel/SettingsPanel.tsx (NOVO ARQUIVO)

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SceneObjectsPanel from '../sceneObjectsPanel/SceneObjectsPanel';
import ClipSettingsPanel from '../clipSettingsPanel/ClipSettingsPanel';
import NavigationInstructions from '@/components/subBarMenu/navigation/NavigationInstructions';
import RotationSpeed from '@/components/subBarMenu/navigation/RotationSpeed';

declare const Potree: any;

interface SettingsPanelProps {
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
  viewer: any;
  expandedSections: Set<string>;
  setExpandedSections: (value: Set<string>) => void;
  // NOVAS PROPS para orientação
  course: number;
  setCourse: (value: number) => void;
  pitch: number;
  setPitch: (value: number) => void;
  roll: number;
  setRoll: (value: number) => void;
  images360: any; // Para verificar se uma imagem está focada
  toggleSpheres: () => void;
  spheresVisible: boolean;
  togglePointCloud: () => void;
  pointCloudVisible: boolean;
}

interface SettingSection {
  id: string;
  title: string;
  content: React.ReactNode;
  condition?: () => boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
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
  viewer,
  expandedSections,
  setExpandedSections,
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

  const toggleSection = (sectionId: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    setExpandedSections(newSet);
  };

  /*const renderAngleSlider = (label: string, value: number, setter: (val: number) => void) => (
    <div>
      <label htmlFor={label} style={{ display: 'block', marginBottom: '0.5rem' }}>
        {label}: {value.toFixed(2)}°
      </label>
      <input
        type="range"
        id={label}
        min="-180"
        max="180"
        step="0.1"
        value={value}
        onChange={(e) => setter(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );*/

  const sections: SettingSection[] = [
    {
      id: 'image360Transform',
      title: 'Ajuste da Imagem 360',
      condition: () => images360 && images360.focusedImage,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white', width: '100%' }}>
          <strong>Rotação</strong>
          <div>
             <label>Course (Yaw): {course.toFixed(2)}°</label>
             <input type="range" min="-360" max="360" step="0.1" value={course}
                    onChange={(e) => setCourse(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div>
             <label>Pitch: {pitch.toFixed(2)}°</label>
             <input type="range" min="-180" max="180" step="0.1" value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div>
             <label>Roll: {roll.toFixed(2)}°</label>
             <input type="range" min="-180" max="180" step="0.1" value={roll}
                    onChange={(e) => setRoll(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </div>
      )
    },
    {
      id: 'pointCloudSettings',
      title: 'Configurações da Nuvem de Pontos',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white', width: '100%' }}>
          {/* Controle de Point Budget */}
          <div>
            <label htmlFor="pointBudget" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Total de pontos: {pointBudget.toLocaleString('pt-BR')}
            </label>
            <input
              type="range"
              id="pointBudget"
              min="1000000"
              max="10000000"
              step="100000"
              value={pointBudget}
              onChange={(e) => setPointBudget(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Controle de Tamanho do Ponto */}
          <div>
            <label htmlFor="pointSize" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Tamanho do Ponto: {pointSize.toFixed(1)}
            </label>
            <input
              type="range"
              id="pointSize"
              min="2"
              max="10"
              step="0.1"
              value={pointSize}
              onChange={(e) => setPointSize(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Controle de Tipo de Tamanho */}
          <div>
            <label htmlFor="pointSizeType" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Tipo de Tamanho
            </label>
            <select
              id="pointSizeType"
              value={pointSizeType}
              onChange={(e) => setPointSizeType(Number(e.target.value))}
              style={{ width: '100%', padding: '0.3rem', color: 'white', backgroundColor: '#1e2027', border: '1px solid white' }}
            >
              <option value={Potree.PointSizeType.FIXED}>Fixo</option>
              <option value={Potree.PointSizeType.ADAPTIVE}>Adaptativo</option>
            </select>
          </div>

          {/* Controle de Formato do Ponto */}
          <div>
            <label htmlFor="pointShape" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Formato do Ponto
            </label>
            <select
              id="pointShape"
              value={pointShape}
              onChange={(e) => setPointShape(Number(e.target.value))}
              style={{ width: '100%', padding: '0.3rem', color: 'white', backgroundColor: '#1e2027', border: '1px solid white' }}
            >
              <option value={Potree.PointShape.SQUARE}>Quadrado</option>
              <option value={Potree.PointShape.CIRCLE}>Círculo</option>
              <option value={Potree.PointShape.PARABOLOID}>Paraboloide</option>
            </select>
          </div>

          {/* Controle de Eye-Dome Lighting (EDL) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <label htmlFor="useEDL" style={{ cursor: 'pointer' }}>
              Eye-Dome Lighting
            </label>
            <input
              type="checkbox"
              id="useEDL"
              checked={useEDL}
              onChange={(e) => setUseEDL(e.target.checked)}
              style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
            />
          </div>
        </div>
      )
    },
    /*{
      id: 'image360Orientation',
      title: 'Orientação da Câmera 360',
      condition: () => images360 && images360.focusedImage, // Só mostra se uma imagem estiver focada
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white', width: '100%' }}>
          {renderAngleSlider('Course (Yaw)', course, setCourse)}
          {renderAngleSlider('Pitch', pitch, setPitch)}
          {renderAngleSlider('Roll', roll, setRoll)}
        </div>
      )
    },*/
    {
      id: 'clippingSettings',
      title: 'Caixas de Corte',
      content: (
        <ClipSettingsPanel viewer={viewer} />
      ),
    },
    {
      id: 'sceneObjects',
      title: 'Objetos na Cena',
      content: (
        <SceneObjectsPanel viewer={viewer} />
      )
    },
    // EXEMPLO: Como adicionar uma nova seção no futuro
    // {
    //   id: 'appearanceSettings',
    //   title: 'Configurações de Aparência',
    //   content: (
    //     <div>
    //       <p>Novas opções de aparência aqui...</p>
    //     </div>
    //   )
    // }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white', width: '90%' }}>
      {/* NOVO: Seção de botões para controle de visibilidade */}
      <div style={{ marginBottom: '1rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button onClick={togglePointCloud} style={{
          border: '1px solid #ccc', borderRadius: '5px',
          padding: '0.5rem',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          color: 'white',
          fontSize: '0.9rem'
        }}>
          {pointCloudVisible ? 'Ocultar Nuvem de Pontos' : 'Mostrar Nuvem de Pontos'}
        </button>
        <button onClick={toggleSpheres} style={{
          border: '1px solid #ccc', borderRadius: '5px',
          padding: '0.5rem',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          color: 'white',
          fontSize: '0.9rem'
        }}>
          {spheresVisible ? 'Ocultar Varreduras' : 'Mostrar Varreduras'}
        </button>
        <NavigationInstructions viewer={viewer} />
        <RotationSpeed viewer={viewer} />
      </div>
      {sections.map((section) => {
        // Se a condição existir e for falsa, não renderiza a seção
        if (section.condition && !section.condition()) {
          return null;
        }
        const isExpanded = expandedSections.has(section.id);
        return (
          <div key={section.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '5px', padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection(section.id)}>
              <strong>{section.title}</strong>
              <button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
            {isExpanded && (
              <div style={{ marginTop: '1rem' }}>
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SettingsPanel;