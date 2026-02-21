# E-Ticaret Backend API Dokumentasyonu

## 📋 İçindekiler

- [Genel Bilgiler](#genel-bilgiler)
- [Kimlik Doğrulama](#kimlik-doğrulama)
- [Kullanıcı Endpointleri](#kullanıcı-endpointleri)
- [Ürün Endpointleri](#ürün-endpointleri)
- [Sepet Endpointleri](#sepet-endpointleri)
- [Sipariş Endpointleri](#sipariş-endpointleri)
- [Dosya Yükleme Endpointleri](#dosya-yükleme-endpointleri)
- [Durum Kodları](#durum-kodları)
- [Error Handling](#error-handling)
- [Data Models](#data-models)

---

## Genel Bilgiler

**Base URL:** `http://localhost:3000`

**Content-Type:** `application/json`

**Kimlik Doğrulama:** JWT Token (Header: `Authorization: Bearer <token>`)

---

## Kimlik Doğrulama

### POST /auth/register

Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "gender": "male"
}
```

**Request Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| email | string | ✅ | Geçerli bir e-posta adresi (unique) |
| password | string | ✅ | En az 6 karakter |
| fullName | string | ❌ | Kullanıcı adı |
| gender | string | ❌ | Cinsiyet (male/female/other) |

**Response (201 - Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "gender": "male",
  "phone": null,
  "role": "customer"
}
```

**Response (400 - Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Geçerli bir e-posta giriniz",
  "error": "Bad Request"
}
```

---

### POST /auth/login

Kullanıcı giriş yaparak JWT token alır.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| email | string | ✅ | Kayıtlı e-posta adresi |
| password | string | ✅ | Doğru şifre |

**Response (200 - OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "gender": "male",
    "role": "customer"
  }
}
```

**Response (401 - Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "E-posta veya şifre hatalı",
  "error": "Unauthorized"
}
```

---

### POST /auth/refresh

Ermiş olan access token'ı yeniler.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| refresh_token | string | ✅ | Geçerli refresh token |

**Response (200 - OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 - Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Geçersiz token",
  "error": "Unauthorized"
}
```

---

### GET /auth/me

Güncel kullanıcı profilini getirir. (Korumalı: Token gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 - OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+905551234567",
  "gender": "male",
  "role": "customer"
}
```

**Response (401 - Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Geçersiz token",
  "error": "Unauthorized"
}
```

---

## Kullanıcı Endpointleri

### POST /users

Yeni kullanıcı oluşturur.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password456",
  "fullName": "Jane Doe",
  "gender": "female"
}
```

**Response (201 - Created):**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "fullName": "Jane Doe",
  "gender": "female",
  "phone": null,
  "role": "customer"
}
```

---

### GET /users

Tüm kullanıcıları listeler.

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+905551234567",
    "gender": "male",
    "role": "customer"
  },
  {
    "id": 2,
    "email": "newuser@example.com",
    "fullName": "Jane Doe",
    "phone": null,
    "gender": "female",
    "role": "customer"
  }
]
```

---

### GET /users/me

Kendi profilini getirir. (Korumalı: Token gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 - OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+905551234567",
  "gender": "male",
  "role": "customer"
}
```

---

### PATCH /users/me

Kendi profilini günceller. (Korumalı: Token gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Updated",
  "phone": "+905559876543",
  "gender": "male"
}
```

**Request Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| email | string | ❌ | E-posta adresi |
| password | string | ❌ | Şifre |
| fullName | string | ❌ | Ad ve Soyad |
| phone | string | ❌ | Telefon numarası |
| gender | string | ❌ | Cinsiyet |

**Response (200 - OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Updated",
  "phone": "+905559876543",
  "gender": "male",
  "role": "customer"
}
```

---

### GET /users/:id

Belirtilen ID'ye sahip kullanıcıyı getirir.

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Kullanıcı ID'si |

**Response (200 - OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+905551234567",
  "gender": "male",
  "role": "customer"
}
```

**Response (404 - Not Found):**
```json
{
  "statusCode": 404,
  "message": "Kullanıcı bulunamadı",
  "error": "Not Found"
}
```

---

### PATCH /users/:id

Belirtilen ID'ye sahip kullanıcıyı günceller.

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Kullanıcı ID'si |

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "fullName": "John Updated",
  "phone": "+905559876543"
}
```

**Response (200 - OK):**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "fullName": "John Updated",
  "phone": "+905559876543",
  "gender": "male",
  "role": "customer"
}
```

---

### DELETE /users/:id

Belirtilen ID'ye sahip kullanıcıyı siler.

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Kullanıcı ID'si |

**Response (200 - OK):**
```json
{
  "message": "Kullanıcı başarıyla silindi"
}
```

**Response (404 - Not Found):**
```json
{
  "statusCode": 404,
  "message": "Kullanıcı bulunamadı",
  "error": "Not Found"
}
```

---

## Ürün Endpointleri

### POST /products

Yeni ürün oluşturur. (Korumalı: Admin yetkisi gerekli, Resim yükleme)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Form Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| name | string | ✅ | Ürün adı |
| description | string | ✅ | Ürün açıklaması |
| price | number | ✅ | Ürün fiyatı (Decimal) |
| stock | number | ✅ | Stok miktarı |
| image | file | ❌ | Resim dosyası (jpg, jpeg, png, gif) |

**Request Example (cURL):**
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <token>" \
  -F "name=Laptop" \
  -F "description=High-performance laptop" \
  -F "price=1299.99" \
  -F "stock=50" \
  -F "image=@/path/to/image.jpg"
```

**Response (201 - Created):**
```json
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 1299.99,
  "stock": 50,
  "imageUrl": "http://localhost:3000/uploads/1708520342000-123456789.jpg"
}
```

**Response (400 - Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Sadece resim dosyaları yüklenebilir!",
  "error": "Bad Request"
}
```

**Response (403 - Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Admin yetkisi gerekli",
  "error": "Forbidden"
}
```

---

### GET /products

Tüm ürünleri listeler.

**Query Parameters:** Hiçbiri

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 1299.99,
    "stock": 50,
    "imageUrl": "http://localhost:3000/uploads/1708520342000-123456789.jpg"
  },
  {
    "id": 2,
    "name": "Mouse",
    "description": "Wireless mouse",
    "price": 29.99,
    "stock": 200,
    "imageUrl": "http://localhost:3000/uploads/1708520400000-987654321.jpg"
  }
]
```

---

### GET /products/:id

Belirtilen ID'ye sahip ürünü getirir.

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Ürün ID'si |

**Response (200 - OK):**
```json
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 1299.99,
  "stock": 50,
  "imageUrl": "http://localhost:3000/uploads/1708520342000-123456789.jpg"
}
```

**Response (404 - Not Found):**
```json
{
  "statusCode": 404,
  "message": "Ürün bulunamadı",
  "error": "Not Found"
}
```

---

### PATCH /products/:id

Belirtilen ID'ye sahip ürünü günceller. (Korumalı: Admin yetkisi gerekli, Resim yükleme opsiyonel)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Ürün ID'si |

**Form Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| name | string | ❌ | Ürün adı |
| description | string | ❌ | Ürün açıklaması |
| price | number | ❌ | Ürün fiyatı |
| stock | number | ❌ | Stok miktarı |
| image | file | ❌ | Yeni resim dosyası |

**Request Example (cURL):**
```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer <token>" \
  -F "price=1199.99" \
  -F "stock=45" \
  -F "image=@/path/to/new-image.jpg"
```

**Response (200 - OK):**
```json
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 1199.99,
  "stock": 45,
  "imageUrl": "http://localhost:3000/uploads/1708520450000-456789012.jpg"
}
```

---

## Sepet Endpointleri

**NOT:** Tüm sepet endpointleri korumalıdır ve JWT token gereklidir.

### POST /cart/add

Sepete ürün ekler. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Request Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| productId | number | ✅ | Ürün ID'si |
| quantity | number | ✅ | Miktar (minimum 1) |

**Response (201 - Created):**
```json
{
  "id": 1,
  "userId": 1,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "productId": 1,
  "product": {
    "id": 1,
    "name": "Laptop",
    "price": 1299.99
  },
  "quantity": 2,
  "createdAt": "2024-02-21T10:30:00.000Z"
}
```

**Response (400 - Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Ürün ID'si zorunludur",
  "error": "Bad Request"
}
```

---

### GET /cart

Sepeti görüntüler. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "productId": 1,
    "product": {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 1299.99,
      "stock": 50,
      "imageUrl": "http://localhost:3000/uploads/1708520342000-123456789.jpg"
    },
    "quantity": 2,
    "createdAt": "2024-02-21T10:30:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "productId": 2,
    "product": {
      "id": 2,
      "name": "Mouse",
      "description": "Wireless mouse",
      "price": 29.99,
      "stock": 200,
      "imageUrl": "http://localhost:3000/uploads/1708520400000-987654321.jpg"
    },
    "quantity": 1,
    "createdAt": "2024-02-21T10:35:00.000Z"
  }
]
```

---

### PATCH /cart/:id

Sepetteki ürünün miktarını günceller. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Sepet ürün ID'si |

**Request Body:**
```json
{
  "quantity": 5
}
```

**Request Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| quantity | number | ✅ | Yeni miktar (minimum 1) |

**Response (200 - OK):**
```json
{
  "id": 1,
  "userId": 1,
  "productId": 1,
  "quantity": 5,
  "createdAt": "2024-02-21T10:30:00.000Z"
}
```

---

### DELETE /cart/:id

Sepetten belirtilen ürünü çıkarır. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Sepet ürün ID'si |

**Response (200 - OK):**
```json
{
  "message": "Ürün sepetten çıkarıldı"
}
```

---

### DELETE /cart

Sepeti tamamen boşaltır. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 - OK):**
```json
{
  "message": "Sepet temizlendi"
}
```

---

### POST /cart/checkout

Sepeti onayla ve satın al. Stoktan düşer. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (201 - Created):**
```json
{
  "message": "Satın alma başarılı",
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 2,
      "totalPrice": 2599.98,
      "status": "PENDING",
      "createdAt": "2024-02-21T10:45:00.000Z",
      "updatedAt": "2024-02-21T10:45:00.000Z"
    },
    {
      "id": 2,
      "userId": 1,
      "productId": 2,
      "quantity": 1,
      "totalPrice": 29.99,
      "status": "PENDING",
      "createdAt": "2024-02-21T10:45:00.000Z",
      "updatedAt": "2024-02-21T10:45:00.000Z"
    }
  ]
}
```

**Response (400 - Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Sepet boş",
  "error": "Bad Request"
}
```

