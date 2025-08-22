/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

interface JoystickProps {
  viewer: any;
}

const Joystick: React.FC<JoystickProps> = ({ viewer }) => {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [thumbPos, setThumbPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const maxRadius = 30;   // Deslocamento máximo do thumb (em pixels)
  const threshold = 10;   // Limiar mínimo para considerar movimento

  // Atualiza o movimento diretamente no viewer.fpControls.translationDelta
  const updateMovement = (clientX: number, clientY: number) => {
    if (!startPos) return;
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    // Se o movimento for muito pequeno, zera o thumb e o movimento
    if (distance < threshold) {
      setThumbPos({ x: 0, y: 0 });
      if (viewer && viewer.fpControls) {
        viewer.fpControls.translationDelta.set(0, 0, 0);
      }
      return;
    }

    // Limita o deslocamento ao máximo permitido
    let clampedX = deltaX;
    let clampedY = deltaY;
    if (distance > maxRadius) {
      const ratio = maxRadius / distance;
      clampedX = deltaX * ratio;
      clampedY = deltaY * ratio;
    }
    setThumbPos({ x: clampedX, y: clampedY });

    // Define a direção predominante:
    // Se o movimento horizontal for maior, considera LEFT ou RIGHT.
    // Caso contrário, se deltaY negativo é FORWARD e se positivo é BACK.
    let moveX = 0;
    let moveY = 0;
    const moveSpeed = viewer.getMoveSpeed ? viewer.getMoveSpeed() : 1;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      moveX = deltaX > 0 ? moveSpeed : -moveSpeed;
    } else {
      moveY = deltaY < 0 ? moveSpeed : -moveSpeed;
    }
    // Atualiza diretamente o translationDelta do viewer.
    if (viewer && viewer.fpControls) {
      viewer.fpControls.translationDelta.x = moveX;
      viewer.fpControls.translationDelta.y = moveY;
    }
  };

  const resetMovement = () => {
    setThumbPos({ x: 0, y: 0 });
    if (viewer && viewer.fpControls) {
      viewer.fpControls.translationDelta.set(0, 0, 0);
    }
  };

  // Handlers para mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setActive(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    updateMovement(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setActive(false);
    setStartPos(null);
    resetMovement();
  };

  // Handlers para toque (touch)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setActive(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!active) return;
    const touch = e.touches[0];
    updateMovement(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setActive(false);
    setStartPos(null);
    resetMovement();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        width: '100px',
        height: '100px',
        backgroundColor: 'rgba(220,220,220,0.6)', // cor clara e meio transparente
        borderRadius: '50%',
        zIndex: 100,
        touchAction: 'none', // evita que o toque interfira no scroll
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Thumb (indicador) do joystick */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          transform: `translate(${thumbPos.x - 20}px, ${thumbPos.y - 20}px)`,
        }}
      />
    </div>
  );
};

export default Joystick;
