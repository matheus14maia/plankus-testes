import React, { useState } from 'react';
import './AddUserPanel.css';
import { Role, Permission } from '../../utils/types'; // ✅ Importando corretamente os tipos
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

interface AddUserPanelProps {
    onClose: () => void;
    roles: Role[];
    defaultTenantId: number; // 🔹 Empresa do Supervisor
    onUserAdded: () => void;
}

const AddUserPanel: React.FC<AddUserPanelProps> = ({ onClose, roles, defaultTenantId, onUserAdded }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState<number | null>(null);
    const [rolePermissions, setRolePermissions] = useState<Permission[]>([]); // 🔹 Lista de permissões associadas ao cargo
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔹 Atualiza a lista de permissões quando um cargo é selecionado
    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleId = Number(event.target.value);
        setRoleId(selectedRoleId);

        // 🔹 Encontra a role selecionada
        const selectedRole = roles.find((role) => role.id === selectedRoleId);

        // 🔹 Atualiza a lista de permissões apenas se a role tiver permissões
        setRolePermissions(selectedRole?.permissions ?? []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name || !email || !roleId) {
            setError("❌ Todos os campos são obrigatórios.");
            setLoading(false);
            return;
        }

        try {
            const token = await getAccessTokenSilently();

            // 🔹 Criar o usuário e já vincular à mesma empresa do Supervisor
            const newUser = {
                name,
                email,
                role_id: roleId,
                tenant_id: defaultTenantId, // 🔹 Vincula automaticamente à empresa do Supervisor
            };

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users`, newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ Novo usuário adicionado:", newUser);
            alert(`Usuário ${name} adicionado com sucesso!`);

            setName('');
            setEmail('');
            setRoleId(null);
            setRolePermissions([]); // 🔹 Reseta as permissões ao finalizar
            onClose(); // Fecha o painel
            onUserAdded();
        } catch (error) {
            console.error("❌ Erro ao adicionar usuário:", error);
            setError("Erro ao adicionar usuário. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-user-panel-overlay">
            <div className="add-user-panel">
                <h2>Adicionar Usuário</h2>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Cargo:</label>
                        <select value={roleId || ''} onChange={handleRoleChange} required>
                            <option value="" disabled>Selecione um cargo</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 🔹 Exibir as permissões associadas à role dentro do mesmo container */}
                    <div className="form-group">
                        {rolePermissions.length > 0 && (
                            <>
                                <label>Permissões:</label>
                                <ul className="permissions-list">
                                    {rolePermissions.map((permission) => (
                                        <li key={permission.id}>✅ {permission.description}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? "Adicionando..." : "Adicionar"}
                        </button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserPanel;
