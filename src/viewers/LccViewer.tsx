/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { Project } from '../utils/types';
import Joystick from '../components/Joystick';
// A importação continua a mesma
import { LoadLcc } from '../components/LoadLcc';

interface LccViewerProps {
  project: Project;
}

const LccViewer: React.FC<LccViewerProps> = ({ project }) => {
  const lccContainerRef = useRef<HTMLDivElement>(null);
  // O 'viewer' será o nosso 'lccObj'
  const [viewer, setViewerState] = useState<any>(null);
  // Usamos uma ref para guardar a função de cleanup sem causar re-renderizações
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Define uma função async dentro do useEffect para poder usar 'await'
    const initViewer = async () => {
      // Garante que o container do DOM já existe
      if (lccContainerRef.current) {
        console.log("🟢 Carregando dados do projeto:", project);

        // Remove qualquer visualizador anterior antes de criar um novo
        if (cleanupRef.current) {
          cleanupRef.current();
        }

        // CHAMA A FUNÇÃO MODIFICADA PASSANDO O CONTAINER
        const { lccObj, cleanup } = await LoadLcc(lccContainerRef.current);
        
        // Guarda o objeto do viewer no estado para ser usado por outros componentes (como o Joystick)
        setViewerState(lccObj);
        
        // Guarda a função de cleanup na ref para ser chamada na desmontagem
        cleanupRef.current = cleanup;
      }
    };

    initViewer();

    // Esta é a função de retorno do useEffect. Ela será executada quando o componente
    // for "desmontado" ou quando a dependência 'project' mudar.
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null; // Limpa a ref
        setViewerState(null); // Limpa o estado
      }
    };
  }, [project]); // O efeito será re-executado se o projeto mudar

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', display: 'flex', top: 0, left: 0 }}>
      {/* Este div é o container que será passado para a função LoadLcc */}
      <div ref={lccContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}></div>

      <div style={{ position: 'absolute', top: '90%', right: 20, zIndex: 2 }}>
        <img
          src="/assets/logo-escrita-branco.png"
          alt="Logo"
          style={{ width: '200px', height: 'auto' }}
        />
      </div>

      {/* O Joystick será renderizado assim que o 'viewer' (lccObj) estiver no estado */}
      {viewer && <Joystick viewer={viewer} />}  
    </div>
  );
};

export default LccViewer;