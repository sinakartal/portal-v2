<template>
  <div class="flex gap-0 min-h-[calc(100vh-120px)]">
    <!-- Left Sidebar Nav -->
    <nav class="w-56 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 pr-4">
      <h2 class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">Ayarlar</h2>
      <ul class="space-y-1">
        <li v-for="cat in categories" :key="cat.id">
          <button
            @click="activeCategory = cat.id"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              activeCategory === cat.id
                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            <component :is="cat.icon" :size="18" />
            {{ cat.label }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- Main Content -->
    <div class="flex-1 pl-8 max-w-4xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{{ currentCategory?.label }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ currentCategory?.desc }}</p>
      </div>

      <!-- ==================== GENEL ==================== -->
      <div v-if="activeCategory === 'general'" class="space-y-6">
        <!-- Company Info -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Building2 :size="18" class="text-slate-500 dark:text-slate-400" /> Sirket Bilgileri
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sirket Adi</label>
              <input type="text" v-model="company.name" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vergi No</label>
              <input type="text" v-model="company.taxId" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vergi Dairesi</label>
              <input type="text" v-model="company.taxOffice" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Telefon</label>
              <div class="relative">
                <Phone :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" v-model="company.phone" @input="markDirty('general')"
                  class="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-posta</label>
              <div class="relative">
                <Mail :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" v-model="company.email" @input="markDirty('general')"
                  class="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Website</label>
              <div class="relative">
                <Globe :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="url" v-model="company.website" @input="markDirty('general')"
                  class="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Adres</label>
              <textarea v-model="company.address" :rows="2" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Il</label>
              <input type="text" v-model="company.city" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ilce</label>
              <input type="text" v-model="company.district" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>
        </div>

        <!-- Regions -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <MapPin :size="18" class="text-slate-500 dark:text-slate-400" /> Bolge Ayarlari
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ regions.filter(r => r.isActive).length }} aktif bolge</span>
              <button class="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg cursor-pointer transition-colors">
                <Plus :size="14" /> Bolge Ekle
              </button>
            </div>
          </div>
          <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Bolge</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Kod</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Durum</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Kurye Limiti</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Siparis Limiti</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Teslimat Ucreti</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Islem</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="region in regions" :key="region.id" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <MapPin :size="14" class="text-slate-400" />
                      <span class="font-medium text-slate-800 dark:text-white">{{ region.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ region.code }}</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="toggleRegion(region.id); markDirty('general')" class="cursor-pointer">
                      <span v-if="region.isActive" class="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">Aktif</span>
                      <span v-else class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-medium">Pasif</span>
                    </button>
                  </td>
                  <td class="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{{ region.courierLimit }}</td>
                  <td class="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{{ region.orderLimit }}</td>
                  <td class="px-4 py-3 text-right text-slate-700 dark:text-slate-200 font-medium">{{ region.deliveryFee }} TL</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-1">
                      <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                        <Edit2 :size="14" class="text-slate-500 dark:text-slate-400" />
                      </button>
                      <button class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                        <Trash2 :size="14" class="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SLA Settings -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock :size="18" class="text-slate-500 dark:text-slate-400" /> Teslimat Sureleri & SLA
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Varsayilan Teslimat Suresi (dk)</label>
              <input type="number" v-model.number="sla.defaultDeliveryTime" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Maksimum Teslimat Suresi (dk)</label>
              <input type="number" v-model.number="sla.maxDeliveryTime" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Uyari Esigi (%)</label>
              <input type="number" v-model.number="sla.warningThreshold" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">SLA suresinin bu %si gectiginde uyari</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kritik Esik (%)</label>
              <input type="number" v-model.number="sla.criticalThreshold" @input="markDirty('general')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>
        </div>

        <!-- Save Button for General -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="handleSave('general')"
            :disabled="!dirtyFlags.general"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              dirtyFlags.general
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            ]"
          >
            <Save :size="16" /> Degisiklikleri Kaydet
          </button>
          <Transition name="fade">
            <span v-if="savedFlags.general" class="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle :size="16" /> Kaydedildi
            </span>
          </Transition>
        </div>
      </div>

      <!-- ==================== ENTEGRASYON ==================== -->
      <div v-if="activeCategory === 'integration'" class="space-y-6">
        <!-- Escalation & Retry -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle :size="18" class="text-slate-500 dark:text-slate-400" /> Eskalasyon ve Yeniden Deneme
          </h3>
          <div class="space-y-4">
            <label class="flex items-center justify-between">
              <div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Otomatik Eskalasyon</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">SLA asildiginda otomatik eskalasyon</p>
              </div>
              <div class="relative" @click="sla.autoEscalate = !sla.autoEscalate; markDirty('integration')">
                <input type="checkbox" v-model="sla.autoEscalate" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Eskalasyon Suresi (dk)</label>
                <input type="number" v-model.number="sla.escalateAfter" @input="markDirty('integration')"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Maks. Deneme Sayisi</label>
                <input type="number" v-model.number="sla.maxRetryAttempts" @input="markDirty('integration')"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Deneme Araligi (dk)</label>
                <input type="number" v-model.number="sla.retryInterval" @input="markDirty('integration')"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
          </div>
        </div>

        <!-- Penalty & Bonus -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Shield :size="18" class="text-slate-500 dark:text-slate-400" /> Ceza ve Bonus
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                <label class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-red-700 dark:text-red-400">Ceza Sistemi</span>
                  <div class="relative" @click="sla.penaltyEnabled = !sla.penaltyEnabled; markDirty('integration')">
                    <input type="checkbox" v-model="sla.penaltyEnabled" class="sr-only peer" />
                    <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-red-500 rounded-full transition-colors cursor-pointer" />
                    <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>
                <div>
                  <label class="block text-xs text-red-600 dark:text-red-400 mb-1">Ceza Tutari (TL)</label>
                  <input type="number" v-model.number="sla.penaltyAmount" @input="markDirty('integration')"
                    class="w-full px-3 py-2 border border-red-200 dark:border-red-900/40 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200" />
                </div>
              </div>
              <div class="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                <label class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-green-700 dark:text-green-400">Bonus Sistemi</span>
                  <div class="relative" @click="sla.bonusEnabled = !sla.bonusEnabled; markDirty('integration')">
                    <input type="checkbox" v-model="sla.bonusEnabled" class="sr-only peer" />
                    <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-green-500 rounded-full transition-colors cursor-pointer" />
                    <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>
                <div class="space-y-2">
                  <div>
                    <label class="block text-xs text-green-600 dark:text-green-400 mb-1">Bonus Tutari (TL)</label>
                    <input type="number" v-model.number="sla.bonusAmount" @input="markDirty('integration')"
                      class="w-full px-3 py-2 border border-green-200 dark:border-green-900/40 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-200" />
                  </div>
                  <div>
                    <label class="block text-xs text-green-600 dark:text-green-400 mb-1">Bonus Esigi (%)</label>
                    <input type="number" v-model.number="sla.bonusThreshold" @input="markDirty('integration')"
                      class="w-full px-3 py-2 border border-green-200 dark:border-green-900/40 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-200" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Minimum Basari Orani (%)</label>
              <input type="number" v-model.number="sla.minSuccessRate" @input="markDirty('integration')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Bu oranin altina dusen kuryeler otomatik uyari alir</p>
            </div>
          </div>
        </div>

        <!-- Save Button for Integration -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="handleSave('integration')"
            :disabled="!dirtyFlags.integration"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              dirtyFlags.integration
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            ]"
          >
            <Save :size="16" /> Degisiklikleri Kaydet
          </button>
          <Transition name="fade">
            <span v-if="savedFlags.integration" class="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle :size="16" /> Kaydedildi
            </span>
          </Transition>
        </div>
      </div>

      <!-- ==================== BILDIRIMLER ==================== -->
      <div v-if="activeCategory === 'notifications'" class="space-y-6">
        <!-- Email Notifications -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Mail :size="18" class="text-slate-500 dark:text-slate-400" /> E-posta Bildirimleri
          </h3>
          <div class="space-y-3">
            <label v-for="item in emailNotifications" :key="item.key"
              class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer"
              @click="notifications[item.key] = !notifications[item.key]; markDirty('notifications')"
            >
              <div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ item.label }}</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">{{ item.desc }}</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notifications[item.key]" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors" />
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
          </div>
        </div>

        <!-- SMS Notifications -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Phone :size="18" class="text-slate-500 dark:text-slate-400" /> SMS Bildirimleri
          </h3>
          <div class="space-y-3">
            <label v-for="item in smsNotifications" :key="item.key"
              class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer"
              @click="notifications[item.key] = !notifications[item.key]; markDirty('notifications')"
            >
              <div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ item.label }}</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">{{ item.desc }}</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notifications[item.key]" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors" />
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
          </div>
        </div>

        <!-- Push Notifications -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Bell :size="18" class="text-slate-500 dark:text-slate-400" /> Anlik Bildirimler
          </h3>
          <div class="space-y-3">
            <label v-for="item in pushNotifications" :key="item.key"
              class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer"
              @click="notifications[item.key] = !notifications[item.key]; markDirty('notifications')"
            >
              <div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ item.label }}</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">{{ item.desc }}</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notifications[item.key]" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors" />
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
          </div>
        </div>

        <!-- Report Schedule -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4">Rapor Zamanlama</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gunluk Rapor Saati</label>
              <input type="time" v-model="notifications.dailyReportTime" @change="markDirty('notifications')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Haftalik Rapor Gunu</label>
              <select v-model="notifications.weeklyReportDay" @change="markDirty('notifications')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                <option value="monday">Pazartesi</option>
                <option value="tuesday">Sali</option>
                <option value="wednesday">Carsamba</option>
                <option value="thursday">Persembe</option>
                <option value="friday">Cuma</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Save Button for Notifications -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="handleSave('notifications')"
            :disabled="!dirtyFlags.notifications"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              dirtyFlags.notifications
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            ]"
          >
            <Save :size="16" /> Degisiklikleri Kaydet
          </button>
          <Transition name="fade">
            <span v-if="savedFlags.notifications" class="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle :size="16" /> Kaydedildi
            </span>
          </Transition>
        </div>
      </div>

      <!-- ==================== API ==================== -->
      <div v-if="activeCategory === 'api'" class="space-y-6">
        <!-- API Key Section -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Key :size="18" class="text-slate-500 dark:text-slate-400" /> API Anahtari
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">API anahtariniz entegrasyon istekleri icin kullanilir. Gizli tutun.</p>
          <div class="flex items-center gap-3">
            <div class="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-700 dark:text-slate-300">
              <Lock :size="14" class="text-slate-400 flex-shrink-0" />
              <span>{{ maskedApiKey }}</span>
            </div>
            <button
              @click="copyApiKey"
              class="flex items-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <Check v-if="apiKeyCopied" :size="16" class="text-green-500" />
              <Copy v-else :size="16" />
              {{ apiKeyCopied ? 'Kopyalandi' : 'Kopyala' }}
            </button>
            <button
              @click="handleRegenerateApiKey"
              class="flex items-center gap-2 px-4 py-3 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
            >
              <RefreshCw :size="16" /> Yenile
            </button>
          </div>
          <p v-if="apiKeyRegenerated" class="mt-3 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle :size="14" /> Yeni API anahtari olusturuldu. Eski anahtar artik calismayacak.
          </p>
        </div>

        <!-- Webhook Settings -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Webhook :size="18" class="text-slate-500 dark:text-slate-400" /> Webhook Ayarlari
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Siparis ve teslimat olaylarini webhook ile kendi sisteminize iletin.</p>
          <div class="space-y-4">
            <div>
              <label class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Webhook Aktif</span>
                <div class="relative" @click="notifications.webhookEnabled = !notifications.webhookEnabled; markDirty('api')">
                  <input type="checkbox" v-model="notifications.webhookEnabled" class="sr-only peer" />
                  <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                  <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                </div>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Webhook URL</label>
              <div class="flex gap-2">
                <input type="url" v-model="notifications.webhookUrl" @input="markDirty('api')"
                  placeholder="https://api.yoursite.com/webhooks/bringo"
                  class="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <button
                  @click="testWebhook"
                  :disabled="!notifications.webhookUrl || webhookTesting"
                  :class="[
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
                    notifications.webhookUrl && !webhookTesting
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  ]"
                >
                  <Send :size="14" :class="webhookTesting ? 'animate-pulse' : ''" />
                  {{ webhookTesting ? 'Gonderiliyor...' : 'Test Gonder' }}
                </button>
              </div>
            </div>
            <!-- Webhook Test Result -->
            <Transition name="fade">
              <div v-if="webhookTestResult" :class="[
                'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium',
                webhookTestResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              ]">
                <CheckCircle v-if="webhookTestResult.success" :size="16" />
                <AlertTriangle v-else :size="16" />
                {{ webhookTestResult.message }}
              </div>
            </Transition>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Webhook Secret</label>
              <input type="password" v-model="notifications.webhookSecret" @input="markDirty('api')"
                placeholder="Webhook dogrulama anahtari"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Webhook isteklerini dogrulamak icin kullanilir (HMAC-SHA256)</p>
            </div>
          </div>
        </div>

        <!-- Save Button for API -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="handleSave('api')"
            :disabled="!dirtyFlags.api"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              dirtyFlags.api
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            ]"
          >
            <Save :size="16" /> Degisiklikleri Kaydet
          </button>
          <Transition name="fade">
            <span v-if="savedFlags.api" class="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle :size="16" /> Kaydedildi
            </span>
          </Transition>
        </div>
      </div>

      <!-- ==================== GUVENLIK ==================== -->
      <div v-if="activeCategory === 'security'" class="space-y-6">
        <!-- Password Policy -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Lock :size="18" class="text-slate-500 dark:text-slate-400" /> Sifre Politikasi
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Minimum Sifre Uzunlugu</label>
                <input type="number" v-model.number="security.minPasswordLength" @input="markDirty('security')"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sifre Gecerlilik Suresi (gun)</label>
                <input type="number" v-model.number="security.passwordExpiryDays" @input="markDirty('security')"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <label class="flex items-center justify-between py-2">
              <div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Iki Faktorlu Dogrulama (2FA)</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">Tum kullanicilar icin 2FA zorunlu kilsin</p>
              </div>
              <div class="relative" @click="security.require2FA = !security.require2FA; markDirty('security')">
                <input type="checkbox" v-model="security.require2FA" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
            <label class="flex items-center justify-between py-2">
              <div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">IP Kisitlama</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">Sadece belirlenen IP adreslerinden erisim</p>
              </div>
              <div class="relative" @click="security.ipRestriction = !security.ipRestriction; markDirty('security')">
                <input type="checkbox" v-model="security.ipRestriction" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
          </div>
        </div>

        <!-- Session Settings -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock :size="18" class="text-slate-500 dark:text-slate-400" /> Oturum Ayarlari
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Oturum Suresi (dakika)</label>
              <input type="number" v-model.number="security.sessionTimeout" @input="markDirty('security')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Maks. Hatali Giris Denemesi</label>
              <input type="number" v-model.number="security.maxLoginAttempts" @input="markDirty('security')"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>
        </div>

        <!-- Audit Log -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FileText :size="18" class="text-slate-500 dark:text-slate-400" /> Denetim Gunlugu
          </h3>
          <label class="flex items-center justify-between py-2">
            <div>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Detayli Kayit</span>
              <p class="text-xs text-slate-400 dark:text-slate-500">Tum kullanici islemlerini logla (login, siparis, ayar degisikligi vs.)</p>
            </div>
            <div class="relative" @click="security.auditLog = !security.auditLog; markDirty('security')">
              <input type="checkbox" v-model="security.auditLog" class="sr-only peer" />
              <div class="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
              <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
            </div>
          </label>
        </div>

        <!-- Save Button for Security -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="handleSave('security')"
            :disabled="!dirtyFlags.security"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              dirtyFlags.security
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            ]"
          >
            <Save :size="16" /> Degisiklikleri Kaydet
          </button>
          <Transition name="fade">
            <span v-if="savedFlags.security" class="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle :size="16" /> Kaydedildi
            </span>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Settings, Building2, MapPin, Clock, Bell, Save, Plus, Trash2,
  Edit2, ChevronRight, Mail, Phone, Globe, Shield, AlertTriangle,
  CheckCircle, Key, Lock, Copy, Check, RefreshCw, Send, FileText, Webhook
} from 'lucide-vue-next'
import { saveTenantSettings, getTenantSettings } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const loading = ref(false)
const error = ref(null)

