/**
 * WCON System — Mobile Navigation
 * Arquivo: mobile-nav.js
 */

(function () {
  'use strict';

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };
  function isMobile() { return window.innerWidth < 769; }

  var sidebar, overlay, btnToggle;

  /* ── Sidebar ── */
  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('mob-open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('mob-open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggleSidebar() {
    if (sidebar && sidebar.classList.contains('mob-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  /* ── Swipe para fechar sidebar ── */
  function setupSwipe() {
    if (!sidebar) return;
    var startX = 0, startY = 0, dragging = false;

    sidebar.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });

    sidebar.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - startX;
      var dy = Math.abs(e.touches[0].clientY - startY);
      if (Math.abs(dx) > dy && dx < -20) {
        sidebar.style.transition = 'none';
        sidebar.style.left = Math.min(0, dx) + 'px';
      }
    }, { passive: true });

    sidebar.addEventListener('touchend', function (e) {
      dragging = false;
      sidebar.style.transition = '';
      sidebar.style.left = '';
      var dx = e.changedTouches[0].clientX - startX;
      if (dx < -60) closeSidebar();
    });
  }

  /* ── Wrapping de tabelas ── */
  function wrapTables() {
    if (!isMobile()) return;
    $$('table').forEach(function (tbl) {
      if (tbl.closest('.table-wrap, .table-container, .table-box, .table-responsive')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      tbl.parentNode.insertBefore(wrap, tbl);
      wrap.appendChild(tbl);
    });
  }

  /* ── Observa mudanças no conteúdo ── */
  function observeModules() {
    var observer = new MutationObserver(function () {
      wrapTables();
    });
    var main = $('#main-content');
    if (main) {
      observer.observe(main, { childList: true, subtree: true });
    }
  }

  /* ── Eventos ── */
  function setupEvents() {
    // Hambúrguer (#btn-toggle-sb)
    btnToggle = $('#btn-toggle-sb');
    if (btnToggle) {
      var newBtn = btnToggle.cloneNode(true);
      btnToggle.parentNode.replaceChild(newBtn, btnToggle);
      btnToggle = newBtn;
      btnToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleSidebar();
      });
    }

    // Overlay fecha sidebar
    overlay = $('#mobile-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // ESC fecha sidebar
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });

    // Clique fora fecha sidebar
    document.addEventListener('click', function (e) {
      if (!isMobile()) return;
      if (!sidebar || !sidebar.classList.contains('mob-open')) return;
      if (!sidebar.contains(e.target) && !e.target.closest('#btn-toggle-sb')) {
        closeSidebar();
      }
    });

    // Links da sidebar fecham o drawer
    document.addEventListener('click', function (e) {
      if (!isMobile()) return;
      var link = e.target.closest('#sidebar-nav a, #sidebar-nav button, #sidebar-nav [onclick]');
      if (link && sidebar && sidebar.classList.contains('mob-open')) {
        setTimeout(closeSidebar, 120);
      }
    });

    // Resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!isMobile()) closeSidebar();
      }, 150);
    });
  }

  /* ── API pública ── */
  window.wconMobile = {
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    toggleSidebar: toggleSidebar,
    isMobile: isMobile
  };

  /* ── Init ── */
  function init() {
    sidebar = $('#sidebar');
    setupEvents();
    setupSwipe();
    if (isMobile()) {
      wrapTables();
    }
    observeModules();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
