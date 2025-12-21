
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FinancialData, HistoryLog, OperationalEvent, RecordType, TabId, ReceivableRecord, CalendarEvent, HistoryItem as FreightHistoryItem, Vehicle, MaintenanceTask, Demand, STATUS_MAP, DemandStatus, Note, Contact, BuildingItem, ItemMessage, ItemAttachment, DriveFile, CompanySettings, FreightAnalysis, Frete, ClientNote, Client, StatusOperacional, FreightColumn, BusinessPartner, Layouts, HeaderBehavior, AppNotification, ApprovalRequest, EcoSite, ComplianceRecord, Role, Sector, EcoCriatiRecord } from '../types';
import * as apiService from '../services/apiService';
import * as chatService from '../services/chatService';

// Define themes with RGB values for tailwind alpha compatibility
export const THEMES = {
    'default': { name: 'Deep Ocean', colors: { '--color-primary-val': '20 184 166', '--color-secondary-val': '59 130 246', '--color-success-val': '34 197 94', '--color-warning-val': '245 158 11', '--color-danger-val': '239 68 68', '--color-light-val': '248 250 252', '--color-bg-main-val': '15 23 42', '--color-bg-card-val': '30 41 59', '--color-gray-text-val': '148 163 184', '--color-border-color-val': '51 65 85' }},
    'monochrome': { name: 'Minimalist White', colors: { '--color-primary-val': '15 23 42', '--color-secondary-val': '71 85 105', '--color-success-val': '22 163 74', '--color-warning-val': '202 138 4', '--color-danger-val': '220 38 38', '--color-light-val': '15 23 42', '--color-bg-main-val': '241 245 249', '--color-bg-card-val': '255 255 255', '--color-gray-text-val': '100 116 139', '--color-border-color-val': '203 213 225' }},
    'blackAndBlack': { name: 'Black & Red', colors: { '--color-primary-val': '220 38 38', '--color-secondary-val': '163 163 163', '--color-success-val': '34 197 94', '--color-warning-val': '234 179 8', '--color-danger-val': '255 0 0', '--color-light-val': '255 255 255', '--color-bg-main-val': '0 0 0', '--color-bg-card-val': '18 18 18', '--color-gray-text-val': '161 161 170', '--color-border-color-val': '38 38 38' }},
    'sunset': { name: 'Sunset Glow', colors: { '--color-primary-val': '249 115 22', '--color-secondary-val': '168 85 247', '--color-success-val': '22 163 74', '--color-warning-val': '253 224 71', '--color-danger-val': '220 38 38', '--color-light-val': '241 245 249', '--color-bg-main-val': '2 6 23', '--color-bg-card-val': '15 12 41', '--color-gray-text-val': '156 163 175', '--color-border-color-val': '49 46 129' }},
    'emerald': { name: 'Emerald Forest', colors: { '--color-primary-val': '16 185 129', '--color-secondary-val': '14 165 233', '--color-success-val': '52 211 153', '--color-warning-val': '250 204 21', '--color-danger-val': '248 113 113', '--color-light-val': '240 253 244', '--color-bg-main-val': '6 25 25', '--color-bg-card-val': '10 45 45', '--color-gray-text-val': '148 163 184', '--color-border-color-val': '20 80 80' }},
    'cyberpunk': { name: 'Cyberpunk', colors: { '--color-primary-val': '255 0 120', '--color-secondary-val': '0 240 255', '--color-success-val': '57 255 20', '--color-warning-val': '255 230 0', '--color-danger-val': '255 40 40', '--color-light-val': '240 245 255', '--color-bg-main-val': '5 5 12', '--color-bg-card-val': '15 15 35', '--color-gray-text-val': '160 170 190', '--color-border-color-val': '60 20 80' }},
};

interface MenuItem {
    id: TabId;
    textKey: string;
    icon: string;
    roles?: Role[];
    sectors?: Sector[];
}

interface MenuSection {
    id: string;
    titleKey: string;
    icon: string;
    roles?: Role[];
    sectors?: Sector[];
    items: MenuItem[];
}

