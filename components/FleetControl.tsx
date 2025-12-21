import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Vehicle, MaintenanceTask, VehicleStatus, MaintenanceStatus } from '../types';
import { useLanguage } from '../hooks/useLanguage';

// Helper to format date
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
};

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// Modal component for adding/editing vehicles
const VehicleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: Omit<Vehicle, 'id'> | Vehicle) => void;
    vehicleToEdit: Vehicle | null;
}> = ({ isOpen, onClose, onSave, vehicleToEdit }) => {
    const [plate, setPlate] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [driver, setDriver] = useState('');
    const [status, setStatus] = useState<VehicleStatus>('Operacional');

    React.useEffect(() => {
        if (vehicleToEdit) {
            setPlate(vehicleToEdit.plate);
            setModel(vehicleToEdit.model);
            setYear(vehicleToEdit.year);
            setDriver(vehicleToEdit.driver);
            setStatus(vehicleToEdit.status);
        } else {
            setPlate('');
            setModel('');
            setYear(new Date().getFullYear());
            setDriver('');
            setStatus('Operacional');
        }
    }, [vehicleToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicleData = { plate, model, year, driver, status };
        if (vehicleToEdit) {
            onSave({ ...vehicleData, id: vehicleToEdit.id });
        } else {
            onSave(vehicleData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001]" onClick={onClose}>
            <div className="bg-bg-card p-8 rounded-lg shadow-xl w-full max-w-lg text-light" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">{vehicleToEdit ? 'Editar Veículo' : 'Adicionar Veículo'}</h2>
                    <div className="space-y-4">
                        <div className="form-group"><label>Placa</label><input type="text" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} required className="input-style" maxLength={7} /></div>
                        <div className="form-group"><label>Modelo</label><input type="text" value={model} onChange={e => setModel(e.target.value)} required className="input-style" /></div>
                        <div className="form-group"><label>Ano</label><input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} required className="input-style" /></div>
                        <div className="form-group"><label>Motorista</label><input type="text" value={driver} onChange={e => setDriver(e.target.value)} required className="input-style" /></div>
                        <div className="form-group"><label>Status</label><select value={status} onChange={e => setStatus(e.target.value as VehicleStatus)} className="input-style"><option>Operacional</option><option>Em Manutenção</option><option>Inativo</option></select></div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="btn-style bg-border-color hover:bg-opacity-80">Cancelar</button>
                        <button type="submit" className="btn-style bg-primary hover:bg-opacity-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal for maintenance tasks
const MaintenanceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<MaintenanceTask, 'id'> | MaintenanceTask) => void;
    taskToEdit: MaintenanceTask | null;
    vehicles: Vehicle[];
}> = ({ isOpen, onClose, onSave, taskToEdit, vehicles }) => {
    const [vehicleId, setVehicleId] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [date, setDate] = useState('');
    const [cost, setCost] = useState(0);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<MaintenanceStatus>('Agendada');
    
    React.useEffect(() => {
        if (taskToEdit) {
            setVehicleId(taskToEdit.vehicleId);
            setServiceType(taskToEdit.serviceType);
            setDate(taskToEdit.date);
            setCost(taskToEdit.cost);
            setNotes(taskToEdit.notes);
            setStatus(taskToEdit.status);
        } else {
            setVehicleId(vehicles[0]?.id || '');
            setServiceType('');
            setDate(new Date().toISOString().split('T')[0]);
            setCost(0);
            setNotes('');
            setStatus('Agendada');
        }
    }, [taskToEdit, isOpen, vehicles]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const taskData = { vehicleId, serviceType, date, cost, notes, status };
        if (taskToEdit) {
            onSave({ ...taskData, id: taskToEdit.id });
        } else {
            onSave(taskData);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001]" onClick={onClose}>
            <div className="bg-bg-card p-8 rounded-lg shadow-xl w-full max-w-lg text-light" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">{taskToEdit ? 'Editar Manutenção' : 'Agendar Manutenção'}</h2>
                    <div className="space-y-4">
                        <div className="form-group"><label>Veículo</label><select value={vehicleId} onChange={e => setVehicleId(e.target.value)} required className="input-style">{vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}</select></div>
                        <div className="form-group"><label>Tipo de Serviço</label><input type="text" value={serviceType} onChange={e => setServiceType(e.target.value)} required className="input-style" placeholder="Ex: Troca de óleo, Revisão..." /></div>
                        <div className="form-group"><label>Data</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-style" /></div>
                        <div className="form-group"><label>Custo (R$)</label><input type="number" step="0.01" value={cost} onChange={e => setCost(parseFloat(e.target.value))} required className="input-style" /></div>
                        <div className="form-group"><label>Observações</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-style" /></div>
                        <div className="form-group"><label>Status</label><select value={status} onChange={e => setStatus(e.target.value as MaintenanceStatus)} className="input-style"><option>Agendada</option><option>Concluída</option></select></div>
                    </div>
                     <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="btn-style bg-border-color hover:bg-opacity-80">Cancelar</button>
                        <button type="submit" className="btn-style bg-primary hover:bg-opacity-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const FleetControl: React.FC = () => {
    const { 
        fleetData, addVehicle, updateVehicle, deleteVehicle,
        maintenanceTasks, addMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask
    } = useAppStore();
    const { t } = useLanguage();

    const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
    
    const [isMaintModalOpen, setMaintModalOpen] = useState(false);
    const [maintToEdit, setMaintToEdit] = useState<MaintenanceTask | null>(null);

    const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'Todos'>('Todos');

    const vehicleMap = useMemo(() => {
        return fleetData.reduce((acc, vehicle) => {
            acc[vehicle.id] = vehicle;
            return acc;
        }, {} as Record<string, Vehicle>);
    }, [fleetData]);

    const filteredFleet = useMemo(() => {
        if (statusFilter === 'Todos') {
            return fleetData;
        }
        return fleetData.filter(vehicle => vehicle.status === statusFilter);
    }, [fleetData, statusFilter]);

    const scheduledTasks = useMemo(() => {
        return maintenanceTasks
            .filter(t => t.status === 'Agendada')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [maintenanceTasks]);

    const completedTasks = useMemo(() => {
        return maintenanceTasks
            .filter(t => t.status === 'Concluída')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [maintenanceTasks]);

    const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id'> | Vehicle) => {
        if ('id' in vehicleData) {
            updateVehicle(vehicleData);
        } else {
            addVehicle(vehicleData);
        }
        setVehicleModalOpen(false);
        setVehicleToEdit(null);
    };
    
    const handleEditVehicle = (vehicle: Vehicle) => {
        setVehicleToEdit(vehicle);
        setVehicleModalOpen(true);
    };

    const handleDeleteVehicle = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este veículo?')) {
            deleteVehicle(id);
        }
    };
    
    const handleSaveMaint = (taskData: Omit<MaintenanceTask, 'id'> | MaintenanceTask) => {
        if ('id' in taskData) {
            updateMaintenanceTask(taskData);
        } else {
            addMaintenanceTask(taskData);
        }
        setMaintModalOpen(false);
        setMaintToEdit(null);
    };
    
    const handleEditMaint = (task: MaintenanceTask) => {
        setMaintToEdit(task);
        setMaintModalOpen(true);
    };

    const handleDeleteMaint = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover esta manutenção?')) {
            deleteMaintenanceTask(id);
        }
    };

    const getStatusBadge = (status: VehicleStatus) => {
        const colors = {
            'Operacional': 'bg-green-500/20 text-success',
            'Em Manutenção': 'bg-yellow-500/20 text-warning',
            'Inativo': 'bg-red-500/20 text-danger',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>{status}</span>;
    };
    
    const filterStatuses: (VehicleStatus | 'Todos')[] = ['Todos', 'Operacional', 'Em Manutenção', 'Inativo'];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-light">{t('fleetControl')} e Manutenção</h1>
            
            {/* Vehicle List */}
            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-light">Nossa Frota</h3>
                    <button onClick={() => setVehicleModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"><i className="fas fa-plus"></i> Adicionar Veículo</button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-text">Filtrar por status:</span>
                    {filterStatuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                statusFilter === status ? 'bg-primary text-white' : 'bg-border-color text-light hover:bg-opacity-80'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Placa</th><th className="px-6 py-3">Modelo</th><th className="px-6 py-3">Ano</th>
                                <th className="px-6 py-3">Motorista</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filteredFleet.map(v => (
                                <tr key={v.id} className="hover:bg-border-color">
                                    <td className="px-6 py-4 font-mono font-bold text-light">{v.plate}</td>
                                    <td className="px-6 py-4">{v.model}</td><td className="px-6 py-4">{v.year}</td>
                                    <td className="px-6 py-4">{v.driver}</td>
                                    <td className="px-6 py-4">{getStatusBadge(v.status)}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleEditVehicle(v)} className="text-blue-400 hover:text-blue-300">✏️</button>
                                        <button onClick={() => handleDeleteVehicle(v.id)} className="text-red-500 hover:text-red-400">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scheduled Maintenance List */}
            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-light">Manutenções Agendadas</h3>
                    <button onClick={() => setMaintModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow" disabled={fleetData.length === 0} title={fleetData.length === 0 ? 'Adicione um veículo primeiro' : ''}><i className="fas fa-tools"></i> Agendar Manutenção</button>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Data</th><th className="px-6 py-3">Veículo</th><th className="px-6 py-3">Serviço</th>
                                <th className="px-6 py-3">Custo</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {scheduledTasks.map(t => (
                                <tr key={t.id} className="hover:bg-border-color">
                                    <td className="px-6 py-4 font-semibold text-light">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4">{vehicleMap[t.vehicleId]?.plate || 'N/A'}</td>
                                    <td className="px-6 py-4">{t.serviceType}</td>
                                    <td className="px-6 py-4">{formatCurrency(t.cost)}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-primary`}>{t.status}</span></td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleEditMaint(t)} className="text-blue-400 hover:text-blue-300">✏️</button>
                                        <button onClick={() => handleDeleteMaint(t.id)} className="text-red-500 hover:text-red-400">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Completed Maintenance History */}
            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-light">Histórico de Manutenções</h3>
                </div>
                 <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Data</th><th className="px-6 py-3">Veículo</th><th className="px-6 py-3">Serviço</th>
                                <th className="px-6 py-3">Custo</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-border-color">
                            {completedTasks.map(t => (
                                <tr key={t.id} className="hover:bg-border-color">
                                    <td className="px-6 py-4 font-semibold text-light">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4">{vehicleMap[t.vehicleId]?.plate || 'N/A'}</td>
                                    <td className="px-6 py-4">{t.serviceType}</td>
                                    <td className="px-6 py-4">{formatCurrency(t.cost)}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-success`}>{t.status}</span></td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleEditMaint(t)} className="text-blue-400 hover:text-blue-300">✏️</button>
                                        <button onClick={() => handleDeleteMaint(t.id)} className="text-red-500 hover:text-red-400">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <VehicleModal isOpen={isVehicleModalOpen} onClose={() => setVehicleModalOpen(false)} onSave={handleSaveVehicle} vehicleToEdit={vehicleToEdit} />
            <MaintenanceModal isOpen={isMaintModalOpen} onClose={() => setMaintModalOpen(false)} onSave={handleSaveMaint} taskToEdit={maintToEdit} vehicles={fleetData} />
            
            <style>{`
              .form-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #9ca3af; }
              .input-style { width: 100%; padding: 10px; background: #111827; border: 1px solid #374151; border-radius: 5px; color: #f9fafb; font-size: 1rem; box-sizing: border-box; }
              .input-style:focus { outline: none; border-color: #38bdf8; }
              .btn-style { padding: 12px 24px; border-radius: 5px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.2s ease-in-out; border: none; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); }
              .btn-style:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: translateY(-1px); }
            `}</style>
        </div>
    );
};

export default FleetControl;