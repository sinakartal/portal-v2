<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Page header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <FileSpreadsheet class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Excel Import</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Toplu siparis yukleme sihirbazi</p>
          </div>
        </div>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-0 mb-8">
        <div v-for="(s, idx) in STEPS" :key="s.num" class="flex items-center">
          <div class="flex flex-col items-center">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                s.num < step
                  ? 'bg-emerald-500 text-white'
                  : s.num === step
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              ]"
            >
              <CheckCircle v-if="s.num < step" class="w-5 h-5" />
              <template v-else>{{ s.num }}</template>
            </div>
            <span
              :class="[
                'mt-2 text-xs font-medium whitespace-nowrap',
                s.num === step ? 'text-blue-600 dark:text-blue-400' : s.num < step ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
              ]"
            >
              {{ s.label }}
            </span>
          </div>
          <div
            v-if="idx < STEPS.length - 1"
            :class="[
              'w-20 h-0.5 mx-2 mt-[-18px] transition-colors duration-300',
              s.num < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          />
        </div>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8 transition-colors duration-300">
        <!-- Step title -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            <template v-if="step === 1">Dosya Yukle</template>
            <template v-if="step === 2">Sutun Eslestirme</template>
            <template v-if="step === 3">Onizleme ve Dogrulama</template>
            <template v-if="step === 4">Import</template>
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            <template v-if="step === 1">Excel veya CSV dosyanizi yukleyin ve projenizi secin</template>
            <template v-if="step === 2">Excel sutunlarini sistem alanlariyla eslestirin</template>
            <template v-if="step === 3">Verileri kontrol edin ve hatalari inceleyin</template>
            <template v-if="step === 4">Siparisler sisteme aktariliyor</template>
          </p>
        </div>

        <!-- ================================================================ -->
        <!-- Step 1: File Upload -->
        <!-- ================================================================ -->
        <div v-if="step === 1" class="space-y-6">
          <!-- Skeleton loading for project list -->
          <div v-if="loadingProjects" class="space-y-2">
            <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div class="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>

          <!-- Project selector -->
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Proje Secin</label>
            <div class="relative">
              <select
                v-model="project"
                class="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 pr-10 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none transition"
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
            @dragenter.prevent="onDragEnter"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
            :class="[
              'relative cursor-pointer border-2 rounded-2xl p-16 text-center transition-all duration-200',
              dragOver
                ? 'border-solid border-blue-500 bg-blue-50 dark:bg-blue-950/40 scale-[1.01] shadow-lg shadow-blue-100 dark:shadow-blue-900/20'
                : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20'
            ]"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx,.xls,.csv"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-all duration-200',
                  dragOver
                    ? 'bg-blue-200 dark:bg-blue-800 scale-110'
                    : 'bg-blue-100 dark:bg-blue-900/50'
                ]"
              >
                <Upload :class="['w-10 h-10 transition-colors', dragOver ? 'text-blue-600 dark:text-blue-300' : 'text-blue-500 dark:text-blue-400']" />
              </div>
              <p class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
                {{ dragOver ? 'Dosyayi birakin...' : 'XLSX veya CSV yukleyin' }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Dosyanizi surukleyip birakin veya tiklayin
              </p>
              <div class="flex items-center gap-2 mb-3">
                <span
                  v-for="ext in ['.xlsx', '.xls', '.csv']"
                  :key="ext"
                  class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 shadow-sm"
                >
                  <FileSpreadsheet class="w-3.5 h-3.5 mr-1.5" />
                  {{ ext }}
                </span>
              </div>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                <span class="inline-flex items-center gap-1">
                  <AlertTriangle class="w-3 h-3" />
                  Maks. 5MB, 1000 satir
                </span>
              </p>
            </div>
          </div>

          <!-- File parsing skeleton -->
          <div v-if="fileParsing" class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div class="flex-1 space-y-2">
                <div class="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div class="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <!-- File uploaded -->
          <div v-else-if="file" class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FileSpreadsheet class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ file.name }}</p>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatSize(file.size) }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ file.rows }} satir</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span class="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle class="w-3.5 h-3.5 mr-1" />
                      Yuklendi
                    </span>
                  </div>
                </div>
              </div>
              <button
                @click.stop="file = null"
                class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Template downloads -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500 dark:text-gray-400">Sablon indir:</span>
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition shadow-sm">
              <Download class="w-3.5 h-3.5" />
              Excel Sablon
            </button>
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition shadow-sm">
              <Download class="w-3.5 h-3.5" />
              CSV Sablon
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              @click="router.go(-1)"
              class="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
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

        <!-- ================================================================ -->
        <!-- Step 2: Column Mapping (Kolon Eslestirme) -->
        <!-- ================================================================ -->
        <div v-if="step === 2" class="space-y-6">
          <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <AlertTriangle class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p class="text-sm font-medium text-blue-800 dark:text-blue-200">Otomatik eslestirme yapildi</p>
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Excel sutunlari sistem alanlariyla otomatik olarak eslestirildi. Gerekirse degistirebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <!-- Skeleton for mapping table -->
          <div v-if="loadingMapping" class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div class="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div v-for="i in 5" :key="i" class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              <div class="grid grid-cols-[1fr_40px_1fr_48px] gap-2 items-center">
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div class="h-4 w-4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div class="h-7 w-7 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          <div v-else class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <!-- Header -->
            <div class="grid grid-cols-[1fr_40px_1fr_48px] items-center px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Excel Sutunu</span>
              <span />
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bringo Alani</span>
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Durum</span>
            </div>

            <!-- Rows -->
            <div
              v-for="col in EXCEL_COLUMNS"
              :key="col.key"
              class="grid grid-cols-[1fr_40px_1fr_48px] items-center px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition"
            >
              <!-- Excel column -->
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ col.key }}</span>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ col.label.split(': ')[1] }}</span>
              </div>

              <!-- Arrow -->
              <div class="flex justify-center">
                <ArrowRight class="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>

              <!-- System field dropdown -->
              <div class="relative">
                <select
                  :value="mappings[col.key] || ''"
                  @change="mappings[col.key] = $event.target.value"
                  class="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none transition"
                >
                  <option value="">-- Eslestirme yok --</option>
                  <option v-for="sf in BRINGO_FIELDS" :key="sf.key" :value="sf.key">{{ sf.label }}</option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              <!-- Status -->
              <div class="flex justify-center">
                <template v-if="mappings[col.key]">
                  <div v-if="isAutoMatched(col.key)" class="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle class="w-4 h-4 text-emerald-500" />
                  </div>
                  <div v-else class="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <CheckCircle class="w-4 h-4 text-blue-500" />
                  </div>
                </template>
                <div v-else class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <XCircle class="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Unmapped system fields info -->
          <div v-if="unmappedFields.length > 0" class="text-xs text-gray-400 dark:text-gray-500">
            Eslestirilmemis Bringo alanlari: {{ unmappedFields.map(u => u.label).join(', ') }}
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              @click="step = 1"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
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

        <!-- ================================================================ -->
        <!-- Step 3: Preview & Validation -->
        <!-- ================================================================ -->
        <div v-if="step === 3" class="space-y-5">
          <!-- Summary bar -->
          <div class="grid grid-cols-3 gap-4">
            <div class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText class="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Toplam</p>
                <p class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ totalCount }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 px-4 py-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Gecerli</p>
                <p class="text-lg font-bold text-emerald-700 dark:text-emerald-400">{{ validCount }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-xl border border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 px-4 py-3">
              <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <XCircle class="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Hatali</p>
                <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ errorCount }}</p>
              </div>
            </div>
          </div>

          <!-- Tab filters + Error export button -->
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
              <button
                v-for="tab in previewTabs"
                :key="tab.key"
                @click="previewFilter = tab.key"
                :class="[
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition',
                  previewFilter === tab.key
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                ]"
              >
                {{ tab.label }}
                <span
                  :class="[
                    'text-xs px-1.5 py-0.5 rounded-full',
                    previewFilter === tab.key ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200' : 'bg-gray-200/60 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  ]"
                >
                  {{ tab.count }}
                </span>
              </button>
            </div>

            <!-- Hatalari Indir button -->
            <button
              v-if="errorCount > 0"
              @click="exportErrors"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition shadow-sm"
            >
              <Download class="w-3.5 h-3.5" />
              Hatalari Indir
            </button>
          </div>

          <!-- Preview table skeleton -->
          <div v-if="loadingPreview" class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div class="grid grid-cols-7 gap-3">
                <div v-for="i in 7" :key="i" class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div v-for="i in 8" :key="i" class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              <div class="grid grid-cols-7 gap-3">
                <div v-for="j in 7" :key="j" :class="['h-4 rounded animate-pulse', j === 5 ? 'bg-gray-200 dark:bg-gray-700 col-span-1' : 'bg-gray-200 dark:bg-gray-700']" />
              </div>
            </div>
          </div>

          <!-- Table -->
          <div v-else class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">#</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Durum</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Musteri</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefon</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Adres</th>
                    <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutar</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">Hata</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr
                    v-for="row in previewPageData"
                    :key="row.id"
                    :class="[
                      'transition',
                      !row.valid
                        ? 'bg-red-50/80 dark:bg-red-950/30 hover:bg-red-100/80 dark:hover:bg-red-950/50 border-l-4 border-l-red-400 dark:border-l-red-600'
                        : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent'
                    ]"
                  >
                    <td class="px-4 py-2.5 text-gray-400 dark:text-gray-500 font-mono text-xs">{{ row.id }}</td>
                    <td class="px-4 py-2.5">
                      <CheckCircle v-if="row.valid" class="w-4 h-4 text-emerald-500" />
                      <XCircle v-else class="w-4 h-4 text-red-500" />
                    </td>
                    <td :class="['px-4 py-2.5 font-medium', !row.valid && !row.customer ? 'text-red-500 italic' : 'text-gray-800 dark:text-gray-200']">
                      {{ row.customer || '(bos)' }}
                    </td>
                    <td :class="['px-4 py-2.5', !row.valid && (row.phone === '123' || !row.phone) ? 'text-red-500' : 'text-gray-600 dark:text-gray-300']">
                      {{ row.phone || '(bos)' }}
                    </td>
                    <td :class="['px-4 py-2.5 max-w-[220px] truncate', !row.valid && (row.address === 'X' || !row.address) ? 'text-red-500' : 'text-gray-600 dark:text-gray-300']">
                      {{ row.address || '(bos)' }}
                    </td>
                    <td :class="['px-4 py-2.5 text-right font-mono', row.amount < 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300']">
                      {{ row.amount.toFixed(2) }} TL
                    </td>
                    <td class="px-4 py-2.5">
                      <div v-if="row.error" class="relative group">
                        <span class="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-full cursor-help">
                          <AlertTriangle class="w-3 h-3 shrink-0" />
                          <span class="truncate max-w-[120px]">{{ row.error }}</span>
                        </span>
                        <!-- Tooltip -->
                        <div class="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {{ row.error }}
                          <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="previewPageCount > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ previewPage * PREVIEW_PER_PAGE + 1 }} - {{ Math.min((previewPage + 1) * PREVIEW_PER_PAGE, previewFiltered.length) }} / {{ previewFiltered.length }} satir
              </span>
              <div class="flex items-center gap-1">
                <button
                  v-for="pageNum in previewVisiblePages"
                  :key="pageNum"
                  @click="previewPage = pageNum"
                  :class="[
                    'w-8 h-8 rounded-md text-xs font-medium transition',
                    previewPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
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
              class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition">
              Hatali satirlari atla
              <span class="text-gray-400 dark:text-gray-500 ml-1">
                ({{ skipErrors ? validCount : totalCount }} siparis import edilecek)
              </span>
            </span>
          </label>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              @click="step = 2"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft class="w-4 h-4" />
              Geri
            </button>
            <button
              @click="startImport"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
            >
              <Zap class="w-4 h-4" />
              Ice Aktar
            </button>
          </div>
        </div>

        <!-- ================================================================ -->
        <!-- Step 4: Progress & Completion -->
        <!-- ================================================================ -->
        <div v-if="step === 4" class="space-y-6">
          <!-- In progress -->
          <template v-if="!importDone">
            <!-- Progress header -->
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Loader2 class="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Siparisler import ediliyor...</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Lutfen bu sayfadan ayrilmayin</p>
            </div>

            <!-- Animated Progress bar -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ processedCount }} / {{ totalToImport }} siparis
                </span>
                <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{ progress }}%</span>
              </div>
              <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  class="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  :class="progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600'"
                  :style="{ width: `${progress}%` }"
                >
                  <!-- Animated shimmer -->
                  <div
                    v-if="progress < 100"
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"
                  />
                </div>
              </div>
              <div class="flex justify-between mt-1.5">
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  {{ importFailedCount > 0 ? `${importFailedCount} hatali` : '' }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500">{{ eta }}</span>
              </div>
            </div>
          </template>

          <!-- Completed - Summary Card -->
          <template v-else>
            <!-- Completion header -->
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle class="w-8 h-8 text-emerald-500" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Import tamamlandi!</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Islem ozeti asagida goruntulenebilir</p>
            </div>

            <!-- Summary card -->
            <div class="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
                  <p class="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{{ importSuccessCount }}</p>
                  <p class="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-medium">Basarili</p>
                </div>
                <div class="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ importFailedCount }}</p>
                  <p class="text-xs text-red-500 dark:text-red-500 mt-1 font-medium">Hatali</p>
                </div>
                <div class="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <p class="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {{ skipErrors ? MOCK_DATA.filter(r => !r.valid).length : 0 }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">Atlanan</p>
                </div>
                <div class="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p class="text-2xl font-bold text-blue-700 dark:text-blue-400">{{ elapsedTime }}s</p>
                  <p class="text-xs text-blue-600 dark:text-blue-500 mt-1 font-medium">Sure</p>
                </div>
              </div>

              <!-- Summary text -->
              <div class="mt-4 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-center">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ importSuccessCount }} siparis</span> basariyla eklendi<template v-if="importFailedCount > 0">,
                  <span class="font-semibold text-red-600 dark:text-red-400">{{ importFailedCount }} hatali satir</span></template>
                </p>
              </div>
            </div>
          </template>

          <!-- Log -->
          <div>
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Islem Kaydi</p>
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 h-56 overflow-y-auto p-3 space-y-1 font-mono text-xs">
              <div v-for="(log, idx) in logs" :key="idx" :class="['flex items-center gap-2', log.success ? 'text-gray-600 dark:text-gray-400' : 'text-red-500 dark:text-red-400']">
                <CheckCircle v-if="log.success" class="w-3 h-3 text-emerald-500 shrink-0" />
                <XCircle v-else class="w-3 h-3 text-red-500 shrink-0" />
                <span class="text-gray-400 dark:text-gray-500">#{{ String(log.id).padStart(3, '0') }}</span>
                <span class="truncate">{{ log.customer }}</span>
                <span :class="['ml-auto shrink-0', log.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400']">
                  {{ log.success ? 'olusturuldu' : 'basarisiz' }}
                </span>
              </div>
              <div v-if="!importDone" class="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <Loader2 class="w-3 h-3 animate-spin" />
                <span>Isleniyor...</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="importDone" class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              @click="router.go(-1)"
              class="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Kapat
            </button>
            <div class="flex items-center gap-3">
              <!-- Hatalari Indir (post-import) -->
              <button
                v-if="importFailedCount > 0"
                @click="exportErrors"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Download class="w-4 h-4" />
                Hatalari Indir
              </button>
              <button
                @click="handleReset"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
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
import { ref, reactive, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { createOrder } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
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
  Zap,
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

// Bringo fields for column mapping (Siparis No, Musteri, Adres, Telefon, Tutar, Oncelik)
const BRINGO_FIELDS = [
  { key: 'order_no', label: 'Siparis No' },
  { key: 'customer_name', label: 'Musteri' },
  { key: 'address', label: 'Adres' },
  { key: 'phone', label: 'Telefon' },
  { key: 'order_amount', label: 'Tutar' },
  { key: 'priority', label: 'Oncelik' },
  { key: 'delivery_note', label: 'Teslimat Notu' },
  { key: 'external_no', label: 'Harici No' },
  { key: 'payment_method', label: 'Odeme Yontemi' },
]

// Keep SYSTEM_FIELDS as alias for backward compatibility in unmappedFields
const SYSTEM_FIELDS = BRINGO_FIELDS

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
const authStore = useAuthStore()
const step = ref(1)
const file = ref(null)
const project = ref('')
const mappings = reactive({ ...DEFAULT_MAPPINGS })
const skipErrors = ref(true)

// Skeleton loading states
const loadingProjects = ref(false)
const loadingMapping = ref(false)
const loadingPreview = ref(false)
const fileParsing = ref(false)

// Simulate skeleton loading on step changes
watch(step, (newStep) => {
  if (newStep === 2) {
    loadingMapping.value = true
    setTimeout(() => { loadingMapping.value = false }, 600)
  }
  if (newStep === 3) {
    loadingPreview.value = true
    setTimeout(() => { loadingPreview.value = false }, 800)
  }
})

// ---------------------------------------------------------------------------
// Step 1 - File Upload with full drag events
// ---------------------------------------------------------------------------
const dragOver = ref(false)
const fileInputRef = ref(null)
let dragCounter = 0

const onDragEnter = (e) => {
  dragCounter++
  dragOver.value = true
}

const onDragOver = (e) => {
  dragOver.value = true
}

const onDragLeave = (e) => {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    dragOver.value = false
  }
}

