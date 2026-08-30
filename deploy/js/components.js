/**
 * Creative Studio — Shared layout components
 * Injects header and footer into pages based on data attributes.
 */

const SITE = {
  name: 'Creative Studio',
  website: 'https://creativstudio.co/',
  websiteDisplay: 'creativstudio.co',
  email: 'info@creativstudio.co',
  phone: '704-312-0219',
  addressLine1: '658 Griffith Rd, Ste 119',
  addressLine2: 'Charlotte, NC 28217',
};

const SERVICES = [
  {
    title: 'Signage & 3D Letters',
    href: '/services/signage-3d-letters.html',
    description: 'Industrial signage, warehouse entrance signs, and dimensional letter systems.',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
  },
  {
    title: 'Vehicle Graphics',
    href: '/services/vehicle-graphics.html',
    description: 'Plotter-cut vinyl lettering, fleet graphics, and heavy-duty truck magnets.',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h8m-8 4h8m-6 4h4M5 21h14a2 2 0 002-2V7l-4-4H7L3 7v12a2 2 0 002 2z"/></svg>`,
  },
  {
    title: 'Commercial Printing',
    href: '/services/commercial-printing.html',
    description: 'Trade-quality business cards, flyers, banners, and yard signs.',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>`,
  },
  {
    title: 'Promo & Apparel',
    href: '/services/promo-apparel.html',
    description: 'Branded corporate apparel and promotional giveaway products.',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`,
  },
];

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/services/')) return '..';
  return '.';
}

