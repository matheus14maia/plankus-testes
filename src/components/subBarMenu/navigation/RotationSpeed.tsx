/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/subBarMenu/navigation/RotationSpeedPanel.tsx (NOVO ARQUIVO)

import React, { useState, useEffect } from 'react';

interface RotationSpeedProps {
  viewer: any; // O objeto viewer do Potree
}

const RotationSpeed: React.FC<RotationSpeedProps> = ({ viewer }) => {
  // Estado para armazenar o valor atual da velocidade de rotação no React
  const [rotationSpeed, setRotationSpeed] = useState(30); // Valor padrão inicial

  // useEffect para buscar o valor real quando o componente for montado
  useEffect(() => {
    if (viewer && viewer.getControls() && typeof viewer.getControls().rotationSpeed !== 'undefined') {
      // Acessa o controle de primeira pessoa e pega o valor atual de rotationSpeed
      const currentSpeed = viewer.getControls().rotationSpeed;
      setRotationSpeed(currentSpeed);
    }
  }, [viewer]); // Executa quando o viewer estiver disponível

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number(event.target.value);
    
    // 1. Atualiza o estado do React para o slider refletir a mudança
    setRotationSpeed(newSpeed);

    // 2. Acessa o controle e define a propriedade rotationSpeed diretamente
    if (viewer && viewer.getControls()) {
      viewer.getControls().rotationSpeed = newSpeed;
    }
  };

  return (
    <div style={{ display: 'absolute', width: '100%' }}>
      <div style={{ 
            marginTop: '0.5rem',
            backgroundColor: '#1e2027',
            color: 'white'
        }}>
        <strong>
          Velocidade de Rotação: 
        </strong>
        <input
          type="range"
          id="rotationSpeed"
          min="1"
          max="200"
          step="1"
          value={rotationSpeed}
          onChange={handleSpeedChange}
          style={{ width: '100%' }}
        />
        <span>{rotationSpeed}</span>
      </div>
    </div>
  );
};

export default RotationSpeed;