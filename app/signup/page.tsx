"use client";

import * as React from "react";
import axios from "axios";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/auth/signup", {
        email,
        password,
      });

      console.log("Kayıt başarılı:", res.data);
      setSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      console.error("Kayıt hatası:", err);
      setError(err?.response?.data?.message ?? err?.message ?? "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-gray-50">
      <section className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-linear-to-r from-emerald-600 to-emerald-700 text-white">
            <h1 className="text-3xl font-bold tracking-tight">Kayıt Ol</h1>
            <p className="text-sm text-emerald-100 mt-1">
              TeknoStore ailesine katılın ve alışverişe başlayın
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {error && (
              <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="font-semibold text-red-700 text-sm">⚠️ {error}</p>
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <p className="font-semibold text-emerald-700 text-sm">
                  ✅ Kayıt başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz...
                </p>
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full h-12 px-4 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre Tekrar
                </label>
                <input
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 placeholder-gray-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "Kayıt yapılıyor..." : "🚀 Kayıt Ol"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Hesabın var mı?{" "}
              <Link
                href="/login"
                className="text-emerald-600 hover:text-emerald-800 font-semibold"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
