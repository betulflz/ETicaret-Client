"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@heroui/react";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import {
  type Order,
  type OrderStatus,
  getOrderStatusInfo,
  formatDate,
  formatPrice,
} from "@/lib/types";

const STATUS_TABS: { key: "ALL" | OrderStatus; label: string; icon: string }[] = [
  { key: "ALL", label: "Tümü", icon: "📋" },
  { key: "PENDING", label: "Bekleyen", icon: "⏳" },
  { key: "APPROVED", label: "Onaylanan", icon: "✅" },
  { key: "REJECTED", label: "Reddedilen", icon: "❌" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | OrderStatus>("ALL");
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

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getMyOrders();
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);
    } catch (err: any) {
      console.error("Sipariş yükleme hatası:", err);
      setError(err?.response?.data?.message || "Siparişler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  if (!token) return null;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Siparişlerim
          </h1>
          <p className="text-gray-500 mt-1">
            Tüm siparişlerinizi takip edin ve durumlarını görüntüleyin.
          </p>
        </motion.div>

        {/* Durum Filtreleri */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count =
              tab.key === "ALL"
                ? orders.length
                : orders.filter((o) => o.status === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 border-2
                  ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
                <span
                  className={`
                    ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                    ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* İçerik */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner label="Siparişler yükleniyor..." color="primary" size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="font-bold text-red-800">Bir sorun oluştu</p>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              Tekrar Dene
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-12 text-center"
          >
            <p className="text-5xl mb-4">📦</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activeTab === "ALL"
                ? "Henüz siparişiniz yok"
                : `${STATUS_TABS.find((t) => t.key === activeTab)?.label} sipariş bulunmadı`}
            </h3>
            <p className="text-gray-500 mb-6">
              Hemen alışverişe başlayarak ilk siparişinizi oluşturabilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              🛒 Alışverişe Başla
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filteredOrders.map((order, index) => {
                const statusInfo = getOrderStatusInfo(order.status);
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Sol: Sipariş bilgisi */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            #{order.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.color}`}
                          >
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {order.product?.name || order.product?.title || `Ürün #${order.productId}`}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                          <span>Miktar: <strong className="text-gray-700">{order.quantity}</strong></span>
                          <span>•</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Sağ: Fiyat */}
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-extrabold text-blue-600">
                          {formatPrice(order.totalPrice)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Birim: {formatPrice(order.totalPrice / order.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {/* Toplam Bilgi - sadece sipariş varsa */}
        {!loading && !error && filteredOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Toplam {filteredOrders.length} sipariş gösteriliyor
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam Tutar</p>
                <p className="text-2xl font-extrabold text-blue-700">
                  {formatPrice(
                    filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0)
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
