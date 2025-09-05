/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import MenuBar from './menuBar/MenuBar';
import { loadPointCloud } from './LoadPointCloud';
import * as THREE from 'three'; // Não mais necessário
import LeftPanel from './leftPanel/LeftPanel';
import { Project } from '../utils/types';
import Joystick from './Joystick';
import { isMobile } from 'react-device-detect';

// Adiciona a declaração do proj4 se for usá-lo para transformações de coordenadas, como no exemplo.
// Se seu coordinates.txt já está no mesmo sistema de coordenadas que a nuvem de pontos, isso não é estritamente necessário.
declare const Potree: any;

interface BarraDeFerramentasProps {
  project: Project;
}

const BarraDeFerramentas: React.FC<BarraDeFerramentasProps> = ({ project }) => {
  const potreeContainerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewerState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [spheresVisible, setSpheresVisible] = useState(true);
  const [pointCloudVisible, setPointCloudVisible] = useState(true);
  const [pointBudget, setPointBudget] = useState(1_000_000);
  const [pointSize, setPointSize] = useState(2.0);
  const [pointSizeType, setPointSizeType] = useState(Potree.PointSizeType.FIXED);
  const [pointShape, setPointShape] = useState(Potree.PointShape.CIRCLE);
  const [useEDL, setUseEDL] = useState(false);

  const [course, setCourse] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);

  // Referência para o objeto de imagens 360 do Potree. 
  // O objeto principal retornado pelo loader é o que controlaremos.
  const images360Ref = useRef<any>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!project || viewer) { // Evita reinicialização
      return;
    }

    const initViewer = async () => {
      if (potreeContainerRef.current) {
        const viewerInstance = new Potree.Viewer(potreeContainerRef.current);
        viewerRef.current = viewerInstance; // Atribua à ref
        setViewerState(viewerInstance); // Define o viewer no estado o mais cedo possível

        viewerInstance.setEDLEnabled(useEDL);
        viewerInstance.setFOV(60);
        viewerInstance.setPointBudget(pointBudget);
        viewerInstance.loadSettingsFromURL();
        viewerInstance.setControls(viewerInstance.fpControls);
        viewerInstance.fpControls.lockElevation = false;

        const initialSettings = {
          size: pointSize,
          pointSizeType: pointSizeType,
          shape: pointShape
        };

        // Carrega a nuvem de pontos. O carregamento das imagens 360 acontecerá no callback de sucesso.
        loadPointCloud(viewerInstance, project.url, project.name, initialSettings, async () => {
          // ============================================================================================
          // INÍCIO: LÓGICA DE CARREGAMENTO COM IMAGES360LOADER INTEGRADA
          // ============================================================================================
          if (project.images_url) {
            setIsLoading(true);
            try {
              const images = await Potree.Images360Loader.load(project.images_url, viewerInstance);
              
              // Anexa a função de transformação para uso posterior (se o loader não fizer isso)
              if (images && !images.transform) {
                images.transform = { forward: (a: any) => a }; // Fallback
              }

              viewerInstance.scene.add360Images(images);
              images360Ref.current = images;

              // Listener para quando uma imagem é focada
              images.addEventListener('focus', (e: any) => {
                const focusedImage = e.image360;
                if (focusedImage) {
                  console.log(focusedImage);
                  // Atualiza os sliders com os valores da imagem focada
                    setCourse(focusedImage.course);
                    setRoll(focusedImage.pitch);
                    setPitch(focusedImage.roll);
                }
              });

              console.log("✅ Imagens 360 carregadas com sucesso.");
            } catch (error) {
              console.error("❌ Erro ao carregar imagens 360:", error);
            } finally {
              setIsLoading(false);
            }
          }
          // ============================================================================================
          // FIM: LÓGICA DE CARREGAMENTO
          // ============================================================================================
        });
      }
    };

    initViewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]); // Dependência apenas em 'project' para iniciar

  useEffect(() => {
    const images360 = images360Ref.current;
    const viewer = viewerRef.current; // Use uma ref para o viewer também para garantir que está atualizado
    const view = viewer?.scene?.view;
    if (!images360 || !images360.focusedImage || !view) {
      return;
    }
    
    const { focusedImage, sphere } = images360;

    // --- 1. ATUALIZA OS DADOS NO OBJETO JAVASCRIPT ---
    // (Esta parte é opcional, mas boa prática para manter a consistência)
    focusedImage.course = course;
    focusedImage.pitch = roll;
    focusedImage.roll = pitch;
    // --- 2. APLICA AS TRANSFORMAÇÕES AOS OBJETOS THREE.JS ---

    // Aplica a rotação à esfera e ao marcador
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(+roll + 90),
      THREE.MathUtils.degToRad(-pitch),
      THREE.MathUtils.degToRad(-course + 90),
      "ZYX"
    );
    sphere.rotation.copy(euler);
    if (focusedImage.mesh) {
      focusedImage.mesh.rotation.copy(euler);
    }

    // --- 4. FORÇA A ATUALIZAÇÃO DA CENA (A CORREÇÃO) ---
    // Forçamos o Potree a redesenhar a cena chamando setView
    // com a posição e o alvo atuais da câmera e com duração 0.
    // Isso força um "repaint" sem nenhuma animação de câmera.
    const cameraPosition = view.position.clone();
    const cameraTarget = view.getPivot();
    view.setView(cameraPosition, cameraTarget, 0);
  }, [course, pitch, roll, viewer]);

  // useEffects para atualizar as propriedades (sem alterações)
  useEffect(() => {
    if (viewer && viewer.scene?.pointclouds) {
      viewer.scene.pointclouds.forEach((pc: any) => {
        pc.material.size = pointSize;
        pc.material.pointSizeType = pointSizeType;
        pc.material.shape = pointShape;
      });
    }
  }, [pointSize, pointSizeType, pointShape, viewer]);

  useEffect(() => {
    if (viewer) viewer.setPointBudget(pointBudget);
  }, [pointBudget, viewer]);

  useEffect(() => {
    if (viewer) viewer.setEDLEnabled(useEDL);
  }, [useEDL, viewer]);

  // Função para alternar a visibilidade dos discos
  const toggleSpheres = () => {
    if (images360Ref.current) {
      const newVisible = !images360Ref.current.visible;
      // CORREÇÃO: A visibilidade é controlada no objeto principal 'images', não em 'images.node'
      images360Ref.current.visible = newVisible;
      setSpheresVisible(newVisible);
    }
  };

  const togglePointCloud = () => {
    if (viewerRef.current && viewerRef.current.scene.pointclouds.length > 0) {
      const newVisibility = !pointCloudVisible;
      viewerRef.current.scene.pointclouds.forEach((pc: any) => {
        pc.visible = newVisibility;
      });
      setPointCloudVisible(newVisibility);
    }
  };

  // O JSX restante é simplificado, pois não precisa mais da lógica de menu customizado
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', display: 'flex', top: 0, left: 0 }}>
      <div ref={potreeContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}></div>
      {isLoading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white', padding: '1rem', borderRadius: '5px', zIndex: 10,
        }}>
          Carregando varreduras...
        </div>
      )}

      <LeftPanel
        viewer={viewer}
        projectId={project.id}
        coordinates={project.images_url+"/coordinates.txt"}
        pointBudget={pointBudget}
        setPointBudget={setPointBudget}
        pointSize={pointSize}
        setPointSize={setPointSize}
        pointSizeType={pointSizeType}
        setPointSizeType={setPointSizeType}
        pointShape={pointShape}
        setPointShape={setPointShape}
        useEDL={useEDL}
        setUseEDL={setUseEDL}

        course={course}
        setCourse={setCourse}
        pitch={pitch}
        setPitch={setPitch}
        roll={roll}
        setRoll={setRoll}
        images360={images360Ref.current}

        toggleSpheres={toggleSpheres}
        spheresVisible={spheresVisible}
        togglePointCloud={togglePointCloud}
        pointCloudVisible={pointCloudVisible}
      />

      <MenuBar viewer={viewer} projectId={project.id} />

      <div style={{ position: 'absolute', top: '90%', right: 20, zIndex: 2 }}>
        <img
          src="/assets/logo-escrita-branco.png"
          alt="Logo"
          style={{ width: '200px', height: 'auto' }}
        />
      </div>

      {isMobile && viewer && <Joystick viewer={viewer} />}
    </div>
  );
};

export default BarraDeFerramentas;