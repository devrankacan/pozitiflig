# Pozitif Lig - VPS Kurulum Rehberi

Bu rehber, siteyi kendi VPS sunucunda **boş bir portta**, mevcut diğer
sitelerini etkilemeden/onlardan etkilenmeden yayına almak için gereken
adımları içerir. Uygulama sadece `127.0.0.1:3410` üzerinde (dışarıya kapalı,
yalnızca sunucu içinden erişilebilir) çalışır; dışarıya açık tek şey mevcut
Nginx'in `pozitiflig.taslak.site` için ekleyeceğin **yeni ve ayrı** bir
config dosyasıdır. Var olan başka site config'lerine hiç dokunulmaz.

Tüm komutları VPS'ine SSH ile bağlandıktan sonra çalıştır.

## 0) Ön kontrol: 3410 portu boş mu?

```bash
sudo ss -tlnp | grep 3410
```

Bir çıktı **gelmiyorsa** port boştur, devam edebilirsin. Eğer bir şey
kullanıyorsa, hem bu dosyadaki hem de `deploy/pozitiflig.service` ve
`deploy/pozitiflig.nginx.conf` içindeki `3410` değerini boş başka bir port
(örn. `3411`) ile değiştir.

## 1) Node.js kurulu mu kontrol et

```bash
node -v
```

`v20.9.0` veya üzeri değilse (ya da hiç kurulu değilse), NodeSource
üzerinden kur (bu adım mevcut başka Node uygulamalarını etkilemez, sistem
genelinde Node sürümünü günceller — eğer başka bir sitende **farklı** bir
Node sürümüne sıkı sıkıya bağımlı bir uygulama varsa bana haber ver, o
zaman `nvm` ile izole bir kurulum yaparız):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2) Uygulama için ayrı ve yetkisiz bir kullanıcı oluştur

Diğer sitelerden tamamen izole çalışması için:

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin pozitiflig
sudo mkdir -p /var/www/pozitiflig
sudo chown -R pozitiflig:pozitiflig /var/www/pozitiflig
```

## 3) Kodu çek ve ilk build'i al

```bash
sudo -u pozitiflig -H bash -c '
  git clone --branch claude/pozitif-lig-website-9av9tk \
    https://github.com/devrankacan/pozitiflig.git /var/www/pozitiflig/repo
  cd /var/www/pozitiflig/repo
  npm ci
  npm run build
  mkdir -p /var/www/pozitiflig/current
  cp -r .next/standalone/. /var/www/pozitiflig/current/
  cp -r public /var/www/pozitiflig/current/public
  mkdir -p /var/www/pozitiflig/current/.next
  cp -r .next/static /var/www/pozitiflig/current/.next/static
'
```

> Not: `pozitiflig/pozitiflig` GitHub reposu **public**, bu yüzden VPS'te
> ayrıca bir GitHub token/deploy key gerekmiyor.

## 4) systemd servisini kur

Repo içindeki `deploy/pozitiflig.service` dosyasını kopyala:

```bash
sudo cp /var/www/pozitiflig/repo/deploy/pozitiflig.service /etc/systemd/system/pozitiflig.service
sudo systemctl daemon-reload
sudo systemctl enable --now pozitiflig
sudo systemctl status pozitiflig --no-pager
```

`active (running)` görmelisin. Şunu da doğrula (sadece sunucu içinden
erişilebilir olmalı):

```bash
curl -I http://127.0.0.1:3410/
```

`HTTP/1.1 200 OK` dönmeli.

## 5) Nginx: yeni ve ayrı bir site config'i ekle

Mevcut Nginx config'lerine **dokunmuyoruz**, sadece yeni bir dosya
ekliyoruz:

```bash
sudo cp /var/www/pozitiflig/repo/deploy/pozitiflig.nginx.conf \
  /etc/nginx/sites-available/pozitiflig.taslak.site
sudo ln -s /etc/nginx/sites-available/pozitiflig.taslak.site \
  /etc/nginx/sites-enabled/pozitiflig.taslak.site
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` "syntax is ok / test is successful" demeli. Bu komut mevcut
diğer sitelerin config'lerini de test eder ama **değiştirmez**; hata
verirse muhtemelen port/isim çakışmasıdır, çıktısını bana gönder.

DNS'in zaten `pozitiflig.taslak.site` için VPS IP'sine yönlendirildiğini
belirttin. Doğrulamak için:

```bash
dig +short pozitiflig.taslak.site
```

VPS'inin IP adresini döndürmeli. Şimdi tarayıcıdan
`http://pozitiflig.taslak.site` açılmalı.

## 6) SSL sertifikası (HTTPS) ekle

Sunucunda zaten `certbot` kuruluysa (diğer siteler için kullanıyorsan
büyük ihtimalle kuruludur):

```bash
sudo certbot --nginx -d pozitiflig.taslak.site
```

Bu komut **yalnızca** `pozitiflig.taslak.site` için sertifika alır ve
sadece az önce eklediğimiz `/etc/nginx/sites-available/pozitiflig.taslak.site`
dosyasını günceller — diğer sitelerin sertifikalarına dokunmaz.

