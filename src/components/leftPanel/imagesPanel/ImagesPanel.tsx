/* eslint-disable @typescript-eslint/no-explicit-any */
// ImagesPanel.tsx (MODIFICADO)
import React from 'react';

interface Image {
  name: string;
  x: number;
  y: number;
  z: number;
}

// ✅ INTERFACE DA PROP CORRIGIDA
interface ImagesPanelProps {
  filteredImages: Image[];
  searchQuery: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // A função agora espera receber um único objeto 'Image'
  flyToImage: (image: Image, images360: any) => void;
  images360: any;
}

const ImagesPanel: React.FC<ImagesPanelProps> = ({
  filteredImages,
  searchQuery,
  handleSearch,
  flyToImage,
  images360
}) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar imagem"
        value={searchQuery}
        onChange={handleSearch}
        style={{ marginBottom: '1rem', width: '100%', color: 'white', backgroundColor: '#1e2027', border: '1px solid #fff', borderRadius: '0.2rem' }}
      />
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredImages.map((image, index) => (
          <li
            key={index}
            // ✅ CHAMADA ONCLICK CORRIGIDA
            // Passa o objeto 'image' específico da lista para a função
            onClick={() => flyToImage(image, images360)}
            style={{
              cursor: 'pointer',
              color: 'white',
              marginBottom: '0.5rem',
              textDecoration: 'underline'
            }}
          >
            {image.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImagesPanel;