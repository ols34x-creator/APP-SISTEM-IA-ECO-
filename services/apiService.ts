
import { User, FinancialData, RecordType, ReceivableRecord, CalendarEvent, HistoryItem as FreightHistoryItem, Vehicle, MaintenanceTask, Demand, Note, FreightAnalysis, ApprovalRequest, EcoSite, ComplianceRecord } from '../types';

// --- MOCK DATABASE (LocalStorage) ---

const predefinedUsers: User[] = [
    { id: 'user-1', name: 'Ruan Carlos', phone: '+5521994003522', matricula: '2323', role: 'User', sector: 'OpsMind', password: '123' },
    { id: 'user-2', name: 'Rafael Santos', phone: '+5521976245816', matricula: '0101', role: 'User', sector: 'FlowCapital', password: '123' },
    { id: 'user-3', name: 'Jorge Oliveira', phone: '+5521969836591', matricula: '1010', role: 'User', sector: 'NeuroTech', password: '123' },
    { id: 'user-4', name: 'Jorge Nasser', phone: '+5521982939715', matricula: '2121', role: 'Admin', sector: 'IdeaForge', password: '123' },
    { id: 'user-5', name: 'Thiago Maris', phone: '+5521982281790', matricula: '1313', role: 'User', sector: 'OpsMind', password: '123' },
];

const initialFinancialData: FinancialData = {
    fixedCosts: [], variableCosts: [], revenues: [], receivables: []
};

// Dados padrão para o calendário para garantir que o pedido do usuário seja atendido na primeira carga
const predefinedCalendarEvents: CalendarEvent[] = [
    {
        id: 1,
        description: 'Pagamento de contas',
        value: 1250.00,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'completed',
        justification: 'Pagamento realizado via PIX, comprovante #12345',
        completionDate: new Date().toISOString().split('T')[0]
    },
    {
        id: 2,
        description: 'Manutenção Preventiva - Caminhão ABC',
        value: 450.00,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        status: 'pending'
    }
];

// --- API Abstraction Layer ---

export const saveData = (key: string, data: any): Promise<void> => {
    return new Promise((resolve) => {
        localStorage.setItem(key, JSON.stringify(data));
        resolve();
    });
};

export const getData = <T>(key: string, defaultValue: T): Promise<T> => {
    return new Promise((resolve) => {
        try {
            const storedData = localStorage.getItem(key);
            // Se for portCalendarEvents e estiver vazio, usamos os dados predefinidos
            if (key === 'portCalendarEvents' && !storedData) {
                resolve(predefinedCalendarEvents as unknown as T);
                return;
            }
            resolve(storedData ? (JSON.parse(storedData) as T) : defaultValue);
        } catch (e) {
            console.error(`Failed to parse ${key} from localStorage`, e);
            resolve(defaultValue);
        }
    });
};


// --- Auth Service ---

export const getUsers = async (): Promise<User[]> => {
    const users = await getData<User[] | null>('ecolog-users', null);
    if (users === null) {
        await saveData('ecolog-users', predefinedUsers);
        return predefinedUsers;
    }
    return users;
};

export const getCurrentUser = (): Promise<User | null> => {
    return getData<User | null>('ecolog-currentUser', null);
};

export const loginUser = async (matricula: string): Promise<User | null> => {
    const users = await getUsers();
    const user = users.find(u => u.matricula === matricula);
    if (user) {
        await saveData('ecolog-currentUser', user);
        return user;
    }
    return null;
};

