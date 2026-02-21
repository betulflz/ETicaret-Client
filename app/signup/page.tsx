"use client";

import * as React from "react";
import axios from "axios";
import Link from "next/link";
import { Card, CardBody, CardHeader, Input, Button } from "@heroui/react";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex gap-3 bg-green-600 text-white rounded-t-lg">
          <div className="flex flex-col">
            <p className="text-lg font-bold">Kayıt Ol</p>
            <p className="text-sm">TeknoStore ailesine katılın</p>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p className="font-semibold">Hata</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
              <p className="font-semibold">Başarı!</p>
              <p className="text-sm">Kayıt başarıyla tamamlandı. Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          )}
          <form onSubmit={onSubmit} className="gap-4 flex flex-col">
            <Input
              autoFocus
              label="Email"
              placeholder="örnek@mail.com"
              variant="bordered"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Şifre"
              placeholder="En az 6 karakter"
              type="password"
              variant="bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              type="password"
              variant="bordered"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              color="success"
              type="submit"
              isLoading={loading}
              className="bg-green-600 text-white font-bold"
            >
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600">
            Hesabın var mı?{" "}
            <Link
              href="/login"
              className="text-green-600 hover:text-green-800 font-semibold"
            >
              Giriş Yap
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
