<template>
  <!-- Success State -->
  <div v-if="saved" class="flex flex-col items-center justify-center py-32">
    <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
      <Check :size="32" class="text-green-600" />
    </div>
    <h2 class="text-xl font-bold text-slate-800 dark:text-white">Siparis Olusturuldu!</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Siparisler sayfasina yonlendiriliyorsunuz...</p>
  </div>

  <!-- Skeleton Loading -->
  <div v-else-if="skeletonLoading" class="max-w-5xl mx-auto">
    <div class="animate-pulse space-y-6">
      <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
      <div class="flex gap-4 justify-center">
        <div v-for="i in 3" :key="i" class="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        <div class="grid grid-cols-2 gap-4">
          <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
      <div class="flex justify-end gap-3">
        <div class="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div class="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Wizard Form -->
  <div v-else class="max-w-5xl mx-auto" @keydown="handleGlobalKeydown">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <button @click="router.push('/orders')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
          <ArrowLeft :size="20" class="text-slate-500" />
        </button>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Yeni Siparis</h1>
      </div>
    </div>

    <!-- Step Indicator -->
    <div class="flex items-center justify-center gap-0 mb-8">
      <template v-for="(step, idx) in steps" :key="idx">
        <!-- Step circle + label -->
        <button
          type="button"
          @click="goToStep(idx + 1)"
          class="flex flex-col items-center gap-1.5 cursor-pointer group"
          :class="{ 'pointer-events-none': !canGoToStep(idx + 1) }"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2"
            :class="stepCircleClass(idx + 1)"
          >
            <Check v-if="idx + 1 < currentStep" :size="18" />
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span
            class="text-xs font-medium transition-colors whitespace-nowrap"
            :class="idx + 1 <= currentStep ? 'text-primary dark:text-primary' : 'text-slate-400 dark:text-slate-500'"
          >{{ step.label }}</span>
        </button>
        <!-- Connector line -->
        <div
          v-if="idx < steps.length - 1"
          class="w-24 h-0.5 mx-2 mb-5 transition-colors duration-300 rounded-full"
          :class="idx + 1 < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"
        />
      </template>
    </div>

    <!-- Step Content Area with transition -->
    <div class="relative">
      <transition :name="transitionName" mode="out-in">

        <!-- ============ STEP 1: Musteri & Adres ============ -->
        <div v-if="currentStep === 1" key="step1" class="space-y-5">

          <!-- Project select -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Proje</label>
            <select
              v-model="form.project"
              ref="firstFieldStep1"
              tabindex="1"
              class="w-full mt-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="p in PROJECTS" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <!-- Customer -->
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
                  tabindex="2"
                  :class="inputClass(errors.customerName)"
                />
                <p v-if="errors.customerName" class="mt-1 text-xs text-red-500">Musteri adi zorunludur</p>
              </div>
              <div>
                <input
                  type="text"
                  v-model="form.customerPhone"
                  @input="clearError('customerPhone')"
                  placeholder="Telefon *  0532 555 12 34"
                  tabindex="3"
                  :class="inputClass(errors.customerPhone)"
                />
                <p v-if="errors.customerPhone" class="mt-1 text-xs text-red-500">Telefon numarasi zorunludur</p>
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

          <!-- Addresses - Pickup & Delivery -->
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
                  tabindex="4"
                  :class="inputClass(errors.pickupAddress)"
                />
                <p v-if="errors.pickupAddress" class="mt-0.5 text-xs text-red-500">Alis adresi zorunludur</p>
                <input
                  type="text"
                  v-model="form.pickupDetail"
                  placeholder="Bina, kat detayi (opsiyonel)"
                  tabindex="5"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
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

              <div class="space-y-2.5 relative">
                <div class="relative">
                  <input
                    type="text"
                    v-model="form.deliveryAddress"
                    @input="onDeliveryAddressInput"
                    @focus="showAddressSuggestions = form.deliveryAddress.length >= 2"
                    @blur="delayHideSuggestions"
                    placeholder="Teslimat adresi *"
                    tabindex="6"
                    :class="inputClass(errors.deliveryAddress)"
                  />
                  <!-- Address Autocomplete Dropdown -->
                  <div
                    v-if="showAddressSuggestions && filteredAddressSuggestions.length > 0"
                    class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden"
                  >
                    <button
                      v-for="(suggestion, si) in filteredAddressSuggestions"
                      :key="si"
                      type="button"
                      @mousedown.prevent="selectAddressSuggestion(suggestion)"
                      class="w-full text-left px-3 py-2.5 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 cursor-pointer"
                    >
                      <div class="flex items-center gap-2">
                        <MapPin :size="13" class="text-slate-400 shrink-0" />
                        <div>
                          <p class="text-sm text-slate-800 dark:text-slate-200">{{ suggestion.address }}</p>
                          <p class="text-[11px] text-slate-400">{{ suggestion.district }}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <p v-if="errors.deliveryAddress" class="mt-0.5 text-xs text-red-500">Teslimat adresi zorunludur</p>
                <input
                  type="text"
                  v-model="form.deliveryDetail"
                  placeholder="Bina, kat, daire (opsiyonel)"
                  tabindex="7"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  v-model="form.deliveryNote"
                  placeholder="Teslimat notu (opsiyonel)"
                  tabindex="8"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
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
              <svg class="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
                <line v-for="i in 10" :key="'h'+i" x1="0" :y1="`${i * 10}%`" x2="100%" :y2="`${i * 10}%`" stroke="currentColor" stroke-width="0.5" class="text-slate-400" />
                <line v-for="i in 14" :key="'v'+i" :x1="`${i * 7.14}%`" y1="0" :x2="`${i * 7.14}%`" y2="100%" stroke="currentColor" stroke-width="0.5" class="text-slate-400" />
              </svg>
              <svg class="absolute inset-0 w-full h-full opacity-15 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,60 Q120,40 200,55 T400,45 T600,65 T800,50" fill="none" stroke="#94a3b8" stroke-width="2" />
                <path d="M50,0 Q60,80 80,120 T90,200" fill="none" stroke="#94a3b8" stroke-width="1.5" />
                <path d="M200,0 Q210,50 190,100 T220,200" fill="none" stroke="#94a3b8" stroke-width="1.5" />
                <path d="M0,120 Q150,130 300,110 T600,130" fill="none" stroke="#94a3b8" stroke-width="1.5" />
              </svg>
              <svg v-if="form.pickupLat && form.deliveryLat" class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line
                  :x1="`${pickupMapX}%`" :y1="`${pickupMapY}%`"
                  :x2="`${deliveryMapX}%`" :y2="`${deliveryMapY}%`"
                  stroke="#6366f1" stroke-width="2" stroke-dasharray="6,4" opacity="0.7"
                />
              </svg>
              <div
                v-if="form.pickupLat"
                class="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-10"
                :style="{ left: `${pickupMapX}%`, top: `${pickupMapY}%` }"
              >
                <div class="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md mb-1 whitespace-nowrap shadow-lg">Alis</div>
                <div class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
              </div>
              <div
                v-if="form.deliveryLat"
                class="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-10"
                :style="{ left: `${deliveryMapX}%`, top: `${deliveryMapY}%` }"
              >
                <div class="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md mb-1 whitespace-nowrap shadow-lg">Teslimat</div>
                <div class="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg" />
              </div>
              <div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                <span class="text-[10px] text-white/80">Haritaya tiklayarak teslimat noktasi secin</span>
              </div>
            </div>
          </div>

          <!-- Step 1 Navigation -->
          <div class="flex items-center justify-between pt-2">
            <button
              @click="router.push('/orders')"
              class="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Iptal
            </button>
            <button
              @click="nextStep"
              class="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
            >
              Devam Et
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>

        <!-- ============ STEP 2: Siparis Detaylari ============ -->
        <div v-else-if="currentStep === 2" key="step2" class="space-y-5">

          <!-- Priority -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">Oncelik</label>
            <div class="flex gap-1.5">
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

          <!-- Products -->
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
                  :tabindex="10 + i"
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

          <!-- Payment -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div class="flex items-center gap-2 mb-4">
              <Wallet :size="16" class="text-slate-400" />
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Odeme Yontemi</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
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

          <!-- Notes -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Siparis Notu (opsiyonel)</label>
            <textarea
              v-model="form.orderNote"
              placeholder="Siparise ozel notlar..."
              rows="2"
              tabindex="20"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <!-- Step 2 Navigation -->
          <div class="flex items-center justify-between pt-2">
            <button
              @click="prevStep"
              class="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft :size="16" />
              Geri
            </button>
            <button
              @click="nextStep"
              class="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
            >
              Devam Et
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>

        <!-- ============ STEP 3: Teslimat Zamanlama + Ozet ============ -->
        <div v-else-if="currentStep === 3" key="step3">
          <div class="grid grid-cols-5 gap-6">
            <!-- Left: Delivery scheduling (3 cols) -->
            <div class="col-span-3 space-y-5">

              <!-- Delivery Type -->
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div class="flex items-center gap-2 mb-4">
                  <Clock :size="16" class="text-slate-400" />
                  <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Teslimat Zamanlama</span>
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
                    tabindex="30"
                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option v-for="s in TIME_SLOTS" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <div v-if="form.deliveryType === 'scheduled'" class="mt-3 space-y-2">
                  <input
                    type="date"
                    v-model="form.deliveryDate"
                    tabindex="30"
                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    v-model="form.deliverySlot"
                    tabindex="31"
                    class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option v-for="s in TIME_SLOTS" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>

              <!-- Step 3 back button (mobile-only, visible when summary is stacked below) -->
              <div class="flex items-center justify-between pt-2 lg:hidden">
                <button
                  @click="prevStep"
                  class="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft :size="16" />
                  Geri
                </button>
              </div>
            </div>

            <!-- Right: Summary Panel (2 cols) -->
            <div class="col-span-2">
              <div class="sticky top-4 space-y-4">
                <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Siparis Ozeti</span>
                  </div>

                  <div class="p-5 space-y-4">
                    <!-- Customer -->
                    <div>
                      <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Musteri</span>
                      <p class="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{{ form.customerName }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ form.customerPhone }}</p>
                    </div>

                    <div class="border-t border-slate-100 dark:border-slate-800" />

                    <!-- Pickup Address -->
                    <div>
                      <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Alis Adresi</span>
                      <p class="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{{ form.pickupAddress }}</p>
                      <p v-if="form.pickupDetail" class="text-xs text-slate-400">{{ form.pickupDetail }}</p>
                    </div>

                    <div class="border-t border-slate-100 dark:border-slate-800" />

                    <!-- Delivery Address -->
                    <div>
                      <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Teslimat Adresi</span>
                      <p class="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{{ form.deliveryAddress }}</p>
                      <p v-if="form.deliveryDetail" class="text-xs text-slate-400">{{ form.deliveryDetail }}</p>
                      <p v-if="form.deliveryNote" class="text-xs text-slate-400 italic mt-0.5">Not: {{ form.deliveryNote }}</p>
                    </div>

                    <div class="border-t border-slate-100 dark:border-slate-800" />

                    <!-- Products Summary -->
                    <div>
                      <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Urunler</span>
                      <div class="mt-1 space-y-1">
                        <div
                          v-for="(item, i) in items.filter(it => it.name)"
                          :key="i"
                          class="flex justify-between text-sm"
                        >
                          <span class="text-slate-700 dark:text-slate-300">{{ item.name }} x{{ item.quantity }}</span>
                          <span class="font-medium text-slate-800 dark:text-slate-200">{{ formatCurrency(item.price * item.quantity) }}</span>
                        </div>
                        <div v-if="items.filter(it => it.name).length === 0" class="text-xs text-slate-400 italic">Urun secilmedi</div>
                      </div>
                    </div>

                    <div class="border-t border-slate-100 dark:border-slate-800" />

                    <!-- Amount -->
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Toplam</span>
                      <span class="text-lg font-bold text-slate-800 dark:text-white">{{ formatCurrency(total) }}</span>
                    </div>

                    <div class="border-t border-slate-100 dark:border-slate-800" />

                    <!-- Payment Method -->
                    <div>
                      <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Odeme</span>
                      <p class="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{{ paymentLabel }}</p>
                    </div>

                    <!-- Priority -->
                    <div>
                      <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Oncelik</span>
                      <p class="text-sm mt-0.5">
                        <span :class="priorityBadgeClass">{{ priorityLabel }}</span>
                      </p>
                    </div>

                    <!-- Delivery Type -->
                    <div>
                      <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Teslimat</span>
                      <p class="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{{ deliveryTypeLabel }}</p>
                      <p v-if="form.deliveryType !== 'express'" class="text-xs text-slate-400">{{ form.deliverySlot }}</p>
                    </div>
                  </div>
                </div>

                <!-- Error Message -->
                <div v-if="submitError" class="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle :size="16" /> {{ submitError }}
                </div>

                <!-- Action Buttons (sticky) -->
                <div class="space-y-2">
                  <button
                    @click="handleSubmit"
                    :disabled="loading"
                    class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    <Save :size="16" /> {{ loading ? 'Gonderiliyor...' : 'Onayla ve Olustur' }}
                  </button>
                  <button
                    @click="handleSaveAndNew"
                    :disabled="loading"
                    class="w-full px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kaydet + Yeni Siparis
                  </button>
                  <button
                    @click="prevStep"
                    class="w-full flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <ChevronLeft :size="16" />
                    Geri Don
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Plus, Trash2, Save, Package, User, MapPin, Clock,
  AlertTriangle, CreditCard, Banknote, Wallet, Zap, Check,
  Navigation as NavigationIcon, Search, Star, History, Crosshair,
  ChevronRight, ChevronLeft
} from 'lucide-vue-next'
import { createOrder } from '@/services/api'
import { formatCurrency } from '@/utils'

