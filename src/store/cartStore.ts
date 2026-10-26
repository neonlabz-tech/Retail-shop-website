'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/cart';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { checkAuthOrRedirect } from '@/store/authStore';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  orderNote: string;
  couponCode: string;
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getFreeShippingRemaining: () => number;
  setOrderNote: (note: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      orderNote: '',
      couponCode: '',
      discount: 0,

      addItem: (item) => {
        if (!checkAuthOrRedirect()) {
          return;
        }

        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              isDrawerOpen: true,
            };
          }

          return { items: [...state.items, item], isDrawerOpen: true };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [], orderNote: '', couponCode: '', discount: 0 }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        return Math.min(subtotal, discount);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      getFreeShippingRemaining: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
      },

      setOrderNote: (note: string) => set({ orderNote: note }),

      applyCoupon: (code: string) => {
        const clean = code.trim().toUpperCase();
        const subtotal = get().getSubtotal();

        if (clean === 'WELCOME10') {
          const discount = Math.round(subtotal * 0.1);
          set({ couponCode: clean, discount });
          return { success: true, message: 'Coupon WELCOME10 applied (10% OFF)!' };
        }

        if (clean === 'RKF500') {
          const discount = 500;
          set({ couponCode: clean, discount });
          return { success: true, message: 'Coupon RKF500 applied (Rs. 500 OFF)!' };
        }

        if (clean === 'SAVE5') {
          const discount = Math.round(subtotal * 0.05);
          set({ couponCode: clean, discount });
          return { success: true, message: 'Coupon SAVE5 applied (5% OFF)!' };
        }

        return { success: false, message: 'Invalid or expired coupon code.' };
      },

      removeCoupon: () => set({ couponCode: '', discount: 0 }),
    }),
    {
      name: 'ambaz-cart',
      partialize: (state) => ({
        items: state.items,
        orderNote: state.orderNote,
        couponCode: state.couponCode,
        discount: state.discount,
      }),
    }
  )
);
