/* eslint-disable @typescript-eslint/no-explicit-any */
// AnnotationsPanel.tsx
import React, { useState } from 'react';

interface Annotation {
  position: string;
  rawPosition: any;
  title: string;
  description: string;
}

interface AnnotationsPanelProps {
  annotationsData: Annotation[];
  flyToAnnotation: (position: any) => void;
  handleTitleChange: (index: number, newTitle: string) => void;
  handleDescriptionChange: (index: number, newDescription: string) => void;
  applyChanges: (index: number) => void;
  handleDeleteAnnotation: (index: number) => void;
}

const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({
  annotationsData,
  flyToAnnotation,
  handleTitleChange,
  handleDescriptionChange,
  applyChanges,
  handleDeleteAnnotation
}) => {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    const newSet = new Set(expandedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedIndices(newSet);
  };

  return (
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {annotationsData.length > 0 ? (
        annotationsData.map((annotation, index) => {
          const isExpanded = expandedIndices.has(index);
          return (
            <li key={index} style={{ marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '5px', padding: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{annotation.title || 'Sem título'}</strong>
                <button
                  onClick={() => toggleExpand(index)}
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
                <>
                  <div style={{ marginTop: '0.5rem' }}>
                    <label>Título:</label>
                    <input
                      type="text"
                      value={annotation.title}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      onBlur={() => applyChanges(index)}
                      style={{ marginTop: '5px', width: '100%', marginBottom: '5px', color: 'white', backgroundColor: '#1e2027', border: '1px solid white', borderRadius: '0.2rem' }}
                    />
                  </div>
                  <div>
                    <label>Descrição:</label>
                    <input
                      type="text"
                      value={annotation.description}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      onBlur={() => applyChanges(index)}
                      style={{ marginTop: '5px', width: '100%', marginBottom: '5px', color: 'white', backgroundColor: '#1e2027', border: '1px solid white', borderRadius: '0.2rem' }}
                    />
                  </div>
                  <div>
                    <label
                      onClick={() => flyToAnnotation(annotation.rawPosition)}
                      style={{ marginTop: '5px', cursor: 'pointer', color: 'white', fontSize: '0.8rem' }}
                    >
                      Posição: {annotation.position}
                    </label>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnotation(index)}
                    style={{
                      marginTop: '7px',
                      color: 'white',
                      backgroundColor: '#1e2027',
                      border: 'none',
                      borderRadius: '0.2rem',
                      cursor: 'pointer',
                      boxShadow: '0px 1px 5px #cccbcd',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#cccbcd';
                      e.currentTarget.style.boxShadow = '0px 1px 5px #cccbcd';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#1e2027';
                      e.currentTarget.style.boxShadow = '0px 1px 5px #cccbcd';
                    }}
                  >
                    Remover
                  </button>
                </>
              )}
            </li>
          );
        })
      ) : (
        <li>Nenhuma anotação encontrada.</li>
      )}
    </ul>
  );
};

export default AnnotationsPanel;
