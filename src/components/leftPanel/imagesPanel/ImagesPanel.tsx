// ImagesPanel.tsx
import React from 'react';

interface Image {
  name: string;
  x: number;
  y: number;
  z: number;
}

interface ImagesPanelProps {
  filteredImages: Image[];
  searchQuery: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  flyToImage: (position: { x: number; y: number; z: number }) => void;
}

const ImagesPanel: React.FC<ImagesPanelProps> = ({
  filteredImages,
  searchQuery,
  handleSearch,
  flyToImage
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
            onClick={() => flyToImage({ x: image.x, y: image.y, z: image.z + 0.5 })}
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
