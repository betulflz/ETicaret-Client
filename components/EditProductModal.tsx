"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

type Product = {
  id?: string | number;
  title?: string;
  name?: string;
  price?: number;
  stock?: number;
  imageUrl?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  description?: string;
};

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  token,
  onClose,
  onSuccess,
}) => {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal açıldığında ürün bilgilerini doldur
  useEffect(() => {
    if (isOpen && product) {
      setName(product.title || product.name || "");
      setDesc(product.description || "");
      setPrice(product.price?.toString() || "");
      setStock(product.stock?.toString() || "");
      setSelectedFile(null);
      setError(null);
      
      // Mevcut resmi göster
      const currentImage = product.imageUrl || product.image || product.thumbnail;
      if (currentImage) {
        setImagePreview(currentImage);
      }
    }
  }, [isOpen, product]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProduct = async () => {
    if (!product?.id) {
      setError("Ürün ID'si bulunamadı!");
      return;
    }

    if (!name.trim() || !price.trim()) {
      setError("Ürün adı ve fiyat zorunludur!");
      return;
    }

    const normalizedPrice = Number(price.replace(",", "."));
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      setError("Geçerli bir fiyat girin!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("title", name);
      formData.append("description", desc);
      formData.append("price", normalizedPrice.toString());
      
      if (stock.trim()) {
        formData.append("stock", stock);
      }

      if (selectedFile) {
        console.log("Resim ekleniyor:", selectedFile.name);
        formData.append("image", selectedFile);
      }

      console.log("PUT isteği gönderiliyor:", `http://localhost:3000/products/${product.id}`);

      const response = await fetch(
        `http://localhost:3000/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Hata yanıtı (text):", responseText);
        console.error("Hata status kodu:", response.status);
        
        let errorMessage = "Ürün güncellenemedi!";
        
        // Hata yanıtını ayrıştır
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            console.error("Hata yanıtı (JSON):", errorData);
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (parseError) {
            console.warn("JSON parse hatası, metin yanıtı kullanılıyor:", responseText);
            errorMessage = responseText || `HTTP ${response.status} hatası`;
          }
        }
        
        console.error("Final error message:", errorMessage);
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
        console.log("Ürün başarıyla güncellendi:", result);
      } catch (parseError) {
        console.warn("Başarı yanıtı JSON parse edilemedi, devam ediliyor");
        result = null;
      }
      
      alert("Ürün başarıyla güncellendi! 🎉");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Güncelleme hatası:", err);
      setError(err.message || "Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen || !product) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b-2 border-blue-200 bg-linear-to-r from-blue-50 to-cyan-50 px-6 py-5 shrink-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">
            ✏️ Ürünü Düzenle
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            Ürün bilgilerini güncelle
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                <p className="text-sm font-semibold text-red-700">⚠️ {error}</p>
              </div>
            )}

            {/* Resim Upload */}
            <div className="flex flex-col gap-3 p-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-dashed border-blue-300">
              <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="text-lg">🖼️</span> Ürün Resmi
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-full h-40 bg-white rounded-lg border-2 border-blue-300 overflow-hidden flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-xs sm:text-sm text-blue-700 font-semibold wrap-break-word max-w-full">
                      ✓ {selectedFile.name}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded hover:bg-blue-300 text-sm"
                  >
                    Resim Değiştir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer w-full"
                >
                  <div className="flex flex-col items-center gap-2 p-4 hover:bg-blue-100 transition-colors rounded-lg">
                    <span className="text-3xl">📸</span>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">
                      Yeni resim seçmek için tıklayın
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG (max 5MB)</p>
                  </div>
                </button>
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:outline-none text-sm"
              />
              {name && <p className="text-xs text-blue-600">✓ Dolduruldu</p>}
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:outline-none text-sm resize-none"
                rows={3}
              />
              {desc && (
                <p className="text-xs text-blue-600">✓ {desc.length} karakter</p>
              )}
            </div>

            {/* Fiyat */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">
                💰 Fiyat
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg hover:border-blue-400 focus-within:border-blue-500">
                <span className="px-3 text-gray-500 font-semibold">₺</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 px-2 py-3 outline-none text-sm"
                />
              </div>
              {price && (
                <p className="text-xs text-blue-600">
                  ✓ {Number(price).toFixed(2)} TL
                </p>
              )}
            </div>

            {/* Stok */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">
                📦 Stok
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg hover:border-blue-400 focus-within:border-blue-500">
                <span className="px-3 text-gray-500 font-semibold">Adet</span>
                <input
                  type="number"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="flex-1 px-2 py-3 outline-none text-sm"
                />
              </div>
              {stock && (
                <p className="text-xs text-blue-600">
                  ✓ {stock} adet
                </p>
              )}
            </div>

            {/* Form Özeti */}
            {(name || desc || price || stock) && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  📋 Değişiklikler:
                </p>
                <div className="space-y-1 text-xs text-gray-700">
                  {name && (
                    <p>
                      • Ürün:{" "}
                      <span className="font-semibold text-blue-700">{name}</span>
                    </p>
                  )}
                  {price && (
                    <p>
                      • Fiyat:{" "}
                      <span className="font-semibold text-blue-700">
                        ₺{Number(price).toFixed(2)}
                      </span>
                    </p>
                  )}
                  {stock && (
                    <p>
                      • Stok:{" "}
                      <span className="font-semibold text-blue-700">
                        {stock} adet
                      </span>
                    </p>
                  )}
                  {selectedFile && (
                    <p>
                      • Resim:{" "}
                      <span className="font-semibold text-blue-700">
                        Yeni resim seçildi ✓
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
            onClick={onClose}
            disabled={loading}
            className="font-semibold text-gray-700 hover:bg-gray-200 px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            ✕ Vazgeç
          </button>
          <button
            onClick={handleUpdateProduct}
            disabled={loading || !name || !price}
            className="bg-linear-to-r from-blue-600 to-cyan-600 text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? "⏳ Kaydediliyor..." : "✓ Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
