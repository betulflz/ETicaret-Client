"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@heroui/react";
import { ordersApi } from "@/lib/api";
import {
  type Order,
  type OrderStatus,
  getOrderStatusInfo,
  formatDate,
  formatPrice,
} from "@/lib/types";

type FilterTab = "ALL" | OrderStatus;

const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: "ALL", label: "Tümü", icon: "📋" },
  { key: "PENDING", label: "Bekleyenler", icon: "⏳" },
  { key: "APPROVED", label: "Onaylananlar", icon: "✅" },
  { key: "REJECTED", label: "Reddedilenler", icon: "❌" },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      window.location.href = "/login";
      return;
    }
    setToken(savedToken);
    fetchOrders();
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getAllOrders();
      const data = Array.isArray(res.data) ? res.data : [];
      // En yeniden eskiye sırala
      data.sort(
        (a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(data);
    } catch (err: any) {
      console.error("Admin sipariş yükleme hatası:", err);
      if (err?.response?.status === 403) {
        setError("Bu sayfaya erişim yetkiniz yok. Admin girişi gereklidir.");
      } else {
        setError(err?.response?.data?.message || "Siparişler yüklenemedi.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprove = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await ordersApi.approve(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "APPROVED" as OrderStatus } : o))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Sipariş onaylanamadı!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: number) => {
    if (!confirm("Bu siparişi reddetmek istediğinize emin misiniz?")) return;
    setActionLoading(orderId);
    try {
      await ordersApi.reject(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "REJECTED" as OrderStatus } : o))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Sipariş reddedilemedi!");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders =
    activeFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  // İstatistikler
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    approved: orders.filter((o) => o.status === "APPROVED").length,
    rejected: orders.filter((o) => o.status === "REJECTED").length,
    totalRevenue: orders
      .filter((o) => o.status === "APPROVED")
      .reduce((sum, o) => sum + o.totalPrice, 0),
  };

  if (!token) return null;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Admin Paneli
            </h1>
          </div>
          <p className="text-gray-500">
            Sipariş yönetimi — Onaylayın, reddedin ve tüm siparişleri takip edin.
          </p>
        </motion.div>

        {/* İstatistik Kartları */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            label="Toplam Sipariş"
            value={stats.total}
            icon="📦"
            color="bg-linear-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            label="Bekleyen"
            value={stats.pending}
            icon="⏳"
            color="bg-linear-to-br from-amber-500 to-orange-500"
          />
          <StatCard
            label="Onaylanan"
            value={stats.approved}
            icon="✅"
            color="bg-linear-to-br from-emerald-500 to-green-600"
          />
          <StatCard
            label="Toplam Gelir"
            value={formatPrice(stats.totalRevenue)}
            icon="💰"
            color="bg-linear-to-br from-purple-500 to-indigo-600"
            isText
          />
        </motion.div>

        {/* Filtre Tabları */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count =
              tab.key === "ALL"
                ? orders.length
                : orders.filter((o) => o.status === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 border-2
                  ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Yenile butonu */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
          >
            🔄 Yenile
          </button>
        </div>

        {/* İçerik */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner label="Siparişler yükleniyor..." color="primary" size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <p className="text-3xl mb-3">🚫</p>
            <p className="font-bold text-red-800 text-lg">Erişim Hatası</p>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-12 text-center"
          >
            <p className="text-5xl mb-4">📭</p>
            <h3 className="text-xl font-bold text-gray-800">
              {activeFilter === "ALL"
                ? "Henüz sipariş bulunmuyor"
                : `${FILTER_TABS.find((t) => t.key === activeFilter)?.label} sipariş yok`}
            </h3>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filteredOrders.map((order, index) => {
                const statusInfo = getOrderStatusInfo(order.status);
                const isActioning = actionLoading === order.id;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Sol: Sipariş detayları */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            Sipariş #{order.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.color}`}
                          >
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                          {order.user?.email && (
                            <span className="text-xs text-gray-400">
                              👤 {order.user.fullName || order.user.email}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-900 text-base truncate">
                          {order.product?.name ||
                            order.product?.title ||
                            `Ürün #${order.productId}`}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                          <span>
                            Miktar: <strong className="text-gray-700">{order.quantity}</strong>
                          </span>
                          <span>•</span>
                          <span>{formatDate(order.createdAt)}</span>
                          {order.userId && (
                            <>
                              <span>•</span>
                              <span>Kullanıcı #{order.userId}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Orta: Fiyat */}
                      <div className="text-left lg:text-right shrink-0 lg:mr-4">
                        <div className="text-xl font-extrabold text-blue-600">
                          {formatPrice(order.totalPrice)}
                        </div>
                      </div>

                      {/* Sağ: Aksiyon Butonları */}
                      <div className="flex items-center gap-2 shrink-0">
                        {order.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 shadow-sm"
                            >
                              {isActioning ? (
                                <Spinner size="sm" color="white" />
                              ) : (
                                "✓"
                              )}
                              Onayla
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50 shadow-sm"
                            >
                              {isActioning ? (
                                <Spinner size="sm" color="white" />
                              ) : (
                                "✕"
                              )}
                              Reddet
                            </button>
                          </>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 ${statusInfo.bg} ${statusInfo.color}`}
                          >
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ─── İstatistik Kartı Bileşeni ─────────────────────── */

function StatCard({
  label,
  value,
  icon,
  color,
  isText = false,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className={`${color} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`font-extrabold ${isText ? "text-lg" : "text-3xl"} mb-1`}>
        {value}
      </div>
      <p className="text-sm text-white/80 font-medium">{label}</p>
    </div>
  );
}
