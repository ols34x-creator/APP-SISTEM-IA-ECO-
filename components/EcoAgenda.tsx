
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Contact, ContactCategory } from '../types';

const categoryColors: Record<ContactCategory, { bg: string; border: string; text: string }> = {
    Red: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-300' },
    Black: { bg: 'bg-gray-500/10', border: 'border-gray-400', text: 'text-gray-300' },
    Blue: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-300' },
    Green: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-300' },
};

const ContactModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<Contact, 'id'> | Contact) => void;
    contactToEdit: Contact | null;
}> = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState<ContactCategory>('Black');
    const [nextAppointment, setNextAppointment] = useState('');

    React.useEffect(() => {
        if (contactToEdit) {
            setName(contactToEdit.name);
            setPhone(contactToEdit.phone);
            setEmail(contactToEdit.email);
            setCategory(contactToEdit.category);
            setNextAppointment(contactToEdit.nextAppointment || '');
        } else {
            setName(''); setPhone(''); setEmail(''); setCategory('Black'); setNextAppointment('');
        }
    }, [contactToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contactData = { name, phone, email, category, nextAppointment };
        if (contactToEdit) {
            onSave({ ...contactData, id: contactToEdit.id });
        } else {
            onSave(contactData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-lg text-light" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">{contactToEdit ? 'Editar Contato' : 'Adicionar Contato'}</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
                        <input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required className="form-input" />
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
                        <div>
                            <label className="text-sm text-gray-text mb-1 block">Próximo Compromisso</label>
                            <input type="datetime-local" value={nextAppointment} onChange={e => setNextAppointment(e.target.value)} className="form-input" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-text">Categoria</label>
                            <div className="flex gap-2 mt-1">
                                {(Object.keys(categoryColors) as ContactCategory[]).map(cat => (
                                    <button type="button" key={cat} onClick={() => setCategory(cat)} className={`w-8 h-8 rounded-full ${categoryColors[cat].bg.replace('/10', '/80')} ${category === cat ? 'ring-2 ring-white' : ''}`}></button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-border-color rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary rounded-md">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EcoAgenda: React.FC = () => {
    const { contacts, addContact, updateContact, deleteContact, addNotification } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // 2 rows of 4 cards
    const notifiedAppointments = useRef<Set<string>>(new Set());

    // Solicitar permissão para notificações ao montar
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    // Monitoramento de Compromissos
    useEffect(() => {
        const checkAppointments = () => {
            const now = new Date();
            contacts.forEach(contact => {
                if (contact.nextAppointment) {
                    const apptDate = new Date(contact.nextAppointment);
                    const diffMs = apptDate.getTime() - now.getTime();
                    const diffMinutes = diffMs / (1000 * 60);
                    
                    // --- Notificação de 24 Horas (1440 minutos) ---
                    // Checamos se falta entre 23h58m e 24h02m para evitar múltiplos disparos, mas garantir que pegue no intervalo
                    if (diffMinutes >= 1438 && diffMinutes <= 1442) {
                        const notificationKey24h = `${contact.id}-${contact.nextAppointment}-24h`;
                        
                        if (!notifiedAppointments.current.has(notificationKey24h)) {
                            const message = `📅 Lembrete: Compromisso com ${contact.name} em 24 horas (${apptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
                            
                            // Notificação Interna
                            addNotification({ message, type: 'info' });
                            
                            // Notificação Push do Navegador
                            if (Notification.permission === 'granted') {
                                new Notification("EcoLog Agenda", { body: message, icon: '/vite.svg' });
                            }

                            notifiedAppointments.current.add(notificationKey24h);
                        }
                    }

                    // --- Notificação de 30 Minutos ---
                    if (diffMinutes > 0 && diffMinutes <= 30) {
                        const notificationKey30m = `${contact.id}-${contact.nextAppointment}-30m`;

                        if (!notifiedAppointments.current.has(notificationKey30m)) {
                            const message = `🔔 Compromisso próximo com ${contact.name} às ${apptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                            
                            // Notificação Interna
                            addNotification({ message, type: 'warning' });
                             
                            // Notificação Push do Navegador
                            if (Notification.permission === 'granted') {
                                new Notification("EcoLog Agenda - Urgente", { body: message, icon: '/vite.svg' });
                            }

                            notifiedAppointments.current.add(notificationKey30m);
                        }
                    }
                }
            });
        };

        const interval = setInterval(checkAppointments, 60000); // Checa a cada minuto
        checkAppointments(); // Checa imediatamente ao montar

        return () => clearInterval(interval);
    }, [contacts, addNotification]);

    const filteredContacts = useMemo(() => {
        return contacts.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);
    
    // Reset page to 1 if search term changes and we are on a page that no longer exists
    useEffect(() => {
        if (currentPage > 1 && (currentPage - 1) * itemsPerPage >= filteredContacts.length) {
            setCurrentPage(1);
        }
    }, [searchTerm, filteredContacts, currentPage]);


    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredContacts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredContacts, currentPage, itemsPerPage]);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handleSave = (contactData: Omit<Contact, 'id'> | Contact) => {
        if ('id' in contactData) {
            updateContact(contactData);
        } else {
            addContact(contactData);
        }
    };
    
    const handleEdit = (contact: Contact) => {
        setContactToEdit(contact);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este contato?')) {
            deleteContact(id);
        }
    };
    
    return (
        <div className="bg-bg-card rounded-lg p-5 shadow-lg">
            <style>{`.form-input { width: 100%; padding: 10px; background: #111827; border: 1px solid #374151; border-radius: 5px; color: #f9fafb; }`}</style>
            <ContactModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setContactToEdit(null); }}
                onSave={handleSave}
                contactToEdit={contactToEdit}
            />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-light flex items-center gap-3"><i className="fas fa-address-book text-primary"></i> Agenda de Contatos</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input 
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input flex-grow"
                    />
                    <button onClick={() => { setContactToEdit(null); setIsModalOpen(true); }} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-2 whitespace-nowrap">
                        <i className="fas fa-plus"></i> Adicionar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[280px]">
                {paginatedContacts.map(contact => (
                    <div key={contact.id} className={`p-4 rounded-lg border-l-4 ${categoryColors[contact.category].bg} ${categoryColors[contact.category].border}`}>
                        <div className="flex justify-between items-start">
                             <h3 className={`text-lg font-bold ${categoryColors[contact.category].text}`}>{contact.name}</h3>
                             <div className="flex gap-2">
                                <button onClick={() => handleEdit(contact)} className="text-gray-400 hover:text-white"><i className="fas fa-pencil-alt fa-xs"></i></button>
                                <button onClick={() => handleDelete(contact.id)} className="text-gray-400 hover:text-red-500"><i className="fas fa-trash-alt fa-xs"></i></button>
                            </div>
                        </div>
                       
                        <p className="text-sm text-gray-text mt-2"><i className="fas fa-phone-alt fa-fw mr-2"></i>{contact.phone}</p>
                        <p className="text-sm text-gray-text"><i className="fas fa-envelope fa-fw mr-2"></i>{contact.email}</p>
                        {contact.nextAppointment && (
                            <div className="mt-3 pt-2 border-t border-white/10">
                                <p className="text-xs text-yellow-400 font-semibold flex items-center gap-2">
                                    <i className="fas fa-calendar-check"></i>
                                    {new Date(contact.nextAppointment).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {filteredContacts.length === 0 && (
                <div className="text-center py-10 text-gray-text min-h-[280px] flex flex-col justify-center items-center">
                    <i className="fas fa-user-slash fa-3x mb-4"></i>
                    <p>Nenhum contato encontrado.</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-arrow-left mr-2"></i> Anterior
                    </button>
                    <span className="text-gray-text font-semibold">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Próximo <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default EcoAgenda;