---

## Sipariş Endpointleri

### POST /orders

Yeni sipariş oluşturur. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 1
}
```

**Request Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| productId | number | ✅ | Ürün ID'si |
| quantity | number | ✅ | Miktar (minimum 1) |

**Response (201 - Created):**
```json
{
  "id": 3,
  "userId": 1,
  "productId": 1,
  "quantity": 1,
  "totalPrice": 1299.99,
  "status": "PENDING",
  "createdAt": "2024-02-21T10:50:00.000Z",
  "updatedAt": "2024-02-21T10:50:00.000Z"
}
```

---

### GET /orders

Kullanıcının kendi siparişlerini listeler. (Korumalı)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "totalPrice": 2599.98,
    "status": "PENDING",
    "createdAt": "2024-02-21T10:45:00.000Z",
    "updatedAt": "2024-02-21T10:45:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "productId": 2,
    "quantity": 1,
    "totalPrice": 29.99,
    "status": "APPROVED",
    "createdAt": "2024-02-21T10:45:00.000Z",
    "updatedAt": "2024-02-21T11:00:00.000Z"
  }
]
```

---

### GET /admin/orders

Tüm siparişleri listeler. (Korumalı: Admin yetkisi gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| status | string | ❌ | Filtreleme: PENDING, APPROVED, REJECTED |

**Example:** `GET /admin/orders?status=PENDING`

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "totalPrice": 2599.98,
    "status": "PENDING",
    "createdAt": "2024-02-21T10:45:00.000Z",
    "updatedAt": "2024-02-21T10:45:00.000Z"
  },
  {
    "id": 3,
    "userId": 2,
    "productId": 2,
    "quantity": 1,
    "totalPrice": 29.99,
    "status": "PENDING",
    "createdAt": "2024-02-21T10:50:00.000Z",
    "updatedAt": "2024-02-21T10:50:00.000Z"
  }
]
```

**Response (403 - Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Admin yetkisi gerekli",
  "error": "Forbidden"
}
```

