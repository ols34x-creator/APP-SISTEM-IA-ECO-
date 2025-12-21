
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
  mentions?: string[]; 
}

export interface Frete {
  id: string;
  operador: string;
  cliente: string;
  data: string;
  horario: string;
  di_br: string;
  referencia: string;
  container: string;
  free_time: string;
  peso: number;
  cargoType?: string;
  cargoVolume?: number;
  terminal: string;
  tipo: string;
  destino: string;
  motorista: string;
  cavalo: string;
  carreta: string;
  cte: string;
  vrFrete: number;
  obs: string;
  status: string;
  cardColor?: string;
  attachments?: Attachment[];
  comments?: Comment[];
  lastStatusChange?: number;
}

export type RecordType = 'fixedCosts' | 'variableCosts' | 'revenues' | 'receivables';

export interface FinancialRecord {
    id: number;
    name: string;
    description: string;
    category: string;
    value: number;
    date: string;
    attachment?: string;
    observation?: string;
    type: RecordType;
}

export interface RevenueRecord extends FinancialRecord {
    client: string;
}

export interface ReceivableRecord extends FinancialRecord {
    client: string;
    dueDate: string;
    status: 'pending' | 'paid';
}

export interface FinancialData {
    fixedCosts: FinancialRecord[];
    variableCosts: FinancialRecord[];
    revenues: RevenueRecord[];
    receivables: ReceivableRecord[];
}

export interface HistoryLog {
    id: string;
    type: string;
    content: string;
    timestamp: string;
}

export interface OperationalEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
}

export type TabId = 'dashboard' | 'operational-calendar' | 'eco-sis' | 'transactions' | 'receipts' | 'financial-entries' | 'faturamento-receita' | 'custos-fixos' | 'custos-variaveis' | 'advnc-contabil' | 'general-approvals' | 'analytical-dashboard' | 'operational-report' | 'cost-radar' | 'account-delays' | 'interest-reports' | 'reimbursement' | 'freight-quotation' | 'freight-sheet' | 'briefing' | 'briefing-feedback' | 'fleet-control' | 'port-checklist' | 'cte-reader' | 'container-receipt' | 'gestao-predial' | 'registration-control' | 'compliance' | 'eco-sites' | 'eco-files' | 'eco-drive' | 'eco-ia' | 'ocr-reader' | 'history' | 'user-management' | 'collaborator-registration' | 'eco-note' | 'eco-agenda' | 'dados-gerais-pg' | 'conexao' | 'eco-criati' | 'futuro-debitos' | 'eco-play' | 'eco-branding';

export interface CalendarEvent {
    id: number;
    description: string;
    value: number;
    dueDate: string;
    status: 'pending' | 'completed';
    justification?: string;
    completionDate?: string;
    reminderMinutes?: number;
}

export interface HistoryItem {
    id: string;
    origin: string;
    destination: string;
    price: number;
    date: string;
}

export type VehicleStatus = 'Operacional' | 'Em Manutenção' | 'Inativo';

export interface Vehicle {
    id: string;
    plate: string;
    model: string;
    year: number;
    driver: string;
    status: VehicleStatus;
}

export type MaintenanceStatus = 'Agendada' | 'Concluída';

export interface MaintenanceTask {
    id: string;
    vehicleId: string;
    serviceType: string;
    date: string;
    cost: number;
    notes: string;
    status: MaintenanceStatus;
}

export enum Urgency {
    Baixa = 'Baixa',
    Media = 'Média',
    Alta = 'Alta',
    Critica = 'Crítica'
}

export type DemandStatus = 'demandas' | 'analise' | 'cotacao' | 'aprovacao' | 'execucao' | 'concluido' | 'faturado';

export interface Photo {
    id: string;
    src: string;
    name: string;
}

export interface Demand {
    id: string;
    client: string;
    contact: string;
    service: string;
    setor: string;
    urgencia: string; 
    prazo: string;
    responsavel: string;
    emailAviso: string;
    celAviso: string;
    photos: Photo[];
    attachments: Attachment[];
    comments?: Comment[]; 
    attentionTo?: string[]; 
    dateStart?: string;
    dateEnd?: string;
    timeStart?: string;
    timeEnd?: string;
    status: DemandStatus;
    date: string;
}

export const STATUS_MAP: Record<string, string> = {
    'demandas': 'Demandas',
    'analise': 'Em Análise',
    'cotacao': 'Cotação',
    'aprovacao': 'Aprovação',
    'execucao': 'Execução',
    'concluido': 'Concluído',
    'faturado': 'Faturado'
};

export const STATUS_ICON_MAP: Record<string, string> = {
    'demandas': 'fa-inbox',
    'analise': 'fa-search',
    'cotacao': 'fa-dollar-sign',
    'aprovacao': 'fa-check-circle',
    'execucao': 'fa-cogs',
    'concluido': 'fa-flag-checkered',
    'faturado': 'fa-file-invoice-dollar'
};

