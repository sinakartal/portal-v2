<template>
  <!-- Skeleton Loading State -->
  <div v-if="loading" class="animate-pulse">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div>
          <div class="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
          <div class="h-4 w-96 bg-slate-100 dark:bg-slate-700 rounded" />
        </div>
      </div>
      <div class="flex gap-2">
        <div class="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div class="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div class="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div class="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
              <div class="h-4 w-3/4 bg-slate-100 dark:bg-slate-700 rounded" />
              <div class="h-4 w-2/3 bg-slate-100 dark:bg-slate-700 rounded" />
            </div>
            <div class="space-y-3">
              <div class="h-12 bg-slate-100 dark:bg-slate-700 rounded" />
              <div class="h-8 bg-slate-100 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div class="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex gap-4">
              <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                <div class="h-3 w-1/4 bg-slate-100 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div class="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div class="h-[250px] bg-slate-100 dark:bg-slate-700 rounded-lg" />
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div class="space-y-3">
            <div class="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
            <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded" />
            <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div class="space-y-2">
            <div class="h-8 bg-slate-100 dark:bg-slate-700 rounded" />
            <div class="h-8 bg-slate-100 dark:bg-slate-700 rounded" />
            <div class="h-8 bg-slate-100 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="flex items-center justify-center h-64 text-red-500 dark:text-red-400">{{ error }}</div>

  <!-- Not Found State -->
  <div v-else-if="!order" class="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">Siparis bulunamadi</div>

  <!-- Main Content -->
  <div v-else class="dark:text-slate-200">
    <!-- ===== HEADER ===== -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.push('/orders')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft :size="20" class="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{{ order.orderNumber }}</h1>
            <span class="px-3 py-1 rounded-full text-xs font-semibold" :style="{ backgroundColor: status.bg, color: status.color }">
              {{ status.label }}
            </span>
            <span :class="`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[order.priority]?.class || ''}`">
              {{ priorityConfig[order.priority]?.label || order.priority }}
            </span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ order.project }} &middot; Harici ID: {{ order.externalId }} &middot; Olusturulma: {{ formatDateTime(order.createdAt) }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="copyOrderNumber" class="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
          <Copy :size="14" />
          <span>{{ copyLabel }}</span>
        </button>
        <button @click="printOrder" class="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
          <Printer :size="14" /> Yazdir
        </button>
        <button @click="cancelModal = true" class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <XCircle :size="14" /> Iptal Et
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- ===== LEFT COLUMN ===== -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Info -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <User :size="18" class="text-slate-500 dark:text-slate-400" /> Musteri Bilgileri
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User :size="18" class="text-primary" />
                </div>
                <div>
                  <p class="font-medium text-slate-800 dark:text-slate-200">{{ order.customer.name }}</p>
                  <p class="text-xs text-slate-400">Musteri</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Phone :size="14" class="text-slate-400" />
                {{ order.customer.phone }}
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Mail :size="14" class="text-slate-400" />
                {{ order.customer.email }}
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <MapPin :size="14" class="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{{ order.customer.address }}</span>
              </div>
              <div v-if="order.customer.notes" class="flex items-start gap-2 text-sm">
                <AlertTriangle :size="14" class="text-amber-500 mt-0.5 flex-shrink-0" />
                <span class="text-amber-600 dark:text-amber-400">{{ order.customer.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== TIMELINE ===== -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
            <Clock :size="18" class="text-slate-500 dark:text-slate-400" /> Siparis Zaman Cizelgesi
          </h3>
          <div class="relative">
            <div v-for="(event, idx) in allTimelineEvents" :key="idx" class="flex gap-4 pb-6 last:pb-0 relative">
              <!-- Vertical connector line -->
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0',
                    timelineStepStyle(event, idx).ring
                  ]"
                  :style="{ backgroundColor: timelineStepStyle(event, idx).bgColor }"
                >
                  <component :is="timelineStepStyle(event, idx).icon" :size="16" :class="timelineStepStyle(event, idx).iconClass" />
                </div>
                <div v-if="idx < allTimelineEvents.length - 1" :class="['w-0.5 flex-1 mt-1', timelineConnectorClass(idx)]" />
              </div>
              <div class="flex-1 pb-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p :class="['font-medium', timelineStepStyle(event, idx).labelClass]">{{ event.label }}</p>
                  <span v-if="event.time" class="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ formatDateTime(event.time) }}</span>
                </div>
                <p v-if="event.user" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ event.user }}</p>
                <p v-if="event.isNote" class="text-sm text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 italic">
                  "{{ event.noteText }}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Package :size="18" class="text-slate-500 dark:text-slate-400" /> Siparis Urunleri
          </h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-700">
                <th class="text-left py-2 font-medium text-slate-500 dark:text-slate-400">Urun</th>
                <th class="text-left py-2 font-medium text-slate-500 dark:text-slate-400">SKU</th>
                <th class="text-center py-2 font-medium text-slate-500 dark:text-slate-400">Adet</th>
                <th class="text-right py-2 font-medium text-slate-500 dark:text-slate-400">Birim Fiyat</th>
                <th class="text-right py-2 font-medium text-slate-500 dark:text-slate-400">Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in order.items" :key="idx" class="border-b border-slate-50 dark:border-slate-700/50">
                <td class="py-3 font-medium text-slate-700 dark:text-slate-200">{{ item.name }}</td>
                <td class="py-3 text-slate-500 dark:text-slate-400">{{ item.sku }}</td>
                <td class="py-3 text-center text-slate-600 dark:text-slate-300">{{ item.quantity }}</td>
                <td class="py-3 text-right text-slate-600 dark:text-slate-300">{{ formatCurrency(item.price) }}</td>
                <td class="py-3 text-right font-medium text-slate-700 dark:text-slate-200">{{ formatCurrency(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-slate-200 dark:border-slate-600">
                <td :colspan="4" class="py-2 text-right text-slate-500 dark:text-slate-400">Ara Toplam</td>
                <td class="py-2 text-right font-medium text-slate-700 dark:text-slate-200">{{ formatCurrency(subtotal) }}</td>
              </tr>
              <tr>
                <td :colspan="4" class="py-1 text-right text-slate-500 dark:text-slate-400">Teslimat Ucreti</td>
                <td class="py-1 text-right text-slate-600 dark:text-slate-300">{{ formatCurrency(order.payment.deliveryFee) }}</td>
              </tr>
              <tr>
                <td :colspan="4" class="py-1 text-right text-slate-500 dark:text-slate-400">Hizmet Bedeli</td>
                <td class="py-1 text-right text-slate-600 dark:text-slate-300">{{ formatCurrency(order.payment.serviceFee) }}</td>
              </tr>
              <tr class="border-t border-slate-200 dark:border-slate-600">
                <td :colspan="4" class="py-2 text-right font-semibold text-slate-800 dark:text-slate-100">Genel Toplam</td>
                <td class="py-2 text-right font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(order.payment.amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ===== NOT EKLEME ===== -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FileText :size="18" class="text-slate-500 dark:text-slate-400" /> Not Ekle
          </h3>
          <!-- Existing notes -->
          <div v-if="order.notes && order.notes.length" class="space-y-3 mb-4">
            <div v-for="note in order.notes" :key="note.id" class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ note.text }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ note.user }}</span>
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDateTime(note.time) }}</span>
              </div>
            </div>
          </div>
          <!-- Note input -->
          <div class="space-y-2">
            <textarea
              v-model="newNoteText"
              rows="3"
              placeholder="Siparise not ekleyin..."
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <div class="flex justify-end">
              <button
                @click="addNote"
                :disabled="!newNoteText.trim()"
                class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus :size="14" /> Not Ekle
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== RIGHT COLUMN ===== -->
      <div class="space-y-6">
        <!-- ===== MAP MINI ===== -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <MapPin :size="18" class="text-slate-500 dark:text-slate-400" /> Teslimat Haritasi
          </h3>
          <div ref="mapContainer" class="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 z-0" style="height: 250px" />
          <div class="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Kurye Konumu</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block" /> Musteri Adresi</span>
          </div>
        </div>

        <!-- ===== KURYE BILGILERI + ATAMA ===== -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Truck :size="18" class="text-slate-500 dark:text-slate-400" /> Kurye Bilgileri
          </h3>
          <div v-if="order.courier" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center">
                <Truck :size="18" class="text-indigo-500" />
              </div>
              <div>
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ order.courier.name }}</p>
                <div class="flex items-center gap-1 text-xs text-amber-500">
                  <Star :size="12" fill="currentColor" />
                  <span>{{ order.courier.rating }}</span>
                </div>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400">Telefon</span>
                <span class="text-slate-700 dark:text-slate-300">{{ order.courier.phone }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400">Arac</span>
                <span class="text-slate-700 dark:text-slate-300">{{ order.courier.vehicle }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400">Plaka</span>
                <span class="text-slate-700 dark:text-slate-300">{{ order.courier.plate }}</span>
              </div>
            </div>
            <button @click="router.push('/tracking')" class="w-full mt-2 px-3 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors flex items-center justify-center gap-2">
              <Navigation :size="14" /> Canli Takip
            </button>
          </div>

          <!-- Courier not assigned - show assign UI -->
          <div v-else class="space-y-3">
            <p class="text-sm text-slate-500 dark:text-slate-400 text-center py-2">Henuz kurye atanmadi</p>

            <!-- Assign button / dropdown toggle -->
            <button
              v-if="!showCourierDropdown"
              @click="showCourierDropdown = true"
              class="w-full px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus :size="16" /> Kurye Ata
            </button>

            <!-- Inline courier selection dropdown -->
            <div v-else class="space-y-2">
              <div class="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <div
                  v-for="courier in availableCouriers"
                  :key="courier.id"
                  @click="selectedCourierId = courier.id"
                  :class="[
                    'flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors text-sm border-b border-slate-50 dark:border-slate-700 last:border-0',
                    selectedCourierId === courier.id
                      ? 'bg-primary/10 dark:bg-primary/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  ]"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div :class="['w-2 h-2 rounded-full flex-shrink-0', courier.online ? 'bg-green-500' : 'bg-slate-300']" />
                    <div class="min-w-0">
                      <p class="font-medium text-slate-700 dark:text-slate-200 truncate">{{ courier.name }}</p>
                      <p class="text-xs text-slate-400 dark:text-slate-500">{{ courier.activeOrders }} aktif siparis</p>
                    </div>
                  </div>
                  <span class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">{{ courier.distance }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="showCourierDropdown = false; selectedCourierId = null" class="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Vazgec
                </button>
                <button
                  @click="assignCourier"
                  :disabled="!selectedCourierId"
                  class="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <CheckCircle :size="14" /> Ata
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <CreditCard :size="18" class="text-slate-500 dark:text-slate-400" /> Odeme Bilgileri
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Yontem</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">{{ order.payment.method }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Durum</span>
              <span v-if="order.payment.isPaid" class="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">Odendi</span>
              <span v-else class="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">Bekliyor</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Tutar</span>
              <span class="text-slate-800 dark:text-slate-100 font-bold">{{ formatCurrency(order.payment.amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Window -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Calendar :size="18" class="text-slate-500 dark:text-slate-400" /> Teslimat Penceresi
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Baslangic</span>
              <span class="text-slate-700 dark:text-slate-300">{{ formatDateTime(order.deliveryWindow.start) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Bitis</span>
              <span class="text-slate-700 dark:text-slate-300">{{ formatDateTime(order.deliveryWindow.end) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">SLA Limiti</span>
              <span class="text-slate-700 dark:text-slate-300">{{ formatDateTime(order.sla.deadline) }}</span>
            </div>
            <div v-if="order.sla.isAtRisk" class="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertTriangle :size="14" /> SLA risk altinda!
            </div>
          </div>
        </div>

        <!-- Delivery Proof -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Camera :size="18" class="text-slate-500 dark:text-slate-400" /> Teslimat Kaniti
          </h3>
          <div v-if="order.status === 'delivered'" class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Teslim Alan</span>
              <span class="text-slate-700 dark:text-slate-300">{{ order.deliveryProof.recipientName }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Imza</span>
              <CheckCircle v-if="order.deliveryProof.signature" :size="16" class="text-green-500" />
              <XCircle v-else :size="16" class="text-red-500" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Fotograf</span>
              <CheckCircle v-if="order.deliveryProof.photo" :size="16" class="text-green-500" />
              <XCircle v-else :size="16" class="text-red-500" />
            </div>
          </div>
          <div v-else class="text-center py-4">
            <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <Camera :size="20" class="text-slate-400" />
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Teslimat henuz tamamlanmadi</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Kanit bilgileri teslimat sonrasi guncellenir</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 class="font-semibold text-slate-800 dark:text-slate-200 mb-4">Hizli Islemler</h3>
          <div class="space-y-2">
            <button @click="router.push('/dashboard')" class="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
              <span class="flex items-center gap-2"><Truck :size="14" class="text-slate-400" /> Kurye Degistir</span>
              <ChevronRight :size="14" class="text-slate-400" />
            </button>
            <button @click="postponeModal = true" class="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
              <span class="flex items-center gap-2"><Clock :size="14" class="text-slate-400" /> Teslimat Ertelendir</span>
              <ChevronRight :size="14" class="text-slate-400" />
            </button>
            <button @click="cancelModal = true" class="w-full flex items-center justify-between px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors">
              <span class="flex items-center gap-2"><XCircle :size="14" /> Siparis Iptal Et</span>
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== POSTPONE MODAL ===== -->
    <div v-if="postponeModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="postponeModal = false" />
      <div class="relative w-[420px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Clock :size="18" class="text-slate-500" /> Teslimat Ertelendir</h3>
          <button @click="postponeModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"><XCircle :size="16" class="text-slate-400" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Yeni Teslimat Tarihi</label>
            <input type="date" v-model="postponeDate" class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Saat Araligi</label>
            <div class="flex gap-2">
              <input type="time" v-model="postponeStart" class="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="time" v-model="postponeEnd" class="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Erteleme Nedeni</label>
            <select v-model="postponeReason" class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none cursor-pointer">
              <option value="">Neden secin...</option>
              <option>Musteri talebi</option>
              <option>Adres degisikligi</option>
              <option>Stok problemi</option>
              <option>Hava kosullari</option>
              <option>Diger</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Not</label>
            <textarea rows="2" v-model="postponeNote" placeholder="Opsiyonel not..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between">
          <button @click="postponeModal = false" class="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">Iptal</button>
          <button @click="postponeModal = false" class="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><CheckCircle :size="16" /> Ertele</button>
        </div>
      </div>
    </div>

    <!-- ===== CANCEL MODAL ===== -->
    <div v-if="cancelModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="cancelModal = false" />
      <div class="relative w-[420px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 class="font-bold text-red-600 dark:text-red-400 flex items-center gap-2"><AlertTriangle :size="18" /> Siparis Iptal</h3>
          <button @click="cancelModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"><XCircle :size="16" class="text-slate-400" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
            <p class="text-sm text-red-700 dark:text-red-400 font-medium">Bu islem geri alinamaz!</p>
            <p class="text-xs text-red-500 dark:text-red-400/70 mt-1">Siparis #{{ order?.orderNumber }} iptal edilecek.</p>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Iptal Nedeni</label>
            <select v-model="cancelReason" class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none cursor-pointer">
              <option value="">Neden secin...</option>
              <option>Musteri iptal talebi</option>
              <option>Stokta yok</option>
              <option>Adres hatali</option>
              <option>Tekrar siparis</option>
              <option>Diger</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Aciklama</label>
            <textarea rows="2" v-model="cancelNote" placeholder="Iptal aciklamasi..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between">
          <button @click="cancelModal = false" class="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">Vazgec</button>
          <button @click="cancelModal = false" class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><XCircle :size="16" /> Siparisi Iptal Et</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  OrderDetail.vue - Siparis Detay Sayfasi (Gelistirilmis UX)
  ===========================================================
  Bu sayfa tek bir siparise ait tum detaylari gosterir.

  Ozellikler:
  - Buyuk siparis numarasi (h1), durum badge, kopyala/yazdir/iptal butonlari
  - Dikey zaman cizelgesi: tamamlanan adimlar yesil, aktif mavi, bekleyen gri
  - Leaflet mini harita (250px): kurye ve musteri pinleri
  - Kurye atama: inline dropdown ile musgun kuryeler secimi
  - Not ekleme: textarea ile not ekleme, timeline'a yansima
  - Skeleton loading state ve dark mode destegi
  - Musteri bilgileri, siparis urunleri tablosu
  - Odeme, teslimat penceresi, SLA takibi
  - Teslimat kaniti, hizli islemler
  - Erteleme ve iptal modallari

  Route param: orderId (router/index.js'de tanimli, props: true)
-->
<script setup>
import { ref, computed, watch, onMounted, nextTick, markRaw } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Package, User, MapPin, Phone, Mail, Clock, Truck,
  CheckCircle, XCircle, Camera, FileText, Edit2, Copy, AlertTriangle,
  Calendar, CreditCard, Star, Navigation, ChevronRight, Printer,
  Plus, UserPlus, CircleDot, Circle, MessageSquare
} from 'lucide-vue-next'
import { getOrderById } from '@/services/api'
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

const order = ref(null)
const loading = ref(true)
const error = ref(null)
const mapContainer = ref(null)
const postponeModal = ref(false)
const postponeDate = ref('')
const postponeStart = ref('')
const postponeEnd = ref('')
const postponeReason = ref('')
const postponeNote = ref('')
const cancelModal = ref(false)
const cancelReason = ref('')
const cancelNote = ref('')
const copyLabel = ref('Kopyala')
const newNoteText = ref('')
const showCourierDropdown = ref(false)
const selectedCourierId = ref(null)
const addedNotes = ref([])
let map = null

// ========== MOCK AVAILABLE COURIERS ==========

const availableCouriers = [
  { id: 'c1', name: 'Mehmet Demir', activeOrders: 2, distance: '1.2 km', online: true },
  { id: 'c2', name: 'Ali Kaya', activeOrders: 0, distance: '2.5 km', online: true },
  { id: 'c3', name: 'Hasan Yildiz', activeOrders: 3, distance: '0.8 km', online: true },
  { id: 'c4', name: 'Emre Sahin', activeOrders: 1, distance: '3.1 km', online: true },
  { id: 'c5', name: 'Burak Ozturk', activeOrders: 4, distance: '1.7 km', online: false },
]

// ========== TIMELINE LOGIC ==========

// The canonical order of statuses in the pipeline
const statusPipeline = [
  'pending', 'confirmed', 'preparing', 'ready_for_pickup',
  'assigned', 'picked_up', 'in_transit', 'delivered'
]

/**
 * Merges order timeline events with user-added notes,
 * sorted chronologically.
 */
const allTimelineEvents = computed(() => {
  if (!order.value) return []
  const events = [...order.value.timeline]

  // Append user-added notes as timeline events
  addedNotes.value.forEach(note => {
    events.push({
      status: 'note',
      label: 'Not Eklendi',
      time: note.time,
      user: note.user,
      isNote: true,
      noteText: note.text,
    })
  })

  // Sort by time ascending
  events.sort((a, b) => new Date(a.time) - new Date(b.time))
  return events
})

/**
 * Determines the current order's position in the status pipeline
 */
const currentStatusIndex = computed(() => {
  if (!order.value) return -1
  return statusPipeline.indexOf(order.value.status)
})

/**
 * Returns styling info for a timeline step based on whether it's
 * completed, current, pending, or a special status.
 */
function timelineStepStyle(event, idx) {
  const evtIndex = statusPipeline.indexOf(event.status)
  const isFailed = ['cancelled', 'failed_delivery', 'refused', 'damaged', 'wrong_address'].includes(event.status)
  const isNote = event.isNote

  if (isNote) {
    return {
      icon: markRaw(MessageSquare),
      iconClass: 'text-indigo-500',
      ring: 'border-indigo-300 dark:border-indigo-500 bg-white dark:bg-slate-800',
      bgColor: undefined,
      labelClass: 'text-indigo-700 dark:text-indigo-400',
    }
  }

  if (isFailed) {
    return {
      icon: markRaw(XCircle),
      iconClass: 'text-white',
      ring: 'border-red-500 bg-red-500',
      bgColor: '#ef4444',
      labelClass: 'text-red-600 dark:text-red-400',
    }
  }

  // Completed step
  if (evtIndex >= 0 && evtIndex < currentStatusIndex.value) {
    return {
      icon: markRaw(CheckCircle),
      iconClass: 'text-white',
      ring: 'border-green-500 bg-green-500',
      bgColor: '#22c55e',
      labelClass: 'text-slate-800 dark:text-slate-200',
    }
  }

  // Current step
  if (evtIndex === currentStatusIndex.value) {
    return {
      icon: markRaw(CircleDot),
      iconClass: 'text-white',
      ring: 'border-blue-500 bg-blue-500',
      bgColor: '#3b82f6',
      labelClass: 'text-blue-700 dark:text-blue-400 font-semibold',
    }
  }

  // Pending / future step
  return {
    icon: markRaw(Circle),
    iconClass: 'text-slate-400 dark:text-slate-500',
    ring: 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800',
    bgColor: undefined,
    labelClass: 'text-slate-400 dark:text-slate-500',
  }
}

function timelineConnectorClass(idx) {
  const event = allTimelineEvents.value[idx]
  const evtIndex = statusPipeline.indexOf(event.status)
  if (evtIndex >= 0 && evtIndex < currentStatusIndex.value) {
    return 'bg-green-400 dark:bg-green-500'
  }
  return 'bg-slate-200 dark:bg-slate-600'
}

// ========== HEADER ACTIONS ==========

function copyOrderNumber() {
  if (!order.value) return
  navigator.clipboard.writeText(order.value.orderNumber).then(() => {
    copyLabel.value = 'Kopyalandi!'
    setTimeout(() => { copyLabel.value = 'Kopyala' }, 2000)
  }).catch(() => {
    copyLabel.value = 'Hata!'
    setTimeout(() => { copyLabel.value = 'Kopyala' }, 2000)
  })
}

function printOrder() {
  window.print()
}

// ========== NOTE ADDING ==========

function addNote() {
  const text = newNoteText.value.trim()
  if (!text) return

  const noteObj = {
    id: Date.now(),
    text,
    user: 'Siz',
    time: new Date().toISOString(),
  }

  // Add to order.notes for the notes section
  if (order.value) {
    order.value.notes.push(noteObj)
  }

  // Also add to addedNotes so it shows in the timeline
  addedNotes.value.push(noteObj)

  newNoteText.value = ''
}

// ========== COURIER ASSIGNMENT ==========

function assignCourier() {
  if (!selectedCourierId.value || !order.value) return
  const courier = availableCouriers.find(c => c.id === selectedCourierId.value)
  if (!courier) return

  // Mock assignment - set courier data on order
  order.value.courier = {
    name: courier.name,
    phone: '0535 000 0000',
    vehicle: 'Motosiklet',
    plate: '34 XX 0000',
    rating: 4.5,
    lat: order.value.customer.lat + 0.005,
    lng: order.value.customer.lng - 0.006,
  }

  // Add a timeline event
  order.value.timeline.push({
    status: 'assigned',
    label: 'Kuryeye Atandi',
    time: new Date().toISOString(),
    user: `Manuel Atama - ${courier.name}`,
  })

  showCourierDropdown.value = false
  selectedCourierId.value = null

  // Reinitialize map to show courier pin
  initMap()
}

// ========== MAP ==========

const initMap = async () => {
  await nextTick()
  if (!mapContainer.value || !order.value) return
  if (map) { map.remove(); map = null }

  const cust = order.value.customer
  const cour = order.value.courier

  const center = [
    (cust.lat + (cour?.lat || cust.lat)) / 2,
    (cust.lng + (cour?.lng || cust.lng)) / 2,
  ]

  map = L.map(mapContainer.value, { zoomControl: false, attributionControl: false }).setView(center, 14)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  const customerIcon = L.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  const courierIcon = L.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  L.marker([cust.lat, cust.lng], { icon: customerIcon })
    .addTo(map)
    .bindPopup(`<b>${cust.name}</b><br>${cust.address}`)

  if (cour?.lat && cour?.lng) {
    L.marker([cour.lat, cour.lng], { icon: courierIcon })
      .addTo(map)
      .bindPopup(`<b>${cour.name}</b><br>Kurye`)

    const bounds = L.latLngBounds([[cust.lat, cust.lng], [cour.lat, cour.lng]])
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}

// ========== DATA LOADING ==========

const loadOrder = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getOrderById(props.orderId)
    if (res.ok && res.data) {
      order.value = res.data
      loading.value = false
      return
    }
  } catch (err) {
    console.warn('[OrderDetail] API hatasi, mock veriye donuluyor:', err)
  }

  // Fallback mock data
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
      lat: 40.9906,
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
      lat: 40.9855,
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
  loading.value = false
}

// ========== LIFECYCLE ==========

onMounted(async () => {
  await loadOrder()
  initMap()
})

watch(() => props.orderId, async () => {
  addedNotes.value = []
  await loadOrder()
  initMap()
})

// ========== COMPUTED ==========

const status = computed(() => {
  if (!order.value) return { label: '', color: '#6b7280', bg: '#f3f4f6' }
  return ORDER_STATUSES[order.value.status] || { label: order.value.status, color: '#6b7280', bg: '#f3f4f6' }
})

const subtotal = computed(() => {
  if (!order.value) return 0
  return order.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const priorityConfig = {
  low: { label: 'Dusuk', class: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  normal: { label: 'Normal', class: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  high: { label: 'Yuksek', class: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' },
  urgent: { label: 'Acil', class: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
}
</script>
