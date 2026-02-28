import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — otomatik token ekleme
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — 401 durumunda otomatik logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Login sayfasında değilsek yönlendir
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Auth ─────────────────────────────────────────── */

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (data: { email: string; password: string; fullName?: string; gender?: string }) =>
    api.post("/auth/register", data),

  me: () => api.get("/auth/me"),

  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refresh_token: refreshToken }),
};

/* ─── Products ─────────────────────────────────────── */

export const productsApi = {
  getAll: (filters: import("./types").ProductFilters = {}) => {
    const { search, minPrice, maxPrice, inStock, sortBy, order, page = 1, limit = 12 } = filters;
    const params: Record<string, string | number | boolean> = { page, limit };
    if (search) params.search = search;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (inStock) params.inStock = true;
    if (sortBy) params.sortBy = sortBy;
    if (order) params.order = order;
    return api.get("/products", { params });
  },

  getById: (id: number | string) => api.get(`/products/${id}`),

  create: (formData: FormData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number | string, formData: FormData) =>
    api.patch(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: number | string) => api.delete(`/products/${id}`),
};

/* ─── Cart ─────────────────────────────────────────── */

export const cartApi = {
  get: () => api.get("/cart"),

  add: (productId: number | string, quantity: number) =>
    api.post("/cart/add", { productId: Number(productId), quantity: Number(quantity) }),

  update: (cartItemId: number | string, quantity: number) =>
    api.patch(`/cart/${cartItemId}`, { quantity }),

  remove: (cartItemId: number | string) => api.delete(`/cart/${cartItemId}`),

  clear: () => api.delete("/cart"),

  checkout: () => api.post("/cart/checkout"),
};

/* ─── Orders ───────────────────────────────────────── */

export const ordersApi = {
  /** Kullanıcının kendi siparişlerini getir */
  getMyOrders: () => api.get("/orders"),

  /** Yeni sipariş oluştur */
  create: (productId: number | string, quantity: number) =>
    api.post("/orders", { productId, quantity }),

  /** Admin: Tüm siparişleri getir (opsiyonel status filtresi) */
  getAllOrders: (status?: "PENDING" | "APPROVED" | "REJECTED") =>
    api.get("/admin/orders", { params: status ? { status } : {} }),

  /** Admin: Siparişi onayla */
  approve: (orderId: number | string) =>
    api.patch(`/admin/orders/${orderId}/approve`),

  /** Admin: Siparişi reddet */
  reject: (orderId: number | string) =>
    api.patch(`/admin/orders/${orderId}/reject`),
};

/* ─── Users ────────────────────────────────────────── */

export const usersApi = {
  getMe: () => api.get("/users/me"),

  updateMe: (data: Partial<{ fullName: string; phone: string; gender: string; email: string }>) =>
    api.patch("/users/me", data),
};

/* ─── Favorites ────────────────────────────────────── */

export const favoritesApi = {
  /** Favorilere ürün ekle */
  add: (productId: number | string) =>
    api.post("/favorites", { productId: Number(productId) }),

  /** Favori listesini getir */
  getAll: () => api.get("/favorites"),

  /** Ürün favorilerde mi kontrol et */
  check: (productId: number | string) =>
    api.get(`/favorites/check/${productId}`),

  /** Ürünü kaç kişi favoriledi */
  count: (productId: number | string) =>
    api.get(`/favorites/count/${productId}`),

  /** Favorilerden ürün çıkar (productId ile) */
  remove: (productId: number | string) =>
    api.delete(`/favorites/${productId}`),

  /** Tüm favorileri temizle */
  clearAll: () => api.delete("/favorites"),
};

/* ─── Reviews ──────────────────────────────────────── */

export const reviewsApi = {
  /** Yorum yaz */
  create: (data: { productId: number | string; rating: number; title?: string; comment: string }) =>
    api.post("/reviews", { ...data, productId: Number(data.productId) }),

  /** Bir ürünün tüm yorumlarını getir (public) */
  getByProduct: (productId: number | string) =>
    api.get(`/reviews/product/${productId}`),

  /** Ürünün puan istatistikleri (public) */
  getStats: (productId: number | string) =>
    api.get(`/reviews/stats/${productId}`),

  /** Kullanıcının kendi yorumları */
  getMyReviews: () => api.get("/reviews/my"),

  /** Tek bir yorumu getir */
  getById: (id: number | string) => api.get(`/reviews/${id}`),

  /** Yorumu güncelle */
  update: (id: number | string, data: Partial<{ rating: number; title: string; comment: string }>) =>
    api.patch(`/reviews/${id}`, data),

  /** Yorumu sil */
  delete: (id: number | string) => api.delete(`/reviews/${id}`),
};

export default api;
