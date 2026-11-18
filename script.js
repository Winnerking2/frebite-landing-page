const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const sectionLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
const navSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
let navScrollTimer;
let pendingNavSection;

function setActiveNavLink(sectionId) {
  sectionLinks.forEach((link) => {
    const isActive = link.hash === `#${sectionId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveNavLink() {
  const headerHeight = document.querySelector(".site-header").offsetHeight;
  const pendingSection = navSections.find((section) => section.id === pendingNavSection);
  if (pendingSection && pendingSection.getBoundingClientRect().top > headerHeight + 20) return;
  pendingNavSection = undefined;

  const activationPoint = window.scrollY + headerHeight + 20;
  let activeSection = navSections[0];

  navSections.forEach((section) => {
    if (section.offsetTop <= activationPoint) activeSection = section;
  });

  if (activeSection) setActiveNavLink(activeSection.id);
}

sectionLinks.forEach((link) => {
  link.addEventListener("click", () => {
    pendingNavSection = link.hash.slice(1);
    setActiveNavLink(pendingNavSection);
  });
});

window.addEventListener("wheel", () => { pendingNavSection = undefined; }, { passive: true });
window.addEventListener("touchstart", () => { pendingNavSection = undefined; }, { passive: true });
window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "].includes(event.key)) {
    pendingNavSection = undefined;
  }
});

window.addEventListener("scroll", () => {
  window.clearTimeout(navScrollTimer);
  navScrollTimer = window.setTimeout(updateActiveNavLink, 120);
}, { passive: true });

updateActiveNavLink();

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  navLinks.classList.toggle("is-open", !isExpanded);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navLinks.classList.remove("is-open");
  });
});

const track = document.querySelector(".meal-track");
const cards = Array.from(track.querySelectorAll(".meal-card"));
const menuSection = document.querySelector(".menu-section");
const progress = document.querySelector(".progress-fill");
const previousButton = document.querySelector(".carousel-button.previous");
const nextButton = document.querySelector(".carousel-button.next");
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentSlide = 0;
let autoplayTimer;
let isPointerOverMenu = false;
let hasMenuFocus = false;

function visibleCards() {
  if (window.innerWidth <= 650) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function updateCarousel() {
  const lastSlide = Math.max(0, cards.length - visibleCards());
  currentSlide = Math.min(currentSlide, lastSlide);
  const cardWidth = cards[0].getBoundingClientRect().width;
  const gap = parseFloat(getComputedStyle(track).gap);
  track.style.transform = `translateX(-${currentSlide * (cardWidth + gap)}px)`;
  progress.style.width = `${((currentSlide + visibleCards()) / cards.length) * 100}%`;
  previousButton.disabled = currentSlide === 0;
  nextButton.disabled = currentSlide === lastSlide;
}

function scheduleCarouselAutoplay() {
  window.clearTimeout(autoplayTimer);
  if (document.hidden || isPointerOverMenu || hasMenuFocus || reducedMotionPreference.matches) return;

  autoplayTimer = window.setTimeout(() => {
    const lastSlide = Math.max(0, cards.length - visibleCards());
    currentSlide = currentSlide >= lastSlide ? 0 : currentSlide + 1;
    updateCarousel();
    scheduleCarouselAutoplay();
  }, 5000);
}

menuSection.addEventListener("mouseenter", () => {
  isPointerOverMenu = true;
  scheduleCarouselAutoplay();
});

menuSection.addEventListener("mouseleave", () => {
  isPointerOverMenu = false;
  scheduleCarouselAutoplay();
});

menuSection.addEventListener("focusin", () => {
  hasMenuFocus = true;
  scheduleCarouselAutoplay();
});

menuSection.addEventListener("focusout", (event) => {
  hasMenuFocus = menuSection.contains(event.relatedTarget);
  scheduleCarouselAutoplay();
});

document.addEventListener("visibilitychange", scheduleCarouselAutoplay);
reducedMotionPreference.addEventListener("change", scheduleCarouselAutoplay);

previousButton.addEventListener("click", () => {
  currentSlide = Math.max(0, currentSlide - 1);
  updateCarousel();
  scheduleCarouselAutoplay();
});

nextButton.addEventListener("click", () => {
  currentSlide = Math.min(cards.length - visibleCards(), currentSlide + 1);
  updateCarousel();
  scheduleCarouselAutoplay();
});

cards.forEach((card) => {
  card.querySelector(".meal-add").addEventListener("click", () => {
    const mealName = card.querySelector("h3").textContent;
    const message = `Hi Freebite, I'd like to order the ${mealName}.`;
    window.open(`https://wa.me/2349039550772?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });
});

window.addEventListener("resize", updateCarousel);
document.querySelector("#year").textContent = new Date().getFullYear();
updateCarousel();
scheduleCarouselAutoplay();
