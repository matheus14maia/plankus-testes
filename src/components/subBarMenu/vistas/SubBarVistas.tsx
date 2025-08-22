/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react'; 
import SubBarButton from '../button/SubBarButton';

// Definindo as props do componente para incluir o viewer
interface SubBarVistasProps {
  viewer: any; // Substitua 'any' pelo tipo correto, se possível (por exemplo, `Potree.Viewer`)
}

const SubBarVistas: React.FC<SubBarVistasProps> = ({ viewer }) => {
  // Estado para armazenar o botão atualmente selecionado
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [isHorizontal] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Função para lidar com a troca de navegação e seleção de botão
  const handleButtonClick = (buttonId: string, onClick: () => void) => {
    setSelectedButton(buttonId); // Define o botão atual como selecionado
    onClick(); // Chama a função passada para alterar a navegação no Potree
  };
  // Atribuindo os modos de navegação diretamente aos controles do Potree
  const setVistaInicial = () => {
    viewer.fitToScreen(); // Usando o modo de órbita
  };

  return (
    <div
      ref={menuRef}
      className={`sub-bar ${isHorizontal ? 'horizontal' : 'vertical'} `}
    >
      <SubBarButton
        icon="ic:baseline-home"
        width='1.6em'
        height='1.6em'
        onClick={() => handleButtonClick('vistaInicial', setVistaInicial)}
        isOpen={selectedButton === 'vistaInicial'}
        title='Vista inicial'
      />      
    </div>
  );
};

export default SubBarVistas;