// ─── Mock Data ───────────────────────────────────────────

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

// Mock address suggestions for autocomplete
const ADDRESS_SUGGESTIONS = [
  { address: 'Kadikoy, Caferaga Mah. Moda Cad. No:25', district: 'Kadikoy, Istanbul', lat: 40.9870, lng: 29.0290 },
  { address: 'Besiktas, Sinanpasa Mah. Barbaros Bulvari No:50', district: 'Besiktas, Istanbul', lat: 41.0440, lng: 29.0010 },
  { address: 'Sisli, Mecidiyekoy Mah. Buyukdere Cad. No:100', district: 'Sisli, Istanbul', lat: 41.0660, lng: 28.9940 },
  { address: 'Uskudar, Altunizade Mah. Kisikli Cad. No:35', district: 'Uskudar, Istanbul', lat: 41.0240, lng: 29.0400 },
  { address: 'Fatih, Sultanahmet Mah. Divanyolu Cad. No:12', district: 'Fatih, Istanbul', lat: 41.0082, lng: 28.9784 },
  { address: 'Bakirkoy, Atakoy Mah. Cobancesme Cad. No:18', district: 'Bakirkoy, Istanbul', lat: 40.9810, lng: 28.8560 },
  { address: 'Sariyer, Istinye Mah. Istinye Bayiri Cad. No:7', district: 'Sariyer, Istanbul', lat: 41.1115, lng: 29.0590 },
  { address: 'Maltepe, Bagdat Cad. No:220', district: 'Maltepe, Istanbul', lat: 40.9340, lng: 29.1305 },
]