export const SIDEBAR_MENU_STRUCTURE: MenuSection[] = [
    {
        id: 'principal',
        titleKey: 'principal',
        icon: 'fa-home',
        items: [
            { id: 'dashboard', textKey: 'dashboard', icon: 'fa-tachometer-alt' },
            { id: 'operational-calendar', textKey: 'operationalCalendar', icon: 'fa-calendar-alt', sectors: ['OpsMind', 'IdeaForge'] },
        ],
    },
    {
        id: 'ecoFin',
        titleKey: 'ecoFin',
        icon: 'fa-dollar-sign',
        sectors: ['FlowCapital', 'IdeaForge'],
        items: [
            { id: 'financial-entries', textKey: 'addRecord', icon: 'fa-plus-circle' },
            { id: 'transactions', textKey: 'movimentoFinanceiro', icon: 'fa-exchange-alt' },
            { id: 'analytical-dashboard', textKey: 'analyticalDashboard', icon: 'fa-chart-pie' },
            { id: 'general-approvals', textKey: 'generalApprovals', icon: 'fa-check-double', roles: ['Admin'] },
            { id: 'faturamento-receita', textKey: 'faturamentoReceita', icon: 'fa-cash-register' },
            { id: 'custos-fixos', textKey: 'custosFixos', icon: 'fa-building' },
            { id: 'custos-variaveis', textKey: 'custosVariaveis', icon: 'fa-gas-pump' },
            { id: 'operational-report', textKey: 'operationalReport', icon: 'fa-chart-pie' },
            { id: 'cost-radar', textKey: 'costRadar', icon: 'fa-spider' },
            { id: 'account-delays', textKey: 'accountDelays', icon: 'fa-clock' },
            { id: 'interest-reports', textKey: 'interestReports', icon: 'fa-percent' },
            { id: 'reimbursement', textKey: 'reimbursement', icon: 'fa-file-signature' },
            { id: 'futuro-debitos', textKey: 'Futuro x Débitos', icon: 'fa-balance-scale' },
        ],
    },
    {
        id: 'ecoOpe',
        titleKey: 'ecoOpe',
        icon: 'fa-cogs',
        sectors: ['OpsMind', 'IdeaForge'],
        items: [
            { id: 'registration-control', textKey: 'controleCadastros', icon: 'fa-folder-plus' },
            { id: 'freight-sheet', textKey: 'freightSheet', icon: 'fa-table' },
            { id: 'freight-quotation', textKey: 'cotaViagens', icon: 'fa-calculator' },
            { id: 'briefing', textKey: 'chamadosAndamento', icon: 'fa-tasks' },
            { id: 'fleet-control', textKey: 'frotaRota', icon: 'fa-truck-pickup' },
            { id: 'port-checklist', textKey: 'checklistPortuario', icon: 'fa-clipboard-check' },
            { id: 'cte-reader', textKey: 'leitorCte', icon: 'fa-barcode' },
            { id: 'container-receipt', textKey: 'reciboContainer', icon: 'fa-file-invoice-dollar' },
            { id: 'briefing-feedback', textKey: 'requisicoesRetornos', icon: 'fa-file-alt' },
            { id: 'gestao-predial', textKey: 'gestaoPredial', icon: 'fa-building' },
        ],
    },
    {
        id: 'ecoCriati',
        titleKey: 'ECO.CRIATI',
        icon: 'fa-lightbulb',
        items: [
            { id: 'eco-criati', textKey: 'Espaço Criativo', icon: 'fa-magic' },
            { id: 'eco-branding', textKey: 'Eco.Branding', icon: 'fa-palette' },
        ],
    },
    {
        id: 'ecoMedia',
        titleKey: 'ECO.MEDIA',
        icon: 'fa-play-circle',
        items: [
            { id: 'eco-play', textKey: 'Eco.Play', icon: 'fa-video' },
        ],
    },
    {
        id: 'ecoDocs',
        titleKey: 'documentation',
        icon: 'fa-folder-open',
        items: [
            { id: 'receipts', textKey: 'comprovantes', icon: 'fa-receipt' },
            { id: 'eco-files', textKey: 'ecoFiles', icon: 'fa-folder-tree' },
            { id: 'eco-drive', textKey: 'ecoDrive', icon: 'fab fa-google-drive' },
            { id: 'ocr-reader', textKey: 'leitorOcr', icon: 'fa-eye' },
        ],
    },
    {
        id: 'ecoCom',
        titleKey: 'ecoCom',
        icon: 'fa-comments',
        items: [
            { id: 'compliance', textKey: 'compliance', icon: 'fa-shield-alt' },
            { id: 'eco-ia', textKey: 'atualizacoesApp', icon: 'fa-robot' },
        ],
    },
    {
        id: 'ecoSites',
        titleKey: 'ecoSites',
        icon: 'fa-globe',
        items: [
            { id: 'eco-sites', textKey: 'ecoSites', icon: 'fa-sitemap' },
        ],
    },
];

