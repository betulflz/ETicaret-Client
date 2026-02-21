"use client";

import * as React from "react";
import axios from "axios";
import Link from "next/link";
import { Card, CardBody, CardHeader, Input, Button } from "@heroui/react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      // DEBUG İÇİN: Konsola bakıp ne geldiğini görebilirsin (F12 -> Console)
      console.log("Backend'den gelen yanıt:", res.data);

      // DÜZELTME BURADA: NestJS varsayılan olarak 'access_token' gönderir.
      // Buraya onu ekledik.
      const token: string | undefined =
        res.data?.access_token ?? res.data?.token ?? res.data?.accessToken;

      if (!token) {
        setError("Token alınamadı. API yanıtını kontrol edin (Konsola bakınız).");
        return;
      }

      // Token'ı kaydedip anasayfaya yönlendiriyoruz
      localStorage.setItem("token", token);
      window.location.href = "/";
      
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      // Backend'den gelen hata mesajını veya genel hatayı göster
      setError(err?.response?.data?.message ?? err?.message ?? "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50">

      <section className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="flex flex-col gap-3 p-8 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
            <div className="text-3xl font-bold tracking-tight">Giriş Yap</div>
            <div className="text-sm text-blue-100">
              Hesabına giriş yap ve alışverişe devam et
            </div>
          </CardHeader>

          <CardBody className="px-8 py-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">E-posta Adresi</label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Şifre</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 placeholder-gray-400"
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                  ⚠️ {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors text-base h-12"
                isLoading={loading}
              >
                {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>

              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Hesabın yok mu? 
                  <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline ml-1">
                    Kaydol
                  </Link>
                </p>
              </div>
            </form>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