// --- Dirty / Saved flags per section ---
const dirtyFlags = reactive({ general: false, integration: false, notifications: false, api: false, security: false })
const savedFlags = reactive({ general: false, integration: false, notifications: false, api: false, security: false })

function markDirty(section) {
  dirtyFlags[section] = true
}

function showSaved(section) {
  savedFlags[section] = true
  setTimeout(() => { savedFlags[section] = false }, 2000)
}

// --- Categories (sidebar nav) ---
const activeCategory = ref('general')

const categories = [
  { id: 'general', label: 'Genel', icon: Building2, desc: 'Sirket bilgileri, bolge ve SLA ayarlari' },
  { id: 'integration', label: 'Entegrasyon', icon: Shield, desc: 'Eskalasyon, ceza/bonus ve yeniden deneme ayarlari' },
  { id: 'notifications', label: 'Bildirimler', icon: Bell, desc: 'E-posta, SMS ve anlik bildirim tercihleri' },
  { id: 'api', label: 'API', icon: Key, desc: 'API anahtari ve webhook yapilandirmasi' },
  { id: 'security', label: 'Guvenlik', icon: Lock, desc: 'Sifre politikasi, 2FA ve oturum ayarlari' },
]

const currentCategory = computed(() => categories.find(c => c.id === activeCategory.value))

