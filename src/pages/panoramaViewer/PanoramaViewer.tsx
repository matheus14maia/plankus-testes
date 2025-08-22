import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

const PanoramaViewer: React.FC = () => {
  const { imageName } = useParams(); // Pega o nome da imagem da URL
  const location = useLocation();
  const [imagePath, setImagePath] = useState<string>('');

  useEffect(() => {
    if (imageName) {
      setImagePath(`https://storage.googleapis.com/prodasen-images/${imageName}.JPG`); // Define o caminho da imagem com base no nome
    }
  }, [imageName]);

  const handleClose = () => {
    const diskPosition = location.state?.diskPosition;
    window.opener.postMessage({ diskPosition }, '*');
    window.close();
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
      {imagePath && (
        <ReactPhotoSphereViewer
          src={imagePath}
          height={'100vh'}
          width={'100%'}
        />
      )}
      <button onClick={handleClose} 
        style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#361bbc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
        }}
      >
        Fechar
      </button>
    </div>
  );
};

export default PanoramaViewer;