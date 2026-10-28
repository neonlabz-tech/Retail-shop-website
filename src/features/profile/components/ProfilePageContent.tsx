'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatPrice';
import { FALLBACK_IMAGE_SRC, handleImageError } from '@/lib/imageFallback';

interface OrderItem {
  productId?: string;
  name: string;
  slug?: string;
  image?: string;
  sku?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderAddress {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
}

interface StatusHistoryItem {
  status: string;
  changedAt: string | Date;
  note?: string;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  statusHistory?: StatusHistoryItem[];
  notes?: string;
  cancelReason?: string;
  createdAt: string | Date;
}

/* ── Status Helper Utilities ── */
function getStatusBadge(status: string) {
  const s = status?.toLowerCase() || 'pending';
  switch (s) {
    case 'delivered':
      return {
        label: 'Delivered',
        bg: 'bg-[#ecfdf5]',
        text: 'text-[#047857]',
        border: 'border-[#a7f3d0]',
        dot: 'bg-[#10b981]',
      };
    case 'shipped':
    case 'out_for_delivery':
      return {
        label: s === 'out_for_delivery' ? 'Out for Delivery' : 'In Transit',
        bg: 'bg-[#eff6ff]',
        text: 'text-[#1d4ed8]',
        border: 'border-[#bfdbfe]',
        dot: 'bg-[#3b82f6]',
      };
    case 'processing':
      return {
        label: 'Processing',
        bg: 'bg-[#f5f3ff]',
        text: 'text-[#6d28d9]',
        border: 'border-[#ddd6fe]',
        dot: 'bg-[#8b5cf6]',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bg: 'bg-[#fef2f2]',
        text: 'text-[#b91c1c]',
        border: 'border-[#fecaca]',
        dot: 'bg-[#ef4444]',
      };
    case 'pending':
    default:
      return {
        label: 'Order Placed',
        bg: 'bg-[#fffbeb]',
        text: 'text-[#b45309]',
        border: 'border-[#fde68a]',
        dot: 'bg-[#f59e0b]',
      };
  }
}

function formatDate(dateValue?: string | Date) {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(dateValue);
  }
}

