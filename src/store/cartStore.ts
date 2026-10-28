'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/cart';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { checkAuthOrRedirect } from '@/store/authStore';
import { FALLBACK_IMAGE_SRC, normalizeImageSrc } from '@/lib/imageFallback';

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

        const sanitizedItem: CartItem = {
          ...item,
          image: normalizeImageSrc(item.image) || FALLBACK_IMAGE_SRC,
        };

        set((state) => {
          const maxStock = typeof sanitizedItem.stock === 'number' && sanitizedItem.stock > 0 ? sanitizedItem.stock : undefined;
          const isItemMatch = (i: CartItem) =>
            i.productId === sanitizedItem.productId &&
            (
              (sanitizedItem.variantName && i.variantName === sanitizedItem.variantName) ||
              (sanitizedItem.variantId && i.variantId === sanitizedItem.variantId) ||
              (!sanitizedItem.variantName && !sanitizedItem.variantId)
            );

          const existing = state.items.find(isItemMatch);

          if (existing) {
            const effectiveMax = maxStock !== undefined ? maxStock : (typeof existing.stock === 'number' && existing.stock > 0 ? existing.stock : undefined);
            const rawQty = existing.quantity + sanitizedItem.quantity;
            const newQty = effectiveMax !== undefined ? Math.min(effectiveMax, rawQty) : rawQty;
            return {
              items: state.items.map((i) =>
                isItemMatch(i)
                  ? { ...i, ...sanitizedItem, stock: sanitizedItem.stock ?? i.stock, quantity: newQty }
                  : i
              ),
              isDrawerOpen: true,
            };
          }

          const initialQty = maxStock !== undefined ? Math.min(maxStock, sanitizedItem.quantity) : sanitizedItem.quantity;
          return { items: [...state.items, { ...sanitizedItem, quantity: initialQty }], isDrawerOpen: true };
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
          items: state.items.map((i) => {
            if (i.productId === productId && i.variantId === variantId) {
              const maxStock = typeof i.stock === 'number' && i.stock > 0 ? i.stock : undefined;
              const finalQty = maxStock !== undefined ? Math.min(maxStock, quantity) : quantity;
              return { ...i, quantity: finalQty };
            }
            return i;
          }),
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
      merge: (persistedState: any, currentState: CartState) => {
        const persistedItems = Array.isArray(persistedState?.items) ? persistedState.items : [];
        const sanitizedItems = persistedItems.map((item: any) => ({
          ...item,
          image: normalizeImageSrc(item?.image) || FALLBACK_IMAGE_SRC,
        }));
        return {
          ...currentState,
          ...persistedState,
          items: sanitizedItems,
        };
      },
    }
  )
);
