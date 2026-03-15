# MeetSync — Kurumsal Toplantı Yönetim Platformu

Şirketler için geliştirilmiş kapsamlı toplantı yönetim platformu. Mikroservis mimarisi, gerçek zamanlı bildirimler, AI destekli toplantı özeti, oda rezervasyon takvimi ve QR kod check-in özellikleri içerir.

## Mimari

```
React Frontend (5173)
        ↓
API Gateway — Spring Cloud Gateway (8080)
        ↓
┌─────────────────────────────────────┐
│ auth-service (8081)                 │
│ room-service (8082)                 │
│ meeting-service (8083)              │
│ notification-service(8084)          │
│ ai-service (8085)                   │
└─────────────────────────────────────┘
        ↓
Kafka · Redis · SQL Server
```

## Teknolojiler

**Backend**
- Spring Boot 4.0.3 × 6 mikroservis (Java 17)
- Apache Kafka (Confluent 7.9.0) — event-driven mesajlaşma
- Redis 7 — cache layer
- SQL Server (SSMS) — ana veritabanı
- Spring Cloud Gateway — API yönlendirme
- Spring WebSocket (STOMP) — gerçek zamanlı bildirimler
- JWT (jjwt 0.12.6) — kimlik doğrulama
- Docker Compose — Kafka + Redis + Kafka UI

**Frontend**
- React 18 + Vite
- TanStack Query — server state yönetimi
- React Router v6 — sayfa yönlendirme
- Lucide React — ikonlar
- date-fns — tarih işlemleri
- Axios — HTTP istekleri
- SockJS + STOMP — WebSocket

## Servisler

| Servis | Port | Açıklama |
|--------|------|----------|
| api-gateway | 8080 | Merkezi giriş, routing |
| auth-service | 8081 | JWT login/register, kullanıcı yönetimi |
| room-service | 8082 | Oda CRUD, rezervasyon, takvim, üye yönetimi |
| meeting-service | 8083 | Toplantı yönetimi, anket, davet sistemi |
| notification-service | 8084 | Kafka consumer, WebSocket, Gmail SMTP |
| ai-service | 8085 | Claude API ile toplantı özeti |

## Özellikler

- Kullanıcı kayıt/giriş (JWT + Refresh Token)
- Toplantı odası yönetimi (bina/kat/oda hiyerarşisi)
- Oda üyelik sistemi (Owner/Admin/Member rolleri)
- Aylık oda rezervasyon takvimi
- Saat bazlı günlük program görünümü
- QR kod ile odaya check-in
- Toplantı oluşturma (Teams/Meet link otomatik)
- Katılımcı davet sistemi (kabul/red)
- Anket/oylama sistemi
- Hazır şablonlar (Scrum, 1-on-1, All Hands vb.)
- Email bildirimleri (HTML şablon, Gmail SMTP)
- WebSocket gerçek zamanlı bildirimler
- Claude AI ile toplantı notu özetleme
- Şirket rehberi (departman bazlı)
- Kişisel takvim görünümü

## Kurulum

### Gereksinimler
- Java 17+
- Node.js 18+
- Docker Desktop
- SQL Server (SSMS)

### 1. Veritabanı
SSMS'de `meetsync` adında database oluştur.

### 2. Altyapı
```bash
docker-compose up -d
```

### 3. Servisleri Başlat (ayrı terminallerde)
```bash
cd auth-service && ./mvnw spring-boot:run
cd room-service && ./mvnw spring-boot:run
cd meeting-service && ./mvnw spring-boot:run
cd notification-service && ./mvnw spring-boot:run
cd ai-service && ./mvnw spring-boot:run
cd api-gateway && ./mvnw spring-boot:run
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Aç
- **Frontend:** http://localhost:5173
- **Kafka UI:** http://localhost:8090

## API Endpoints

### Auth (8081)
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/users
GET /api/auth/me
```

### Rooms (8082)
```
GET /api/rooms
POST /api/rooms
GET /api/rooms/my
GET /api/rooms/{id}/calendar/{year}/{month}
GET /api/rooms/{id}/day/{date}
GET /api/rooms/{id}/members
POST /api/rooms/{id}/members
DELETE /api/rooms/{id}/members/{email}
POST /api/rooms/reservations
GET /api/rooms/reservations/my
DELETE /api/rooms/reservations/{id}
POST /api/rooms/checkin/{qrCode}
```

### Meetings (8083)
```
POST /api/meetings
GET /api/meetings/my
GET /api/meetings/{id}
PUT /api/meetings/{id}/status
POST /api/meetings/{id}/respond
POST /api/meetings/{id}/polls
POST /api/meetings/polls/{optionId}/vote
```

### AI (8085)
```
POST /api/ai/summarize
GET /api/ai/summaries/my
```

## Geliştirici

**Ahmet Enes Yensiz**
Bursa Teknik Üniversitesi

### Diğer Projeler
- [FinPulse](https://github.com/Ahmetenesyensiz/finpulse-market-analytics) — Real-time kripto analiz platformu
- [Kafka Order System](https://github.com/Ahmetenesyensiz/kafka-order-system) — Event-driven sipariş sistemi
- [URL Shortener](https://github.com/Ahmetenesyensiz/url-shortener-api) — Spring Boot + Redis
- [Agrox Omni Platform](https://github.com/Ahmetenesyensiz/agrox-omni-platform) — Kurumsal CRM + Portal
