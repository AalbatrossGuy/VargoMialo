document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

const themeToggle = document.getElementById("theme-toggle");
const themeThumb = themeToggle.querySelector(".theme-toggle-thumb");
const root = document.documentElement;

function setThemeIcon(theme) {
    themeThumb.innerHTML = theme === "dark" ? "&#9728;" : "&#9789;";
}

setThemeIcon(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

themeToggle.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
        root.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        setThemeIcon("light");
    } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        setThemeIcon("dark");
    }
});

const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector(".lightbox-img");
const lightboxClose = lightbox.querySelector(".lightbox-close");

function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
}

document.querySelectorAll(".fullscreen-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const img = btn.previousElementSibling;
        openLightbox(img);
    });
});

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
    }
});

function letterboxGap(slide) {
    const img = slide.querySelector("img");
    if (!img || !img.naturalWidth || !img.naturalHeight) return 0;
    const cw = slide.clientWidth;
    const ch = slide.clientHeight;
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const renderedHeight = img.naturalHeight * scale;
    return Math.max(0, (ch - renderedHeight) / 2);
}

function pinOverlayToImage(slide) {
    const gap = letterboxGap(slide);
    const btn = slide.querySelector(".fullscreen-btn");
    if (btn) btn.style.bottom = gap + 10 + "px";
    return gap;
}

function initCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector(".carousel-arrow--prev");
    const nextBtn = carousel.querySelector(".carousel-arrow--next");
    const dotsWrap = carousel.querySelector(".carousel-dots");

    if (slides.length <= 1) {
        prevBtn.hidden = true;
        nextBtn.hidden = true;
        dotsWrap.hidden = true;
        return;
    }

    const dots = slides.map((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Go to image " + (i + 1));
        dot.addEventListener("click", () => scrollToSlide(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    slides.forEach((slide) => {
        const img = slide.querySelector("img");
        if (!img) return;
        if (img.complete && img.naturalWidth) {
            pinOverlayToImage(slide);
        } else {
            img.addEventListener("load", () => {
                pinOverlayToImage(slide);
                updateUI();
            });
        }
    });

    function currentIndex() {
        return Math.round(track.scrollLeft / track.clientWidth);
    }

    function scrollToSlide(i) {
        track.scrollTo({ left: slides[i].offsetLeft, behavior: "smooth" });
    }

    function updateUI() {
        const index = currentIndex();
        dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
        prevBtn.style.visibility = index === 0 ? "hidden" : "visible";
        nextBtn.style.visibility = index === slides.length - 1 ? "hidden" : "visible";
        dotsWrap.style.bottom = pinOverlayToImage(slides[index]) + 14 + "px";
    }

    prevBtn.addEventListener("click", () => scrollToSlide(Math.max(0, currentIndex() - 1)));
    nextBtn.addEventListener("click", () => scrollToSlide(Math.min(slides.length - 1, currentIndex() + 1)));
    track.addEventListener("scroll", () => window.requestAnimationFrame(updateUI));
    window.addEventListener("resize", () => {
        slides.forEach(pinOverlayToImage);
        updateUI();
    });

    updateUI();
}

document.querySelectorAll("[data-carousel]").forEach(initCarousel);

async function initPriceTags() {
    const tags = document.querySelectorAll(".price-tag");
    if (!tags.length) return;

    let usdPerInr = null;
    try {
        const res = await fetch("https://open.er-api.com/v6/latest/INR");
        const data = await res.json();
        usdPerInr = data.rates.USD;
    } catch (err) {
        usdPerInr = null;
    }

    tags.forEach((tag) => {
        const tooltip = tag.querySelector(".price-tooltip");
        const inr = parseFloat(tag.dataset.inr);
        if (usdPerInr) {
            const usd = (inr * usdPerInr).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            });
            tooltip.textContent = "≈ " + usd;
        } else {
            tooltip.textContent = "Exchange rate unavailable";
        }
    });
}

initPriceTags();
