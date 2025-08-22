/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/leftPanel/SceneObjectsPanel.tsx

import React, { useState, useEffect } from 'react';
import { FaFolder, FaCloud, FaRuler, FaTag, FaCamera } from 'react-icons/fa'; // Usando react-icons para ícones

// Definindo uma interface para os objetos que vamos listar
interface SceneObject {
    uuid: string;
    name: string;
    visible: boolean;
    type: 'pointcloud' | 'measurement' | 'annotation' | 'other';
    raw: any; // A referência ao objeto original do Potree
}

// Props que o componente espera receber
interface SceneObjectsPanelProps {
    viewer: any; // O objeto viewer principal do Potree
}

// Estilos para manter o código JSX mais limpo
const styles: { [key: string]: React.CSSProperties } = {
    treeRoot: { listStyle: 'none', paddingLeft: '0', color: 'white' },
    treeNode: { paddingLeft: '1rem', marginBottom: '0.25rem' },
    treeHeader: { display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.2rem 0' },
    toggleIcon: { marginRight: '0.5rem', width: '10px' },
    icon: { marginRight: '0.5rem' },
    checkbox: { marginRight: '0.5rem', cursor: 'pointer' },
    label: { flexGrow: 1 }
};

const SceneObjectsPanel: React.FC<SceneObjectsPanelProps> = ({ viewer }) => {
    // Estados para cada categoria de objeto na cena
    const [pointClouds, setPointClouds] = useState<SceneObject[]>([]);
    const [measurements, setMeasurements] = useState<SceneObject[]>([]);
    const [annotations, setAnnotations] = useState<SceneObject[]>([]);

    // Estados para controlar se cada categoria está expandida
    const [isPcExpanded, setPcExpanded] = useState(true);
    const [isMeasExpanded, setMeasExpanded] = useState(true);
    const [isAnnoExpanded, setAnnoExpanded] = useState(true);
    const [isOtherExpanded, setOtherExpanded] = useState(true);


    // O useEffect é o coração da lógica. Ele configura os event listeners.
    useEffect(() => {
        if (!viewer) return;

        const scene = viewer.scene;

        // --- FUNÇÕES DE ATUALIZAÇÃO DE ESTADO ---
        const add = (setter: React.Dispatch<React.SetStateAction<SceneObject[]>>, item: any, type: SceneObject['type']) => {
            setter(prev => [...prev, { uuid: item.uuid, name: item.name || item.title, visible: item.visible, type, raw: item }]);
        };
        const remove = (setter: React.Dispatch<React.SetStateAction<SceneObject[]>>, item: any) => {
            setter(prev => prev.filter(o => o.uuid !== item.uuid));
        };

        // --- HANDLERS DE EVENTOS DO POTREE ---
        const onPointCloudAdded = (e: any) => add(setPointClouds, e.pointcloud, 'pointcloud');
        const onMeasurementAdded = (e: any) => add(setMeasurements, e.measurement, 'measurement');
        const onVolumeAdded = (e: any) => add(setMeasurements, e.volume, 'measurement');
        const onProfileAdded = (e: any) => add(setMeasurements, e.profile, 'measurement');
        const onAnnotationAdded = (e: any) => add(setAnnotations, e.annotation, 'annotation');

        const onMeasurementRemoved = (e: any) => remove(setMeasurements, e.measurement);
        const onVolumeRemoved = (e: any) => remove(setMeasurements, e.volume);
        const onProfileRemoved = (e: any) => remove(setMeasurements, e.profile);

        // Carregar objetos iniciais que já existem na cena
        setPointClouds(scene.pointclouds.map((pc: any) => ({ uuid: pc.uuid, name: pc.name, visible: pc.visible, type: 'pointcloud', raw: pc })));
        setMeasurements([...scene.measurements, ...scene.volumes, ...scene.profiles].map((m: any) => ({ uuid: m.uuid, name: m.name, visible: m.visible, type: 'measurement', raw: m })));
        setAnnotations(scene.annotations.children.map((a: any) => ({ uuid: a.uuid, name: a.title, visible: a.visible, type: 'annotation', raw: a })));

        // Adicionar os listeners
        scene.addEventListener('pointcloud_added', onPointCloudAdded);
        scene.addEventListener('measurement_added', onMeasurementAdded);
        scene.addEventListener('volume_added', onVolumeAdded);
        scene.addEventListener('profile_added', onProfileAdded);
        scene.annotations.addEventListener('annotation_added', onAnnotationAdded);

        scene.addEventListener('measurement_removed', onMeasurementRemoved);
        scene.addEventListener('volume_removed', onVolumeRemoved);
        scene.addEventListener('profile_removed', onProfileRemoved);
        // Adicionar outros listeners de remoção se necessário...

        // Função de limpeza: remove os listeners quando o componente é desmontado
        return () => {
            scene.removeEventListener('pointcloud_added', onPointCloudAdded);
            scene.removeEventListener('measurement_added', onMeasurementAdded);
            scene.removeEventListener('volume_added', onVolumeAdded);
            scene.removeEventListener('profile_added', onProfileAdded);
            scene.annotations.removeEventListener('annotation_added', onAnnotationAdded);

            scene.removeEventListener('measurement_removed', onMeasurementRemoved);
            scene.removeEventListener('volume_removed', onVolumeRemoved);
            scene.removeEventListener('profile_removed', onProfileRemoved);
        };
    }, [viewer]);

    // Função para alternar a visibilidade de um objeto
    const handleToggleVisibility = (object: SceneObject, isVisible: boolean) => {
        object.raw.visible = isVisible;
        // Forçar a re-renderização atualizando o estado
        const updater = (prev: SceneObject[]) => prev.map(o => o.uuid === object.uuid ? { ...o, visible: isVisible } : o);
        if (object.type === 'pointcloud') setPointClouds(updater);
        if (object.type === 'measurement') setMeasurements(updater);
        if (object.type === 'annotation') setAnnotations(updater);
    };

    // Função para dar zoom no objeto (adaptado do sidebar.js)
    const handleZoomToObject = (object: SceneObject) => {
        viewer.fitToScreen(object.raw, 1);
    };

    const renderTreeItem = (item: SceneObject) => (
        <li key={item.uuid} style={styles.treeNode}>
            <div style={styles.treeHeader}>
                <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={item.visible}
                    onChange={(e) => handleToggleVisibility(item, e.target.checked)}
                />
                {item.type === 'pointcloud' && <FaCloud style={styles.icon} color="#cccccc" />}
                {item.type === 'measurement' && <FaRuler style={styles.icon} color="#cccccc" />}
                {item.type === 'annotation' && <FaTag style={styles.icon} color="#cccccc" />}
                <span style={styles.label} onDoubleClick={() => handleZoomToObject(item)}>{item.name}</span>
            </div>
        </li>
    );

    return (
        <ul style={styles.treeRoot}>
            {/* Point Clouds */}
            <li>
                <div style={styles.treeHeader} onClick={() => setPcExpanded(!isPcExpanded)}>
                    <span style={styles.toggleIcon}>{isPcExpanded ? '▼' : '▶'}</span>
                    <FaFolder style={styles.icon} color="#ffe082" />
                    <span style={styles.label}>Point Clouds</span>
                </div>
                {isPcExpanded && <ul style={styles.treeRoot}>{pointClouds.map(renderTreeItem)}</ul>}
            </li>

            {/* Measurements */}
            <li>
                <div style={styles.treeHeader} onClick={() => setMeasExpanded(!isMeasExpanded)}>
                    <span style={styles.toggleIcon}>{isMeasExpanded ? '▼' : '▶'}</span>
                    <FaFolder style={styles.icon} color="#ffe082" />
                    <span style={styles.label}>Measurements</span>
                </div>
                {isMeasExpanded && <ul style={styles.treeRoot}>{measurements.map(renderTreeItem)}</ul>}
            </li>

            {/* Annotations */}
            <li>
                <div style={styles.treeHeader} onClick={() => setAnnoExpanded(!isAnnoExpanded)}>
                    <span style={styles.toggleIcon}>{isAnnoExpanded ? '▼' : '▶'}</span>
                    <FaFolder style={styles.icon} color="#ffe082" />
                    <span style={styles.label}>Annotations</span>
                </div>
                {isAnnoExpanded && <ul style={styles.treeRoot}>{annotations.map(renderTreeItem)}</ul>}
            </li>

            {/* Other (ex: Câmera) */}
            <li>
                <div style={styles.treeHeader} onClick={() => setOtherExpanded(!isOtherExpanded)}>
                    <span style={styles.toggleIcon}>{isOtherExpanded ? '▼' : '▶'}</span>
                    <FaFolder style={styles.icon} color="#ffe082" />
                    <span style={styles.label}>Other</span>
                </div>
                {isOtherExpanded && (
                    <ul style={styles.treeRoot}>
                        <li style={styles.treeNode}>
                            <div style={styles.treeHeader}>
                                <input type="checkbox" style={{ ...styles.checkbox, visibility: 'hidden' }} /> {/* Placeholder checkbox */}
                                <FaCamera style={styles.icon} color="#cccccc" />
                                <span style={styles.label}>Camera</span>
                            </div>
                        </li>
                    </ul>
                )}
            </li>
        </ul>
    );
};

export default SceneObjectsPanel;