// ─── Router & State ──────────────────────────────────────

const router = useRouter()

const steps = [
  { label: 'Musteri & Adres' },
  { label: 'Siparis Detaylari' },
  { label: 'Zamanlama & Ozet' },
]

const currentStep = ref(1)
const transitionName = ref('slide-left')
const skeletonLoading = ref(true)

const form = reactive({
  project: PROJECTS[0],
  priority: 'normal',
  customerName: '',
  customerPhone: '',
  pickupAddress: DEFAULT_PICKUP.address,
  pickupDetail: DEFAULT_PICKUP.detail,
  pickupLat: DEFAULT_PICKUP.lat,
  pickupLng: DEFAULT_PICKUP.lng,
  deliveryAddress: '',
  deliveryDetail: '',
  deliveryLat: null,
  deliveryLng: null,
  deliveryNote: '',
  paymentMethod: 'card',
  deliveryType: 'today',
  deliveryDate: new Date().toISOString().split('T')[0],
  deliverySlot: TIME_SLOTS[1],
  orderNote: '',
})

const items = ref([{ sku: '', name: '', quantity: 1, price: 0 }])
const errors = reactive({})
const saved = ref(false)
const loading = ref(false)
const submitError = ref(null)
const foundCustomer = ref(null)
const showPickupSaved = ref(false)
const showDeliverySaved = ref(false)
const showAddressSuggestions = ref(false)
const firstFieldStep1 = ref(null)

