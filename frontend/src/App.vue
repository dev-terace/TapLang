<template>

  <div
    class="bg-[#18191c] h-screen w-screen flex items-center justify-center p-4 lg:p-8 overflow-hidden vintage-monitor font-sans text-[#2d2b28]">
    <div id="app"
      class="w-full h-full max-w-7xl max-h-[90vh] flex flex-col bg-[#e6e2db] border-4 border-[#2d2b28] shadow-[10px_10px_0px_0px_#121315] crt-glow overflow-hidden relative">

      <div v-if="!isLoggedIn"
        class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#dfdad1] transition-all">
        <div
          class="border-4 border-[#2d2b28] bg-[#fbf9f5] pt-12 pb-8 px-8 md:px-10 max-w-md w-full shadow-[8px_8px_0px_0px_#2d2b28] text-center relative animate-fade-in flex flex-col items-center gap-6">

          <!-- 상단 세션 헤더 바 -->
          <div
            class="absolute top-0 left-0 right-0 h-7 bg-[#2d2b28] text-[#fbf9f5] text-[10px] tracking-widest flex items-center justify-between px-3 font-mono">
            <span>TAPLANG // v1.0</span>
            <span class="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse"></span>
          </div>

          <!-- 로고 대용 레트로 텍스트 타이틀 -->
          <div class="flex flex-col items-center gap-2 mt-2 select-none">
            <h1
              class="font-silkscreen text-3xl md:text-4xl font-bold tracking-wider text-[#2d2b28] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              TapLang
            </h1>
            <p class="text-[11px] font-mono text-[#736d62] tracking-tight uppercase">
              Global Language Chat Platform
            </p>
          </div>

          <!-- 구글 로그인 버튼 -->
          <button @click="login"
            class="w-full bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] text-[#2d2b28] font-bold py-3.5 px-4 border-2 border-[#2d2b28] shadow-[4px_4px_0px_0px_#2d2b28] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-3 text-xs tracking-wider cursor-pointer">
            <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path
                d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.313-.178-1.709H12.24z" />
            </svg>
            구글 계정으로 로그인하기
          </button>

        </div>
      </div>


      <template v-else>
        <Header />

        <main class="flex-1 flex flex-col lg:flex-row overflow-hidden">

          <FriendSidebar />
          <section class="flex-1 bg-[#fbf9f5] flex flex-col overflow-hidden relative">
            <div class="flex-1 flex flex-col overflow-hidden">
              <ViewPort />
              <Ad />
              <FindPeople />
              <Notice />
              <Chat />
              <ChatRoom />
              <!-- <InviteChatRoom /> -->
              <GroupChat />
              <QuizStudio/>
              <CustomChatRoom />

            </div>
          </section>

          <!-- 로딩 오버레이: 전체를 덮음 -->
          <div v-if="showLoading"
            class="absolute inset-0 z-50 bg-[#e6e2db] flex flex-col items-center justify-center gap-4">

            <div class="w-64 h-4 border-2 border-[#2d2b28] bg-[#fbf9f5] overflow-hidden relative">
              <div class="h-full bg-[#2d2b28] animate-pulse w-full"></div>
            </div>
            <p class="text-[10px] font-mono text-neutral-500 tracking-widest animate-pulse">SYNCING_ONLINE_STATUS...</p>
          </div>

        </main>

        <Footer />

      </template>

    </div>

    <ChatNotification />
  </div>

</template>


<script setup lang="ts">
import FriendList from './friends/components/FriendList.vue'
import Header from './shared/ui/components/Header.vue'
import Ad from './ad/Ad.vue'
import FindPeople from './find_people/components/FindPeople.vue'
import Notice from './notice/components/Notice.vue'
import Footer from './shared/ui/components/Footer.vue'
import Chat from './chat/components/Chat.vue'
import ChatRoom from './chat/components/ChatRoom.vue'
import GroupChat from './custom_chat/components/CustomChat.vue'
import Quiz from './quiz/components/Quiz.vue'
import ViewPort from './shared/ui/components/ViewPort.vue'
import FriendSidebar from './friends/components/FriendSidebar.vue'
import InviteChatRoom from './chat/components/InviteChatRoom.vue'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/shared/auth/AuthStore.js'
import { storeToRefs } from 'pinia'
import { useSocketRegister } from '@/shared/socket/socket.register.js'
import ChatNotification from './shared/notification/components/chatNotification.vue'
import CustomChatRoom from './custom_chat/components/CustomChatRoom.vue'
import QuizStudio from './quiz/components/QuizStudio.vue'

const socketRegister = useSocketRegister()

const { isOnlineUsersLoaded } = storeToRefs(socketRegister)
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const showLoading = computed(() => isLoggedIn.value && !isOnlineUsersLoaded.value)

const userInfo = authStore.userInfo

const { login } = authStore

watch(
  isLoggedIn,
  (loggedIn) => {
    if (loggedIn && userInfo) {
      socketRegister.connect()
    }
  }
)
</script>


<style scoped>
/* Silkscreen 폰트 불러오기 */
@import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');

.font-silkscreen {
  font-family: 'Silkscreen', cursive, sans-serif;
  /* 픽셀 도트 질감 살리기 */
  -webkit-font-smoothing: none;
  font-smooth: never;
}
</style>