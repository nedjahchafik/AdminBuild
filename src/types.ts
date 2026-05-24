export type UserRole = 'admin' | 'treasurer' | 'resident';
export type Lang = 'fr' | 'ar';

export interface ResidentInfo {
  name: string;
  phone: string;
  isOwner: boolean; // true = Propriétaire, false = Locataire
  isVacant: boolean; // true for guard apartment (apt 40) or others if empty
}

export interface Apartment {
  number: number;
  floor: number;
  resident: ResidentInfo;
}

export interface MonthlyPayment {
  apartmentNumber: number;
  isPaid: boolean;
  paymentDate?: string;
  note?: string;
  collectedBy?: string;
  isLate?: boolean;       // Indique si le paiement est en retard / impayé en retard
  isPaidLate?: boolean;   // Indique si le paiement a été réglé en retard
}

export interface MonthCycle {
  id: string; // e.g. "2026-05"
  nameFr: string; // e.g. "Mai 2026"
  nameAr: string; // e.g. "ماي 2026"
  baseAmount: number; // 500 DZD
  payments: MonthlyPayment[];
}

export interface ExtraContributionPayment {
  apartmentNumber: number;
  amountPaid: number; // up to targetAmount
  paymentDate?: string;
}

export interface ExtraContribution {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  targetAmountPerAppt: number; // e.g. 1500 DZD
  deadline: string;
  payments: ExtraContributionPayment[];
}

export interface Expense {
  id: string;
  amount: number;
  category: 'ascenseur' | 'nettoyage' | 'electricite' | 'plomberie' | 'reparations' | 'securite' | 'maintenance' | 'autres';
  date: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  approvedBy: string;
  provider: string; // Maintenance agency or individual
  receiptUrl?: string; // Simulated file preview base64 or static icon
}

export interface Announcement {
  id: string;
  titleFr: string;
  titleAr: string;
  contentFr: string;
  contentAr: string;
  date: string;
  category: 'info' | 'travaux' | 'urgence' | 'reunion';
  author: string;
}

export interface Incident {
  id: string;
  apartmentNumber: number;
  title: string;
  description: string;
  category: 'ascenseur' | 'eau' | 'electricite' | 'proprete' | 'bruit' | 'securite' | 'autres';
  priority: 'basse' | 'moyenne' | 'haute';
  status: 'ouvert' | 'encours' | 'resolu';
  date: string;
  reporterName: string;
  photoUrl?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  cost: number;
  provider: string;
  status: string;
  beforePhoto?: string;
  afterPhoto?: string;
}

export interface DocumentFile {
  id: string;
  titleFr: string;
  titleAr: string;
  category: 'contrat' | 'facture' | 'compte_rendu' | 'reglement';
  uploadDate: string;
  fileSize: string;
  url?: string;
}