function formatDateTime(dateValue?: string | Date) {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    return `${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} at ${d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return String(dateValue);
  }
}

export function ProfilePageContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'track' | 'history'>('overview');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<OrderData | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Inline Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
    setEditPhone(user?.phone || '');
    setProfileError(null);
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileError(null);
  };

  // Address Management State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const handleStartAddAddress = () => {
    setEditingAddressIndex(null);
    setAddressForm({
      label: 'Home',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Sri Lanka',
      isDefault: !user?.addresses || user.addresses.length === 0,
    });
    setAddressError(null);
    setIsAddingAddress(true);
  };

  const handleStartEditAddress = (index: number) => {
    const addr = user?.addresses?.[index];
    if (!addr) return;
    setIsAddingAddress(false);
    setAddressForm({
      label: addr.label || 'Home',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Sri Lanka',
      isDefault: Boolean(addr.isDefault),
    });
    setAddressError(null);
    setEditingAddressIndex(index);
  };

  const handleCancelAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddressIndex(null);
    setAddressError(null);
  };

  const handleSaveAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!addressForm.line1.trim()) {
      setAddressError('Street address is required.');
      return;
    }
    if (!addressForm.city.trim()) {
      setAddressError('City is required.');
      return;
    }

    setSavingAddress(true);
    setAddressError(null);
    try {
      const payload = isAddingAddress
        ? { action: 'add_address', address: addressForm }
        : { action: 'edit_address', index: editingAddressIndex, address: addressForm };

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save address');
      }
      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }
      setIsAddingAddress(false);
      setEditingAddressIndex(null);
      setActionNotice(isAddingAddress ? 'New delivery address added successfully.' : 'Delivery address updated successfully.');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (index: number) => {
    setSavingAddress(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_default_address', index }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update default address');
      }
      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }
      setActionNotice('Primary default address updated.');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setActionNotice(err.message || 'Failed to set default address');
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    setSavingAddress(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_address', index }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete address');
      }
      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }
      setActionNotice('Delivery address removed.');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setActionNotice(err.message || 'Failed to delete address');
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          phone: editPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }
      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }
      setIsEditingProfile(false);
      setActionNotice('Your personal details have been updated successfully.');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // 1. Not delivered orders (pending, processing, in transit)
  const undeliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status?.toLowerCase() !== 'delivered');
  }, [orders]);

  // 2. Delivered orders (completed past history)
  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status?.toLowerCase() === 'delivered');
  }, [orders]);

  // Sync selectedTrackOrder with undeliveredOrders
  useEffect(() => {
    if (undeliveredOrders.length > 0) {
      if (!selectedTrackOrder || !undeliveredOrders.some((o) => o._id === selectedTrackOrder._id)) {
        setSelectedTrackOrder(undeliveredOrders[0]);
      }
    } else if (selectedTrackOrder !== null) {
      setSelectedTrackOrder(null);
    }
  }, [undeliveredOrders, selectedTrackOrder]);

  // Fetch orders for customer
  const fetchCustomerOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          // Default track order to the latest not delivered order
          const notDelivered = data.orders.filter(
            (o: OrderData) => o.status?.toLowerCase() !== 'delivered'
          );
          setSelectedTrackOrder(notDelivered[0] || null);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerOrders();
    }
  }, [isAuthenticated, fetchCustomerOrders]);


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[1.6rem] text-[#666666]">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const defaultAddress =
    Array.isArray(user.addresses) && user.addresses.length > 0
      ? user.addresses.find((a: any) => a.isDefault) || user.addresses[0]
      : null;

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen">
      {/* ── Executive Header & Greeting Banner ── */}
      <div className="bg-white border-b border-slate-200/80 py-[2.8rem] sm:py-[3.6rem] px-[1.6rem]">
        <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-[1.8rem]">
          <div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-[0.8rem] text-[1.2rem] sm:text-[1.3rem] text-slate-500 mb-[0.8rem]">
              <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">Customer Account</span>
            </div>
            
            <div className="flex items-center gap-[1.2rem] flex-wrap">
              <h1 className="text-[2.4rem] sm:text-[3rem] font-bold text-slate-900 tracking-tight">
                Welcome back, {user.firstName || fullName.split(' ')[0]}
              </h1>
              <span className="inline-flex items-center gap-[0.5rem] px-[1rem] py-[0.3rem] rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[1.15rem] font-semibold">
                <span className="w-[0.7rem] h-[0.7rem] rounded-full bg-emerald-500 animate-pulse" />
                Verified Customer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-[1rem] sm:gap-[1.2rem] flex-wrap">
            <Link
              href="/shop"
              className="inline-flex items-center gap-[0.7rem] px-[1.8rem] py-[1rem] rounded-[0.8rem] bg-slate-900 text-white text-[1.3rem] font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Explore Shop</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-[1.2rem] sm:px-[1.6rem] pt-[2.5rem] sm:pt-[3.5rem] pb-[6rem] sm:pb-[8rem]">
        <div className="grid grid-cols-1 lg:grid-cols-[30rem_1fr] gap-[2.4rem] sm:gap-[3rem] items-start">
          {/* ── Left Sidebar / Executive Account Hub ── */}
          <aside className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[2.2rem_1.8rem] sm:p-[2.6rem_2.2rem] shadow-[0_2px_12px_rgba(15,23,42,0.03)] lg:sticky lg:top-[2rem]">
            {/* User Profile Monogram */}
            <div className="relative w-[7.5rem] h-[7.5rem] mx-auto mb-[1.4rem]">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white text-[2.8rem] font-bold rounded-full flex items-center justify-center shadow-md ring-4 ring-slate-100">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-[0.2rem] right-[0.2rem] w-[1.8rem] h-[1.8rem] rounded-full bg-emerald-500 border-3 border-white shadow-xs" title="Online & Active" />
            </div>

            <div className="text-center">
              <h2 className="text-[1.8rem] sm:text-[2rem] font-bold text-slate-900 tracking-tight">{fullName}</h2>
              <p className="text-[1.3rem] text-slate-500 break-all mt-[0.2rem]">{user.email}</p>
              {user.phone && (
                <p className="text-[1.25rem] text-slate-500 mt-[0.2rem] flex items-center justify-center gap-[0.5rem]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{user.phone}</span>
                </p>
              )}

              <div className="mt-[1rem]">
                <span className="inline-flex items-center px-[1.2rem] py-[0.35rem] rounded-full bg-slate-100 text-slate-700 text-[1.15rem] font-semibold uppercase tracking-[0.05em] border border-slate-200/60">
                  {user.role === 'admin' ? 'Administrator' : 'Customer Account'}
                </span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 my-[2rem]" />

            {/* Interactive Quick Stat Tiles */}
            <div className="grid grid-cols-2 gap-[1rem] mb-[1.8rem]">
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`text-left p-[1.2rem_1rem] rounded-[1rem] border transition-all cursor-pointer group ${
                  activeTab === 'track'
                    ? 'bg-blue-50/60 border-blue-200 shadow-xs'
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-[0.4rem]">
                  <span className="text-[1.15rem] font-semibold group-hover:text-slate-900 transition-colors">In Transit</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <span className="block text-[2rem] font-bold text-slate-900">
                  {loadingOrders ? '…' : undeliveredOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`text-left p-[1.2rem_1rem] rounded-[1rem] border transition-all cursor-pointer group ${
                  activeTab === 'history'
                    ? 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-[0.4rem]">
                  <span className="text-[1.15rem] font-semibold group-hover:text-slate-900 transition-colors">Delivered</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="block text-[2rem] font-bold text-slate-900">
                  {loadingOrders ? '…' : deliveredOrders.length}
                </span>
              </button>
            </div>

            {/* Concierge Assistance Box */}
            <div className="bg-slate-50/70 border border-slate-200/60 rounded-[1rem] p-[1.2rem_1.4rem] mb-[1.8rem] text-left">
              <div className="flex items-center gap-[0.7rem] text-slate-800 text-[1.25rem] font-bold mb-[0.3rem]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Need Assistance?</span>
              </div>
              <p className="text-[1.15rem] text-slate-500 leading-relaxed mb-[0.8rem]">
                Have inquiries about your shipments, sizing, or returns?
              </p>
              <Link
                href="/pages/contact"
                className="text-[1.2rem] font-semibold text-slate-900 hover:text-blue-600 inline-flex items-center gap-[0.4rem] transition-colors"
              >
                <span>Contact Concierge</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-[0.9rem] py-[1rem] text-[1.3rem] font-semibold transition-all duration-200 flex items-center justify-center gap-[0.8rem] cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </aside>

          {/* ── Right Content Area ── */}
          <main className="min-w-0">
            {/* Top Segmented Tab Switcher */}
            <div className="bg-slate-100/90 p-[0.5rem] rounded-[1.2rem] border border-slate-200/80 flex items-center gap-[0.6rem] mb-[2.5rem] overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-[0.9rem] px-[1.6rem] rounded-[0.8rem] text-[1.35rem] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-[0.7rem] ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Personal Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`py-[0.9rem] px-[1.6rem] rounded-[0.8rem] text-[1.35rem] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-[0.7rem] ${
                  activeTab === 'track'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Track Current Order</span>
                {undeliveredOrders.length > 0 && (
                  <span className="text-[1.1rem] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-[0.7rem] py-[0.15rem] rounded-full flex items-center gap-[0.4rem]">
                    <span className="w-[0.55rem] h-[0.55rem] rounded-full bg-emerald-500 animate-ping" />
                    {undeliveredOrders.length} In Transit
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-[0.9rem] px-[1.6rem] rounded-[0.8rem] text-[1.35rem] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-[0.7rem] ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Past Order History</span>
                {deliveredOrders.length > 0 && (
                  <span className="text-[1.1rem] bg-slate-200/80 text-slate-700 font-bold px-[0.7rem] py-[0.15rem] rounded-full">
                    {deliveredOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TAB 1: PERSONAL DETAILS (ONLY CUSTOMER DETAILS)
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-[2rem]">
                {/* Action Notice Alert */}
                {actionNotice && (
                  <div className="p-[1.4rem_1.8rem] bg-emerald-50 border border-emerald-200 rounded-[1.2rem] text-[1.35rem] text-emerald-800 font-semibold flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-[0.8rem]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{actionNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActionNotice(null)}
                      className="text-emerald-600 hover:text-emerald-900 text-[1.4rem] p-[0.4rem] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* 1. Account Identity & Credentials */}
                <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[2rem_1.8rem] sm:p-[2.8rem_3rem] shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between pb-[1.8rem] border-b border-slate-100 mb-[2rem] gap-[1.2rem] flex-wrap">
                    <div className="flex items-center gap-[1.2rem]">
                      <div className="w-[4rem] h-[4rem] rounded-[1rem] bg-slate-100 text-slate-800 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[1.8rem] sm:text-[2rem] font-bold text-slate-900 tracking-tight">Personal Identity</h3>
                        <p className="text-[1.25rem] sm:text-[1.35rem] text-slate-500">Your profile details and primary contact channels.</p>
                      </div>
                    </div>

                    {!isEditingProfile ? (
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="inline-flex items-center gap-[0.7rem] px-[1.5rem] py-[0.75rem] rounded-[0.8rem] bg-slate-900 hover:bg-slate-800 text-white text-[1.25rem] font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-[0.8rem]">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={savingProfile}
                          className="px-[1.4rem] py-[0.7rem] rounded-[0.8rem] border border-slate-300 text-slate-700 hover:bg-slate-100 text-[1.25rem] font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="inline-flex items-center gap-[0.6rem] px-[1.6rem] py-[0.7rem] rounded-[0.8rem] bg-emerald-600 hover:bg-emerald-700 text-white text-[1.25rem] font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {savingProfile ? (
                            <>
                              <span className="w-[1.2rem] h-[1.2rem] border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Error Message */}
                  {profileError && (
                    <div className="mb-[1.8rem] p-[1.2rem_1.6rem] bg-rose-50 border border-rose-200 rounded-[1rem] text-[1.3rem] text-rose-700 flex items-center gap-[0.8rem]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.6rem]">
                    {/* First Name */}
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-[1rem] p-[1.4rem_1.6rem]">
                      <label htmlFor="edit-first-name" className="block text-[1.15rem] font-semibold text-slate-500 uppercase tracking-[0.05em] mb-[0.4rem]">
                        First Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          id="edit-first-name"
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          placeholder="First Name"
                          className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-[1.5rem] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                        />
                      ) : (
                        <span className="text-[1.5rem] sm:text-[1.6rem] font-semibold text-slate-900">{user.firstName || '—'}</span>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-[1rem] p-[1.4rem_1.6rem]">
                      <label htmlFor="edit-last-name" className="block text-[1.15rem] font-semibold text-slate-500 uppercase tracking-[0.05em] mb-[0.4rem]">
                        Last Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          id="edit-last-name"
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          placeholder="Last Name"
                          className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-[1.5rem] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                        />
                      ) : (
                        <span className="text-[1.5rem] sm:text-[1.6rem] font-semibold text-slate-900">{user.lastName || '—'}</span>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-[1rem] p-[1.4rem_1.6rem]">
                      <div className="flex items-center justify-between mb-[0.4rem]">
                        <span className="text-[1.15rem] font-semibold text-slate-500 uppercase tracking-[0.05em]">Email Address</span>
                        <span className="text-[1.05rem] font-semibold text-emerald-700 bg-emerald-50 px-[0.6rem] py-[0.1rem] rounded-full border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      {isEditingProfile ? (
                        <div>
                          <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full bg-slate-100/90 border border-slate-200 rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-[1.45rem] font-medium text-slate-500 cursor-not-allowed select-none"
                          />
                          <p className="text-[1.1rem] text-slate-400 mt-[0.4rem]">Primary account login email</p>
                        </div>
                      ) : (
                        <span className="text-[1.45rem] sm:text-[1.55rem] font-semibold text-slate-900 break-all">{user.email}</span>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-[1rem] p-[1.4rem_1.6rem]">
                      <label htmlFor="edit-phone" className="block text-[1.15rem] font-semibold text-slate-500 uppercase tracking-[0.05em] mb-[0.4rem]">
                        Phone Number
                      </label>
                      {isEditingProfile ? (
                        <input
                          id="edit-phone"
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="e.g. 077 123 4567"
                          className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-[1.45rem] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                        />
                      ) : (
                        <span className="text-[1.45rem] sm:text-[1.55rem] font-semibold text-slate-900">{user.phone || '—'}</span>
                      )}
                    </div>
                  </div>

                  {/* Mobile & Bottom Action Buttons when editing */}
                  {isEditingProfile && (
                    <div className="flex items-center justify-end gap-[1rem] mt-[2rem] pt-[1.8rem] border-t border-slate-100 flex-wrap">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={savingProfile}
                        className="px-[1.6rem] py-[0.8rem] rounded-[0.8rem] border border-slate-300 text-slate-700 hover:bg-slate-100 text-[1.3rem] font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="inline-flex items-center gap-[0.7rem] px-[2rem] py-[0.8rem] rounded-[0.8rem] bg-slate-900 hover:bg-slate-800 text-white text-[1.3rem] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {savingProfile ? (
                          <>
                            <span className="w-[1.4rem] h-[1.4rem] border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Multi-Address Delivery Manager */}
                <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[2rem_1.8rem] sm:p-[2.8rem_3rem] shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between pb-[1.8rem] border-b border-slate-100 mb-[2rem] gap-[1.2rem] flex-wrap">
                    <div className="flex items-center gap-[1.2rem]">
                      <div className="w-[4rem] h-[4rem] rounded-[1rem] bg-slate-100 text-slate-800 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[1.8rem] sm:text-[2rem] font-bold text-slate-900 tracking-tight">Saved Delivery Addresses</h3>
                        <p className="text-[1.25rem] sm:text-[1.35rem] text-slate-500">Manage multiple delivery destinations (Home, Office, etc.) for quick checkout.</p>
                      </div>
                    </div>

                    {!isAddingAddress && (
                      <button
                        type="button"
                        onClick={handleStartAddAddress}
                        className="inline-flex items-center gap-[0.7rem] px-[1.5rem] py-[0.75rem] rounded-[0.8rem] bg-slate-900 hover:bg-slate-800 text-white text-[1.25rem] font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Address Error Alert */}
                  {addressError && (
                    <div className="mb-[1.8rem] p-[1.2rem_1.6rem] bg-rose-50 border border-rose-200 rounded-[1rem] text-[1.3rem] text-rose-700 flex items-center gap-[0.8rem]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{addressError}</span>
                    </div>
                  )}

                  {/* ADD NEW ADDRESS INLINE FORM */}
                  {isAddingAddress && (
                    <form onSubmit={handleSaveAddress} className="mb-[2.4rem] bg-slate-50 border border-slate-200 rounded-[1.2rem] p-[2rem] sm:p-[2.4rem]">
                      <div className="flex items-center justify-between pb-[1.4rem] border-b border-slate-200/80 mb-[1.8rem]">
                        <h4 className="text-[1.6rem] font-bold text-slate-900">Add New Address</h4>
                        <span className="text-[1.2rem] text-slate-500">All fields required for shipping</span>
                      </div>

                      <div className="space-y-[1.6rem]">
                        {/* Address Label Pills */}
                        <div>
                          <label className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.6rem]">
                            Address Type / Label
                          </label>
                          <div className="flex items-center gap-[0.8rem] flex-wrap">
                            {['Home', 'Office', 'Warehouse', 'Other'].map((lbl) => (
                              <button
                                key={lbl}
                                type="button"
                                onClick={() => setAddressForm((f) => ({ ...f, label: lbl }))}
                                className={`px-[1.4rem] py-[0.6rem] rounded-full text-[1.25rem] font-semibold transition-all cursor-pointer ${
                                  addressForm.label.toLowerCase() === lbl.toLowerCase()
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Street Line 1 */}
                        <div>
                          <label htmlFor="add-line1" className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                            Street Address *
                          </label>
                          <input
                            id="add-line1"
                            type="text"
                            required
                            placeholder="e.g. No. 45, Temple Road"
                            value={addressForm.line1}
                            onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Line 2 (Apartment, Suite, Unit) */}
                        <div>
                          <label htmlFor="add-line2" className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                            Apartment, suite, unit (optional)
                          </label>
                          <input
                            id="add-line2"
                            type="text"
                            placeholder="e.g. Floor 2, Apt 3"
                            value={addressForm.line2}
                            onChange={(e) => setAddressForm((f) => ({ ...f, line2: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* City, State & Postal Code */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1.2rem]">
                          <div>
                            <label htmlFor="add-city" className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                              City *
                            </label>
                            <input
                              id="add-city"
                              type="text"
                              required
                              placeholder="e.g. Jaffna or Colombo"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                              className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label htmlFor="add-postal" className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                              Postal Code
                            </label>
                            <input
                              id="add-postal"
                              type="text"
                              placeholder="e.g. 40000"
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                              className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label htmlFor="add-country" className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                              Country
                            </label>
                            <input
                              id="add-country"
                              type="text"
                              value={addressForm.country}
                              onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                              className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        {/* Set as Default Checkbox */}
                        <label className="flex items-center gap-[0.8rem] pt-[0.4rem] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                            className="w-[1.8rem] h-[1.8rem] rounded text-slate-900 focus:ring-slate-900"
                          />
                          <span className="text-[1.35rem] font-medium text-slate-800">
                            Set as primary default address for orders
                          </span>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-[1rem] mt-[2rem] pt-[1.6rem] border-t border-slate-200">
                        <button
                          type="button"
                          onClick={handleCancelAddressForm}
                          disabled={savingAddress}
                          className="px-[1.6rem] py-[0.8rem] rounded-[0.8rem] border border-slate-300 text-slate-700 hover:bg-slate-100 text-[1.3rem] font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="inline-flex items-center gap-[0.7rem] px-[2.2rem] py-[0.8rem] rounded-[0.8rem] bg-emerald-600 hover:bg-emerald-700 text-white text-[1.3rem] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {savingAddress ? (
                            <>
                              <span className="w-[1.4rem] h-[1.4rem] border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              <span>Saving Address...</span>
                            </>
                          ) : (
                            <>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Save Address</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SAVED ADDRESSES LIST */}
                  {Array.isArray(user.addresses) && user.addresses.length > 0 ? (
                    <div className="space-y-[1.6rem]">
                      {user.addresses.map((addr: any, idx: number) => {
                        const isEditingThis = editingAddressIndex === idx;

                        if (isEditingThis) {
                          return (
                            <form key={idx} onSubmit={handleSaveAddress} className="bg-slate-50 border-2 border-slate-900/40 rounded-[1.2rem] p-[2rem] sm:p-[2.4rem]">
                              <div className="flex items-center justify-between pb-[1.4rem] border-b border-slate-200/80 mb-[1.8rem]">
                                <h4 className="text-[1.6rem] font-bold text-slate-900">Edit {addr.label || 'Delivery'} Address</h4>
                                <span className="text-[1.2rem] text-slate-500">Address #{idx + 1}</span>
                              </div>

                              <div className="space-y-[1.6rem]">
                                <div>
                                  <label className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.6rem]">
                                    Address Type / Label
                                  </label>
                                  <div className="flex items-center gap-[0.8rem] flex-wrap">
                                    {['Home', 'Office', 'Warehouse', 'Other'].map((lbl) => (
                                      <button
                                        key={lbl}
                                        type="button"
                                        onClick={() => setAddressForm((f) => ({ ...f, label: lbl }))}
                                        className={`px-[1.4rem] py-[0.6rem] rounded-full text-[1.25rem] font-semibold transition-all cursor-pointer ${
                                          addressForm.label.toLowerCase() === lbl.toLowerCase()
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                      >
                                        {lbl}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label htmlFor={`edit-line1-${idx}`} className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                                    Street Address *
                                  </label>
                                  <input
                                    id={`edit-line1-${idx}`}
                                    type="text"
                                    required
                                    value={addressForm.line1}
                                    onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))}
                                    className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div>
                                  <label htmlFor={`edit-line2-${idx}`} className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                                    Apartment, suite, unit (optional)
                                  </label>
                                  <input
                                    id={`edit-line2-${idx}`}
                                    type="text"
                                    value={addressForm.line2}
                                    onChange={(e) => setAddressForm((f) => ({ ...f, line2: e.target.value }))}
                                    className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1.2rem]">
                                  <div>
                                    <label htmlFor={`edit-city-${idx}`} className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                                      City *
                                    </label>
                                    <input
                                      id={`edit-city-${idx}`}
                                      type="text"
                                      required
                                      value={addressForm.city}
                                      onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                                      className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor={`edit-postal-${idx}`} className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                                      Postal Code
                                    </label>
                                    <input
                                      id={`edit-postal-${idx}`}
                                      type="text"
                                      value={addressForm.postalCode}
                                      onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                                      className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor={`edit-country-${idx}`} className="block text-[1.15rem] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-[0.4rem]">
                                      Country
                                    </label>
                                    <input
                                      id={`edit-country-${idx}`}
                                      type="text"
                                      value={addressForm.country}
                                      onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                                      className="w-full bg-white border border-slate-300 rounded-[0.8rem] px-[1.2rem] py-[0.85rem] text-[1.45rem] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    />
                                  </div>
                                </div>

                                <label className="flex items-center gap-[0.8rem] pt-[0.4rem] cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={addressForm.isDefault}
                                    onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                                    className="w-[1.8rem] h-[1.8rem] rounded text-slate-900 focus:ring-slate-900"
                                  />
                                  <span className="text-[1.35rem] font-medium text-slate-800">
                                    Set as primary default address for orders
                                  </span>
                                </label>
                              </div>

                              <div className="flex items-center justify-end gap-[1rem] mt-[2rem] pt-[1.6rem] border-t border-slate-200">
                                <button
                                  type="button"
                                  onClick={handleCancelAddressForm}
                                  disabled={savingAddress}
                                  className="px-[1.6rem] py-[0.8rem] rounded-[0.8rem] border border-slate-300 text-slate-700 hover:bg-slate-100 text-[1.3rem] font-semibold transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={savingAddress}
                                  className="inline-flex items-center gap-[0.7rem] px-[2.2rem] py-[0.8rem] rounded-[0.8rem] bg-emerald-600 hover:bg-emerald-700 text-white text-[1.3rem] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                  {savingAddress ? (
                                    <>
                                      <span className="w-[1.4rem] h-[1.4rem] border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                      <span>Saving...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                      <span>Update Address</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className={`border rounded-[1.2rem] p-[2rem_2.2rem] transition-all ${
                              addr.isDefault
                                ? 'bg-blue-50/20 border-blue-200 shadow-xs ring-1 ring-blue-100'
                                : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-[1.2rem] border-b border-slate-200/60 mb-[1.2rem] gap-[1rem] flex-wrap">
                              <div className="flex items-center gap-[0.8rem] flex-wrap">
                                <span className="text-[1.2rem] font-bold text-slate-800 uppercase tracking-[0.06em] bg-white px-[1rem] py-[0.35rem] rounded-full border border-slate-200 shadow-2xs">
                                  {addr.label || 'Home'}
                                </span>
                                {addr.isDefault ? (
                                  <span className="inline-flex items-center gap-[0.4rem] px-[1rem] py-[0.35rem] rounded-full bg-blue-50 text-blue-700 text-[1.15rem] font-semibold border border-blue-200">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    <span>Default Address</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetDefaultAddress(idx)}
                                    disabled={savingAddress}
                                    className="text-[1.2rem] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer disabled:opacity-50"
                                  >
                                    Set as Default
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-[1.2rem]">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditAddress(idx)}
                                  disabled={savingAddress}
                                  className="inline-flex items-center gap-[0.5rem] text-[1.25rem] font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(idx)}
                                  disabled={savingAddress}
                                  className="inline-flex items-center gap-[0.5rem] text-[1.25rem] font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-[0.6rem] text-[1.35rem] sm:text-[1.4rem] text-slate-700">
                              <p className="flex items-start gap-[0.8rem]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-[0.3rem] text-slate-400 flex-shrink-0">
                                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                                <span>
                                  <strong>Street:</strong> {addr.line1}
                                  {addr.line2 ? `, ${addr.line2}` : ''}
                                </span>
                              </p>
                              <p className="flex items-start gap-[0.8rem]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-[0.3rem] text-slate-400 flex-shrink-0">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="2" y1="12" x2="22" y2="12" />
                                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                <span>
                                  <strong>City / Country:</strong> {addr.city}
                                  {addr.postalCode ? ` (${addr.postalCode})` : ''}, {addr.country || 'Sri Lanka'}
                                </span>
                              </p>
                              {user.phone && (
                                <p className="flex items-start gap-[0.8rem]">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-[0.3rem] text-slate-400 flex-shrink-0">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  <span><strong>Contact Phone:</strong> {user.phone}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    !isAddingAddress && (
                      <div className="bg-slate-50/60 border border-dashed border-slate-300 rounded-[1.2rem] p-[3.2rem_2rem] text-center">
                        <div className="w-[4.8rem] h-[4.8rem] rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-[1.2rem]">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <h4 className="text-[1.6rem] font-bold text-slate-800 mb-[0.4rem]">No delivery addresses saved yet</h4>
                        <p className="text-[1.3rem] text-slate-500 max-w-[440px] mx-auto mb-[1.8rem]">
                          Save your Home, Office, or secondary delivery addresses here for 1-click checkout.
                        </p>
                        <button
                          type="button"
                          onClick={handleStartAddAddress}
                          className="inline-flex items-center gap-[0.7rem] px-[2rem] py-[0.9rem] rounded-[0.8rem] bg-slate-900 hover:bg-slate-800 text-white text-[1.3rem] font-semibold transition-all shadow-xs cursor-pointer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Add Your First Address</span>
                        </button>
                      </div>
                    )
                  )}
                </div>

                {/* 3. Account Information & Security Notice */}
                <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[2rem_1.8rem] sm:p-[2.6rem_3rem] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[1.6rem]">
                  <div className="flex items-center gap-[1.2rem]">
                    <div className="w-[4rem] h-[4rem] rounded-[1rem] bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[1.5rem] font-bold text-slate-900">Protected Account Security</h4>
                      <p className="text-[1.25rem] text-slate-500">Your account data and saved order information are encrypted and protected.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-[1.4rem] text-[1.25rem] text-slate-600">
                    <span className="font-semibold text-slate-900">{orders.length} Total Orders Recorded</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 2: TRACK CURRENT ORDER (NOT DELIVERED ORDERS ONLY)
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'track' && (
              <div className="space-y-[2rem]">
                {/* Active Orders Switcher (if user has multiple ongoing orders) */}
                {undeliveredOrders.length > 1 && (
                  <div className="bg-white border border-slate-200/80 rounded-[1.2rem] p-[1.4rem_1.8rem] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-[1.2rem]">
                    <div className="flex items-center gap-[0.8rem] flex-wrap">
                      <span className="text-[1.25rem] sm:text-[1.3rem] font-bold text-slate-800 flex items-center gap-[0.6rem]">
                        <span className="w-[0.7rem] h-[0.7rem] rounded-full bg-blue-600 animate-pulse" />
                        Active Shipments ({undeliveredOrders.length}):
                      </span>
                      <div className="flex items-center gap-[0.8rem] flex-wrap">
                        {undeliveredOrders.map((o) => {
                          const isSelected = selectedTrackOrder?._id === o._id;
                          const badge = getStatusBadge(o.status);
                          return (
                            <button
                              key={o._id}
                              type="button"
                              onClick={() => setSelectedTrackOrder(o)}
                              className={`text-[1.2rem] px-[1.3rem] py-[0.55rem] rounded-full font-semibold transition-all cursor-pointer flex items-center gap-[0.6rem] ${
                                isSelected
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                              }`}
                            >
                              <span className={`w-[0.65rem] h-[0.65rem] rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                              <span className="font-mono">#{o.orderNumber}</span>
                              <span className="text-[1.1rem] opacity-80 font-normal">({badge.label})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loadingOrders ? (
                  <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[5rem_2rem] text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                    <div className="w-[3.6rem] h-[3.6rem] border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-[1.4rem]" />
                    <p className="text-[1.45rem] font-medium text-slate-600">Retrieving live shipment telemetry...</p>
                  </div>
                ) : selectedTrackOrder && selectedTrackOrder.status?.toLowerCase() !== 'delivered' ? (
                  /* Selected Not Delivered Order Tracker Display */
                  <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[2rem_1.8rem] sm:p-[2.8rem_3rem] shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-[2.8rem]">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[1.6rem] pb-[2.2rem] border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-[1rem] flex-wrap">
                          <h3 className="text-[2rem] sm:text-[2.2rem] font-bold text-slate-900 tracking-tight font-mono">
                            #{selectedTrackOrder.orderNumber}
                          </h3>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedTrackOrder.orderNumber)}
                            className="p-[0.5rem_0.8rem] rounded-[0.6rem] bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-[1.15rem] font-medium transition-colors cursor-pointer flex items-center gap-[0.4rem]"
                            title="Copy Order ID"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>{copiedOrder ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <span className={`text-[1.15rem] font-bold px-[1.1rem] py-[0.3rem] rounded-full border uppercase tracking-wider flex items-center gap-[0.5rem] ${
                            getStatusBadge(selectedTrackOrder.status).bg
                          } ${getStatusBadge(selectedTrackOrder.status).text} ${getStatusBadge(selectedTrackOrder.status).border}`}>
                            <span className={`w-[0.6rem] h-[0.6rem] rounded-full ${getStatusBadge(selectedTrackOrder.status).dot} animate-pulse`} />
                            {getStatusBadge(selectedTrackOrder.status).label}
                          </span>
                        </div>
                        <p className="text-[1.25rem] sm:text-[1.35rem] text-slate-500 mt-[0.5rem] flex items-center gap-[0.6rem]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>Placed on {formatDateTime(selectedTrackOrder.createdAt)}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right pt-[1.2rem] sm:pt-0 border-t sm:border-t-0 border-slate-100 flex flex-col sm:items-end">
                        <span className="block text-[1.15rem] text-slate-500 uppercase tracking-[0.05em] font-semibold">Total Invoice</span>
                        <span className="block text-[2rem] sm:text-[2.4rem] font-bold text-slate-900 tracking-tight mt-[0.1rem]">
                          {formatPrice(selectedTrackOrder.total)}
                        </span>
                        <span className="inline-block mt-[0.3rem] text-[1.15rem] text-slate-600 bg-slate-100 px-[0.8rem] py-[0.2rem] rounded-full">
                          {selectedTrackOrder.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                        </span>

                      </div>
                    </div>

                    {/* Visual Progress Stepper for Not Delivered Order */}
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-[1.4rem] p-[2.2rem_1.6rem] sm:p-[2.6rem_2.4rem]">
                      <div className="flex items-center justify-between mb-[2rem]">
                        <h4 className="text-[1.5rem] sm:text-[1.6rem] font-bold text-slate-900 tracking-tight flex items-center gap-[0.7rem]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 14 14" />
                          </svg>
                          <span>Shipment Journey</span>
                        </h4>
                        <span className="text-[1.2rem] text-slate-500 font-medium">Estimated 2–4 Business Days</span>
                      </div>

                      {(() => {
                        const status = selectedTrackOrder.status?.toLowerCase() || 'pending';
                        const isCancelled = status === 'cancelled';

                        if (isCancelled) {
                          return (
                            <div className="p-[2.4rem] bg-rose-50 border border-rose-200 rounded-[1rem] text-center">
                              <div className="w-[4.4rem] h-[4.4rem] bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-[1rem]">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </div>
                              <h5 className="text-[1.6rem] font-bold text-rose-900">This Order Was Cancelled</h5>
                              <p className="text-[1.3rem] text-rose-700 mt-[0.4rem] max-w-[480px] mx-auto">
                                {selectedTrackOrder.cancelReason || 'If you need help regarding this cancellation, please contact our concierge team.'}
                              </p>
                            </div>
                          );
                        }

                        const step2Done = ['processing', 'shipped', 'out_for_delivery'].includes(status);
                        const step3Done = ['shipped', 'out_for_delivery'].includes(status);

                        return (
                          <div className="relative pt-[0.8rem] pb-[0.8rem]">
                            <div className="grid grid-cols-4 relative gap-[0.6rem] sm:gap-[1rem]">
                              {/* Background Connector Bar */}
                              <div className="absolute top-[1.8rem] sm:top-[2.2rem] left-[12.5%] right-[12.5%] h-[3px] bg-slate-200 z-0" />
                              {/* Active Progress Fill */}
                              <div
                                className="absolute top-[1.8rem] sm:top-[2.2rem] left-[12.5%] h-[3px] bg-slate-900 transition-all duration-500 z-0"
                                style={{
                                  width: step3Done
                                    ? '50%'
                                    : step2Done
                                    ? '25%'
                                    : '0%',
                                }}
                              />

                              {/* Step 1: Order Placed */}
                              <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-[3.6rem] h-[3.6rem] sm:w-[4.4rem] sm:h-[4.4rem] rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs ring-4 ring-white">
                                  <svg className="w-[1.6rem] h-[1.6rem] sm:w-[1.8rem] sm:h-[1.8rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                                <span className="text-[1.2rem] sm:text-[1.35rem] font-bold text-slate-900 mt-[0.9rem] leading-tight">Order Placed</span>
                                <span className="text-[1.1rem] sm:text-[1.2rem] text-slate-500 mt-[0.2rem] leading-tight">
                                  {formatDate(selectedTrackOrder.createdAt)}
                                </span>
                              </div>

                              {/* Step 2: Processing */}
                              <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-[3.6rem] h-[3.6rem] sm:w-[4.4rem] sm:h-[4.4rem] rounded-full flex items-center justify-center font-bold shadow-xs ring-4 ring-white transition-all ${
                                  step2Done
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-400 border-2 border-slate-300'
                                }`}>
                                  {step2Done ? (
                                    <svg className="w-[1.6rem] h-[1.6rem] sm:w-[1.8rem] sm:h-[1.8rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  ) : (
                                    <svg className="w-[1.6rem] h-[1.6rem] sm:w-[1.8rem] sm:h-[1.8rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-[1.2rem] sm:text-[1.35rem] font-bold mt-[0.9rem] leading-tight ${step2Done ? 'text-slate-900' : 'text-slate-400'}`}>
                                  Processing
                                </span>
                                <span className="text-[1.1rem] sm:text-[1.2rem] text-slate-500 mt-[0.2rem] leading-tight">
                                  {step2Done ? 'Verified & Packed' : 'In Fulfillment'}
                                </span>
                              </div>

                              {/* Step 3: Out for Delivery / In Transit */}
                              <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-[3.6rem] h-[3.6rem] sm:w-[4.4rem] sm:h-[4.4rem] rounded-full flex items-center justify-center font-bold shadow-xs ring-4 ring-white transition-all ${
                                  step3Done
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-400 border-2 border-slate-300'
                                }`}>
                                  {step3Done ? (
                                    <svg className="w-[1.6rem] h-[1.6rem] sm:w-[1.8rem] sm:h-[1.8rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  ) : (
                                    <svg className="w-[1.6rem] h-[1.6rem] sm:w-[1.8rem] sm:h-[1.8rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="1" y="3" width="15" height="13" />
                                      <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                                      <circle cx="5.5" cy="18.5" r="2.5" />
                                      <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-[1.2rem] sm:text-[1.35rem] font-bold mt-[0.9rem] leading-tight ${step3Done ? 'text-slate-900' : 'text-slate-400'}`}>
                                  In Transit
                                </span>
                                <span className="text-[1.1rem] sm:text-[1.2rem] text-slate-500 mt-[0.2rem] leading-tight">
                                  {step3Done ? 'With Courier Agent' : 'Awaiting Dispatch'}
                                </span>
                              </div>

                              {/* Step 4: Destination Delivery */}
                              <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-[3.6rem] h-[3.6rem] sm:w-[4.4rem] sm:h-[4.4rem] rounded-full bg-white text-slate-300 border-2 border-slate-300 flex items-center justify-center font-bold shadow-xs ring-4 ring-white">
                                  <svg className="w-[1.6rem] h-[1.6rem] sm:w-[1.8rem] sm:h-[1.8rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                  </svg>
                                </div>
                                <span className="text-[1.2rem] sm:text-[1.35rem] font-bold mt-[0.9rem] text-slate-400 leading-tight">
                                  Delivered
                                </span>
                                <span className="text-[1.1rem] sm:text-[1.2rem] text-slate-400 mt-[0.2rem] leading-tight">
                                  Final Delivery
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Delivery Destination & Payment Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.8rem]">
                      {/* Left: Destination */}
                      <div className="bg-slate-50/70 border border-slate-200/70 rounded-[1.2rem] p-[1.8rem_2rem]">
                        <h4 className="text-[1.45rem] font-bold text-slate-900 mb-[1.2rem] flex items-center gap-[0.7rem]">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>Shipping Destination</span>
                        </h4>
                        <div className="space-y-[0.7rem] text-[1.3rem] sm:text-[1.35rem] text-slate-600 break-words">
                          <p>
                            <span className="text-slate-400 uppercase text-[1.1rem] font-semibold block mb-[0.1rem]">Recipient</span>
                            <span className="font-semibold text-slate-900">{selectedTrackOrder.shippingAddress?.fullName || fullName}</span>
                          </p>
                          <p>
                            <span className="text-slate-400 uppercase text-[1.1rem] font-semibold block mb-[0.1rem]">Address</span>
                            <span>{selectedTrackOrder.shippingAddress?.line1 || defaultAddress?.line1 || '—'}</span>
                          </p>
                          <p>
                            <span className="text-slate-400 uppercase text-[1.1rem] font-semibold block mb-[0.1rem]">City / Country</span>
                            <span>
                              {selectedTrackOrder.shippingAddress?.city || defaultAddress?.city || '—'},{' '}
                              {selectedTrackOrder.shippingAddress?.country || defaultAddress?.country || 'Sri Lanka'}
                            </span>
                          </p>
                          <p>
                            <span className="text-slate-400 uppercase text-[1.1rem] font-semibold block mb-[0.1rem]">Contact Phone</span>
                            <span>{selectedTrackOrder.shippingAddress?.phone || user.phone || '—'}</span>
                          </p>
                          {selectedTrackOrder.notes && (
                            <p className="mt-[1rem] pt-[1rem] border-t border-slate-200/70 text-[1.25rem] text-slate-500">
                              <strong>Delivery Notes:</strong> {selectedTrackOrder.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Payment Breakdown */}
                      <div className="bg-slate-50/70 border border-slate-200/70 rounded-[1.2rem] p-[1.8rem_2rem]">
                        <h4 className="text-[1.45rem] font-bold text-slate-900 mb-[1.2rem] flex items-center gap-[0.7rem]">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                          <span>Billing &amp; Invoice Breakdown</span>
                        </h4>
                        <div className="space-y-[0.8rem] text-[1.3rem] sm:text-[1.35rem]">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-slate-900">{formatPrice(selectedTrackOrder.subtotal)}</span>
                          </div>
                          {selectedTrackOrder.discount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Promotion Discount:</span>
                              <span>-{formatPrice(selectedTrackOrder.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-600">
                            <span>Shipping Fee:</span>
                            <span className="font-semibold text-slate-900">
                              {selectedTrackOrder.shippingFee > 0
                                ? formatPrice(selectedTrackOrder.shippingFee)
                                : ['processing', 'pending', 'confirmed'].includes(selectedTrackOrder.status)
                                ? 'Calculated by Admin'
                                : 'Complimentary'}
                            </span>
                          </div>
                          <div className="h-[1px] bg-slate-200 my-[0.8rem]" />
                          <div className="flex justify-between items-baseline text-[1.5rem] font-bold text-slate-900">
                            <div>
                              <span>Grand Total:</span>
                              {selectedTrackOrder.shippingFee === 0 && ['processing', 'pending', 'confirmed'].includes(selectedTrackOrder.status) && (
                                <span className="block text-[1.1rem] font-normal text-slate-500">(Excl. delivery fee)</span>
                              )}
                            </div>
                            <span className="text-slate-900">{formatPrice(selectedTrackOrder.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div>
                      <div className="flex items-center justify-between mb-[1.4rem]">
                        <h4 className="text-[1.5rem] font-bold text-slate-900 tracking-tight">
                          Items in this Shipment ({selectedTrackOrder.items?.length || 0})
                        </h4>
                        <span className="text-[1.2rem] text-slate-500">All items inspected before dispatch</span>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-[1.2rem] overflow-hidden bg-white">
                        {(selectedTrackOrder.items || []).map((item, idx) => (
                          <div key={idx} className="p-[1.4rem_1.6rem] flex items-center justify-between gap-[1.4rem] hover:bg-slate-50/60 transition-colors">
                            <div className="flex items-center gap-[1.4rem] min-w-0">
                              <div className="w-[4.8rem] h-[4.8rem] rounded-[0.8rem] bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                {item.image ? (
                                  <Image
                                    src={item.image || FALLBACK_IMAGE_SRC}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    onError={handleImageError}
                                  />
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                  </svg>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-[1.35rem] sm:text-[1.45rem] font-bold text-slate-900 truncate">{item.name}</h5>
                                <p className="text-[1.2rem] text-slate-500 mt-[0.2rem]">
                                  Qty: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-[1.45rem] font-bold text-slate-900">
                                {formatPrice(item.subtotal || item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty state when there are NO not delivered orders */
                  <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[5rem_2rem] text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                    <div className="w-[6rem] h-[6rem] rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-[1.8rem]">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <h3 className="text-[2rem] font-bold text-slate-900 mb-[0.6rem] tracking-tight">No Active Shipments in Transit</h3>
                    <p className="text-[1.35rem] sm:text-[1.45rem] text-slate-500 max-w-[500px] mx-auto mb-[2.4rem] leading-relaxed">
                      {deliveredOrders.length > 0
                        ? 'All placed orders have been successfully fulfilled and delivered. You can inspect all delivered orders and receipts in your Past Order History tab.'
                        : 'You do not have any active orders currently being prepared or in transit. Browse our collections to start your order.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-[1.2rem]">
                      {deliveredOrders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('history')}
                          className="inline-flex items-center gap-[0.8rem] bg-slate-900 hover:bg-slate-800 text-white px-[2.2rem] py-[1.1rem] rounded-[0.8rem] text-[1.35rem] font-semibold transition-colors cursor-pointer shadow-sm"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span>Review Delivered Orders</span>
                        </button>
                      )}
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-[0.8rem] bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-[2.2rem] py-[1.1rem] rounded-[0.8rem] text-[1.35rem] font-semibold transition-colors shadow-2xs no-underline cursor-pointer"
                      >
                        <span>Browse Catalog</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 3: PAST ORDER HISTORY (DELIVERED ORDERS ONLY)
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'history' && (
              <div className="space-y-[2rem]">
                {/* Header */}
                <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[2rem_2.2rem] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-[1.2rem]">
                  <div>
                    <h3 className="text-[1.8rem] sm:text-[2rem] font-bold text-slate-900 tracking-tight">Delivered Order Receipts</h3>
                    <p className="text-[1.25rem] sm:text-[1.35rem] text-slate-500 mt-[0.2rem]">
                      Review itemized receipts, delivery records, and invoices for your completed purchases.
                    </p>
                  </div>
                  <div className="flex items-center gap-[0.8rem]">
                    <span className="text-[1.2rem] sm:text-[1.25rem] font-semibold px-[1.2rem] py-[0.5rem] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-[0.6rem]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{deliveredOrders.length} Fulfilled Purchase{deliveredOrders.length !== 1 ? 's' : ''}</span>
                    </span>
                  </div>
                </div>

                {/* Delivered Orders List */}
                {loadingOrders ? (
                  <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[5rem_2rem] text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                    <div className="w-[3.6rem] h-[3.6rem] border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-[1.4rem]" />
                    <p className="text-[1.45rem] font-medium text-slate-600">Loading your delivered order history...</p>
                  </div>
                ) : deliveredOrders.length > 0 ? (
                  <div className="space-y-[1.6rem]">
                    {deliveredOrders.map((order) => {
                      const isExpanded = expandedOrderId === order._id;
                      const badge = getStatusBadge(order.status);

                      return (
                        <div
                          key={order._id}
                          className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-[1.4rem] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-md transition-all"
                        >
                          {/* Card Top Bar */}
                          <div className="p-[1.6rem_2rem] sm:p-[1.8rem_2.4rem] bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-[1rem]">
                            <div className="flex items-center gap-[1rem] sm:gap-[1.4rem] flex-wrap">
                              <span className="text-[1.6rem] font-bold text-slate-900 font-mono tracking-tight">
                                #{order.orderNumber}
                              </span>
                              <span className="text-[1.25rem] text-slate-500 flex items-center gap-[0.5rem]">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span>Placed {formatDate(order.createdAt)}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-[1rem]">
                              <span className={`text-[1.15rem] font-bold px-[1.1rem] py-[0.3rem] rounded-full border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border} flex items-center gap-[0.5rem]`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>{badge.label}</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Summary Body */}
                          <div className="p-[1.8rem_2rem] sm:p-[2rem_2.4rem]">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[1.8rem]">
                              {/* Items Thumbnails Preview */}
                              <div className="flex items-center gap-[1.2rem] overflow-x-auto py-[0.2rem] max-w-full">
                                <div className="flex items-center gap-[0.8rem] flex-shrink-0">
                                  {(order.items || []).slice(0, 4).map((it, idx) => (
                                    <div
                                      key={idx}
                                      className="w-[4.8rem] h-[4.8rem] rounded-[0.8rem] border border-slate-200/80 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-2xs"
                                      title={`${it.name} (${it.quantity})`}
                                    >
                                      {it.image ? (
                                        <Image
                                          src={it.image || FALLBACK_IMAGE_SRC}
                                          alt={it.name}
                                          fill
                                          className="object-cover"
                                          sizes="48px"
                                          onError={handleImageError}
                                        />
                                      ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        </svg>
                                      )}
                                    </div>
                                  ))}
                                  {(order.items || []).length > 4 && (
                                    <div className="w-[4.8rem] h-[4.8rem] rounded-[0.8rem] border border-slate-200 bg-slate-100 text-slate-700 text-[1.25rem] font-bold flex items-center justify-center flex-shrink-0">
                                      +{(order.items?.length || 0) - 4}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[1.35rem] font-bold text-slate-900 truncate">
                                    {(order.items || []).length} Product{(order.items?.length || 0) !== 1 ? 's' : ''} Delivered
                                  </p>
                                  <p className="text-[1.2rem] text-slate-500 mt-[0.2rem]">
                                    Payment: {order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                                  </p>
                                </div>
                              </div>

                              {/* Total & Action */}
                              <div className="flex items-center gap-[1.2rem] sm:gap-[1.4rem] flex-wrap justify-between lg:justify-end pt-[1.2rem] lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                <div className="text-left lg:text-right">
                                  <span className="block text-[1.1rem] text-slate-400 uppercase tracking-wider font-semibold">Total Paid</span>
                                  <span className="text-[1.8rem] sm:text-[2rem] font-bold text-slate-900 tracking-tight">
                                    {formatPrice(order.total)}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                                  className="inline-flex items-center gap-[0.7rem] bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-[1.3rem] font-semibold px-[1.6rem] py-[0.9rem] rounded-[0.8rem] transition-colors cursor-pointer border border-slate-200/60"
                                >
                                  <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  >
                                    <path d="m6 9 6 6 6-6" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Accordion Expanded Details */}
                            {isExpanded && (
                              <div className="mt-[2rem] pt-[2rem] border-t border-slate-100 space-y-[2rem]">
                                {/* Itemized Products Table */}
                                <div>
                                  <h5 className="text-[1.4rem] font-bold text-slate-900 mb-[1.2rem] flex items-center gap-[0.6rem]">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    </svg>
                                    <span>Itemized Purchase Receipt:</span>
                                  </h5>
                                  <div className="border border-slate-200/80 rounded-[1rem] divide-y divide-slate-100 overflow-hidden bg-slate-50/40">
                                    {(order.items || []).map((item, i) => (
                                      <div key={i} className="p-[1.2rem_1.6rem] flex items-center justify-between text-[1.3rem] sm:text-[1.35rem] gap-[1rem] flex-wrap sm:flex-nowrap">
                                        <div className="flex items-center gap-[1.2rem] min-w-0">
                                          <span className="font-semibold text-slate-900 truncate">{item.name}</span>
                                          <span className="text-slate-500 flex-shrink-0 text-[1.2rem]">Qty: {item.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-[1.2rem] flex-shrink-0 ml-auto sm:ml-[1rem]">
                                          <span className="font-bold text-slate-900">
                                            {formatPrice(item.subtotal || item.price * item.quantity)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Delivery & Cost Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.6rem] bg-slate-50/80 p-[1.8rem] rounded-[1.2rem] text-[1.3rem] sm:text-[1.35rem] border border-slate-200/70">
                                  <div className="break-words">
                                    <span className="block font-bold text-slate-900 mb-[0.6rem] flex items-center gap-[0.6rem]">
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                      </svg>
                                      <span>Delivered Destination:</span>
                                    </span>
                                    <p className="text-slate-600 leading-[1.6]">
                                      <strong>{order.shippingAddress?.fullName || fullName}</strong><br />
                                      {order.shippingAddress?.line1 || defaultAddress?.line1 || '—'}<br />
                                      {order.shippingAddress?.city || defaultAddress?.city || '—'}, {order.shippingAddress?.country || defaultAddress?.country || 'Sri Lanka'}<br />
                                      Phone: {order.shippingAddress?.phone || user.phone || '—'}
                                    </p>
                                  </div>

                                  <div className="space-y-[0.6rem] text-slate-600">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                      <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Discount:</span>
                                        <span>-{formatPrice(order.discount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>Shipping Fee:</span>
                                      <span className="font-semibold text-slate-900">
                                        {order.shippingFee > 0
                                          ? formatPrice(order.shippingFee)
                                          : ['processing', 'pending', 'confirmed'].includes(order.status)
                                          ? 'Calculated by Admin'
                                          : 'Complimentary'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-baseline font-bold text-slate-900 pt-[0.8rem] border-t border-slate-200 text-[1.45rem]">
                                      <div>
                                        <span>Grand Total:</span>
                                        {order.shippingFee === 0 && ['processing', 'pending', 'confirmed'].includes(order.status) && (
                                          <span className="block text-[1.1rem] font-normal text-slate-500">(Excl. delivery fee)</span>
                                        )}
                                      </div>
                                      <span>{formatPrice(order.total)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state when NO delivered orders exist */
                  <div className="bg-white border border-slate-200/80 rounded-[1.4rem] p-[5rem_2rem] text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                    <div className="w-[6rem] h-[6rem] rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-[1.8rem]">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                    <h4 className="text-[2rem] font-bold text-slate-900 mb-[0.6rem] tracking-tight">No Delivered Orders Yet</h4>
                    <p className="text-[1.35rem] sm:text-[1.45rem] text-slate-500 max-w-[480px] mx-auto mb-[2.4rem] leading-relaxed">
                      {undeliveredOrders.length > 0
                        ? `You have ${undeliveredOrders.length} order(s) currently being processed or in transit. Track them in the Track Current Order tab!`
                        : 'Once your orders have arrived and been delivered, your complete invoices and receipts will appear here.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-[1.2rem]">
                      {undeliveredOrders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('track')}
                          className="inline-flex items-center gap-[0.8rem] bg-slate-900 hover:bg-slate-800 text-white px-[2.4rem] py-[1.1rem] rounded-[0.8rem] text-[1.35rem] font-semibold transition-colors cursor-pointer shadow-sm"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                          </svg>
                          <span>Track Active Shipments ({undeliveredOrders.length})</span>
                        </button>
                      )}
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-[0.8rem] bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-[2.4rem] py-[1.1rem] rounded-[0.8rem] text-[1.35rem] font-semibold transition-colors shadow-2xs no-underline cursor-pointer"
                      >
                        <span>Explore Shop</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
