
import React, { useState, useRef, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const folders = [
    { id: 'cte', label: 'CT-e', icon: 'fa-barcode' },
    { id: 'containers', label: 'Containers', icon: 'fa-box' },
    { id: 'pagamentos_cf', label: 'Pagamentos C.F', icon: 'fa-file-invoice-dollar' },
    { id: 'pagamentos_outros', label: 'Pagamentos OUTROS', icon: 'fa-receipt' },
    { id: 'pagamentos_cv', label: 'Pagamentos C.V', icon: 'fa-gas-pump' },
    { id: 'reembolsos', label: 'Reembolsos', icon: 'fa-hand-holding-usd' },
    { id: 'outros', label: 'Outros', icon: 'fa-folder-open' },
];

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'fa-file-image text-blue-400';
    if (mimeType.includes('pdf')) return 'fa-file-pdf text-red-500';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'fa-file-excel text-green-500';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'fa-file-powerpoint text-orange-500';
    if (mimeType.includes('word')) return 'fa-file-word text-blue-600';
    return 'fa-file-alt text-gray-400';
};

const EcoFiles: React.FC = () => {
    const { driveFiles, uploadFile, deleteFile } = useAppStore();
    const [activeFolder, setActiveFolder] = useState('cte');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredFiles = useMemo(() => {
        return driveFiles.filter(f => f.folder === activeFolder || (!f.folder && activeFolder === 'outros'));
    }, [driveFiles, activeFolder]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFile(e.dataTransfer.files[0], activeFolder);
            e.dataTransfer.clearData();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFile(e.target.files[0], activeFolder);
        }
    };

    const currentFolderLabel = folders.find(f => f.id === activeFolder)?.label;

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Folder Navigation */}
            <div className="bg-bg-card rounded-lg p-2 shadow-md flex flex-wrap gap-2 border border-border-color">
                {folders.map(folder => (
                    <button
                        key={folder.id}
                        onClick={() => setActiveFolder(folder.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200
                            ${activeFolder === folder.id 
                                ? 'bg-primary text-white shadow-md' 
                                : 'text-gray-400 hover:text-light hover:bg-bg-main'}`}
                    >
                        <i className={`fas ${folder.icon}`}></i>
                        {folder.label}
                    </button>
                ))}
            </div>

            <div className="bg-bg-card rounded-lg p-6 shadow-lg flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-light flex items-center gap-3">
                        <i className="fas fa-folder-open text-secondary"></i> 
                        {currentFolderLabel}
                    </h2>
                    <span className="text-xs text-gray-500 bg-bg-main px-3 py-1 rounded-full border border-border-color">
                        {filteredFiles.length} arquivos
                    </span>
                </div>

                {/* Drag & Drop Area */}
                <div 
                    className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 mb-6 ${isDragging ? 'border-primary bg-primary/10' : 'border-border-color hover:border-secondary hover:bg-secondary/10'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-text mb-3"></i>
                    <p className="font-semibold text-light">Adicionar arquivo em "{currentFolderLabel}"</p>
                    <p className="text-xs text-gray-500 mt-1">Arraste e solte ou clique para selecionar</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>

                {/* File List */}
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {filteredFiles.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-text">
                            <thead className="text-xs text-gray-400 uppercase bg-bg-main sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 w-10"></th>
                                    <th className="px-4 py-3">Nome</th>
                                    <th className="px-4 py-3">Tamanho</th>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {filteredFiles.map(file => (
                                    <tr key={file.id} className="hover:bg-bg-main/50 transition-colors">
                                        <td className="px-4 py-3 text-center">
                                            <i className={`fas ${getFileIcon(file.type)} text-lg`}></i>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-light truncate max-w-xs" title={file.name}>
                                            {file.name}
                                        </td>
                                        <td className="px-4 py-3">{formatFileSize(file.size)}</td>
                                        <td className="px-4 py-3">{new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                                                <i className="fas fa-eye"></i>
                                            </a>
                                            <button onClick={() => deleteFile(file.id)} className="text-red-500 hover:text-red-400 transition-colors">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <i className="fas fa-folder-open text-5xl mb-4"></i>
                            <p>Esta pasta está vazia.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EcoFiles;
