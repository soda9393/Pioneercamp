const sections = {
  home: document.getElementById('home'),
  used: document.getElementById('used')
};

const pageBody = document.body;
const navButtons = document.querySelectorAll('[data-nav]');
const tiles = document.querySelectorAll('[data-tile]');
const backHome = document.getElementById('backHome');

pageBody.classList.add('home-active');

const switchSection = (target) => {
  if (target === 'used') {
    window.location.href = 'jj/index.html';
    return;
  }
  Object.values(sections).forEach((section) => section.classList.remove('active'));
  sections[target].classList.add('active');
  pageBody.classList.toggle('home-active', target === 'home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => switchSection(button.dataset.nav));
});

if (backHome) {
  backHome.addEventListener('click', () => switchSection('home'));
}

tiles.forEach((tile) => {
  tile.addEventListener('click', () => {
    if (tile.dataset.tile === 'used') {
      switchSection('used');
    }
    if (tile.dataset.tile === 'funding') {
      window.location.href = 'uu/index.html';
    }
    if (tile.dataset.tile === 'service') {
      window.location.href = 'ss/index.html';
    }
  });
});

const baseListings = [
  {
    id: 'b1',
    title: '라즈베리파이 4B 풀세트',
    price: 68000,
    category: '디지털',
    building: '공학관',
    condition: '거의 새 것',
    seller: '메이커룸',
    description: 'SD카드와 케이스 포함, 강의용으로 2회 사용했습니다.',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    likes: 24
  },
  {
    id: 'b2',
    title: '전기회로 교재 3판',
    price: 12000,
    category: '교재',
    building: '중앙도서관',
    condition: '사용감 있음',
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
    building: '운동장',
    condition: '거의 새 것',
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
    building: '기숙사',
    condition: '사용감 있음',
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
    building: '학생회관',
    condition: '거의 새 것',
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
    building: '학생회관',
    condition: '새상품',
    seller: '그린루프',
    description: '선물 받았는데 사용하지 않아 판매합니다.',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    likes: 18
  }
];

const listingGrid = document.getElementById('listingGrid');
const resultCount = document.getElementById('resultCount');
const wishCount = document.getElementById('wishCount');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const buildingFilter = document.getElementById('buildingFilter');
const sortFilter = document.getElementById('sortFilter');
const wishOnly = document.getElementById('wishOnly');
const resetFilters = document.getElementById('resetFilters');

const modal = document.getElementById('detailModal');
const modalContent = document.getElementById('modalContent');
const loginModal = document.getElementById('loginModal');
const loginButton = document.querySelector('[data-open="login"]');

const formPanel = document.getElementById('formPanel');
const openForm = document.getElementById('openForm');
const closeForm = document.getElementById('closeForm');
const listingForm = document.getElementById('listingForm');

const storageKeys = {
  listings: 'campusListings',
  wishlist: 'campusWishlist'
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

const formatPrice = (value) => `${value.toLocaleString('ko-KR')}원`;

const buildListingData = () => {
  const custom = getStoredListings();
  return [...custom, ...baseListings];
};

const renderListings = () => {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const building = buildingFilter.value;
  const sort = sortFilter.value;
  const wishlist = getWishlist();

  let listings = buildListingData().filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.building.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || item.category === category;
    const matchesBuilding = building === 'all' || item.building === building;
    const matchesWish = !wishOnly.checked || wishlist.includes(item.id);

    return matchesQuery && matchesCategory && matchesBuilding && matchesWish;
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
    card.innerHTML = `
      <div class="thumb">${item.category}</div>
      <div class="badges">
        <span class="badge">${item.building}</span>
        <span class="badge">${item.condition}</span>
      </div>
      <h3>${item.title}</h3>
      <p class="price">${formatPrice(item.price)}</p>
      <p>판매자: ${item.seller}</p>
      <div class="card-actions">
        <button class="ghost" data-detail="${item.id}">상세 보기</button>
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

  modalContent.innerHTML = `
    <h3>${item.title}</h3>
    <p class="price">${formatPrice(item.price)}</p>
    <div class="meta">
      <span>${item.category}</span>
      <span>${item.building}</span>
      <span>${item.condition}</span>
    </div>
    <p>${item.description}</p>
    <p>판매자: ${item.seller}</p>
    <div class="card-actions">
      <button class="primary" data-modal-wish="${item.id}">
        ${wished ? '찜 해제' : '찜하기'}
      </button>
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

if (loginButton) {
  loginButton.addEventListener('click', () => {
    window.location.href = 'll/index.html';
  });
}

listingGrid.addEventListener('click', (event) => {
  const detailId = event.target.getAttribute('data-detail');
  const wishId = event.target.getAttribute('data-wish');

  if (detailId) {
    openModal(detailId);
  }
  if (wishId) {
    toggleWishlist(wishId);
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
});

if (loginModal) {
  loginModal.addEventListener('click', (event) => {
    if (event.target.dataset.close === 'login') {
      closeLoginModal();
    }
  });
}

[searchInput, categoryFilter, buildingFilter, sortFilter, wishOnly].forEach((el) => {
  el.addEventListener('input', renderListings);
  el.addEventListener('change', renderListings);
});

resetFilters.addEventListener('click', () => {
  searchInput.value = '';
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
    building: document.getElementById('buildingInput').value,
    condition: document.getElementById('conditionInput').value,
    seller: document.getElementById('sellerInput').value.trim(),
    description: document.getElementById('descInput').value.trim(),
    createdAt: Date.now(),
    likes: 0
  };

  const stored = getStoredListings();
  stored.unshift(newListing);
  saveListings(stored);
  listingForm.reset();
  formPanel.classList.remove('active');
  renderListings();
});

renderListings();
