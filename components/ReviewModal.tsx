"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { reviewsApi } from "@/lib/api";
import type { Review, ReviewsResponse } from "@/lib/types";

/* ── Yıldız Bileşeni ── */
const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = "text-xl",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: string;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${size} transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${
            star <= (hover || value) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </span>
  );
};

/* ── Puan Dağılım Çubuğu ── */
const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right font-semibold text-gray-600">{star} ★</span>
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-gray-500 text-xs">{count}</span>
    </div>
  );
};

/* ── Ana Modal ── */
interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | string;
  productName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
}) => {
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  /* Yeni yorum formu */
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* Düzenleme */
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => setMounted(true), []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getByProduct(productId);
      const data: ReviewsResponse = res.data;
      setReviews(data.reviews ?? []);
      setAvgRating(data.averageRating ?? 0);
      setTotalReviews(data.totalReviews ?? 0);
      setDistribution(data.ratingDistribution ?? {});
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (isOpen) fetchReviews();
  }, [isOpen, fetchReviews]);

  /* Gönder / Güncelle */
  const handleSubmit = async () => {
    if (!formComment.trim()) {
      setFormError("Yorum boş olamaz!");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingReview) {
        await reviewsApi.update(editingReview.id, {
          rating: formRating,
          title: formTitle || undefined,
          comment: formComment,
        });
      } else {
        await reviewsApi.create({
          productId,
          rating: formRating,
          title: formTitle || undefined,
          comment: formComment,
        });
      }
      setShowForm(false);
      setEditingReview(null);
      setFormRating(5);
      setFormTitle("");
      setFormComment("");
      fetchReviews();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || "Yorum gönderilemedi!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* Sil */
  const handleDelete = async (id: number) => {
    if (!confirm("Yorumu silmek istediğinize emin misiniz?")) return;
    try {
      await reviewsApi.delete(id);
      fetchReviews();
    } catch {
      alert("Yorum silinemedi!");
    }
  };

  /* Düzenle */
  const startEdit = (r: Review) => {
    setEditingReview(r);
    setFormRating(r.rating);
    setFormTitle(r.title ?? "");
    setFormComment(r.comment);
    setShowForm(true);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-blue-700">
              ⭐ Değerlendirmeler
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {/* İstatistikler */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col items-center justify-center min-w-[100px]">
                  <span className="text-4xl font-bold text-gray-900">
                    {Number(avgRating).toFixed(1)}
                  </span>
                  <StarRating value={Math.round(avgRating)} readonly size="text-lg" />
                  <span className="text-xs text-gray-500 mt-1">
                    {totalReviews} değerlendirme
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <RatingBar
                      key={s}
                      star={s}
                      count={distribution[String(s)] ?? 0}
                      total={totalReviews}
                    />
                  ))}
                </div>
              </div>

              {/* Yorum Yaz Butonu */}
              {token && !showForm && (
                <button
                  onClick={() => {
                    setEditingReview(null);
                    setFormRating(5);
                    setFormTitle("");
                    setFormComment("");
                    setShowForm(true);
                  }}
                  className="w-full mb-5 py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  ✏️ Yorum Yaz
                </button>
              )}

              {/* Yorum Formu */}
              {showForm && (
                <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                  <h3 className="font-bold text-gray-800">
                    {editingReview ? "Yorumu Düzenle" : "Yeni Yorum"}
                  </h3>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Puanınız
                    </label>
                    <StarRating value={formRating} onChange={setFormRating} size="text-2xl" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Başlık (opsiyonel)
                    </label>
                    <input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Kısa bir başlık"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Yorumunuz
                    </label>
                    <textarea
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition-colors resize-none"
                      placeholder="Deneyiminizi paylaşın..."
                    />
                  </div>

                  {formError && (
                    <p className="text-sm text-red-600 font-semibold">{formError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {submitting
                        ? "Gönderiliyor..."
                        : editingReview
                          ? "Güncelle"
                          : "Gönder"}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingReview(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}

              {/* Yorumlar Listesi */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="font-semibold">Henüz yorum yok</p>
                  <p className="text-sm">İlk yorumu siz yazın!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StarRating value={r.rating} readonly size="text-sm" />
                          {r.title && (
                            <span className="font-bold text-gray-800 text-sm">
                              {r.title}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {r.comment}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {r.user?.fullName ||
                            r.user?.email ||
                            `Kullanıcı #${r.userId}`}
                        </span>

                        {/* Kendi yorumu ise düzenle/sil */}
                        {token && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(r)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold"
                            >
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
