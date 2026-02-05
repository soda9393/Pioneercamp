// 응모 품목은 여기서 직접 수정하세요.
const fundingItems = [
  { title: "무선 이어폰", max: 80, current: 62, image: "에어팟 프로3.webp" },
  { title: "보조배터리", max: 60, current: 60, image: "보조배터리.jpg" },
  {
    title: "스마트워치",
    max: 50,
    current: 41,
    image: "스마트워치.avif",
    imagePosition: "center 30%",
  },
  { title: "블루투스 스피커", max: 100, current: 88, image: "블루투스 스피커.jpg" },
  { title: "헤어 드라이기", max: 70, current: 70, image: "헤어 드라이기.jpg" },
];

const grid = document.getElementById("fundingGrid");
const template = document.getElementById("fundingCardTemplate");
const entryDialog = document.getElementById("entryDialog");
const entryDialogClose = document.getElementById("entryDialogClose");
const entryDialogCancel = document.getElementById("entryDialogCancel");
const entryForm = entryDialog.querySelector("form");
const ticketSelect = document.getElementById("ticketCount");
const phoneInput = document.getElementById("phoneNumber");
const voteDialog = document.getElementById("voteDialog");
const voteDialogClose = document.getElementById("voteDialogClose");
const voteDialogCancel = document.getElementById("voteDialogCancel");
const openVoteDialog = document.getElementById("openVoteDialog");
const voteActions = document.getElementById("voteActions");
const voteItems = document.getElementById("voteItems");
const voteItemInput = document.getElementById("voteItem");
const voteStatus = document.getElementById("voteStatus");
const voteEdit = document.getElementById("voteEdit");
const voteForm = voteDialog.querySelector("form");
const voteMine = document.getElementById("voteMine");
const voteDeadlineDays = document.getElementById("voteDeadlineDays");
const voteDeadlineFill = document.getElementById("voteDeadlineFill");
const voteDeadlineText = document.getElementById("voteDeadlineText");
const extraBox = document.getElementById("extraBox");
const purchaseDialog = document.getElementById("purchaseDialog");
const purchaseForm = document.getElementById("purchaseForm");
const purchaseDialogClose = document.getElementById("purchaseDialogClose");
const purchaseDialogCancel = document.getElementById("purchaseDialogCancel");
const purchaseAlertDialog = document.getElementById("purchaseAlertDialog");
const purchaseAlertClose = document.getElementById("purchaseAlertClose");
const openPurchaseDialog = document.getElementById("openPurchaseDialog");
const ticketOptions = document.querySelectorAll(".ticket-option");
const purchaseAmount = document.getElementById("purchaseAmount");
const purchaseSummary = document.getElementById("purchaseSummary");
const purchaseRemaining = document.getElementById("purchaseRemaining");
const entryRemaining = document.getElementById("entryRemaining");
const paymentMethodInputs = document.querySelectorAll('input[name="paymentMethod"]');
const paymentMethodLabels = document.querySelectorAll(".payment-method");
const paymentSections = document.querySelectorAll(".payment-section");
const resultDialog = document.getElementById("resultDialog");
const resultDialogClose = document.getElementById("resultDialogClose");
const resultDialogBody = document.getElementById("resultDialogBody");

let activeCard = null;
let activeIndex = null;
let hasVoted = false;
let lastVoteId = null;
let lastEntryPhone = "";
let lastPurchaseCount = 0;
let remainingTickets = 0;
let purchaseAvailable = 10;

const voteData = [
  { id: 1, name: "노이즈캔슬링 이어폰", likes: 22, dislikes: 3, voted: null },
  { id: 2, name: "노트북 거치대", likes: 18, dislikes: 2, voted: null },
  { id: 3, name: "캠퍼스 텀블러", likes: 14, dislikes: 1, voted: null },
  { id: 4, name: "보조배터리", likes: 11, dislikes: 4, voted: null },
  { id: 5, name: "블루투스 마우스", likes: 7, dislikes: 1, voted: null },
  { id: 6, name: "독서 스탠드", likes: 5, dislikes: 0, voted: null },
];

