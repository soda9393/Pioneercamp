const loginBadge = document.getElementById('loginBadge');

const authKey = 'campusAuth';
const isAuthed = () => localStorage.getItem(authKey) === 'true';
const setAuthed = (value) => {
  localStorage.setItem(authKey, value ? 'true' : 'false');
  if (loginBadge) {
    loginBadge.textContent = value ? '학생 인증 완료' : '학생 인증 필요';
    loginBadge.classList.toggle('active', value);
  }
  document.body.classList.toggle('login-only', !value);
};

const ensureAuthed = () => {
  if (isAuthed()) return true;
  openLoginModal();
  if (loginStatus) {
    loginStatus.textContent = '중고거래 이용 전 학생 인증이 필요합니다.';
    loginStatus.style.color = '#e76f51';
  }
  return false;
};

const imagePresets = {
  raspberry: 'images/raspberry.jpg',
  circuit2: 'images/circuit2.jpg',
  tablet: 'images/tablet.jpg',
  tumbler: 'images/tumbler.jpg',
  humidifier: 'images/humidifier.jpg',
  circuitBook: 'images/circuit_book.jpg',
  camping: 'images/camping.jpg'
};

const baseListings = [
  {
    id: 'b1',
    title: '라즈베리파이 4B 풀세트',
    price: 68000,
    category: '디지털',
    campus: '가좌 캠퍼스',
    building: '공학5호관',
    condition: '거의 새 것',
    status: 'available',
    image: imagePresets.raspberry,
    seller: '메이커룸',
    description: 'SD카드와 케이스 포함, 강의용으로 2회 사용했습니다.',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    likes: 24
  },
  {
    id: 'b2',
    title: '회로해석론2 교재',
    price: 12000,
    category: '교재',
    campus: '칠암 캠퍼스',
    building: '도서관',
    condition: '사용감 있음',
    status: 'reserved',
    image: imagePresets.circuit2,
    seller: '서가탐험',
    description: '필기 약간 있으나 문제풀이에는 문제 없습니다.',
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
    likes: 15
  },
  {
    id: 'b3',
    title: '캠핑 테이블 + 의자 2개',
    price: 35000,
    category: '취미',
    campus: '통영 캠퍼스',
    building: '정문',
    condition: '거의 새 것',
    status: 'available',
    image: imagePresets.camping,
    seller: '바람소리',
    description: '동아리 행사 1회 사용, 보관 상태 좋습니다.',
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    likes: 31
  },
  {
    id: 'b4',
    title: '미니 가습기',
    price: 8000,
    category: '생활',
    campus: '내동 캠퍼스',
    building: '후문',
    condition: '사용감 있음',
    status: 'sold',
    image: imagePresets.humidifier,
    seller: '새벽공기',
    description: '필터 교체하면 오래 사용할 수 있어요.',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    likes: 10
  },
  {
    id: 'b5',
    title: '그래픽 태블릿 (입문용)',
    price: 42000,
    category: '디지털',
    campus: '가좌 캠퍼스',
    building: '느티마루',
    condition: '거의 새 것',
    status: 'available',
    image: imagePresets.tablet,
    seller: '캠퍼스드로잉',
    description: '온라인 수업용으로 구매, 박스 포함.',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    likes: 42
  },
  {
    id: 'b6',
    title: '텀블러 세트 (2개)',
    price: 15000,
    category: '생활',
    campus: '창원산학캠퍼스',
    building: '도서관',
    condition: '새상품',
    status: 'reserved',
    image: imagePresets.tumbler,
    seller: '그린루프',
    description: '선물 받았는데 사용하지 않아 판매합니다.',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    likes: 18
  }
];

const listingGrid = document.getElementById('listingGrid');
const resultCount = document.getElementById('resultCount');
const wishCount = document.getElementById('wishCount');
const campusFilter = document.getElementById('campusFilter');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const buildingFilter = document.getElementById('buildingFilter');
const sortFilter = document.getElementById('sortFilter');
const wishOnly = document.getElementById('wishOnly');
const resetFilters = document.getElementById('resetFilters');

