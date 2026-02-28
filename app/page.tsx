"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardFooter, Button, Image, Spinner } from "@heroui/react";
import { EditProductModal } from "@/components/EditProductModal";
import { ReviewModal } from "@/components/ReviewModal";
import { productsApi } from "@/lib/api";
import { authApi } from "@/lib/api";
import { cartApi } from "@/lib/api";
import { favoritesApi, reviewsApi } from "@/lib/api";
import type { ProductFilters, PaginationMeta } from "@/lib/types";

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

const SORT_OPTIONS = [
  { label: "Varsayılan", sortBy: "id" as const, order: "ASC" as const },
  { label: "Fiyat: Düşükten Yükseğe", sortBy: "price" as const, order: "ASC" as const },
  { label: "Fiyat: Yüksekten Düşüğe", sortBy: "price" as const, order: "DESC" as const },
  { label: "İsim: A-Z", sortBy: "name" as const, order: "ASC" as const },
  { label: "İsim: Z-A", sortBy: "name" as const, order: "DESC" as const },
  { label: "Stok: Azdan Çoğa", sortBy: "stock" as const, order: "ASC" as const },
  { label: "Stok: Çoktan Aza", sortBy: "stock" as const, order: "DESC" as const },
];

const ITEMS_PER_PAGE = 12;

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

  // Favori & Yorum state'leri
  const [favoriteIds, setFavoriteIds] = React.useState<Set<number>>(new Set());
  const [togglingFav, setTogglingFav] = React.useState<number | string | null>(null);
  const [reviewModal, setReviewModal] = React.useState<{ open: boolean; productId: number | string; productName: string }>({
    open: false, productId: 0, productName: "",
  });
  const [productRatings, setProductRatings] = React.useState<Record<string, { avg: number; count: number }>>({});

  // Arama & Filtreleme state'leri
  const [searchText, setSearchText] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [inStock, setInStock] = React.useState(false);
  const [sortIndex, setSortIndex] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [meta, setMeta] = React.useState<PaginationMeta | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  // Debounce timer ref
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
      await cartApi.add(productId, quantity);
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
      fetchFavorites();
    }
  }, []);

  const fetchUserRole = async (tk: string) => {
    try {
      const res = await authApi.me();
      const normalizedRole = (res.data?.role ?? "user").toString().toLowerCase();
      setUserRole(normalizedRole);
    } catch (error) {
      console.error("User info fetch hatası:", error);
    }
  };

  // Favorileri yükle
  const fetchFavorites = async () => {
    try {
      const res = await favoritesApi.getAll();
      const raw = res.data;
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.favorites)
              ? raw.favorites
              : [];
      const ids = new Set<number>(items.map((f: any) => Number(f.productId)));
      setFavoriteIds(ids);
    } catch {
      // giriş yapılmamışsa sessizce geç
    }
  };

  // Favori toggle
  const toggleFavorite = async (productId: number | string) => {
    if (!token) {
      alert("Favorilere eklemek için giriş yapmalısınız!");
      window.location.href = "/login";
      return;
    }
    const numId = Number(productId);
    setTogglingFav(productId);
    try {
      if (favoriteIds.has(numId)) {
        await favoritesApi.remove(productId);
        setFavoriteIds((prev) => { const s = new Set(prev); s.delete(numId); return s; });
      } else {
        await favoritesApi.add(productId);
        setFavoriteIds((prev) => new Set(prev).add(numId));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Favori işlemi başarısız!");
    } finally {
      setTogglingFav(null);
    }
  };

  // Ürün puanlarını toplu yükle
  const fetchRatingsForProducts = async (productList: Product[]) => {
    const ratings: Record<string, { avg: number; count: number }> = {};
    await Promise.allSettled(
      productList.map(async (p) => {
        if (!p.id) return;
        try {
          const res = await reviewsApi.getStats(p.id);
          ratings[String(p.id)] = {
            avg: res.data?.averageRating ?? 0,
            count: res.data?.totalReviews ?? 0,
          };
        } catch {
          ratings[String(p.id)] = { avg: 0, count: 0 };
        }
      })
    );
    setProductRatings((prev) => ({ ...prev, ...ratings }));
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
      await productsApi.delete(productId);
      alert("Ürün başarıyla silindi! 🗑️");
      fetchProducts();
    } catch (error: any) {
      console.error("Ürün silme hatası:", error);
      alert(error?.response?.data?.message || "Ürün silinemedi!");
    } finally {
      setDeletingProductId(null);
    }
  };

  // Ürünleri yükleme fonksiyonu
  const fetchProducts = React.useCallback(
    async (pageOverride?: number) => {
      setLoading(true);
      setError(null);

      const sort = SORT_OPTIONS[sortIndex];
      const filters: ProductFilters = {
        page: pageOverride ?? currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (searchText.trim()) filters.search = searchText.trim();
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (inStock) filters.inStock = true;
      if (sort.sortBy !== "id" || sort.order !== "ASC") {
        filters.sortBy = sort.sortBy;
        filters.order = sort.order;
      }

      try {
        const res = await productsApi.getAll(filters);
        const data = res.data;

        // Yeni format: { data: [...], meta: {...} }
        if (data?.data && data?.meta) {
          setProducts(data.data);
          setMeta(data.meta);
          fetchRatingsForProducts(data.data);
        } else {
          // Eski format fallback
          const list: Product[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.products)
              ? data.products
              : [];
          setProducts(list);
          setMeta(null);
          fetchRatingsForProducts(list);
        }
      } catch (e: any) {
        setError(e?.message ?? "Ürünler alınamadı.");
      } finally {
        setLoading(false);
      }
    },
    [searchText, minPrice, maxPrice, inStock, sortIndex, currentPage]
  );

  // İlk yükleme ve filtre değişikliklerinde fetch
  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Arama inputu debounce
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchText(value);
      setCurrentPage(1);
    }, 400);
  };

  // Filtreleri uygula
  const handleApplyFilters = () => {
    setCurrentPage(1);
    // fetchProducts zaten currentPage/filtre değişince tetikleniyor
  };

  // Filtreleri sıfırla
  const handleClearFilters = () => {
    setSearchInput("");
    setSearchText("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSortIndex(0);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchText || minPrice || maxPrice || inStock || sortIndex !== 0;

  // Sayfa değiştirme
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sayfalama butonları oluştur
  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const tp = meta.totalPages;
    const cp = meta.page;

    // Her zaman ilk sayfa
    pages.push(1);

    if (cp > 3) pages.push("...");

    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) {
      pages.push(i);
    }

    if (cp < tp - 2) pages.push("...");

    // Her zaman son sayfa (tek sayfa değilse)
    if (tp > 1) pages.push(tp);

    return (
      <div className="flex flex-col items-center gap-4 mt-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(cp - 1)}
            disabled={cp <= 1}
            className="px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Önceki
          </button>

          {pages.map((p, i) =>
            typeof p === "string" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  p === cp
                    ? "bg-blue-600 text-white shadow-md"
                    : "border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(cp + 1)}
            disabled={cp >= tp}
            className="px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sonraki →
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Toplam <strong>{meta.total}</strong> ürün — Sayfa{" "}
          <strong>{meta.page}</strong> / <strong>{meta.totalPages}</strong>
        </p>
      </div>
    );
  };

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

        {/* ─── ARAMA & FİLTRE BÖLÜMÜ ─── */}
        <div className="max-w-6xl mx-auto mb-8">
          {/* Arama Çubuğu */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Ürün ara... (isim veya açıklama)"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); setSearchText(""); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                showFilters
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <span>⚙️</span>
              Filtreler
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* Filtre Paneli */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-4 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Minimum Fiyat */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Min Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>

                {/* Maksimum Fiyat */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Max Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    placeholder="100000"
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>

                {/* Sıralama */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Sıralama
                  </label>
                  <select
                    value={sortIndex}
                    onChange={(e) => { setSortIndex(Number(e.target.value)); setCurrentPage(1); }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  >
                    {SORT_OPTIONS.map((opt, i) => (
                      <option key={i} value={i}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stok Filtresi + Sıfırla */}
                <div className="flex flex-col justify-between">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => { setInStock(e.target.checked); setCurrentPage(1); }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Sadece Stokta Olanlar</span>
                  </label>

                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors text-left"
                    >
                      ✕ Filtreleri Temizle
                    </button>
                  )}
                </div>
              </div>

              {/* Aktif Filtre Etiketleri */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  {searchText && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      🔍 &quot;{searchText}&quot;
                      <button onClick={() => { setSearchInput(""); setSearchText(""); }} className="ml-1 hover:text-blue-900">✕</button>
                    </span>
                  )}
                  {minPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      Min: {minPrice}₺
                      <button onClick={() => setMinPrice("")} className="ml-1 hover:text-green-900">✕</button>
                    </span>
                  )}
                  {maxPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      Max: {maxPrice}₺
                      <button onClick={() => setMaxPrice("")} className="ml-1 hover:text-green-900">✕</button>
                    </span>
                  )}
                  {inStock && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      📦 Stokta Olanlar
                      <button onClick={() => setInStock(false)} className="ml-1 hover:text-amber-900">✕</button>
                    </span>
                  )}
                  {sortIndex !== 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      ↕️ {SORT_OPTIONS[sortIndex].label}
                      <button onClick={() => setSortIndex(0)} className="ml-1 hover:text-purple-900">✕</button>
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

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
            <div className="font-bold text-blue-900 text-xl">
              {hasActiveFilters ? "Filtrelere uygun ürün bulunamadı" : "Ürün bulunmadı"}
            </div>
            <p className="text-blue-700 mt-2">
              {hasActiveFilters
                ? "Farklı filtre kriterleri deneyebilirsiniz."
                : "Şu anda ürün listesi boş. Yakında eklenecek!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Sonuç bilgisi */}
            {meta && (
              <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  <strong>{meta.total}</strong> ürün bulundu
                  {hasActiveFilters && " (filtrelenmiş)"}
                </p>
              </div>
            )}

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
                      <div className="h-48 w-full bg-gray-100 flex items-center justify-center relative">
                        <Image
                          alt={getProductTitle(p)}
                          src={getProductImage(p, index)}
                          className="h-48 w-full object-contain"
                          radius="none"
                        />
                        {/* Favori Kalp */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id!); }}
                          disabled={togglingFav === p.id}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 border flex items-center justify-center shadow-sm transition-all hover:scale-110 disabled:opacity-50 ${
                            favoriteIds.has(Number(p.id))
                              ? "border-red-300 text-red-500 hover:bg-red-50"
                              : "border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"
                          }`}
                        >
                          {favoriteIds.has(Number(p.id)) ? "❤️" : "🤍"}
                        </button>
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

                        {/* Yıldız Puan & Yorum */}
                        {(() => {
                          const r = productRatings[String(p.id)];
                          return (
                            <button
                              onClick={() =>
                                setReviewModal({ open: true, productId: p.id!, productName: getProductTitle(p) })
                              }
                              className="mt-1.5 flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
                            >
                              <span className="text-yellow-400 flex gap-px">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <span key={s} className={s <= Math.round(r?.avg ?? 0) ? "" : "opacity-30"}>★</span>
                                ))}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {r && r.count > 0
                                  ? `${Number(r.avg).toFixed(1)} (${r.count})`
                                  : "Değerlendir"}
                              </span>
                            </button>
                          );
                        })()}
                      </div>

                      <div className="w-full pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="text-2xl font-bold text-blue-600">
                            {p.price !== undefined
                              ? `${parseFloat(String(p.price)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`
                              : "Fiyat Bilinmiyor"}
                          </div>
                          <button 
                            onClick={() => handleAddToCart(p.id)}
                            disabled={addingToCart === p.id || (p.stock !== undefined && p.stock <= 0)}
                            className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                          >
                            {addingToCart === p.id ? "Ekleniyor..." : "🛒 Sepete Ekle"}
                          </button>
                        </div>

                        {/* Stok bilgisi */}
                        {p.stock !== undefined && (
                          <p className={`text-xs font-medium ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                            {p.stock > 0 ? `✓ Stokta (${p.stock} adet)` : "✗ Stokta Yok"}
                          </p>
                        )}
                        
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

            {/* Sayfalama */}
            {renderPagination()}
          </>
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, productId: 0, productName: "" })}
        productId={reviewModal.productId}
        productName={reviewModal.productName}
      />

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
          fetchProducts();
        }}
      />
    </div>
  );
}