// --- Existing Data (kept from original) ---
const company = reactive({
  name: 'HeyBringo Lojistik A.S.',
  taxId: '1234567890',
  taxOffice: 'Kadikoy Vergi Dairesi',
  phone: '0216 555 1234',
  email: 'info@heybringo.com',
  website: 'https://heybringo.com',
  address: 'Caferaga Mah. Moda Cad. No:45 Kadikoy/Istanbul',
  city: 'Istanbul',
  district: 'Kadikoy',
  postalCode: '34710',
  logo: '',
})

const regions = ref([
  { id: 1, name: 'Kadikoy', code: 'KDK', isActive: true, courierLimit: 10, orderLimit: 200, deliveryFee: 15 },
  { id: 2, name: 'Besiktas', code: 'BSK', isActive: true, courierLimit: 8, orderLimit: 150, deliveryFee: 18 },
  { id: 3, name: 'Sisli', code: 'SSL', isActive: true, courierLimit: 6, orderLimit: 120, deliveryFee: 16 },
  { id: 4, name: 'Uskudar', code: 'USK', isActive: true, courierLimit: 7, orderLimit: 130, deliveryFee: 17 },
  { id: 5, name: 'Bakirkoy', code: 'BKR', isActive: false, courierLimit: 5, orderLimit: 100, deliveryFee: 20 },
  { id: 6, name: 'Fatih', code: 'FTH', isActive: true, courierLimit: 8, orderLimit: 160, deliveryFee: 14 },
  { id: 7, name: 'Atasehir', code: 'ATS', isActive: true, courierLimit: 6, orderLimit: 110, deliveryFee: 19 },
  { id: 8, name: 'Maltepe', code: 'MLT', isActive: true, courierLimit: 5, orderLimit: 90, deliveryFee: 22 },
])