const modal = document.getElementById('detailModal');
const modalContent = document.getElementById('modalContent');

const loginModal = document.getElementById('loginModal');
const openLogin = document.getElementById('openLogin');
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

const chatModal = document.getElementById('chatModal');
const chatTitle = document.getElementById('chatTitle');
const chatThread = document.getElementById('chatThread');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
let activeChatId = null;

const formPanel = document.getElementById('formPanel');
const openForm = document.getElementById('openForm');
const closeForm = document.getElementById('closeForm');
const listingForm = document.getElementById('listingForm');
const campusInput = document.getElementById('campusInput');
const buildingInput = document.getElementById('buildingInput');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

const storageKeys = {
  listings: 'campusListings',
  wishlist: 'campusWishlist',
  chats: 'campusChats'
};

const getStoredListings = () => {
  const raw = localStorage.getItem(storageKeys.listings);
  return raw ? JSON.parse(raw) : [];
};

const saveListings = (items) => {
  localStorage.setItem(storageKeys.listings, JSON.stringify(items));
};

const getWishlist = () => {
  const raw = localStorage.getItem(storageKeys.wishlist);
  return raw ? JSON.parse(raw) : [];
};

const saveWishlist = (items) => {
  localStorage.setItem(storageKeys.wishlist, JSON.stringify(items));
};

const getChats = () => {
  const raw = localStorage.getItem(storageKeys.chats);
  return raw ? JSON.parse(raw) : {};
};

const saveChats = (chats) => {
  localStorage.setItem(storageKeys.chats, JSON.stringify(chats));
};

const formatPrice = (value) => `${value.toLocaleString('ko-KR')}원`;
const statusMap = {
  available: { label: '거래 가능', className: 'available' },
  reserved: { label: '예약 중', className: 'reserved' },
  sold: { label: '거래 완료', className: 'sold' }
};

const gaJwaBuildings = ['정문', '후문', '도서관', '느티마루', '공학5호관', '아람관', '월계관'];
const otherCampusBuildings = ['정문', '후문', '도서관'];

const setBuildingOptions = (campusValue) => {
  if (!buildingInput) return;
  const options = campusValue === '가좌 캠퍼스' || !campusValue ? gaJwaBuildings : otherCampusBuildings;
  const current = buildingInput.value;
  buildingInput.innerHTML = '<option value=\"\">선택</option>' +
    options.map((opt) => `<option value=\"${opt}\">${opt}</option>`).join('');
  if (options.includes(current)) {
    buildingInput.value = current;
  }
};

const normalizeListing = (item) => ({
  ...item,
  status: item.status || 'available',
  campus: item.campus || '가좌 캠퍼스',
  building: item.building || '정문',
  image: item.image || ''
});

const buildListingData = () => {
  const custom = getStoredListings()
    .map((item) => normalizeListing(item))
    .filter((item) => item.image && item.image.trim().length > 0);
  const base = baseListings.map((item) => normalizeListing(item));
  return [...custom, ...base];
};

