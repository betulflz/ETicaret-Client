/* ─── Ortak Tipler ─────────────────────────────────── */

export interface User {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  gender?: string;
  role: "customer" | "admin";
}

export interface Product {
  id: number | string;
  name?: string;
  title?: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  averageRating?: string | number;
  reviewCount?: number;
}

/* ─── Favori Tipleri ───────────────────────────────── */

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  product?: Product;
  createdAt: string;
}

export interface FavoriteListResponse {
  items: Favorite[];
  count: number;
}

/* ─── Yorum / Review Tipleri ───────────────────────── */

export interface Review {
  id: number;
  userId: number;
  productId: number;
  product?: Partial<Product>;
  user?: Partial<User>;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

/* ─── Ürün Filtreleme & Sayfalama Tipleri ──────────── */

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "name" | "stock" | "id";
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

export interface CartItem {
  id: number;
  userId: number;
  user?: Partial<User>;
  productId: number;
  product?: Product;
  quantity: number;
  createdAt: string;
}

export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Order {
  id: number;
  userId: number;
  productId: number;
  product?: Product;
  user?: Partial<User>;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/* ─── Yardımcı Fonksiyonlar ────────────────────────── */

export function getProductTitle(p: Partial<Product>): string {
  return p.title ?? p.name ?? "Ürün";
}

export function getProductImage(p: Partial<Product>, index: number = 0): string {
  const src = p.imageUrl ?? p.image ?? p.thumbnail ?? null;
  if (src && src.trim().length > 0) return src;
  const seed = p.id ? Number(p.id) + 100 : index + 2;
  return `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/640/480`;
}

/** Sipariş durumunu Türkçe badge bilgisine dönüştür */
export function getOrderStatusInfo(status: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
    PENDING: {
      label: "Onay Bekliyor",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      icon: "⏳",
    },
    APPROVED: {
      label: "Onaylandı",
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      icon: "✅",
    },
    REJECTED: {
      label: "Reddedildi",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      icon: "❌",
    },
  };
  return map[status] ?? map.PENDING;
}

/** Tarih formatlayıcı */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

/** Fiyat formatlayıcı */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
}