interface AppState {
    activeTab: TabId;
    setActiveTab: (tabId: TabId) => void;
    checkPermission: (user: any, tabId: TabId) => boolean;
    financialData: FinancialData;
    updateFinancialData: (type: RecordType, data: any[]) => void;
    addRecord: (type: string, record: any) => void;
    deleteRecord: (type: RecordType, id: number) => void;
    markAsPaid: (id: number) => void;
    history: HistoryLog[];
    logAction: (action: string) => void;
    clearHistory: () => void;
    operationalData: OperationalEvent[];
    setOperationalData: React.Dispatch<React.SetStateAction<OperationalEvent[]>>;
    calendarEvents: CalendarEvent[];
    addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'status' | 'justification' | 'completionDate'>) => void;
    completeCalendarEvent: (id: number, justification: string) => void;
    updateCalendarEvent: (event: CalendarEvent) => void;
    freightHistory: FreightHistoryItem[];
    addFreightQuotation: (quotation: FreightHistoryItem) => void;
    deleteFreightQuotation: (id: string) => void;
    freightAnalyses: FreightAnalysis[];
    addFreightAnalysis: (analysis: FreightAnalysis) => void;
    deleteFreightAnalysis: (id: string) => void;
    notifications: AppNotification[];
    addNotification: (notification: Omit<AppNotification, 'id'>) => void;
    dismissNotification: (id: number) => void;
    fleetData: Vehicle[];
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
    updateVehicle: (vehicle: Vehicle) => void;
    deleteVehicle: (id: string) => void;
    maintenanceTasks: MaintenanceTask[];
    addMaintenanceTask: (task: Omit<MaintenanceTask, 'id'>) => void;
    updateMaintenanceTask: (task: MaintenanceTask) => void;
    deleteMaintenanceTask: (id: string) => void;
    demands: Demand[];
    setDemands: React.Dispatch<React.SetStateAction<Demand[]>>;
    columnTitles: Record<string, string>;
    setColumnTitles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    addKanbanColumn: (title: string) => void;
    removeKanbanColumn: (key: string) => void;
    isSidebarPinned: boolean;
    setIsSidebarPinned: (pinned: boolean) => void;
    isLayoutMode: boolean;
    setIsLayoutMode: (mode: boolean) => void;
    headerBehavior: HeaderBehavior;
    setHeaderBehavior: (behavior: HeaderBehavior) => void;
    layouts: Layouts;
    setLayouts: React.Dispatch<React.SetStateAction<Layouts>>;
    resetLayout: (pageId: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    fontSize: string;
    setFontSize: (size: string) => void;
    fontFamily: string;
    setFontFamily: (family: string) => void;
    notes: Note[];
    addNote: (note: Omit<Note, 'id' | 'timestamp' | 'isLocked'>) => void;
    updateNote: (id: string, content: string) => void;
    deleteNote: (id: string) => void;
    toggleNoteLock: (id: string) => void;
    freightSheetData: Frete[];
    addFreightSheetItem: (frete: Frete) => void;
    updateFreightSheetItem: (frete: Frete) => void;
    deleteFreightSheetItem: (id: string) => void;
    freightColumns: FreightColumn[];
    addFreightColumn: (column: Omit<FreightColumn, 'id'>) => void;
    updateFreightColumn: (column: FreightColumn) => void;
    deleteFreightColumn: (id: string) => void;
    clientNotes: ClientNote[];
    addClientNote: (note: ClientNote) => void;
    partners: BusinessPartner[];
    addPartner: (partner: BusinessPartner) => void;
    updatePartner: (partner: BusinessPartner) => void;
    deletePartner: (id: string) => void;
    contacts: Contact[];
    addContact: (contact: Omit<Contact, 'id'>) => void;
    updateContact: (contact: Contact) => void;
    deleteContact: (id: string) => void;
    driveFiles: DriveFile[];
    uploadFile: (file: File, folder?: string) => void;
    deleteFile: (id: string) => void;
    isMusicPlayerOpen: boolean;
    setIsMusicPlayerOpen: (open: boolean) => void;
    isMusicPlayerMinimized: boolean;
    setIsMusicPlayerMinimized: (minimized: boolean) => void;
    buildingItems: BuildingItem[];
    addBuildingItem: (item: Omit<BuildingItem, 'id' | 'createdAt'>) => void;
    updateBuildingItem: (item: BuildingItem) => void;
    deleteBuildingItem: (id: string) => void;
    itemMessages: ItemMessage[];
    addItemMessage: (msg: Omit<ItemMessage, 'id' | 'createdAt'>) => void;
    itemAttachments: ItemAttachment[];
    addItemAttachment: (att: Omit<ItemAttachment, 'id'>) => void;
    deleteItemAttachment: (id: string) => void;
    companySettings: CompanySettings;
    updateCompanySettings: (settings: CompanySettings) => void;
    approvalRequests: ApprovalRequest[];
    addApprovalRequest: (request: Omit<ApprovalRequest, 'id' | 'status'>) => void;
    approveRequest: (id: string) => void;
    rejectRequest: (id: string, justification: string) => void;
    ecoSites: EcoSite[];
    addEcoSite: (site: Omit<EcoSite, 'id'>) => void;
    deleteEcoSite: (id: string) => void;
    complianceRecords: ComplianceRecord[];
    addComplianceRecord: (record: Omit<ComplianceRecord, 'id' | 'createdAt'>) => void;
    updateComplianceRecord: (record: ComplianceRecord) => void;
    deleteComplianceRecord: (id: string) => void;
    ecoCriatiRecords: EcoCriatiRecord[];
    addEcoCriatiRecord: (record: Omit<EcoCriatiRecord, 'id' | 'createdAt'>) => void;
    deleteEcoCriatiRecord: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    const [history, setHistory] = useState<HistoryLog[]>([]);
    const [financialData, setFinancialData] = useState<FinancialData>({ fixedCosts: [], variableCosts: [], revenues: [], receivables: [] });
    const [operationalData, setOperationalData] = useState<OperationalEvent[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [freightHistory, setFreightHistory] = useState<FreightHistoryItem[]>([]);
    const [freightAnalyses, setFreightAnalyses] = useState<FreightAnalysis[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [fleetData, setFleetData] = useState<Vehicle[]>([]);
    const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
    const [demands, setDemands] = useState<Demand[]>([]);
    const [columnTitles, setColumnTitles] = useState<Record<string, string>>(STATUS_MAP);
    const [isSidebarPinned, setIsSidebarPinned] = useState(true);
    const [isLayoutMode, setIsLayoutMode] = useState(false);
    const [headerBehavior, setHeaderBehavior] = useState<HeaderBehavior>('sticky');
    const [layouts, setLayouts] = useState<Layouts>({});
    const [theme, setTheme] = useState('default');
    const [fontSize, setFontSize] = useState('100%');
    const [fontFamily, setFontFamily] = useState('Segoe UI, sans-serif');
    const [notes, setNotes] = useState<Note[]>([]);
    const [freightSheetData, setFreightSheetData] = useState<Frete[]>([]);
    const [freightColumns, setFreightColumns] = useState<FreightColumn[]>([
        { id: 'Aguardando Alocação', title: 'Aguardando Alocação', color: 'border-yellow-500' },
        { id: 'Em Rota / Coletando', title: 'Em Rota / Coletando', color: 'border-blue-500' },
        { id: 'Em Trânsito', title: 'Em Trânsito', color: 'border-purple-500' },
        { id: 'Pendente de Entrega', title: 'Pendente de Entrega', color: 'border-orange-500' },
        { id: 'Fechamento / Faturamento', title: 'Fechamento / Faturamento', color: 'border-green-500' }
    ]);
    const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
    const [partners, setPartners] = useState<BusinessPartner[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
    const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
    const [isMusicPlayerMinimized, setIsMusicPlayerMinimized] = useState(false);
    const [buildingItems, setBuildingItems] = useState<BuildingItem[]>([]);
    const [itemMessages, setItemMessages] = useState<ItemMessage[]>([]);
    const [itemAttachments, setItemAttachments] = useState<ItemAttachment[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>({ companyName: 'EcoLog Transportes', cnpj: '00.000.000/0001-00', address: '', city: '', state: '', taxRegime: 'Simples Nacional', defaultTaxRate: 6, systemCurrency: 'BRL' });
    const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
    const [ecoSites, setEcoSites] = useState<EcoSite[]>([]);
    const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
    const [ecoCriatiRecords, setEcoCriatiRecords] = useState<EcoCriatiRecord[]>([]);

    // Load initial state
    useEffect(() => {
        const loadData = async () => {
            setFinancialData(await apiService.getData<FinancialData>('portFinancialData', { fixedCosts: [], variableCosts: [], revenues: [], receivables: [] }));
            setCalendarEvents(await apiService.getData<CalendarEvent[]>('portCalendarEvents', []));
            setFreightHistory(await apiService.getData<FreightHistoryItem[]>('portFreightHistory', []));
            setFreightAnalyses(await apiService.getData<FreightAnalysis[]>('ecolog-freight-analyses', []));
            setFleetData(await apiService.getData<Vehicle[]>('portFleetData', []));
            setMaintenanceTasks(await apiService.getData<MaintenanceTask[]>('portMaintenanceTasks', []));
            setNotes(await apiService.getData<Note[]>('portNotes', []));
            setApprovalRequests(await apiService.getData<ApprovalRequest[]>('ecolog-approvals', []));
            setEcoSites(await apiService.getData<EcoSite[]>('ecolog-eco-sites', []));
            setComplianceRecords(await apiService.getData<ComplianceRecord[]>('ecolog-compliance', []));
            setDemands(await apiService.getData<Demand[]>('ecolog-demands', []));
            setColumnTitles(await apiService.getData<Record<string, string>>('ecolog-kanban-columns', STATUS_MAP));
            setOperationalData(await apiService.getData<OperationalEvent[]>('ecolog-operational-data', []));
            setLayouts(await apiService.getData<Layouts>('ecolog-layouts', {}));
            setIsSidebarPinned(await apiService.getData<boolean>('ecolog-sidebar-pinned', true));
            setHeaderBehavior(await apiService.getData<HeaderBehavior>('ecolog-header-behavior', 'sticky'));
            setTheme(await apiService.getData<string>('ecolog-theme', 'default'));
            setFontSize(await apiService.getData<string>('ecolog-font-size', '100%'));
            setFontFamily(await apiService.getData<string>('ecolog-font-family', 'Segoe UI, sans-serif'));
            setFreightSheetData(await apiService.getData<Frete[]>('ecolog-freight-sheet', []));
            setPartners(await apiService.getData<BusinessPartner[]>('ecolog-partners', []));
            setContacts(await apiService.getData<Contact[]>('ecolog-contacts', []));
            setDriveFiles(await apiService.getData<DriveFile[]>('ecolog-drive-files', []));
            setBuildingItems(await apiService.getData<BuildingItem[]>('ecolog-building-items', []));
            setItemMessages(await apiService.getData<ItemMessage[]>('ecolog-building-messages', []));
            setItemAttachments(await apiService.getData<ItemAttachment[]>('ecolog-building-attachments', []));
            setCompanySettings(await apiService.getData<CompanySettings>('ecolog-company-settings', companySettings));
            setHistory(await apiService.getData<HistoryLog[]>('ecolog-history', []));
            setEcoCriatiRecords(await apiService.getData<EcoCriatiRecord[]>('ecolog-criati', []));
        };
        loadData();
    }, []);

    // Effect to apply dynamic CSS variables for theme and typography
    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = THEMES[theme as keyof typeof THEMES] || THEMES.default;
        
        // Apply color palette
        Object.entries(currentTheme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Apply typography
        root.style.fontSize = fontSize;
        root.style.setProperty('--font-family-main', fontFamily);
        document.body.style.fontFamily = fontFamily;

        // Persist UI preferences
        apiService.saveData('ecolog-theme', theme);
        apiService.saveData('ecolog-font-size', fontSize);
        apiService.saveData('ecolog-font-family', fontFamily);
        apiService.saveData('ecolog-sidebar-pinned', isSidebarPinned);
        apiService.saveData('ecolog-header-behavior', headerBehavior);
    }, [theme, fontSize, fontFamily, isSidebarPinned, headerBehavior]);

    useEffect(() => { apiService.saveData('ecolog-demands', demands); }, [demands]);
    useEffect(() => { apiService.saveData('ecolog-history', history); }, [history]);
    useEffect(() => { apiService.saveData('ecolog-criati', ecoCriatiRecords); }, [ecoCriatiRecords]);

    const checkPermission = (user: any, tabId: TabId): boolean => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        for (const section of SIDEBAR_MENU_STRUCTURE) {
            const item = section.items.find(i => i.id === tabId);
            if (item) {
                if (section.roles && !section.roles.includes(user.role)) return false;
                if (section.sectors && !section.sectors.includes(user.sector)) return false;
                if (item.roles && !item.roles.includes(user.role)) return false;
                if (item.sectors && !item.sectors.includes(user.sector)) return false;
                return true;
            }
        }
        return true;
    };

    const logAction = (content: string) => {
        const newLog: HistoryLog = { id: `log-${Date.now()}`, type: 'system', content, timestamp: new Date().toISOString() };
        setHistory(prev => [newLog, ...prev]);
        chatService.logActionToFirebase('system', content);
    };

    const value: AppState = {
        activeTab, setActiveTab, checkPermission, financialData, updateFinancialData: async (type, data) => { setFinancialData(p => ({...p, [type]: data})); await apiService.saveData('portFinancialData', {...financialData, [type]: data}); },
        addRecord: async (type, record) => { const d = await apiService.addFinancialRecord(type, record); setFinancialData(d); logAction(`Adicionado: ${record.name}`); },
        deleteRecord: async (type, id) => { const d = await apiService.deleteFinancialRecord(type, id); setFinancialData(d); },
        markAsPaid: async (id) => { const d = await apiService.markReceivableAsPaid(id); setFinancialData(d); },
        history, logAction, clearHistory: () => { setHistory([]); chatService.clearHistoryInFirebase(); },
        operationalData, setOperationalData,
        calendarEvents, addCalendarEvent: async (e) => setCalendarEvents(await apiService.addCalendarEvent(e)), completeCalendarEvent: async (id, j) => setCalendarEvents(await apiService.completeCalendarEvent(id, j)), updateCalendarEvent: async (e) => setCalendarEvents(await apiService.updateCalendarEvent(e)),
        freightHistory, addFreightQuotation: async (q) => setFreightHistory(await apiService.addFreightQuotation(q)), deleteFreightQuotation: async (id) => setFreightHistory(await apiService.deleteFreightQuotation(id)),
        freightAnalyses, addFreightAnalysis: async (a) => setFreightAnalyses(await apiService.addFreightAnalysis(a)), deleteFreightAnalysis: async (id) => setFreightAnalyses(await apiService.deleteFreightAnalysis(id)),
        notifications, addNotification: (n) => { const id = Date.now(); setNotifications(p => [...p, {...n, id}]); setTimeout(() => setNotifications(p => p.filter(x => x.id !== id)), 5000); }, dismissNotification: (id) => setNotifications(p => p.filter(x => x.id !== id)),
        fleetData, addVehicle: async (v) => setFleetData(await apiService.addVehicle(v)), updateVehicle: async (v) => setFleetData(await apiService.updateVehicle(v)), deleteVehicle: async (id) => setFleetData(await apiService.deleteVehicle(id)),
        maintenanceTasks, addMaintenanceTask: async (t) => setMaintenanceTasks(await apiService.addMaintenanceTask(t)), updateMaintenanceTask: async (t) => setMaintenanceTasks(await apiService.updateMaintenanceTask(t)), deleteMaintenanceTask: async (id) => setMaintenanceTasks(await apiService.deleteMaintenanceTask(id)),
        demands, setDemands, columnTitles, setColumnTitles, addKanbanColumn: (t) => setColumnTitles(p => ({...p, [t.toLowerCase().replace(/\s+/g, '-')]: t})), removeKanbanColumn: (k) => setColumnTitles(p => { const n = {...p}; delete n[k]; return n; }),
        isSidebarPinned, setIsSidebarPinned, isLayoutMode, setIsLayoutMode, headerBehavior, setHeaderBehavior, layouts, setLayouts, resetLayout: (pid) => setLayouts(p => { const n = {...p}; delete n[pid]; return n; }),
        theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily,
        notes, addNote: async (n) => setNotes(await apiService.addNote(n)), updateNote: async (id, c) => setNotes(await apiService.updateNote(id, c)), deleteNote: async (id) => setNotes(await apiService.deleteNote(id)), toggleNoteLock: async (id) => setNotes(await apiService.toggleNoteLock(id)),
        freightSheetData, addFreightSheetItem: (f) => setFreightSheetData(p => [...p, f]), updateFreightSheetItem: (f) => setFreightSheetData(p => p.map(x => x.id === f.id ? f : x)), deleteFreightSheetItem: (id) => setFreightSheetData(p => p.filter(x => x.id !== id)),
        freightColumns, addFreightColumn: (c) => setFreightColumns(p => [...p, {...c, id: c.title}]), updateFreightColumn: (c) => setFreightColumns(p => p.map(x => x.id === c.id ? c : x)), deleteFreightColumn: (id) => setFreightColumns(p => p.filter(x => x.id !== id)),
        clientNotes, addClientNote: (n) => setClientNotes(p => [...p, n]),
        partners, addPartner: async (p) => { const n = {...p, id: `partner-${Date.now()}`}; setPartners(prev => [...prev, n]); }, updatePartner: (p) => setPartners(prev => prev.map(x => x.id === p.id ? p : x)), deletePartner: (id) => setPartners(prev => prev.filter(x => x.id !== id)),
        contacts, addContact: async (c) => { const n = {...c, id: `contact-${Date.now()}`}; setContacts(p => [...p, n]); }, updateContact: (c) => setContacts(p => p.map(x => x.id === c.id ? c : x)), deleteContact: (id) => setContacts(p => p.filter(x => x.id !== id)),
        driveFiles, uploadFile: (f, fold) => { const n = {id: `f-${Date.now()}`, name: f.name, size: f.size, type: f.type, uploadedAt: new Date().toISOString(), url: URL.createObjectURL(f), folder: fold}; setDriveFiles(p => [n, ...p]); }, deleteFile: (id) => setDriveFiles(p => p.filter(x => x.id !== id)),
        isMusicPlayerOpen, setIsMusicPlayerOpen, isMusicPlayerMinimized, setIsMusicPlayerMinimized,
        buildingItems, addBuildingItem: (i) => setBuildingItems(p => [...p, {...i, id: `b-${Date.now()}`, createdAt: new Date().toISOString()}]), updateBuildingItem: (i) => setBuildingItems(p => p.map(x => x.id === i.id ? i : x)), deleteBuildingItem: (id) => setBuildingItems(p => p.filter(x => x.id !== id)),
        itemMessages, addItemMessage: (m) => setItemMessages(p => [...p, {...m, id: `m-${Date.now()}`, createdAt: new Date().toISOString()}]),
        itemAttachments, addItemAttachment: (a) => setItemAttachments(p => [...p, {...a, id: `a-${Date.now()}`}]), deleteItemAttachment: (id) => setItemAttachments(p => p.filter(x => x.id !== id)),
        companySettings, updateCompanySettings: (s) => setCompanySettings(s),
        approvalRequests, addApprovalRequest: async (r) => setApprovalRequests(await apiService.addApprovalRequest(r)), approveRequest: async (id) => setApprovalRequests(await apiService.updateApprovalStatus(id, 'approved')), rejectRequest: async (id, justification) => setApprovalRequests(await apiService.updateApprovalStatus(id, 'rejected', justification)),
        ecoSites, addEcoSite: async (s) => setEcoSites(await apiService.addEcoSite(s)), deleteEcoSite: async (id) => setEcoSites(await apiService.deleteEcoSite(id)),
        complianceRecords, addComplianceRecord: async (r) => setComplianceRecords(await apiService.addComplianceRecord(r)), updateComplianceRecord: async (r) => setComplianceRecords(await apiService.updateComplianceRecord(r)), deleteComplianceRecord: async (id) => setComplianceRecords(await apiService.deleteComplianceRecord(id)),
        ecoCriatiRecords,
        addEcoCriatiRecord: (r) => setEcoCriatiRecords(p => [{...r, id: `crea-${Date.now()}`, createdAt: new Date().toISOString()}, ...p]),
        deleteEcoCriatiRecord: (id) => setEcoCriatiRecords(p => p.filter(x => x.id !== id))
    };

    return React.createElement(AppContext.Provider, { value }, children);
};

export const useAppStore = (): AppState => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppStore must be used within an AppProvider');
    return context;
};
