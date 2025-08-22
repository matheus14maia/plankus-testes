import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import './SubBarButton.css';

interface SubBarButtonProps {
  icon: string;
  width: string;
  height: string;
  onClick: () => void;
  isOpen: boolean;
  title: string;
}

const SubBarButton: React.FC<SubBarButtonProps> = ({ icon, width, height, onClick, isOpen, title }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`sub-bar-button ${isOpen ? 'selected' : ''}`} // Aplicando a classe "selected" se isOpen for true
      >
        <Icon icon={icon} width={width} height={height} style={{ color: 'white' }} />

        {/* Tooltip */}
        {showTooltip && (
          <div className="tooltip">
            {title}
          </div>
        )}
      </button>
    </>
  );
};

export default SubBarButton;