export const logoutUser = (): Promise<void> => {
    return new Promise((resolve) => {
        localStorage.removeItem('ecolog-currentUser');
        resolve();
    });
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<User[]> => {
    const users = await getUsers();
    const newUser: User = { ...userData, id: `user-${Date.now()}` };
    const updatedUsers = [...users, newUser];
    await saveData('ecolog-users', updatedUsers);
    return updatedUsers;
};

export const updateUser = async (updatedUser: User): Promise<User[]> => {
    const users = await getUsers();
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    await saveData('ecolog-users', updatedUsers);
    return updatedUsers;
};

export const deleteUser = async (userId: string): Promise<User[]> => {
    const users = await getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    await saveData('ecolog-users', updatedUsers);
    return updatedUsers;
};


// --- Financial Service ---

export const addFinancialRecord = async (type: string, record: any): Promise<FinancialData> => {
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const recordTypeMap: { [key: string]: RecordType } = {
        'fixed-cost': 'fixedCosts', 'variable-cost': 'variableCosts',
        'revenue': 'revenues', 'receivable': 'receivables',
    };
    const recordType = recordTypeMap[type];
    if (!recordType) return financialData;

    const updatedData = {
        ...financialData,
        [recordType]: [...financialData[recordType], record]
    };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const deleteFinancialRecord = async (type: RecordType, id: number): Promise<FinancialData> => {
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const updatedList = financialData[type].filter(item => (item as any).id !== id);
    const updatedData = { ...financialData, [type]: updatedList };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const markReceivableAsPaid = async (id: number): Promise<FinancialData> => {
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const updatedReceivables = financialData.receivables.map((r): ReceivableRecord => {
        if (r.id === id) return { ...r, status: 'paid' };
        return r;
    });
    const updatedData = { ...financialData, receivables: updatedReceivables };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

// --- Calendar Service ---
export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'status' | 'justification' | 'completionDate'>): Promise<CalendarEvent[]> => {
    const events = await getData<CalendarEvent[]>('portCalendarEvents', predefinedCalendarEvents);
    const newEvent: CalendarEvent = { ...event, id: Date.now(), status: 'pending' };
    const updatedEvents = [...events, newEvent];
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const completeCalendarEvent = async (id: number, justification: string): Promise<CalendarEvent[]> => {
    const events = await getData<CalendarEvent[]>('portCalendarEvents', predefinedCalendarEvents);
    const updatedEvents = events.map((e): CalendarEvent => {
        if (e.id === id) {
            return { ...e, status: 'completed', justification, completionDate: new Date().toISOString().split('T')[0] };
        }
        return e;
    });
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const updateCalendarEvent = async (updatedEvent: CalendarEvent): Promise<CalendarEvent[]> => {
    const events = await getData<CalendarEvent[]>('portCalendarEvents', predefinedCalendarEvents);
    const updatedEvents = events.map(e => (e.id === updatedEvent.id ? updatedEvent : e));
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};


// --- Other Services (Freight, Fleet, Notes, etc.) ---
export const addFreightQuotation = async (quotation: FreightHistoryItem): Promise<FreightHistoryItem[]> => {
    const history = await getData<FreightHistoryItem[]>('portFreightHistory', []);
    const updatedHistory = [quotation, ...history].slice(0, 100);
    await saveData('portFreightHistory', updatedHistory);
    return updatedHistory;
};

export const deleteFreightQuotation = async (id: string): Promise<FreightHistoryItem[]> => {
    const history = await getData<FreightHistoryItem[]>('portFreightHistory', []);
    const updatedHistory = history.filter(item => item.id !== id);
    await saveData('portFreightHistory', updatedHistory);
    return updatedHistory;
};

export const addFreightAnalysis = async (analysis: FreightAnalysis): Promise<FreightAnalysis[]> => {
    const analyses = await getData<FreightAnalysis[]>('ecolog-freight-analyses', []);
    const updatedAnalyses = [analysis, ...analyses];
    await saveData('ecolog-freight-analyses', updatedAnalyses);
    return updatedAnalyses;
}

export const deleteFreightAnalysis = async (id: string): Promise<FreightAnalysis[]> => {
    const analyses = await getData<FreightAnalysis[]>('ecolog-freight-analyses', []);
    const updatedAnalyses = analyses.filter(a => a.id !== id);
    await saveData('ecolog-freight-analyses', updatedAnalyses);
    return updatedAnalyses;
}

export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle[]> => {
    const data = await getData<Vehicle[]>('portFleetData', []);
    const newVehicle: Vehicle = { ...vehicle, id: `VEH-${Date.now()}` };
    const updatedData = [...data, newVehicle];
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const updateVehicle = async (updatedVehicle: Vehicle): Promise<Vehicle[]> => {
    const data = await getData<Vehicle[]>('portFleetData', []);
    const updatedData = data.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const deleteVehicle = async (id: string): Promise<Vehicle[]> => {
    const data = await getData<Vehicle[]>('portFleetData', []);
    const updatedData = data.filter(v => v.id !== id);
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const addMaintenanceTask = async (task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask[]> => {
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const newTask: MaintenanceTask = { ...task, id: `MAINT-${Date.now()}` };
    const updatedData = [...data, newTask];
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const updateMaintenanceTask = async (updatedTask: MaintenanceTask): Promise<MaintenanceTask[]> => {
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const updatedData = data.map(t => t.id === updatedTask.id ? updatedTask : t);
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const deleteMaintenanceTask = async (id: string): Promise<MaintenanceTask[]> => {
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const updatedData = data.filter(t => t.id !== id);
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const addNote = async (note: Omit<Note, 'id' | 'timestamp' | 'isLocked'>): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const newNote: Note = { ...note, id: `NOTE-${Date.now()}`, timestamp: new Date().toISOString(), isLocked: false };
    const updatedNotes = [newNote, ...notes];
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const updateNote = async (id: string, content: string): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.map(n => n.id === id ? { ...n, content, timestamp: new Date().toISOString() } : n);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const deleteNote = async (id: string): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.filter(n => n.id !== id);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const toggleNoteLock = async (id: string): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isLocked: !n.isLocked } : n);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

// --- General Approvals Service ---
export const addApprovalRequest = async (request: Omit<ApprovalRequest, 'id' | 'status'>): Promise<ApprovalRequest[]> => {
    const requests = await getData<ApprovalRequest[]>('ecolog-approvals', []);
    const newRequest: ApprovalRequest = { ...request, id: `APR-${Date.now()}`, status: 'pending' };
    const updatedRequests = [newRequest, ...requests];
    await saveData('ecolog-approvals', updatedRequests);
    return updatedRequests;
};

export const updateApprovalStatus = async (id: string, status: 'approved' | 'rejected', justification?: string): Promise<ApprovalRequest[]> => {
    const requests = await getData<ApprovalRequest[]>('ecolog-approvals', []);
    const updatedRequests = requests.map(req => req.id === id ? { ...req, status, justification } : req);
    await saveData('ecolog-approvals', updatedRequests);
    return updatedRequests;
};

// --- Eco.Sites Service ---
export const addEcoSite = async (site: Omit<EcoSite, 'id'>): Promise<EcoSite[]> => {
    const sites = await getData<EcoSite[]>('ecolog-eco-sites', []);
    const newSite: EcoSite = { ...site, id: `site-${Date.now()}` };
    const updatedSites = [...sites, newSite];
    await saveData('ecolog-eco-sites', updatedSites);
    return updatedSites;
};

export const deleteEcoSite = async (id: string): Promise<EcoSite[]> => {
    const sites = await getData<EcoSite[]>('ecolog-eco-sites', []);
    const updatedSites = sites.filter(s => s.id !== id);
    await saveData('ecolog-eco-sites', updatedSites);
    return updatedSites;
};

// --- Compliance Service ---
export const addComplianceRecord = async (record: Omit<ComplianceRecord, 'id' | 'createdAt'>): Promise<ComplianceRecord[]> => {
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const newRecord: ComplianceRecord = { ...record, id: `COMP-${Date.now()}`, createdAt: new Date().toISOString() };
    const updatedRecords = [newRecord, ...records];
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};

export const updateComplianceRecord = async (updatedRecord: ComplianceRecord): Promise<ComplianceRecord[]> => {
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const updatedRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};

export const deleteComplianceRecord = async (id: string): Promise<ComplianceRecord[]> => {
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const updatedRecords = records.filter(r => r.id !== id);
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};
