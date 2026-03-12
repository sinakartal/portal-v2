<template>
  <div>
    <!-- Skeleton Loading -->
    <template v-if="loading">
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div class="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
        </div>
        <div class="flex gap-2">
          <div class="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div class="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div class="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div class="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div v-for="n in 4" :key="n" class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <div class="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div class="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div class="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div v-for="n in 3" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div>
              <div class="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div class="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-1 animate-pulse" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div v-for="m in 4" :key="m" class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div class="h-3 w-12 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-2" />
              <div class="h-6 w-16 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" />
            </div>
          </div>
          <div class="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
      </div>
    </template>

    <!-- Main Content -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">
            3PL Partner Yonetimi
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Partner entegrasyonlari ve performans takibi
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showTransferModal = true"
            class="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Zap :size="16" /> Hizli Transfer
          </button>
          <button
            @click="showAddModal = true"
            class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus :size="16" /> Partner Ekle
          </button>
          <button
            @click="router.push('/partners/rules')"
            class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Settings :size="16" /> Kurallar
          </button>
          <button
            @click="router.push('/partners/compare')"
            class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <BarChart3 :size="16" /> Karsilastir
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          v-for="card in SUMMARY"
          :key="card.title"
          class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-slate-500 dark:text-slate-400">
              {{ card.title }}
            </span>
            <div
              :class="`w-9 h-9 ${card.bg} dark:bg-opacity-20 rounded-lg flex items-center justify-center`"
            >
              <component :is="card.icon" :size="18" :class="card.color" />
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">
            {{ card.value }}
          </p>
          <p
            :class="`text-xs mt-1 ${card.subColor || 'text-slate-400 dark:text-slate-500'}`"
          >
            {{ card.sub }}
          </p>
        </div>
      </div>

      <!-- Active Partners -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
            Aktif Partnerler
          </h2>
          <span class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Activity :size="12" /> Canli
          </span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            v-for="partner in PARTNERS"
            :key="partner.id"
            :class="[
              'bg-white dark:bg-slate-800 rounded-xl border shadow-sm hover:shadow-md transition-all',
              partnerPaused[partner.id]
                ? 'border-slate-300 dark:border-slate-600 opacity-60'
                : 'border-slate-200 dark:border-slate-700'
            ]"
          >
            <!-- Card Header -->
            <div class="p-5 pb-4">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <!-- Logo Initials -->
                  <div
                    :class="[
                      'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm',
                      partner.bgColor || 'bg-gradient-to-br from-blue-500 to-blue-600'
                    ]"
                  >
                    {{ getInitials(partner.name) }}
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-800 dark:text-white">
                      {{ partner.name }}
                    </h3>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span
                        :class="[
                          'w-2 h-2 rounded-full',
                          STATUS_STYLES[partner.status].dot,
                          !partnerPaused[partner.id] ? 'animate-pulse' : ''
                        ]"
                      />
                      <span
                        :class="`text-xs font-medium px-1.5 py-0.5 rounded border ${STATUS_STYLES[partner.status].badge}`"
                      >
                        {{ partnerPaused[partner.id] ? 'Durduruldu' : partner.statusLabel }}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  v-if="partner.warning && !partnerPaused[partner.id]"
                  class="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg"
                >
                  <AlertTriangle :size="12" />
                  {{ partner.warning }}
                </div>
              </div>

              <!-- Stats Grid: Today's Orders + Transfer Count + SLA Rate + Cost -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Bugunku Siparis
                  </p>
                  <p class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    {{ partner.orders }}
                    <span class="text-xs font-normal text-slate-400">adet</span>
                  </p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Transfer Sayisi
                  </p>
                  <p class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    {{ partner.transferCount || Math.floor(partner.orders * 0.7) }}
                    <ArrowRightLeft :size="12" class="text-blue-500" />
                  </p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Teslim Orani
                  </p>
                  <p class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    %{{ partner.deliveryRate }}
                    <TrendingUp v-if="partner.deliveryRate >= 95" :size="14" class="text-green-500" />
                    <TrendingDown v-else :size="14" class="text-amber-500" />
                  </p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Maliyet
                  </p>
                  <p class="text-lg font-bold text-slate-800 dark:text-white">
                    &#8378;{{ partner.costPerOrder }}/sip
                  </p>
                </div>
              </div>

              <!-- SLA Bar -->
              <div class="mt-4">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Shield :size="12" /> SLA Uyumu
                  </span>
                  <span :class="`text-xs font-bold ${getSlaColor(partner.sla)}`">
                    %{{ partner.sla }}
                  </span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: `${partner.sla}%`,
                      backgroundColor:
                        partner.sla >= 95
                          ? '#22c55e'
                          : partner.sla >= 90
                            ? '#eab308'
                            : '#ef4444',
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center border-t border-slate-100 dark:border-slate-700">
              <button
                @click="router.push(`/partners/${partner.id}`)"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Eye :size="14" /> Detay
              </button>
              <div class="w-px h-8 bg-slate-100 dark:bg-slate-700" />
              <button
                @click="router.push(`/partners/${partner.id}`)"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Settings :size="14" /> Ayarlar
              </button>
              <div class="w-px h-8 bg-slate-100 dark:bg-slate-700" />
              <button
                @click="togglePause(partner.id)"
                :class="[
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors cursor-pointer',
                  partnerPaused[partner.id]
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                ]"
              >
                <template v-if="partnerPaused[partner.id]">
                  <Play :size="14" /> Devam
                </template>
                <template v-else>
                  <Pause :size="14" /> Durdur
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Activity Feed -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between p-5 pb-3">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity :size="18" class="text-primary" />
            Canli Aktivite
          </h2>
          <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Canli
          </div>
        </div>
        <div class="px-5 pb-5">
          <div class="space-y-3 max-h-[320px] overflow-y-auto">
            <div
              v-for="item in ACTIVITY_FEED"
              :key="item.id"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span
                :class="`w-2.5 h-2.5 rounded-full flex-shrink-0 ${FEED_DOT[item.status]}`"
              />
              <span class="text-xs text-slate-400 dark:text-slate-500 font-mono w-12 flex-shrink-0">
                {{ item.time }}
              </span>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200 w-28 flex-shrink-0">
                {{ item.partner }}
              </span>
              <span class="text-sm text-slate-600 dark:text-slate-300 flex-1">
                {{ item.event }}
              </span>
              <ChevronRight :size="14" class="text-slate-300 dark:text-slate-600 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Partner Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="showAddModal = false"
      />
      <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4">
        <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <Package :size="20" class="text-primary" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-800 dark:text-white">
                Yeni Partner Ekle
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                3PL partner entegrasyon bilgilerini girin
              </p>
            </div>
          </div>
          <button
            @click="showAddModal = false"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X :size="18" class="text-slate-400" />
          </button>
        </div>

        <form @submit.prevent="handleAddPartner" class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Partner Adi
            </label>
            <input
              type="text"
              v-model="formData.name"
              placeholder="ornegin: Yurticikargo Express"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Partner Kodu
            </label>
            <input
              type="text"
              v-model="formData.code"
              placeholder="ornegin: YURTICI-EXP"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              API URL
            </label>
            <input
              type="url"
              v-model="formData.apiUrl"
              placeholder="https://api.partner.com/v1"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              v-model="formData.apiKey"
              placeholder="API anahtarinizi girin"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Iptal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <Plus :size="16" /> Partner Ekle
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Hizli Transfer Modal -->
    <div v-if="showTransferModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="showTransferModal = false"
      />
      <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4">
        <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Zap :size="20" class="text-amber-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-800 dark:text-white">
                Hizli Transfer
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Siparisleri hizlica partnerler arasi aktarin
              </p>
            </div>
          </div>
          <button
            @click="showTransferModal = false"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X :size="18" class="text-slate-400" />
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Source Partner -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Kaynak Partner
            </label>
            <select
              v-model="transferForm.sourcePartner"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">Partner secin</option>
              <option value="bringo">Bringo (Kendi Kurye)</option>
              <option v-for="p in PARTNERS" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <!-- Arrow -->
          <div class="flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <ArrowRightLeft :size="18" class="text-slate-400" />
            </div>
          </div>

          <!-- Target Partner -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Hedef Partner
            </label>
            <select
              v-model="transferForm.targetPartner"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">Partner secin</option>
              <option v-for="p in PARTNERS" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <!-- Order Count -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Siparis Adedi
            </label>
            <div class="flex items-center gap-3">
              <button
                v-for="count in [5, 10, 20, 50]"
                :key="count"
                @click="transferForm.orderCount = count"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
                  transferForm.orderCount === count
                    ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-amber-300'
                ]"
              >
                {{ count }}
              </button>
              <input
                type="number"
                v-model.number="transferForm.orderCount"
                min="1"
                max="200"
                class="w-20 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Ozel"
              />
            </div>
          </div>

          <!-- Transfer Preview -->
          <div v-if="transferForm.sourcePartner && transferForm.targetPartner && transferForm.orderCount" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p class="text-sm text-amber-800 dark:text-amber-300">
              <strong>{{ transferForm.orderCount }}</strong> siparis
              <strong>{{ getPartnerName(transferForm.sourcePartner) }}</strong>'dan
              <strong>{{ getPartnerName(transferForm.targetPartner) }}</strong>'e aktarilacak.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              @click="showTransferModal = false"
              class="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Iptal
            </button>
            <button
              @click="handleQuickTransfer"
              :disabled="!transferForm.sourcePartner || !transferForm.targetPartner || !transferForm.orderCount"
              class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <Zap :size="16" /> Transferi Baslat
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Settings, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign,
  Truck, Eye, Pause, Play, AlertTriangle, CheckCircle, ArrowRightLeft,
  X, Package, Activity, ChevronRight, Shield, Zap
} from 'lucide-vue-next'
import { getPartners, transferOrders } from '@/services/api'

