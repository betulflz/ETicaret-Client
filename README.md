# TeknoStore Frontend

Next.js 16 ile oluşturulmuş modern e-ticaret platformu frontend'i.

## Özellikler

- 🛒 Ürün listeleme ve sepete ekleme
- 👤 Kullanıcı kimlik doğrulaması
- 👨‍💼 Admin paneli (ürün yönetimi)
- ✏️ Ürün düzenleme modalı
- 📱 Responsive tasarım
- ⚡ Framer Motion animasyonları

## Teknolojiler

- **Next.js 16** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Stil sistemi
- **HeroUI** - UI Bileşenleri
- **Axios** - HTTP client
- **Framer Motion** - Animasyonlar

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Frontend başlatılacak: `http://localhost:3001`

## Build

```bash
npm run build
npm start
```

## Yapı

```
frontend/
├── app/
│   ├── page.tsx              # Ana sayfa
│   ├── layout.tsx            # Layout template
│   ├── providers.tsx         # Context providers
│   ├── globals.css           # Global stiller
│   ├── login/
│   │   └── page.tsx         # Login sayfası
│   └── cart/
│       └── page.tsx         # Sepet sayfası
├── components/
│   ├── AppNavbar.tsx         # Üst navigasyon
│   ├── AppFooter.tsx         # Alt bilgiler
│   └── EditProductModal.tsx  # Ürün düzenleme modal
├── public/                   # Statik dosyalar
└── package.json             # Proje bağımlılıkları
```

## Ortam Değişkenleri

Backend URL'i sabit olarak kodlanmıştır:
- Backend: `http://localhost:3000`

Üretim ortamında `.env.local` dosyasında değerlendirilir.