---

### PATCH /admin/orders/:id/approve

Siparişi onaylar. (Korumalı: Admin yetkisi gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Sipariş ID'si |

**Response (200 - OK):**
```json
{
  "id": 1,
  "userId": 1,
  "productId": 1,
  "quantity": 2,
  "totalPrice": 2599.98,
  "status": "APPROVED",
  "createdAt": "2024-02-21T10:45:00.000Z",
  "updatedAt": "2024-02-21T11:00:00.000Z"
}
```

---

### PUT /admin/orders/:id/approve

Siparişi onaylar (alternatif endpoint). (Korumalı: Admin yetkisi gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Sipariş ID'si |

**Response (200 - OK):**
```json
{
  "id": 1,
  "userId": 1,
  "productId": 1,
  "quantity": 2,
  "totalPrice": 2599.98,
  "status": "APPROVED",
  "createdAt": "2024-02-21T10:45:00.000Z",
  "updatedAt": "2024-02-21T11:00:00.000Z"
}
```

---

### PATCH /admin/orders/:id/reject

Siparişi reddeder. (Korumalı: Admin yetkisi gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Sipariş ID'si |

**Response (200 - OK):**
```json
{
  "id": 1,
  "userId": 1,
  "productId": 1,
  "quantity": 2,
  "totalPrice": 2599.98,
  "status": "REJECTED",
  "createdAt": "2024-02-21T10:45:00.000Z",
  "updatedAt": "2024-02-21T11:00:00.000Z"
}
```

---

### PUT /admin/orders/:id/reject

Siparişi reddeder (alternatif endpoint). (Korumalı: Admin yetkisi gerekli)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | number | ✅ | Sipariş ID'si |

**Response (200 - OK):**
```json
{
  "id": 1,
  "userId": 1,
  "productId": 1,
  "quantity": 2,
  "totalPrice": 2599.98,
  "status": "REJECTED",
  "createdAt": "2024-02-21T10:45:00.000Z",
  "updatedAt": "2024-02-21T11:00:00.000Z"
}
```

---

## Dosya Yükleme Endpointleri

### POST /files/upload

Resim dosyası yükler.

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Parameters:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| file | file | ✅ | Resim dosyası (jpg, jpeg, png, gif) |

**Request Example (cURL):**
```bash
curl -X POST http://localhost:3000/files/upload \
  -F "file=@/path/to/image.jpg"
```

**Response (201 - Created):**
```json
{
  "imageUrl": "http://localhost:3000/uploads/1708520342000-123456789.jpg"
}
```

**Response (400 - Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Sadece resim dosyaları yüklenebilir!",
  "error": "Bad Request"
}
```

---

## Genel Endpointler

### GET /

Sunucunun sağlıklı çalıştığını kontrol eder.

**Response (200 - OK):**
```
Hello World!
```

---

## Durum Kodları

| Kod | Anlam | Açıklama |
|-----|-------|----------|
| 200 | OK | İstek başarılı |
| 201 | Created | Kaynak başarıyla oluşturuldu |
| 400 | Bad Request | Geçersiz istek |
| 401 | Unauthorized | Kimlik doğrulaması yapılması gerekli |
| 403 | Forbidden | Erişim reddedildi (Yetersiz izin) |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | Çakışma (örn. Kullanıcı zaten var) |
| 500 | Internal Server Error | Sunucu hatası |

---

## Error Handling

### Standart Error Response

Tüm hatalar aşağıdaki formatta döner:

```json
{
  "statusCode": 400,
  "message": "Hata açıklaması",
  "error": "Error Type"
}
```

### Yaygın Error Mesajları

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": "Geçerli bir e-posta giriniz",
  "error": "Bad Request"
}
```

**Unauthorized Error:**
```json
{
  "statusCode": 401,
  "message": "Geçersiz token veya token bulunamadı",
  "error": "Unauthorized"
}
```

**Forbidden Error:**
```json
{
  "statusCode": 403,
  "message": "Bu işlemi gerçekleştirmek için yetkiniz yoktur",
  "error": "Forbidden"
}
```

**Resource Not Found Error:**
```json
{
  "statusCode": 404,
  "message": "Aranan kaynak bulunamadı",
  "error": "Not Found"
}
```

---

## Data Models

### User Entity

```typescript
{
  id: number;              // Birincil anahtar, otomatik artan
  email: string;           // Unique, geçerli e-posta formatı
  password: string;        // Hash'lenmiş şifre
  fullName?: string;       // İsteğe bağlı
  phone?: string;          // İsteğe bağlı
  gender?: string;         // İsteğe bağlı (male/female/other)
  role: string;            // Varsayılan: "customer", örn: "admin"
  refreshTokens: RefreshToken[]; // Bir çok refresh token
}
```

### Product Entity

```typescript
{
  id: number;              // Birincil anahtar, otomatik artan
  name: string;            // Ürün adı
  description: string;     // Ürün açıklaması
  price: number;           // Fiyat (Decimal)
  stock: number;           // Stok adedi
  imageUrl?: string;       // Resim URL'i (isteğe bağlı)
}
```

### Cart Entity

```typescript
{
  id: number;              // Birincil anahtar, otomatik artan
  user: User;              // Kullanıcı referansı
  userId: number;          // Kullanıcı ID'si
  product: Product;        // Ürün referansı
  productId: number;       // Ürün ID'si
  quantity: number;        // Ürün miktarı
  createdAt: Date;         // Oluşturulma tarihi
}
```

### Order Entity

```typescript
{
  id: number;              // Birincil anahtar, otomatik artan
  user: User;              // Sipariş veren kullanıcı
  product: Product;        // Sipariş edilen ürün
  quantity: number;        // Satın alınan miktar
  totalPrice: number;      // Toplam fiyat (Decimal)
  status: string;          // Durum: PENDING, APPROVED, REJECTED
  createdAt: Date;         // Oluşturulma tarihi
  updatedAt: Date;         // Son güncelleme tarihi
}
```

### RefreshToken Entity

```typescript
{
  id: number;              // Birincil anahtar, otomatik artan
  token: string;           // Refresh token değeri
  user: User;              // İlişkili kullanıcı
  expiresAt: Date;         // Token geçerlilik bitiş tarihi
}
```

---

## Authentication Flow

### 1. Kullanıcı Kaydı

```
POST /auth/register
├── Body: { email, password, fullName, gender }
└── Response: User objeleri (ID ile)
```

### 2. Giriş Yapma

```
POST /auth/login
├── Body: { email, password }
└── Response: { access_token, refresh_token, user }
```

### 3. Protected Route'a Erişim

```
GET /users/me
├── Header: Authorization: Bearer <access_token>
└── Response: User objesi
```

### 4. Token Yenileme (Access Token Süresi Dolduysa)

```
POST /auth/refresh
├── Body: { refresh_token }
└── Response: { access_token, refresh_token }
```

---

## Role-Based Access Control (RBAC)

### Roller

- **customer**: Normal kullanıcı (varsayılan)
- **admin**: Yönetici

### Admin-Sadece Endpointleri

| Endpoint | Metod |
|----------|-------|
| /products | POST |
| /products/:id | PATCH |
| /admin/orders | GET |
| /admin/orders/:id/approve | PATCH, PUT |
| /admin/orders/:id/reject | PATCH, PUT |

---

## Örnek Kullanım Senaryoları

### Senaryo 1: Kullanıcı Kaydı ve Girişi

```bash
# 1. Kaydol
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'

# 2. Giriş yap
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
  
# Response:
# {
#   "access_token": "...",
#   "refresh_token": "...",
#   "user": { ... }
# }

# 3. Profili görüntüle
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Senaryo 2: Ürün Ekleme ve Listeleme

```bash
# 1. Ürün ekle (Admin)
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <admin_token>" \
  -F "name=Laptop" \
  -F "description=High-performance" \
  -F "price=1299.99" \
  -F "stock=50" \
  -F "image=@laptop.jpg"

# 2. Ürünleri listele
curl -X GET http://localhost:3000/products

# 3. Belirtilen ürünü bul
curl -X GET http://localhost:3000/products/1
```

### Senaryo 3: Sepete Ürün Ekleme ve Satın Alma

```bash
# 1. Sepete ürün ekle
curl -X POST http://localhost:3000/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'

# 2. Sepeti görüntüle
curl -X GET http://localhost:3000/cart \
  -H "Authorization: Bearer <token>"

# 3. Satın al (Checkout)
curl -X POST http://localhost:3000/cart/checkout \
  -H "Authorization: Bearer <token>"
```

### Senaryo 4: Sipariş Yönetimi (Admin)

```bash
# 1. Tüm siparişleri görüntüle
curl -X GET http://localhost:3000/admin/orders \
  -H "Authorization: Bearer <admin_token>"

# 2. Beklemede olan siparişleri filtrele
curl -X GET http://localhost:3000/admin/orders?status=PENDING \
  -H "Authorization: Bearer <admin_token>"

# 3. Siparişi onayla
curl -X PATCH http://localhost:3000/admin/orders/1/approve \
  -H "Authorization: Bearer <admin_token>"

# 4. Siparişi reddet
curl -X PATCH http://localhost:3000/admin/orders/1/reject \
  -H "Authorization: Bearer <admin_token>"
```

---

## Notlar ve İpuçları

1. **Token Yönetimi**: Access token kısa zamanlı (genellikle 15 dakika), refresh token uzun zamanlı (genellikle 7 gün). Ermiş token için `/auth/refresh` kultan.

2. **Resim Yükleme**: Ürün oluşturma/güncelleme sırasında resim isteğe bağlıdır. Ancak resim URL'i sağlanırsa, ürün detaylarında gösterilecektir.

3. **Admin Yetkisi**: Admin işlemleri için JWT token'inda role alanının "admin" olması gerekir.

4. **Validasyon**: Tüm DTO parametreleri sunucu tarafında doğrulanır. Validasyon hatalarında 400 durum kodu döner.

5. **Fiyat Format**: Tüm fiyatlar `Decimal` türüdür (örn: 1299.99).

6. **Stok Kontrolü**: Satın alma sırasında stok otomatik olarak güncellenir.

7. **Sipariş Durumları**:
   - `PENDING`: Sipariş oluşturulmuş, admin onayı bekleniyor
   - `APPROVED`: Admin tarafından onaylandı
   - `REJECTED`: Admin tarafından reddedildi

---

## Troubleshooting

### Problem: "Token bulunamadı" hatası

**Çözüm**: Authorization header'ını doğru format ile gönderdiğinizden emin olun:
```
Authorization: Bearer <your_token>
```

### Problem: "Admin yetkisi gerekli" hatası

**Çözüm**: Admin işlemleri için admin rolüne sahip bir hesapla giriş yapın.

### Problem: Ürün resmi yüklenmedi

**Çözüm**: 
- Dosya formatının jpg, jpeg, png veya gif olduğunu kontrol edin
- `Content-Type: multipart/form-data` header'ını kullandığınızdan emin olun
- Dosya boyutunun aşırı büyük olmadığını kontrol edin

### Problem: "Sepet boş" hatası

**Çözüm**: Checkout yapmadan önce en az bir ürün sepete eklenmeli.

---

**API Versiyonu:** 1.0  
**Son Güncelleme:** 21 Şubat 2024  
**Sahip:** E-Ticaret Backend Ekibi
