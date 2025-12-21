
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { validateFileFormat, ALLOWED_EXTENSIONS } from '../services/fileService';

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

const EcoDrive: React.FC = () => {
    const { driveFiles, uploadFile, deleteFile } = useAppStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const file = e.dataTransfer.files[0];
            if (!validateFileFormat(file)) {
              alert(`Formato inválido. Formatos permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`);
              return;
            }
            uploadFile(file);
            e.dataTransfer.clearData();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!validateFileFormat(file)) {
              alert(`Formato inválido. Formatos permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`);
              return;
            }
            uploadFile(file);
        }
    };
    
    const totalSize = useMemo(() => driveFiles.reduce((sum, file) => sum + file.size, 0), [driveFiles]);

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-light flex items-center gap-3">
                <i className="fab fa-google-drive text-primary"></i> Eco Drive - Gerenciador de Arquivos
            </h2>

            <div 
                className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-border-color hover:border-secondary hover:bg-secondary/10'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <i className="fas fa-cloud-upload-alt text-5xl text-gray-text mb-4"></i>
                <p className="font-semibold text-light">Arraste e solte arquivos aqui</p>
                <p className="text-sm text-gray-text">ou clique para selecionar</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelect}
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-light">Arquivos Enviados</h3>
                    <div className="text-sm text-gray-text bg-bg-main px-3 py-1 rounded-full">
                        {driveFiles.length} arquivos | Total: {formatFileSize(totalSize)}
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[50vh] bg-bg-main rounded-lg">
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-border-color sticky top-0">
                            <tr>
                                <th className="px-6 py-3 w-12"></th>
                                <th className="px-6 py-3">Nome do Arquivo</th>
                                <th className="px-6 py-3">Tamanho</th>
                                <th className="px-6 py-3">Data de Upload</th>
                                <th className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {driveFiles.map(file => (
                                <tr key={file.id} className="hover:bg-border-color/50">
                                    <td className="px-6 py-4 text-center">
                                        <i className={`fas ${getFileIcon(file.type)} text-xl`}></i>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-light truncate max-w-xs">{file.name}</td>
                                    <td className="px-6 py-4">{formatFileSize(file.size)}</td>
                                    <td className="px-6 py-4">{new Date(file.uploadedAt).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300" title="Visualizar (simulado)">
                                            <i className="fas fa-eye"></i>
                                        </a>
                                        <button onClick={() => deleteFile(file.id)} className="text-red-500 hover:text-red-400" title="Excluir">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {driveFiles.length === 0 && (
                        <div className="text-center py-10 text-gray-text">
                            <p>Nenhum arquivo enviado ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EcoDrive;
