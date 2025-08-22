import React, { useState } from 'react';
import './AddLocalProjectPanel.css';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { User } from '../../../utils/types';

interface AddLocalProjectPanelProps {
    onClose: () => void;
    currentUser: User | null;
    onProjectAdded: () => void;
}

const AddLocalProjectPanel: React.FC<AddLocalProjectPanelProps> = ({ onClose, currentUser, onProjectAdded }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name || !folderName) {
            setError("O nome do projeto e o nome da pasta são obrigatórios.");
            setLoading(false);
            return;
        }

        if (!currentUser) {
            setError("Não foi possível identificar o usuário atual.");
            setLoading(false);
            return;
        }

        try {
            const token = await getAccessTokenSilently();

            const newProject = {
                name,
                description,
                tenant_id: currentUser.tenant_id,
                category_id: null, // Conforme solicitado
                status: "Em andamento",
                url: `http://127.0.0.1:3333/${folderName}/metadata.json`,
                images_url: null,
                csv_url: null,
            };

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/projects`, newProject, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert(`Projeto Local '${name}' adicionado com sucesso!`);
            onProjectAdded(); // Atualiza a lista de projetos
            onClose(); // Fecha o painel
        } catch (err) {
            console.error("❌ Erro ao adicionar projeto local:", err);
            setError("Erro ao adicionar projeto. Verifique o console para mais detalhes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-project-panel-overlay">
            <div className="add-project-panel">
                <h2>Adicionar Projeto Local</h2>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome do Projeto (obrigatório):</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Descrição:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Nuvem de Pontos da Fachada"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nome da Pasta (obrigatório):</label>
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="O nome da pasta que o servidor local irá usar"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Salvar"}
                        </button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLocalProjectPanel;