const router = useRouter()
const loading = ref(true)
const error = ref(null)

// ---- Default Data ----

const PARTNER_COLORS = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
]

const DEFAULT_SUMMARY = [
  {
    title: 'Aktarilan',
    value: '342',
    sub: '3 partner',
    icon: ArrowRightLeft,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Teslim Orani',
    value: '%94.8',
    sub: '+2.1%',
    subColor: 'text-green-600',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Ort. Sure',
    value: '38 dk',
    sub: '-5 dk',
    subColor: 'text-green-600',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Maliyet',
    value: '\u20BA12,450',
    sub: '\u20BA36.4/sip',
    icon: DollarSign,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
]

const DEFAULT_PARTNERS = [
  {
    id: 'trendyol-go',
    name: 'Trendyol Go',
    status: 'active',
    statusLabel: 'Aktif',
    orders: 156,
    transferCount: 109,
    deliveryRate: 96.2,
    avgTime: 35,
    costPerOrder: 32,
    sla: 98.5,
    warning: null,
    bgColor: PARTNER_COLORS[0],
  },
  {
    id: 'paket-taxi',
    name: 'Paket Taxi',
    status: 'active',
    statusLabel: 'Aktif',
    orders: 128,
    transferCount: 91,
    deliveryRate: 93.8,
    avgTime: 42,
    costPerOrder: 38,
    sla: 95.2,
    warning: null,
    bgColor: PARTNER_COLORS[1],
  },
  {
    id: 'getir-kurye',
    name: 'Getir Kurye',
    status: 'limited',
    statusLabel: 'Kisitli',
    orders: 58,
    transferCount: 42,
    deliveryRate: 91.4,
    avgTime: 48,
    costPerOrder: 45,
    sla: 88.7,
    warning: 'SLA dusuk',
    bgColor: PARTNER_COLORS[2],
  },
]

const SUMMARY = ref(DEFAULT_SUMMARY)
const PARTNERS = ref(DEFAULT_PARTNERS)

const ACTIVITY_FEED = [
  { id: 1, time: '14:32', partner: 'Trendyol Go', event: '12 siparis aktarildi', status: 'success' },
  { id: 2, time: '14:28', partner: 'Paket Taxi', event: 'Siparis BRN-3847 teslim edildi', status: 'success' },
  { id: 3, time: '14:25', partner: 'Getir Kurye', event: 'SLA uyarisi - ortalama sure 48dk', status: 'warning' },
  { id: 4, time: '14:20', partner: 'Trendyol Go', event: 'Siparis BRN-3842 teslim edildi', status: 'success' },
  { id: 5, time: '14:15', partner: 'Paket Taxi', event: '8 siparis aktarildi', status: 'success' },
  { id: 6, time: '14:10', partner: 'Getir Kurye', event: 'Siparis BRN-3839 gecikmeli', status: 'error' },
  { id: 7, time: '14:05', partner: 'Trendyol Go', event: 'Siparis BRN-3835 teslim edildi', status: 'success' },
  { id: 8, time: '13:58', partner: 'Paket Taxi', event: 'Siparis BRN-3831 teslim edildi', status: 'success' },
]

const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  limited: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  },
  error: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  },
}

