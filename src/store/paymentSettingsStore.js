import { create } from 'zustand';

const initialPaymentOptions = [
  {
    id: 'pay-opt-01',
    name: 'Cashfree Payments Gateway',
    description: 'Cards, NetBanking, and UPI Intent checkout with instant driver payout settlements',
    provider: 'Cashfree',
    status: 'Active',
    priority: 0,
    imageUrl: 'https://images.seeklogo.com/logo-png/43/1/cashfree-payments-logo-png_seeklogo-434057.png',
    environment: 'sandbox', // 'sandbox' | 'production'
    // Pay-In Credentials (Gateway)
    payInEnabled: true,
    payInSandboxAppId: 'TEST1029384756abcdef12345678',
    payInSandboxSecret: 'cfsk_ma_test_9876543210fedcba9876543210',
    payInProdAppId: '',
    payInProdSecret: '',
    // Pay-Out Credentials (Driver Bank & UPI Settlements)
    payOutEnabled: true,
    payOutSandboxClientId: 'PO_TEST_998877665544',
    payOutSandboxSecret: 'cfsk_payout_test_1234567890abcdef',
    payOutProdClientId: '',
    payOutProdSecret: '',
  },
  {
    id: 'pay-opt-02',
    name: 'Razorpay Payments Gateway',
    description: 'Standard Checkout, Credit/Debit cards, UPI, and RazorpayX driver payouts',
    provider: 'Razorpay',
    status: 'Active',
    priority: 1,
    imageUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-razorpay-logo-icon-download-in-svg-png-gif-file-formats--payment-gateway-brand-logos-pack-icons-5228801.png',
    environment: 'sandbox',
    payInEnabled: true,
    payInSandboxAppId: 'rzp_test_1DP5mmOlF5G5ag',
    payInSandboxSecret: 'rzp_sec_test_9876543210fedcba',
    payInProdAppId: '',
    payInProdSecret: '',
    payOutEnabled: true,
    payOutSandboxClientId: 'acc_test_razorpayx_001',
    payOutSandboxSecret: 'rzpx_sec_test_1234567890abcdef',
    payOutProdClientId: '',
    payOutProdSecret: '',
  },
];

const STORAGE_KEY = 'maat_payment_methods_v4';

const loadInitialOptions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse payment options:', e);
  }
  return initialPaymentOptions;
};

export const usePaymentSettingsStore = create((set, get) => ({
  paymentOptions: loadInitialOptions(),

  addPaymentOption: (optionData) => {
    const newOption = {
      id: `pay-opt-${Date.now()}`,
      priority: get().paymentOptions.length,
      status: optionData.status || 'Active',
      environment: optionData.environment || 'sandbox',
      provider: optionData.provider || 'Cashfree',
      payInEnabled: optionData.payInEnabled ?? true,
      payOutEnabled: optionData.payOutEnabled ?? false,
      ...optionData,
    };
    const updated = [...get().paymentOptions, newOption];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ paymentOptions: updated });
    return newOption;
  },

  updatePaymentOption: (id, updates) => {
    const updated = get().paymentOptions.map((opt) =>
      opt.id === id ? { ...opt, ...updates } : opt
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ paymentOptions: updated });
  },

  deletePaymentOption: (id) => {
    const updated = get().paymentOptions.filter((opt) => opt.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ paymentOptions: updated });
  },

  togglePaymentOptionStatus: (id) => {
    const updated = get().paymentOptions.map((opt) =>
      opt.id === id
        ? { ...opt, status: opt.status === 'Active' ? 'Inactive' : 'Active' }
        : opt
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ paymentOptions: updated });
  },

  movePriority: (id, direction) => {
    const options = [...get().paymentOptions].sort((a, b) => a.priority - b.priority);
    const index = options.findIndex((o) => o.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = options[index - 1];
      const tempP = options[index].priority;
      options[index].priority = prev.priority;
      prev.priority = tempP;
    } else if (direction === 'down' && index < options.length - 1) {
      const next = options[index + 1];
      const tempP = options[index].priority;
      options[index].priority = next.priority;
      next.priority = tempP;
    }

    const reordered = [...options].sort((a, b) => a.priority - b.priority);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered));
    set({ paymentOptions: reordered });
  },

  resetToDefaults: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPaymentOptions));
    set({ paymentOptions: initialPaymentOptions });
  },
}));
