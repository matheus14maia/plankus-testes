/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import './MenuBar.css';
import { Icon } from '@iconify/react';
import MenuBarButton from './buttons/MenuBarButtons';
import SubBarNavigation from '../subBarMenu/navigation/SubBarNavigation';
import SubBarMedidas from '../subBarMenu/medidas/SubBarMedidas';
import SubBarVistas from '../subBarMenu/vistas/SubBarVistas';
import SubBarFerramentas from '../subBarMenu/ferramentas/SubBarFerramentas';

const MenuBar: React.FC<{ 
  viewer: any,
  projectId: number, 
}> = ({ viewer, projectId }) => {
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isFixed, setIsFixed] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null); // Armazena o índice do submenu aberto

  const toggleOrientation = () => {
    setIsHorizontal(!isHorizontal);
  };

  const toggleFixed = () => {
    setIsFixed(!isFixed);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFixed && menuRef.current) {
      setIsDragging(true);
      setPosition({
        x: e.clientX - (menuRef.current?.offsetLeft || 0),
        y: e.clientY - (menuRef.current?.offsetTop || 0),
      });
    }
  };


  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && menuRef.current) {
      const menuElement = menuRef.current;

      // Calcula os novos valores de X e Y
      let newX = e.clientX - position.x;
      let newY = e.clientY - position.y;

      // Obtém as dimensões da barra de menu e da janela
      const menuWidth = menuElement.offsetWidth;
      const menuHeight = menuElement.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Ajusta a posição para que a barra de menu não saia dos limites da tela
      if (isHorizontal) {
        // Barra horizontal
        newX = Math.max(220, Math.min(newX, windowWidth - menuWidth + 190));
        newY = Math.max(20, Math.min(newY, windowHeight - menuHeight - 30));
      } else {
        // Barra vertical
        newX = Math.max(50, Math.min(newX, windowWidth - menuWidth + 10)); // Ajuste para a borda direita
        newY = Math.max(20, Math.min(newY, windowHeight - menuHeight - 20));
      }

      // Atualiza a posição da barra de menu
      menuElement.style.left = `${newX}px`;
      menuElement.style.top = `${newY}px`;
    }
  };



  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSubMenu = (index: number) => {
    setOpenMenu((prev) => (prev === index ? null : index));
  };

  const getSubMenuClass = () => {
    if (!menuRef.current) return 'sub-horizontal';

    const rect = menuRef.current.getBoundingClientRect();
    if (isHorizontal) {
      if (rect.bottom + 100 > window.innerHeight) {
        return 'sub-up';
      }
      return 'sub-horizontal';
    } else {
      if (rect.right + 100 > window.innerWidth) {
        return 'sub-left';
      }
      return 'sub-vertical';
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={menuRef}
      className={`menu-bar ${isHorizontal ? 'horizontal' : 'vertical'} ${isFixed ? 'fixed' : ''}`}
      onMouseDown={handleMouseDown}
    >
      <MenuBarButton
        icon="bi:arrow-repeat"
        width='1.4em'
        height='1.4em'
        onClick={toggleOrientation}
        isOpen={false}
        getSubMenu=''
        title='Girar Barra'
      >
        {null}
      </MenuBarButton>

      <MenuBarButton
        icon={isFixed ? "mdi-light:pin-off" : "mdi-light:pin"}
        width='1.6em'
        height='1.6em'
        onClick={toggleFixed}
        isOpen={false}
        getSubMenu={getSubMenuClass()}
        title='Fixar'
      >
        {null}
      </MenuBarButton>

      {isHorizontal ? (
        <Icon icon="ph:line-vertical" width="2em" height="2em" style={{ color: 'white' }} />
      ) : (
        <Icon icon="fluent:line-horizontal-1-28-regular" width="4em" height="2em" style={{ color: 'white' }} />
      )}

      <MenuBarButton
        icon="gis:location-arrow-o"
        width='1.4em'
        height='1.4em'
        onClick={() => toggleSubMenu(0)}
        isOpen={openMenu === 0}
        getSubMenu={getSubMenuClass()}
        title='+Navegação'
      >
        {<SubBarNavigation viewer={viewer} // Passa o estado de navegação
        />}
      </MenuBarButton>

      <MenuBarButton
        icon="ic:baseline-home"
        width='1.6em'
        height='1.6em'
        onClick={() => toggleSubMenu(1)}
        isOpen={openMenu === 1}
        getSubMenu={getSubMenuClass()}
        title='Ponto de Vistas'
      >
        {<SubBarVistas viewer={viewer}/>}
      </MenuBarButton>

      <MenuBarButton
        icon="dashicons:admin-tools"
        width='1.6em'
        height='1.6em'
        onClick={() => toggleSubMenu(2)}
        isOpen={openMenu === 2}
        getSubMenu={getSubMenuClass()}
        title='+Ferramentas'
      >
        {<SubBarFerramentas viewer={viewer} projectId={projectId}/>}
      </MenuBarButton>

      <MenuBarButton
        icon="teenyicons:line-solid"
        width='1.6em'
        height='1.6em'
        onClick={() => toggleSubMenu(3)}
        isOpen={openMenu === 3}
        getSubMenu={getSubMenuClass()}
        title='+Medidas'
      >
        {<SubBarMedidas viewer={viewer}/>}
      </MenuBarButton>
    </div>
  );
};

export default MenuBar;
