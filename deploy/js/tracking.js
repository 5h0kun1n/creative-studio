/**
 * Creative Studio — Tracking & Analytics
 *
 * Loads GTM, captures UTM params, and exposes event helpers.
 * Drop this script on every page of creativstudio.co (Netlify).
 * Shopify pages use GTM directly (installed in theme.liquid).
 *
 * Usage:
 *   <script src="/js/tracking.js" data-gtm="GTM-PV35GJLJ"></script>
 *
 * Replace GTM-XXXXXXX with your real GTM container ID.
 * Meta Pixel is loaded inside GTM (not here) so it stays in one place.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. dataLayer init
  // ---------------------------------------------------------------------------
  window.dataLayer = window.dataLayer || [];

  // ---------------------------------------------------------------------------
  // 2. Load GTM from the data-gtm attribute on this <script> tag
  // ---------------------------------------------------------------------------
  var scriptTag = document.currentScript;
  var gtmId = scriptTag && scriptTag.getAttribute('data-gtm');

  if (gtmId) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', gtmId);
  }

  // ---------------------------------------------------------------------------
  // 3. UTM capture — read from URL, persist in sessionStorage
  // ---------------------------------------------------------------------------
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var params = new URLSearchParams(window.location.search);
  var utmData = {};

  UTM_KEYS.forEach(function (key) {
    var val = params.get(key);
    if (val) {
      utmData[key] = val;
      try { sessionStorage.setItem(key, val); } catch (e) { /* private browsing */ }
    } else {
      try { utmData[key] = sessionStorage.getItem(key) || ''; } catch (e) { utmData[key] = ''; }
    }
  });

  utmData.landing_page = utmData.landing_page ||
    (function () {
      try { return sessionStorage.getItem('landing_page') || window.location.href; } catch (e) { return window.location.href; }
    })();
  try { sessionStorage.setItem('landing_page', utmData.landing_page); } catch (e) { /* */ }

  // Expose for other scripts
  window.__csUtm = utmData;

  // ---------------------------------------------------------------------------
  // 4. Auto-fill hidden UTM fields in any form on the page
  // ---------------------------------------------------------------------------
  function fillUtmFields() {
    UTM_KEYS.concat(['landing_page']).forEach(function (key) {
      var fields = document.querySelectorAll('input[name="' + key + '"]');
      fields.forEach(function (f) {
        if (!f.value) f.value = utmData[key] || '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillUtmFields);
  } else {
    fillUtmFields();
  }

  // ---------------------------------------------------------------------------
  // 5. Event helpers
  // ---------------------------------------------------------------------------

  /**
   * Push a custom event to dataLayer (triggers GTM tags).
   * @param {string} eventName - e.g. 'QuoteSubmitted', 'Call'
   * @param {Object} [extra]   - additional key/value pairs
   */
  window.csTrack = function (eventName, extra) {
    var payload = { event: eventName };
    UTM_KEYS.forEach(function (k) { payload[k] = utmData[k] || ''; });
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; });
    }
    window.dataLayer.push(payload);
  };

  // ---------------------------------------------------------------------------
  // 6. Click-to-call tracking — auto-bind to all tel: links
  // ---------------------------------------------------------------------------
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (link) {
      var location = link.closest('header') ? 'header' :
        link.closest('footer') ? 'footer' :
        link.closest('.quote-form') ? 'quote_page' : 'page';
      window.csTrack('Call', { clickLocation: location });
    }
  });

  // ---------------------------------------------------------------------------
  // 7. Quote form submission handler
  // ---------------------------------------------------------------------------
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList.contains('quote-form')) return;

    fillUtmFields();

    var service = form.querySelector('[name="service"]');
    var timeline = form.querySelector('[name="timeline"]');

    window.csTrack('QuoteSubmitted', {
      formType: 'quote',
      service: service ? service.value : '',
      timeline: timeline ? timeline.value : ''
    });
  });

})();
