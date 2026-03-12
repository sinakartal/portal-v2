# Bringo API — Marka Entegrasyon Rehberi

## Baslarken

Base URL: `https://api.bringo.co` (production) / `http://localhost:3002` (development)

### Header Formati
```
Authorization: Bearer brg_live_XXXXXXXXXXXXXXXX
Content-Type: application/json
```

### Hata Formati
```json
{
  "success": false,
  "error": "Aciklama"
}
```

### Rate Limit
| Tier | Limit |
|------|-------|
| Starter | 60 istek/dakika |
| Growth | 300 istek/dakika |
| Enterprise | 1000 istek/dakika |

Limit asildiginda: `429 Too Many Requests`

---

## Siparis Olusturma

**POST** `/api/v2/tenant/orders`

### Request Body
```json
{
  "externalOrderId": "FM-12345",
  "originId": "branch-kadikoy-01",
  "deliveryAddress": {
    "lat": 40.9908,
    "lng": 29.0291,
    "address": "Caferaga Mah. Moda Cad. No:15 Kadikoy",
    "customerName": "Ahmet Yilmaz",
    "customerPhone": "05321234567"
  },
  "items": [
    { "name": "Kozmetik Paket", "quantity": 2 }
  ],
  "mode": "standard",
  "isFrozen": false,
  "deci": 5,
  "metadata": { "invoiceNo": "FTR-2026-001" }
}
```

### Zorunlu Alanlar
| Alan | Tip | Aciklama |
|------|-----|----------|
| externalOrderId | string | Sizin siparis ID'niz (benzersiz) |
| originId | string | Magaza/Sube ID'si |
| deliveryAddress.lat | number | Teslimat enlemi |
| deliveryAddress.lng | number | Teslimat boylami |
| deliveryAddress.customerName | string | Musteri adi |
| mode | string | `instant` / `standard` / `flex` |

### Response (201)
```json
{
  "success": true,
  "data": {
    "orderId": "brg_a3f2bc45",
    "externalOrderId": "FM-12345",
    "status": "pending",
    "sandbox": false,
    "trackingUrl": "https://track.bringo.co/brg_a3f2bc45",
    "estimatedDelivery": "2026-03-10T16:30:00Z"
  }
}
```

---

## Siparis Listesi

**GET** `/api/v2/tenant/orders?status=pending&limit=50`

Sadece kendi siparislerinizi gorursunuz (tenant izolasyonu).

### Query Parametreleri
| Parametre | Varsayilan | Aciklama |
|-----------|-----------|----------|
| status | tumu | pending, dispatched, assigned, delivered, cancelled |
| limit | 50 | Sayfa basi kayit (max 200) |
| page | 1 | Sayfa numarasi |
| from | - | Baslangic tarihi (ISO 8601) |
| to | - | Bitis tarihi (ISO 8601) |

---

## Siparis Detayi

**GET** `/api/v2/tenant/orders/:id`

`:id` = Bringo siparis ID'si VEYA sizin externalOrderId'niz.

---

## Siparis Iptali

**POST** `/api/v2/tenant/orders/:id/cancel`

Sadece `pending` veya `dispatched` durumundaki siparisler iptal edilebilir.
Kuryeye atanmis siparisler iptal edilemez.

---

## Dashboard KPI'lari

**GET** `/api/v2/tenant/stats`

Bugunku siparis sayilari, SLA uyumu, ortalama sure.

---

## Fatura Bilgisi

**GET** `/api/v2/tenant/invoices`

Aylik fatura ozeti, multi-tenant tasarruf hesaplama.

### Response
```json
{
  "success": true,
  "data": {
    "period": "2026-03",
    "summary": {
      "totalOrders": 150,
      "deliveredOrders": 130,
      "totalBilled": 455.00,
      "avgCostPerOrder": 3.50,
      "currency": "TRY"
    },
    "multiTenantSavings": {
      "combinedKm": 450.5,
      "estimatedSeparateKm": 540.6,
      "savingsKm": 90.1,
      "savingsPercent": 17,
      "savingsAmount": 157.68
    },
    "billingModel": "per_delivery",
    "perDeliveryPrice": 3.50
  }
}
```

---

## Checkout Opsiyonlari (Widget)

**POST** `/api/v2/tenant/checkout/options`

E-ticaret sitenizde teslimat opsiyonlarini gostermek icin.

```json
{
  "originLat": 40.9908,
  "originLng": 29.0291,
  "destinationLat": 41.0082,
  "destinationLng": 28.9784,
  "desi": 5,
  "mode": "standard"
}
```

---

## Ayarlar

**GET** `/api/v2/tenant/config` — Mevcut ayarlari getir

**PUT** `/api/v2/tenant/config` — Ayarlari guncelle
```json
{
  "webhookUrl": "https://api.yoursite.com/bringo/webhook",
  "webhookEvents": ["order.assigned", "order.delivered", "order.cancelled"],
  "branding": {
    "primaryColor": "#FF6B00",
    "logoUrl": "https://yoursite.com/logo.png"
  }
}
```

---

## Webhook'lar

Siparis durumu degistiginde sizin URL'inize POST gondeririz.

### Webhook Payload
```json
{
  "event": "order.assigned",
  "timestamp": "2026-03-10T14:30:00Z",
  "webhookId": "whk_abc123",
  "data": {
    "orderId": "brg_a3f2bc45",
    "externalOrderId": "FM-12345",
    "status": "assigned",
    "courier": { "name": "Ahmet K.", "phone": "053X XXX XX 45" }
  }
}
```

### Imza Dogrulama
Her webhook'ta `X-Bringo-Signature` header'i var.
`HMAC-SHA256(webhookSecret, payload)` ile dogrulayin.

### Event Tipleri
| Event | Aciklama |
|-------|----------|
| order.created | Siparis alindi |
| order.dispatched | Rotalandi |
| order.assigned | Kuryeye atandi |
| order.picked_up | Magazadan alindi |
| order.in_transit | Yolda |
| order.delivered | Teslim edildi |
| order.cancelled | Iptal edildi |
| order.sla_warning | SLA ihlal yaklasiyor |
| order.sla_breach | SLA ihlal edildi |
| courier.assigned | Kurye atandi |

---

## Test

### Curl ile ilk siparis
```bash
curl -X POST http://localhost:3002/api/v2/tenant/orders \
  -H "Authorization: Bearer brg_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "externalOrderId": "TEST-001",
    "originId": "origin-1",
    "deliveryAddress": {
      "lat": 40.99,
      "lng": 29.03,
      "customerName": "Test Musteri"
    },
    "mode": "standard"
  }'
```

### Sandbox Modu
Test API key'i (`brg_test_xxx`) ile olusturulan siparisler gercek kuryeye atanmaz.
- Test siparisleri `test_` prefix'i ile olusturulur
- Webhook'lar yine gider — webhook handler'inizi test edin
- Entegrasyonunuzu guvenle test edin

### Webhook Test
```bash
curl -X POST http://localhost:3002/api/v2/tenant/config/test-webhook \
  -H "Authorization: Bearer brg_live_YOUR_KEY"
```
