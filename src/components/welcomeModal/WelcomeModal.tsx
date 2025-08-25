import React, { useState } from 'react';
import './WelcomeModal.css';

interface WelcomeModalProps {
  onClose: () => void;
  onDismissForever: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose, onDismissForever }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      onDismissForever();
    } else {
      onClose();
    }
  };

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal">
        <h2>Uma novidade para você!</h2>
        <div className="modal-content">
          <p>
            Olá, nós da Plankus temos uma novidade para você, que vai melhorar a performance e renderização da sua nuvem de pontos. 
            Para isso, faça o download do aplicativo desktop <strong><i>Plankus Viewer</i></strong>.
          </p>
          <p>
            Após o download, instale o app "Plankus Viewer Setup 1.0.0". Instalado, ele já irá iniciar e basta 
            fazer o login normalmente.
          </p>
          <p>
            Escolha a nuvem de pontos que deseja baixar localmente, escolha a pasta e pronto, quando finalizar o
            download aparecerá uma mensagem avisando. Basta clicar em projeto local e escolher a pasta que foi baixada, que está
            dentro de uma pasta com o "nome do projeto-json" que você escolheu onde baixar.
          </p>
          <p>
            Qualquer dúvida mande um email para <strong>suporte_viewer@plankus.com</strong>.
          </p>
          <p>Atenciosamente,<br />Plankus Engenharia!</p>
        </div>
        
        <div className="dismiss-container">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <label htmlFor="dontShowAgain">Não quero ver essa mensagem novamente</label>
        </div>
        
        <button className="close-button" onClick={handleClose}>
          Entendido
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
