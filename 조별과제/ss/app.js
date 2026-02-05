// 더미 데이터 (심부름 서비스 항목)
const items = [
  {id:1,title:'책 배달 (교재 배송)',price:'₩3,000',campus:'gaejwa',detail:'교재 1권, 도보/자전거 배달 — 예상 1일',date:'2월 6일',type:'배달',typeClass:'delivery',category:'배달',capacity:2,applicants:1,requester:'내 프로필',requesterId:999,closed:false,applicantList:['김영수','이민지']},
  {id:2,title:'대리구매: 마트 생필품',price:'₩5,000',campus:'chiram',detail:'마트 구매 후 전달 — 예상 2시간',date:'2월 7일',type:'구매대행',typeClass:'purchase',category:'구매대행',capacity:3,applicants:0,requester:'이영희',requesterId:102,closed:true,applicantList:[]},
  {id:3,title:'편의점 배달 (야식 픽업)',price:'₩2,500',campus:'tongyeong',detail:'편의점 상품 배달 — 예상 15분',date:'오늘',type:'배달',typeClass:'delivery',category:'배달',capacity:2,applicants:2,requester:'박민준',requesterId:103,closed:false,applicantList:['박준호','최은지']},
  {id:4,title:'과외 튜터 (영어)',price:'₩25,000',campus:'gaejwa',detail:'주 2회 1시간 온라인 과외',date:'2월 10일',type:'알바',typeClass:'parttime',category:'알바',capacity:1,applicants:0,requester:'내 프로필',requesterId:999,closed:false,applicantList:[]},
  {id:5,title:'온라인몰 구매 대행',price:'₩7,000',campus:'chiram',detail:'아마존/쿠팡 구매 후 배송',date:'2월 8일',type:'구매대행',typeClass:'purchase',category:'구매대행',capacity:3,applicants:1,requester:'최동욱',requesterId:105,closed:false,applicantList:['이소연']}
];

// 현재 사용자 정보 (추후 변경 가능)
const currentUser = { id: 999, name: '내 프로필' };

// 사용자의 지원 목록
let myApplies = [
  { itemId: 2, appliedAt: new Date() },
  { itemId: 3, appliedAt: new Date() }
];

// 채팅 데이터
let chatRooms = [];
let currentRequestDetail = null;
let selectedChatRoomKey = null;


const itemsList = document.getElementById('itemsList');
const template = document.getElementById('itemTemplate');
const campusSelect = document.getElementById('campusSelect');
let selectedCategory = 'all';

const campusMap = {'gaejwa':'가좌캠퍼스','chiram':'칠암캠퍼스','tongyeong':'통영캠퍼스'};

function renderList(filterCampus='all'){
  itemsList.innerHTML='';
  let list = items.filter(i => filterCampus==='all' ? true : i.campus===filterCampus);
  // 기능별 필터 추가
  if(selectedCategory !== 'all') {
    list = list.filter(i => i.category === selectedCategory);
  }
  if(list.length===0){
    itemsList.innerHTML='<li style="padding:20px;color:#666">등록된 요청이 없습니다.</li>';
    return;
  }

  list.forEach(item => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.item-card');
    card.dataset.id = item.id;
    const typeEl = node.querySelector('.item-type');
    typeEl.textContent = item.type || '';
    if(item.typeClass) typeEl.classList.add(`type-${item.typeClass}`);
    node.querySelector('.item-title').textContent = item.title;
    node.querySelector('.item-detail').textContent = item.detail || '';
    node.querySelector('.item-price').textContent = item.price;
    node.querySelector('.item-campus').textContent = campusMap[item.campus] || item.campus;
    node.querySelector('.item-capacity').textContent = `희망 ${item.capacity}명`;
    node.querySelector('.item-applicants').textContent = `신청 ${item.applicants}명`;
    
    // 마감 상태 표시
    if(item.closed) {
      card.classList.add('closed');
      node.querySelector('.item-closed').style.display = 'block';
      card.removeEventListener('click', () => {
        openModal(item.id);
      });
    }
    
    // 각 카드에 클릭 이벤트 추가
    if(!item.closed) {
      card.addEventListener('click', () => {
        openModal(item.id);
      });
    }
    
    itemsList.appendChild(node);
  });
}