const updateVoteDeadline = () => {
  if (!openVoteDialog || !voteDeadlineDays || !voteDeadlineFill || !voteDeadlineText) {
    return;
  }

  const startAttr = openVoteDialog.dataset.voteStart;
  const durationDays = Number(openVoteDialog.dataset.voteDuration) || 30;
  const safeDuration = Math.max(1, durationDays);
  const scale = safeDuration / 30;
  openVoteDialog.style.setProperty("--vote-bar-scale", `${scale}`);
  const parsedStart = startAttr ? new Date(`${startAttr}T00:00:00`) : new Date();
  const startDate = Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
  const totalMs = safeDuration * 24 * 60 * 60 * 1000;
  const endDate = new Date(startDate.getTime() + totalMs);
  const now = new Date();

  const remainingMs = endDate.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  const remainingPercent = Math.max(
    0,
    Math.min(100, Math.round((remainingMs / totalMs) * 100))
  );

  voteDeadlineDays.textContent = `${remainingDays}일`;
  voteDeadlineFill.style.width = `${remainingPercent}%`;

  if (remainingMs <= 0) {
    voteDeadlineText.textContent = "마감되었습니다";
  } else {
    voteDeadlineText.textContent = `남은 기간 ${remainingDays}일 / ${safeDuration}일`;
  }
};

const openPurchaseDialogHandler = () => {
  if (typeof purchaseDialog.showModal === "function") {
    purchaseDialog.showModal();
  } else {
    purchaseDialog.setAttribute("open", "");
  }
};

const closePurchaseDialogHandler = () => {
  purchaseDialog.close();
};

const openPurchaseAlert = () => {
  if (!purchaseAlertDialog) {
    alert("모든 항목을 입력해주세요.");
    return;
  }
  if (typeof purchaseAlertDialog.showModal === "function") {
    purchaseAlertDialog.showModal();
  } else {
    purchaseAlertDialog.setAttribute("open", "");
  }
};

const formatCurrency = (value) => value.toLocaleString("ko-KR");

const updatePurchaseUI = () => {
  if (!purchaseAmount || !purchaseSummary || !purchaseRemaining) {
    return;
  }
  const clamped = Math.min(10, Math.max(0, lastPurchaseCount));
  const total = clamped * 1000;
  purchaseRemaining.textContent = `잔여 구매 가능: ${purchaseAvailable}장`;
  purchaseSummary.textContent = `내 잔여 응모권: ${remainingTickets}장`;
  ticketOptions.forEach((btn) => {
    const value = Number(btn.dataset.value) || 0;
    btn.disabled = value > purchaseAvailable;
  });
  if (purchaseAvailable <= 0) {
    purchaseAmount.textContent = "0원";
    if (purchaseForm) {
      purchaseForm.querySelector(".dialog-primary").disabled = true;
    }
    openPurchaseDialog.disabled = true;
    openPurchaseDialog.classList.add("done");
    ticketOptions.forEach((btn) => {
      btn.disabled = true;
      btn.classList.remove("is-selected");
    });
    return;
  }
  if (clamped < 1) {
    purchaseAmount.textContent = "0원";
    if (purchaseForm) {
      purchaseForm.querySelector(".dialog-primary").disabled = true;
    }
    ticketOptions.forEach((btn) => btn.classList.remove("is-selected"));
    return;
  }
  purchaseAmount.textContent = `${formatCurrency(total)}원`;
  if (purchaseForm) {
    purchaseForm.querySelector(".dialog-primary").disabled = false;
  }
};

const updateEntryTicketOptions = () => {
  if (!ticketSelect || !entryRemaining) {
    return;
  }
  entryRemaining.textContent = `내 잔여 응모권: ${remainingTickets}장`;
  Array.from(ticketSelect.options).forEach((option) => {
    const value = Number(option.value);
    if (!Number.isNaN(value)) {
      option.disabled = value > remainingTickets;
    }
  });
  if (remainingTickets <= 0) {
    ticketSelect.value = "";
  }
};

const updatePaymentMethod = (value) => {
  paymentMethodLabels.forEach((label) => {
    const input = label.querySelector('input[name="paymentMethod"]');
    if (input && input.value === value) {
      label.classList.add("is-active");
    } else {
      label.classList.remove("is-active");
    }
  });
  paymentSections.forEach((section) => {
    if (section.dataset.method === value) {
      section.classList.add("is-active");
    } else {
      section.classList.remove("is-active");
    }
  });
};

