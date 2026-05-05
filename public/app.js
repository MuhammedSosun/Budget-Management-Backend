document.addEventListener("DOMContentLoaded", () => {
  const FRONTEND_URL = "http://localhost:5173";

  const langSelect = document.getElementById("lang-select");
  const themeToggle = document.getElementById("theme-toggle");
  const htmlEl = document.documentElement;

  const currentLang = htmlEl.lang || "tr";
  const currentTheme = localStorage.getItem("myAppTheme") || "light";

  htmlEl.setAttribute("data-theme", currentTheme);

  if (langSelect) {
    langSelect.value = currentLang;

    langSelect.addEventListener("change", (e) => {
      const selectedLang = e.target.value;
      localStorage.setItem("lang", selectedLang);

      window.location.href = selectedLang === "en" ? "/en/" : "/tr/";
    });
  }

  if (themeToggle) {
    const lightIcon = themeToggle.querySelector(".light-icon");
    const darkIcon = themeToggle.querySelector(".dark-icon");

    const updateThemeIcon = (theme) => {
      if (!lightIcon || !darkIcon) return;

      lightIcon.style.display = theme === "dark" ? "none" : "inline";
      darkIcon.style.display = theme === "dark" ? "inline" : "none";
    };

    updateThemeIcon(currentTheme);

    themeToggle.addEventListener("click", () => {
      const isDark = htmlEl.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";

      htmlEl.setAttribute("data-theme", newTheme);
      localStorage.setItem("myAppTheme", newTheme);
      updateThemeIcon(newTheme);
    });
  }

  document.querySelectorAll(".js-auth-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const path = link.dataset.path || "/login";
      const theme = localStorage.getItem("myAppTheme") || "light";
      const lang = htmlEl.lang || "tr";

      const params = new URLSearchParams({ theme, lang });

      window.location.href = `${FRONTEND_URL}${path}?${params.toString()}`;
    });
  });

  const swiperElement = document.querySelector(".mySwiper");

  if (swiperElement) {
    new Swiper(".mySwiper", {
      loop: true,
      spaceBetween: 0,
      grabCursor: true,
      autoHeight: false,
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
    });
  }

  document
    .querySelectorAll('a[href^="#"]:not(.js-auth-link)')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        if (!href || href === "#") return;

        e.preventDefault();

        const target = document.querySelector(href);

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
          });
        }
      });
    });
});