campusSelect.addEventListener('change', (e)=>{
  renderList(e.target.value);
});

// 기능 필터 버튼 이벤트
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCategory = btn.dataset.category;
    renderList(campusSelect.value);
  });
});

// 모달 관련
const modal = document.getElementById('detailModal');
const modalClose = document.getElementById('modalClose');
const modalOverlay = modal.querySelector('.modal-overlay');
const applyBtn = document.getElementById('applyBtn');

function openModal(itemId) {
  const item = items.find(i => i.id === itemId);
  if(!item) return;
  
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalDetail').textContent = item.detail;
  document.getElementById('modalPrice').textContent = item.price;
  document.getElementById('modalCampus').textContent = campusMap[item.campus] || item.campus;
  document.getElementById('modalDate').textContent = item.date || '미정';
  
  // 신청인원이 모집인원을 초과했을 때 경고 표시
  let statusText = `${item.applicants}명 신청 / ${item.capacity}명 모집`;
  if(item.applicants > item.capacity) {
    statusText += ` (초과: ${item.applicants - item.capacity}명)`;
  }
  document.getElementById('modalStatus').textContent = statusText;
  
  // 마감 상태 표시
  const closedBadge = document.getElementById('closedBadge');
  if(item.closed) {
    closedBadge.style.display = 'block';
  } else {
    closedBadge.style.display = 'none';
  }
  
  // 현재 사용자가 이미 지원했는지 확인
  const alreadyApplied = myApplies.some(a => a.itemId === itemId);
  
  // 마감되지 않았다면 지원/지원취소 가능
  let buttonText = '지원하기';
  let isDisabled = item.closed;
  let actionType = 'apply';
  
  if(item.closed) {
    buttonText = '마감됨';
    actionType = 'closed';
  } else if(alreadyApplied) {
    buttonText = '지원 취소';
    actionType = 'cancel';
  }
  
  applyBtn.textContent = buttonText;
  applyBtn.classList.toggle('full', isDisabled);
  applyBtn.disabled = isDisabled;
  applyBtn.dataset.itemId = itemId;
  applyBtn.dataset.actionType = actionType;
  
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

applyBtn.addEventListener('click', (e) => {
  const itemId = parseInt(e.target.dataset.itemId);
  const actionType = e.target.dataset.actionType;
  const item = items.find(i => i.id === itemId);

  if(!item || item.closed) return;

  // 이미 지원한 경우 지원 취소
  if(actionType === 'cancel') {
    const applyIndex = myApplies.findIndex(a => a.itemId === itemId);
    if(applyIndex !== -1) {
      myApplies.splice(applyIndex, 1);
      item.applicants = Math.max(0, item.applicants - 1);
    }
    renderList(campusSelect.value);
    closeModal();
    showToast('지원을 취소했습니다');
    return;
  }

  // 희망 인원을 초과해도 접수 가능
  if(actionType === 'apply') {
    item.applicants++;
    // 지원 목록에 추가
    if(!myApplies.some(a => a.itemId === itemId)) {
      myApplies.push({ itemId, appliedAt: new Date() });
    }
    renderList(campusSelect.value);
    closeModal();
    showToast('신청했습니다');
  }
});

// 카드 클릭 이벤트 위임
document.getElementById('itemsList').addEventListener('click', (e) => {
  const card = e.target.closest('.item-card');
  if(card) {
    const itemId = parseInt(card.dataset.id);
    openModal(itemId);
  }
});

// 초기 렌더
renderList();

// 글쓰기 모달 관련
const writeModal = document.getElementById('writeModal');
const writeBtn = document.getElementById('writeBtn');
const writeModalClose = document.getElementById('writeModalClose');
const writeModalOverlay = writeModal.querySelector('.modal-overlay');
const writeForm = document.getElementById('writeForm');
const submitWriteBtn = document.getElementById('submitWriteBtn');
const cancelWriteBtn = document.getElementById('cancelWriteBtn');

function openWriteModal() {
  writeForm.reset();
  writeModal.classList.add('active');
}

function closeWriteModal() {
  writeModal.classList.remove('active');
}

writeBtn.addEventListener('click', openWriteModal);
writeModalClose.addEventListener('click', closeWriteModal);
writeModalOverlay.addEventListener('click', closeWriteModal);
cancelWriteBtn.addEventListener('click', closeWriteModal);

submitWriteBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const title = document.getElementById('writeTitle').value;
  const detail = document.getElementById('writeDetail').value;
  const price = document.getElementById('writePrice').value;
  const category = document.getElementById('writeCategory').value;
  const campus = document.getElementById('writeCampus').value;
  const capacity = parseInt(document.getElementById('writeCapacity').value);
  const dateTimeInput = document.getElementById('writeDate').value;
  
  if(!title || !detail || !price || !category || !campus || !capacity || !dateTimeInput) {
    alert('모든 항목을 입력하세요');
    return;
  }
  
  // 날짜와 시간을 읽기 좋은 형식으로 변환
  const dateObj = new Date(dateTimeInput);
  const formattedDate = dateObj.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  const typeMap = {'배달':'delivery','알바':'parttime','구매대행':'purchase'};
  const newItem = {
    id: items.length + 1,
    title,
    price,
    campus,
    detail,
    date: formattedDate,
    type: category,
    typeClass: typeMap[category],
    category,
    capacity,
    applicants: 0
  };
  
  items.push(newItem);
  renderList(campusSelect.value);
  closeWriteModal();
  alert('요청이 등록되었습니다!');
});

