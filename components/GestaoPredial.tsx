import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { BuildingItem, ItemMessage, ItemAttachment } from '../types';
import { fileToBase64, base64ToSrc } from '../services/fileService';

// --- Helper Functions & Types ---
declare const jspdf: any;

const getFileType = (mimeType: string): ItemAttachment['fileType'] => {
    if (mimeType.startsWith('image/')) return 'foto';
    if (mimeType.startsWith('video/')) return 'video';
    return 'documento';
};

const getFileIcon = (fileType: ItemAttachment['fileType']): string => {
    switch (fileType) {
        case 'foto': return 'fa-file-image';
        case 'video': return 'fa-file-video';
        default: return 'fa-file-alt';
    }
};

// --- Sub-components ---

// Form for Adding/Editing Building Items
const ItemForm: React.FC<{
    onSave: (itemData: { description: string; location: string }) => void;
    onCancel: () => void;
    itemToEdit: BuildingItem | null;
}> = ({ onSave, onCancel, itemToEdit }) => {
    const [description, setDescription] = useState(itemToEdit?.description || '');
    const [location, setLocation] = useState(itemToEdit?.location || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        onSave({ description, location });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">{itemToEdit ? 'Editar Item' : 'Novo Item Predial'}</h3>
            <div>
                <label className="form-label">Descrição</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="form-input" />
            </div>
            <div>
                <label className="form-label">Localização</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="form-input" />
            </div>
            <div className="flex gap-2">
                <button type="submit" className="btn-action bg-primary">Salvar</button>
                <button type="button" onClick={onCancel} className="btn-action bg-border-color">Cancelar</button>
            </div>
        </form>
    );
};