const handleDrop = (e) => {
  dragCounter = 0
  dragOver.value = false
  const droppedFile = e.dataTransfer?.files?.[0]
  if (droppedFile) {
    // Validate file type
    const validTypes = ['.xlsx', '.xls', '.csv']
    const ext = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase()
    if (!validTypes.includes(ext)) return
    // Validate file size (5MB)
    if (droppedFile.size > 5 * 1024 * 1024) return
    simulateUpload(droppedFile)
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e) => {
  const selected = e.target.files?.[0]
  if (selected) simulateUpload(selected)
}

const simulateUpload = (f) => {
  fileParsing.value = true
  setTimeout(() => {
    file.value = {
      name: f.name || 'siparis_listesi.xlsx',
      size: f.size || 245760,
      rows: 150,
      raw: f,
    }
    fileParsing.value = false
  }, 500)
}

const handleMockUpload = () => {
  fileParsing.value = true
  setTimeout(() => {
    file.value = {
      name: 'siparis_listesi.xlsx',
      size: 245760,
      rows: 150,
      raw: null,
    }
    fileParsing.value = false
  }, 500)
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// ---------------------------------------------------------------------------
// Step 2 - Column Mapping
// ---------------------------------------------------------------------------
const isAutoMatched = (excelKey) => {
  return DEFAULT_MAPPINGS[excelKey] === mappings[excelKey]
}

const unmappedFields = computed(() => {
  const mapped = new Set(Object.values(mappings).filter(Boolean))
  return SYSTEM_FIELDS.filter((sf) => !mapped.has(sf.key))
})

// ---------------------------------------------------------------------------
// Step 3 - Preview
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Error export (Hatalari Indir) - generates and downloads XLSX via Blob
// ---------------------------------------------------------------------------
const exportErrors = () => {
  const errorRows = MOCK_DATA.filter((r) => !r.valid)
  if (errorRows.length === 0) return

  // Build CSV content as a fallback (works without xlsx library)
  const headers = ['Satir No', 'Musteri', 'Telefon', 'Adres', 'Tutar', 'Hata Nedeni']
  const csvRows = [headers.join(';')]

  errorRows.forEach((row) => {
    csvRows.push([
      row.id,
      `"${(row.customer || '').replace(/"/g, '""')}"`,
      `"${(row.phone || '').replace(/"/g, '""')}"`,
      `"${(row.address || '').replace(/"/g, '""')}"`,
      row.amount,
      `"${(row.error || '').replace(/"/g, '""')}"`,
    ].join(';'))
  })

  // Try to generate xlsx using SheetJS if available, otherwise fall back to CSV
  try {
    if (typeof window !== 'undefined' && window.XLSX) {
      const ws = window.XLSX.utils.json_to_sheet(errorRows.map((r) => ({
        'Satir No': r.id,
        'Musteri': r.customer || '',
        'Telefon': r.phone || '',
        'Adres': r.address || '',
        'Tutar': r.amount,
        'Hata Nedeni': r.error || '',
      })))
      const wb = window.XLSX.utils.book_new()
      window.XLSX.utils.book_append_sheet(wb, ws, 'Hatali Satirlar')
      window.XLSX.writeFile(wb, 'hatali_satirlar.xlsx')
      return
    }
  } catch {
    // fall through to CSV
  }

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'hatali_satirlar.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Step 4 - Progress
// ---------------------------------------------------------------------------
const progress = ref(0)
const processedCount = ref(0)
const logs = ref([])
const importDone = ref(false)
const startTime = ref(0)
const eta = ref('')
let importInterval = null

const importable = computed(() => skipErrors.value ? MOCK_DATA.filter((r) => r.valid) : MOCK_DATA)
const totalToImport = computed(() => importable.value.length)

const importSuccessCount = computed(() => logs.value.filter((l) => l.success).length)
const importFailedCount = computed(() => logs.value.filter((l) => !l.success).length)

const elapsedTime = computed(() => {
  if (!startTime.value) return '0.0'
  return ((Date.now() - startTime.value) / 1000).toFixed(1)
})

const startImport = async () => {
  step.value = 4
  progress.value = 0
  processedCount.value = 0
  logs.value = []
  importDone.value = false
  startTime.value = Date.now()

  const items = importable.value
  for (let i = 0; i < items.length; i++) {
    const row = items[i]
    let success = true
    try {
      const res = await createOrder({
        orderId: row.id,
        externalOrderId: row.id,
        projectId: project.value || authStore.activeProjectId || authStore.user?.defaultProject || 'default',
        originId: 'origin-1',
        deliveryLocation: { lat: row.lat || 41.0, lng: row.lng || 29.0 },
        customerName: row.customer || '',
        mode: (row.type || 'standard').toLowerCase() === 'express' ? 'instant' : 'standard',
        deci: row.deci || 5,
      })
      success = res.ok !== false
    } catch {
      success = false
    }

    processedCount.value = i + 1
    progress.value = Math.round(((i + 1) / items.length) * 100)
    logs.value = [...logs.value, { id: row.id, customer: row.customer, success }]

    // ETA
    const elapsed = Date.now() - startTime.value
    const perItem = elapsed / (i + 1)
    const remainingTime = (items.length - i - 1) * perItem
    eta.value = remainingTime > 60000
      ? `~${Math.ceil(remainingTime / 60000)} dk kaldi`
      : `~${Math.ceil(remainingTime / 1000)} sn kaldi`
  }

  importDone.value = true
  progress.value = 100
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

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