// ===== 마이페이지 및 채팅 기능 =====

// 페이지 전환 기능
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const page = e.target.dataset.page;
    
    // 탭 활성화 표시
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    
    // 페이지 전환
    if(page === 'main') {
      document.querySelector('.category-filter').style.display = 'flex';
      document.getElementById('itemsList').parentElement.style.display = 'block';
      document.getElementById('mypagePage').style.display = 'none';
    } else if(page === 'mypage') {
      document.querySelector('.category-filter').style.display = 'none';
      document.getElementById('itemsList').parentElement.style.display = 'none';
      document.getElementById('mypagePage').style.display = 'block';
      renderMypage();
    }
  });
});

// 마이페이지 탭 전환
document.querySelectorAll('.mypage-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    
    document.querySelectorAll('.mypage-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.mypage-content').forEach(c => c.style.display = 'none');
    if(tab === 'requests') document.getElementById('requestsTab').style.display = 'block';
    else if(tab === 'applies') document.getElementById('appliesTab').style.display = 'block';
    else if(tab === 'chats') document.getElementById('chatsTab').style.display = 'block';
  });
});

function renderMypage() {
  // 내 요청 렌더링
  const myRequestsList = document.getElementById('myRequestsList');
  myRequestsList.innerHTML = '';
  const myRequests = items.filter(i => i.requesterId === currentUser.id);
  if(myRequests.length === 0) {
    myRequestsList.innerHTML = '<li style="padding:20px;color:#999;text-align:center">요청한 항목이 없습니다</li>';
  } else {
    myRequests.forEach(item => {
      const li = document.createElement('li');
      li.className = 'mypage-item';
      if(item.closed) {
        li.classList.add('closed-item');
      }
      li.innerHTML = `
        <h4 class="mypage-item-title">${item.title}</h4>
        <p class="mypage-item-meta">${item.price} • ${campusMap[item.campus]} • ${item.date}</p>
        <span class="mypage-item-status">${item.closed ? '마감됨' : item.applicants + '명 지원중'}</span>
        ${item.closed ? '<div class="mypage-closed-badge">마감됨</div>' : ''}
      `;
      li.addEventListener('click', () => openMyRequestDetail(item));
      myRequestsList.appendChild(li);
    });
  }
  
  // 지원 현황 렌더링
  const myAppliesList = document.getElementById('myAppliesList');
  myAppliesList.innerHTML = '';
  const appliedItems = items.filter(i => myApplies.some(a => a.itemId === i.id));
  if(appliedItems.length === 0) {
    myAppliesList.innerHTML = '<li style="padding:20px;color:#999;text-align:center">지원한 항목이 없습니다</li>';
  } else {
    appliedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'mypage-item';
      li.innerHTML = `
        <h4 class="mypage-item-title">${item.title}</h4>
        <p class="mypage-item-meta">${item.price} • ${item.requester} • ${item.date}</p>
        <span class="mypage-item-status">지원완료</span>
      `;
      li.addEventListener('click', () => openChat(item.id, item.requester));
      myAppliesList.appendChild(li);
    });
  }
  
  renderMypageChats();
}