const FEED_DOT = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

// ---- State ----

const showAddModal = ref(false)
const showTransferModal = ref(false)
const partnerPaused = ref({})
const formData = reactive({
  name: '',
  code: '',
  apiUrl: '',
  apiKey: '',
})
const transferForm = reactive({
  sourcePartner: '',
  targetPartner: '',
  orderCount: 10,
})

// ---- Methods ----

const getInitials = (name) => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const getPartnerName = (id) => {
  if (id === 'bringo') return 'Bringo'
  const p = PARTNERS.value.find(p => p.id === id)
  return p ? p.name : id
}

const togglePause = (id) => {
  partnerPaused.value = { ...partnerPaused.value, [id]: !partnerPaused.value[id] }
}

const getSlaColor = (sla) => {
  if (sla >= 95) return 'text-green-600'
  if (sla >= 90) return 'text-yellow-600'
  return 'text-red-600'
}

const handleAddPartner = () => {
  showAddModal.value = false
  formData.name = ''
  formData.code = ''
  formData.apiUrl = ''
  formData.apiKey = ''
}

const handleQuickTransfer = async () => {
  try {
    await transferOrders({
      source: transferForm.sourcePartner,
      target: transferForm.targetPartner,
      count: transferForm.orderCount,
    })
  } catch (e) {
    console.error('[Transfer] Error:', e)
  }
  showTransferModal.value = false
  transferForm.sourcePartner = ''
  transferForm.targetPartner = ''
  transferForm.orderCount = 10
}

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getPartners()
    if (res.ok && res.data) {
      const partners = Array.isArray(res.data) ? res.data : res.data?.partners || []
      if (partners.length > 0) {
        PARTNERS.value = partners.map((p, idx) => ({
          id: p.id || p._id || p.code,
          name: p.name,
          status: p.status || 'active',
          statusLabel: p.status === 'limited' ? 'Kisitli' : p.status === 'error' ? 'Hata' : 'Aktif',
          orders: p.orders || p.orderCount || 0,
          transferCount: p.transferCount || Math.floor((p.orders || 0) * 0.7),
          deliveryRate: p.deliveryRate || p.successRate || 0,
          avgTime: p.avgTime || p.avgDeliveryTime || 0,
          costPerOrder: p.costPerOrder || p.avgCost || 0,
          sla: p.sla || p.slaCompliance || 0,
          warning: p.warning || (p.sla < 90 ? 'SLA dusuk' : null),
          bgColor: PARTNER_COLORS[idx % PARTNER_COLORS.length],
        }))

        const totalOrders = PARTNERS.value.reduce((s, p) => s + p.orders, 0)
        const avgRate = PARTNERS.value.length > 0 ? (PARTNERS.value.reduce((s, p) => s + p.deliveryRate, 0) / PARTNERS.value.length).toFixed(1) : 0
        const avgTime = PARTNERS.value.length > 0 ? Math.round(PARTNERS.value.reduce((s, p) => s + p.avgTime, 0) / PARTNERS.value.length) : 0
        const totalCost = PARTNERS.value.reduce((s, p) => s + (p.orders * p.costPerOrder), 0)
        const avgCostPerOrder = totalOrders > 0 ? (totalCost / totalOrders).toFixed(1) : 0

        SUMMARY.value = [
          { title: 'Aktarilan', value: String(totalOrders), sub: `${PARTNERS.value.length} partner`, icon: ArrowRightLeft, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Teslim Orani', value: `%${avgRate}`, sub: '', subColor: 'text-green-600', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Ort. Sure', value: `${avgTime} dk`, sub: '', subColor: 'text-green-600', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Maliyet', value: `\u20BA${totalCost.toLocaleString('tr-TR')}`, sub: `\u20BA${avgCostPerOrder}/sip`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ]
      }
    }
  } catch (e) {
    console.error('[Partners] API error:', e)
    error.value = 'Partner verileri yuklenirken hata olustu'
  } finally {
    loading.value = false
  }
})
</script>
