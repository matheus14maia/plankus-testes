import React, { useState, useRef } from 'react';
import SubBarButton from '../button/SubBarButton';

const SubBarEstilos: React.FC = () => {
  const [isHorizontal] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={menuRef}
      className={`sub-bar ${isHorizontal ? 'horizontal' : 'vertical'} `}
    >
      <SubBarButton
        icon="streamline:paint-palette-solid"
        width='1.6em'
        height='1.6em'
        onClick={() => (null)}
        isOpen={false}
        title='Cor'
      />

      <SubBarButton
        icon="game-icons:chemical-drop"
        width='1.6em'
        height='1.6em'
        onClick={() => (null)}
        isOpen={false}
        title='Intensidade'
      />

      <SubBarButton
        icon="material-symbols:altitude"
        width='1.6em'
        height='1.6em'
        onClick={() => (null)}
        isOpen={false}
        title='Elevação'
      />

      <SubBarButton
        icon="fa-solid:ruler-combined"
        width='1.8em'
        height='1.8em'
        onClick={() => (null)}
        isOpen={false}
        title='Adaptável'
      />

      <SubBarButton
        icon="mdi:eye-off"
        width='1.8em'
        height='1.8em'
        onClick={() => (null)}
        isOpen={false}
        title='Raio-X'
      />
    </div>
  );
};

export default SubBarEstilos;