const syncVoteActionsWidth = () => {
  if (!voteActions || !grid) {
    return;
  }
  const card = grid.querySelector(".funding-card");
  if (!card) {
    return;
  }
  const cardWidth = card.getBoundingClientRect().width;
  const gridStyles = getComputedStyle(grid);
  const gapValue = gridStyles.columnGap || gridStyles.gap || "0px";
  const gap = Number.parseFloat(gapValue) || 0;
  const width = cardWidth * 2 + gap;
  voteActions.style.width = `${width}px`;
};

const renderVoteItems = () => {
  voteItems.innerHTML = "";
  const sorted = [...voteData].sort((a, b) => b.likes - a.likes);
  sorted.forEach((item) => {
    const row = document.createElement("div");
    row.className = "vote-item";

    const name = document.createElement("div");
    name.className = "vote-item-name";
    name.textContent = item.name;

    const actions = document.createElement("div");
    actions.className = "vote-actions";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = "vote-button";
    likeBtn.innerHTML = `좋아요 <span class="vote-count">${item.likes}</span>`;
    if (item.voted === "like") {
      likeBtn.classList.add("selected-like");
    }
    likeBtn.addEventListener("click", () => {
      if (item.voted === "like") {
        item.likes = Math.max(0, item.likes - 1);
        item.voted = null;
        renderVoteItems();
        return;
      }
      if (item.voted === "dislike") {
        item.dislikes = Math.max(0, item.dislikes - 1);
      }
      item.likes += 1;
      item.voted = "like";
      renderVoteItems();
    });

    const dislikeBtn = document.createElement("button");
    dislikeBtn.type = "button";
    dislikeBtn.className = "vote-button";
    dislikeBtn.innerHTML = `싫어요 <span class="vote-count">${item.dislikes}</span>`;
    if (item.voted === "dislike") {
      dislikeBtn.classList.add("selected-dislike");
    }
    dislikeBtn.addEventListener("click", () => {
      if (item.voted === "dislike") {
        item.dislikes = Math.max(0, item.dislikes - 1);
        item.voted = null;
        renderVoteItems();
        return;
      }
      if (item.voted === "like") {
        item.likes = Math.max(0, item.likes - 1);
      }
      item.dislikes += 1;
      item.voted = "dislike";
      renderVoteItems();
    });

    actions.appendChild(likeBtn);
    actions.appendChild(dislikeBtn);

    row.appendChild(name);
    row.appendChild(actions);
    voteItems.appendChild(row);
  });
};

const openEntryDialog = () => {
  updateEntryTicketOptions();
  if (typeof entryDialog.showModal === "function") {
    entryDialog.showModal();
  } else {
    entryDialog.setAttribute("open", "");
  }
};

const closeEntryDialog = () => {
  entryDialog.close();
  entryForm.reset();
  activeCard = null;
  activeIndex = null;
};

entryDialogClose.addEventListener("click", closeEntryDialog);
entryDialogCancel.addEventListener("click", closeEntryDialog);

const openVoteDialogHandler = () => {
  if (typeof voteDialog.showModal === "function") {
    voteDialog.showModal();
  } else {
    voteDialog.setAttribute("open", "");
  }
};

const closeVoteDialogHandler = () => {
  voteDialog.close();
};

openVoteDialog.addEventListener("click", openVoteDialogHandler);
voteDialogClose.addEventListener("click", closeVoteDialogHandler);
voteDialogCancel.addEventListener("click", closeVoteDialogHandler);

const ensureWinner = (item) => {
  if (item.winner) {
    return;
  }
  const participants = item.participants || [];
  if (participants.length === 0) {
    if (item.current >= item.max) {
      const makeSeed = (text) =>
        Array.from(text).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const seed = makeSeed(item.title);
      const part1 = String((seed * 37) % 10000).padStart(4, "0");
      const part2 = String((seed * 91) % 10000).padStart(4, "0");
      item.winner = { phone: `010-${part1}-${part2}`, tickets: 1 };
    }
    return;
  }
  item.winner = participants[Math.floor(Math.random() * participants.length)];
};

