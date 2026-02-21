"use client";

import * as React from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardBody, CardFooter, Button, Image, Spinner } from "@heroui/react";
import { EditProductModal } from "@/components/EditProductModal";

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

function getProductTitle(p: Product) {
  return p.title ?? p.name ?? "Ürün";
}

function getProductImage(p: Product, index: number) {
  const src = p.imageUrl ?? p.image ?? p.thumbnail ?? null;
  if (src && src.trim().length > 0) return src;
  const seed = p.id ? Number(p.id) + 100 : index + 2;
  return `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/640/480`;
}

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addingToCart, setAddingToCart] = React.useState<number | string | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [deletingProductId, setDeletingProductId] = React.useState<number | string | null>(null);

  const handleAddToCart = async (productId: number | string | undefined, quantity: number = 1) => {
    if (!productId) {
      alert("Ürün ID'si bulunamadı!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sepete eklemek için giriş yapmalısınız!");
      window.location.href = "/login";
      return;
    }

    setAddingToCart(productId);
    try {
      await axios.post(
        "http://localhost:3000/cart/add",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Ürün sepete eklendi! 🎉");
    } catch (error: any) {
      console.error("Sepete ekleme hatası:", error);
      alert(error?.response?.data?.message || "Sepete eklenemedi!");
    } finally {
      setAddingToCart(null);
    }
  };

  // Token ve user role'ü al
  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);

    if (savedToken) {
      fetchUserRole(savedToken);
    }
  }, []);

  const fetchUserRole = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalizedRole = (res.data?.role ?? "user").toString().toLowerCase();
      setUserRole(normalizedRole);
    } catch (error) {
      console.error("User info fetch hatası:", error);
    }
  };

  const handleDeleteProduct = async (productId: number | string | undefined) => {
    if (!productId) {
      alert("Ürün ID'si bulunamadı!");
      return;
    }

    if (!token) {
      alert("Silmek için giriş yapmalısınız!");
      return;
    }

    const confirmed = confirm("Bu ürünü silmek istediğinizden emin misiniz?");
    if (!confirmed) return;

    setDeletingProductId(productId);
    try {
      await axios.delete(`http://localhost:3000/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Ürün başarıyla silindi! 🗑️");
      
      // Ürünleri yeniden yükle
      const res = await axios.get("http://localhost:3000/products");
      const data = res.data;
      const list: Product[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];
      setProducts(list);
    } catch (error: any) {
      console.error("Ürün silme hatası:", error);
      alert(error?.response?.data?.message || "Ürün silinemedi!");
    } finally {
      setDeletingProductId(null);
    }
  };

  // Ürünleri yükle
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    axios
      .get("http://localhost:3000/products")
      .then((res) => {
        const data = res.data;
        const list: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];
        if (mounted) setProducts(list);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? "Ürünler alınamadı.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <section className="py-16 px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Teknolojinin En İyileri
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En yeni ve en kaliteli teknoloji ürünlerini keşfet. Güvenilir, hızlı ve uygun fiyatlı alışveriş
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Spinner label="Ürünler yükleniyor..." color="primary" size="lg" />
              <p className="text-gray-500 mt-4">Lütfen bekleyiniz...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="font-bold text-red-800">Bir sorun oluştu</div>
            <div className="text-red-700 mt-2">{error}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <div className="font-bold text-blue-900 text-xl">Ürün bulunmadı</div>
            <p className="text-blue-700 mt-2">Şu anda ürün listesi boş. Yakında eklenecek!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, index) => (
              <motion.div
                key={String(p.id ?? index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-2 border-gray-200 bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full overflow-hidden rounded-xl">
                  <CardBody className="p-0">
                    <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
                      <Image
                        alt={getProductTitle(p)}
                        src={getProductImage(p, index)}
                        className="h-48 w-full object-contain"
                        radius="none"
                      />
                    </div>
                  </CardBody>
                  <CardFooter className="flex flex-col items-start gap-3 p-5">
                    <div className="w-full">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-2">
                        {getProductTitle(p)}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {p.description ?? "Premium kalite ve hızlı teslimat garantisi"}
                      </p>
                    </div>

                    <div className="w-full pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-2xl font-bold text-blue-600">
                          {p.price !== undefined ? `${p.price} ₺` : "Fiyat Bilinmiyor"}
                        </div>
                        <button 
                          onClick={() => handleAddToCart(p.id)}
                          disabled={addingToCart === p.id}
                          className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {addingToCart === p.id ? "Ekleniyor..." : "🛒 Sepete Ekle"}
                        </button>
                      </div>
                      
                      {userRole === "admin" && (
                        <div className="w-full mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsEditModalOpen(true);
                            }}
                            className="flex-1 bg-yellow-500 text-white font-bold py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                          >
                            ✏️ Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            disabled={deletingProductId === p.id}
                            className="flex-1 bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                          >
                            {deletingProductId === p.id ? "Siliniyor..." : "🗑️ Sil"}
                          </button>
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* BANNER BÖLÜMÜ */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-16 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">🎁 Özel Teklifler</h2>
          <p className="text-lg mb-6 opacity-90">
            Her gün yeni ürünler ve en iyi fiyatları keşfet
          </p>
          <Button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Tüm Teklifleri Gör
          </Button>
        </div>
      </section>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        product={editingProduct}
        token={token || ""}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          // Ürünleri yeniden yükle
          axios
            .get("http://localhost:3000/products")
            .then((res) => {
              const data = res.data;
              const list: Product[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.products)
                  ? data.products
                  : [];
              setProducts(list);
            })
            .catch((e) => {
              console.error("Ürünleri yeniden yükleme hatası:", e);
            });
        }}
      />
    </div>
  );
}