export const STATUS_COLOR_MAP: Record<string, string> = {
    'demandas': 'border-gray-500',
    'analise': 'border-blue-500',
    'cotacao': 'border-yellow-500',
    'aprovacao': 'border-purple-500',
    'execucao': 'border-orange-500',
    'concluido': 'border-green-500',
    'faturado': 'border-teal-500'
};

export const DEMANDA_STATUSES: DemandStatus[] = ['demandas', 'analise', 'cotacao', 'aprovacao', 'execucao', 'concluido', 'faturado'];

export interface Note {
    id: string;
    content: string;
    color: 'yellow' | 'pink' | 'blue' | 'green';
    timestamp: string;
    isLocked?: boolean;
}

export type ContactCategory = 'Red' | 'Black' | 'Blue' | 'Green';

export interface Contact {
    id: string;
    name: string;
    phone: string;
    email: string;
    category: ContactCategory;
    nextAppointment?: string;
}

export interface BuildingItem {
    id: string;
    description: string;
    location: string;
    createdAt: string;
}

export interface ItemMessage {
    id: string;
    itemId: string;
    message: string;
    createdAt: string;
}

export interface ItemAttachment {
    id: string;
    itemId: string;
    fileName: string;
    fileType: 'foto' | 'video' | 'documento';
    fileContent: string;
    mimeType: string;
}

export interface DriveFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
    url: string;
    folder?: string;
}

export interface CompanySettings {
    companyName: string;
    cnpj: string;
    address: string;
    city: string;
    state: string;
    taxRegime: string;
    defaultTaxRate: number;
    systemCurrency: string;
}

export interface FreightAnalysis {
    id: string;
    createdAt: string;
    clientName: string;
    cnpj: string;
    origin: string;
    destination: string;
    serviceType: string;
    totalKm: number;
    totalValue: number;
    pricePerKm: number;
    data: any;
}

export interface ClientNote {
    id: string;
    clientName: string;
    text: string;
    date: string;
}

export interface Client {
    id: string;
    name: string;
}

export type StatusOperacional = string;

export interface FreightColumn {
    id: string;
    title: string;
    color: string;
}

export interface CustomField {
    id: string;
    label: string;
    value: string;
}

export interface BusinessPartner {
    id: string;
    type: 'Cliente' | 'Oficina' | 'Fornecedor' | 'Prestador';
    name: string;
    document: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    notes: string;
    status: 'Ativo' | 'Inativo';
    customFields?: CustomField[];
}

export interface Layouts {
    [key: string]: string[];
}

export type HeaderBehavior = 'sticky' | 'scroll';

export interface AppNotification {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
}

export type ApprovalType = 'Serviço' | 'Peças' | 'Roupas' | 'Pagamento' | 'Outros';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
    id: string;
    type: ApprovalType;
    description: string;
    value: number;
    requester: string;
    date: string;
    status: ApprovalStatus;
    justification?: string;
}

export interface EcoSite {
    id: string;
    title: string;
    url: string;
}

export type ComplianceType = 'Segurança' | 'Meio Ambiente' | 'Ética' | 'Procedimental' | 'Legal';
export type ComplianceSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type ComplianceStatus = 'Pendente' | 'Em Análise' | 'Resolvido' | 'Arquivado';

export interface ComplianceRecord {
    id: string;
    title: string;
    type: ComplianceType;
    severity: ComplianceSeverity;
    status: ComplianceStatus;
    description: string;
    observation?: string;
    date: string;
    responsible: string;
    involvedPerson?: string;
    attachments?: Attachment[];
    createdAt: string;
}

export type Role = 'Admin' | 'User';
export type Sector = 'OpsMind' | 'FlowCapital' | 'NeuroTech' | 'IdeaForge';

export interface User {
    id: string;
    name: string;
    email?: string;
    matricula: string;
    phone: string;
    role: Role;
    sector: Sector;
    password?: string;
    photoUrl?: string;
    isOnline?: boolean; 
}

export enum VehicleModel {
    Truck = 'Truck',
    PickupTruck = 'PickupTruck',
    Van = 'Van',
}

export type CollaboratorStatus = 'Ativo' | 'Férias' | 'Afastado' | 'Desligado';

export interface Collaborator {
    id: string;
    fullName: string;
    cpf: string;
    rg: string;
    birthDate: string;
    gender: string;
    maritalStatus: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    admissionDate: string;
    position: string;
    sector: string;
    salary: number;
    contractType: string;
    status: CollaboratorStatus;
    bankName: string;
    agency: string;
    accountNumber: string;
    pixKey: string;
    photoUrl?: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    timestamp: any;
}

export interface GenericRecord {
    id: string;
    tipo: string;
    titulo: string;
    conteudo: string;
}

export interface EcoCriatiRecord {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    customFields: CustomField[];
    createdAt: string;
}
