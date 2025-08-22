// src/components/LoadPointCloud.tsx

/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare const Potree: any;

interface PointCloudSettings {
    size: number;
    pointSizeType: any; // Potree.PointSizeType
    shape: any; // Potree.PointShape
}

// Função para carregar a nuvem de pontos
export const loadPointCloud = async (
    viewerInstance: any,
    pointCloudUrl: string,
    projectName: string,
    initialSettings: PointCloudSettings, // Adicionamos as configurações aqui
    onLoad?: () => void // <-- Adicione este argumento
) => {
    try {
        await Potree.loadPointCloud(pointCloudUrl, projectName, (e: any) => {
            const pointCloud = e.pointcloud;
            const material = pointCloud.material;

            material.activeAttributeName = "rgba";
            // Usar as configurações iniciais passadas como parâmetro
            material.size = initialSettings.size;
            material.pointSizeType = initialSettings.pointSizeType;
            material.shape = initialSettings.shape;

            material.maxNodeSize = 10;

            viewerInstance.scene.addPointCloud(pointCloud);

            viewerInstance.fitToScreen();
            viewerInstance.render(); // Certificar-se de que a cena seja renderizada após a adição

            if (onLoad) {
                onLoad(); // <-- Execute o callback após a nuvem de pontos ser carregada
            }
        });
    } catch (error) {
        console.error('Erro ao carregar a nuvem de pontos', error);
    }
};