const translations = {
    tr: {
        brand: "Bütçem.",
        nav_preview: "Önizleme",
        nav_features: "Özellikler",
        nav_how: "Nasıl Çalışır",
        auth_login: "Giriş Yap",
        auth_register: "Kayıt Ol",

        hero_eyebrow: "Kişisel bütçe yönetimini sadeleştir",
        hero_title: "Gelir ve giderlerini <span>tek ekrandan yönet.</span>",
        hero_text: "Bütçem ile işlemlerini kaydet, filtrele, analiz et ve finansal düzenini daha net gör.",

        hero_cta_primary: "Ücretsiz Başla",
        hero_cta_secondary: "Ekranları İncele",

        benefit_1: "Hızlı işlem yönetimi",
        benefit_2: "Filtreleme ve takip",
        benefit_3: "Dark mode ve çoklu dil",

        trust_1: "CRUD işlem yönetimi",
        trust_2: "Filtreleme desteği",
        trust_3: "Dark mode",
        trust_4: "Çoklu dil altyapısı",
        trust_5: "Responsive arayüz",

        features_title: "Bütçe takibini kolaylaştıran güçlü ama sade yapı",
        features_desc: "Ürünün sunduğu yetenekleri gösterirken teknik değil, kullanıcı faydası merkezli anlatım kullanıyoruz.",

        feature_1_title: "İşlem Ekle ve Düzenle",
        feature_1_desc: "Gelir ve gider kayıtlarını hızlıca oluştur, güncelle ve yönet.",

        feature_2_title: "Akıllı Filtreleme",
        feature_2_desc: "İşlemlerini tarih, kategori veya tipe göre daha kolay incele.",

        feature_3_title: "Dashboard Özeti",
        feature_3_desc: "Toplam durumunu, hareketlerini ve genel görünümü tek ekranda gör.",

        feature_4_title: "Dark Mode",
        feature_4_desc: "Farklı kullanım senaryolarına uygun modern ve rahat bir görünüm sunar.",

        feature_5_title: "Çoklu Dil Desteği",
        feature_5_desc: "Farklı kullanıcı profillerine uyum sağlamak için i18n altyapısı içerir.",

        feature_6_title: "Temiz Kullanıcı Deneyimi",
        feature_6_desc: "Karmaşık finans uygulamaları yerine sade ve anlaşılır bir akış hedefler.",

        how_title: "Başlamak için yalnızca 3 adım yeterli",

        step1_title: "Hesabını oluştur",
        step1_desc: "Kayıt olarak kişisel bütçe alanını oluşturmaya başla.",

        step2_title: "Gelir ve giderlerini ekle",
        step2_desc: "Finansal hareketlerini sisteme kaydet ve düzenli takip et.",

        step3_title: "Durumunu analiz et",
        step3_desc: "Dashboard ve filtreleme ile bütçeni daha bilinçli yönet.",

        cta_title: "Bütçeni daha kontrollü yönetmeye bugün başla.",
        cta_desc: "Temiz arayüz, güçlü işlem yönetimi ve sade deneyimle finansal düzenini güçlendir.",

        cta_btn1: "Hesap Oluştur",
        cta_btn2: "Giriş Yap",

        footer_desc: "Kişisel bütçe yönetimini daha sade, anlaşılır ve modern hale getiren web uygulaması.",
        footer_features: "Özellikler",
        footer_how: "Nasıl Çalışır",
        footer_login: "Giriş Yap",
        footer_register: "Kayıt Ol",
        footer_bottom: "© 2026 Bütçem. Tüm hakları saklıdır.",
    },

    en: {
        brand: "Bütçem.",
        nav_preview: "Preview",
        nav_features: "Features",
        nav_how: "How it Works",
        auth_login: "Login",
        auth_register: "Register",

        hero_eyebrow: "Simplify personal budget management",
        hero_title: "Manage your income and expenses <span>from a single screen.</span>",
        hero_text: "Record, filter, and analyze your transactions with Bütçem for a clearer financial view.",

        hero_cta_primary: "Get Started",
        hero_cta_secondary: "View Screens",

        benefit_1: "Fast transaction",
        benefit_2: "Filtering and tracking",
        benefit_3: "Dark mode & multi-lang",

        trust_1: "CRUD operations",
        trust_2: "Advanced filtering",
        trust_3: "Dark mode",
        trust_4: "Multi-language support",
        trust_5: "Responsive design",

        features_title: "A powerful yet simple structure for managing your budget",
        features_desc: "We present features in a user-focused way rather than technical terms.",

        feature_1_title: "Add & Edit Transactions",
        feature_1_desc: "Quickly create, update, and manage your income and expenses.",

        feature_2_title: "Smart Filtering",
        feature_2_desc: "Easily analyze your transactions by date, category, or type.",

        feature_3_title: "Dashboard Overview",
        feature_3_desc: "See your overall financial status at a glance.",

        feature_4_title: "Dark Mode",
        feature_4_desc: "Modern and comfortable experience for different scenarios.",

        feature_5_title: "Multi-language Support",
        feature_5_desc: "Supports different user profiles with i18n infrastructure.",

        feature_6_title: "Clean UX",
        feature_6_desc: "A simple and intuitive experience instead of complex finance apps.",

        how_title: "Start in just 3 steps",

        step1_title: "Create your account",
        step1_desc: "Sign up and start building your personal budget.",

        step2_title: "Add your transactions",
        step2_desc: "Track your financial activities easily.",

        step3_title: "Analyze your data",
        step3_desc: "Manage your budget more consciously with insights.",

        cta_title: "Start managing your budget better today.",
        cta_desc: "Take control of your finances with a clean and powerful experience.",

        cta_btn1: "Create Account",
        cta_btn2: "Login",

        footer_desc: "A modern and simple web app for personal budget management.",
        footer_features: "Features",
        footer_how: "How it works",
        footer_login: "Login",
        footer_register: "Register",
        footer_bottom: "© 2026 Bütçem. All rights reserved.",
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById('lang-select');
    const currentLang = localStorage.getItem("lang") || "tr";
    langSelect.value = currentLang;
    updatePageLanguage(currentLang);
    langSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        localStorage.setItem("lang", selectedLang);
        updatePageLanguage(selectedLang);
    });
    function updatePageLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = translations[lang][key];

            if (translation) {
                if (translation.includes('<span')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
    }
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const currentTheme = localStorage.getItem("myAppTheme") || "light";
    htmlEl.setAttribute("data-theme", currentTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = htmlEl.getAttribute("data-theme") === "dark";
            const newTheme = isDark ? "light" : "dark";
            htmlEl.setAttribute("data-theme", newTheme);
            localStorage.setItem("myAppTheme", newTheme);
        });
    }

    const swiperElement = document.querySelector(".mySwiper");

    if (swiperElement) {
        new Swiper(".mySwiper", {
            loop: true,
            spaceBetween: 0,
            grabCursor: true,

            autoHeight: false,
            effect: "fade",
            fadeEffect: {
                crossFade: true
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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});