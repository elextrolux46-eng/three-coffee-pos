export type Category = 'ALL' | 'BEST_COFFEE' | 'NON_COFFEE';

export type Temperature = 'ICED' | 'HOT';
export type StrengthOption = 'NORMAL' | 'STRONG';
export type SweetnessOption = '100%' | '50%' | '0%';

export type UserRole = 'OWNER' | 'KARYAWAN';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  // Extended profile fields
  phone?: string;
  address?: string;
  bankAccount?: string;
  bankName?: string;
  photoUri?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'BEST_COFFEE' | 'NON_COFFEE';
  price: number;
  hasStrengthOption?: boolean;
  strongPrice?: number;
  tag?: string;
  description?: string;
  isAvailable?: boolean;
}

export interface CartModifier {
  temperature: Temperature;
  strength?: StrengthOption;
  sweetness: SweetnessOption;
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  modifier: CartModifier;
}

export type PaymentMethodType = 'CASH' | 'QRIS_PHYSICAL' | 'BANK_TRANSFER';

export interface PaymentDetails {
  method: PaymentMethodType;
  amountDue: number;
  amountReceived: number;
  change: number;
  bankName?: string;
  status: 'PAID';
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  orderType: 'DINE_IN' | 'TAKE_AWAY';
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  payment: PaymentDetails;
  timestamp: string;
}

export interface CashMovement {
  id: string;
  type: 'CASH_IN' | 'CASH_OUT';
  category: string;
  amount: number;
  note: string;
  timestamp: string;
}

export interface ShiftData {
  shiftId: string;
  cashierName: string;
  openedAt: string;
  openingCashFloat: number;
  cashSales: number;
  qrisSales: number;
  bankTransferSales: number;
  totalTransactions: number;
  totalItemsSold: number;
  cashMovements: CashMovement[];
}

export type ScreenType =
  | 'DASHBOARD'
  | 'CUSTOM_MENU'
  | 'POS_ORDER'
  | 'CUSTOMIZER'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'SHIFT_REPORT'
  | 'PROFILE';