// Main component
const GestaoPredial: React.FC = () => {
    const {
        buildingItems, addBuildingItem, updateBuildingItem, deleteBuildingItem,
        itemMessages, addItemMessage,
        itemAttachments, addItemAttachment, deleteItemAttachment
    } = useAppStore();

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [lightboxImage, setLightboxImage] = useState<ItemAttachment | null>(null);

    const selectedItem = useMemo(() => buildingItems.find(i => i.id === selectedItemId), [selectedItemId, buildingItems]);
    const messagesForItem = useMemo(() => itemMessages.filter(m => m.itemId === selectedItemId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [selectedItemId, itemMessages]);
    const attachmentsForItem = useMemo(() => itemAttachments.filter(a => a.itemId === selectedItemId), [selectedItemId, itemAttachments]);

    const handleSaveItem = (itemData: { description: string; location: string }) => {
        if (selectedItem && isEditing) {
            updateBuildingItem({ ...selectedItem, ...itemData });
        } else {
            addBuildingItem(itemData);
        }
        setIsEditing(false);
    };

    const handleDeleteItem = (itemId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este item e todos os seus dados associados?')) {
            deleteBuildingItem(itemId);
            if (selectedItemId === itemId) {
                setSelectedItemId(null);
            }
        }
    };
    
    const handleAddMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && selectedItemId) {
            addItemMessage({ itemId: selectedItemId, message: newMessage });
            setNewMessage('');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedItemId) {
            const file = e.target.files[0];
            const fileContent = await fileToBase64(file);
            const mimeType = file.type;
            const fileType = getFileType(mimeType);

            addItemAttachment({
                itemId: selectedItemId,
                fileName: file.name,
                fileType,
                fileContent,
                mimeType,
            });
            e.target.value = ''; // Reset file input
        }
    };

    const handleGenerateReport = () => {
        if (!selectedItem) {
            alert('Selecione um item para gerar o relatório.');
            return;
        }
    
        const { jsPDF } = jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
        const margin = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 20;
    
        const addText = (text: string, x: number, yPos: number, options?: any) => {
            const fontSize = options?.size || doc.getFontSize();
            const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - margin * 2);
            doc.text(lines, x, yPos, options);
            return lines.length * (fontSize / 2.8); // Estimate height
        };
    
        const checkPageBreak = (neededHeight: number) => {
            if (y + neededHeight > pageHeight - margin) {
                doc.addPage();
                y = 20;
            }
        };
    
        // Header
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text('Relatório de Manutenção Predial', margin, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, y);
        y += 15;
    
        // Item Details
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text('1. Detalhes do Item', margin, y);
        y += 8;
        doc.setFontSize(11);
        doc.setTextColor(0);
        y += addText(`Descrição: ${selectedItem.description}`, margin, y, { size: 11 });
        y += addText(`Localização: ${selectedItem.location || '-'}`, margin, y, { size: 11 });
        y += addText(`Data de Criação: ${new Date(selectedItem.createdAt).toLocaleDateString('pt-BR')}`, margin, y, { size: 11 });
        y += 10;
        
        // Messages
        if (messagesForItem.length > 0) {
            checkPageBreak(20);
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text('2. Histórico de Mensagens', margin, y);
            y += 8;
            doc.setFontSize(10);
            doc.setTextColor(0);
            messagesForItem.forEach(msg => {
                const messageText = `[${new Date(msg.createdAt).toLocaleString('pt-BR')}] ${msg.message}`;
                const textHeight = addText(messageText, margin, y, { size: 10 });
                checkPageBreak(textHeight + 2);
                addText(messageText, margin, y);
                y += textHeight + 2;
            });
            y += 10;
        }
    
        // Photos
        const photoAttachments = attachmentsForItem.filter(att => att.fileType === 'foto');
        if (photoAttachments.length > 0) {
            checkPageBreak(20);
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text('3. Fotos Anexadas', margin, y);
            y += 8;
            
            photoAttachments.forEach(photo => {
                const imgHeight = 80;
                checkPageBreak(imgHeight + 15);
                try {
                    const imgData = base64ToSrc(photo.fileContent, photo.mimeType);
                    // Use a reasonable aspect ratio for display
                    const imgProps = doc.getImageProperties(imgData);
                    const aspectRatio = imgProps.width / imgProps.height;
                    const imgWidth = Math.min(100, imgHeight * aspectRatio);

                    doc.addImage(imgData, 'JPEG', margin, y, imgWidth, imgHeight);
                    y += imgHeight + 5;
                    doc.setFontSize(9);
                    doc.setTextColor(150);
                    addText(photo.fileName, margin, y, { size: 9 });
                    y += 10;
                } catch(e) {
                    console.error("Erro ao adicionar imagem ao PDF:", e);
                    checkPageBreak(10);
                    doc.setFontSize(9);
                    doc.setTextColor(255, 0, 0);
                    addText(`Erro ao carregar imagem: ${photo.fileName}`, margin, y, { size: 9 });
                    y+= 5;
                }
            });
        }
    
        doc.save(`Relatorio_${selectedItem.description.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    };

    const renderAttachment = (attachment: ItemAttachment) => {
        if (attachment.fileType === 'foto') {
            return <img src={base64ToSrc(attachment.fileContent, attachment.mimeType)} className="w-full h-24 object-cover rounded-t-lg cursor-pointer" alt={attachment.fileName}/>;
        }
        return <div className="h-24 flex items-center justify-center bg-bg-main rounded-t-lg"><i className={`fas ${getFileIcon(attachment.fileType)} text-4xl text-secondary`}></i></div>;
    };

    return (
        <div className="bg-bg-card rounded-lg p-5 shadow-lg min-h-[80vh]">
            <style>{`
                .form-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #d1d5db; }
                .form-input { padding: 0.75rem; border: 1px solid #374151; border-radius: 0.375rem; font-size: 1rem; background-color: #111827; color: #f9fafb; width: 100%; }
                .btn-action { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; color: white; transition: opacity 0.3s; }
                .btn-action:hover { opacity: 0.9; }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-light flex items-center gap-3"><i className="fas fa-building text-primary"></i> Gestão Predial</h2>
                <button onClick={() => { setSelectedItemId(null); setIsEditing(true); }} className="btn-action bg-primary"><i className="fas fa-plus mr-2"></i> Novo Item</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {/* Items List */}
                <div className="md:col-span-1 bg-bg-main p-4 rounded-lg flex flex-col max-h-[70vh]">
                    <h3 className="text-lg font-semibold mb-3">Itens Cadastrados</h3>
                    <div className="overflow-y-auto space-y-2 pr-2">
                        {buildingItems.map(item => (
                            <div key={item.id} onClick={() => {setSelectedItemId(item.id); setIsEditing(false);}} className={`p-3 rounded-md cursor-pointer transition-colors border-l-4 ${selectedItemId === item.id ? 'bg-secondary/20 border-secondary' : 'bg-border-color/50 border-transparent hover:bg-border-color'}`}>
                                <p className="font-bold truncate">{item.description}</p>
                                <p className="text-sm text-gray-text truncate">{item.location}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details / Form Panel */}
                <div className="md:col-span-2 bg-bg-main p-4 rounded-lg max-h-[70vh] overflow-y-auto">
                    {!selectedItemId && !isEditing && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-text">
                            <i className="fas fa-search-location fa-3x mb-4"></i>
                            <p>Selecione um item à esquerda para ver os detalhes</p>
                            <p>ou clique em "Novo Item" para começar.</p>
                        </div>
                    )}

                    {isEditing && <ItemForm onSave={handleSaveItem} onCancel={() => setIsEditing(false)} itemToEdit={selectedItem} />}

                    {selectedItem && !isEditing && (
                        <div className="space-y-6">
                            {/* Item Header */}
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-light">{selectedItem.description}</h3>
                                        <p className="text-gray-text">{selectedItem.location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleGenerateReport} className="btn-action bg-secondary" title="Gerar Relatório PDF"><i className="fas fa-file-pdf"></i></button>
                                        <button onClick={() => setIsEditing(true)} className="btn-action bg-border-color" title="Editar Item"><i className="fas fa-pencil-alt"></i></button>
                                        <button onClick={() => handleDeleteItem(selectedItem.id)} className="btn-action bg-danger" title="Excluir Item"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Messages */}
                            <div>
                                <h4 className="text-lg font-semibold mb-3">Mensagens Tralatórias (Histórico)</h4>
                                <form onSubmit={handleAddMessage} className="flex gap-2 mb-3">
                                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Nova mensagem..." className="form-input flex-grow"/>
                                    <button type="submit" className="btn-action bg-secondary">Adicionar</button>
                                </form>
                                <div className="space-y-2">
                                    {messagesForItem.map(msg => (
                                        <div key={msg.id} className="bg-bg-card p-3 rounded-md">
                                            <p>{msg.message}</p>
                                            <p className="text-xs text-gray-text text-right">{new Date(msg.createdAt).toLocaleString('pt-BR')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attachments */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-semibold">Anexos</h4>
                                    <label className="btn-action bg-secondary cursor-pointer">
                                        <i className="fas fa-upload mr-2"></i> Anexar
                                        <input type="file" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {attachmentsForItem.map(att => (
                                        <div key={att.id} className="bg-bg-card rounded-lg shadow-md group relative" onClick={() => att.fileType === 'foto' && setLightboxImage(att)}>
                                            {renderAttachment(att)}
                                            <div className="p-2">
                                                <p className="text-xs truncate font-semibold" title={att.fileName}>{att.fileName}</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteItemAttachment(att.id); }} className="absolute top-1 right-1 w-6 h-6 bg-red-600/80 rounded-full text-white text-xs items-center justify-center hidden group-hover:flex">
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {lightboxImage && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4 animate-fade-in"
                    onClick={() => setLightboxImage(null)}
                >
                    <img 
                        src={base64ToSrc(lightboxImage.fileContent, lightboxImage.mimeType)} 
                        alt={lightboxImage.fileName}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                    <button 
                        className="absolute top-4 right-4 text-white text-4xl font-bold opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => setLightboxImage(null)}
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
};

export default GestaoPredial;