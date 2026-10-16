# To-Do API

PostgreSQL üzerinde görev ve kategori saklayan, Node.js ve Express ile hazırlanmış REST API.

## Özellikler

- Görevler için oluşturma, listeleme, tek kayıt görüntüleme, güncelleme ve silme
- Kategoriler için CRUD uç noktaları
- Görev durumu, öncelik, son tarih ve kategori ilişkisi
- Durum ve kategori filtresi ile limit/offset sayfalama
- Parametreli SQL sorguları ve istek doğrulama
- Başlangıçta otomatik çalışan, takip edilen veritabanı migration'ları
- Docker Compose ile API ve PostgreSQL'i birlikte başlatma
- OpenAPI tanımı ve Mermaid ER diyagramı

## Teknolojiler

- Node.js 22
- Express 5
- PostgreSQL 16
- Docker Compose
- GitHub Actions

## Hızlı başlangıç: Docker

Docker Desktop veya Docker Engine kurulu olmalı. Proje klasöründe:

~~~powershell
Copy-Item .env.example .env
docker compose up --build
~~~

API, http://localhost:3000 adresinde; PostgreSQL ise localhost:5432 adresinde çalışır. API başlamadan önce veritabanı sağlık kontrolünden geçer ve bekleyen migration'lar uygulanır.

Kontrol:

~~~bash
curl http://localhost:3000/health
~~~

Beklenen yanıt:

~~~json
{
  "status": "ok",
  "database": "ok"
}
~~~

## Yerel geliştirme

Node.js 22 ve PostgreSQL 16 gerekir. Önce örnek ortam dosyasını oluşturup veritabanını Docker ile başlatın:

~~~powershell
Copy-Item .env.example .env
docker compose up -d db
npm ci
npm run db:migrate
npm run dev
~~~

Geliştirme sunucusu http://localhost:3000 adresinde başlar. npm start normal sunucuyu başlatır. npm run db:migrate migration'ları elle uygulamak içindir; API başlangıcında da otomatik çalışırlar.

.env.example içindeki parolalar yalnızca yerel geliştirme içindir. Gerçek ortamda güçlü sırlar kullanın ve .env dosyasını Git'e eklemeyin.

## Veri modeli

Bir kategori birçok göreve sahip olabilir. Kategori silinirse ona bağlı görevler silinmez; category_id alanları NULL olur.

~~~mermaid
erDiagram
    CATEGORIES ||--o{ TODOS : groups
    CATEGORIES {
        int id PK
        string name UK
        string color
        datetime created_at
        datetime updated_at
    }
    TODOS {
        int id PK
        string title
        string description
        string status
        string priority
        datetime due_at
        int category_id FK
        datetime created_at
        datetime updated_at
    }
~~~

Ayrı diyagram dosyaları: [ER diyagramı](docs/erd.mmd) ve [uygulama mimarisi](docs/architecture.mmd). Migration: [migrations/001_create_categories_and_todos.sql](migrations/001_create_categories_and_todos.sql).

## API dokümantasyonu

OpenAPI 3.0 tanımı [docs/openapi.yaml](docs/openapi.yaml) dosyasındadır ve çalışan sunucuda http://localhost:3000/docs/openapi.yaml adresinden alınabilir.

### Uç noktalar

| Method | Path | Açıklama |
|---|---|---|
| GET | /health | API ve veritabanı sağlık kontrolü |
| GET | /api/v1/todos | Görevleri listele |
| POST | /api/v1/todos | Görev oluştur |
| GET | /api/v1/todos/{id} | Görevi getir |
| PATCH | /api/v1/todos/{id} | Görev alanlarını güncelle |
| DELETE | /api/v1/todos/{id} | Görevi sil |
| GET | /api/v1/categories | Kategorileri listele |
| POST | /api/v1/categories | Kategori oluştur |
| GET | /api/v1/categories/{id} | Kategoriyi getir |
| PATCH | /api/v1/categories/{id} | Kategoriyi güncelle |
| DELETE | /api/v1/categories/{id} | Kategoriyi sil |

Görev durumları pending, in_progress, completed; öncelikler low, normal, high, urgent değerlerini alır. Listeleme varsayılan olarak 20 kayıt döndürür; limit 1–100, offset sıfır veya daha büyük olabilir. İsteğe bağlı olarak status ve category_id ile filtrelenebilir.

### Örnek istekler

Kategori oluştur:

~~~bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"İş","color":"#2563EB"}'
~~~

Görev oluştur:

~~~bash
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Dokümantasyonu tamamla","description":"README ve API şemasını gözden geçir","priority":"high","category_id":1,"due_at":"2026-12-01T17:00:00Z"}'
~~~

Tamamlanmamış görevleri sayfalayarak listele:

~~~bash
curl "http://localhost:3000/api/v1/todos?status=pending&limit=20&offset=0"
~~~

Görev yanıtları data, liste yanıtları ayrıca pagination alanı taşır. Hatalar error.code ve error.message içeren tek biçimli JSON döndürür.

## Proje yapısı

~~~text
app.js
src/
  app.js
  config.js
  server.js
  db/
  routes/
  utils/
migrations/
docs/
docker-compose.yml
~~~

## Geliştirme ve sınırlar

- npm run check JavaScript dosyalarının sözdizimini kontrol eder.
- GitHub Actions, sözdizimi kontrolünü çalıştırır ve Docker imajını derler.
- Otomatik API/veritabanı testleri henüz eklenmemiştir.
- Kimlik doğrulama ve kullanıcı bazlı erişim yoktur; bu sürüm tek ve ortak bir görev alanı olarak çalışır. İnternete açık üretim ortamında kullanmadan önce kimlik doğrulama ve yetkilendirme ekleyin.
