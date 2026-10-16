# To-Do API

Node.js ve Express 5 ile hazırlanmış, Docker ile çalıştırılabilen küçük bir API başlangıç projesi.

## Mevcut özellikler

- `GET /` uç noktası JSON durum mesajı döndürür.
- Uygulama varsayılan olarak `3000` portunda dinler.
- Docker imajı oluşturulabilir.
- GitHub Actions, `main` veya `master` dalına gönderilen değişikliklerde bağımlılıkları kurar ve Docker imajını oluşturur.

> **Mevcut kapsam:** Bu sürüm henüz görev ekleme, listeleme, güncelleme veya silme uç noktaları içermez. Veritabanı ya da kalıcı depolama da yapılandırılmamıştır.

## Gereksinimler

- Yerel çalıştırma için Node.js 18 veya üzeri
- Docker ile çalıştırma için Docker

## Yerel olarak çalıştırma

Depoyu klonlayıp proje klasörüne geçin:

```bash
git clone https://github.com/sabawoonrahman942-netizen/todo-api.git
cd todo-api
npm install
node app.js
```

Sunucu `http://localhost:3000` adresinde başlar. Kök uç noktasını kontrol edin:

```bash
curl http://localhost:3000/
```

Beklenen yanıt:

```json
{
  "message": "To-Do API Kusursuz Calisiyor"
}
```

## Docker ile çalıştırma

Proje kök dizininde imajı oluşturup konteyneri başlatın:

```bash
docker build -t todo-api .
docker run --rm -p 3000:3000 todo-api
```

Ardından `http://localhost:3000/` adresini açın.

## Testler

`package.json` içindeki test komutu şu anda örnek yer tutucudur; henüz otomatik test bulunmuyor. GitHub Actions iş akışı bu komutun başarısız olmasını tolere eder ve Docker imajını oluşturmaya devam eder.

## Teknolojiler

- Node.js 18
- Express 5
- Docker
- GitHub Actions