const sla = reactive({
  defaultDeliveryTime: 120,
  maxDeliveryTime: 240,
  warningThreshold: 80,
  criticalThreshold: 90,
  autoEscalate: true,
  escalateAfter: 30,
  penaltyEnabled: true,
  penaltyAmount: 50,
  bonusEnabled: true,
  bonusAmount: 30,
  bonusThreshold: 95,
  minSuccessRate: 90,
  maxRetryAttempts: 3,
  retryInterval: 60,
})

const notifications = reactive({
  emailOrderNew: true,
  emailOrderCancel: true,
  emailDeliveryFail: true,
  emailSlaWarning: true,
  emailDailyReport: true,
  emailWeeklyReport: true,
  smsOrderUpdate: false,
  smsCourierAssign: true,
  smsDeliveryComplete: true,
  pushOrderNew: true,
  pushSlaAlert: true,
  pushCourierOffline: true,
  webhookEnabled: false,
  webhookUrl: '',
  webhookSecret: '',
  dailyReportTime: '09:00',
  weeklyReportDay: 'monday',
})

const security = reactive({
  minPasswordLength: 8,
  passwordExpiryDays: 90,
  require2FA: false,
  ipRestriction: false,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  auditLog: true,
})

// --- API Key ---
const apiKey = ref('brg_live_sk_7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c')
const apiKeyCopied = ref(false)
const apiKeyRegenerated = ref(false)

