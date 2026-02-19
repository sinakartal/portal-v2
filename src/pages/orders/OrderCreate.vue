<template>
  <!-- Success State -->
  <div v-if="saved" class="flex flex-col items-center justify-center py-32">
    <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
      <Check :size="32" class="text-green-600" />
    </div>
    <h2 class="text-xl font-bold text-slate-800 dark:text-white">Siparis Olusturuldu!</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Siparisler sayfasina yonlendiriliyorsunuz...</p>
  </div>

  <!-- Form -->
  <div v-else class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <button @click="router.push('/orders')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
          <ArrowLeft :size="20" class="text-slate-500" />
        </button>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Yeni Siparis</h1>
      </div>
    </div>

    <!-- Form -->
    <div class="space-y-5">

      <!-- 1. Project & Priority - single row -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Proje</label>
            <select
              v-model="form.project"
              class="w-full mt-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="p in PROJECTS" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Oncelik</label>
            <div class="flex gap-1.5 mt-1.5">
              <button
                v-for="p in priorityOptions"
                :key="p.v"
                type="button"
                @click="update('priority', p.v)"
                :class="`flex-1 py-2.5 border rounded-lg text-xs font-medium cursor-pointer transition-all ${form.priority === p.v ? p.ac : p.c}`"
              >
                {{ p.l }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Customer -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-2 mb-4">
          <User :size="16" class="text-slate-400" />
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Musteri</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              v-model="form.customerName"
              @input="clearError('customerName')"
              placeholder="Ad Soyad *"
              :class="`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.customerName ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`"
            />
          </div>
          <div>
            <input
              type="text"
              v-model="form.customerPhone"
              @input="clearError('customerPhone')"
              placeholder="Telefon *  0532 555 12 34"
              :class="`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.customerPhone ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`"
            />
          </div>
        </div>
      </div>

      <!-- 3. Addresses - Pickup & Delivery -->
      <div class="grid grid-cols-2 gap-5">

        <!-- Pickup Address -->
        <div :class="`bg-white dark:bg-slate-900 rounded-xl border p-5 ${errors.pickupAddress ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <NavigationIcon :size="16" class="text-emerald-500" />
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Alis Noktasi</span>
            </div>
            <button
              v-if="foundCustomer"
              type="button"
              @click="showPickupSaved = !showPickupSaved"
              class="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
            >
              <History :size="12" /> Kayitli Adresler
            </button>
          </div>

          <!-- Saved pickup addresses dropdown -->
          <div v-if="showPickupSaved && foundCustomer" class="mb-3 space-y-1.5">
            <button
              v-if="foundCustomer.lastPickup"
              type="button"
              @click="selectSavedAddress(foundCustomer.lastPickup, 'pickup')"
              class="w-full text-left p-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <div class="flex items-center gap-1.5 mb-0.5">
                <Star :size="11" class="text-emerald-600 fill-emerald-600" />
                <span class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Son Alis Noktasi</span>
              </div>
              <p class="text-xs text-slate-700 dark:text-slate-300">{{ foundCustomer.lastPickup.address }}</p>
            </button>
            <button
              v-for="addr in foundCustomer.addresses"
              :key="addr.id"
              type="button"
              @click="selectSavedAddress(addr, 'pickup')"
              class="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ addr.label }}</span>
              <p class="text-xs text-slate-700 dark:text-slate-300">{{ addr.address }}</p>
            </button>
          </div>

          <div class="space-y-2.5">
            <input
              type="text"
              v-model="form.pickupAddress"
              @input="clearError('pickupAddress')"
              placeholder="Alis adresi *"
              :class="`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.pickupAddress ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`"
            />
            <input
              type="text"
              v-model="form.pickupDetail"
              placeholder="Bina, kat detayi (opsiyonel)"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <!-- Coordinate display & capture -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="simulateCoordinate('pickup')"
                class="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Crosshair :size="13" class="text-emerald-500" /> Koordinat Al
              </button>
              <span v-if="form.pickupLat" class="text-[11px] text-slate-400 font-mono">
                {{ form.pickupLat }}, {{ form.pickupLng }}
              </span>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div :class="`bg-white dark:bg-slate-900 rounded-xl border p-5 ${errors.deliveryAddress ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <MapPin :size="16" class="text-red-500" />
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Teslimat Adresi</span>
            </div>
            <button
              v-if="foundCustomer"
              type="button"
              @click="showDeliverySaved = !showDeliverySaved"
              class="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
            >
              <Search :size="12" /> Kayitli Adresler
            </button>
          </div>

          <!-- Saved delivery addresses dropdown -->
          <div v-if="showDeliverySaved && foundCustomer" class="mb-3 space-y-1.5">
            <button
              v-for="addr in foundCustomer.addresses"
              :key="addr.id"
              type="button"
              @click="selectSavedAddress(addr, 'delivery')"
              class="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ addr.label }}</span>
              <p class="text-xs text-slate-700 dark:text-slate-300">{{ addr.address }}</p>
              <p v-if="addr.detail" class="text-[11px] text-slate-400">{{ addr.detail }}</p>
            </button>
          </div>

          <div class="space-y-2.5">
            <input
              type="text"
              v-model="form.deliveryAddress"
              @input="clearError('deliveryAddress')"
              placeholder="Teslimat adresi *"
              :class="`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.deliveryAddress ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`"
            />
            <input
              type="text"
              v-model="form.deliveryDetail"
              placeholder="Bina, kat, daire (opsiyonel)"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              v-model="form.deliveryNote"
              placeholder="Teslimat notu (opsiyonel)"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <!-- Coordinate display & capture -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="simulateCoordinate('delivery')"
                class="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Crosshair :size="13" class="text-red-500" /> Koordinat Al
              </button>
              <span v-if="form.deliveryLat" class="text-[11px] text-slate-400 font-mono">
                {{ form.deliveryLat }}, {{ form.deliveryLng }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mini Map showing both points -->
      <div v-if="form.pickupLat || form.deliveryLat" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <MapPin :size="14" class="text-slate-400" />
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Harita Onizleme</span>
          </div>
          <span v-if="form.pickupLat && form.deliveryLat" class="text-[11px] text-slate-400">
            ~{{ distanceKm }} km mesafe
          </span>
        </div>
        <div
          class="relative h-48 bg-slate-100 dark:bg-slate-800 cursor-crosshair"
          @click="handleMapClick"
        >
          <!-- Grid lines -->
          <svg class="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
            <line v-for="i in 10" :key="'h'+i" x1="0" :y1="`${i * 10}%`" x2="100%" :y2="`${i * 10}%`" stroke="currentColor" stroke-width="0.5" class="text-slate-400" />
            <line v-for="i in 14" :key="'v'+i" :x1="`${i * 7.14}%`" y1="0" :x2="`${i * 7.14}%`" y2="100%" stroke="currentColor" stroke-width="0.5" class="text-slate-400" />
          </svg>

          <!-- Simulated road lines -->
          <svg class="absolute inset-0 w-full h-full opacity-15 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 Q120,40 200,55 T400,45 T600,65 T800,50" fill="none" stroke="#94a3b8" stroke-width="2" />
            <path d="M50,0 Q60,80 80,120 T90,200" fill="none" stroke="#94a3b8" stroke-width="1.5" />
            <path d="M200,0 Q210,50 190,100 T220,200" fill="none" stroke="#94a3b8" stroke-width="1.5" />
            <path d="M0,120 Q150,130 300,110 T600,130" fill="none" stroke="#94a3b8" stroke-width="1.5" />
          </svg>

          <!-- Dashed route line between points -->
          <svg v-if="form.pickupLat && form.deliveryLat" class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line
              :x1="`${pickupMapX}%`" :y1="`${pickupMapY}%`"
              :x2="`${deliveryMapX}%`" :y2="`${deliveryMapY}%`"
              stroke="#6366f1" stroke-width="2" stroke-dasharray="6,4" opacity="0.7"
            />
          </svg>

          <!-- Pickup marker -->
          <div
            v-if="form.pickupLat"
            class="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-10"
            :style="{ left: `${pickupMapX}%`, top: `${pickupMapY}%` }"
          >
            <div class="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md mb-1 whitespace-nowrap shadow-lg">
              Alis
            </div>
            <div class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
          </div>

          <!-- Delivery marker -->
          <div
            v-if="form.deliveryLat"
            class="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-10"
            :style="{ left: `${deliveryMapX}%`, top: `${deliveryMapY}%` }"
          >
            <div class="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md mb-1 whitespace-nowrap shadow-lg">
              Teslimat
            </div>
            <div class="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg" />
          </div>

          <!-- Click hint -->
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full">
            <span class="text-[10px] text-white/80">Haritaya tiklayarak teslimat noktasi secin</span>
          </div>
        </div>
      </div>

      <!-- Phone match info -->
      <div v-if="foundCustomer" class="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <Check :size="14" class="text-emerald-600" />
        <span class="text-xs text-emerald-700 dark:text-emerald-400">
          <strong>{{ foundCustomer.name }}</strong> - {{ foundCustomer.addresses.length }} kayitli adres bulundu
        </span>
      </div>

      <!-- 4. Products -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Package :size="16" class="text-slate-400" />
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Urunler</span>
          </div>
          <button type="button" @click="addItem" class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg cursor-pointer">
            <Plus :size="14" /> Ekle
          </button>
        </div>

        <div v-if="errors.items" class="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg">
          <AlertTriangle :size="14" /> En az bir urun secin
        </div>

        <div class="space-y-2">
          <div v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
            <select
              :value="item.sku"
              @change="selectProduct(i, $event.target.value)"
              class="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Urun secin...</option>
              <option v-for="p in PRODUCTS" :key="p.sku" :value="p.sku">{{ p.name }} - {{ formatCurrency(p.price) }}</option>
            </select>
            <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                type="button"
                @click="updateQty(i, item.quantity - 1)"
                class="px-2.5 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
              >-</button>
              <span class="w-8 text-center text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.quantity }}</span>
              <button
                type="button"
                @click="updateQty(i, item.quantity + 1)"
                class="px-2.5 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
              >+</button>
            </div>
            <span class="w-24 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ item.price > 0 ? formatCurrency(item.price * item.quantity) : '-' }}
            </span>
            <button
              type="button"
              @click="removeItem(i)"
              :disabled="items.length === 1"
              class="p-2 text-slate-300 hover:text-red-500 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <div v-if="total > 0" class="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam</span>
          <span class="text-lg font-bold text-slate-800 dark:text-white">{{ formatCurrency(total) }}</span>
        </div>
      </div>

      <!-- 5. Delivery & Payment - compact -->
      <div class="grid grid-cols-2 gap-5">
        <!-- Delivery -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center gap-2 mb-4">
            <Clock :size="16" class="text-slate-400" />
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Teslimat</span>
          </div>
          <div class="space-y-2">
            <label
              v-for="opt in deliveryOptions"
              :key="opt.v"
              :class="`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                form.deliveryType === opt.v
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`"
            >
              <input
                type="radio"
                name="deliveryType"
                :value="opt.v"
                :checked="form.deliveryType === opt.v"
                @change="update('deliveryType', opt.v)"
                class="accent-primary"
              />
              <div class="flex-1">
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ opt.l }}</span>
                <p class="text-[11px] text-slate-400">{{ opt.desc }}</p>
              </div>
            </label>
          </div>

          <div v-if="form.deliveryType === 'today'" class="mt-3">
            <select
              v-model="form.deliverySlot"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="s in TIME_SLOTS" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div v-if="form.deliveryType === 'scheduled'" class="mt-3">
            <input
              type="date"
              v-model="form.deliveryDate"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              v-model="form.deliverySlot"
              class="w-full mt-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="s in TIME_SLOTS" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Payment -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center gap-2 mb-4">
            <Wallet :size="16" class="text-slate-400" />
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Odeme</span>
          </div>
          <div class="space-y-2">
            <label
              v-for="opt in paymentOptions"
              :key="opt.v"
              :class="`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                form.paymentMethod === opt.v
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`"
            >
              <input
                type="radio"
                name="paymentMethod"
                :value="opt.v"
                :checked="form.paymentMethod === opt.v"
                @change="update('paymentMethod', opt.v)"
                class="accent-primary"
              />
              <component :is="opt.icon" :size="16" :class="form.paymentMethod === opt.v ? 'text-primary' : 'text-slate-400'" />
              <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ opt.l }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div>
          <div v-if="total > 0" class="text-sm text-slate-500 dark:text-slate-400">
            Toplam: <span class="text-lg font-bold text-slate-800 dark:text-white ml-1">{{ formatCurrency(total) }}</span>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="router.push('/orders')"
            class="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Iptal
          </button>
          <button
            @click="handleSaveAndNew"
            class="px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 cursor-pointer"
          >
            Kaydet + Yeni
          </button>
          <button
            @click="handleSubmit"
            class="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
          >
            <Save :size="16" /> Siparis Olustur
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Plus, Trash2, Save, Package, User, MapPin, Clock,
  AlertTriangle, CreditCard, Banknote, Wallet, Zap, Check,
  Navigation as NavigationIcon, Search, Star, History, Crosshair
} from 'lucide-vue-next'
import { formatCurrency } from '@/utils'

// Mock saved addresses keyed by phone number
const SAVED_ADDRESSES = {
  '05325551234': {
    name: 'Ahmet Yilmaz',
    addresses: [
      { id: 1, label: 'Ev', address: 'Kadikoy, Caferaga Mah. Moda Cad. No:15/3', detail: 'Kat 3, Daire 6', lat: 40.9862, lng: 29.0286 },
      { id: 2, label: 'Is', address: 'Levent, Buyukdere Cad. No:185 Kanyon AVM', detail: 'B Blok Kat 12', lat: 41.0791, lng: 29.0108 },
    ],
    lastPickup: { address: 'Kadikoy Carsi, Osmanaga Mah. Sogutlucesme Cad. No:8', detail: 'Depo giris', lat: 40.9904, lng: 29.0340 }
  },
  '05441234567': {
    name: 'Zeynep Demir',
    addresses: [
      { id: 3, label: 'Ev', address: 'Besiktas, Sinanpasa Mah. Ihlamur Cad. No:22', detail: 'Kat 5', lat: 41.0431, lng: 29.0007 },
      { id: 4, label: 'Anne', address: 'Uskudar, Altunizade Mah. Kisikli Cad. No:10', detail: '', lat: 41.0234, lng: 29.0398 },
    ],
    lastPickup: { address: 'Besiktas, Barbaros Bulvari No:74', detail: 'Zemin kat magaza', lat: 41.0480, lng: 29.0012 }
  },
  '05551112233': {
    name: 'Mehmet Kara',
    addresses: [
      { id: 5, label: 'Ev', address: 'Bakirkoy, Osmaniye Mah. Istasyon Cad. No:45', detail: 'A Blok Daire 3', lat: 40.9800, lng: 28.8720 },
    ],
    lastPickup: { address: 'Bakirkoy, Atakoy 5. Kisim, Plaza No:3', detail: 'Depo', lat: 40.9815, lng: 28.8550 }
  },
  '05339876543': {
    name: 'Ayse Ozturk',
    addresses: [
      { id: 6, label: 'Ev', address: 'Sariyer, Istinye Mah. Boyacikoy Cad. No:12', detail: 'Villa', lat: 41.1109, lng: 29.0582 },
      { id: 7, label: 'Is', address: 'Maslak, Ahi Evran Cad. No:6 Is Kuleleri', detail: 'Kule 2, Kat 18', lat: 41.1086, lng: 29.0203 },
      { id: 8, label: 'Yazlik', address: 'Sile, Cumhuriyet Mah. Sahil Yolu No:5', detail: '', lat: 41.1753, lng: 29.6125 },
    ],
    lastPickup: { address: 'Maslak, Buyukdere Cad. No:255', detail: 'Ana depo giris', lat: 41.1100, lng: 29.0195 }
  },
}

// Default pickup point (company HQ)
const DEFAULT_PICKUP = {
  address: 'Kadikoy, Osmanaga Mah. Sogutlucesme Cad. No:8',
  detail: 'HeyBringo Merkez Depo',
  lat: 40.9904,
  lng: 29.0340,
}

const PRODUCTS = [
  { sku: 'ELK-001', name: 'Elektronik Esya', price: 450 },
  { sku: 'GYM-002', name: 'Giyim Paketi', price: 180 },
  { sku: 'GDA-003', name: 'Gida Siparis', price: 95 },
  { sku: 'KZM-004', name: 'Kozmetik Urun', price: 320 },
  { sku: 'KRT-005', name: 'Kitap/Kirtasiye', price: 75 },
  { sku: 'TEK-006', name: 'Ev Tekstili', price: 260 },
  { sku: 'SPR-007', name: 'Spor Malzemesi', price: 540 },
  { sku: 'OYN-008', name: 'Oyuncak', price: 150 },
  { sku: 'AKS-009', name: 'Aksesuar', price: 110 },
  { sku: 'MTF-010', name: 'Mutfak Gereci', price: 200 },
]

const PROJECTS = [
  'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil',
  'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik'
]

const TIME_SLOTS = [
  '09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00'
]

const router = useRouter()

const form = reactive({
  project: PROJECTS[0],
  priority: 'normal',
  customerName: '',
  customerPhone: '',
  // Pickup address
  pickupAddress: DEFAULT_PICKUP.address,
  pickupDetail: DEFAULT_PICKUP.detail,
  pickupLat: DEFAULT_PICKUP.lat,
  pickupLng: DEFAULT_PICKUP.lng,
  // Delivery address
  deliveryAddress: '',
  deliveryDetail: '',
  deliveryLat: null,
  deliveryLng: null,
  deliveryNote: '',
  paymentMethod: 'card',
  deliveryType: 'today',
  deliveryDate: new Date().toISOString().split('T')[0],
  deliverySlot: TIME_SLOTS[1],
})

const items = ref([{ sku: '', name: '', quantity: 1, price: 0 }])
const errors = reactive({})
const saved = ref(false)
const foundCustomer = ref(null)
const showPickupSaved = ref(false)
const showDeliverySaved = ref(false)

const priorityOptions = [
  { v: 'normal', l: 'Normal', c: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400', ac: 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300' },
  { v: 'high', l: 'Yuksek', c: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400', ac: 'bg-orange-50 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300' },
  { v: 'urgent', l: 'Acil', c: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400', ac: 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300' },
]

const deliveryOptions = [
  { v: 'express', l: 'Hemen (Express)', desc: 'En hizli kurye atanir' },
  { v: 'today', l: 'Bugun', desc: 'Zaman dilimi sec' },
  { v: 'scheduled', l: 'Tarih Sec', desc: 'Ileri tarih' },
]

const paymentOptions = [
  { v: 'card', l: 'Kredi Karti', icon: CreditCard },
  { v: 'cash', l: 'Kapida Nakit', icon: Banknote },
  { v: 'paid', l: 'Odenmi\u015F', icon: Check },
]

const update = (field, value) => {
  form[field] = value
  if (errors[field]) delete errors[field]
}

const clearError = (field) => {
  if (errors[field]) delete errors[field]
}

// Search saved addresses when phone number changes
const phoneDigits = computed(() => form.customerPhone.replace(/\s/g, ''))

watch(phoneDigits, (digits) => {
  if (digits.length >= 7) {
    const match = Object.entries(SAVED_ADDRESSES).find(([key]) => key.includes(digits) || digits.includes(key))
    if (match) {
      const [, data] = match
      foundCustomer.value = data
      if (!form.customerName) form.customerName = data.name
      // Set last pickup point as default
      if (data.lastPickup) {
        form.pickupAddress = data.lastPickup.address
        form.pickupDetail = data.lastPickup.detail
        form.pickupLat = data.lastPickup.lat
        form.pickupLng = data.lastPickup.lng
      }
    } else {
      foundCustomer.value = null
    }
  } else {
    foundCustomer.value = null
  }
})

const selectSavedAddress = (addr, type) => {
  if (type === 'pickup') {
    form.pickupAddress = addr.address
    form.pickupDetail = addr.detail || ''
    form.pickupLat = addr.lat
    form.pickupLng = addr.lng
    showPickupSaved.value = false
  } else {
    form.deliveryAddress = addr.address
    form.deliveryDetail = addr.detail || ''
    form.deliveryLat = addr.lat
    form.deliveryLng = addr.lng
    showDeliverySaved.value = false
  }
  if (errors.deliveryAddress) delete errors.deliveryAddress
}

const simulateCoordinate = (type) => {
  const lat = 40.95 + Math.random() * 0.2
  const lng = 28.85 + Math.random() * 0.3
  if (type === 'pickup') {
    form.pickupLat = +lat.toFixed(4)
    form.pickupLng = +lng.toFixed(4)
  } else {
    form.deliveryLat = +lat.toFixed(4)
    form.deliveryLng = +lng.toFixed(4)
  }
}

const addItem = () => {
  items.value = [...items.value, { sku: '', name: '', quantity: 1, price: 0 }]
}

const removeItem = (i) => {
  if (items.value.length === 1) return
  items.value = items.value.filter((_, idx) => idx !== i)
}

const selectProduct = (index, sku) => {
  const p = PRODUCTS.find(pr => pr.sku === sku)
  if (p) {
    items.value = items.value.map((item, i) => i === index ? { ...item, sku: p.sku, name: p.name, price: p.price } : item)
  }
}

const updateQty = (index, qty) => {
  items.value = items.value.map((item, i) => i === index ? { ...item, quantity: Math.max(1, qty) } : item)
}

const total = computed(() => items.value.reduce((s, it) => s + it.price * it.quantity, 0))

// Map computed values
const pickupMapX = computed(() => form.pickupLat ? ((form.pickupLng - 28.7) / 0.6) * 100 : 0)
const pickupMapY = computed(() => form.pickupLat ? ((41.2 - form.pickupLat) / 0.35) * 100 : 0)
const deliveryMapX = computed(() => form.deliveryLat ? ((form.deliveryLng - 28.7) / 0.6) * 100 : 0)
const deliveryMapY = computed(() => form.deliveryLat ? ((41.2 - form.deliveryLat) / 0.35) * 100 : 0)

const distanceKm = computed(() => {
  if (!form.pickupLat || !form.deliveryLat) return '0'
  return (Math.sqrt(Math.pow((form.deliveryLat - form.pickupLat) * 111, 2) + Math.pow((form.deliveryLng - form.pickupLng) * 85, 2))).toFixed(1)
})

const handleMapClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  // Map click area to Istanbul coordinate range
  const lat = 41.2 - y * 0.35
  const lng = 28.7 + x * 0.6
  form.deliveryLat = +lat.toFixed(4)
  form.deliveryLng = +lng.toFixed(4)
}

const validate = () => {
  // Clear all errors first
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.customerName.trim()) errors.customerName = true
  if (!form.customerPhone.trim()) errors.customerPhone = true
  if (!form.pickupAddress.trim()) errors.pickupAddress = true
  if (!form.deliveryAddress.trim()) errors.deliveryAddress = true
  if (!items.value.some(it => it.name)) errors.items = true
  return Object.keys(errors).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  saved.value = true
  setTimeout(() => router.push('/orders'), 1500)
}

const handleSaveAndNew = () => {
  if (!validate()) return
  saved.value = true
  setTimeout(() => {
    saved.value = false
    form.customerName = ''
    form.customerPhone = ''
    form.pickupAddress = DEFAULT_PICKUP.address
    form.pickupDetail = DEFAULT_PICKUP.detail
    form.pickupLat = DEFAULT_PICKUP.lat
    form.pickupLng = DEFAULT_PICKUP.lng
    form.deliveryAddress = ''
    form.deliveryDetail = ''
    form.deliveryLat = null
    form.deliveryLng = null
    form.deliveryNote = ''
    foundCustomer.value = null
    items.value = [{ sku: '', name: '', quantity: 1, price: 0 }]
  }, 1000)
}
</script>
