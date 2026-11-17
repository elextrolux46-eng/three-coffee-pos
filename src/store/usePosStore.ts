import { create } from 'zustand';
import {
  CartItem,
  CartModifier,
  CashMovement,
  Order,
  PaymentDetails,
  Product,
  ScreenType,
  ShiftData,
  UserProfile,
  UserRole,
} from '../types';
import { THREE_COFFEE_PRODUCTS } from '../data/mockData';

interface PosState {
  currentScreen: ScreenType;
  tableNumber: string;
  orderType: 'DINE_IN' | 'TAKE_AWAY';
  cashierName: string;
  selectedCategory: 'ALL' | 'BEST_COFFEE' | 'NON_COFFEE';
  searchQuery: string;

  // Products State
  products: Product[];
  addProduct: (newProduct: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;

  // User Auth & Role State
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  loginUser: (role: UserRole, pin: string) => { success: boolean; message?: string };
  switchUser: (userId: string) => void;

  // Printer State
  printerConnected: boolean;
  togglePrinterConnection: () => void;

  // Cart
  cart: CartItem[];
  customizingProduct: Product | null;
  editingCartItem: CartItem | null;

  // Table Modal
  isTableModalVisible: boolean;

  // Completed Orders & Current Active Order
  completedOrders: Order[];
  currentOrder: Order | null;

  // Shift & Cash Management
  currentShift: ShiftData;
  isQrisModalVisible: boolean;

  // Actions
  setScreen: (screen: ScreenType) => void;
  setTableNumber: (table: string) => void;
  setOrderType: (type: 'DINE_IN' | 'TAKE_AWAY') => void;
  setSelectedCategory: (cat: 'ALL' | 'BEST_COFFEE' | 'NON_COFFEE') => void;
  setSearchQuery: (query: string) => void;
  setTableModalVisible: (visible: boolean) => void;

  // Cart Actions
  openCustomizer: (product: Product) => void;
  openCustomizerForEdit: (item: CartItem) => void;
  closeCustomizer: () => void;
  addToCart: (product: Product, modifier: CartModifier, unitPrice: number) => void;
  updateCartItemModifier: (
    oldCartItemId: string,
    product: Product,
    modifier: CartModifier,
    unitPrice: number
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;

  // Checkout Actions
  processPayment: (payment: PaymentDetails) => void;
  setQrisModalVisible: (visible: boolean) => void;

  // Shift & Cash Actions
  addCashMovement: (type: 'CASH_IN' | 'CASH_OUT', category: string, amount: number, note: string) => void;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-karyawan',
    name: 'Budi (Kasir/Barista)',
    role: 'KARYAWAN',
    pin: '0000',
  },
  {
    id: 'usr-owner',
    name: 'Pak Hendra (Owner)',
    role: 'OWNER',
    pin: '1234',
  },
];

export const usePosStore = create<PosState>((set, get) => ({
  currentScreen: 'DASHBOARD',
  tableNumber: '04',
  orderType: 'DINE_IN',
  cashierName: 'Budi (Kasir)',
  selectedCategory: 'ALL',
  searchQuery: '',

  // Products initialized with isAvailable = true
  products: THREE_COFFEE_PRODUCTS.map((p) => ({ ...p, isAvailable: true })),

  addProduct: (newProduct) => {
    const id = `prod-cust-${Date.now()}`;
    const productWithId: Product = { ...newProduct, id, isAvailable: true };
    set((state) => ({ products: [productWithId, ...state.products] }));
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  toggleProductAvailability: (id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
      ),
    }));
  },

  // Auth & Roles
  currentUser: DEFAULT_USERS[0],
  availableUsers: DEFAULT_USERS,

  loginUser: (role, pin) => {
    const { availableUsers } = get();
    const target = availableUsers.find((u) => u.role === role);
    if (!target) return { success: false, message: 'User tidak ditemukan' };

    if (target.pin === pin) {
      set({
        currentUser: target,
        cashierName: target.name,
      });
      return { success: true };
    }
    return { success: false, message: `PIN salah! PIN default: ${role === 'OWNER' ? '1234' : '0000'}` };
  },

  switchUser: (userId) => {
    const { availableUsers } = get();
    const target = availableUsers.find((u) => u.id === userId);
    if (target) {
      set({
        currentUser: target,
        cashierName: target.name,
      });
    }
  },

  // Printer Simulation
  printerConnected: true,
  togglePrinterConnection: () => {
    set((state) => ({ printerConnected: !state.printerConnected }));
  },

  cart: [
    {
      cartItemId: 'prod-kps-arn-ICED-def-100%',
      product: THREE_COFFEE_PRODUCTS.find((p) => p.sku === 'KPS')!,
      quantity: 1,
      unitPrice: 10000,
      subtotal: 10000,
      modifier: { temperature: 'ICED', sweetness: '100%' },
    },
    {
      cartItemId: 'prod-bsc-ICED-def-100%',
      product: THREE_COFFEE_PRODUCTS.find((p) => p.sku === 'BSC')!,
      quantity: 1,
      unitPrice: 12000,
      subtotal: 12000,
      modifier: { temperature: 'ICED', sweetness: '100%' },
    },
    {
      cartItemId: 'prod-tea-lmn-ICED-def-100%',
      product: THREE_COFFEE_PRODUCTS.find((p) => p.sku === 'LMT')!,
      quantity: 1,
      unitPrice: 5000,
      subtotal: 5000,
      modifier: { temperature: 'ICED', sweetness: '100%' },
    },
  ],
  customizingProduct: null,
  editingCartItem: null,
  isTableModalVisible: false,

