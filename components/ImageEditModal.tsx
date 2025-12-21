
import React, { useState, useEffect } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { base64ToSrc } from '../services/fileService';
import { Photo } from '../types';

interface ImageEditModalProps {
  photo: Photo | null;
  onClose: () => void;
  onSave: (editedPhoto: Photo) => void;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ photo, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [editedPhotoSrc, setEditedPhotoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset state when a new photo is passed in
  useEffect(() => {
    if (photo) {
        setPrompt('');
        setEditedPhotoSrc(null);
        setError(null);
        setIsLoading(false);
    }
  }, [photo]);

  if (!photo) return null;

  const originalSrc = base64ToSrc(photo.src, 'image/jpeg'); // Assuming jpeg for simplicity

  const handleEdit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of the changes.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const editedBase64 = await editImageWithGemini(photo.src, 'image/jpeg', prompt);
      const mimeType = 'image/jpeg'; // Gemini output is jpeg
      setEditedPhotoSrc(base64ToSrc(editedBase64, mimeType));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
      if (editedPhotoSrc && photo) {
          const newBase64 = editedPhotoSrc.split(',')[1];
          onSave({ ...photo, src: newBase64 });
      }
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1002]">
      <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-4xl text-light">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-secondary pb-2">Editar Imagem com IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className='text-center'>
            <h3 className='font-semibold mb-2'>Original</h3>
            <img src={originalSrc} alt="Original" className="w-full h-auto max-h-80 object-contain rounded-md" />
          </div>
          <div className='text-center'>
            <h3 className='font-semibold mb-2'>Editada</h3>
            <div className="w-full h-80 bg-bg-main rounded-md flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <i className="fas fa-spinner fa-spin text-4xl text-secondary"></i>
                  <p className="mt-2">Gerando imagem...</p>
                </div>
              ) : editedPhotoSrc ? (
                <img src={editedPhotoSrc} alt="Edited" className="w-full h-auto max-h-80 object-contain rounded-md" />
              ) : (
                <p className="text-gray-text">A imagem editada aparecerá aqui.</p>
              )}
            </div>
          </div>
        </div>
        
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        
        <div className="mt-6">
          <label htmlFor="edit-prompt" className="block mb-2 font-semibold">Descreva a alteração:</label>
          <div className="flex gap-2">
            <input
              id="edit-prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: adicione um filtro retrô, remova a pessoa ao fundo..."
              className="w-full px-3 py-2 bg-bg-main border border-border-color rounded-md text-light focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button onClick={handleEdit} disabled={isLoading} className="px-6 py-2 bg-blue-600 rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2">
              <i className="fas fa-magic"></i> Gerar
            </button>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-md font-bold hover:bg-gray-700">Cancelar</button>
          <button onClick={handleSave} disabled={!editedPhotoSrc} className="px-6 py-2 bg-green-600 rounded-md font-bold hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed">Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;
