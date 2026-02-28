"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ordersApi } from "@/lib/api";
import dynamic from "next/dynamic";
import type { OrderStatus } from "@/lib/types";

const DataTable = dynamic(() => import("@/components/DataTable"), { ssr: false });

const API_BASE_URL = "http://localhost:3000";

type AdminTab = "orders" | "users";

const STATUS_FILTERS: { key: "ALL" | OrderStatus; label: string; icon: string }[] = [
  { key: "ALL", label: "Tümü", icon: "📋" },
  { key: "PENDING", label: "Bekleyenler", icon: "⏳" },
  { key: "APPROVED", label: "Onaylananlar", icon: "✅" },
  { key: "REJECTED", label: "Reddedilenler", icon: "❌" },
];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [ordersDtKey, setOrdersDtKey] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      window.location.href = "/login";
      return;
    }
    setToken(savedToken);
  }, []);

  const handleStatusFilterChange = (key: "ALL" | OrderStatus) => {
    setStatusFilter(key);
    setOrdersDtKey((prev) => prev + 1);
  };

  const handleApprove = async (orderId: number) => {
    if (actionLoading) return;
    setActionLoading(orderId);
    try {
      await ordersApi.approve(orderId);
      // Tabloyu yenile
      setOrdersDtKey((prev) => prev + 1);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Sipariş onaylanamadı!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: number) => {
    if (actionLoading) return;
    if (!confirm("Bu siparişi reddetmek istediğinize emin misiniz?")) return;
    setActionLoading(orderId);
    try {
      await ordersApi.reject(orderId);
      setOrdersDtKey((prev) => prev + 1);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Sipariş reddedilemedi!");
    } finally {
      setActionLoading(null);
    }
  };

  // Global event handler for order actions (DataTable render'dan çağrılır)
  useEffect(() => {
    (window as any).__adminApproveOrder = handleApprove;
    (window as any).__adminRejectOrder = handleReject;
    return () => {
      delete (window as any).__adminApproveOrder;
      delete (window as any).__adminRejectOrder;
    };
  });

  /* ─── Sipariş Kolonları ─── */
  const orderColumns = [
    {
      data: "id",
      title: "Sipariş No",
      render: (data: any) =>
        `<span style="font-family: monospace; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">#${data}</span>`,
    },
    {
      data: "user",
      title: "Kullanıcı",
      orderable: false,
      render: (data: any) =>
        data
          ? `<div><strong>${data.fullName || "-"}</strong><br/><span style="font-size: 0.75rem; color: #6b7280;">${data.email || ""}</span></div>`
          : "-",
    },
    {
      data: "product",
      title: "Ürün",
      orderable: false,
      render: (data: any) => (data ? data.name || data.title || "-" : "-"),
    },
    {
      data: "quantity",
      title: "Adet",
      render: (data: any) => `<span style="font-weight: 600;">${data}</span>`,
    },
    {
      data: "totalPrice",
      title: "Tutar",
      render: (data: any) => {
        const val = parseFloat(data);
        return `<span style="font-weight: 700; color: #2563eb;">${val.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>`;
      },
    },
    {
      data: "status",
      title: "Durum",
      render: (data: any) => {
        const badges: Record<string, string> = {
          PENDING: '<span class="badge badge-warning">⏳ Beklemede</span>',
          APPROVED: '<span class="badge badge-success">✅ Onaylandı</span>',
          REJECTED: '<span class="badge badge-danger">❌ Reddedildi</span>',
        };
        return badges[data] || data;
      },
    },
    {
      data: "createdAt",
      title: "Tarih",
      searchable: false,
      render: (data: any) =>
        new Date(data).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
    },
    {
      data: "id",
      title: "İşlemler",
      orderable: false,
      searchable: false,
      render: (data: any, _type: string, row: any) => {
        if (row.status === "PENDING") {
          return `
            <div style="display: flex; gap: 4px;">
              <button class="dt-action-btn dt-action-btn-approve" onclick="window.__adminApproveOrder(${data})">
                ✓ Onayla
              </button>
              <button class="dt-action-btn dt-action-btn-reject" onclick="window.__adminRejectOrder(${data})">
                ✕ Reddet
              </button>
            </div>
          `;
        }
        const badges: Record<string, string> = {
          APPROVED: '<span class="badge badge-success">✅ Onaylandı</span>',
          REJECTED: '<span class="badge badge-danger">❌ Reddedildi</span>',
        };
        return badges[row.status] || "";
      },
    },
  ];

  /* ─── Kullanıcı Kolonları ─── */
  const userColumns = [
    {
      data: "id",
      title: "ID",
      render: (data: any) =>
        `<span style="font-family: monospace; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">#${data}</span>`,
    },
    {
      data: "email",
      title: "E-posta",
      render: (data: any) => `<span style="font-weight: 500;">${data}</span>`,
    },
    {
      data: "fullName",
      title: "Ad Soyad",
      render: (data: any) => data || '<span style="color: #9ca3af;">—</span>',
    },
    {
      data: "phone",
      title: "Telefon",
      render: (data: any) => data || '<span style="color: #9ca3af;">—</span>',
    },
    {
      data: "gender",
      title: "Cinsiyet",
      render: (data: any) => {
        if (!data) return '<span style="color: #9ca3af;">—</span>';
        const labels: Record<string, string> = {
          male: "Erkek",
          female: "Kadın",
          other: "Diğer",
          MALE: "Erkek",
          FEMALE: "Kadın",
          OTHER: "Diğer",
        };
        return labels[data] || data;
      },
    },
    {
      data: "role",
      title: "Rol",
      render: (data: any) => {
        if (data === "admin") {
          return '<span class="badge badge-danger">🛡️ Admin</span>';
        }
        return '<span class="badge badge-primary">👤 Müşteri</span>';
      },
    },
  ];

  if (!token) return null;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
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
            Sipariş ve kullanıcı yönetimi — DataTables ile gelişmiş filtreleme ve sıralama.
          </p>
        </motion.div>

        {/* Ana Sekme: Siparişler / Kullanıcılar */}
        <div className="flex gap-3 mb-6 border-b-2 border-gray-100 pb-4">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === "orders"
                ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            📦 Siparişler
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === "users"
                ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            👥 Kullanıcılar
          </button>
        </div>

        {/* ─── SİPARİŞLER SEKMESİ ─── */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Durum Filtresi */}
            <div className="flex flex-wrap gap-2 mb-6">
              {STATUS_FILTERS.map((tab) => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleStatusFilterChange(tab.key)}
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
                  </button>
                );
              })}

              {/* Yenile */}
              <button
                onClick={() => setOrdersDtKey((prev) => prev + 1)}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                🔄 Yenile
              </button>
            </div>

            {/* Siparişler DataTable */}
            <DataTable
              key={`orders-${ordersDtKey}`}
              id="adminOrdersTable"
              ajaxUrl={`${API_BASE_URL}/admin/orders/datatable`}
              columns={orderColumns}
              token={token}
              order={[[6, "desc"]]}
              extraParams={statusFilter !== "ALL" ? { status: statusFilter } : {}}
              pageLength={10}
            />
          </motion.div>
        )}

        {/* ─── KULLANICILAR SEKMESİ ─── */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DataTable
              id="usersTable"
              ajaxUrl={`${API_BASE_URL}/users/datatable`}
              columns={userColumns}
              token={token}
              order={[[0, "asc"]]}
              pageLength={10}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