Certbot kurulu değilse:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

kurup yukarıdaki komutu tekrar çalıştır.

## 7) Sofascore API anahtarını ekle (canlı maç sonuçları/istatistikler için)

Puan durumu widget'ları bu adım olmadan da çalışır. Ama Puan Durumu
sayfasındaki maç sonuçları bölümü ve Ana Sayfa'daki gol/asist krallığı ile
Play-Off takvimi için RapidAPI'deki Sofascore anahtarın gerekiyor.

Anahtar **repoya asla girmez** — sadece VPS'te, git'in hiç görmediği
`/etc/pozitiflig.env` dosyasında tutulur:

```bash
sudo tee /etc/pozitiflig.env > /dev/null << 'EOF'
SOFASCORE_RAPIDAPI_KEY=buraya_gercek_anahtarini_yaz
SOFASCORE_REVALIDATE_SECONDS=86400
SOFASCORE_LIVE_REVALIDATE_SECONDS=120
SOFASCORE_MATCH_WINDOW_MINUTES=150
SOFASCORE_CACHE_DIR=/var/www/pozitiflig/data/sofascore-cache
EOF
sudo chown root:pozitiflig /etc/pozitiflig.env
sudo chmod 640 /etc/pozitiflig.env
sudo systemctl restart pozitiflig
```

Bu değerler uyarlanabilir bir yenileme stratejisi kurar:

- `SOFASCORE_REVALIDATE_SECONDS=86400` (24 saat) — **canlı maç yokken**
  kullanılır. Amatör ligde maç günleri haftada bir olduğu için bu gecikme
  kullanıcı tarafında fark edilmez, ama RapidAPI'nin ücretsiz 500
  istek/aylık kotasında rahat bir pay bırakır.
- `SOFASCORE_LIVE_REVALIDATE_SECONDS=120` (2 dakika) — bir maçın
  başlama saatine göre **hâlâ oynanıyor olabileceği** tespit edildiğinde
  otomatik olarak bu sıklığa geçilir, skorlar Sofascore'daki ile
  neredeyse eşzamanlı kalır. Maç bitince otomatik olarak yavaş moda
  (24 saat) geri döner.
- `SOFASCORE_MATCH_WINDOW_MINUTES=150` (2.5 saat) — bir maçın başlama
  saatinden itibaren "muhtemelen hâlâ sürüyor" sayılacağı süre
  (uzatmalar/gecikmeler için pay).

Pro plana geçersen bu sayıları daha da kısaltabilirsin — kod değişikliği
gerekmez, sadece bu dosyayı güncelleyip servisi yeniden başlatman
yeterli. Not: Çok yoğun maç haftalarında (aynı gün birden fazla maç,
uzun canlı pencereler) ücretsiz kota yine de zorlanabilir; bu durumda
ücretli plana geçmek en güvenli çözümdür.

**Önemli:** `SOFASCORE_CACHE_DIR` üretimde mutlaka ayarlanmalı ve
deploy sırasında silinen `current/` klasörünün DIŞINDA bir yolu
göstermeli (yukarıdaki `/var/www/pozitiflig/data/sofascore-cache` gibi
— klasör uygulama tarafından otomatik oluşturulur, elle `mkdir`
gerekmez). Bu sayede çekilen veriler ve görseller diske yazılır; her
`deploy.sh`/servis restart'ında bellek sıfırlansa bile disk önbelleği
korunur ve RapidAPI kotası her seferinde yeniden tüketilmez. Bu değer
boş bırakılırsa önbellek yalnızca bellekte tutulur ve her restart'ta
sıfırlanır.

Bu dosya olmadan (veya anahtar boşken) site **bozulmaz** — otomatik
olarak statik/örnek verilere döner.

## 8) Güncelleme yapmak istediğinde

Yeni değişiklikleri (ben push ettikten sonra ya da sen elle) yayına almak
için VPS'te tek komut yeterli:

```bash
sudo -u pozitiflig -H /var/www/pozitiflig/repo/deploy/deploy.sh
```

Bu script otomatik olarak: kodu günceller, `npm ci` + build alır, yeni
`current/` klasörünü hazırlar ve `pozitiflig` servisini yeniden başlatır.
`sudo systemctl restart` çağırdığı için ilk çalıştırmadan önce
`pozitiflig` kullanıcısına parolasız bu komut için sudo izni vermen
gerekebilir. **Not:** sudoers kuralları argümanlarla birebir eşleşmesi
gerektiği için sadece `restart` komutunu izinli hâle getiriyoruz (servis
durumu kontrolü artık sudo gerektirmeyen bir `curl` health-check ile
yapılıyor):

```bash
echo 'pozitiflig ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart pozitiflig, /bin/systemctl restart pozitiflig' \
  | sudo tee /etc/sudoers.d/pozitiflig
sudo chmod 0440 /etc/sudoers.d/pozitiflig
sudo visudo -c
```

