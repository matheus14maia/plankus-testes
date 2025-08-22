/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react'; 
import SubBarButton from '../button/SubBarButton';

// Definindo as props do componente para incluir o viewer
interface SubBarNavigationProps {
  viewer: any; // Substitua 'any' pelo tipo correto, se possível (por exemplo, `Potree.Viewer`)
}

const SubBarNavigation: React.FC<SubBarNavigationProps> = ({ viewer }) => {
  // Estado para armazenar o botão atualmente selecionado
  const [selectedButton, setSelectedButton] = useState<string | null>('null');
  const [isHorizontal] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Função para lidar com a troca de navegação e seleção de botão
  const handleButtonClick = (buttonId: string, onClick: () => void) => {
    setSelectedButton(buttonId); // Define o botão atual como selecionado
    onClick(); // Chama a função passada para alterar a navegação no Potree
  };
  // Atribuindo os modos de navegação diretamente aos controles do Potree
  const setFlightNavigation = () => {
    viewer.setControls(viewer.fpControls); // Navegação em primeira pessoa
    viewer.fpControls.lockElevation = false; //
  };

  const setEarthNavigation = () => {
    viewer.setControls(viewer.earthControls); // Modo Earth
  };

  const setHelicopterNavigation = () => {
    viewer.setControls(viewer.fpControls); // Use o mesmo para helicóptero ou um personalizado
    viewer.fpControls.lockElevation = true;
  };

  return (
    <div
      ref={menuRef}
      className={`sub-bar ${isHorizontal ? 'horizontal' : 'vertical'} `}
    >
      <SubBarButton
        icon="fa:send"
        width='1.4em'
        height='1.4em'
        onClick={() => handleButtonClick('flight', setFlightNavigation)}
        isOpen={selectedButton === 'flight'}
        title='Voo'
      />

      <SubBarButton
        icon="fluent:globe-20-filled"
        width='1.6em'
        height='1.6em'
        onClick={() => handleButtonClick('orbit',setEarthNavigation)}
        isOpen={selectedButton === 'orbit'}
        title='Órbita'
      />

      <SubBarButton
        icon="fa-solid:helicopter"
        width='1.6em'
        height='1.6em'
        onClick={() => handleButtonClick('helicopter', setHelicopterNavigation)}
        isOpen={selectedButton ===  'helicopter'}

        title='Helicóptero'
      />
    </div>
  );
};

export default SubBarNavigation;
