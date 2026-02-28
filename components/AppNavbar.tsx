"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { createPortal } from "react-dom";

export const AppNavbar = () => {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ürün Ekleme Formu
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);

    if (savedToken) {
      fetchUserInfo(savedToken);
      fetchCartCount(savedToken);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchCartCount = async (authToken: string) => {
    try {
      const res = await axios.get("http://localhost:3000/cart", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data?.cartItems)
            ? res.data.cartItems
            : [];
      const totalCount = items.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0
      );
      setCartCount(totalCount);
    } catch (error) {
      console.error("Cart count fetch hatası:", error);
    }
  };

  const fetchUserInfo = async (authToken: string) => {
    try {
      const res = await axios.get("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const normalizedRole = (res.data?.role ?? "user").toString().toLowerCase();
      setUserRole(normalizedRole);
    } catch (error: any) {
      console.error("User info fetch hatası:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleAddProduct = async () => {
    if (!token) return alert("Giriş yapmalısın!");
    if (userRole !== "admin")
      return alert("Sadece admin kullanıcılar ürün ekleyebilir!");

    const normalizedPrice = Number(price.replace(",", "."));
    const normalizedStock = Number(stock);

    if (!Number.isFinite(normalizedPrice) || !Number.isFinite(normalizedStock)) {
      return alert("Fiyat veya stok geçersiz.");
    }

    if (!name.trim() || !desc.trim()) {
      return alert("Ad ve açıklama boş olamaz!");
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", desc);
      formData.append("price", normalizedPrice.toString());
      formData.append("stock", normalizedStock.toString());

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `HTTP error! status: ${response.status}`);
      }

      alert("Ürün Başarıyla Eklendi! 🎉");
      setName("");
      setDesc("");
      setPrice("");
      setStock("");
      setSelectedFile(null);
      setIsOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error("Hata detayları:", error);
      alert("Hata: " + (error.message || "Bilinmeyen hata"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserRole(null);
    window.location.href = "/login";
  };

  const isActivePath = (path: string) => pathname === path;

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="font-bold text-2xl flex items-center gap-1 shrink-0"
            >
              <span className="text-blue-600">TEKNO</span>
              <span className="text-gray-900">STORE</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {!token ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/signup"
                    className="border-2 border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    Kaydol
                  </Link>
                </div>
              ) : (
                <>
                  {/* Siparişlerim */}
                  <Link
                    href="/orders"
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActivePath("/orders")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    📋 Siparişlerim
                  </Link>

                  {/* Favorilerim */}
                  <Link
                    href="/favorites"
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActivePath("/favorites")
                        ? "bg-pink-100 text-pink-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    ❤️ Favorilerim
                  </Link>

                  {/* Profil */}
                  <Link
                    href="/profile"
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActivePath("/profile")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    👤 Profil
                  </Link>

                  {/* Sepet */}
                  <Link
                    href="/cart"
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActivePath("/cart")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    🛒 Sepet
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Admin Bölümü */}
                  {userRole === "admin" && (
                    <>
                      <div className="w-px h-8 bg-gray-200 mx-1" />
                      <Link
                        href="/admin"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActivePath("/admin")
                            ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                            : "bg-linear-to-r from-amber-50 to-orange-50 text-amber-700 border-2 border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        🛡️ Admin Panel
                      </Link>
                      <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        ➕ Ürün Ekle
                      </button>
                    </>
                  )}

                  <div className="w-px h-8 bg-gray-200 mx-1" />

                  {/* Çıkış */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Çıkış
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 space-y-2">
              {!token ? (
                <>
                  <Link
                    href="/login"
                    className="block w-full text-center bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full text-center border-2 border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kaydol
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/orders"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📋 Siparişlerim
                  </Link>
                  <Link
                    href="/favorites"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ❤️ Favorilerim
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👤 Profil
                  </Link>
                  <Link
                    href="/cart"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🛒 Sepet {cartCount > 0 && `(${cartCount})`}
                  </Link>
                  {userRole === "admin" && (
                    <>
                      <div className="border-t border-gray-200 my-2" />
                      <Link
                        href="/admin"
                        className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        🛡️ Admin Panel
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsOpen(true);
                        }}
                        className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      >
                        ➕ Ürün Ekle
                      </button>
                    </>
                  )}
                  <div className="border-t border-gray-200 my-2" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Ürün Ekleme Modal */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              <div className="border-b-2 border-green-200 bg-linear-to-r from-green-50 to-emerald-50 px-6 py-5 shrink-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-green-600">
                  ➕ Yeni Ürün Ekle
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
                  Ürün bilgilerini doldurun ve kaydedin
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                <div className="space-y-5">
                  {/* Resim Upload */}
                  <div className="flex flex-col gap-3 p-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-dashed border-blue-300">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-lg">🖼️</span> Ürün Resmi
                    </label>

                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full h-40 bg-white rounded-lg border-2 border-green-300 overflow-hidden flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-green-700 font-semibold wrap-break-word max-w-full">
                          ✓ {selectedFile.name}
                        </p>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded hover:bg-blue-300 text-sm"
                        >
                          Resim Değiştir
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setSelectedFile(file);
                          }}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2 p-4 hover:bg-blue-100 transition-colors rounded-lg">
                          <span className="text-3xl">📸</span>
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">
                            Resim seçmek için tıklayın
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG (max 5MB)
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Ürün Adı */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-800">
                      📝 Ürün Adı
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: MacBook Air M3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-green-400 focus:border-green-500 focus:outline-none text-sm"
                    />
                    {name && (
                      <p className="text-xs text-green-600">✓ Dolduruldu</p>
                    )}
                  </div>

                  {/* Açıklama */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-800">
                      📄 Açıklama
                    </label>
                    <textarea
                      placeholder="Ürün özelliklerini girin..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-green-400 focus:border-green-500 focus:outline-none text-sm resize-none"
                      rows={3}
                    />
                    {desc && (
                      <p className="text-xs text-green-600">
                        ✓ {desc.length} karakter
                      </p>
                    )}
                  </div>

                  {/* Fiyat ve Stok */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-800">
                        💰 Fiyat
                      </label>
                      <div className="flex items-center border-2 border-gray-300 rounded-lg hover:border-green-400 focus-within:border-green-500">
                        <span className="px-3 text-gray-500 font-semibold">
                          ₺
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="flex-1 px-2 py-3 outline-none text-sm"
                        />
                      </div>
                      {price && (
                        <p className="text-xs text-green-600">
                          ✓ {Number(price).toFixed(2)} TL
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-800">
                        📦 Stok
                      </label>
                      <div className="flex items-center border-2 border-gray-300 rounded-lg hover:border-green-400 focus-within:border-green-500">
                        <span className="px-3 text-gray-500 font-semibold">
                          Adet
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          className="flex-1 px-2 py-3 outline-none text-sm"
                        />
                      </div>
                      {stock && (
                        <p className="text-xs text-green-600">✓ {stock} adet</p>
                      )}
                    </div>
                  </div>

                  {/* Form Özeti */}
                  {(name || desc || price || stock) && (
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        📋 Form Özeti:
                      </p>
                      <div className="space-y-1 text-xs text-gray-700">
                        {name && (
                          <p>
                            • Ürün:{" "}
                            <span className="font-semibold text-green-700">
                              {name}
                            </span>
                          </p>
                        )}
                        {price && (
                          <p>
                            • Fiyat:{" "}
                            <span className="font-semibold text-green-700">
                              ₺{Number(price).toFixed(2)}
                            </span>
                          </p>
                        )}
                        {stock && (
                          <p>
                            • Stok:{" "}
                            <span className="font-semibold text-green-700">
                              {stock} adet
                            </span>
                          </p>
                        )}
                        {selectedFile && (
                          <p>
                            • Resim:{" "}
                            <span className="font-semibold text-green-700">
                              Seçildi ✓
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-100 bg-gray-50 px-4 sm:px-6 py-4 flex gap-3 justify-end shrink-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  ✕ Vazgeç
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={formLoading || !name || !price || !stock}
                  className="bg-linear-to-r from-green-600 to-emerald-600 text-white font-bold px-6 py-2 rounded-xl text-sm disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  {formLoading ? "⏳ Kaydediliyor..." : "✓ Ürünü Kaydet"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
