"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Spinner } from "@heroui/react";
import { cartApi } from "@/lib/api";
import {
  type CartItem,
  formatPrice,
  getProductTitle,
  getProductImage,
} from "@/lib/types";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);

    if (!savedToken) {
      setError("Sepeti görmek için giriş yapmalısınız!");
      setLoading(false);
      return;
    }

    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartApi.get();
      const items = Array.isArray(res.data) ? res.data : [];
      setCartItems(items);
      setError(null);
    } catch (err: any) {
      console.error("Sepet yüklenirken hata:", err);
      setError(err?.response?.data?.message || "Sepet yüklenemedi!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    setUpdatingId(cartItemId);
    try {
      await cartApi.update(cartItemId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Miktar güncellenemedi!");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    setRemovingId(cartItemId);
    try {
      await cartApi.remove(cartItemId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Ürün çıkarılamadı!");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Sepeti tamamen temizlemek istediğinize emin misiniz?")) return;
    try {
      await cartApi.clear();
      setCartItems([]);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Sepet temizlenemedi!");
    }
  };

  const handleCheckout = async () => {
    if (!confirm("Siparişinizi onaylamak istiyor musunuz?")) return;
    setCheckingOut(true);
    try {
      await cartApi.checkout();
      setCheckoutSuccess(true);
      setCartItems([]);
    } catch (err: any) {
      console.error("Checkout hatası:", err);
      alert(err?.response?.data?.message || "Satın alma işlemi başarısız oldu!");
    } finally {
      setCheckingOut(false);
    }
  };

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) =>
        total + (item.product?.price || 0) * (item.quantity || 1),
      0
    );

  const getTotalItems = () =>
    cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  /* ─── Giriş yapılmamışsa ─── */
  if (!token) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-10"
          >
            <p className="text-5xl mb-4">🔒</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Giriş Yapmanız Gerekiyor
            </h1>
            <p className="text-gray-500 mb-6">
              Sepetinizi görmek ve alışveriş yapmak için giriş yapın.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Checkout başarılıysa ─── */
  if (checkoutSuccess) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-10"
          >
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.p>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Siparişiniz Alındı!
            </h1>
            <p className="text-gray-500 mb-6">
              Siparişiniz başarıyla oluşturuldu ve admin onayı bekleniyor.
              Sipariş durumunuzu &ldquo;Siparişlerim&rdquo; sayfasından takip
              edebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/orders"
                className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                📋 Siparişlerime Git
              </Link>
              <Link
                href="/"
                className="inline-block border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-blue-400 transition-colors"
              >
                🛒 Alışverişe Devam Et
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Yükleniyor ─── */
  if (loading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <Spinner label="Sepet yükleniyor..." color="primary" size="lg" />
      </div>
    );
  }

  /* ─── Hata ─── */
  if (error) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="font-bold text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Boş sepet ─── */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-10"
          >
            <p className="text-5xl mb-4">🛒</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Sepetiniz Boş
            </h1>
            <p className="text-gray-500 mb-6">
              Henüz sepetinize ürün eklemediniz.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Sepet İçeriği ─── */
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Sepetim
            </h1>
            <p className="text-gray-500 mt-1">
              {getTotalItems()} ürün sepetinizde
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
          >
            🗑️ Sepeti Temizle
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ürün Listesi */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => {
                const product = item.product;
                const itemPrice = product?.price || 0;
                const isUpdating = updatingId === item.id;
                const isRemoving = removingId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className={`bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-4 flex gap-4 items-center transition-opacity ${
                      isRemoving ? "opacity-50" : ""
                    }`}
                  >
                    {/* Resim */}
                    {product && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={getProductImage(product, index)}
                          alt={getProductTitle(product)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">
                        {product
                          ? getProductTitle(product)
                          : `Ürün #${item.productId}`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Birim: {formatPrice(itemPrice)}
                      </p>
                    </div>

                    {/* Miktar Kontrolü */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || isUpdating}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 disabled:opacity-40 transition-colors flex items-center justify-center text-lg"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900">
                        {isUpdating ? "..." : item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isUpdating}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 disabled:opacity-40 transition-colors flex items-center justify-center text-lg"
                      >
                        +
                      </button>
                    </div>

                    {/* Fiyat & Sil */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-blue-600">
                        {formatPrice(itemPrice * item.quantity)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemoving}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold mt-1"
                      >
                        Kaldır
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Sipariş Özeti */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6 sticky top-24"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Sipariş Özeti
              </h2>

              <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ürün Sayısı</span>
                  <span className="font-semibold">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ara Toplam</span>
                  <span className="font-semibold">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Kargo</span>
                  <span className="font-semibold text-emerald-600">
                    Ücretsiz
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">Toplam</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60 text-base"
              >
                {checkingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" color="white" /> İşleniyor...
                  </span>
                ) : (
                  "Siparişi Tamamla"
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Siparişiniz admin onayına gönderilecektir.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
