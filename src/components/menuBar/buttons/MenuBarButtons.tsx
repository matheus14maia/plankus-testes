import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface MenuBarButtonProps {
  icon: string;
  width: string;
  height: string;
  onClick: () => void;
  isOpen: boolean;
  getSubMenu: string;
  children: React.ReactNode;
  title: string; // Para o texto da tooltip
}

const MenuBarButton: React.FC<MenuBarButtonProps> = ({ icon, width, height, onClick, isOpen, getSubMenu, children, title }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipHeight = 30; // Altura estimada da tooltip

      const style: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1e2027',
        color: '#fff',
        padding: '5px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        fontSize: '12px',
        zIndex: 1,
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
      };

      // Verifica se o botão está perto do topo
      if (buttonRect.top < tooltipHeight) {
        style.top = '40px'; // Tooltip abaixo do botão
      } else {
        style.top = `-${tooltipHeight}px`; // Tooltip acima do botão
      }

      setTooltipStyle(style);
    }
  }, [showTooltip]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          backgroundColor: isOpen ? '#cccbcd' : '#1e2027',
          position: 'relative', // Necessário para a posição da tooltip
        }}
      >
        <Icon icon={icon} width={width} height={height} style={{ color: 'white' }} />

        {/* Tooltip */}
        {showTooltip && (
          <div style={tooltipStyle}>
            {title}
          </div>
        )}
      </button>
      {isOpen && <div className={`sub-menu ${getSubMenu}`}>{children}</div>}
    </>
  );
};

export default MenuBarButton;
