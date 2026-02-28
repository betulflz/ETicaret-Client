"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { OrderStatus } from "@/lib/types";

const DataTable = dynamic(() => import("@/components/DataTable"), { ssr: false });

const API_BASE_URL = "http://localhost:3000";

const STATUS_TABS: { key: "ALL" | OrderStatus; label: string; icon: string }[] = [
  { key: "ALL", label: "Tümü", icon: "📋" },
  { key: "PENDING", label: "Bekleyen", icon: "⏳" },
  { key: "APPROVED", label: "Onaylanan", icon: "✅" },
  { key: "REJECTED", label: "Reddedilen", icon: "❌" },
];

export default function OrdersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | OrderStatus>("ALL");
  const [dtKey, setDtKey] = useState(0);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      window.location.href = "/login";
      return;
    }
    setToken(savedToken);
  }, []);

  const handleTabChange = (key: "ALL" | OrderStatus) => {
    setActiveTab(key);
    setDtKey((prev) => prev + 1);
  };

  const columns = [
    {
      data: "id",
      title: "Sipariş No",
      render: (data: any) =>
        `<span style="font-family: monospace; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">#${data}</span>`,
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
      title: "Toplam Tutar",
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
          PENDING: '<span class="badge badge-warning">⏳ Onay Bekliyor</span>',
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
  ];

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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            📋 Siparişlerim
          </h1>
          <p className="text-gray-500 mt-1">
            Tüm siparişlerinizi takip edin ve durumlarını görüntüleyin.
          </p>
        </motion.div>

        {/* Durum Filtreleri */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
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
        </div>

        {/* DataTable */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DataTable
            key={dtKey}
            id="myOrdersTable"
            ajaxUrl={`${API_BASE_URL}/orders/datatable`}
            columns={columns}
            token={token}
            order={[[5, "desc"]]}
            extraParams={activeTab !== "ALL" ? { status: activeTab } : {}}
            pageLength={10}
          />
        </motion.div>

        {/* Alışverişe Başla */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            🛒 Alışverişe Devam Et →
          </Link>
        </div>
      </div>
    </div>
  );
}