function getChatRoomKey(room) {
  return `${room.itemId}-${room.personName}-${room.isIntegrated ? 'integrated' : 'normal'}`;
}

function renderMypageChats() {
  // 채팅 목록 렌더링
  const chatList = document.getElementById('chatList');
  const chatContent = document.getElementById('chatContent');
  chatList.innerHTML = '';
  chatContent.innerHTML = '';

  if(chatRooms.length === 0) {
    chatList.innerHTML = '<li style="padding:20px;color:#999;text-align:center">채팅이 없습니다</li>';
    chatContent.innerHTML = '<p style="text-align:center;color:#999;padding:40px">보내거나 받은 채팅 내역이 없습니다</p>';
  } else {
    chatRooms.forEach(room => {
      const li = document.createElement('li');
      li.className = 'chat-item';
      const messageCount = room.messages.length;
      const lastMessage = room.messages.length > 0 ? room.messages[room.messages.length - 1].text : '메시지 없음';
      const roomKey = getChatRoomKey(room);
      li.innerHTML = `
        <p class="chat-person">${room.personName}</p>
        <p class="chat-preview">${lastMessage}</p>
        <p class="chat-meta">메시지: ${messageCount}개</p>
      `;

      if(selectedChatRoomKey === roomKey) {
        li.classList.add('active');
      }

      li.addEventListener('click', () => {
        selectedChatRoomKey = roomKey;
        renderMypageChats();
      });
      chatList.appendChild(li);
    });

    // 선택된 채팅이 없으면 첫 채팅 선택
    const selectedRoom = chatRooms.find(room => getChatRoomKey(room) === selectedChatRoomKey) || chatRooms[0];
    selectedChatRoomKey = getChatRoomKey(selectedRoom);
    renderChatHistory(selectedRoom);
  }
}

function renderChatHistory(room) {
  const chatContent = document.getElementById('chatContent');
  chatContent.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'chat-history-header';
  header.innerHTML = `<h4>${room.personName}</h4>`;
  chatContent.appendChild(header);

  if(room.messages.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'chat-history-empty';
    empty.textContent = '아직 대화가 없습니다';
    chatContent.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'chat-history-list';

  room.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-history-message ${msg.sender === 'me' ? 'mine' : 'other'}`;
    msgDiv.innerHTML = `
      <p class="chat-history-label">${msg.sender === 'me' ? '보낸 메시지' : '받은 메시지'}</p>
      <div class="chat-history-bubble">${msg.text}</div>
      <p class="chat-history-time">${msg.time}</p>
    `;
    list.appendChild(msgDiv);
  });

  chatContent.appendChild(list);
}

const chatModal = document.getElementById('chatModal');
const chatModalClose = document.getElementById('chatModalClose');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
let currentChatRoom = null;

function openChat(itemId, personName) {
  let room = chatRooms.find(r => r.itemId === itemId && r.personName === personName);
  if(!room) {
    room = {
      itemId,
      personName,
      messages: [],
      lastMessage: ''
    };
    chatRooms.push(room);
  }
  selectedChatRoomKey = getChatRoomKey(room);
  openChatModal(room);
}

function openChatModal(room) {
  currentChatRoom = room;
  document.getElementById('chatTitle').textContent = room.personName;
  
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';
  room.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.sender === 'me' ? 'mine' : 'other'}`;
    msgDiv.innerHTML = `
      <div class="chat-bubble">${msg.text}</div>
      <div class="chat-time">${msg.time}</div>
    `;
    chatMessages.appendChild(msgDiv);
  });
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatModal.classList.add('active');
}

function closeChatModal() {
  chatModal.classList.remove('active');
  chatInput.value = '';
}

chatModalClose.addEventListener('click', closeChatModal);
chatModal.querySelector('.modal-overlay').addEventListener('click', closeChatModal);

