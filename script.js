(function () {
  "use strict";

  /* ---------- unified theme (global) ---------- */
  function getTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function getSavedTheme() {
    var q = new URLSearchParams(location.search).get("theme");
    if (q === "dark" || q === "light") {
      try { localStorage.setItem("theme", q); } catch (e) {}
      return q;
    }
    try { return localStorage.getItem("theme") || "dark"; } catch (e) { return "dark"; }
  }

  function updateThemeUI(theme) {
    var icon = theme === "dark" ? "☀️" : "🌙";
    document.querySelectorAll(".theme-toggle, #v-theme-toggle, .void-theme").forEach(function (el) {
      el.textContent = icon;
    });
    var mob = document.getElementById("theme-toggle-mobile");
    if (mob) mob.textContent = icon + " Toggle Theme";
  }

  function updateFavicon() {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var dark = mq.matches;
    var fill = dark ? "white" : "%23141414";
    var textFill = dark ? "%23141414" : "white";
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
      "<rect width='100' height='100' rx='20' fill='" + fill + "'/>" +
      "<text x='50' y='68' font-size='52' font-weight='800' font-family='Inter,sans-serif' fill='" + textFill + "' text-anchor='middle'>AJ</text></svg>";
    var link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = "data:image/svg+xml," + svg;
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
    updateThemeUI(theme);
    updateMenuLinks();
  }

  function toggleTheme() {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  }

  function updateMenuLinks() {
    document.querySelectorAll(".void-item").forEach(function (a) {
      var href = a.getAttribute("href").split("?")[0];
      a.setAttribute("href", href + "?theme=" + getTheme());
    });
  }

  /* ---------- The Void — shared radial menu ---------- */
  var CONFIG = window.VOID_CONFIG || { mode: "home" };
  var isHome = CONFIG.mode === "home";
  var PAGES = isHome ? "static/assets/" : "";
  var ASSETS = isHome ? "static/icons/" : "../icons/";
  var HOME = isHome ? "index.html" : "../../index.html";

  var SECTIONS = [
    { name: "Education",    icon: "graduation.svg", href: PAGES + "education.html" },
    { name: "Skills",       icon: "lightning.svg",  href: PAGES + "skills.html" },
    { name: "Projects",     icon: "code.svg",       href: PAGES + "projects.html" },
    { name: "Experience",   icon: "briefcase.svg",  href: PAGES + "experience.html" },
    { name: "Certificates", icon: "file.svg",       href: PAGES + "certificates.html" },
    { name: "Achievements", icon: "ribbon.svg",     href: PAGES + "achievements.html" },
    { name: "Roadmap",      icon: "roadmap.svg",    href: PAGES + "roadmap.html" },
    { name: "Contact",      icon: "envelope.svg",   href: PAGES + "contact.html" },
    { name: "CV",           icon: "download.svg",   href: PAGES + "resume.html", target: "_blank" }
  ];

  var VOID_ITEM = {
    name: "The Void",
    icon: "favicon.svg",
    href: HOME,
    isVoid: true
  };

  var menuOpen = false;

  /* ---------- theme ---------- */
  function hideIntro() {
    document.querySelectorAll("[data-intro]").forEach(function (el) {
      el.classList.add("hidden");
    });
  }

  function showIntro() {
    document.querySelectorAll("[data-intro]").forEach(function (el) {
      el.classList.remove("hidden");
    });
  }

  function spawnRipple(x, y) {
    var r = document.createElement("div");
    r.className = "void-ripple";
    r.style.left = x + "px";
    r.style.top = y + "px";
    document.body.appendChild(r);
    setTimeout(function () { r.remove(); }, 750);
  }

  function clampCenter(x, y) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var small = vw < 480;
    var itemR = small ? 32 : 42;
    var pad = itemR + 26;
    var maxRing = Math.max(
      80,
      Math.min((vw - 2 * pad) / 2, (vh - 2 * pad) / 2)
    );
    var ringR = Math.min(maxRing, 250);
    var cx = Math.min(vw - ringR - pad, Math.max(ringR + pad, x));
    var cy = Math.min(vh - ringR - pad, Math.max(ringR + pad + 30, y));
    return { cx: cx, cy: cy, ringR: ringR };
  }

  function buildMenu(x, y) {
    var items = CONFIG.mode === "section" ? [VOID_ITEM].concat(SECTIONS) : SECTIONS;
    var dim = clampCenter(x, y);
    var m = document.createElement("div");
    m.className = "void-menu";
    m.id = "void-menu";

    var hub = document.createElement("button");
    hub.className = "void-hub";
    hub.setAttribute("aria-label", "Close selection");
    hub.textContent = "✕";
    hub.style.left = dim.cx + "px";
    hub.style.top = dim.cy + "px";
    hub.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    hub.addEventListener("click", closeMenu);
    m.appendChild(hub);

    var theme = document.createElement("button");
    theme.className = "void-theme";
    theme.setAttribute("aria-label", "Toggle theme");
    theme.textContent = getTheme() === "dark" ? "☀️" : "🌙";
    theme.style.left = dim.cx + "px";
    theme.style.top = dim.cy + 64 + "px";
    theme.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    theme.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleTheme();
    });
    m.appendChild(theme);

    items.forEach(function (s, i) {
      var a = document.createElement("a");
      a.className = "void-item";
      a.href = s.href + "?theme=" + getTheme();
      if (s.target) a.target = s.target;
      var angle = (2 * Math.PI * i) / items.length - Math.PI / 2;
      a.style.left = dim.cx + Math.cos(angle) * dim.ringR + "px";
      a.style.top = dim.cy + Math.sin(angle) * dim.ringR + "px";
      a.style.setProperty("--d", (90 + i * 28) + "ms");
      a.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        a.classList.add("pressed");
      });
      a.addEventListener("pointerup", function () { a.classList.remove("pressed"); });
      a.addEventListener("pointercancel", function () { a.classList.remove("pressed"); });
      a.addEventListener("mouseleave", function () { a.classList.remove("pressed"); });
      a.innerHTML =
        '<span class="void-item-ring"><img class="' +
        (s.isVoid ? "void-void-icon" : "") +
        '" src="' + ASSETS +
        s.icon +
        '" alt="" /></span><span class="void-item-label">' +
        s.name +
        "</span>";
      m.appendChild(a);
    });

    document.body.appendChild(m);
  }

  function openMenu(x, y) {
    closeMenu();
    hideIntro();
    spawnRipple(x, y);
    buildMenu(x, y);
    menuOpen = true;
  }

  function closeMenu() {
    var m = document.getElementById("void-menu");
    if (m) m.remove();
    menuOpen = false;
    showIntro();
  }

  /* ---------- input ---------- */
  var longTimer = null;
  var pressX = 0;
  var pressY = 0;
  var activePointer = null;
  var suppressClick = false;
  var menuDisabled = CONFIG.menu === false;

  function cancelLongPress() {
    clearTimeout(longTimer);
    longTimer = null;
    activePointer = null;
  }

  if (!menuDisabled) {
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
    return false;
  });

  document.addEventListener("pointerdown", function (e) {
    if (
      e.target.closest(".void-item") ||
      e.target.closest(".void-hub") ||
      e.target.closest(".void-theme")
    ) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pressX = e.clientX;
    pressY = e.clientY;
    activePointer = e.pointerId;
    clearTimeout(longTimer);
    longTimer = setTimeout(function () {
      if (activePointer === null) return;
      suppressClick = true;
      openMenu(pressX, pressY);
    }, 450);
  });

  document.addEventListener("pointermove", function (e) {
    if (activePointer !== null && Math.hypot(e.clientX - pressX, e.clientY - pressY) > 12) {
      cancelLongPress();
    }
  });

  document.addEventListener("pointerup", cancelLongPress);
  document.addEventListener("pointercancel", cancelLongPress);

  document.addEventListener("click", function (e) {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }
  }, true);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (menuOpen) closeMenu();
  });
  }

  setTheme(getSavedTheme());
  updateFavicon();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    updateFavicon();
  });

  /* ---------- page UI ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    // Elements
    var themeBtn = document.getElementById("theme-toggle");
    var themeBtnMob = document.getElementById("theme-toggle-mobile");
    var hamburger = document.getElementById("hamburger");
    var sidebar = document.getElementById("sidebar");
    var sideOverlay = document.getElementById("sidebar-overlay");
    var closeSidebar = document.getElementById("close-sidebar");
    var vThemeBtn = document.getElementById("v-theme-toggle");

    // 1. Theme toggle
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    if (vThemeBtn) vThemeBtn.addEventListener("click", toggleTheme);

    // 3. Sidebar
    var openSidebarFn = function () {
      if (sidebar) sidebar.classList.add("active");
      if (sideOverlay) sideOverlay.classList.add("active");
    };
    var closeSidebarFn = function () {
      if (sidebar) sidebar.classList.remove("active");
      if (sideOverlay) sideOverlay.classList.remove("active");
    };

    if (hamburger) hamburger.addEventListener("click", openSidebarFn);
    if (closeSidebar) closeSidebar.addEventListener("click", closeSidebarFn);
    if (sideOverlay) sideOverlay.addEventListener("click", closeSidebarFn);
    document
      .querySelectorAll(".sidebar a")
      .forEach(function (a) { a.addEventListener("click", closeSidebarFn); });

    if (themeBtnMob) themeBtnMob.addEventListener("click", function () {
      toggleTheme();
      closeSidebarFn();
    });

    // 4. Active nav link on scroll
    var sections = document.querySelectorAll("section[id], header[id]");
    var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navAnchors.forEach(function (a) {
              a.classList.toggle(
                "active-link",
                a.getAttribute("href") === "#" + entry.target.id
              );
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });

    // 5. Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var offset =
            parseInt(
              getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
            ) || 68;
          window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" });
        }
      });
    });

    // 6. Experience accordion
    function toggleExp(headerEl) {
      var card = headerEl.closest(".exp-card");
      var isOpen = card.classList.contains("open");
      document
        .querySelectorAll(".exp-card.open")
        .forEach(function (c) { c.classList.remove("open"); });
      if (!isOpen) card.classList.add("open");
    }
    window.toggleExp = toggleExp;
    var firstCard = document.querySelector(".exp-card");
    if (firstCard) firstCard.classList.add("open");

    // 7. Scroll reveal animation
    var revealTargets = [
      ".timeline-card",
      ".skill-category",
      ".exp-card",
      ".project-card",
      ".cert-card",
      ".ach-card",
      ".contact-item",
      ".section-title",
      ".section-label"
    ];

    revealTargets.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.setAttribute("data-reveal", "");
        el.style.transitionDelay = i * 0.06 + "s";
      });
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document
      .querySelectorAll("[data-reveal]")
      .forEach(function (el) { revealObserver.observe(el); });

    // 8. Hero badge fade-in
    var heroBadge = document.querySelector(".hero-badge");
    if (heroBadge) {
      heroBadge.style.opacity = "0";
      heroBadge.style.transform = "translateY(10px)";
      setTimeout(function () {
        heroBadge.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        heroBadge.style.opacity = "1";
        heroBadge.style.transform = "none";
      }, 400);
    }

    // 9. Project card tilt effect
    document.querySelectorAll(".project-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(600px) rotateY(" + x * 5 + "deg) rotateX(" + -y * 5 + "deg) translateZ(4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  });
})();