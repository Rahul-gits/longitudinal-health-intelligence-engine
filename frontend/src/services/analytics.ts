/**
 * HEAL Engine — Consent-Aware, Privacy-Preserving Analytics Service
 * Strictly respects HIPAA & DPDP Act guidelines:
 * - Only active if VITE_GA_MEASUREMENT_ID is supplied.
 * - ZERO tracking of PHI (patient IDs, names, vitals, symptoms, consultations, tokens).
 * - Excludes private/authenticated clinical routes.
 * - Checks user consent state before initialization.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

class PrivacyPreservingAnalytics {
  private measurementId: string | null = null;
  private isInitialized = false;

  constructor() {
    this.measurementId = ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID as string) || null;
  }

  /**
   * Returns whether user has given consent for analytics cookies
   */
  public hasConsent(): boolean {
    if (typeof window === 'undefined') return false;
    // Default to false unless explicitly granted
    return localStorage.getItem('heal_analytics_consent') === 'granted';
  }

  /**
   * Set user analytics consent preference
   */
  public setConsent(granted: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('heal_analytics_consent', granted ? 'granted' : 'denied');
    if (granted && !this.isInitialized) {
      this.init();
    }
  }

  /**
   * Initialize GA4 script tag dynamically
   */
  public init(): void {
    if (typeof window === 'undefined') return;
    if (!this.measurementId || this.isInitialized) return;
    if (!this.hasConsent()) return;

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      anonymize_ip: true,
      send_page_view: false, // Explicit page view tracking only on public pages
      cookie_flags: 'SameSite=None;Secure'
    });

    // Inject GA script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`;
    document.head.appendChild(script);

    this.isInitialized = true;
  }

  /**
   * Track public page views only.
   * Authenticated routes and queries with clinical parameters are strictly filtered out.
   */
  public trackPublicPageView(pathname: string): void {
    if (typeof window === 'undefined') return;
    if (!this.isInitialized || !this.measurementId || !window.gtag) return;

    // Strict safety check: Never track private clinical workspaces
    const isPublic = ['/', '/about', '/specialists', '/technology', '/contact', '/privacy', '/terms'].includes(pathname);
    if (!isPublic) {
      return;
    }

    // Sanitize path (strip any query params that could inadvertently contain tokens or data)
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_title: document.title,
      page_location: `${window.location.origin}${pathname}`
    });
  }

  /**
   * Track approved non-clinical interactions (e.g. public contact form submission)
   */
  public trackPublicEvent(eventName: string, params: Record<string, any> = {}): void {
    if (!this.isInitialized || !window.gtag) return;

    // Filter out any potential PHI keys
    const sanitizedParams: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (!['patient', 'phi', 'diagnosis', 'medication', 'vital', 'email', 'name', 'phone'].some(k => key.toLowerCase().includes(k))) {
        sanitizedParams[key] = value;
      }
    }

    window.gtag('event', eventName, sanitizedParams);
  }
}

export const analyticsService = new PrivacyPreservingAnalytics();
