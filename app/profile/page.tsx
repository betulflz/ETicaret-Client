"use client";

import * as React from "react";
import axios from "axios";

export default function ProfilePage() {
  const [token, setToken] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | number | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      window.location.href = "/login";
      return;
    }
    setToken(savedToken);
    fetchProfile(savedToken);
  }, []);

  const fetchProfile = async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = res.data ?? {};
      setUserId(data?.id ?? data?.userId ?? null);
      setFirstName(data?.firstName ?? data?.name ?? "");
      setLastName(data?.lastName ?? data?.surname ?? "");
      setEmail(data?.email ?? "");
      setAvatarUrl(data?.avatarUrl ?? data?.avatar ?? "");
    } catch (e: any) {
      console.error("Profil bilgisi alınamadı:", e);
      setError(e?.response?.data?.message ?? "Profil bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!token) return;
    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.patch(
        "http://localhost:3000/users/profile/update",
        {
          firstName,
          lastName,
          email,
          avatarUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Profil bilgileri guncellendi.");
    } catch (e: any) {
      console.error("Profil guncelleme hatasi:", e);
      setError(e?.response?.data?.message ?? "Profil guncellenemedi.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) return;
    if (!userId) {
      setError("Kullanici kimligi bulunamadi.");
      return;
    }
    if (!oldPassword || !newPassword) {
      setError("Eski ve yeni sifre zorunludur.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Yeni sifreler eslesmiyor.");
      return;
    }

    setSavingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        `http://localhost:3000/users/${userId}/change-password`,
        {
          oldPassword,
          newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Sifre basariyla guncellendi.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      console.error("Sifre guncelleme hatasi:", e);
      setError(e?.response?.data?.message ?? "Sifre guncellenemedi.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 font-semibold">Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
          <p className="text-gray-600 mt-2">Kisisel bilgilerinizi guncelleyebilirsiniz.</p>
        </header>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">
            {success}
          </div>
        ) : null}

        <section className="rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profil Bilgileri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ad</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Ad"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Soyad"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="ornek@mail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleProfileUpdate}
              disabled={savingProfile}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {savingProfile ? "Kaydediliyor..." : "Profili Guncelle"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sifre Guncelle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Eski Sifre</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Eski sifre"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Yeni Sifre</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Yeni sifre"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Yeni Sifre (Tekrar)</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-gray-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Yeni sifreyi tekrar girin"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handlePasswordChange}
              disabled={savingPassword}
              className="rounded-lg bg-gray-900 px-6 py-2 text-white font-semibold hover:bg-gray-800 disabled:opacity-60"
            >
              {savingPassword ? "Guncelleniyor..." : "Sifreyi Guncelle"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
