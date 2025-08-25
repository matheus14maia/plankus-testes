/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

interface NavigationInstructionsProps {
    viewer: any;
}

const NavigationInstructions: React.FC<NavigationInstructionsProps> = ({ viewer }) => {
    const [moveSpeed, setMoveSpeed] = useState<number>(10.0); // Velocidade inicial 10.0

    // useEffect para se inscrever em mudanças de velocidade
    useEffect(() => {
        if (viewer) {
            // Função que atualiza o estado do slider conforme o valor atual do viewer
            
            const onSpeedChange = () => {
                if (viewer.fpControls.viewer.getMoveSpeed() <= 10.0) {    
                    const speed = viewer.fpControls.viewer.getMoveSpeed();
                    setMoveSpeed(speed);
                }
            };

            // Atualiza o slider imediatamente com o valor atual
            onSpeedChange();
            
            // Inscreva-se no evento de mudança de velocidade.
            // Atenção: verifique se o nome do evento é realmente "move_speed_changed".
            viewer.addEventListener('move_speed_changed', onSpeedChange);

            // Remova o listener quando o componente for desmontado
            return () => {
                viewer.removeEventListener('move_speed_changed', onSpeedChange);
            };
        }
    }, [viewer]);

    const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSpeed = parseFloat(event.target.value);
        setMoveSpeed(newSpeed);
        viewer.fpControls.viewer.setMoveSpeed(newSpeed); // Atualiza a velocidade no visualizador
    };


    return (
        <div style={{ display: 'absolute', width: '100%'}}>

            {/* Controle de velocidade fora do menu de instruções */}
            <div
                style={{
                    marginTop: '0.5rem',
                    backgroundColor: '#1e2027',
                    color: 'white'
                }}
            >
                <strong>Controle de Velocidade: </strong>
                <input
                    id="speedControl"
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={moveSpeed}
                    onChange={handleSpeedChange}
                    style={{ width: '100%' }}
                />
                <span>{moveSpeed.toFixed(1)} m/s</span>
            </div>
        </div>
    );
};

export default NavigationInstructions;
