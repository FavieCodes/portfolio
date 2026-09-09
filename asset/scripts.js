/* ══════════════════════════════════════════════
   GLOBAL PAGE LOADER — show on load, hide on ready
══════════════════════════════════════════════ */
(function () {
  const loader = document.getElementById('globalLoader');
  if (!loader) return;

  // Apply saved theme immediately so loader bg matches
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  function hideLoader() {
    // Small extra delay so page paint is visible before fade
    setTimeout(() => loader.classList.add('gl-hidden'), 120);
  }

  // Hide once all resources (images, fonts, etc.) are fully loaded
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
    // Safety net — never block page for more than 3s
    setTimeout(hideLoader, 3000);
  }

  // Show loader when user navigates to another page
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    // Only intercept same-origin internal HTML navigation
    const isInternal = !href.startsWith('http') &&
                       !href.startsWith('//') &&
                       !href.startsWith('#') &&
                       !href.startsWith('mailto') &&
                       !href.startsWith('tel') &&
                       !anchor.hasAttribute('target');
    if (isInternal) {
      loader.classList.remove('gl-hidden');
      loader.style.opacity = '1';
      loader.style.visibility = 'visible';
    }
  });
})();

/* ── THEME TOGGLE ── */
const toggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved preference
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

if (toggle) {
  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ── MOBILE MENU TOGGLE ── */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    mobileMenuBtn.setAttribute(
      'aria-expanded', 
      navLinks.classList.contains('mobile-open') ? 'true' : 'false'
    );
  });

  // Close mobile menu on clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}

/* ── ACTIVE NAV HIGHLIGHTING ── */
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href) {
    const linkPath = href.split('#')[0];
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
  }
});

/* ── PROJECT CATEGORY FILTERING & PAGINATION (Projects Page) ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
const paginationContainer = document.getElementById('paginationContainer');
const projectsLoader = document.getElementById('projectsLoader');

if (projectCards.length > 0 && paginationContainer) {
  const ITEMS_PER_PAGE = 6;
  let currentPage = 1;
  let activeFilter = 'all';

  function getFilteredCards() {
    return projectCards.filter(card => {
      const category = card.getAttribute('data-category') || '';
      return activeFilter === 'all' || category.includes(activeFilter);
    });
  }

  function renderPage(page, triggerLoader = true) {
    const filtered = getFilteredCards();
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    if (triggerLoader && projectsLoader) {
      projectsLoader.classList.add('active');
    }

    // Hide all project cards immediately
    projectCards.forEach(card => {
      card.style.display = 'none';
      card.style.opacity = '0';
    });

    setTimeout(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageCards = filtered.slice(start, end);

      pageCards.forEach((card, index) => {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 40);
      });

      renderPagination(filtered.length);

      if (projectsLoader) {
        projectsLoader.classList.remove('active');
      }

      // Scroll smoothly to top of projects grid if user scrolled down
      const wrapper = document.querySelector('.projects-container-wrapper');
      if (wrapper && window.scrollY > wrapper.offsetTop + 100) {
        window.scrollTo({ top: wrapper.offsetTop - 80, behavior: 'smooth' });
      }
    }, triggerLoader ? 450 : 0);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn nav-btn';
    prevBtn.innerHTML = '«Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) renderPage(currentPage - 1, true);
    });
    paginationContainer.appendChild(prevBtn);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const numBtn = document.createElement('button');
      numBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      numBtn.textContent = i;
      if (i !== currentPage) {
        numBtn.addEventListener('click', () => renderPage(i, true));
      }
      paginationContainer.appendChild(numBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn nav-btn';
    nextBtn.innerHTML = 'Next»';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) renderPage(currentPage + 1, true);
    });
    paginationContainer.appendChild(nextBtn);
  }

  // Filter Buttons Event Listener
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeFilter = btn.getAttribute('data-filter') || 'all';
        renderPage(1, true);
      });
    });
  }

  // Initial render
  renderPage(1, false);
}

/* ── CONTACT MODAL ── */
(function () {
  const overlay   = document.getElementById('contactModalOverlay');
  const closeBtn  = document.getElementById('closeContactModal');
  const navLink   = document.getElementById('navContactLink');
  const form      = document.getElementById('contactForm');

  if (!overlay) return;

  function openModal(e) {
    if (e) { e.preventDefault(); }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first input for accessibility
    setTimeout(() => {
      const firstInput = overlay.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }, 350);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open on "Contact" nav click
  if (navLink) navLink.addEventListener('click', openModal);

  // Close on X button
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close when clicking the backdrop (outside the modal card)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  // Form submit → build mailto URL and open email client
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = document.getElementById('contactName')?.value.trim()    || '';
      const email   = document.getElementById('contactEmail')?.value.trim()   || '';
      const subject = document.getElementById('contactSubject')?.value.trim() || 'Portfolio Contact';
      const message = document.getElementById('contactMessage')?.value.trim() || '';

      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const url  = `mailto:imo.e.udoh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = url;

      // Reset form and close modal after brief delay
      setTimeout(() => {
        form.reset();
        closeModal();
      }, 400);
    });
  }
})();

/* ── FADE-IN ON SCROLL ── */
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));