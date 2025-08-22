import React, { useEffect, useState } from 'react';
import './UsersManagement.css';
import AddUserPanel from './AddUserPanel';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { Project, Role, User } from '../../utils/types';

const UsersManagement: React.FC = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userSelections, setUserSelections] = useState<Record<number, { projectId: number | null; roleId: number | null }>>({});
    const [isAddUserPanelOpen, setIsAddUserPanelOpen] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingData, setLoadingData] = useState(true);

    // 🔹 Buscar os dados do usuário logado
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCurrentUser(response.data);
            } catch (error) {
                console.error("❌ Erro ao buscar usuário logado:", error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchCurrentUser();
    }, [getAccessTokenSilently]);

    // 🔹 Buscar os usuários da empresa, projetos e cargos
    useEffect(() => {
        if (!currentUser || currentUser.role_id !== 3) return;

        const fetchData = async () => {
            try {
                const token = await getAccessTokenSilently();
                const [usersRes, projectsRes, rolesRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/users`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/projects`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/roles`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                ]);

                // 🔹 Filtra os usuários para não incluir o próprio Supervisor
                const filteredUsers = usersRes.data.filter((user: User) => user.id !== currentUser.id);

                setUsers(filteredUsers);
                setProjects(projectsRes.data);
                setRoles(rolesRes.data);
            } catch (error) {
                console.error("❌ Erro ao buscar dados:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [getAccessTokenSilently, currentUser]);

    // 🔹 Verifica se o usuário tem permissão para acessar esta página
    if (loadingUser) {
        return (
            <div className="loading-container-users">
                <div className="spinner-users"></div>
                <p>Carregando usuário...</p>
            </div>
        );
    }


    if (!currentUser) {
        return <p>Erro ao carregar usuário.</p>;
    }

    if (currentUser.role_id !== 3) {
        return <p>❌ Você não tem permissão para acessar esta página.</p>;
    }

    if (loadingData) {
        return (
            <div className="loading-container-users">
                <div className="spinner-users"></div>
                <p>Carregando dados de usuários...</p>
            </div>
        );
         
    }

    // 🔹 Atualiza o estado quando um Supervisor escolhe um projeto para um usuário
    const handleProjectChange = (userId: number, projectId: number) => {
        setUserSelections((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], projectId },
        }));
    };

    // 🔹 Atualiza o estado quando um Supervisor escolhe um cargo para um usuário
    const handleRoleChange = (userId: number, roleId: number) => {
        setUserSelections((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], roleId },
        }));
    };

    // 🔹 Salva a relação entre usuário, projeto e cargo no backend
    const handleSave = async (userId: number) => {
        const { projectId, roleId } = userSelections[userId] || {};
        if (!projectId || !roleId) {
            alert("Selecione um projeto e um cargo antes de salvar.");
            return;
        }

        try {
            const token = await getAccessTokenSilently();

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user-projects`, {
                user_id: userId,
                project_id: projectId,
                role_id: roleId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Usuário vinculado ao projeto com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao vincular usuário ao projeto:", error);
            alert("Erro ao salvar a associação. Tente novamente.");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;

        try {
            const token = await getAccessTokenSilently();
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsers(users.filter((user) => user.id !== userId));
            alert('Usuário deletado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao deletar usuário:', error);
            alert('Erro ao deletar usuário. Tente novamente.');
        }
    };

    const handleUserAdded = () => {
        setIsAddUserPanelOpen(false);

        const tokenPromise = getAccessTokenSilently();
        tokenPromise.then(token => {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(usersRes => {
                const filteredUsers = usersRes.data.filter((user: User) => user.id !== currentUser.id);
                setUsers(filteredUsers);
            })
        })
    };

    return (
        <div className="users-management-container">
            <h2>Gerenciar Usuários</h2>
            <button onClick={() => setIsAddUserPanelOpen(true)} className="add-user-button">
                Adicionar Usuário
            </button>

            {/* 🔹 Exibir a lista de usuários da empresa */}
            <ul className="users-list">
                {users.map((user) => (
                    <li key={user.id} className="user-item">
                        <div>
                            <strong>{user.name}</strong>
                            <p>{user.email}</p>
                            <p>Cargo Atual: {user.role.name}</p>
                        </div>
                        <div className="dropdown-selections">
                            <label>Projeto:</label>
                            <select
                                onChange={(e) => handleProjectChange(user.id, Number(e.target.value))}
                                value={userSelections[user.id]?.projectId || ''}
                            >
                                <option value="" disabled>Selecione um projeto</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>

                            <label>Cargo:</label>
                            <select
                                onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                                value={userSelections[user.id]?.roleId || ''}
                            >
                                <option value="" disabled>Selecione um cargo</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => handleSave(user.id)}
                                disabled={!userSelections[user.id]?.projectId || !userSelections[user.id]?.roleId}
                            >
                                Salvar
                            </button>

                            <button onClick={() => handleDeleteUser(user.id)} className="delete-user-button">
                                Deletar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {isAddUserPanelOpen && (
                <AddUserPanel
                    onClose={() => setIsAddUserPanelOpen(false)}
                    roles={roles}
                    defaultTenantId={currentUser.tenant_id}
                    onUserAdded={handleUserAdded}
                />
            )}
        </div>
    );
};

export default UsersManagement;