// Skeleton loading simulation
onMounted(() => {
  setTimeout(() => {
    skeletonLoading.value = false
    nextTick(() => {
      firstFieldStep1.value?.focus()
    })
  }, 600)
})

// ─── Options ─────────────────────────────────────────────

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

// ─── Computed ────────────────────────────────────────────

const total = computed(() => items.value.reduce((s, it) => s + it.price * it.quantity, 0))

const paymentLabel = computed(() => {
  const opt = paymentOptions.find(o => o.v === form.paymentMethod)
  return opt ? opt.l : form.paymentMethod
})

const priorityLabel = computed(() => {
  const opt = priorityOptions.find(o => o.v === form.priority)
  return opt ? opt.l : form.priority
})

const priorityBadgeClass = computed(() => {
  const map = {
    normal: 'px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full',
    high: 'px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full',
    urgent: 'px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full',
  }
  return map[form.priority] || map.normal
})

const deliveryTypeLabel = computed(() => {
  const opt = deliveryOptions.find(o => o.v === form.deliveryType)
  if (!opt) return ''
  if (form.deliveryType === 'scheduled') return `${opt.l} - ${form.deliveryDate}`
  return opt.l
})

const pickupMapX = computed(() => form.pickupLat ? ((form.pickupLng - 28.7) / 0.6) * 100 : 0)
const pickupMapY = computed(() => form.pickupLat ? ((41.2 - form.pickupLat) / 0.35) * 100 : 0)
const deliveryMapX = computed(() => form.deliveryLat ? ((form.deliveryLng - 28.7) / 0.6) * 100 : 0)
const deliveryMapY = computed(() => form.deliveryLat ? ((41.2 - form.deliveryLat) / 0.35) * 100 : 0)

