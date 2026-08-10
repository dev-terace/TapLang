


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
      
      <FriendSidebar />
      <section class="flex-1 bg-[#fbf9f5] flex flex-col overflow-hidden relative">
        <div class="flex-1 flex flex-col overflow-hidden">
          <ViewPort />
          <Memo />
          <FindPeople />
          <Notice />
          <Chat />
           <ChatRoom />
          <!-- <InviteChatRoom /> -->
          <GroupChat />
          <TransTag />
         
        </div>
      </section>
       
      
       <!-- 로딩 오버레이: 전체를 덮음 -->
    <div
      v-if="showLoading"
      class="absolute inset-0 z-50 bg-[#e6e2db] flex flex-col items-center justify-center gap-4"
    >
      <div class="font-pixel text-3xl text-[#2d2b28] tracking-tighter">TapLang</div>
      <div class="w-64 h-4 border-2 border-[#2d2b28] bg-[#fbf9f5] overflow-hidden relative">
        <div class="h-full bg-[#2d2b28] animate-pulse w-full"></div>
      </div>
      <p class="text-[10px] font-mono text-neutral-500 tracking-widest animate-pulse">SYNCING_ONLINE_STATUS...</p>
    </div>

    </main>

    <Footer />
   
  </template>



</div>
</div>
</template> 


<script setup lang="ts">
import FriendList from './friends/components/FriendList.vue'
import Header from './shared/ui/components/Header.vue'
import Memo from './memo/Memo.vue'
import FindPeople from './find_people/components/FindPeople.vue'
import Notice from './notice/Notice.vue'
import Footer from './shared/ui/components/Footer.vue'
import Chat from './chat/components/Chat.vue'
import ChatRoom from './chat/components/ChatRoom.vue'
import GroupChat from './group_chat/components/GroupChat.vue'
import TransTag from './trans_tag/components/TransTag.vue'
import ViewPort from './shared/ui/components/ViewPort.vue'
import FriendSidebar from './friends/components/FriendSidebar.vue'
import InviteChatRoom from './chat/components/InviteChatRoom.vue'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/shared/auth/AuthStore.js'
import { storeToRefs } from 'pinia'
import { useSocketRegister } from '@/shared/socket/socket.register.js';


const socketRegister = useSocketRegister();


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
      socketRegister.connect();
    }

  }
);






</script>
