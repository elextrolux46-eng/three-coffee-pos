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
} from '../types';
import { THREE_COFFEE_PRODUCTS } from '../data/mockData';

interface PosState {
  currentScreen: ScreenType;
  tableNumber: string;
  orderType: 'DINE_IN' | 'TAKE_AWAY';
  cashierName: string;
  selectedCategory: 'ALL' | 'BEST_COFFEE' | 'NON_COFFEE';
  searchQuery: string;

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

export const usePosStore = create<PosState>((set, get) => ({
  currentScreen: 'DASHBOARD',
  tableNumber: '04',
  orderType: 'DINE_IN',
  cashierName: 'Budi',
  selectedCategory: 'ALL',
  searchQuery: '',

  cart: [
    // Default initial mock cart items matching our spec
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

  completedOrders: [],
  currentOrder: null,

  currentShift: {
    shiftId: 'SFT-20261116-01',
    cashierName: 'Budi',
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
    const { cart, tableNumber, orderType, cashierName, currentShift, completedOrders } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = `TRX-${Date.now().toString().slice(-4)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableNumber,
      orderType,
      cashierName,
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
