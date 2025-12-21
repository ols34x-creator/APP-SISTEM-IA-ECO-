
import React, { useState, useEffect } from 'react';
import { Demand, Photo, Attachment } from '../types';
import { fileToBase64, base64ToSrc, validateFileFormat, ALLOWED_EXTENSIONS } from '../services/fileService';

interface NewDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (demandData: Omit<Demand, 'id' | 'date' | 'status'>, id?: string) => void;
  openImageEditor: (photo: Photo) => void;
  demandToEdit?: Demand | null;
}

const NewDemandModal: React.FC<NewDemandModalProps> = ({ isOpen, onClose, onSave, openImageEditor, demandToEdit }) => {
  const [client, setClient] = useState('');
  const [contact, setContact] = useState('');
  const [service, setService] = useState('');
  const [setor, setSetor] = useState('');
  const [urgencia, setUrgencia] = useState<'Baixa' | 'Média' | 'Alta' | 'Crítica'>('Baixa');
  const [prazo, setPrazo] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [emailAviso, setEmailAviso] = useState('');
  const [celAviso, setCelAviso] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  
  const resetForm = () => {
    setClient('');
    setContact('');
    setService('');
    setSetor('');
    setUrgencia('Baixa');
    setPrazo('');
    setResponsavel('');
    setEmailAviso('');
    setCelAviso('');
    setPhotos([]);
    setAttachments([]);
    setDateStart('');
    setDateEnd('');
  };

  useEffect(() => {
    if (isOpen) {
        if (demandToEdit) {
            setClient(demandToEdit.client);
            setContact(demandToEdit.contact);
            setService(demandToEdit.service);
            setSetor(demandToEdit.setor);
            setUrgencia(demandToEdit.urgencia);
            setPrazo(demandToEdit.prazo);
            setResponsavel(demandToEdit.responsavel);
            setEmailAviso(demandToEdit.emailAviso);
            setCelAviso(demandToEdit.celAviso);
            setPhotos(demandToEdit.photos);
            setAttachments(demandToEdit.attachments);
            setDateStart(demandToEdit.dateStart || '');
            setDateEnd(demandToEdit.dateEnd || '');
        } else {
            resetForm();
        }
    }
  }, [isOpen, demandToEdit]);


  if (!isOpen) return null;
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // FIX: Explicitly cast Array.from to File[] to avoid 'unknown' element type inference in older TS environments
      const files = (Array.from(e.target.files) as File[]).slice(0, 4 - photos.length);
      
      const validFiles = files.filter(file => {
        if (!validateFileFormat(file)) {
          alert(`O arquivo "${file.name}" não é permitido. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`);
          return false;
        }
        return true;
      });

      const newPhotosPromises = validFiles.map(async (file: File) => {
        const base64 = await fileToBase64(file);
        return { id: crypto.randomUUID(), src: base64, name: file.name };
      });
      const newPhotos = await Promise.all(newPhotosPromises);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        // FIX: Explicitly cast Array.from to File[] to avoid 'unknown' element type inference in older TS environments
        const files = (Array.from(e.target.files) as File[]).slice(0, 2 - attachments.length);
        
        const validFiles = files.filter(file => {
          if (!validateFileFormat(file)) {
            alert(`O arquivo "${file.name}" não é permitido. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`);
            return false;
          }
          return true;
        });

        const newAttachments = validFiles.map((file: File) => ({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
    }
  };
  
  const removePhoto = (id: string) => {
      setPhotos(photos.filter(p => p.id !== id));
  }

  const removeAttachment = (id: string) => {
      setAttachments(attachments.filter(a => a.id !== id));
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      client, contact, service, setor, urgencia, prazo, responsavel, emailAviso, celAviso, photos, attachments, dateStart, dateEnd
    }, demandToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001]" onClick={onClose}>
      <div className="bg-bg-card p-8 rounded-lg shadow-xl w-full max-w-3xl text-light max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-secondary pb-2 flex items-center gap-3">
            <i className="fas fa-edit"></i> {demandToEdit ? 'Editar Demanda' : 'Nova Demanda'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group"><label>Nome do Cliente</label><input type="text" value={client} onChange={e => setClient(e.target.value)} required className="input-style" /></div>
            <div className="form-group"><label>Contato</label><input type="text" value={contact} onChange={e => setContact(e.target.value)} className="input-style" /></div>
            <div className="form-group"><label>Setor</label><input type="text" value={setor} onChange={e => setSetor(e.target.value)} className="input-style" /></div>
            <div className="form-group"><label>Responsável pelo Aviso</label><input type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)} className="input-style" /></div>
            <div className="form-group"><label>Urgência</label><select value={urgencia} onChange={e => setUrgencia(e.target.value as any)} className="input-style"><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></div>
            <div className="form-group"><label>Prazo Final</label><input type="datetime-local" value={prazo} onChange={e => setPrazo(e.target.value)} className="input-style" /></div>
            <div className="form-group md:col-span-2"><label>Descrição do Serviço</label><textarea value={service} onChange={e => setService(e.target.value)} required className="input-style min-h-[80px] resize-y" placeholder="Ex: Transporte de 1x Contêiner 40ft (Dry) - POA > GRU"></textarea></div>
            <div className="form-group"><label>Data de Início (Gantt)</label><input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} required className="input-style" /></div>
            <div className="form-group"><label>Data de Fim (Gantt)</label><input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} required className="input-style" /></div>
            <div className="form-group"><label>Email para Aviso</label><input type="email" value={emailAviso} onChange={e => setEmailAviso(e.target.value)} className="input-style" /></div>
            <div className="form-group"><label>Celular para Aviso</label><input type="tel" value={celAviso} onChange={e => setCelAviso(e.target.value)} className="input-style" /></div>
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-sm text-gray-text">Fotos (máx. 4)</label>
            <input type="file" multiple accept=".jpg,.jpeg,.png" onChange={handlePhotoUpload} className="input-style" disabled={photos.length >= 4}/>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map(p => (
                    <div key={p.id} className="relative group">
                        <img src={base64ToSrc(p.src, 'image/jpeg')} alt="upload preview" className="w-full h-24 object-cover rounded"/>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            <button type="button" onClick={() => openImageEditor(p)} className="text-white text-lg hover:text-blue-400" title="Editar com IA"><i className="fas fa-magic"></i></button>
                            <button type="button" onClick={() => removePhoto(p.id)} className="text-white text-lg hover:text-red-400" title="Remover"><i className="fas fa-trash"></i></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-sm text-gray-text">Anexos (máx. 2)</label>
            <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleAttachmentUpload} className="input-style" disabled={attachments.length >= 2}/>
            <div className='mt-2 space-y-1'>
                {attachments.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-bg-main p-1 rounded text-sm">
                        <span className="truncate"><i className="fas fa-paperclip mr-2"></i>{a.name}</span>
                        <button type="button" onClick={() => removeAttachment(a.id)} className="text-red-400 hover:text-red-600 px-2" title="Remover"><i className="fas fa-times"></i></button>
                    </div>
                ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-style bg-border-color hover:bg-opacity-80">Cancelar</button>
            <button type="submit" className="btn-style bg-green-600 hover:bg-green-700">Salvar Demanda</button>
          </div>
        </form>
        <style>{`
          .form-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #9ca3af; }
          .input-style { width: 100%; padding: 10px; background: #111827; border: 1px solid #374151; border-radius: 5px; color: #f9fafb; font-size: 1rem; box-sizing: border-box; }
          .input-style:focus { outline: none; border-color: #38bdf8; }
          .btn-style { padding: 12px 24px; border-radius: 5px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.2s ease-in-out; border: none; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); }
          .btn-style:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: translateY(-1px); }
        `}</style>
      </div>
    </div>
  );
};

export default NewDemandModal;
