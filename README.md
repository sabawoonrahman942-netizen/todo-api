# Todo API — Staj defterine uyarlanmış demo

Bu dal, staj defterinde anlatılan Flask/Gunicorn ve 5000 portu mimarisinin sonradan oluşturulan demo sürümüdür. Orijinal staj çalışmasının birebir kopyası değildir. ER diyagramındaki id, task, done alanları için SQLite seçilmiştir; defterde veritabanı motoru belirtilmemiştir. Master dalındaki Node.js/PostgreSQL uygulaması korunmuştur.

## Yerel çalışma

Docker Desktop açıkken:
```sh
docker compose up --build -d
docker compose ps
```
Tarayıcı: http://localhost:5000
API: GET /health, GET /todos, POST /todos, PATCH /todos/{id}, DELETE /todos/{id}.
HTML arayüzü görev ekler, listeler, tamamlar ve siler.

## CI/CD
GitHub Actions Python testlerini ve Docker build işlemini çalıştırır. Jenkinsfile Ubuntu üzerinde Docker Compose ve curl erişimi olan bir Jenkins agent gerektirir. Jenkins kurulumu, GitHub tetikleyicisi ve gerçek dağıtım ayrıca doğrulanmalıdır.

## Zabbix
Zabbix Server ve Agent kurulmuş bir Ubuntu devopsserver ortamında Linux agent şablonunu bağlayın. Zabbix Server konteyneri kullanılıyorsa todo-staj-network ağına katılmalıdır. Host altında Simple check item: net.tcp.service[,todo-api,5000], interval 1m, numeric unsigned. Trigger: last(/devopsserver/net.tcp.service[,todo-api,5000])=0, High, Todo API is DOWN. Sunucu farklı bir ağdaysa erişilebilir servis adresi kullanın. SMTP: smtp.gmail.com, 587, STARTTLS; kimlik bilgilerini Zabbix UI üzerinden girin, Git'e koymayın. Trigger action ve kullanıcı media ayarını yapılandırın. docker compose stop todo-api ile kontrollü kesinti, docker compose start todo-api ile kurtarma test edilir. Zabbix ve SMTP bu depoda kurulmuş veya test edilmiş değildir.
