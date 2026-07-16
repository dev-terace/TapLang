


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
    <header class="h-10 bg-[#2d2b28] text-[#fbf9f5] flex items-center justify-between px-4 border-b-2 border-[#2d2b28] shrink-0">
      <div class="flex items-center gap-6 text-xs tracking-widest font-bold">
        <span class="text-yellow-400 font-pixel text-xl tracking-tighter">✦ TapLang</span>
        
        <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" 
              :class="currentTab === 'memo' ? 'text-yellow-400 bg-neutral-700 rounded' : 'text-neutral-300'" 
              @click="currentTab = 'memo'">📝 메모장</span>
        
        <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" 
              :class="currentTab === 'findPeople' ? 'text-yellow-400 bg-neutral-700 rounded' : 'text-neutral-300'" 
              @click="currentTab = 'findPeople'">🔍 사람찾기</span>
        
        <span class="hidden md:inline cursor-pointer hover:underline py-1 px-2 transition-colors" 
              :class="currentTab === 'notice' ? 'text-yellow-400 bg-neutral-700 rounded' : 'text-neutral-300'" 
              @click="currentTab = 'notice'">📢 공지사항</span>
      </div>
      <div class="flex items-center gap-3 text-[10px]">
        <button @click="logout" class="border border-neutral-500 px-2 py-0.5 bg-[#423f3a] text-neutral-300 hover:text-white hover:bg-neutral-700">로그아웃</button>
      </div>
    </header>

    <main class="flex-1 flex flex-col lg:flex-row overflow-hidden">
      
      <!-- <section class="w-full lg:w-80 bg-[#dfdad1] lg:border-r-4 border-b-4 lg:border-b-0 border-[#2d2b28] flex flex-col shrink-0">
        <div class="bg-[#c5bfb6] px-4 py-2 border-b-2 border-[#2d2b28] flex justify-between items-center">
          <span class="text-xs font-bold tracking-wider">// 인맥_주소록.sh</span>
          <button @click="openModal('addFriend')" class="bg-[#fbf9f5] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] text-[10px] px-2 py-0.5 font-bold transition-all shadow-[2px_2px_0px_0px_#2d2b28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            + 등록
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mb-2">● 온라인 인맥</div>
          
          <div v-for="friend in onlineFriends" :key="friend.id" 
               @dblclick="alertFunc(friend.name + ' 님에게 귓속말을 보냅니다.')"
               class="group flex items-center gap-3 p-2 bg-[#f4f1eb] hover:bg-[#2d2b28] hover:text-[#fbf9f5] border-2 border-[#2d2b28] shadow-[3px_3px_0px_0px_#2d2b28] cursor-pointer transition-all">
            <div class="w-8 h-8 bg-[#2d2b28] group-hover:bg-[#fbf9f5] flex items-center justify-center border-2 border-[#2d2b28] shrink-0 font-pixel text-lg select-none">
              {{ friend.avatar }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-emerald-500 inline-block rounded-full"></span>
                <span class="text-xs font-bold truncate tracking-tight">{{ friend.name }}</span>
              </div>
              <div class="text-[10px] text-neutral-500 group-hover:text-neutral-300 truncate mt-0.5">{{ friend.statusMsg }}</div>
            </div>
          </div>

          <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mt-6 mb-2">○ 오프라인 인맥</div>
          
          <div v-for="friend in offlineFriends" :key="friend.id" 
               class="flex items-center gap-3 p-2 bg-[#dfdad1] opacity-60 border-2 border-transparent">
            <div class="w-8 h-8 bg-neutral-400 text-neutral-200 flex items-center justify-center shrink-0 font-pixel text-lg filter grayscale">
              {{ friend.avatar }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-neutral-400 inline-block rounded-full"></span>
                <span class="text-xs font-bold text-[#5c5851] truncate">{{ friend.name }}</span>
              </div>
              <div class="text-[10px] text-neutral-500 truncate mt-0.5">{{ friend.statusMsg }}</div>
            </div>
          </div>
        </div>
      </section> -->
      <FriendList />
      <section class="flex-1 bg-[#fbf9f5] flex flex-col overflow-hidden relative">
        <div class="flex-1 flex flex-col overflow-hidden">
          
          <div class="border-b-2 border-[#2d2b28] px-4 py-2 bg-[#f4f1eb] flex justify-between items-center text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-[#2d2b28] uppercase tracking-wider">// VIEWPORT: {{ currentTab }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full border border-[#2d2b28]" :class="isTopTab ? 'bg-green-400' : 'bg-neutral-300'"></span>
              <span class="w-2.5 h-2.5 rounded-full border border-[#2d2b28]" :class="!isTopTab ? 'bg-blue-400' : 'bg-neutral-300'"></span>
            </div>
          </div>

          <div v-if="currentTab === 'memo'" class="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col h-full">
            <div class="flex items-center justify-between border-b-2 border-[#2d2b28] pb-2 mb-4">
              <span class="text-xs font-bold text-neutral-600">📝 메인_작업_메모장.txt</span>
            </div>
            <textarea class="flex-1 w-full bg-[#fbf9f5] text-[#2d2b28] border-2 border-dashed border-[#c5bfb6] p-4 text-xs font-mono leading-relaxed outline-none resize-none shadow-inner" placeholder="이곳은 개인 작업용 메모장 공간입니다..."></textarea>
          </div>

          <div v-if="currentTab === 'findPeople'" class="flex-1 overflow-y-auto p-6">
            <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6">
              <h3 class="font-bold text-base tracking-wider">// 사람찾기_디렉토리.net</h3>
              <p class="text-[10px] text-neutral-500">글로벌 서버의 접속자를 탐색합니다.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="user in dummyUsers" :key="user.name" class="p-3 bg-[#f4f1eb] border-2 border-[#2d2b28] flex justify-between items-center shadow-[3px_3px_0px_0px_#2d2b28]">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#2d2b28] text-white flex items-center justify-center font-pixel text-lg border-2 border-[#2d2b28]">{{ user.avatar }}</div>
                  <div>
                    <div class="text-xs font-bold">{{ user.name }}</div>
                    <div class="text-[9px] text-neutral-500">{{ user.role }}</div>
                  </div>
                </div>
                <button @click="alertFunc('초대 메일을 발송했습니다.')" class="border-2 border-[#2d2b28] bg-white text-[10px] px-2 py-1 font-bold hover:bg-[#2d2b28] hover:text-white transition-all">연결</button>
              </div>
            </div>
          </div>

          <div v-if="currentTab === 'notice'" class="flex-1 overflow-y-auto p-6">
            <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6">
              <h3 class="font-bold text-base tracking-wider">// 시스템_공지사항.sys</h3>
              <p class="text-[10px] text-neutral-500">서버 점검 및 일반 공지 목록입니다.</p>
            </div>
            <div class="space-y-3">
              <div class="bg-white border-2 border-[#2d2b28] p-3 text-xs flex justify-between items-center shadow-[2px_2px_0px_0px_#2d2b28]">
                <span class="font-bold text-red-600">[긴급] v3.1 클라이언트 업데이트 안내</span>
                <span class="text-[10px] text-neutral-400">2026-07-15</span>
              </div>
              <div class="bg-white border-2 border-[#2d2b28] p-3 text-xs flex justify-between items-center shadow-[2px_2px_0px_0px_#2d2b28]">
                <span class="font-bold">[안내] 사설 대화방 목록 기능 추가</span>
                <span class="text-[10px] text-neutral-400">2026-07-15</span>
              </div>
            </div>
          </div>

          <div v-if="currentTab === 'publicChat'" class="flex-1 flex flex-col h-full bg-[#fbf9f5]">
            <div class="bg-[#e6e2db] p-3 border-b-2 border-[#2d2b28] flex justify-between items-center">
              <span class="font-bold text-xs">💬 공용 대화방 라운지</span>
              <span class="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded">현재 42명 접속 중</span>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div class="text-xs bg-white border-2 border-[#2d2b28] p-2 rounded max-w-md shadow-[2px_2px_0px_0px_#2d2b28]"><span class="font-bold text-blue-800">[시스템]</span> 공용 라운지에 입장하셨습니다. 매너 채팅 부탁드립니다.</div>
              <div class="text-xs bg-white border-2 border-[#2d2b28] p-2 rounded max-w-md shadow-[2px_2px_0px_0px_#2d2b28]"><span class="font-bold text-purple-800">[아날로그]</span> 다들 점심은 드셨나요?</div>
            </div>
            <div class="p-3 border-t-2 border-[#2d2b28] bg-[#f4f1eb] flex gap-2">
              <input type="text" placeholder="메시지를 입력하세요..." class="flex-1 bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none" />
              <button class="bg-[#2d2b28] text-[#fbf9f5] px-4 font-bold text-xs border-2 border-[#2d2b28]">전송</button>
            </div>
          </div>

          <div v-if="currentTab === 'privateChat'" class="flex-1 flex flex-col h-full">
            <div class="p-6 border-b-2 border-dashed border-[#2d2b28]">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 class="font-bold text-base tracking-wider">// 사설_대화방_목록.net</h3>
                  <p class="text-[10px] text-neutral-500">유저들이 생성한 커스텀 채널 목록입니다.</p>
                </div>
                <button @click="alertFunc('사설방 개설 기능은 준비 중입니다.')" class="bg-[#2d2b28] text-[#fbf9f5] hover:bg-white hover:text-[#2d2b28] border-2 border-[#2d2b28] text-xs px-3 py-1.5 font-bold transition-all shadow-[3px_3px_0px_0px_#dfdad1] active:translate-y-[2px] active:shadow-none">
                  + 사설방 개설
                </button>
              </div>

              <div class="flex gap-2 mt-6">
                <button @click="privateFilter = 'all'" :class="['px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all', privateFilter === 'all' ? 'bg-[#2d2b28] text-white' : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]']">
                  전체 사설 대화방
                </button>
                <button @click="privateFilter = 'secret'" :class="['px-3 py-1 text-xs font-bold border-2 border-[#2d2b28] transition-all', privateFilter === 'secret' ? 'bg-[#2d2b28] text-white' : 'bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6]']">
                  🔒 비밀 대화방
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-[#fbf9f5]">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="room in filteredPrivateRooms" :key="room.id" 
                     class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-4 shadow-[4px_4px_0px_0px_#2d2b28] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2d2b28] transition-all flex flex-col justify-between group cursor-pointer"
                     @click="handlePrivateRoomClick(room)">
                  <div>
                    <div class="flex justify-between items-start gap-2 mb-2">
                      <div class="flex items-center gap-2">
                        <span v-if="room.isSecret" class="text-xs bg-red-600 text-white px-1 font-pixel">🔒</span>
                        <span v-else class="text-xs bg-blue-600 text-white px-1 font-pixel">🌐</span>
                        <span class="text-xs font-bold text-[#2d2b28] tracking-tight">{{ room.title }}</span>
                      </div>
                    </div>
                    <p class="text-[10px] text-neutral-500 mt-2">{{ room.desc }}</p>
                  </div>
                  <div class="flex justify-between items-center text-[10px] text-[#2d2b28] font-bold border-t border-[#c5bfb6] pt-3 mt-4">
                    <span>방장: {{ room.owner }}</span>
                    <span>인원: {{ room.members }}명</span>
                  </div>
                </div>
                
                <div v-if="filteredPrivateRooms.length === 0" class="col-span-1 md:col-span-2 text-center text-xs text-neutral-500 py-10 font-bold border-2 border-dashed border-[#c5bfb6]">
                  해당 조건의 사설 대화방이 존재하지 않습니다.
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentTab === 'tagReg'" class="flex-1 overflow-y-auto p-6">
            <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6">
              <h3 class="font-bold text-base tracking-wider">// 영어 태그 등록_DB.sql</h3>
              <p class="text-[10px] text-neutral-500">외국어 슬랭/신조어를 한국어로 순화하여 서버에 등록합니다.</p>
            </div>

            <div class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-5 shadow-[4px_4px_0px_0px_#2d2b28] mb-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-bold mb-1 text-blue-900">영어 원문 (Slang/Tag) :</label>
                  <input type="text" v-model="newTag.eng" placeholder="예: Rizz" class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
                </div>
                <div>
                  <label class="block text-xs font-bold mb-1 text-red-900">한국어 순화 번역 :</label>
                  <input type="text" v-model="newTag.kor" placeholder="예: 상대를 매혹시키는 치명적인 매력" class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
                </div>
              </div>
              <div class="flex justify-end">
                <button @click="registerEngTag" class="bg-[#2d2b28] text-[#fbf9f5] px-6 py-2 font-bold text-xs border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#a39b90] active:translate-y-[2px] active:shadow-none transition-all">
                  + 태그 인덱스 추가
                </button>
              </div>
            </div>

            <div class="text-[10px] font-bold text-[#726e67] tracking-widest border-b border-[#c5bfb6] pb-1 mb-3">● 최근 등록된 영어 태그 인덱스</div>
            <div class="border-2 border-[#2d2b28] overflow-hidden shadow-[4px_4px_0px_0px_#2d2b28]">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-[#2d2b28] text-[#fbf9f5]">
                    <th class="p-3 text-[10px] border-r border-[#4e4b44]">영어 원문</th>
                    <th class="p-3 text-[10px]">한국어 순화 번역</th>
                  </tr>
                </thead>
                <tbody class="divide-y-2 divide-[#2d2b28]">
                  <tr v-for="(tag, index) in engTags" :key="index" class="hover:bg-[#e6e2db] bg-[#fbf9f5]">
                    <td class="p-3 font-bold text-blue-800 border-r border-[#2d2b28] font-mono"># {{ tag.eng }}</td>
                    <td class="p-3 text-[#2d2b28] font-bold italic">⇄ {{ tag.kor }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </section>

    </main>

    <footer class="h-14 bg-[#dfdad1] border-t-4 border-[#2d2b28] flex items-center px-4 shrink-0 overflow-x-auto gap-3">
      <button class="bg-[#2d2b28] text-yellow-400 font-bold px-3 py-1.5 text-xs flex items-center gap-2 border-2 border-[#2d2b28] shadow-[2px_2px_0px_0px_#a39b90] shrink-0 mr-2">
        <span class="font-pixel text-base">⎋</span>
        <span>시작</span>
      </button>

      <button :class="['px-3 py-1.5 text-xs font-bold border-2 border-[#2d2b28] flex items-center gap-2 transition-all shrink-0', 
                       currentTab === 'publicChat' ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-blue-700' : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]']" 
              @click="currentTab = 'publicChat'">
        <span class="font-pixel text-lg">💬</span>
        <span>대화방</span>
      </button>

      <button :class="['px-3 py-1.5 text-xs font-bold border-2 border-[#2d2b28] flex items-center gap-2 transition-all shrink-0', 
                       currentTab === 'privateChat' ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-red-700' : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]']" 
              @click="currentTab = 'privateChat'">
        <span class="font-pixel text-lg">🔒</span>
        <span>사설 대화방</span>
      </button>

      <button :class="['px-3 py-1.5 text-xs font-bold border-2 border-[#2d2b28] flex items-center gap-2 transition-all shrink-0', 
                       currentTab === 'tagReg' ? 'bg-[#fbf9f5] shadow-inner translate-y-[1px] text-emerald-700' : 'bg-[#c5bfb6] shadow-[2px_2px_0px_0px_#2d2b28] text-[#2d2b28]']" 
              @click="currentTab = 'tagReg'">
        <span class="font-pixel text-lg">🏷️</span>
        <span>영어 태그 등록</span>
      </button>
    </footer>
  </template>


  <!-- <div v-if="modalStore === 'addFriend'" class="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50" @click.self="closeModal">
    <div class="w-full max-w-sm bg-[#e6e2db] border-4 border-[#2d2b28] shadow-[8px_8px_0px_0px_#121315] overflow-hidden">
      
      <div class="bg-[#2d2b28] text-[#fbf9f5] px-4 py-1.5 flex justify-between items-center text-xs font-bold">
        <span>// 데이터_보안_엔트리.cfg</span>
        <button class="hover:text-red-400 font-pixel text-lg leading-none" @click="closeModal">×</button>
      </div>

      <div class="p-5 space-y-4">
        <p class="text-xs font-bold uppercase text-neutral-500">// 신규 인맥 텔레메트리 등록</p>
        <div>
          <label class="block text-xs font-bold mb-1">식별 성명 :</label>
          <input type="text" v-model="friendFormData.name" placeholder="예: 미래소년" class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-1">상태 전파 메시지 :</label>
          <input type="text" v-model="friendFormData.status" placeholder="현재 노드 기분 상태 기입" class="w-full bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
        </div>
        <div class="mt-6 flex justify-end gap-3 text-xs">
          <button @click="closeModal" class="bg-[#c5bfb6] text-[#2d2b28] border-2 border-[#2d2b28] px-4 py-1.5 font-bold hover:bg-neutral-300 transition-all">
            취소
          </button>
          <button @click="handleAddFriend" class="bg-[#2d2b28] text-[#fbf9f5] border-2 border-[#2d2b28] px-4 py-1.5 font-bold hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_0px_#a39b90]">
            프로세스 적용
          </button>
        </div>
      </div>
    </div>
  </div> -->

</div>
</div>
</template> 


<script setup lang="ts">
import FriendList from './components/FriendList.vue'

import { ref, computed } from 'vue'




// interface Friend {
//   id: number
//   name: string
//   avatar: string
//   statusMsg: string
//   online: boolean
// }

// interface User {
//   name: string
//   avatar: string
//   role: string
// }

// interface PrivateRoom {
//   id: number
//   title: string
//   desc: string
//   owner: string
//   members: number
//   isSecret: boolean
// }

// interface Tag {
//   eng: string
//   kor: string
// }

const isLoggedIn = ref(false)

const login = () => {
  isLoggedIn.value = true
}

const currentTab = ref('memo')

const logout = () => {
  isLoggedIn.value = false
  currentTab.value = 'memo'
}

const isTopTab = computed(() =>
  ['memo', 'findPeople', 'notice'].includes(currentTab.value)
)


// // --- 사이드바 인맥 데이터 ---

const friends = ref<Friend[]>([
  {
    id: 1,
    name: '사이버_러버',
    avatar: '🪐',
    statusMsg: '로그 분석 시스템 기동 중',
    online: true
  },
  {
    id: 2,
    name: '아날로그_웨이브',
    avatar: '💾',
    statusMsg: '버디버디 전보 대기',
    online: true
  },
  {
    id: 3,
    name: '미래지향99',
    avatar: '🗼',
    statusMsg: '부재중 (쪽지 남겨주세요)',
    online: false
  },
  {
    id: 4,
    name: '은하수_여행자',
    avatar: '📻',
    statusMsg: '터미널 접속 종료',
    online: false
  }
])

// const onlineFriends = computed(() =>
//   friends.value.filter(friend => friend.online)
// )

// const offlineFriends = computed(() =>
//   friends.value.filter(friend => !friend.online)
// )


// // --- 모달 ---


//  const activeModal = ref<string | null>(null)

// const friendFormData = ref({
//   name: '',
//   status: ''
// })

//  const openModal = (type: string) => {
//    activeModal.value = type
//  }

// const closeModal = () => {
//   activeModal.value = null
//   friendFormData.value = {
//     name: '',
//     status: ''
//   }
// }

// const handleAddFriend = () => {
//   if (!friendFormData.value.name) {
//     alert('성명을 기입하세요.')
//     return
//   }

//   friends.value.unshift({
//     id: Date.now(),
//     name: friendFormData.value.name,
//     avatar: '🛰️',
//     statusMsg:
//       friendFormData.value.status || '터미널 활성화.',
//     online: true
//   })

//   closeModal()
// }


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


// // --- 사설 대화방 ---

// const privateFilter = ref<'all' | 'secret'>('all')

// const privateRooms = ref<PrivateRoom[]>([
//   {
//     id: 1,
//     title: '영어 슬랭 완전 정복',
//     desc: '새로 등록된 태그 공유합니다.',
//     owner: '영문학도',
//     members: 12,
//     isSecret: false
//   },
//   {
//     id: 2,
//     title: '시크릿 프로젝트 V',
//     desc: '비인가자 접근 금지 구역',
//     owner: 'admin_00',
//     members: 4,
//     isSecret: true
//   },
//   {
//     id: 3,
//     title: '레트로 코딩 스터디',
//     desc: 'C언어와 어셈블리 토론방',
//     owner: '해커박',
//     members: 8,
//     isSecret: false
//   },
//   {
//     id: 4,
//     title: '사내 임원진 회의실',
//     desc: '관계자 외 출입 금지',
//     owner: 'CEO',
//     members: 6,
//     isSecret: true
//   }
// ])


// const filteredPrivateRooms = computed(() => {
//   if (privateFilter.value === 'all') {
//     return privateRooms.value
//   }

//   return privateRooms.value.filter(
//     room => room.isSecret
//   )
// })


// const handlePrivateRoomClick = (room: PrivateRoom) => {
//   if (room.isSecret) {
//     const pwd = prompt(
//       `[${room.title}] 은(는) 비밀 대화방입니다.\n입장 패스워드를 입력하세요:`
//     )

//     if (pwd) {
//       alert('패스워드 검증 로직 연결이 필요합니다.')
//     }
//   } else {
//     alert(`[${room.title}] 사설 대화방 입장을 시도합니다.`)
//   }
// }


// // --- 영어 태그 ---

// const newTag = ref<Tag>({
//   eng: '',
//   kor: ''
// })


// const engTags = ref<Tag[]>([
//   {
//     eng: 'Based',
//     kor: '주관이 뚜렷하고 당당한 훌륭한 태도'
//   },
//   {
//     eng: 'Slay',
//     kor: '압도적으로 멋지게 해내다'
//   }
// ])


// const registerEngTag = () => {
//   if (!newTag.value.eng || !newTag.value.kor) {
//     alert(
//       '영어 원문과 한국어 순화 내용을 모두 입력해주세요.'
//     )
//     return
//   }

//   engTags.value.unshift({
//     eng: newTag.value.eng,
//     kor: newTag.value.kor
//   })

//   newTag.value = {
//     eng: '',
//     kor: ''
//   }

//   alert('태그가 데이터베이스에 성공적으로 등록되었습니다.')
// }


// const alertFunc = (msg: string) => {
//   alert(msg)
// }
</script>
