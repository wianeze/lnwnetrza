(() => {
  'use strict';

  const MEASUREMENT_ID = 'G-N2LCP9P736';
  const CONSENT_KEY = 'ln_analytics_consent_v1';
  const SUBMISSION_KEY = 'ln_contact_submission_pending';
  const LEAD_KEY = 'ln_generate_lead_pending';
  const CONSENT_GRANTED = 'granted';
  const CONSENT_DENIED = 'denied';

  let analyticsGranted = false;
  let tagLoadStarted = false;
  let pageViewSent = false;

  const readStorage = (storage, key) => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  };

  const writeStorage = (storage, key, value) => {
    try {
      storage.setItem(key, value);
    } catch {
      // Brak storage nie może blokować działania strony ani formularza.
    }
  };

  const removeStorage = (storage, key) => {
    try {
      storage.removeItem(key);
    } catch {
      // Brak storage nie może blokować działania strony ani formularza.
    }
  };

  const removeAnalyticsCookies = () => {
    const cookieNames = document.cookie
      .split(';')
      .map(cookie => cookie.split('=')[0].trim())
      .filter(name => name === '_ga' || name.startsWith('_ga_'));

    if (!cookieNames.length) return;

    const hostname = window.location.hostname;
    const hostParts = hostname.split('.');
    const rootDomain = hostParts.length > 1 ? `.${hostParts.slice(-2).join('.')}` : '';
    const domains = ['', hostname, `.${hostname}`, rootDomain].filter((domain, index, list) => domain !== '' || index === 0).filter((domain, index, list) => list.indexOf(domain) === index);

    cookieNames.forEach(name => {
      domains.forEach(domain => {
        const domainAttribute = domain ? `; domain=${domain}` : '';
        document.cookie = `${name}=; Max-Age=0; path=/${domainAttribute}; SameSite=Lax`;
      });
    });
  };

  const pageLocation = () => window.location.href.split('#')[0];

  const eventParameters = extra => ({
    page_location: pageLocation(),
    page_title: document.title,
    ...extra
  });

  const sendEvent = (name, parameters = {}) => {
    if (!analyticsGranted || typeof window.gtag !== 'function') return;
    window.gtag('event', name, eventParameters(parameters));
  };

  const sendPageView = () => {
    if (pageViewSent || !analyticsGranted) return;
    pageViewSent = true;
    sendEvent('page_view');
  };

  const sendPendingLead = () => {
    if (readStorage(sessionStorage, LEAD_KEY) !== '1' || !analyticsGranted) return;
    sendEvent('generate_lead', {
      form_id: 'contactForm',
      lead_source: 'contact_form'
    });
    removeStorage(sessionStorage, LEAD_KEY);
  };

  const updateConsent = granted => {
    analyticsGranted = granted;
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  };

  const loadGoogleAnalytics = () => {
    if (tagLoadStarted) {
      updateConsent(true);
      sendPageView();
      sendPendingLead();
      return;
    }

    tagLoadStarted = true;
    updateConsent(true);
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    sendPageView();
    sendPendingLead();
  };

  const cleanFormStatusFromUrl = () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('form')) return;
    url.searchParams.delete('form');
    const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, document.title, cleanUrl);
  };

  const prepareFormTracking = () => {
    const form = document.querySelector('#contactForm');
    form?.addEventListener('submit', () => {
      writeStorage(sessionStorage, SUBMISSION_KEY, '1');
    });

    const formStatus = new URLSearchParams(window.location.search).get('form');
    const submissionPending = readStorage(sessionStorage, SUBMISSION_KEY) === '1';

    if (formStatus === 'success' && submissionPending) {
      writeStorage(sessionStorage, LEAD_KEY, '1');
    }

    if (formStatus === 'success' || formStatus === 'error' || formStatus === 'fail') {
      removeStorage(sessionStorage, SUBMISSION_KEY);
      cleanFormStatusFromUrl();
    }
  };

  const trackLinkClicks = () => {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || !analyticsGranted) return;

      const href = link.getAttribute('href') || '';
      const absoluteUrl = link.href;

      if (href.startsWith('tel:')) {
        sendEvent('click_phone', { link_type: 'phone' });
        return;
      }

      if (href.startsWith('mailto:')) {
        sendEvent('click_email', { link_type: 'email' });
        return;
      }

      if (/^https?:\/\/(?:www\.)?instagram\.com\//i.test(absoluteUrl)) {
        sendEvent('click_instagram', {
          link_url: absoluteUrl,
          link_text: (link.getAttribute('aria-label') || link.textContent || 'Instagram').trim()
        });
        return;
      }

      if (/^https?:\/\/(?:www\.)?facebook\.com\//i.test(absoluteUrl)) {
        sendEvent('click_facebook', {
          link_url: absoluteUrl,
          link_text: (link.getAttribute('aria-label') || link.textContent || 'Facebook').trim()
        });
      }
    });
  };

  const initConsentBanner = () => {
    const banner = document.querySelector('#cookieConsent');
    const acceptButton = document.querySelector('#cookieAccept');
    const rejectButton = document.querySelector('#cookieReject');
    const settingsButton = document.querySelector('#cookieSettings');
    const storedConsent = readStorage(localStorage, CONSENT_KEY);

    if (!banner || !acceptButton || !rejectButton) return;

    const showBanner = () => {
      banner.hidden = false;
      acceptButton.focus();
    };

    const acceptAnalytics = () => {
      writeStorage(localStorage, CONSENT_KEY, CONSENT_GRANTED);
      banner.hidden = true;
      loadGoogleAnalytics();
    };

    const rejectAnalytics = () => {
      writeStorage(localStorage, CONSENT_KEY, CONSENT_DENIED);
      banner.hidden = true;
      updateConsent(false);
      removeStorage(sessionStorage, LEAD_KEY);
      removeAnalyticsCookies();
    };

    acceptButton.addEventListener('click', acceptAnalytics);
    rejectButton.addEventListener('click', rejectAnalytics);
    settingsButton?.addEventListener('click', showBanner);

    if (storedConsent === CONSENT_GRANTED) {
      loadGoogleAnalytics();
      return;
    }

    if (storedConsent === CONSENT_DENIED) {
      updateConsent(false);
      removeStorage(sessionStorage, LEAD_KEY);
      return;
    }

    showBanner();
  };

  prepareFormTracking();
  trackLinkClicks();
  initConsentBanner();
})();
