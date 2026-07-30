<script setup lang="ts">
import { useUIStore } from '@/shared/ui/UiStore'
import { useTransTagStore } from '@/trans_tag/stores/TransTagStore'

const uiStore = useUIStore()
const transTagStore = useTransTagStore()

const submitTag = () => {
  const result = transTagStore.registerEngTag()

  alert(result.message)
}
</script>


<template>
  <div
    v-if="uiStore.currentTab === 'transTag'"
    class="flex-1 overflow-y-auto p-6"
  >

    <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6">
      <h3 class="font-bold text-base tracking-wider">
        // 영어 태그 등록_DB.sql
      </h3>

      <p class="text-[10px] text-neutral-500">
        외국어 슬랭/신조어를 한국어로 순화하여 서버에 등록합니다.
      </p>
    </div>


    <!-- 태그 등록 -->
    <div
      class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-5 shadow-[4px_4px_0px_0x_#2d2b28] mb-8"
    >

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        <div>
          <label class="block text-xs font-bold mb-1 text-blue-900">
            영어 원문 (Slang/Tag) :
          </label>

          <input
            type="text"
            v-model="transTagStore.newTag.eng"
            placeholder="예: Rizz"
            class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner"
          />
        </div>


        <div>
          <label class="block text-xs font-bold mb-1 text-red-900">
            한국어 순화 번역 :
          </label>

          <input
            type="text"
            v-model="transTagStore.newTag.kor"
            placeholder="예: 상대를 매혹시키는 치명적인 매력"
            class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner"
          />
        </div>

      </div>


      <div class="flex justify-end">

        <button
          @click="submitTag"
          class="bg-[#2d2b28] text-[#fbf9f5] px-6 py-2 font-bold text-xs border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#a39b90] active:translate-y-[2px] active:shadow-none transition-all"
        >
          + 태그 인덱스 추가
        </button>

      </div>

    </div>



    <!-- 목록 -->
    <div
      class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mb-3"
    >
      ● 최근 등록된 영어 태그 인덱스
    </div>


    <div
      class="border-2 border-[#2d2b28] overflow-hidden shadow-[4px_4px_0px_0px_#2d2b28]"
    >

      <table class="w-full text-left text-xs border-collapse">

        <thead>
          <tr class="bg-[#2d2b28] text-[#fbf9f5]">
            <th class="p-3 text-[10px] border-r border-[#4e4b44]">
              영어 원문
            </th>

            <th class="p-3 text-[10px]">
              한국어 순화 번역
            </th>
          </tr>
        </thead>


        <tbody class="divide-y-2 divide-[#2d2b28]">

          <tr
            v-for="(tag, index) in transTagStore.engTags"
            :key="index"
            class="hover:bg-[#e6e2db] bg-[#fbf9f5]"
          >

            <td
              class="p-3 font-bold text-blue-800 border-r border-[#2d2b28] font-mono"
            >
              # {{ tag.eng }}
            </td>


            <td
              class="p-3 text-[#2d2b28] font-bold italic"
            >
              ⇄ {{ tag.kor }}
            </td>

          </tr>


          <tr
            v-if="transTagStore.engTags.length === 0"
          >
            <td
              colspan="2"
              class="p-5 text-center text-xs text-neutral-500"
            >
              등록된 태그가 없습니다.
            </td>
          </tr>

        </tbody>

      </table>

    </div>

  </div>
</template>