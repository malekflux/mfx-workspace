export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type BillingModel = 'monthly' | 'fixed' | 'hourly' | 'retainer';
export type PaymentMethod = 'instapay' | 'bank-transfer' | 'cash' | 'card';
export type PaymentDueMethod = 'split-50-50' | 'due-days';

export interface Client {
  id: string;
  refId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  color?: string;
}

export interface Service {
  id: string;
  name: string;
  nameAr?: string;
  descriptionAr?: string;
  subServicesAr?: string[];
  description?: string;
  subServices?: string[];
  basePrice: number;
  isRecurring?: boolean;
  isVariable?: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  refId: string;
  /** Original external reference used to make one-way imports idempotent. */
  sourceRef?: string;
  services: Service[];
  billingModel: BillingModel;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  /** The schedule agreed for this project. Kept separate from the transfer channel. */
  paymentDueMethod?: PaymentDueMethod;
  /** Calendar days within each month, e.g. [1, 15]. */
  paymentDueDays?: number[];
  /** Legacy first due day, retained for existing Google Sheets rows. */
  paymentDueDay?: number;
  dueMethod?: string;
  contractStartDate: string;
  deadline?: string;
  paymentStatus: PaymentStatus;
  projectStatus: ProjectStatus;
  driveLink?: string;
  accountPIC?: string[];
  notes?: string;
  contractTermsEn?: string;
  contractTermsAr?: string;
  currency: 'EGP' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
  isActive: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  client: Client;
  project: Project;
  services: Service[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  notes?: string;
}

export interface ContractData {
  contractNumber: string;
  date: string;
  client: Client;
  project: Project;
  services: Service[];
  terms: string[];
  startDate: string;
  endDate?: string;
}