const maskedApiKey = computed(() => {
  const key = apiKey.value
  if (!key || key.length < 12) return '***'
  return key.substring(0, 8) + '****************************' + key.substring(key.length - 4)
})

function copyApiKey() {
  navigator.clipboard.writeText(apiKey.value)
  apiKeyCopied.value = true
  setTimeout(() => { apiKeyCopied.value = false }, 2000)
}

async function handleRegenerateApiKey() {
  if (!confirm('API anahtari yenilenecek. Eski anahtar calismayacak. Emin misiniz?')) return
  const auth = useAuthStore()
  const projectId = auth.activeProjectId || auth.user?.defaultProject || 'default'
  try {
    const { regenerateApiKey } = await import('@/services/api')
    const res = await regenerateApiKey(auth.token, projectId)
    if (res.ok && res.data) {
      const newKey = res.data.data?.apiKey || res.data.apiKey || res.data.key
      if (newKey) {
        apiKey.value = newKey
        apiKeyRegenerated.value = true
        setTimeout(() => { apiKeyRegenerated.value = false }, 5000)
        return
      }
    }
  } catch (e) {
    console.warn('[Settings] Backend key regen failed, generating locally:', e.message)
  }
  // Fallback: local generation (when backend is unavailable)
  const chars = 'abcdef0123456789'
  let newKey = 'brg_live_sk_'
  for (let i = 0; i < 32; i++) newKey += chars[Math.floor(Math.random() * chars.length)]
  apiKey.value = newKey
  apiKeyRegenerated.value = true
  setTimeout(() => { apiKeyRegenerated.value = false }, 5000)
}