  completedOrders: [
    {
      id: 'ord-init-01',
      orderNumber: 'TRX-0127',
      tableNumber: '02',
      orderType: 'DINE_IN',
      cashierName: 'Budi (Kasir)',
      items: [
        {
          cartItemId: 'kps-init',
          product: THREE_COFFEE_PRODUCTS.find((p) => p.sku === 'KPS')!,
          quantity: 2,
          unitPrice: 10000,
          subtotal: 20000,
          modifier: { temperature: 'ICED', sweetness: '100%' },
        },
      ],
      subtotal: 20000,
      total: 20000,
      payment: {
        method: 'QRIS_PHYSICAL',
        amountDue: 20000,
        amountReceived: 20000,
        change: 0,
        status: 'PAID',
      },
      timestamp: '14:20',
    },
  ],
  currentOrder: null,

  currentShift: {
    shiftId: 'SFT-20261116-01',
    cashierName: 'Budi (Kasir)',
    openedAt: '08:00',
    openingCashFloat: 200000,
    cashSales: 1450000,
    qrisSales: 2100000,
    bankTransferSales: 1300000,
    totalTransactions: 128,
    totalItemsSold: 312,
    cashMovements: [
      {
        id: 'csh-1',
        type: 'CASH_OUT',
        category: 'RAW_MATERIAL',
        amount: 30000,
        note: 'Beli Es Batu Kristal 3 pack',
        timestamp: '10:15',
      },
      {
        id: 'csh-2',
        type: 'CASH_OUT',
        category: 'RAW_MATERIAL',
        amount: 70000,
        note: 'Susu UHT Fresh 4 liter',
        timestamp: '12:30',
      },
      {
        id: 'csh-3',
        type: 'CASH_OUT',
        category: 'OPERATIONAL',
        amount: 50000,
        note: 'Air Galon 2 buah',
        timestamp: '14:00',
      },
    ],
  },
  isQrisModalVisible: false,

  setScreen: (screen) => set({ currentScreen: screen }),
  setTableNumber: (table) => set({ tableNumber: table, isTableModalVisible: false }),
  setOrderType: (type) => set({ orderType: type }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTableModalVisible: (visible) => set({ isTableModalVisible: visible }),

  openCustomizer: (product) => set({ customizingProduct: product, editingCartItem: null }),
  openCustomizerForEdit: (item) => set({ customizingProduct: item.product, editingCartItem: item }),
  closeCustomizer: () => set({ customizingProduct: null, editingCartItem: null }),

  addToCart: (product, modifier, unitPrice) => {
    const { cart } = get();
    const cartItemId = `${product.id}-${modifier.temperature}-${modifier.strength || 'def'}-${modifier.sweetness}${modifier.notes ? '-' + modifier.notes : ''}`;
    const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].subtotal = updatedCart[existingIndex].quantity * unitPrice;
      set({ cart: updatedCart, customizingProduct: null, editingCartItem: null });
    } else {
      const newItem: CartItem = {
        cartItemId,
        product,
        quantity: 1,
        unitPrice,
        subtotal: unitPrice,
        modifier,
      };
      set({ cart: [...cart, newItem], customizingProduct: null, editingCartItem: null });
    }
  },

  updateCartItemModifier: (oldCartItemId, product, modifier, unitPrice) => {
    const { cart } = get();
    const newCartItemId = `${product.id}-${modifier.temperature}-${modifier.strength || 'def'}-${modifier.sweetness}${modifier.notes ? '-' + modifier.notes : ''}`;

    const updated = cart.map((item) => {
      if (item.cartItemId === oldCartItemId) {
        return {
          ...item,
          cartItemId: newCartItemId,
          unitPrice,
          subtotal: item.quantity * unitPrice,
          modifier,
        };
      }
      return item;
    });

    set({ cart: updated, customizingProduct: null, editingCartItem: null });
  },

  updateQuantity: (cartItemId, delta) => {
    const { cart } = get();
    const updated = cart
      .map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.unitPrice,
          };
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    set({ cart: updated });
  },

  clearCart: () => set({ cart: [] }),

  processPayment: (payment) => {
    const { cart, tableNumber, orderType, currentUser, currentShift, completedOrders } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = `TRX-${Date.now().toString().slice(-4)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableNumber,
      orderType,
      cashierName: currentUser.name,
      items: [...cart],
      subtotal,
      total: subtotal,
      payment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update shift metrics
    const updatedShift = { ...currentShift };
    updatedShift.totalTransactions += 1;
    updatedShift.totalItemsSold += cart.reduce((sum, i) => sum + i.quantity, 0);

    if (payment.method === 'CASH') {
      updatedShift.cashSales += payment.amountDue;
    } else if (payment.method === 'QRIS_PHYSICAL') {
      updatedShift.qrisSales += payment.amountDue;
    } else if (payment.method === 'BANK_TRANSFER') {
      updatedShift.bankTransferSales += payment.amountDue;
    }

    set({
      currentOrder: newOrder,
      completedOrders: [newOrder, ...completedOrders],
      cart: [],
      currentShift: updatedShift,
      currentScreen: 'RECEIPT',
    });
  },

  setQrisModalVisible: (visible) => set({ isQrisModalVisible: visible }),

  addCashMovement: (type, category, amount, note) => {
    const { currentShift } = get();
    const newMovement: CashMovement = {
      id: `csh-${Date.now()}`,
      type,
      category,
      amount,
      note,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    set({
      currentShift: {
        ...currentShift,
        cashMovements: [newMovement, ...currentShift.cashMovements],
      },
    });
  },
}));