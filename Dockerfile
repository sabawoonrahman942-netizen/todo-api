# 1. Hangi resmi Node.js sürümünü baz alacağımızı belirtiyoruz
FROM node:18-alpine

# 2. Konteynerin içinde çalışacağımız ana dizini belirliyoruz
WORKDIR /app

# 3. Önce bağımlılık dosyalarını kopyalıyoruz (önbellekleme optimizasyonu için)
COPY package*.json ./

# 4. Bağımlılıkları konteyner içine kuruyoruz
RUN npm install

# 5. Projenin geri kalan tüm dosyalarını konteynere kopyalıyoruz
COPY . .

# 6. Uygulamanın dinleyeceği portu belirtiyoruz
EXPOSE 3000

# 7. Konteyner ayağa kalktığında çalıştırılacak komut
CMD ["node", "app.js"]
