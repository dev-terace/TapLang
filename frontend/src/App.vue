


 <template>
  
<div class="bg-[#18191c] h-screen w-screen flex items-center justify-center p-4 lg:p-8 overflow-hidden vintage-monitor font-sans text-[#2d2b28]">
<div id="app" class="w-full h-full max-w-7xl max-h-[90vh] flex flex-col bg-[#e6e2db] border-4 border-[#2d2b28] shadow-[10px_10px_0px_0px_#121315] crt-glow overflow-hidden relative">

  <div v-if="!isLoggedIn" class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#dfdad1] transition-all">
    <div class="border-4 border-[#2d2b28] bg-[#fbf9f5] p-8 md:p-12 max-w-md w-full shadow-[8px_8px_0px_0px_#2d2b28] text-center relative animate-fade-in">
      <div class="absolute top-0 left-0 right-0 h-6 bg-[#2d2b28] text-[#fbf9f5] text-[10px] tracking-widest flex items-center px-2 font-mono">
        SECURE_AUTH_GATE // v3.1
      </div>
      
      <div class="font-pixel text-6xl text-[#2d2b28] mt-4 mb-2 tracking-tighter select-none">TapLang</div>
      <p class="text-xs text-neutral-500 font-mono mb-8 tracking-wide">// 글로벌 빈티지 텍스트 인덱스</p>
      
      <button @click="login" class="w-full bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] text-[#2d2b28] font-bold py-3 px-4 border-2 border-[#2d2b28] shadow-[4px_4px_0px_0px_#2d2b28] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-3 text-xs tracking-wider">
        <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.313-.178-1.709H12.24z"/>
        </svg>
        구글 계정으로 로그인하기
      </button>
    </div>
  </div>


  <template v-else>
    <Header />
  

    <main class="flex-1 flex flex-col lg:flex-row overflow-hidden">
      
      <FriendList />
      <section class="flex-1 bg-[#fbf9f5] flex flex-col overflow-hidden relative">
        <div class="flex-1 flex flex-col overflow-hidden">
          
          <ViewPort />
          <Memo />
          <FindPeople />
          <Notice />
          <Chat />
          <GroupChat />
          <TransTag />
         
        </div>
      </section>

    </main>

    <Footer />
   
  </template>



</div>
</div>
</template> 


<script setup lang="ts">
import FriendList from './components/FriendList.vue'
import Header from './components/header/Header.vue'
import Memo from './components/header/Memo.vue'
import FindPeople from './components/header/FindPeople.vue'
import Notice from './components/header/Notice.vue'
import Footer from './components/footer/Footer.vue'
import Chat from './components/footer/Chat.vue'
import GroupChat from './components/footer/GroupChat.vue'
import TransTag from './components/footer/TransTag.vue'
import ViewPort from './components/header/ViewPort.vue'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { storeToRefs } from 'pinia'




const authStore = useAuthStore()

const { isLoggedIn } = storeToRefs(authStore)

const { login } = authStore










// // --- 사람찾기 ---

// const dummyUsers = ref<User[]>([
//   {
//     name: '사이버_드리프터',
//     avatar: '🪐',
//     role: '네트워크 노드 분석가'
//   },
//   {
//     name: '테크노_스타일',
//     avatar: '🕶️',
//     role: '오픈 테크니션'
//   }
// ])


</script>