chatSendBtn.addEventListener('click', () => {
  if(!currentChatRoom || !chatInput.value.trim()) return;
  
  const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  currentChatRoom.messages.push({
    sender: 'me',
    text: chatInput.value,
    time: now
  });
  currentChatRoom.lastMessage = chatInput.value;
  
  // 상대방 자동 응답 (데모용)
  setTimeout(() => {
    currentChatRoom.messages.push({
      sender: 'other',
      text: '네, 알겠습니다!',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    });
    openChatModal(currentChatRoom);
    renderMypageChats();
  }, 500);
  
  openChatModal(currentChatRoom);
  renderMypageChats();
  chatInput.value = '';
});

chatInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') chatSendBtn.click();
});

// ===== 내 요청 상세 모달 =====
const myRequestDetailModal = document.getElementById('myRequestDetailModal');
const requestDetailClose = document.getElementById('requestDetailClose');
const integratedChatBtn = document.getElementById('integratedChatBtn');
const closeRequestBtn = document.getElementById('closeRequestBtn');

requestDetailClose.addEventListener('click', () => {
  myRequestDetailModal.classList.remove('active');
});

myRequestDetailModal.querySelector('.modal-overlay').addEventListener('click', () => {
  myRequestDetailModal.classList.remove('active');
});

function openMyRequestDetail(item) {
  currentRequestDetail = item;
  
  document.getElementById('requestDetailTitle').textContent = item.title;
  document.getElementById('requestDetailContent').textContent = item.detail;
  document.getElementById('requestDetailPrice').textContent = item.price;
  document.getElementById('requestDetailCampus').textContent = campusMap[item.campus];
  document.getElementById('requestDetailDate').textContent = item.date;
  document.getElementById('requestDetailStatus').textContent = `${item.applicants}명 신청 / ${item.capacity}명 모집`;
  
  // 지원자 목록 렌더링
  const applicantsList = document.getElementById('applicantsList');
  applicantsList.innerHTML = '';
  if(item.applicantList.length === 0) {
    applicantsList.innerHTML = '<li style="padding:10px;color:#999;text-align:center">지원자가 없습니다</li>';
  } else {
    item.applicantList.forEach(name => {
      const li = document.createElement('li');
      li.className = 'applicant-item';
      li.innerHTML = `
        <span class="applicant-name">${name}</span>
        <button class="applicant-btn" data-name="${name}">채팅</button>
      `;
      li.querySelector('.applicant-btn').addEventListener('click', () => {
        openChat(item.id, name);
        myRequestDetailModal.classList.remove('active');
      });
      applicantsList.appendChild(li);
    });
  }
  
  // 통합 채팅 버튼
  integratedChatBtn.onclick = () => {
    openIntegratedChat(item);
    myRequestDetailModal.classList.remove('active');
  };
  
  // 마감/마감해제 버튼
  closeRequestBtn.textContent = item.closed ? '마감해제' : '마감';
  closeRequestBtn.onclick = () => {
    item.closed = !item.closed;
    alert(item.closed ? '요청이 마감되었습니다!' : '요청 마감이 해제되었습니다!');
    myRequestDetailModal.classList.remove('active');
    renderMypage();
    renderList(campusSelect.value);
  };
  
  myRequestDetailModal.classList.add('active');
}

function openIntegratedChat(item) {
  const roomName = `${item.title} (통합)`;
  let room = chatRooms.find(r => r.itemId === item.id && r.isIntegrated);
  if(!room) {
    room = {
      itemId: item.id,
      personName: roomName,
      isIntegrated: true,
      messages: [],
      lastMessage: '통합 채팅'
    };
    chatRooms.push(room);
  }
  openChatModal(room);
}

// 초기 렌더
renderList();

// 초기 활성 탭 설정
document.querySelector('.tab.errands').classList.add('active');

// 로고 클릭 시 메인 화면으로 이동
document.getElementById('logoBtn').addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab.errands').classList.add('active');
  
  document.querySelector('.category-filter').style.display = 'flex';
  document.getElementById('itemsList').parentElement.style.display = 'block';
  document.getElementById('mypagePage').style.display = 'none';
});