const distanceKm = computed(() => {
  if (!form.pickupLat || !form.deliveryLat) return '0'
  return (Math.sqrt(Math.pow((form.deliveryLat - form.pickupLat) * 111, 2) + Math.pow((form.deliveryLng - form.pickupLng) * 85, 2))).toFixed(1)
})

const filteredAddressSuggestions = computed(() => {
  const query = form.deliveryAddress.toLowerCase().trim()
  if (query.length < 2) return []
  return ADDRESS_SUGGESTIONS.filter(s =>
    s.address.toLowerCase().includes(query) || s.district.toLowerCase().includes(query)
  ).slice(0, 4)
})

// ─── Helpers ─────────────────────────────────────────────

const inputClass = (hasError) => {
  return `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${
    hasError ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'
  }`
}

const stepCircleClass = (step) => {
  if (step < currentStep.value) return 'bg-primary border-primary text-white'
  if (step === currentStep.value) return 'bg-primary/10 dark:bg-primary/20 border-primary text-primary font-bold'
  return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
}

const canGoToStep = (step) => {
  return step <= currentStep.value
}

const update = (field, value) => {
  form[field] = value
  if (errors[field]) delete errors[field]
}

const clearError = (field) => {
  if (errors[field]) delete errors[field]
}

// ─── Address Autocomplete ────────────────────────────────

const onDeliveryAddressInput = () => {
  clearError('deliveryAddress')
  showAddressSuggestions.value = form.deliveryAddress.length >= 2
}

const selectAddressSuggestion = (suggestion) => {
  form.deliveryAddress = suggestion.address
  form.deliveryLat = suggestion.lat
  form.deliveryLng = suggestion.lng
  showAddressSuggestions.value = false
  clearError('deliveryAddress')
}

const delayHideSuggestions = () => {
  setTimeout(() => {
    showAddressSuggestions.value = false
  }, 200)
}

// ─── Customer Lookup ─────────────────────────────────────

const phoneDigits = computed(() => form.customerPhone.replace(/\s/g, ''))

watch(phoneDigits, (digits) => {
  if (digits.length >= 7) {
    const match = Object.entries(SAVED_ADDRESSES).find(([key]) => key.includes(digits) || digits.includes(key))
    if (match) {
      const [, data] = match
      foundCustomer.value = data
      if (!form.customerName) form.customerName = data.name
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

const handleMapClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  const lat = 41.2 - y * 0.35
  const lng = 28.7 + x * 0.6
  form.deliveryLat = +lat.toFixed(4)
  form.deliveryLng = +lng.toFixed(4)
}

// ─── Products ────────────────────────────────────────────

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

// ─── Step Navigation ─────────────────────────────────────

const goToStep = (step) => {
  if (step < currentStep.value) {
    transitionName.value = 'slide-right'
    currentStep.value = step
  }
}

const validateStep1 = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.customerName.trim()) errors.customerName = true
  if (!form.customerPhone.trim()) errors.customerPhone = true
  if (!form.pickupAddress.trim()) errors.pickupAddress = true
  if (!form.deliveryAddress.trim()) errors.deliveryAddress = true
  return Object.keys(errors).length === 0
}

const validateStep2 = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!items.value.some(it => it.name)) errors.items = true
  return Object.keys(errors).length === 0
}

