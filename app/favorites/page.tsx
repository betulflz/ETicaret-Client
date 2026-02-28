"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Spinner, Image } from "@heroui/react";
import { favoritesApi } from "@/lib/api";
import type { Favorite } from "@/lib/types";

function getProductTitle(p: any) {
  return p?.title ?? p?.name ?? "Ürün";
}

function getProductImage(p: any, index: number) {
  const src = p?.imageUrl ?? p?.image ?? p?.thumbnail ?? null;
  if (src && src.trim().length > 0) return src;
  const seed = p?.id ? Number(p.id) + 100 : index + 2;
  return `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/640/480`;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
    if (!savedToken) {
      setError("Favorileri görmek için giriş yapmalısınız!");
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await favoritesApi.getAll();
      const raw = res.data;
      const items: Favorite[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.favorites)
              ? raw.favorites
              : [];
      setFavorites(items);
      setError(null);
    } catch (err: any) {
      console.error("Favoriler fetch hatası:", err);
      setError("Favoriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemove = async (productId: number) => {
    setRemovingId(productId);
    try {
      await favoritesApi.remove(productId);
      setFavorites((prev) => prev.filter((f) => f.productId !== productId));
    } catch {
      alert("Favori kaldırılamadı!");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Tüm favorileri temizlemek istediğinize emin misiniz?")) return;
    setClearingAll(true);
    try {
      await favoritesApi.clearAll();
      setFavorites([]);
    } catch {
      alert("Favoriler temizlenemedi!");
    } finally {
      setClearingAll(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Giriş Gerekli</h2>
          <p className="text-gray-600 mb-6">Favorileri görmek için giriş yapmalısınız.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">❤️ Favorilerim</h1>
            <p className="text-gray-500 mt-1">
              {favorites.length > 0
                ? `${favorites.length} ürün favorilerinizde`
                : "Favori listeniz boş"}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="px-5 py-2 rounded-xl border-2 border-red-300 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {clearingAll ? "Temizleniyor..." : "🗑️ Tümünü Temizle"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner label="Favoriler yükleniyor..." color="primary" size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="font-bold text-red-800">Bir sorun oluştu</div>
            <div className="text-red-700 mt-2">{error}</div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-xl border-2 border-pink-200 bg-pink-50 p-12 text-center">
            <div className="text-5xl mb-4">💔</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Favori listeniz boş
            </h2>
            <p className="text-gray-600 mb-6">
              Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyin.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {favorites.map((fav, index) => {
                const product = fav.product;
                if (!product) return null;

                return (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border-2 border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Resim */}
                    <div className="h-48 w-full bg-gray-100 flex items-center justify-center relative">
                      <Image
                        alt={getProductTitle(product)}
                        src={getProductImage(product, index)}
                        className="h-48 w-full object-contain"
                        radius="none"
                      />
                      {/* Kalp (kaldır) */}
                      <button
                        onClick={() => handleRemove(fav.productId)}
                        disabled={removingId === fav.productId}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm disabled:opacity-50"
                      >
                        ❤️
                      </button>
                    </div>

                    {/* Bilgi */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
                        {getProductTitle(product)}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {product.description ?? ""}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          {product.price !== undefined
                            ? `${parseFloat(String(product.price)).toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                              })} ₺`
                            : "—"}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            (product.stock ?? 0) > 0 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {(product.stock ?? 0) > 0 ? `Stokta (${product.stock})` : "Tükendi"}
                        </span>
                      </div>
                    </div>

                    {/* Eklenme Tarihi */}
                    <div className="px-4 pb-3">
                      <p className="text-[11px] text-gray-400">
                        Eklendi: {new Date(fav.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
