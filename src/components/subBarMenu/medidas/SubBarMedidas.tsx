/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import SubBarButton from '../button/SubBarButton';

// Definindo as props do componente para incluir o viewer
interface SubBarMedidasProps {
  viewer: any; // Substitua 'any' pelo tipo correto, se possível (por exemplo, `Potree.Viewer`)
}

const SubBarMedidas: React.FC<SubBarMedidasProps> = ({ viewer }) => {
  const [isHorizontal] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Funções para lidar com a inserção de medidas
  const measureDistance = () => {
    viewer.measuringTool.startInsertion({
      showDistances: true,
      showArea: false,
      closed: false,
      name: 'Distance'
    });
  };

  const measureDeltas = () => {
    viewer.measuringTool.startInsertion({
      showDistances: true,
      showAngles: true,
      closed: false,
      name: 'Deltas'
    });
  };

  const measurePoint = () => {
    viewer.measuringTool.startInsertion({
      showDistances: false,
      showAngles: false,
      showCoordinates: true,
      showArea: false,
      closed: true,
      maxMarkers: 1,
      name: 'Point'
    });
  };

  const measureAngle = () => {
    viewer.measuringTool.startInsertion({
      showDistances: false,
      showAngles: true,
      closed: false,
      name: 'Angle'
    });
  };

  const measureArea = () => {
    viewer.measuringTool.startInsertion({
      showDistances: false,
      showArea: true,
      closed: true,
      name: 'Area'
    });
  };

  const startVolumeClip = () => {
    // Chama a ferramenta de volume com a opção 'clip' ativada.
    // Isso cria um Volume que funciona como uma caixa de corte.
    viewer.volumeTool.startInsertion({
      clip: true,
      name: 'Caixa de Corte'
    });
  };

  // Função para limpar as medidas
  const clearMeasurements = () => {
    viewer.scene.removeAllMeasurements(); // Chama a função para limpar as medições

  };

  return (
    <div
      ref={menuRef}
      className={`sub-bar ${isHorizontal ? 'horizontal' : 'vertical'}`}
    >
      <SubBarButton
        icon="ph:dot-bold"
        width='1.6em'
        height='1.6em'
        onClick={measurePoint}
        isOpen={false}
        title='Ponto'
      />

      <SubBarButton
        icon="teenyicons:line-solid"
        width='1.4em'
        height='1.4em'
        onClick={measureDistance}
        isOpen={false}
        title='Distância'
      />

      <SubBarButton
        icon="carbon:area"
        width='1.8em'
        height='1.8em'
        onClick={measureArea}
        isOpen={false}
        title='Área'
      />

      <SubBarButton
        icon="fa-solid:ruler-combined"
        width='1.8em'
        height='1.8em'
        onClick={measureAngle}
        isOpen={false}
        title='Ângulo'
      />

      <SubBarButton
        icon="icon-park-outline:triangle-ruler"
        width='1.6em'
        height='1.6em'
        onClick={measureDeltas}
        isOpen={false}
        title='Deltas'
      />

      <SubBarButton
        icon="radix-icons:crop"
        width='1.6em'
        height='1.6em'
        onClick={startVolumeClip}
        isOpen={false}
        title='Caixa de Corte'
      />

      {/* Botão para limpar as medidas */}
      <SubBarButton
        icon="mingcute:close-fill"
        width='1.8em'
        height='1.8em'
        onClick={clearMeasurements}
        isOpen={false}
        title='Remover Medidas'
      />
    </div>
  );
};

export default SubBarMedidas;
