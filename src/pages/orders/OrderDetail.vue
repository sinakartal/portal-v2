<template>
  <div v-if="!order" class="flex items-center justify-center h-64 text-slate-400">Yukleniyor...</div>
  <div v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.push('/orders')" class="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft :size="20" class="text-slate-600" />
        </button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-800">{{ order.orderNumber }}</h1>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: status.bg, color: status.color }">
              {{ status.label }}
            </span>
            <span :class="`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[order.priority].class}`">
              {{ priorityConfig[order.priority].label }}
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            {{ order.project }} &middot; Harici ID: {{ order.externalId }} &middot; Olusturulma: {{ formatDateTime(order.createdAt) }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
          <Copy :size="14" /> Kopyala
        </button>
        <button class="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
          <FileText :size="14" /> Fatura
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Edit2 :size="14" /> Duzenle
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Info -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User :size="18" class="text-slate-500" /> Musteri Bilgileri
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User :size="18" class="text-primary" />
                </div>
                <div>
                  <p class="font-medium text-slate-800">{{ order.customer.name }}</p>
                  <p class="text-xs text-slate-400">Musteri</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <Phone :size="14" class="text-slate-400" />
                {{ order.customer.phone }}
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <Mail :size="14" class="text-slate-400" />
                {{ order.customer.email }}
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-start gap-2 text-sm text-slate-600">
                <MapPin :size="14" class="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{{ order.customer.address }}</span>
              </div>
              <div v-if="order.customer.notes" class="flex items-start gap-2 text-sm">
                <AlertTriangle :size="14" class="text-amber-500 mt-0.5 flex-shrink-0" />
                <span class="text-amber-600">{{ order.customer.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mini Map -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin :size="18" class="text-slate-500" /> Teslimat Haritasi
          </h3>
          <div ref="mapContainer" class="w-full h-56 rounded-lg overflow-hidden border border-slate-200 z-0" />
          <div class="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Kurye Konumu</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block" /> Musteri Adresi</span>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Package :size="18" class="text-slate-500" /> Siparis Urunleri
          </h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="text-left py-2 font-medium text-slate-500">Urun</th>
                <th class="text-left py-2 font-medium text-slate-500">SKU</th>
                <th class="text-center py-2 font-medium text-slate-500">Adet</th>
                <th class="text-right py-2 font-medium text-slate-500">Birim Fiyat</th>
                <th class="text-right py-2 font-medium text-slate-500">Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in order.items" :key="idx" class="border-b border-slate-50">
                <td class="py-3 font-medium text-slate-700">{{ item.name }}</td>
                <td class="py-3 text-slate-500">{{ item.sku }}</td>
                <td class="py-3 text-center text-slate-600">{{ item.quantity }}</td>
                <td class="py-3 text-right text-slate-600">{{ formatCurrency(item.price) }}</td>
                <td class="py-3 text-right font-medium text-slate-700">{{ formatCurrency(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-slate-200">
                <td :colspan="4" class="py-2 text-right text-slate-500">Ara Toplam</td>
                <td class="py-2 text-right font-medium text-slate-700">{{ formatCurrency(subtotal) }}</td>
              </tr>
              <tr>
                <td :colspan="4" class="py-1 text-right text-slate-500">Teslimat Ucreti</td>
                <td class="py-1 text-right text-slate-600">{{ formatCurrency(order.payment.deliveryFee) }}</td>
              </tr>
              <tr>
                <td :colspan="4" class="py-1 text-right text-slate-500">Hizmet Bedeli</td>
                <td class="py-1 text-right text-slate-600">{{ formatCurrency(order.payment.serviceFee) }}</td>
              </tr>
              <tr class="border-t border-slate-200">
                <td :colspan="4" class="py-2 text-right font-semibold text-slate-800">Genel Toplam</td>
                <td class="py-2 text-right font-bold text-slate-800">{{ formatCurrency(order.payment.amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Timeline -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock :size="18" class="text-slate-500" /> Siparis Zaman Cizelgesi
          </h3>
          <div class="relative">
            <div v-for="(event, idx) in order.timeline" :key="idx" class="flex gap-4 pb-6 last:pb-0">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10">
                  <CheckCircle v-if="event.status === 'delivered'" :size="16" class="text-green-500" />
                  <XCircle v-else-if="event.status === 'cancelled' || event.status === 'failed_delivery'" :size="16" class="text-red-500" />
                  <CheckCircle v-else :size="16" class="text-primary" />
                </div>
                <div v-if="idx < order.timeline.length - 1" class="w-0.5 flex-1 bg-slate-200 mt-1" />
              </div>
              <div class="flex-1 pb-2">
                <div class="flex items-center justify-between">
                  <p class="font-medium text-slate-800">{{ event.label }}</p>
                  <span class="text-xs text-slate-400">{{ formatDateTime(event.time) }}</span>
                </div>
                <p class="text-sm text-slate-500 mt-0.5">{{ event.user }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText :size="18" class="text-slate-500" /> Notlar
          </h3>
          <div class="space-y-3 mb-4">
            <div v-for="note in order.notes" :key="note.id" class="bg-slate-50 rounded-lg p-3">
              <p class="text-sm text-slate-700">{{ note.text }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-xs font-medium text-slate-500">{{ note.user }}</span>
                <span class="text-xs text-slate-400">{{ formatDateTime(note.time) }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="Not ekle..."
              class="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors">
              Ekle
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column - Sidebar Info -->
      <div class="space-y-6">
        <!-- Courier Info -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Truck :size="18" class="text-slate-500" /> Kurye Bilgileri
          </h3>
          <div v-if="order.courier" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <Truck :size="18" class="text-indigo-500" />
              </div>
              <div>
                <p class="font-medium text-slate-800">{{ order.courier.name }}</p>
                <div class="flex items-center gap-1 text-xs text-amber-500">
                  <Star :size="12" fill="currentColor" />
                  <span>{{ order.courier.rating }}</span>
                </div>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Telefon</span>
                <span class="text-slate-700">{{ order.courier.phone }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Arac</span>
                <span class="text-slate-700">{{ order.courier.vehicle }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Plaka</span>
                <span class="text-slate-700">{{ order.courier.plate }}</span>
              </div>
            </div>
            <button class="w-full mt-2 px-3 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors flex items-center justify-center gap-2">
              <Navigation :size="14" /> Canli Takip
            </button>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-sm text-slate-500 mb-3">Henuz kurye atanmadi</p>
            <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors">
              Kurye Ata
            </button>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard :size="18" class="text-slate-500" /> Odeme Bilgileri
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Yontem</span>
              <span class="text-slate-700 font-medium">{{ order.payment.method }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Durum</span>
              <span v-if="order.payment.isPaid" class="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">Odendi</span>
              <span v-else class="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">Bekliyor</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Tutar</span>
              <span class="text-slate-800 font-bold">{{ formatCurrency(order.payment.amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Window -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar :size="18" class="text-slate-500" /> Teslimat Penceresi
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Baslangic</span>
              <span class="text-slate-700">{{ formatDateTime(order.deliveryWindow.start) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Bitis</span>
              <span class="text-slate-700">{{ formatDateTime(order.deliveryWindow.end) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">SLA Limiti</span>
              <span class="text-slate-700">{{ formatDateTime(order.sla.deadline) }}</span>
            </div>
            <div v-if="order.sla.isAtRisk" class="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-red-600 text-xs font-medium">
              <AlertTriangle :size="14" /> SLA risk altinda!
            </div>
          </div>
        </div>

        <!-- Delivery Proof -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Camera :size="18" class="text-slate-500" /> Teslimat Kaniti
          </h3>
          <div v-if="order.status === 'delivered'" class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Teslim Alan</span>
              <span class="text-slate-700">{{ order.deliveryProof.recipientName }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Imza</span>
              <CheckCircle v-if="order.deliveryProof.signature" :size="16" class="text-green-500" />
              <XCircle v-else :size="16" class="text-red-500" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Fotograf</span>
              <CheckCircle v-if="order.deliveryProof.photo" :size="16" class="text-green-500" />
              <XCircle v-else :size="16" class="text-red-500" />
            </div>
          </div>
          <div v-else class="text-center py-4">
            <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Camera :size="20" class="text-slate-400" />
            </div>
            <p class="text-sm text-slate-500">Teslimat henuz tamamlanmadi</p>
            <p class="text-xs text-slate-400 mt-1">Kanit bilgileri teslimat sonrasi guncellenir</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl border border-slate-100 p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Hizli Islemler</h3>
          <div class="space-y-2">
            <button @click="router.push('/tracking')" class="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
              <span class="flex items-center gap-2"><Truck :size="14" class="text-slate-400" /> Kurye Degistir</span>
              <ChevronRight :size="14" class="text-slate-400" />
            </button>
            <button @click="postponeModal = true" class="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
              <span class="flex items-center gap-2"><Clock :size="14" class="text-slate-400" /> Teslimat Ertelendir</span>
              <ChevronRight :size="14" class="text-slate-400" />
            </button>
            <button @click="cancelModal = true" class="w-full flex items-center justify-between px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
              <span class="flex items-center gap-2"><XCircle :size="14" /> Siparis Iptal Et</span>
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Postpone Modal -->
    <div v-if="postponeModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="postponeModal = false" />
      <div class="relative w-[420px] bg-white rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 flex items-center gap-2"><Clock :size="18" class="text-slate-500" /> Teslimat Ertelendir</h3>
          <button @click="postponeModal = false" class="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><XCircle :size="16" class="text-slate-400" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1.5">Yeni Teslimat Tarihi</label>
            <input type="date" v-model="postponeDate" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1.5">Saat Araligi</label>
            <div class="flex gap-2">
              <input type="time" v-model="postponeStart" class="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="time" v-model="postponeEnd" class="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1.5">Erteleme Nedeni</label>
            <select v-model="postponeReason" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none cursor-pointer">
              <option value="">Neden secin...</option>
              <option>Musteri talebi</option>
              <option>Adres degisikligi</option>
              <option>Stok problemi</option>
              <option>Hava kosullari</option>
              <option>Diger</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1.5">Not</label>
            <textarea rows="2" v-model="postponeNote" placeholder="Opsiyonel not..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex justify-between">
          <button @click="postponeModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm cursor-pointer hover:bg-slate-50">Iptal</button>
          <button @click="postponeModal = false" class="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><CheckCircle :size="16" /> Ertele</button>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <div v-if="cancelModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="cancelModal = false" />
      <div class="relative w-[420px] bg-white rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-red-600 flex items-center gap-2"><AlertTriangle :size="18" /> Siparis Iptal</h3>
          <button @click="cancelModal = false" class="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><XCircle :size="16" class="text-slate-400" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-700 font-medium">Bu islem geri alinamaz!</p>
            <p class="text-xs text-red-500 mt-1">Siparis #{{ order?.orderNumber }} iptal edilecek.</p>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1.5">Iptal Nedeni</label>
            <select v-model="cancelReason" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none cursor-pointer">
              <option value="">Neden secin...</option>
              <option>Musteri iptal talebi</option>
              <option>Stokta yok</option>
              <option>Adres hatali</option>
              <option>Tekrar siparis</option>
              <option>Diger</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1.5">Aciklama</label>
            <textarea rows="2" v-model="cancelNote" placeholder="Iptal aciklamasi..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex justify-between">
          <button @click="cancelModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm cursor-pointer hover:bg-slate-50">Vazgec</button>
          <button @click="cancelModal = false" class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><XCircle :size="16" /> Siparisi Iptal Et</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  OrderDetail.vue - Siparis Detay Sayfasi
  ========================================
  Bu sayfa tek bir siparise ait tum detaylari gosterir.

  Ozellikler:
  - Musteri bilgileri (ad, tel, e-posta, adres)
  - Leaflet harita: Musteri adresi (kirmizi pin) ve kurye konumu (mavi pin)
  - Siparis urunleri tablosu (birim fiyat, adet, toplam)
  - Siparis zaman cizelgesi (olusturma, onay, hazirlama, teslimat adimlari)
  - Kurye bilgileri ve canli takip butonu
  - Odeme bilgileri
  - Teslimat penceresi ve SLA takibi
  - Teslimat kaniti (imza, fotograf)
  - Hizli islemler: Kurye degistir, erteleme, iptal

  Route param: orderId (router/index.js'de tanimli, props: true)
  Not: Tum veriler mock'tur, API entegrasyonunda degistirilecek.
-->
<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Package, User, MapPin, Phone, Mail, Clock, Truck,
  CheckCircle, XCircle, Camera, FileText, Edit2, Copy, AlertTriangle,
  Calendar, CreditCard, Star, Navigation, ChevronRight
} from 'lucide-vue-next'
import { ORDER_STATUSES } from '@/constants/menu'
import { formatCurrency, formatDate, formatDateTime } from '@/utils'

// ========== PROPS ==========
const props = defineProps({
  orderId: {
    type: String,
    required: true,
  }
})

const router = useRouter()

// ========== REACTIVE STATE ==========

const order = ref(null)           // Siparis verisi
const mapContainer = ref(null)    // Leaflet harita DOM referansi
const postponeModal = ref(false)  // Erteleme modali acik mi
const postponeDate = ref('')      // Erteleme - yeni tarih
const postponeStart = ref('')     // Erteleme - baslangic saati
const postponeEnd = ref('')       // Erteleme - bitis saati
const postponeReason = ref('')    // Erteleme - neden
const postponeNote = ref('')      // Erteleme - not
const cancelModal = ref(false)    // Iptal modali acik mi
const cancelReason = ref('')      // Iptal - neden
const cancelNote = ref('')        // Iptal - aciklama
let map = null                    // Leaflet map instance (reactive olmayan)

// ========== HARITA FONKSIYONLARI ==========

/**
 * Leaflet haritasini baslatir.
 * Musteri adresi (kirmizi pin) ve kurye konumu (mavi pin) gosterir.
 * Her iki pin de varsa, harita her ikisini de kapsayacak sekilde zoom yapar.
 */
const initMap = async () => {
  await nextTick()
  if (!mapContainer.value || !order.value) return
  if (map) { map.remove(); map = null }

  const cust = order.value.customer
  const cour = order.value.courier

  // Harita merkezini musteri ve kurye arasina koy
  const center = [
    (cust.lat + (cour?.lat || cust.lat)) / 2,
    (cust.lng + (cour?.lng || cust.lng)) / 2,
  ]

  map = L.map(mapContainer.value, { zoomControl: false, attributionControl: false }).setView(center, 14)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  // Musteri pin ikonu (kirmizi daire + konum ikonu)
  const customerIcon = L.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  // Kurye pin ikonu (mavi daire + bisiklet ikonu)
  const courierIcon = L.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  // Musteri pinini haritaya ekle
  L.marker([cust.lat, cust.lng], { icon: customerIcon })
    .addTo(map)
    .bindPopup(`<b>${cust.name}</b><br>${cust.address}`)

  // Kurye pinini ekle ve her iki pini kapsayacak sekilde zoom yap
  if (cour?.lat && cour?.lng) {
    L.marker([cour.lat, cour.lng], { icon: courierIcon })
      .addTo(map)
      .bindPopup(`<b>${cour.name}</b><br>Kurye`)

    const bounds = L.latLngBounds([[cust.lat, cust.lng], [cour.lat, cour.lng]])
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}

// ========== VERI YUKLEME ==========

/**
 * Siparis verisini yukler.
 * TODO: API entegrasyonunda bu fonksiyon axios/fetch ile degistirilecek.
 */
const loadOrder = () => {
  const mockOrder = {
    _id: props.orderId,
    orderNumber: 'BRN-001247',
    externalId: 'EXT-78432',
    project: 'Istanbul Ana Dagitim',
    status: 'in_transit',
    priority: 'high',
    customer: {
      name: 'Ahmet Yilmaz',
      phone: '0532 456 7890',
      email: 'ahmet.yilmaz@email.com',
      address: 'Ataturk Cad. No:125 D:4 Kadikoy, Istanbul',
      notes: '3. kat, zil bozuk, arayiniz',
      lat: 40.9906,    // Musteri konumu (haritada kirmizi pin)
      lng: 29.0285,
    },
    items: [
      { name: 'Elektronik Esya', quantity: 2, price: 450, sku: 'ELK-001' },
      { name: 'Telefon Aksesuari', quantity: 1, price: 120, sku: 'TEL-034' },
      { name: 'Bilgisayar Parcasi', quantity: 1, price: 780, sku: 'BLG-012' },
    ],
    courier: {
      name: 'Serkan Acar',
      phone: '0535 234 5678',
      vehicle: 'Motosiklet',
      plate: '34 AB 1234',
      rating: 4.7,
      lat: 40.9855,    // Kurye konumu (haritada mavi pin)
      lng: 29.0220,
    },
    payment: {
      method: 'Kredi Karti',
      isPaid: true,
      amount: 1800,
      serviceFee: 25,
      deliveryFee: 15,
    },
    deliveryWindow: {
      start: new Date(Date.now() - 3600000).toISOString(),
      end: new Date(Date.now() + 7200000).toISOString(),
    },
    sla: {
      deadline: new Date(Date.now() + 5400000).toISOString(),
      isAtRisk: false,
    },
    deliveryProof: {
      signature: true,
      photo: true,
      recipientName: 'Ahmet Y.',
      deliveredAt: null,
      notes: '',
    },
    timeline: [
      { status: 'pending', label: 'Siparis Olusturuldu', time: new Date(Date.now() - 14400000).toISOString(), user: 'Sistem' },
      { status: 'confirmed', label: 'Siparis Onaylandi', time: new Date(Date.now() - 13200000).toISOString(), user: 'Operator - Elif K.' },
      { status: 'preparing', label: 'Hazirlaniyor', time: new Date(Date.now() - 10800000).toISOString(), user: 'Depo' },
      { status: 'ready_for_pickup', label: 'Teslim Alinmaya Hazir', time: new Date(Date.now() - 7200000).toISOString(), user: 'Depo' },
      { status: 'assigned', label: 'Kuryeye Atandi', time: new Date(Date.now() - 5400000).toISOString(), user: 'Sistem - Oto Atama' },
      { status: 'picked_up', label: 'Kurye Teslim Aldi', time: new Date(Date.now() - 3600000).toISOString(), user: 'Serkan Acar' },
      { status: 'in_transit', label: 'Yolda', time: new Date(Date.now() - 1800000).toISOString(), user: 'Serkan Acar' },
    ],
    notes: [
      { id: 1, text: 'Musteri aranarak teslimat saati teyit edildi.', user: 'Elif K.', time: new Date(Date.now() - 12000000).toISOString() },
      { id: 2, text: 'Paket ozel ambalajlandi, kirilacak esya mevcut.', user: 'Depo', time: new Date(Date.now() - 9000000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  }
  order.value = mockOrder
}

// ========== LIFECYCLE ==========

// Sayfa ilk yuklendiginde siparis verisini ve haritayi baslat
onMounted(() => {
  loadOrder()
  initMap()
})

// URL'deki orderId degistiginde (navigasyon) veriyi yeniden yukle
watch(() => props.orderId, () => {
  loadOrder()
  initMap()
})

// ========== COMPUTED ==========

// Siparis durumuna gore etiket ve renk
const status = computed(() => {
  if (!order.value) return { label: '', color: '#6b7280', bg: '#f3f4f6' }
  return ORDER_STATUSES[order.value.status] || { label: order.value.status, color: '#6b7280', bg: '#f3f4f6' }
})

// Urunlerin ara toplami (teslimat ve hizmet bedeli haric)
const subtotal = computed(() => {
  if (!order.value) return 0
  return order.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// Oncelik seviyesi etiket ve renkleri
const priorityConfig = {
  low: { label: 'Dusuk', class: 'bg-slate-100 text-slate-600' },
  normal: { label: 'Normal', class: 'bg-blue-50 text-blue-600' },
  high: { label: 'Yuksek', class: 'bg-orange-50 text-orange-600' },
  urgent: { label: 'Acil', class: 'bg-red-50 text-red-600' },
}
</script>
