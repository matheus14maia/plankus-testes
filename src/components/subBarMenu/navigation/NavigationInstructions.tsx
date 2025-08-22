/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface NavigationInstructionsProps {
    viewer: any;
}

const NavigationInstructions: React.FC<NavigationInstructionsProps> = ({ viewer }) => {
    const [moveSpeed, setMoveSpeed] = useState<number>(10.0); // Velocidade inicial 10.0
    const [showInstructions, setShowInstructions] = useState<boolean>(false); // Controlar visibilidade das instruções

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
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>

            {/* Ícone para expandir as instruções */}
            <div
                style={{
                    padding: '0.5rem',
                    backgroundColor: '#1e2027',
                    border: '1px solid #fff',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',  // Centraliza horizontalmente
                    alignItems: 'center',  // Centraliza verticalmente
                    width: '40px'
                }}
                onClick={() => setShowInstructions(!showInstructions)}
            >
                <Icon
                    icon="mdi:information-outline"
                    style={{ width: '1.6em', height: '1.6em', color: 'white' }}
                />
            </div>

            {/* Mostrar as instruções somente quando o estado showInstructions for true */}
            {showInstructions && (
                <div
                    style={{
                        backgroundColor: '#1e2027',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #fff',
                        marginTop: '0.5rem',
                        maxWidth: '300px',
                        cursor: 'default'
                    }}
                >
                    <h3>Instruções de Navegação</h3>
                    <p>
                        <strong>Movimentação:</strong> Use <strong>WASD</strong> ou as setas para se mover.<br />
                        Segure o <strong>botão esquerdo</strong> do mouse e o movimente para olhar ao redor.<br />
                        Segure o <strong>botão direito</strong> do mouse e o movimente para ajustar a altura da câmera. <br />
                        <br />
                        Para abrir o menu de opções da varredura clique com o botão direito do mouse.
                    </p>
                </div>
            )}

            {/* Controle de velocidade fora do menu de instruções */}
            <div
                style={{
                    marginTop: '1rem',
                    backgroundColor: '#1e2027',
                    border: '1px solid #fff',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    width: '150px', // Linha menor
                    color: 'white'
                }}
            >
                <label htmlFor="speedControl">Velocidade:</label>
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