const renderListings = () => {
  const query = searchInput.value.trim().toLowerCase();
  const campus = campusFilter.value;
  const category = categoryFilter.value;
  const building = buildingFilter.value;
  const sort = sortFilter.value;
  const wishlist = getWishlist();

  let listings = buildListingData().filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.building.toLowerCase().includes(query) ||
      item.campus.toLowerCase().includes(query);
    const matchesCampus = campus === 'all' || item.campus === campus;
    const matchesCategory = category === 'all' || item.category === category;
    const matchesBuilding = building === 'all' || item.building === building;
    const matchesWish = !wishOnly.checked || wishlist.includes(item.id);

    return matchesQuery && matchesCampus && matchesCategory && matchesBuilding && matchesWish;
  });

  if (sort === 'price-low') {
    listings = listings.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    listings = listings.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular') {
    listings = listings.sort((a, b) => b.likes - a.likes);
  } else {
    listings = listings.sort((a, b) => b.createdAt - a.createdAt);
  }

  listingGrid.innerHTML = '';

  listings.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    const statusInfo = statusMap[item.status] || statusMap.available;
    card.innerHTML = `
      <div class="thumb">${item.image ? `<img src="${item.image}" alt="${item.title}">` : item.category}</div>
      <div class="status-chip ${statusInfo.className}">${statusInfo.label}</div>
      <div class="badges">
        <span class="badge">${item.campus}</span>
        <span class="badge">${item.building}</span>
        <span class="badge">${item.condition}</span>
      </div>
      <h3>${item.title}</h3>
      <p class="price">${formatPrice(item.price)}</p>
      <p>판매자: ${item.seller}</p>
      <div class="card-actions">
        <button class="ghost" data-detail="${item.id}">상세 보기</button>
        <button class="ghost" data-chat="${item.id}">채팅</button>
        <button class="wish ${wishlist.includes(item.id) ? 'active' : ''}" data-wish="${item.id}">
          ${wishlist.includes(item.id) ? '찜 해제' : '찜'}
        </button>
      </div>
    `;
    listingGrid.appendChild(card);
  });

  resultCount.textContent = listings.length;
  wishCount.textContent = wishlist.length;
};

const toggleWishlist = (id) => {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(id);
  if (index === -1) {
    wishlist.push(id);
  } else {
    wishlist.splice(index, 1);
  }
  saveWishlist(wishlist);
  renderListings();
};

const openModal = (id) => {
  const item = buildListingData().find((listing) => listing.id === id);
  if (!item) return;

  const wishlist = getWishlist();
  const wished = wishlist.includes(id);
  const statusInfo = statusMap[item.status] || statusMap.available;

  modalContent.innerHTML = `
    <h3>${item.title}</h3>
    <p class="price">${formatPrice(item.price)}</p>
    <div class="meta">
      <span>${statusInfo.label}</span>
      <span>${item.campus}</span>
      <span>${item.category}</span>
      <span>${item.building}</span>
      <span>${item.condition}</span>
    </div>
    ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width:100%;border-radius:12px;margin:10px 0 8px;" />` : ''}
    <p>${item.description}</p>
    <p>판매자: ${item.seller}</p>
    <div class="card-actions">
      <button class="primary" data-modal-wish="${item.id}">
        ${wished ? '찜 해제' : '찜하기'}
      </button>
      <button class="ghost" data-chat="${item.id}">채팅하기</button>
      <button class="ghost" data-close="modal">닫기</button>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
};

