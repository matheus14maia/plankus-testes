/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import SubBarButton from '../button/SubBarButton';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

interface SubBarFerramentasProps {
  viewer: any; // Substitua 'any' pelo tipo correto, se possível (por exemplo, `Potree.Viewer`)
  projectId: number; // Substitua 'number' pelo tipo correto, se possível (por exemplo, `123`)
}

const SubBarFerramentas: React.FC<SubBarFerramentasProps> = ({ viewer, projectId }) => {
  const [isHorizontal] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const { getAccessTokenSilently } = useAuth0();

  // Função para lidar com a inserção de anotações
  const insertAnnotation = async () => {
    // Cria uma nova anotação e aguarda o usuário clicar para posicioná-la
    const newAnnotation = viewer.annotationTool.startInsertion();

    if (newAnnotation) {
      const title = prompt('Digite o título da anotação:', '');
      const description = prompt('Digite a descrição da anotação:', '');

      if (title !== null && description !== null) {
        newAnnotation.title = title;
        newAnnotation.description = description;

        // 🔹 Espera o usuário posicionar a anotação antes de salvar
        const checkPosition = setInterval(() => {
          if (newAnnotation.position) {
            viewer.render();
            clearInterval(checkPosition); // Para de verificar
            console.log("📍 Anotação posicionada:", newAnnotation.position);
            saveAnnotationToDB(newAnnotation);
          }
        }, 10000); // Verifica a cada 10s
      }
    }
  };

  const saveAnnotationToDB = async (annotation: any) => {
    try {
      const token = await getAccessTokenSilently();
  
      // 🔹 Enviar a anotação ao backend
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/annotations`, {
        project_id: projectId,
        name: annotation.title,
        description: annotation.description,
        category: '',
        position_x: Number(annotation.position.x.toFixed(3)),
        position_y: Number(annotation.position.y.toFixed(3)),
        position_z: Number(annotation.position.z.toFixed(3)),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ Nova anotação salva no banco:", response.data);
    } catch (error) {
      console.error("❌ Erro ao salvar anotação:", error);
    }
  };

  return (
    <div
      ref={menuRef}
      className={`sub-bar ${isHorizontal ? 'horizontal' : 'vertical'}`}
    >
      <SubBarButton
        icon="ph:map-pin-fill"
        width="1.8em"
        height="1.8em"
        onClick={insertAnnotation}
        isOpen={false}
        title="Anotações"
      />
    </div>
  );
};

export default SubBarFerramentas;