const openResultDialog = (item) => {
  const participants = item.participants || [];
  const hasEntry = participants.some((p) => p.phone === lastEntryPhone);
  ensureWinner(item);
  const winner = item.winner || null;

  const maskPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      return phone;
    }
    const head = digits.slice(0, 3);
    const tail = digits.slice(-4);
    return `${head}-****-${tail}`;
  };

  resultDialogBody.innerHTML = "";

  const line1 = document.createElement("div");
  line1.className = "field-label";
  line1.textContent = `품목: ${item.title}`;

  const line2 = document.createElement("div");
  line2.className = "field-label";
  line2.textContent = winner
    ? `당첨자: ${maskPhone(winner.phone)}`
    : "당첨자: 아직 없음";

  const line3 = document.createElement("div");
  line3.className = "field-label";
  if (!hasEntry) {
    line3.textContent = "내 결과: 응모 기록 없음";
  } else if (winner && winner.phone === lastEntryPhone) {
    line3.textContent = "내 결과: 당첨";
  } else if (winner) {
    line3.textContent = "내 결과: 미당첨";
  } else {
    line3.textContent = "내 결과: 확인 불가";
  }

  resultDialogBody.appendChild(line1);
  resultDialogBody.appendChild(line2);
  resultDialogBody.appendChild(line3);

  if (typeof resultDialog.showModal === "function") {
    resultDialog.showModal();
  } else {
    resultDialog.setAttribute("open", "");
  }
};

resultDialogClose.addEventListener("click", () => resultDialog.close());
openPurchaseDialog.addEventListener("click", openPurchaseDialogHandler);
purchaseDialogClose.addEventListener("click", closePurchaseDialogHandler);
purchaseDialogCancel.addEventListener("click", closePurchaseDialogHandler);
purchaseAlertClose.addEventListener("click", () => purchaseAlertDialog.close());
ticketOptions.forEach((button) => {
  button.addEventListener("click", () => {
    const value = Number(button.dataset.value) || 0;
    if (value > purchaseAvailable) {
      return;
    }
    lastPurchaseCount = value;
    ticketOptions.forEach((btn) => btn.classList.remove("is-selected"));
    button.classList.add("is-selected");
    updatePurchaseUI();
  });
});
paymentMethodInputs.forEach((input) => {
  input.addEventListener("change", () => updatePaymentMethod(input.value));
});
purchaseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const count = lastPurchaseCount;
  if (count < 1 || count > purchaseAvailable) {
    return;
  }
  const methodInput = Array.from(paymentMethodInputs).find((input) => input.checked);
  const method = methodInput ? methodInput.value : "";
  let isValid = true;
  if (method === "card") {
    const cardNumber = document.getElementById("cardNumber");
    const cardExpiry = document.getElementById("cardExpiry");
    const cardCvc = document.getElementById("cardCvc");
    const cardHolder = document.getElementById("cardHolder");
    isValid =
      Boolean(cardNumber?.value.trim()) &&
      Boolean(cardExpiry?.value.trim()) &&
      Boolean(cardCvc?.value.trim()) &&
      Boolean(cardHolder?.value.trim());
  } else if (method === "bank") {
    const bankName = document.getElementById("bankName");
    const bankOwner = document.getElementById("bankOwner");
    isValid = Boolean(bankName?.value) && Boolean(bankOwner?.value.trim());
  } else {
    isValid = false;
  }
  if (!isValid) {
    openPurchaseAlert();
    return;
  }
  remainingTickets += count;
  purchaseAvailable = Math.max(0, purchaseAvailable - count);
  lastPurchaseCount = 0;
  ticketOptions.forEach((btn) => btn.classList.remove("is-selected"));
  updatePurchaseUI();
  closePurchaseDialogHandler();
});
purchaseDialog.addEventListener("close", () => {
  ticketOptions.forEach((btn) => btn.classList.toggle("is-selected", Number(btn.dataset.value) === lastPurchaseCount));
  updatePurchaseUI();
});

voteDialog.addEventListener("close", () => {
  voteItemInput.value = "";
});

const updateVoteFormState = () => {
  const isLocked = hasVoted;
  voteItemInput.disabled = isLocked;
  voteForm.querySelector(".dialog-primary").disabled = isLocked;
  voteStatus.hidden = !isLocked;
  voteEdit.hidden = !isLocked;
  if (isLocked && lastVoteId !== null) {
    const mine = voteData.find((item) => item.id === lastVoteId);
    if (mine) {
      voteMine.textContent = `내 추천: ${mine.name}`;
      voteMine.hidden = false;
    }
  } else {
    voteMine.hidden = true;
  }
};

