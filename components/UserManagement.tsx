
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { User, Sector, Role } from '../types';

const UserManagement: React.FC = () => {
    const { users, addUser, updateUser, deleteUser, currentUser } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    const isAdmin = currentUser?.role === 'Admin';
    const sectors: Sector[] = ['OpsMind', 'FlowCapital', 'NeuroTech', 'IdeaForge'];
    const roles: Role[] = ['Admin', 'User'];

    // State for Permissions Management
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [selectedUserForPerm, setSelectedUserForPerm] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role>('User');

    const handleCreateUser = () => {
        const name = prompt("Nome do novo usuário:");
        if (!name) return;
        const matricula = prompt("Matrícula:");
        if (!matricula) return;
        const phone = prompt("Celular (com +55 e DDD):");
        if (!phone) return;
        const roleInput = prompt(`Nível de Acesso (${roles.join(' ou ')}):`, "User");
        const role = roles.find(r => r.toLowerCase() === roleInput?.toLowerCase());
        if (!role) {
            alert("Nível de acesso inválido.");
            return;
        }
        const sectorInput = prompt(`Setor (${sectors.join(', ')}):`, "OpsMind");
        const sector = sectors.find(s => s.toLowerCase() === sectorInput?.toLowerCase());
        if (!sector) {
            alert("Setor inválido.");
            return;
        }
        const initialPassword = prompt("Senha inicial:", "123");
        if (!initialPassword) return;

        addUser({ name, matricula, phone, role, sector, password: initialPassword });
        alert("Usuário criado com sucesso!");
    };

    const handleEditUser = (user: User) => {
        const name = prompt("Novo nome:", user.name) ?? user.name;
        const matricula = prompt("Nova matrícula:", user.matricula) ?? user.matricula;
        const phone = prompt("Novo celular:", user.phone) ?? user.phone;
        
        // Role management is now handled in a separate modal, but kept here for fallback
        // const roleInput = prompt(`Novo Nível de Acesso (${roles.join(' ou ')}):`, user.role);
        // const role = roles.find(r => r.toLowerCase() === roleInput?.toLowerCase()) ?? user.role;
        const role = user.role; // Preserve existing role in quick edit
        
        const sectorInput = prompt(`Novo Setor (${sectors.join(', ')}):`, user.sector);
        const sector = sectors.find(s => s.toLowerCase() === sectorInput?.toLowerCase()) ?? user.sector;
        
        if (window.confirm("Deseja alterar a senha?")) {
            const newPassword = prompt("Nova senha:");
            if (newPassword) {
                updateUser({ ...user, name, matricula, phone, role, sector, password: newPassword });
                alert("Usuário atualizado com sucesso (com nova senha)!");
                return;
            }
        }
        
        updateUser({ ...user, name, matricula, phone, role, sector });
        alert("Usuário atualizado com sucesso!");
    };

    const handleDeleteUser = (userId: string) => {
        if (currentUser?.id === userId) {
            alert("Você não pode excluir a si mesmo.");
            return;
        }
        if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
            deleteUser(userId);
        }
    };

    // Permission Management Handlers
    const openPermissionsModal = (user: User) => {
        setSelectedUserForPerm(user);
        setSelectedRole(user.role);
        setIsPermModalOpen(true);
    };

    const savePermissions = () => {
        if (selectedUserForPerm) {
            updateUser({ ...selectedUserForPerm, role: selectedRole });
            setIsPermModalOpen(false);
            setSelectedUserForPerm(null);
            // Optional: Notification or Alert
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            'Admin': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            'User': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
        const colorClass = colors[role as keyof typeof colors] || colors['User'];
        const icon = role === 'Admin' ? 'fa-user-shield' : 'fa-user';
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${colorClass}`}>
                <i className={`fas ${icon} text-[10px]`}></i> {role}
            </span>
        );
    };

    const languages = {
        pt: 'Português',
        en: 'English',
        es: 'Español',
        zh: '中文',
        ja: '日本語',
    };

    return (
        <div className="bg-bg-card rounded-lg p-5 shadow-lg relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-light flex items-center gap-2">
                    <i className="fas fa-users-cog"></i> {t('userManagement')}
                </h3>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                     <div className="flex items-center gap-2">
                        <label htmlFor="language-select" className="text-sm text-gray-text">Idioma:</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="bg-bg-main border border-border-color rounded-md px-2 py-1 text-sm text-light focus:outline-none focus:ring-1 focus:ring-secondary"
                        >
                            {Object.entries(languages).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>
                    {isAdmin && (
                        <button onClick={handleCreateUser} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-2">
                           <i className="fas fa-user-plus"></i> Adicionar
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto max-h-[60vh] custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-text">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('fullName')}</th>
                            <th scope="col" className="px-6 py-3">{t('matricula')}</th>
                            <th scope="col" className="px-6 py-3">{t('celular')}</th>
                            <th scope="col" className="px-6 py-3">{t('accountType')}</th>
                            <th scope="col" className="px-6 py-3">Setor</th>
                            {isAdmin && <th scope="col" className="px-6 py-3">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-border-color transition-colors">
                                <td className="px-6 py-4 font-medium text-light">{user.name}</td>
                                <td className="px-6 py-4">{user.matricula}</td>
                                <td className="px-6 py-4">{user.phone}</td>
                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="px-6 py-4">{user.sector}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 space-x-2">
                                        <button 
                                            onClick={() => openPermissionsModal(user)} 
                                            className="w-8 h-8 inline-flex items-center justify-center rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors" 
                                            title="Gerenciar Permissões"
                                        >
                                            <i className="fas fa-key text-xs"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleEditUser(user)} 
                                            className="w-8 h-8 inline-flex items-center justify-center rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors" 
                                            title="Editar Dados"
                                        >
                                            <i className="fas fa-pencil-alt text-xs"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)} 
                                            className="w-8 h-8 inline-flex items-center justify-center rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors" 
                                            title="Remover Usuário"
                                        >
                                            <i className="fas fa-trash text-xs"></i>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Permissions Modal */}
            {isPermModalOpen && selectedUserForPerm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2005]" onClick={() => setIsPermModalOpen(false)}>
                    <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-md border border-border-color" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
                            <h3 className="text-xl font-bold text-light flex items-center gap-2">
                                <i className="fas fa-user-shield text-purple-500"></i> Controle de Acesso
                            </h3>
                            <button onClick={() => setIsPermModalOpen(false)} className="text-gray-400 hover:text-white">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <p className="text-sm text-gray-300 mb-4">
                            Defina o nível de permissão para o usuário: <span className="font-bold text-light">{selectedUserForPerm.name}</span>
                        </p>

                        <div className="space-y-3 mb-6">
                            <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${selectedRole === 'Admin' ? 'bg-purple-500/10 border-purple-500' : 'bg-bg-main border-border-color hover:border-gray-500'}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="Admin" 
                                    checked={selectedRole === 'Admin'} 
                                    onChange={() => setSelectedRole('Admin')} 
                                    className="hidden" 
                                />
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white mr-4">
                                    <i className="fas fa-crown"></i>
                                </div>
                                <div>
                                    <span className={`block font-bold ${selectedRole === 'Admin' ? 'text-purple-400' : 'text-light'}`}>Administrador</span>
                                    <span className="text-xs text-gray-400">Acesso total ao sistema, configurações, gestão de usuários e aprovações financeiras.</span>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${selectedRole === 'User' ? 'bg-blue-500/10 border-blue-500' : 'bg-bg-main border-border-color hover:border-gray-500'}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="User" 
                                    checked={selectedRole === 'User'} 
                                    onChange={() => setSelectedRole('User')} 
                                    className="hidden" 
                                />
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white mr-4">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <span className={`block font-bold ${selectedRole === 'User' ? 'text-blue-400' : 'text-light'}`}>Usuário Padrão</span>
                                    <span className="text-xs text-gray-400">Acesso às operações diárias, lançamentos e visualização de dashboards básicos.</span>
                                </div>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                            <button onClick={() => setIsPermModalOpen(false)} className="px-4 py-2 bg-border-color rounded text-light hover:bg-opacity-80">Cancelar</button>
                            <button onClick={savePermissions} className="px-6 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 shadow-lg">Salvar Permissões</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
    