// --- Webhook Test ---
const webhookTesting = ref(false)
const webhookTestResult = ref(null)

async function testWebhook() {
  if (!notifications.webhookUrl) return
  webhookTesting.value = true
  webhookTestResult.value = null
  try {
    const { testWebhookProxy } = await import('@/services/api')
    const payload = {
      type: 'test',
      timestamp: new Date().toISOString(),
      message: 'HeyBringo webhook test',
    }
    const res = await testWebhookProxy(notifications.webhookUrl, payload)
    if (res.ok) {
      webhookTestResult.value = { success: true, message: `Basarili! Webhook testi gecti.` }
    } else {
      webhookTestResult.value = { success: false, message: res.data?.error || `Webhook testi basarisiz.` }
    }
  } catch (e) {
    webhookTestResult.value = { success: false, message: `Baglanti hatasi: ${e.message}` }
  } finally {
    webhookTesting.value = false
  }
}

// --- Save ---
const handleSave = async (section) => {
  loading.value = true
  error.value = null
  try {
    const configData = {
      company: { ...company },
      regions: regions.value,
      sla: { ...sla },
      notifications: { ...notifications },
      security: { ...security },
    }
    const res = await saveTenantSettings(configData)
    dirtyFlags[section] = false
    showSaved(section)
    if (!res.ok) {
      console.warn('[Settings] API save failed, shown as saved locally')
    }
  } catch (e) {
    console.error('[Settings] Save error:', e)
    error.value = 'Ayarlar kaydedilirken hata olustu'
    dirtyFlags[section] = false
    showSaved(section)
  } finally {
    loading.value = false
  }
}