function renderHeader(activePage) {
  const base = getBasePath();
  const isServices = activePage === 'services' || window.location.pathname.includes('/services/');

  const servicesDropdown = SERVICES.map(
    (s) => `
      <a href="${base}${s.href.replace(/^\./, '')}" class="block px-4 py-3 text-sm text-gray-300 hover:text-[#A3E635] hover:bg-[#1a1a1a] transition-colors">
        ${s.title}
      </a>`
  ).join('');

  const mobileServicesLinks = SERVICES.map(
    (s) => `
      <a href="${base}${s.href.replace(/^\./, '')}" class="block py-2 pl-4 text-sm text-gray-400 hover:text-[#A3E635]">${s.title}</a>`
  ).join('');

  return `
    <header class="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#1f1f1f]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
          <a href="${base === '..' ? '../index.html' : 'index.html'}" class="flex items-center shrink-0">
            <img src="${base}/assets/logo.png" alt="${SITE.name}" class="h-10 lg:h-12 w-auto" />
          </a>

          <nav class="hidden lg:flex items-center gap-8">
            <a href="${base}/index.html" class="text-sm font-medium tracking-wide uppercase ${activePage === 'home' ? 'text-[#A3E635]' : 'text-gray-300 hover:text-[#A3E635]'} transition-colors">Home</a>

            <div class="nav-item relative">
              <a href="${base}/services/index.html" class="text-sm font-medium tracking-wide uppercase ${isServices ? 'text-[#A3E635]' : 'text-gray-300 hover:text-[#A3E635]'} transition-colors flex items-center gap-1">
                Services
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </a>
              <div class="nav-dropdown absolute top-full left-0 mt-2 w-64 bg-[#141414] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden">
                ${servicesDropdown}
              </div>
            </div>

            <a href="${base}/about.html" class="text-sm font-medium tracking-wide uppercase ${activePage === 'about' ? 'text-[#A3E635]' : 'text-gray-300 hover:text-[#A3E635]'} transition-colors">About Us</a>
            <a href="${base}/contact.html" class="text-sm font-medium tracking-wide uppercase ${activePage === 'contact' ? 'text-[#A3E635]' : 'text-gray-300 hover:text-[#A3E635]'} transition-colors">Contact</a>
          </nav>

          <div class="hidden lg:block">
            <a href="/quote" class="btn-accent inline-flex items-center px-6 py-2.5 rounded font-semibold text-sm tracking-wide uppercase">Get a Free Quote</a>
          </div>

          <button id="mobile-menu-btn" class="lg:hidden p-2 text-gray-300 hover:text-[#A3E635]" aria-label="Toggle menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" class="mobile-menu lg:hidden bg-[#0D0D0D] border-t border-[#1f1f1f]">
        <div class="px-4 py-4 space-y-1">
          <a href="${base}/index.html" class="block py-3 text-sm font-medium uppercase tracking-wide text-gray-300 hover:text-[#A3E635]">Home</a>
          <a href="${base}/services/index.html" class="block py-3 text-sm font-medium uppercase tracking-wide text-gray-300 hover:text-[#A3E635]">Services</a>
          ${mobileServicesLinks}
          <a href="${base}/about.html" class="block py-3 text-sm font-medium uppercase tracking-wide text-gray-300 hover:text-[#A3E635]">About Us</a>
          <a href="${base}/contact.html" class="block py-3 text-sm font-medium uppercase tracking-wide text-gray-300 hover:text-[#A3E635]">Contact</a>
          <a href="/quote" class="btn-accent block text-center mt-4 px-6 py-3 rounded font-semibold text-sm tracking-wide uppercase">Get a Free Quote</a>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  const base = getBasePath();
  const serviceLinks = SERVICES.map(
    (s) => `<li><a href="${base}${s.href.replace(/^\./, '')}" class="text-gray-400 hover:text-[#A3E635] transition-colors text-sm">${s.title}</a></li>`
  ).join('');

  return `
    <footer class="bg-black border-t border-[#1f1f1f]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img src="${base}/assets/logo.png" alt="${SITE.name}" class="h-10 w-auto mb-6" />
            <p class="text-gray-400 text-sm leading-relaxed">Premium commercial signage, vehicle graphics, and trade-quality printing for businesses that demand visibility and craftsmanship.</p>
          </div>
          <div>
            <h4 class="text-[#A3E635] font-semibold uppercase tracking-wider text-sm mb-4">Services</h4>
            <ul class="space-y-2">${serviceLinks}</ul>
          </div>
          <div>
            <h4 class="text-[#A3E635] font-semibold uppercase tracking-wider text-sm mb-4">Company</h4>
            <ul class="space-y-2">
              <li><a href="${base}/about.html" class="text-gray-400 hover:text-[#A3E635] transition-colors text-sm">About Us</a></li>
              <li><a href="${base}/contact.html" class="text-gray-400 hover:text-[#A3E635] transition-colors text-sm">Contact</a></li>
              <li><a href="/quote" class="text-gray-400 hover:text-[#A3E635] transition-colors text-sm">Request a Quote</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-[#A3E635] font-semibold uppercase tracking-wider text-sm mb-4">Get in Touch</h4>
            <ul class="space-y-3 text-sm text-gray-400">
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-[#4A4A4A] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>${SITE.addressLine1}<br />${SITE.addressLine2}</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5 text-[#4A4A4A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <a href="tel:${SITE.phone.replace(/\D/g, '')}" class="hover:text-[#A3E635] transition-colors">${SITE.phone}</a>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5 text-[#4A4A4A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <a href="mailto:${SITE.email}" class="hover:text-[#A3E635] transition-colors">${SITE.email}</a>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5 text-[#4A4A4A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                <a href="${SITE.website}" class="hover:text-[#A3E635] transition-colors" target="_blank" rel="noopener noreferrer">${SITE.websiteDisplay}</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-[#1f1f1f] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-[#4A4A4A] text-sm">&copy; ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</p>
          <div class="flex items-center gap-4">
            <a href="/privacy" class="text-[#4A4A4A] hover:text-[#A3E635] transition-colors text-sm">Privacy Policy</a>
            <span class="text-[#4A4A4A]">·</span>
            <p class="text-[#4A4A4A] text-sm">Premium Signs &amp; Commercial Printing</p>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function renderContactDetails() {
  return `
    <div class="space-y-6">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <div>
          <p class="font-semibold text-sm uppercase tracking-wider text-[#4A4A4A] mb-1">Address</p>
          <p class="text-gray-300">${SITE.addressLine1}<br />${SITE.addressLine2}</p>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        </div>
        <div>
          <p class="font-semibold text-sm uppercase tracking-wider text-[#4A4A4A] mb-1">Phone</p>
          <a href="tel:${SITE.phone.replace(/\D/g, '')}" class="text-gray-300 hover:text-[#A3E635] transition-colors">${SITE.phone}</a>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
        <div>
          <p class="font-semibold text-sm uppercase tracking-wider text-[#4A4A4A] mb-1">Email</p>
          <a href="mailto:${SITE.email}" class="text-gray-300 hover:text-[#A3E635] transition-colors">${SITE.email}</a>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
        </div>
        <div>
          <p class="font-semibold text-sm uppercase tracking-wider text-[#4A4A4A] mb-1">Website</p>
          <a href="${SITE.website}" class="text-gray-300 hover:text-[#A3E635] transition-colors" target="_blank" rel="noopener noreferrer">${SITE.websiteDisplay}</a>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="font-semibold text-sm uppercase tracking-wider text-[#4A4A4A] mb-1">Hours</p>
          <p class="text-gray-300">Mon – Fri: 7:00 AM – 5:00 PM<br />Sat: By appointment<br />Sun: Closed</p>
        </div>
      </div>
    </div>
  `;
}

function renderImageGrid(count, prefix = 'Photo') {
  return Array.from({ length: count }, (_, i) => `
    <div class="image-placeholder aspect-[4/3] rounded-lg" data-label="${prefix} ${i + 1} — Add Your Image"></div>
  `).join('');
}

function initLayout() {
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  const activePage = document.body.dataset.page || 'home';

  if (headerEl) headerEl.innerHTML = renderHeader(activePage);
  if (footerEl) footerEl.innerHTML = renderFooter();

  const contactDetailsEl = document.getElementById('contact-details');
  if (contactDetailsEl) contactDetailsEl.innerHTML = renderContactDetails();

  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
}

document.addEventListener('DOMContentLoaded', initLayout);
