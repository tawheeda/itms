// script.js — consolidated: popup, sectors modal, lightbox, ICT gallery, supply panels, mining cards→shared gallery
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- (A) Optional popup (URL ?status=...) ---------- */
  const overlay = document.getElementById("popupOverlay");
  const popup = document.getElementById("popupMessage");
  const popupText = document.getElementById("popupText");

  const showPopup = (message, type) => {
    if (!overlay || !popup || !popupText) return;
    popupText.textContent = message;
    popup.className = "popup " + type;
    overlay.style.display = "block";
    popup.style.display = "block";
  };
  const closePopup = () => {
    if (!overlay || !popup) return;
    overlay.style.display = "none";
    popup.style.display = "none";
    history.replaceState({}, document.title, window.location.pathname);
  };
  document.querySelectorAll(".popup-close, #popupClose").forEach(btn =>
    btn.addEventListener("click", closePopup)
  );
  if (overlay) overlay.addEventListener("click", e => { if (e.target === overlay) closePopup(); });
  const urlStatus = new URLSearchParams(location.search).get("status");
  if (urlStatus === "success") showPopup("✅ Your message has been sent and saved successfully.", "success");
  if (urlStatus === "error")   showPopup("❌ There was an issue sending your message. Please try again later.", "error");

  /* ---------- (B) Sector data (images are in ROOT folder) ---------- */
  const SECTORS = {
    mining: {
      title: "Mining Sector",
      desc: "We provide essential supplies and specialized services to support the robust demands of mining — enhancing safety, uptime, and overall productivity.",
      images: ["mining1.jpg","mining2.jpg","mining3.jpg","mining4.jpg","mining5.jpg","mining6.jpg"]
    },
    supply: {
      title: "Supply & Consultation",
      desc: "High-quality industrial components and pragmatic consulting for efficient, on-time delivery and long-term reliability across projects.",
      images: ["supply1.jpg","supply2.jpg","supply3.jpg","supply4.jpg"]
    },
    ict: {
      title: "Information Technology (IT)",
      desc: "Core IT services and infrastructure solutions that keep your business secure, scalable, and future-ready.",
      images: ["ict1.jpg","ict2.jpg","ict3.jpg","ict4.jpg","ict5.jpg"]
    }
  };

  /* ---------- (C) One lightbox for everything ---------- */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  const lbClose = document.getElementById("lbClose");

  let lbList = [];
  let lbIndex = 0;

  // Accepts EITHER a sector key ("mining") OR a list of URLs (["a.jpg",...])
  function openLightbox(listOrSector, index, altPrefix = "Enlarged image") {
    const list = Array.isArray(listOrSector)
      ? listOrSector
      : (SECTORS[listOrSector]?.images || []);
    if (!list.length || !lightbox || !lbImg) return;

    lbList = list;
    lbIndex = Math.max(0, Math.min(Number(index) || 0, lbList.length - 1));
    lbImg.src = lbList[lbIndex];
    lbImg.alt = `${altPrefix} ${lbIndex + 1}`;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lbClose && lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function navLightbox(dir) {
    if (!lbList.length || !lbImg) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
    lbImg.alt = `Enlarged image ${lbIndex + 1}`;
  }
  lbClose && lbClose.addEventListener("click", closeLightbox);
  lbPrev && lbPrev.addEventListener("click", () => navLightbox(-1));
  lbNext && lbNext.addEventListener("click", () => navLightbox(1));
  lightbox && lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navLightbox(-1);
    if (e.key === "ArrowRight") navLightbox(1);
  });

  /* ---------- (D) Sectors modal (sectors.php) ---------- */
  const modal = document.getElementById("sectorModal");
  const modalTitle = document.getElementById("sectorTitle");
  const modalDesc  = document.getElementById("sectorDesc");
  const modalGrid  = document.getElementById("sectorGrid");
  const modalClose = document.getElementById("sectorClose");
  let lastTrigger = null;

  function openModal(sectorKey, triggerEl) {
    if (!modal || !modalTitle || !modalDesc || !modalGrid) return;
    const sector = SECTORS[sectorKey];
    if (!sector) return;

    lastTrigger = triggerEl || null;
    modalTitle.textContent = sector.title;
    modalDesc.textContent  = sector.desc;
    modalGrid.innerHTML = sector.images.map((src, i) => `
      <figure class="sector-figure" data-idx="${i}" data-sector="${sectorKey}" tabindex="0" role="button" aria-label="View ${sector.title} image ${i+1}">
        <img src="${src}" alt="${sector.title} image ${i+1}">
      </figure>`).join("");

    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    modalClose && modalClose.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  }
  modalClose && modalClose.addEventListener("click", closeModal);
  modal && modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (!modal || !modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
  });
  document.querySelectorAll(".js-sector").forEach(a => {
    a.addEventListener("click", (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow new tab, etc.
      e.preventDefault();
      openModal(a.getAttribute("data-sector"), a);
    });
    a.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(a.getAttribute("data-sector"), a);
      }
    });
  });

  // --- open lightbox from the modal grid (sectors.php) ---
  function launchLBFromModal(sec, idx) {
    // Close modal first so it doesn't sit above the lightbox
    closeModal();
    // Open the lightbox on the next frame for smoothness and correct stacking
    requestAnimationFrame(() => {
      openLightbox(sec, idx, `${SECTORS[sec]?.title || "Sector"} enlarged image`);
    });
  }

  if (modalGrid) {
    modalGrid.addEventListener("click", (e) => {
      const fig = e.target.closest("figure.sector-figure");
      if (!fig) return;
      const sec = fig.getAttribute("data-sector");
      const idx = Number(fig.getAttribute("data-idx")) || 0;
      launchLBFromModal(sec, idx);
    });

    modalGrid.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const fig = e.target.closest("figure.sector-figure");
      if (!fig) return;
      e.preventDefault();
      const sec = fig.getAttribute("data-sector");
      const idx = Number(fig.getAttribute("data-idx")) || 0;
      launchLBFromModal(sec, idx);
    });
  }

  /* ---------- (E) Simple galleries (ICT / legacy mining) ---------- */
  function bindSimpleGrid(gridSelector, altPrefix) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    const list = Array.from(grid.querySelectorAll("img")).map(img => img.getAttribute("src") || "");
    grid.querySelectorAll("figure").forEach((fig, i) => {
      if (!fig.hasAttribute("tabindex")) fig.setAttribute("tabindex","0");
      if (!fig.hasAttribute("role")) fig.setAttribute("role","button");
      if (!fig.hasAttribute("aria-label")) fig.setAttribute("aria-label", `View image ${i+1}`);
      fig.addEventListener("click", () => openLightbox(list, i, altPrefix));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(list, i, altPrefix);
        }
      });
    });
  }
  bindSimpleGrid("#miningGrid", "Mining enlarged image"); // only if a legacy mining grid exists
  bindSimpleGrid("#ictGrid", "IT enlarged image");        // ICT gallery

  /* ---------- (F) Supply page: per-item panels (hover/click) ---------- */
  const suppliesList = document.querySelector("#suppliesList");
  if (suppliesList) {
    const prefersHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const setPanel = (item, open) => {
      const btn = item.querySelector(".service-toggle");
      const panel = item.querySelector(".service-panel");
      if (!btn || !panel) return;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    };
    const closeSiblings = (current) => {
      suppliesList.querySelectorAll(".supply-item").forEach(it => { if (it !== current) setPanel(it, false); });
    };

    suppliesList.querySelectorAll(".supply-item").forEach((item) => {
      const btn = item.querySelector(".service-toggle");
      const title = item.getAttribute("data-title") || "Supply";
      const figures = Array.from(item.querySelectorAll(".service-panel .img-grid figure"));
      const imgList = figures.map(f => f.querySelector("img")?.getAttribute("src") || "");

      // thumbnails -> lightbox
      figures.forEach((fig, i) => {
        if (!fig.hasAttribute("tabindex")) fig.setAttribute("tabindex","0");
        if (!fig.hasAttribute("role")) fig.setAttribute("role","button");
        if (!fig.hasAttribute("aria-label")) fig.setAttribute("aria-label", `View ${title} image ${i + 1}`);
        fig.addEventListener("click", () => openLightbox(imgList, i, `${title} enlarged image`));
        fig.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(imgList, i, `${title} enlarged image`);
          }
        });
      });

      // Desktop: open on hover, close on leave
      if (prefersHover) {
        item.addEventListener("mouseenter", () => { closeSiblings(item); setPanel(item, true); });
        item.addEventListener("mouseleave", () => { setPanel(item, false); });
      }

      // Mobile/Click: toggle on click/keyboard
      if (btn) {
        btn.addEventListener("click", () => {
          const expanded = btn.getAttribute("aria-expanded") === "true";
          closeSiblings(item);
          setPanel(item, !expanded);
        });
        btn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const expanded = btn.getAttribute("aria-expanded") === "true";
            closeSiblings(item);
            setPanel(item, !expanded);
          }
        });
      }
    });
  }

  /* ---------- (G) Mining page: cards-as-filter → one shared gallery ---------- */
  const miningGallery = document.getElementById("miningGallery");
  const miningGalleryTitle = document.getElementById("miningGalleryTitle");
  const miningShowAll = document.getElementById("miningShowAll");
  const miningCards = document.querySelectorAll(".mining-trigger[data-key]");

  if (miningGallery && miningGalleryTitle && miningCards.length) {
    // Map each category to its images (root-level files)
    const MINING_MAP = {
      boiler:   ["boiler1.jpg","boiler2.jpg","boiler3.jpeg"],
      motors:   ["motor1.jpg","motor2.jpg","motor3.jpeg"],
      pumps:    ["pumps1.webp","pumps2.jpg","pumps3.jpg"],
      gearboxes:["gearbox1.jpg","gearbox2.jpg","gearbox3.jpg"],
      valves:   ["valve1.jpg","valve2.jpg","valve3.jpg"],
      plant:    ["plant1.jpg","plant2.webp","plant3.jpg"],
      heaters:  ["heater1.jpg","heater2.png","heater3.jpeg"],
      cooling:  ["cooling1.jpeg","cooling2.jpeg","cooling3.jpeg"],
      alumina:  ["alumina1.webp","alumina2.jpeg","alumina3.jpeg"],
      epoxy:    ["epoxy1.jpeg","epoxy2.jpeg","epoxy3.jpeg"]
    };

    const LABELS = {
      boiler: "Boiler Tubes",
      motors: "Electrical Motors",
      pumps: "Pumps",
      gearboxes: "Gearboxes",
      valves: "Valves",
      plant: "Plant Hire",
      heaters: "Feed Water Heaters",
      cooling: "Cooling Towers",
      alumina: "Activated Alumina",
      epoxy: "Epoxy Resin"
    };

    const prefersHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const getAllList = () => Object.values(MINING_MAP).flat();

    const clearActive = () => {
      miningCards.forEach(card => card.classList.remove("is-active"));
    };

    const renderGallery = (list, label) => {
      const title = label || "All Mining Supplies";
      miningGalleryTitle.textContent = title;
      miningGallery.innerHTML = list.map((src, i) => `
        <figure class="mining-thumb" data-idx="${i}" tabindex="0" role="button" aria-label="View ${title} image ${i+1}">
          <img src="${src}" alt="${title} ${i+1}" loading="lazy">
        </figure>
      `).join("");

      const listCopy = list.slice();
      miningGallery.querySelectorAll("figure.mining-thumb").forEach((fig, i) => {
        fig.addEventListener("click", () => openLightbox(listCopy, i, `Mining - ${title}`));
        fig.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(listCopy, i, `Mining - ${title}`);
          }
        });
      });
    };

    const selectCategory = (key, lock = true) => {
      const list = MINING_MAP[key] || [];
      const label = LABELS[key];
      if (list.length) {
        renderGallery(list, label);
      } else {
        renderGallery(getAllList(), "All Mining Supplies");
      }
      if (lock) {
        clearActive();
        const activeCard = Array.from(miningCards).find(c => c.dataset.key === key);
        activeCard && activeCard.classList.add("is-active");
      }
    };

    // Card interactions
    miningCards.forEach((card) => {
      const key = card.dataset.key;

      // Click/tap to lock selection
      card.addEventListener("click", () => selectCategory(key, true));

      // Keyboard support
      if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex","0");
      if (!card.hasAttribute("role")) card.setAttribute("role","button");
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectCategory(key, true);
        }
      });

      // Desktop hover = preview (not locked)
      if (prefersHover) {
        card.addEventListener("mouseenter", () => selectCategory(key, false));
        card.addEventListener("mouseleave", () => {
          const locked = document.querySelector(".mining-trigger.is-active");
          if (locked) selectCategory(locked.dataset.key, false);
          else renderGallery(getAllList(), "All Mining Supplies");
        });
      }
    });

    // Show all button
    if (miningShowAll) {
      miningShowAll.addEventListener("click", () => {
        clearActive();
        renderGallery(getAllList(), "All Mining Supplies");
      });
    }

    // Initial load
    renderGallery(getAllList(), "All Mining Supplies");
  }
});
