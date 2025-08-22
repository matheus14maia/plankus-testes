/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

declare const Potree: any;

interface ClipSettingsPanelProps {
  viewer: any;
}

const ClipSettingsPanel: React.FC<ClipSettingsPanelProps> = ({ viewer }) => {
  // Inicializa o estado com a tarefa de clipe atual do viewer
  const [clipTask, setClipTask] = useState(() => viewer.getClipTask());

  // Este useEffect garante que o método de clipe seja sempre 'INSIDE_ANY', como solicitado.
  useEffect(() => {
    if (viewer) {
      viewer.setClipMethod(Potree.ClipMethod.INSIDE_ANY);
    }
  }, [viewer]);

  const handleClipTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTaskId = Number(event.target.value);
    setClipTask(newTaskId);
    viewer.setClipTask(newTaskId);
  };

  const radioStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
    cursor: 'pointer'
  };

  return (
    <div style={{ color: 'white' }}>
      <p style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.9rem' }}>
        Defina como os pontos dentro das caixas de corte devem ser exibidos:
      </p>
      
      <div style={radioStyle}>
        <input
          type="radio"
          id="clip_highlight"
          name="clipTask"
          value={Potree.ClipTask.HIGHLIGHT}
          checked={clipTask === Potree.ClipTask.HIGHLIGHT}
          onChange={handleClipTaskChange}
        />
        <label htmlFor="clip_highlight" style={{ marginLeft: '0.5rem' }}>Destacar</label>
      </div>

      <div style={radioStyle}>
        <input
          type="radio"
          id="clip_show_inside"
          name="clipTask"
          value={Potree.ClipTask.SHOW_INSIDE}
          checked={clipTask === Potree.ClipTask.SHOW_INSIDE}
          onChange={handleClipTaskChange}
        />
        <label htmlFor="clip_show_inside" style={{ marginLeft: '0.5rem' }}>Mostrar Apenas Dentro</label>
      </div>

      <div style={radioStyle}>
        <input
          type="radio"
          id="clip_show_outside"
          name="clipTask"
          value={Potree.ClipTask.SHOW_OUTSIDE}
          checked={clipTask === Potree.ClipTask.SHOW_OUTSIDE}
          onChange={handleClipTaskChange}
        />
        <label htmlFor="clip_show_outside" style={{ marginLeft: '0.5rem' }}>Mostrar Apenas Fora</label>
      </div>
    </div>
  );
};

export default ClipSettingsPanel;