`chmod 0440` adımı önemli: `tee` dosyayı varsayılan izinlerle (0644) oluşturur ve
sudo, `/etc/sudoers.d/` altında 0440'tan gevşek izinli dosyaları güvenlik
gereği tamamen yok sayar (kural `sudo -l` çıktısında görünse bile fiilen
uygulanmaz) — bu durumda `sudo systemctl restart` yine parola sorar.
`visudo -c` çıktısında ilgili dosya için "bad permissions" uyarısı
olmadığından emin ol.

## 9) Duyurular sayfası ve admin paneli için kalıcı veri + şifre

Duyurular (`/duyurular`) bir JSON dosyasında saklanır ve admin paneli
(`/admin`) üzerinden yönetilir. Bu dosyanın, her güncellemede tamamen
silinip yeniden oluşturulan `current/` klasörünün **dışında** bir yerde
durması gerekir — yoksa her deploy'da duyurular kaybolur.

Kalıcı bir veri klasörü oluştur (bu, `current/`'ın kardeşi, `deploy.sh`
tarafından asla dokunulmaz):

```bash
sudo -u pozitiflig mkdir -p /var/www/pozitiflig/data
```

Sonra `/etc/pozitiflig.env` dosyana admin şifresini, oturum imzalama
anahtarını ve duyuru dosyasının yolunu ekle (7. adımda oluşturduğun
dosyayı güncelliyorsun, üzerine yazmadan mevcut satırları koruyarak):

```bash
sudo tee -a /etc/pozitiflig.env > /dev/null << 'EOF'
ADMIN_PASSWORD=guclu_bir_sifre_sec
ADMIN_SESSION_SECRET=rastgele_uzun_bir_metin
ANNOUNCEMENTS_FILE=/var/www/pozitiflig/data/announcements.json
EOF
sudo chmod 640 /etc/pozitiflig.env
sudo systemctl restart pozitiflig
```

`ADMIN_SESSION_SECRET` için rastgele bir değer üretmek istersen:

```bash
openssl rand -hex 32
```

Bu üç değişken ayarlanmadan `/admin` girişi çalışmaz (şifre her zaman
"yanlış" görünür), ama site geri kalanı etkilenmez. `/var/www/pozitiflig/data`
klasörü `ProtectSystem=full`/`ProtectHome=true` kısıtlamalarının dışındadır
(bunlar `/etc`, `/usr`, `/home` gibi yerleri salt-okunur yapar; `/var`'a
dokunmaz), bu yüzden servis dosyasında ekstra bir izin ayarına gerek yoktur.

## 10) YouTube canlı yayın rozeti için API anahtarı ekle (opsiyonel)

Maçlar sayfası, anahtar gerektirmeyen YouTube RSS beslemesiyle zaten
çalışır. Ama bir videonun "şu an canlı yayında" olduğunu gösteren
kırmızı rozet için ek, ücretsiz bir YouTube Data API v3 anahtarı
gerekiyor (RSS beslemesi bu bilgiyi vermiyor).

Anahtar **repoya asla girmez**, `/etc/pozitiflig.env` dosyasına eklenir:

```bash
sudo tee -a /etc/pozitiflig.env > /dev/null << 'EOF'
YOUTUBE_API_KEY=buraya_gercek_anahtarini_yaz
EOF
sudo chmod 640 /etc/pozitiflig.env
sudo systemctl restart pozitiflig
```

Anahtar Google Cloud Console'da (console.cloud.google.com) ücretsiz
alınır: bir proje oluştur → "YouTube Data API v3"nü etkinleştir →
Credentials → "+ Create credentials" → "API key". Güvenlik için
anahtarı "API restrictions" ile sadece "YouTube Data API v3"e,
"Application restrictions" ile de "IP addresses" seçip VPS'in IP'sine
kısıtlamak iyi bir pratiktir (Application restrictions'ı "Websites"
yapma — bu anahtar sunucudan kullanılıyor, tarayıcıdan değil).

Bu anahtar tanımlı değilse (veya boşsa) site **bozulmaz** — sadece
canlı rozeti gösterilmez, videolar normal şekilde listelenmeye devam
eder. Günlük kota 10.000 birim; bu site (2 dakikada bir, 1 birimlik
sorgu) günde ~720 birim harcar, kotanın çok altında kalır.

## Özet: izolasyon garantileri

- Uygulama ayrı, yetkisiz bir sistem kullanıcısı (`pozitiflig`) altında
  çalışır.
- Sadece `127.0.0.1:3410` üzerinde dinler, dışarıya doğrudan açık değildir.
- Dosyalar `/var/www/pozitiflig/` altında, diğer sitelerden tamamen ayrı
  bir dizindedir.
- Nginx tarafında sadece yeni bir `sites-available` dosyası eklenir,
  mevcut hiçbir config değiştirilmez.
- systemd servisi `ProtectSystem=full` ve `ProtectHome=true` ile
  sınırlandırılmıştır; sunucudaki diğer dosyalara yazamaz.