const renderChat = (id) => {
  const chats = getChats();
  const thread = chats[id] || [];
  chatThread.innerHTML = '';

  thread.forEach((msg) => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${msg.from}`;
    bubble.innerHTML = `
      <div>${msg.text}</div>
      <div class="chat-meta">${msg.time}</div>
    `;
    chatThread.appendChild(bubble);
  });

  chatThread.scrollTop = chatThread.scrollHeight;
};

const openChatModal = (id) => {
  const item = buildListingData().find((listing) => listing.id === id);
  if (!item) return;
  activeChatId = id;
  chatTitle.textContent = `${item.title} 채팅`;
  renderChat(id);
  chatModal.classList.add('active');
  chatModal.setAttribute('aria-hidden', 'false');
};

const closeChatModal = () => {
  chatModal.classList.remove('active');
  chatModal.setAttribute('aria-hidden', 'true');
  activeChatId = null;
};

const openLoginModal = () => {
  if (!loginModal) return;
  loginModal.classList.add('active');
  loginModal.setAttribute('aria-hidden', 'false');
};

const closeLoginModal = () => {
  if (!loginModal) return;
  loginModal.classList.remove('active');
  loginModal.setAttribute('aria-hidden', 'true');
};

listingGrid.addEventListener('click', (event) => {
  const detailId = event.target.getAttribute('data-detail');
  const wishId = event.target.getAttribute('data-wish');
  const chatId = event.target.getAttribute('data-chat');

  if (detailId) {
    openModal(detailId);
  }
  if (wishId) {
    toggleWishlist(wishId);
  }
  if (chatId) {
    openChatModal(chatId);
  }
});

modal.addEventListener('click', (event) => {
  if (event.target.dataset.close === 'modal') {
    closeModal();
  }
  if (event.target.dataset.modalWish) {
    toggleWishlist(event.target.dataset.modalWish);
    openModal(event.target.dataset.modalWish);
  }
  if (event.target.dataset.chat) {
    openChatModal(event.target.dataset.chat);
  }
});

if (chatModal) {
  chatModal.addEventListener('click', (event) => {
    if (event.target.dataset.close === 'chat') {
      closeChatModal();
    }
  });
}

if (chatForm) {
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!activeChatId) return;

    const text = chatInput.value.trim();
    if (!text) return;

    const chats = getChats();
    const thread = chats[activeChatId] || [];
    thread.push({
      from: 'me',
      text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    });

    thread.push({
      from: 'them',
      text: '네! 지금 확인 중입니다. 거래 가능 시간 알려주세요.',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    });

    chats[activeChatId] = thread;
    saveChats(chats);
    chatInput.value = '';
    renderChat(activeChatId);
  });
}

if (openLogin) {
  openLogin.addEventListener('click', openLoginModal);
}

if (loginModal) {
  loginModal.addEventListener('click', (event) => {
    if (event.target.dataset.close === 'login') {
      closeLoginModal();
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setAuthed(true);
    loginStatus.textContent = '학생 인증이 완료되었습니다. 마켓 이용이 가능합니다.';
    loginStatus.style.color = '#2f4f4f';
    setTimeout(() => {
      closeLoginModal();
      loginForm.reset();
      loginStatus.textContent = '인증 요청은 데모용으로 즉시 완료됩니다.';
      loginStatus.style.color = '';
    }, 1200);
  });
}

if (imageInput && imagePreview) {
  imageInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      imagePreview.innerHTML = '<span>이미지 미리보기</span>';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.innerHTML = `<img src="${reader.result}" alt="미리보기" />`;
    };
    reader.readAsDataURL(file);
  });
}

[campusInput].forEach((el) => {
  if (!el) return;
  el.addEventListener('change', () => setBuildingOptions(el.value));
});

[campusFilter, searchInput, categoryFilter, buildingFilter, sortFilter, wishOnly].forEach((el) => {
  el.addEventListener('input', renderListings);
  el.addEventListener('change', renderListings);
});

resetFilters.addEventListener('click', () => {
  searchInput.value = '';
  campusFilter.value = 'all';
  categoryFilter.value = 'all';
  buildingFilter.value = 'all';
  sortFilter.value = 'latest';
  wishOnly.checked = false;
  renderListings();
});

openForm.addEventListener('click', () => {
  formPanel.classList.add('active');
  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

closeForm.addEventListener('click', () => {
  formPanel.classList.remove('active');
});

listingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newListing = {
    id: `u-${Date.now()}`,
    title: document.getElementById('titleInput').value.trim(),
    price: Number(document.getElementById('priceInput').value),
    category: document.getElementById('categoryInput').value,
    campus: document.getElementById('campusInput').value,
    building: document.getElementById('buildingInput').value,
    condition: document.getElementById('conditionInput').value,
    seller: document.getElementById('sellerInput').value.trim(),
    description: document.getElementById('descInput').value.trim(),
    image: imagePreview && imagePreview.querySelector('img') ? imagePreview.querySelector('img').src : '',
    createdAt: Date.now(),
    likes: 0
  };

  const stored = getStoredListings();
  stored.unshift(newListing);
  saveListings(stored);
  listingForm.reset();
  if (imagePreview) {
    imagePreview.innerHTML = '<span>이미지 미리보기</span>';
  }
  formPanel.classList.remove('active');
  renderListings();
});

setAuthed(isAuthed());
if (!isAuthed()) {
  openLoginModal();
}
setBuildingOptions(campusInput ? campusInput.value : '');
renderListings();



