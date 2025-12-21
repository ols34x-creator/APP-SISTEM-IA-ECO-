
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Sector, Role } from '../types';
import { useAppStore, THEMES } from '../hooks/useAppStore';
import { useLanguage } from '../hooks/useLanguage';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { users, addUser, updateUser, deleteUser, currentUser } = useAuth();
    const { t } = useLanguage();
    const { 
      isLayoutMode, setIsLayoutMode, 
      isSidebarPinned, setIsSidebarPinned,
      headerBehavior, setHeaderBehavior,
      theme, setTheme,
      activeTab, resetLayout
    } = useAppStore();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // User Management State
    const [userFormMode, setUserFormMode] = useState<'list' | 'add' | 'edit'>('list');
    const [userFormData, setUserFormData] = useState<Partial<User>>({});
    
    const sectors: Sector[] = ['OpsMind', 'FlowCapital', 'NeuroTech', 'IdeaForge'];
    const roles: Role[] = ['Admin', 'User'];
    const canResetLayout = activeTab === 'dashboard' || activeTab === 'transactions';

    // Reset auth and local state when panel is closed
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsAuthenticated(false);
                setPassword('');
                setError('');
                setUserFormMode('list');
                setUserFormData({});
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '0003') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Senha incorreta.');
            setPassword('');
        }
    };

    // User Form Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const startAddUser = () => {
        setUserFormData({
            role: 'User',
            sector: 'OpsMind',
            password: ''
        });
        setUserFormMode('add');
    };

    const startEditUser = (user: User) => {
        setUserFormData({ ...user, password: '' }); // Don't load password hash
        setUserFormMode('edit');
    };

    const cancelUserForm = () => {
        setUserFormMode('list');
        setUserFormData({});
    };

    const submitUserForm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userFormData.name || !userFormData.matricula || !userFormData.phone) {
            alert("Por favor, preencha os campos obrigatórios.");
            return;
        }

        if (userFormMode === 'add') {
            if (!userFormData.password) {
                alert("Senha é obrigatória para novos usuários.");
                return;
            }
            addUser({
                name: userFormData.name,
                matricula: userFormData.matricula,
                phone: userFormData.phone,
                role: userFormData.role as Role || 'User',
                sector: userFormData.sector as Sector || 'OpsMind',
                password: userFormData.password
            });
        } else if (userFormMode === 'edit' && userFormData.id) {
            // Only include password if user typed something new
            const updateData: any = {
                id: userFormData.id,
                name: userFormData.name,
                matricula: userFormData.matricula,
                phone: userFormData.phone,
                role: userFormData.role as Role,
                sector: userFormData.sector as Sector
            };
            
            if (userFormData.password && userFormData.password.trim() !== '') {
                updateData.password = userFormData.password;
            }
            
            // We need to pass a complete User object, but updateUser in auth hook might handle partials or we merge here.
            // Assuming updateUser expects a User object, we need to be careful. 
            // The hook uses the ID to find and replace.
            // Let's merge with the original user data to be safe if needed, but here we have most fields.
            // For the password, the API service usually handles it.
            const fullUser: User = {
                id: userFormData.id,
                name: userFormData.name,
                matricula: userFormData.matricula,
                phone: userFormData.phone,
                role: userFormData.role as Role,
                sector: userFormData.sector as Sector,
                password: userFormData.password || undefined // Let the backend/service handle undefined password (no change)
            };
            
            updateUser(fullUser);
        }

        setUserFormMode('list');
        setUserFormData({});
    };

    const handleDeleteUser = (userId: string) => {
        if (currentUser?.id === userId) {
            alert("Você não pode excluir a si mesmo.");
            return;
        }
        if (window.confirm("Tem certeza que deseja excluir este usuário? Essa ação é irreversível.")) {
            deleteUser(userId);
        }
    };

    if (!isOpen) return null;

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2001] transition-opacity duration-300" onClick={onClose}>
                <div className="bg-bg-card p-8 rounded-lg shadow-xl w-full max-w-sm text-light border border-border-color" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handlePasswordSubmit}>
                        <h2 className="text-xl font-bold mb-4 text-light">Acesso Restrito</h2>
                        <p className="text-gray-text mb-4 text-sm">Insira a senha de administrador (0003) para gerenciar configurações sensíveis.</p>
                        <div className="form-group">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-bg-main border border-border-color rounded p-3 text-light focus:outline-none focus:border-primary text-center tracking-widest"
                                autoFocus
                                placeholder="Senha"
                            />
                        </div>
                        {error && <p className="text-danger text-sm mt-2 text-center">{error}</p>}
                        <div className="mt-6 flex justify-end">
                            <button type="submit" className="w-full px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-opacity-90">Acessar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`fixed top-0 right-0 h-full w-[450px] bg-bg-card shadow-2xl z-[2001] transform transition-transform duration-300 border-l border-border-color ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="h-full flex flex-col">
                <header className="flex-shrink-0 flex items-center justify-between p-5 border-b border-border-color bg-bg-card">
                    <h2 className="text-xl font-bold text-light"><i className="fas fa-cogs mr-2"></i> Configurações</h2>
                    <button onClick={onClose} className="text-gray-text hover:text-light text-2xl">&times;</button>
                </header>
                
                <div className="flex-grow p-5 overflow-y-auto custom-scrollbar space-y-8">
                    
                    {/* USER MANAGEMENT SECTION */}
                    <section className="bg-bg-main/30 p-4 rounded-lg border border-border-color">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-light flex items-center gap-2">
                                <i className="fas fa-users-cog text-secondary"></i> Usuários e Acesso
                            </h3>
                            {userFormMode === 'list' && (
                                <button onClick={startAddUser} className="text-xs bg-primary text-white px-3 py-1.5 rounded-md font-bold hover:bg-opacity-90 transition-colors">
                                    <i className="fas fa-plus mr-1"></i> Novo
                                </button>
                            )}
                        </div>

                        {userFormMode === 'list' ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                {users.map(user => (
                                    <div key={user.id} className="bg-bg-card p-3 rounded-md flex justify-between items-center border border-border-color hover:border-secondary transition-colors group">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-light text-sm">{user.name}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-text mt-0.5">{user.matricula} • {user.sector}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditUser(user)} className="w-7 h-7 flex items-center justify-center rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors">
                                                <i className="fas fa-pencil-alt text-xs"></i>
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="w-7 h-7 flex items-center justify-center rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                                <i className="fas fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={submitUserForm} className="space-y-3 animate-fade-in">
                                <div>
                                    <label className="text-xs text-gray-text font-semibold block mb-1">Nome Completo</label>
                                    <input type="text" name="name" value={userFormData.name || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Matrícula (ID)</label>
                                        <input type="text" name="matricula" value={userFormData.matricula || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Celular</label>
                                        <input type="text" name="phone" value={userFormData.phone || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Nível de Acesso</label>
                                        <select name="role" value={userFormData.role || 'User'} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none">
                                            {roles.map(r => <option key={r} value={r}>{r === 'Admin' ? 'Administrador' : 'Usuário Padrão'}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Setor</label>
                                        <select name="sector" value={userFormData.sector || 'OpsMind'} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none">
                                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-text font-semibold block mb-1">Senha {userFormMode === 'edit' && '(Deixe em branco para manter)'}</label>
                                    <input type="password" name="password" value={userFormData.password || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" placeholder="******" />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={cancelUserForm} className="px-3 py-1.5 text-sm bg-transparent text-gray-400 hover:text-light transition-colors">Cancelar</button>
                                    <button type="submit" className="px-3 py-1.5 text-sm bg-success text-white font-bold rounded hover:bg-green-600 transition-colors">
                                        {userFormMode === 'add' ? 'Criar Usuário' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                    
                     {/* Layout & Theme Settings */}
                     <section>
                         <h3 className="text-lg font-semibold text-light mb-3 border-b border-border-color pb-2">Visualização</h3>
                         
                         {/* Sidebar Pin */}
                         <div className="mb-4">
                            <label htmlFor="sidebar-pin-toggle" className="flex items-center justify-between bg-bg-main p-3 rounded-md cursor-pointer border border-transparent hover:border-border-color transition-all">
                              <span className="text-sm text-light">{t('pinSidebar')}</span>
                              <div className="relative">
                                <input 
                                  type="checkbox" 
                                  id="sidebar-pin-toggle" 
                                  className="sr-only" 
                                  checked={isSidebarPinned}
                                  onChange={() => setIsSidebarPinned(!isSidebarPinned)} 
                                />
                                <div className="block bg-bg-card border border-border-color w-10 h-6 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-gray-400 w-4 h-4 rounded-full transition-transform ${isSidebarPinned ? 'transform translate-x-4 bg-secondary' : ''}`}></div>
                              </div>
                            </label>
                         </div>
                         
                         {/* Header Behavior */}
                          <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-text mb-2 uppercase">{t('headerBehavior')}</h4>
                            <div className="flex gap-2 bg-bg-main p-1 rounded-md border border-border-color">
                              <button onClick={() => setHeaderBehavior('scroll')} className={`flex-1 p-2 rounded text-center text-xs font-bold transition-all ${headerBehavior === 'scroll' ? 'bg-secondary text-white shadow-sm' : 'text-gray-500 hover:text-light'}`}>
                                  {t('scrollHeader')}
                              </button>
                              <button onClick={() => setHeaderBehavior('sticky')} className={`flex-1 p-2 rounded text-center text-xs font-bold transition-all ${headerBehavior === 'sticky' ? 'bg-secondary text-white shadow-sm' : 'text-gray-500 hover:text-light'}`}>
                                  {t('stickyHeader')}
                              </button>
                            </div>
                          </div>
                          
                          {/* Layout Mode */}
                           <div className="mb-4">
                            <label htmlFor="layout-toggle" className="flex items-center justify-between bg-bg-main p-3 rounded-md cursor-pointer border border-transparent hover:border-border-color transition-all">
                              <span className="text-sm text-light">Modo de Edição (Arrastar e Soltar)</span>
                              <div className="relative">
                                <input 
                                  type="checkbox" 
                                  id="layout-toggle" 
                                  className="sr-only" 
                                  checked={isLayoutMode}
                                  onChange={() => setIsLayoutMode(!isLayoutMode)} 
                                />
                                <div className="block bg-bg-card border border-border-color w-10 h-6 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-gray-400 w-4 h-4 rounded-full transition-transform ${isLayoutMode ? 'transform translate-x-4 bg-primary' : ''}`}></div>
                              </div>
                            </label>
                             <button
                                onClick={() => canResetLayout && resetLayout(activeTab)}
                                disabled={!canResetLayout}
                                className="w-full mt-2 px-4 py-2 bg-border-color/50 text-gray-400 text-xs font-semibold rounded hover:bg-border-color hover:text-light flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <i className="fas fa-undo"></i> Restaurar Layout Padrão
                            </button>
                          </div>
                     </section>

                     {/* Theme Selection */}
                     <section>
                        <h3 className="text-lg font-semibold text-light mb-3 border-b border-border-color pb-2">Tema</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(THEMES).map(([key, val]) => (
                                <button
                                    key={key}
                                    onClick={() => setTheme(key)}
                                    className={`p-2 rounded border text-xs font-bold text-left transition-all ${theme === key ? 'border-primary bg-primary/10 text-primary' : 'border-border-color text-gray-500 hover:border-gray-400'}`}
                                >
                                    {(val as any).name}
                                </button>
                            ))}
                        </div>
                     </section>
                </div>
            </div>
        </div>
    );
};