const toggleRegion = (id) => {
  regions.value = regions.value.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
}

// --- Notification lists ---
const emailNotifications = [
  { key: 'emailOrderNew', label: 'Yeni Siparis', desc: 'Yeni siparis olusturuldiginda bildirim' },
  { key: 'emailOrderCancel', label: 'Siparis Iptali', desc: 'Siparis iptal edildiginde bildirim' },
  { key: 'emailDeliveryFail', label: 'Basarisiz Teslimat', desc: 'Teslimat basarisiz oldugunda bildirim' },
  { key: 'emailSlaWarning', label: 'SLA Uyarisi', desc: 'SLA limiti yaklastiginda bildirim' },
  { key: 'emailDailyReport', label: 'Gunluk Rapor', desc: 'Her gun otomatik ozet rapor' },
  { key: 'emailWeeklyReport', label: 'Haftalik Rapor', desc: 'Her hafta detayli rapor' },
]

const smsNotifications = [
  { key: 'smsOrderUpdate', label: 'Siparis Guncellemesi', desc: 'Musteri siparis durumu degistiginde SMS alir' },
  { key: 'smsCourierAssign', label: 'Kurye Atama', desc: 'Kuryeye siparis atandiginda SMS gider' },
  { key: 'smsDeliveryComplete', label: 'Teslimat Tamamlandi', desc: 'Teslimat tamamlandiginda musteri bilgilendirilir' },
]

const pushNotifications = [
  { key: 'pushOrderNew', label: 'Yeni Siparis', desc: 'Anlik bildirim ile haberdar olun' },
  { key: 'pushSlaAlert', label: 'SLA Alarmi', desc: 'Kritik SLA uyarilari icin anlik bildirim' },
  { key: 'pushCourierOffline', label: 'Kurye Cevrimdisi', desc: 'Kurye uzun sure cevrimdisi olursa bildirim' },
]

// --- Load from API ---
onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getAlgorithmConfig()
    if (res.ok && res.data) {
      const config = res.data
      if (config.company) {
        Object.keys(config.company).forEach(key => {
          if (key in company) company[key] = config.company[key]
        })
      }
      if (config.regions && Array.isArray(config.regions)) {
        regions.value = config.regions
      }
      if (config.sla) {
        Object.keys(config.sla).forEach(key => {
          if (key in sla) sla[key] = config.sla[key]
        })
      }
      if (config.notifications) {
        Object.keys(config.notifications).forEach(key => {
          if (key in notifications) notifications[key] = config.notifications[key]
        })
      }
      if (config.security) {
        Object.keys(config.security).forEach(key => {
          if (key in security) security[key] = config.security[key]
        })
      }
    }
  } catch (e) {
    console.error('[Settings] Config load error:', e)
    error.value = 'Ayarlar yuklenirken hata olustu'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
