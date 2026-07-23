<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Country } from '@/types'
import { useModalStore } from '@/stores/ModalStore'
import { useCountryStore } from '@/stores/CountryStore'

const emit = defineEmits<{
  (e: 'select', country: Country): void
}>()

const modalStore = useModalStore()

const countryStore = useCountryStore()
// 국가 목록
const countries = countryStore.countries


// 검색어
const search = ref('')


// 검색 결과
const filteredCountries = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  if (!keyword) {
    return countries
  }

  return countries.filter(country =>
    country.name.includes(keyword) ||
    country.code.toLowerCase().includes(keyword)
  )
})


// 국가 선택
const selectCountry = (country: Country) => {
  emit('select', country)
  modalStore.closeModal()
}


// 닫기
const closeModal = () => {
  modalStore.closeModal()
}
</script>


<template>

  <div
    v-if="modalStore.activeModal === 'selectCountry'"
    class="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
    @click.self="closeModal"
  >

    <div
      class="w-full max-w-sm bg-[#fbf9f5]
             border-4 border-[#2d2b28]
             shadow-[6px_6px_0px_0px_#2d2b28]"
    >

      <!-- 헤더 -->
      <div
        class="bg-[#c5bfb6]
               px-4 py-2
               border-b-2 border-[#2d2b28]
               flex justify-between items-center"
      >
        <span class="text-xs font-bold">
          // 국가_선택.exe
        </span>

        <button
          @click="closeModal"
          class="text-xs font-bold"
        >
          X
        </button>
      </div>


      <!-- 검색 -->
      <div class="p-3 border-b-2 border-[#2d2b28]">

        <input
          v-model="search"
          placeholder="국가 검색..."
          class="w-full bg-white
                 border-2 border-[#2d2b28]
                 px-2 py-1
                 text-xs
                 outline-none"
        />

      </div>


      <!-- 국가 리스트 -->
      <div
        class="max-h-72 overflow-y-auto p-3 space-y-2"
      >

        <button
          v-for="country in filteredCountries"
          :key="country.code"
          @click="selectCountry(country)"
          class="w-full flex items-center gap-3
                 p-2
                 bg-[#f4f1eb]
                 border-2 border-[#2d2b28]
                 hover:bg-[#2d2b28]
                 hover:text-[#fbf9f5]
                 transition-all"
        >

           <!--국가 이미지-->
          <img 
            :src="`https://flagcdn.com/w40/${country.flag === 'xx' ? 'un' : country.flag}.png`" 
            alt=""
            class="w-5 h-3.5 object-cover border border-[#2d2b28] flex-shrink-0"
            />

          <span class="text-xs font-bold">
            {{ country.name }}
          </span>

          <span class="ml-auto text-[10px] opacity-60">
            {{ country.code }}
          </span>

        </button>


        <div
          v-if="filteredCountries.length === 0"
          class="text-xs text-center py-4 text-neutral-500"
        >
          검색 결과가 없습니다.
        </div>

      </div>

    </div>

  </div>

</template>