voteEdit.addEventListener("click", () => {
  if (lastVoteId !== null) {
    const index = voteData.findIndex((item) => item.id === lastVoteId);
    if (index !== -1) {
      voteData.splice(index, 1);
    }
  }
  hasVoted = false;
  lastVoteId = null;
  voteItemInput.disabled = false;
  voteItemInput.value = "";
  updateVoteFormState();
  renderVoteItems();
});

voteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (hasVoted) {
    return;
  }
  const name = voteItemInput.value.trim();
  if (!name) {
    return;
  }
  const id = Date.now();
  voteData.push({ id, name, likes: 0, dislikes: 0, voted: null });
  hasVoted = true;
  lastVoteId = id;
  renderVoteItems();
  updateVoteFormState();
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (activeCard === null || activeIndex === null) {
    return;
  }

  const ticketCount = Number(ticketSelect.value);
  if (!ticketCount || ticketCount < 1 || ticketCount > 10 || ticketCount > remainingTickets) {
    return;
  }

  const phone = phoneInput.value.trim();
  if (!phone) {
    return;
  }

  const item = fundingItems[activeIndex];
  item.current = Math.min(item.max, item.current + ticketCount);
  item.participants = item.participants || [];
  item.participants.push({ phone, tickets: ticketCount });
  lastEntryPhone = phone;
  remainingTickets = Math.max(0, remainingTickets - ticketCount);

  const meta = activeCard.querySelector(".card-meta");
  const fill = activeCard.querySelector(".progress-fill");
  const progressText = activeCard.querySelector(".progress-text");
  const joinButton = activeCard.querySelector(".join-button");

  const percent = Math.min(100, Math.round((item.current / item.max) * 100));
  meta.textContent = `${item.current}/${item.max}`;
  fill.style.width = `${percent}%`;
  progressText.textContent = `진행률 ${percent}%`;

  joinButton.disabled = true;
  joinButton.classList.add("done");
  joinButton.textContent = "응모 완료";

  if (item.current >= item.max) {
    activeCard.classList.add("completed");
    joinButton.textContent = "마감";
    ensureWinner(item);
  }

closeEntryDialog();
  updatePurchaseUI();
  updateEntryTicketOptions();
});

fundingItems.forEach((item) => {
  const card = template.content.firstElementChild.cloneNode(true);
  const title = card.querySelector(".card-title");
  const meta = card.querySelector(".card-meta");
  const image = card.querySelector(".product-image");
  const placeholder = card.querySelector(".image-placeholder");
  const fill = card.querySelector(".progress-fill");
  const progressText = card.querySelector(".progress-text");
  const joinButton = card.querySelector(".join-button");

  const percent = Math.min(100, Math.round((item.current / item.max) * 100));
  const isCompleted = item.current >= item.max;

  title.textContent = item.title;
  meta.textContent = `${item.current}/${item.max}`;
  if (image) {
    if (item.image) {
      image.src = item.image;
      image.alt = item.title;
      image.style.display = "block";
      image.style.objectPosition = item.imagePosition || "";
      if (placeholder) {
        placeholder.style.display = "none";
      }
    } else {
      image.style.display = "none";
      if (placeholder) {
        placeholder.style.display = "inline-block";
      }
    }
  }
  fill.style.width = `${percent}%`;
  progressText.textContent = `진행률 ${percent}%`;

  if (isCompleted) {
    ensureWinner(item);
    card.classList.add("completed");
    joinButton.disabled = true;
    joinButton.textContent = "마감";
  } else {
    joinButton.addEventListener("click", () => {
      activeCard = card;
      activeIndex = fundingItems.indexOf(item);
      openEntryDialog();
    });
  }

  const overlay = card.querySelector(".overlay");
  overlay.addEventListener("click", () => {
    if (item.current >= item.max) {
      openResultDialog(item);
    }
  });

  grid.appendChild(card);
});

renderVoteItems();
updateVoteFormState();
updateVoteDeadline();
syncVoteActionsWidth();
window.addEventListener("resize", syncVoteActionsWidth);
updatePurchaseUI();
updateEntryTicketOptions();
const checkedMethod = Array.from(paymentMethodInputs).find((input) => input.checked);
updatePaymentMethod(checkedMethod ? checkedMethod.value : "");