const nextStep = () => {
  if (currentStep.value === 1 && !validateStep1()) return
  if (currentStep.value === 2 && !validateStep2()) return
  if (currentStep.value < 3) {
    transitionName.value = 'slide-left'
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    transitionName.value = 'slide-right'
    currentStep.value--
  }
}

// ─── Keyboard Navigation ─────────────────────────────────

const handleGlobalKeydown = (e) => {
  if (e.key === 'Enter') {
    // Don't trigger on textareas or buttons
    const tag = e.target.tagName.toLowerCase()
    if (tag === 'textarea' || tag === 'button') return

    e.preventDefault()
    if (currentStep.value < 3) {
      nextStep()
    } else {
      handleSubmit()
    }
  }
}

// ─── Validation & Submit ─────────────────────────────────

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.customerName.trim()) errors.customerName = true
  if (!form.customerPhone.trim()) errors.customerPhone = true
  if (!form.pickupAddress.trim()) errors.pickupAddress = true
  if (!form.deliveryAddress.trim()) errors.deliveryAddress = true
  if (!items.value.some(it => it.name)) errors.items = true
  return Object.keys(errors).length === 0
}

const buildOrderPayload = () => ({
  project: form.project,
  priority: form.priority,
  customer: {
    name: form.customerName,
    phone: form.customerPhone,
  },
  pickup: {
    address: form.pickupAddress,
    detail: form.pickupDetail,
    lat: form.pickupLat,
    lng: form.pickupLng,
  },
  delivery: {
    address: form.deliveryAddress,
    detail: form.deliveryDetail,
    lat: form.deliveryLat,
    lng: form.deliveryLng,
    note: form.deliveryNote,
  },
  items: items.value.filter(it => it.name),
  payment: { method: form.paymentMethod },
  deliveryType: form.deliveryType,
  deliveryDate: form.deliveryDate,
  deliverySlot: form.deliverySlot,
})

const handleSubmit = async () => {
  if (!validate()) {
    // Jump to the step with errors
    if (errors.customerName || errors.customerPhone || errors.pickupAddress || errors.deliveryAddress) {
      transitionName.value = 'slide-right'
      currentStep.value = 1
    } else if (errors.items) {
      transitionName.value = 'slide-right'
      currentStep.value = 2
    }
    return
  }
  loading.value = true
  submitError.value = null
  try {
    const res = await createOrder(buildOrderPayload())
    if (!res.ok) {
      submitError.value = 'Siparis olusturulamadi. Lutfen tekrar deneyin.'
      return
    }
    saved.value = true
    setTimeout(() => router.push('/orders'), 1500)
  } catch (err) {
    submitError.value = 'Siparis olusturulamadi. Lutfen tekrar deneyin.'
  } finally {
    loading.value = false
  }
}

const handleSaveAndNew = async () => {
  if (!validate()) {
    if (errors.customerName || errors.customerPhone || errors.pickupAddress || errors.deliveryAddress) {
      transitionName.value = 'slide-right'
      currentStep.value = 1
    } else if (errors.items) {
      transitionName.value = 'slide-right'
      currentStep.value = 2
    }
    return
  }
  loading.value = true
  submitError.value = null
  try {
    const res = await createOrder(buildOrderPayload())
    if (!res.ok) {
      submitError.value = 'Siparis olusturulamadi. Lutfen tekrar deneyin.'
      return
    }
    saved.value = true
    setTimeout(() => {
      saved.value = false
      currentStep.value = 1
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
      form.orderNote = ''
      foundCustomer.value = null
      items.value = [{ sku: '', name: '', quantity: 1, price: 0 }]
    }, 1000)
  } catch (err) {
    submitError.value = 'Siparis olusturulamadi. Lutfen tekrar deneyin.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Step transition animations */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
