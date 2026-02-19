<template>
  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Page header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <FileSpreadsheet class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Excel Import</h1>
            <p class="text-sm text-gray-500">Toplu siparis yukleme sihirbazi</p>
          </div>
        </div>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-0 mb-8">
        <div v-for="(s, idx) in STEPS" :key="s.num" class="flex items-center">
          <div class="flex flex-col items-center">
            <div
              :class="`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                s.num < step
                  ? 'bg-emerald-500 text-white'
                  : s.num === step
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-500'
              }`"
            >
              <CheckCircle v-if="s.num < step" class="w-5 h-5" />
              <template v-else>{{ s.num }}</template>
            </div>
            <span
              :class="`mt-2 text-xs font-medium whitespace-nowrap ${
                s.num === step ? 'text-blue-600' : s.num < step ? 'text-emerald-600' : 'text-gray-400'
              }`"
            >
              {{ s.label }}
            </span>
          </div>
          <div
            v-if="idx < STEPS.length - 1"
            :class="`w-20 h-0.5 mx-2 mt-[-18px] transition-colors duration-300 ${
              s.num < step ? 'bg-emerald-500' : 'bg-gray-200'
            }`"
          />
        </div>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <!-- Step title -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-800">
            <template v-if="step === 1">Dosya Yukle</template>
            <template v-if="step === 2">Sutun Eslestirme</template>
            <template v-if="step === 3">Onizleme ve Dogrulama</template>
            <template v-if="step === 4">Import</template>
          </h2>
          <p class="text-sm text-gray-500 mt-0.5">
            <template v-if="step === 1">Excel veya CSV dosyanizi yukleyin ve projenizi secin</template>
            <template v-if="step === 2">Excel sutunlarini sistem alanlariyla eslestirin</template>
            <template v-if="step === 3">Verileri kontrol edin ve hatalari inceleyin</template>
            <template v-if="step === 4">Siparisler sisteme aktariliyor</template>
          </p>
        </div>

        <!-- Step 1: File Upload -->
        <div v-if="step === 1" class="space-y-6">
          <!-- Project selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Proje Secin</label>
            <div class="relative">
              <select
                v-model="project"
                class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              >
                <option value="">Proje secin...</option>
                <option v-for="p in PROJECTS" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <!-- Drag-drop area -->
          <div
            v-if="!file"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
            @click="handleMockUpload"
            :class="`relative cursor-pointer border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
            }`"
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              @change="handleFileSelect"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div class="flex flex-col items-center">
              <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Upload class="w-8 h-8 text-blue-500" />
              </div>
              <p class="text-base font-medium text-gray-700 mb-1">
                Dosyanizi surukleyip birakin veya tiklayin
              </p>
              <p class="text-sm text-gray-500 mb-4">
                Excel veya CSV dosyanizi buraya yukleyin
              </p>
              <div class="flex items-center gap-2">
                <span
                  v-for="ext in ['.xlsx', '.xls', '.csv']"
                  :key="ext"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600"
                >
                  <FileSpreadsheet class="w-3 h-3 mr-1" />
                  {{ ext }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-3">Maks. 5MB, 1000 satir</p>
            </div>
          </div>

          <!-- File uploaded -->
          <div v-else class="border border-gray-200 rounded-xl p-6 bg-white">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FileSpreadsheet class="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ file.name }}</p>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs text-gray-500">{{ formatSize(file.size) }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300" />
                    <span class="text-xs text-gray-500">{{ file.rows }} satir</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300" />
                    <span class="inline-flex items-center text-xs text-emerald-600 font-medium">
                      <CheckCircle class="w-3.5 h-3.5 mr-1" />
                      Yuklendi
                    </span>
                  </div>
                </div>
              </div>
              <button
                @click.stop="file = null"
                class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Template downloads -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Sablon indir:</span>
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
              <Download class="w-3.5 h-3.5" />
              Excel Sablon
            </button>
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
              <Download class="w-3.5 h-3.5" />
              CSV Sablon
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              @click="router.go(-1)"
              class="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Iptal
            </button>
            <button
              @click="step = 2"
              :disabled="!file || !project"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Devam
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 2: Column Mapping -->
        <div v-if="step === 2" class="space-y-6">
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <AlertTriangle class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p class="text-sm font-medium text-blue-800">Otomatik eslestirme yapildi</p>
                <p class="text-xs text-blue-600 mt-0.5">
                  Excel sutunlari sistem alanlariyla otomatik olarak eslestirildi. Gerekirse degistirebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <!-- Header -->
            <div class="grid grid-cols-[1fr_40px_1fr_48px] items-center px-5 py-3 bg-gray-50 border-b border-gray-200">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Excel Sutunu</span>
              <span />
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sistem Alani</span>
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Durum</span>
            </div>

            <!-- Rows -->
            <div
              v-for="col in EXCEL_COLUMNS"
              :key="col.key"
              class="grid grid-cols-[1fr_40px_1fr_48px] items-center px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition"
            >
              <!-- Excel column -->
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span class="text-sm font-bold text-emerald-600">{{ col.key }}</span>
                </div>
                <span class="text-sm font-medium text-gray-700">{{ col.label.split(': ')[1] }}</span>
              </div>

              <!-- Arrow -->
              <div class="flex justify-center">
                <ArrowRight class="w-4 h-4 text-gray-300" />
              </div>

              <!-- System field dropdown -->
              <div class="relative">
                <select
                  :value="mappings[col.key] || ''"
                  @change="mappings[col.key] = $event.target.value"
                  class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                >
                  <option value="">-- Eslestirme yok --</option>
                  <option v-for="sf in SYSTEM_FIELDS" :key="sf.key" :value="sf.key">{{ sf.label }}</option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              <!-- Status -->
              <div class="flex justify-center">
                <template v-if="mappings[col.key]">
                  <div v-if="isAutoMatched(col.key)" class="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle class="w-4 h-4 text-emerald-500" />
                  </div>
                  <div v-else class="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircle class="w-4 h-4 text-blue-500" />
                  </div>
                </template>
                <div v-else class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <XCircle class="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          <!-- Unmapped system fields info -->
          <div v-if="unmappedFields.length > 0" class="text-xs text-gray-400">
            Eslestirilmemis sistem alanlari: {{ unmappedFields.map(u => u.label).join(', ') }}
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              @click="step = 1"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <ArrowLeft class="w-4 h-4" />
              Geri
            </button>
            <button
              @click="step = 3"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
            >
              Devam
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 3: Preview & Validation -->
        <div v-if="step === 3" class="space-y-5">
          <!-- Summary bar -->
          <div class="grid grid-cols-3 gap-4">
            <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText class="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Toplam</p>
                <p class="text-lg font-bold text-gray-800">{{ totalCount }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Gecerli</p>
                <p class="text-lg font-bold text-emerald-700">{{ validCount }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
              <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle class="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Hatali</p>
                <p class="text-lg font-bold text-red-600">{{ errorCount }}</p>
              </div>
            </div>
          </div>

          <!-- Tab filters -->
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              v-for="tab in previewTabs"
              :key="tab.key"
              @click="previewFilter = tab.key"
              :class="`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
                previewFilter === tab.key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`"
            >
              {{ tab.label }}
              <span
                :class="`text-xs px-1.5 py-0.5 rounded-full ${
                  previewFilter === tab.key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/60 text-gray-400'
                }`"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>

          <!-- Table -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Durum</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Musteri</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Adres</th>
                    <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hata</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="row in previewPageData"
                    :key="row.id"
                    :class="`transition ${!row.valid ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-gray-50/50'}`"
                  >
                    <td class="px-4 py-2.5 text-gray-400 font-mono text-xs">{{ row.id }}</td>
                    <td class="px-4 py-2.5">
                      <CheckCircle v-if="row.valid" class="w-4 h-4 text-emerald-500" />
                      <XCircle v-else class="w-4 h-4 text-red-500" />
                    </td>
                    <td :class="`px-4 py-2.5 font-medium ${!row.valid && !row.customer ? 'text-red-500 italic' : 'text-gray-800'}`">
                      {{ row.customer || '(bos)' }}
                    </td>
                    <td :class="`px-4 py-2.5 ${!row.valid && (row.phone === '123' || !row.phone) ? 'text-red-500' : 'text-gray-600'}`">
                      {{ row.phone || '(bos)' }}
                    </td>
                    <td :class="`px-4 py-2.5 max-w-[220px] truncate ${!row.valid && (row.address === 'X' || !row.address) ? 'text-red-500' : 'text-gray-600'}`">
                      {{ row.address || '(bos)' }}
                    </td>
                    <td :class="`px-4 py-2.5 text-right font-mono ${row.amount < 0 ? 'text-red-500' : 'text-gray-700'}`">
                      {{ row.amount.toFixed(2) }} TL
                    </td>
                    <td class="px-4 py-2.5">
                      <span v-if="row.error" class="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle class="w-3 h-3" />
                        {{ row.error }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="previewPageCount > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <span class="text-xs text-gray-500">
                {{ previewPage * PREVIEW_PER_PAGE + 1 }} - {{ Math.min((previewPage + 1) * PREVIEW_PER_PAGE, previewFiltered.length) }} / {{ previewFiltered.length }} satir
              </span>
              <div class="flex items-center gap-1">
                <button
                  v-for="pageNum in previewVisiblePages"
                  :key="pageNum"
                  @click="previewPage = pageNum"
                  :class="`w-8 h-8 rounded-md text-xs font-medium transition ${
                    previewPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:bg-gray-200'
                  }`"
                >
                  {{ pageNum + 1 }}
                </button>
              </div>
            </div>
          </div>

          <!-- Skip errors checkbox -->
          <label v-if="errorCount > 0" class="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              v-model="skipErrors"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span class="text-sm text-gray-700 group-hover:text-gray-900 transition">
              Hatali satirlari atla
              <span class="text-gray-400 ml-1">
                ({{ skipErrors ? validCount : totalCount }} siparis import edilecek)
              </span>
            </span>
          </label>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              @click="step = 2"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <ArrowLeft class="w-4 h-4" />
              Geri
            </button>
            <button
              @click="startImport"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
            >
              Import
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 4: Progress & Completion -->
        <div v-if="step === 4" class="space-y-6">
          <!-- In progress -->
          <template v-if="!importDone">
            <!-- Progress header -->
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Siparisler import ediliyor...</h3>
              <p class="text-sm text-gray-500 mt-1">Lutfen bu sayfadan ayrilmayin</p>
            </div>

            <!-- Progress bar -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">
                  {{ processedCount }} / {{ totalToImport }} siparis
                </span>
                <span class="text-sm font-semibold text-blue-600">{{ progress }}%</span>
              </div>
              <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                  :style="{ width: `${progress}%` }"
                />
              </div>
              <div class="flex justify-end mt-1.5">
                <span class="text-xs text-gray-400">{{ eta }}</span>
              </div>
            </div>
          </template>

          <!-- Completed -->
          <template v-else>
            <!-- Completion header -->
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle class="w-8 h-8 text-emerald-500" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800">Import tamamlandi!</h3>
              <p class="text-sm text-gray-500 mt-1">Tum siparisler basariyla olusturuldu</p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <p class="text-2xl font-bold text-emerald-700">{{ totalToImport }}</p>
                <p class="text-xs text-emerald-600 mt-1">Olusturulan</p>
              </div>
              <div class="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p class="text-2xl font-bold text-gray-700">
                  {{ skipErrors ? MOCK_DATA.filter(r => !r.valid).length : 0 }}
                </p>
                <p class="text-xs text-gray-500 mt-1">Atlanan</p>
              </div>
              <div class="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p class="text-2xl font-bold text-blue-700">{{ elapsedTime }}s</p>
                <p class="text-xs text-blue-600 mt-1">Sure</p>
              </div>
            </div>
          </template>

          <!-- Log -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Islem Kaydi</p>
            <div class="border border-gray-200 rounded-xl bg-gray-50 h-56 overflow-y-auto p-3 space-y-1 font-mono text-xs">
              <div v-for="(log, idx) in logs" :key="idx" class="flex items-center gap-2 text-gray-600">
                <CheckCircle class="w-3 h-3 text-emerald-500 shrink-0" />
                <span class="text-gray-400">#{{ String(log.id).padStart(3, '0') }}</span>
                <span class="truncate">{{ log.customer }}</span>
                <span class="text-emerald-600 ml-auto shrink-0">olusturuldu</span>
              </div>
              <div v-if="!importDone" class="flex items-center gap-2 text-gray-400">
                <Loader2 class="w-3 h-3 animate-spin" />
                <span>Isleniyor...</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="importDone" class="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              @click="router.go(-1)"
              class="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Kapat
            </button>
            <div class="flex items-center gap-3">
              <button
                @click="handleReset"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-200 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              >
                <Upload class="w-4 h-4" />
                Yeni Import
              </button>
              <button
                @click="router.push('/orders')"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
              >
                <Eye class="w-4 h-4" />
                Siparisleri Gor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Trash2,
  Eye,
  FileText,
  Loader2,
  ChevronDown,
} from 'lucide-vue-next'

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

const TURKISH_NAMES = [
  'Ahmet Yilmaz', 'Mehmet Kaya', 'Ayse Demir', 'Fatma Celik', 'Ali Sahin',
  'Zeynep Arslan', 'Hasan Dogan', 'Elif Aydin', 'Mustafa Ozdemir', 'Emine Koc',
  'Huseyin Yildiz', 'Hatice Kurt', 'Ibrahim Ozturk', 'Meryem Kilic', 'Omer Aksoy',
  'Zubeyde Polat', 'Yusuf Erdogan', 'Havva Tekin', 'Osman Gunes', 'Rabia Cetin',
  'Suleyman Korkmaz', 'Esra Acar', 'Kadir Balci', 'Busra Sen', 'Emre Yildirim',
  'Seda Uysal', 'Burak Aktas', 'Derya Duman', 'Cem Karaca', 'Gizem Tunc',
]

const STREETS = [
  'Ataturk Cad.', 'Cumhuriyet Mah.', 'Istiklal Sk.', 'Fatih Blv.', 'Mevlana Cad.',
  'Barbaros Mah.', 'Cankaya Sk.', 'Kizilay Mah.', 'Bahcelievler Cad.', 'Yildirim Sk.',
]

const DISTRICTS = [
  'Kadikoy', 'Besiktas', 'Uskudar', 'Bakirkoy', 'Sisli',
  'Beyoglu', 'Fatih', 'Kartal', 'Pendik', 'Maltepe',
]

const NOTES = [
  'Kapida odeme', 'Zili calin', 'Bahce kapisindan girin', '2. kat',
  'Aksam teslimat', 'Sabah teslimat', 'Kirilgan urun', 'Soguk zincir',
  '', '', '', '',
]

const ERROR_ROWS_CONFIG = [
  { index: 7, error: 'Musteri adi bos', clearField: 'customer' },
  { index: 23, error: 'Gecersiz telefon numarasi', corruptField: 'phone' },
  { index: 41, error: 'Adres bilgisi eksik', clearField: 'address' },
  { index: 58, error: 'Siparis tutari gecersiz', corruptField: 'amount' },
  { index: 74, error: 'Telefon numarasi bos', clearField: 'phone' },
  { index: 95, error: 'Musteri adi cok kisa', corruptField: 'customer' },
  { index: 112, error: 'Gecersiz adres formati', corruptField: 'address' },
  { index: 138, error: 'Tutar negatif olamaz', corruptField: 'amount' },
]

function generateMockRows(count = 150) {
  const rows = []
  const errorIndices = new Set(ERROR_ROWS_CONFIG.map((e) => e.index))

  for (let i = 0; i < count; i++) {
    const name = TURKISH_NAMES[i % TURKISH_NAMES.length]
    const phone = `05${String(Math.floor(Math.random() * 900000000 + 100000000)).slice(0, 9)}`
    const street = STREETS[i % STREETS.length]
    const district = DISTRICTS[i % DISTRICTS.length]
    const no = Math.floor(Math.random() * 80) + 1
    const amount = (Math.random() * 900 + 50).toFixed(2)
    const note = NOTES[i % NOTES.length]

    const row = {
      id: i + 1,
      customer: name,
      phone,
      address: `${street} No:${no}, ${district}/Istanbul`,
      amount: parseFloat(amount),
      note,
      valid: true,
      error: null,
    }

    if (errorIndices.has(i)) {
      const cfg = ERROR_ROWS_CONFIG.find((e) => e.index === i)
      row.valid = false
      row.error = cfg.error
      if (cfg.clearField) row[cfg.clearField] = ''
      if (cfg.corruptField) {
        if (cfg.corruptField === 'phone') row.phone = '123'
        if (cfg.corruptField === 'customer') row.customer = 'A'
        if (cfg.corruptField === 'address') row.address = 'X'
        if (cfg.corruptField === 'amount') row.amount = -15
      }
    }

    rows.push(row)
  }
  return rows
}

const MOCK_DATA = generateMockRows(150)

const PROJECTS = [
  { id: 1, name: 'Istanbul Anadolu Dagitim' },
  { id: 2, name: 'Istanbul Avrupa Dagitim' },
  { id: 3, name: 'Ankara Merkez' },
]

const EXCEL_COLUMNS = [
  { key: 'A', label: 'A: Musteri' },
  { key: 'B', label: 'B: Tel' },
  { key: 'C', label: 'C: Adres' },
  { key: 'D', label: 'D: Tutar' },
  { key: 'E', label: 'E: Not' },
]

const SYSTEM_FIELDS = [
  { key: 'customer_name', label: 'Musteri Adi' },
  { key: 'phone', label: 'Telefon' },
  { key: 'address', label: 'Adres' },
  { key: 'order_amount', label: 'Siparis Tutari' },
  { key: 'delivery_note', label: 'Teslimat Notu' },
  { key: 'external_no', label: 'Harici No' },
  { key: 'payment_method', label: 'Odeme Yontemi' },
]

const DEFAULT_MAPPINGS = {
  A: 'customer_name',
  B: 'phone',
  C: 'address',
  D: 'order_amount',
  E: 'delivery_note',
}

const STEPS = [
  { num: 1, label: 'Dosya Yukle' },
  { num: 2, label: 'Sutun Eslestirme' },
  { num: 3, label: 'Onizleme' },
  { num: 4, label: 'Import' },
]

// ---------------------------------------------------------------------------
// Main state
// ---------------------------------------------------------------------------

const router = useRouter()
const step = ref(1)
const file = ref(null)
const project = ref('')
const mappings = reactive({ ...DEFAULT_MAPPINGS })
const skipErrors = ref(true)

// Step 1 - File Upload
const dragOver = ref(false)

const handleDrop = (e) => {
  dragOver.value = false
  const droppedFile = e.dataTransfer?.files?.[0]
  if (droppedFile) simulateUpload(droppedFile)
}

const handleFileSelect = (e) => {
  const selected = e.target.files?.[0]
  if (selected) simulateUpload(selected)
}

const simulateUpload = (f) => {
  file.value = {
    name: f.name || 'siparis_listesi.xlsx',
    size: f.size || 245760,
    rows: 150,
    raw: f,
  }
}

const handleMockUpload = () => {
  file.value = {
    name: 'siparis_listesi.xlsx',
    size: 245760,
    rows: 150,
    raw: null,
  }
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// Step 2 - Column Mapping
const isAutoMatched = (excelKey) => {
  return DEFAULT_MAPPINGS[excelKey] === mappings[excelKey]
}

const unmappedFields = computed(() => {
  const mapped = new Set(Object.values(mappings).filter(Boolean))
  return SYSTEM_FIELDS.filter((sf) => !mapped.has(sf.key))
})

// Step 3 - Preview
const PREVIEW_PER_PAGE = 20
const previewFilter = ref('all')
const previewPage = ref(0)

const totalCount = MOCK_DATA.length
const validCount = MOCK_DATA.filter((r) => r.valid).length
const errorCount = MOCK_DATA.filter((r) => !r.valid).length

const previewTabs = computed(() => [
  { key: 'all', label: 'Tumu', count: totalCount },
  { key: 'valid', label: 'Gecerli', count: validCount },
  { key: 'error', label: 'Hatali', count: errorCount },
])

const previewFiltered = computed(() => {
  if (previewFilter.value === 'valid') return MOCK_DATA.filter((r) => r.valid)
  if (previewFilter.value === 'error') return MOCK_DATA.filter((r) => !r.valid)
  return MOCK_DATA
})

const previewPageCount = computed(() => Math.ceil(previewFiltered.value.length / PREVIEW_PER_PAGE))
const previewPageData = computed(() => previewFiltered.value.slice(previewPage.value * PREVIEW_PER_PAGE, (previewPage.value + 1) * PREVIEW_PER_PAGE))

const previewVisiblePages = computed(() => {
  const pages = []
  const count = Math.min(previewPageCount.value, 5)
  for (let i = 0; i < count; i++) {
    let pageNum = i
    if (previewPageCount.value > 5) {
      if (previewPage.value <= 2) pageNum = i
      else if (previewPage.value >= previewPageCount.value - 3) pageNum = previewPageCount.value - 5 + i
      else pageNum = previewPage.value - 2 + i
    }
    pages.push(pageNum)
  }
  return pages
})

watch(previewFilter, () => {
  previewPage.value = 0
})

// Step 4 - Progress
const progress = ref(0)
const processedCount = ref(0)
const logs = ref([])
const importDone = ref(false)
const startTime = ref(0)
const eta = ref('')
let importInterval = null

const importable = computed(() => skipErrors.value ? MOCK_DATA.filter((r) => r.valid) : MOCK_DATA)
const totalToImport = computed(() => importable.value.length)

const elapsedTime = computed(() => {
  if (!startTime.value) return '0.0'
  return ((Date.now() - startTime.value) / 1000).toFixed(1)
})

const startImport = () => {
  step.value = 4
  progress.value = 0
  processedCount.value = 0
  logs.value = []
  importDone.value = false
  startTime.value = Date.now()

  importInterval = setInterval(() => {
    const next = processedCount.value + Math.floor(Math.random() * 3) + 1
    if (next >= totalToImport.value) {
      clearInterval(importInterval)
      importInterval = null
      progress.value = 100
      processedCount.value = totalToImport.value
      importDone.value = true

      const remaining = importable.value.slice(logs.value.length).map((r) => ({
        id: r.id,
        customer: r.customer,
        success: true,
      }))
      logs.value = [...logs.value, ...remaining]
      return
    }

    processedCount.value = next
    const pct = Math.round((next / totalToImport.value) * 100)
    progress.value = pct

    // ETA calculation
    const elapsed = Date.now() - startTime.value
    const perItem = elapsed / next
    const remainingTime = (totalToImport.value - next) * perItem
    if (remainingTime > 60000) {
      eta.value = `~${Math.ceil(remainingTime / 60000)} dk kaldi`
    } else {
      eta.value = `~${Math.ceil(remainingTime / 1000)} sn kaldi`
    }

    // Add log entries
    const newLogs = []
    for (let i = logs.value.length; i < next && i < importable.value.length; i++) {
      newLogs.push({
        id: importable.value[i].id,
        customer: importable.value[i].customer,
        success: true,
      })
    }
    logs.value = [...logs.value, ...newLogs]
  }, 120)
}

const handleReset = () => {
  if (importInterval) {
    clearInterval(importInterval)
    importInterval = null
  }
  step.value = 1
  file.value = null
  project.value = ''
  Object.keys(DEFAULT_MAPPINGS).forEach(k => {
    mappings[k] = DEFAULT_MAPPINGS[k]
  })
  skipErrors.value = true
  progress.value = 0
  processedCount.value = 0
  logs.value = []
  importDone.value = false
}

onUnmounted(() => {
  if (importInterval) {
    clearInterval(importInterval)
    importInterval = null
  }
})
</script>
