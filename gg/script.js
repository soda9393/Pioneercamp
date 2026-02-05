const panels = Array.from(document.querySelectorAll(".rule-panel"));
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageNow = document.getElementById("pageNow");

let currentIndex = 0;

const updateView = () => {
    panels.forEach((panel, index) => {
        panel.classList.toggle("is-active", index === currentIndex);
    });
    pageNow.textContent = String(currentIndex + 1);
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === panels.length - 1;
};

prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex -= 1;
        updateView();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < panels.length - 1) {
        currentIndex += 1;
        updateView();
    }
});

updateView();
