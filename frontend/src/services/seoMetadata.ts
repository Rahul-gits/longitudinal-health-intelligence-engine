/**
 * HEAL Engine — SEO Metadata, OpenGraph & Structured Data Manager
 * Manages document head tags, canonical links, social sharing metadata,
 * and Schema.org JSON-LD structured data dynamically without conflicts.
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  isPublic: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
  structuredData?: Record<string, any>;
}

export const BASE_SITE_URL = (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://healengine.hospital.org'
);

export const PUBLIC_ROUTES_METADATA: Record<string, PageSeoConfig> = {
  '/': {
    title: 'HEAL Engine | Longitudinal Clinical Intelligence & Specialist OS',
    description: 'Clinical-grade longitudinal health intelligence operating system uniting 3D digital specialists, multi-agent clinical consensus, and deterministic safety gates.',
    canonicalPath: '/',
    isPublic: true,
    ogImage: `${BASE_SITE_URL}/og-image.png`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'MedicalOrganization',
      'name': 'HEAL Health Systems',
      'alternateName': 'HEAL Engine',
      'url': BASE_SITE_URL,
      'logo': `${BASE_SITE_URL}/favicon.svg`,
      'description': 'Longitudinal Clinical Decision Intelligence Operating System with multi-agent consensus and deterministic cardiorenal safety interlocks.',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+1-800-555-4325',
        'contactType': 'Clinical Inquiries & Security',
        'email': 'dpo@healengine.hospital.org',
        'availableLanguage': ['English']
      }
    }
  },
  '/about': {
    title: 'About HEAL Engine | Clinical Decision Intelligence Philosophy',
    description: 'Learn how HEAL Engine delivers longitudinal clinical intelligence, human-in-the-loop governance, and verifiable multi-agent care consensus.',
    canonicalPath: '/about',
    isPublic: true,
    ogImage: `${BASE_SITE_URL}/og-image.png`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About HEAL Engine', path: '/about' }
    ]
  },
  '/specialists': {
    title: '3D Digital Clinical Specialists | HEAL Engine',
    description: 'Meet HEAL Engine\'s 3D specialist personas across cardiology, nephrology, endocrinology, and clinical pharmacology for longitudinal case reviews.',
    canonicalPath: '/specialists',
    isPublic: true,
    ogImage: `${BASE_SITE_URL}/og-image.png`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: '3D Digital Specialists', path: '/specialists' }
    ]
  },
  '/technology': {
    title: 'Clinical Safety & Architecture | HEAL Engine OS',
    description: 'Explore HEAL Engine\'s deterministic safety gates, FHIR R4 interoperability, particle swarm optimization, and evidence provenance architecture.',
    canonicalPath: '/technology',
    isPublic: true,
    ogImage: `${BASE_SITE_URL}/og-image.png`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Technology & Safety', path: '/technology' }
    ]
  },
  '/contact': {
    title: 'Contact & Clinical Inquiries | HEAL Engine',
    description: 'Get in touch with HEAL Engine clinical engineering, institutional deployment teams, and data protection officers.',
    canonicalPath: '/contact',
    isPublic: true,
    ogImage: `${BASE_SITE_URL}/og-image.png`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact & Support', path: '/contact' }
    ]
  },
  '/privacy': {
    title: 'Privacy Policy | HEAL Engine Patient Data Governance',
    description: 'Comprehensive data governance policy detailing DPDP Act 2023 and HIPAA alignment, end-to-end encryption, retention rules, and patient rights.',
    canonicalPath: '/privacy',
    isPublic: true,
    ogImage: `${BASE_SITE_URL}/og-image.png`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy' }
    ]
  },
  '/terms': {
    title: 'Terms of Service & Clinical Governance | HEAL Engine',
    description: 'Terms of service, clinical decision support disclaimers, and human-in-the-loop governance requirements for HEAL Engine.',
    canonicalPath: '/terms',
    isPublic: true,
    ogImage: `${BASE_SITE_URL}/og-image.png`,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms of Service', path: '/terms' }
    ]
  }
};

/**
 * Updates DOM head elements dynamically based on route configuration
 */
export function applyPageSeoMetadata(pathname: string): void {
  if (typeof document === 'undefined') return;

  const config = PUBLIC_ROUTES_METADATA[pathname] || {
    title: 'HEAL Engine | Clinical Intelligence Workspace',
    description: 'Secure clinical workspace session. Protected under health data governance.',
    canonicalPath: pathname,
    isPublic: false
  };

  // 1. Document Title
  document.title = config.title;

  // 2. Meta Description
  setMetaTag('name', 'description', config.description);

  // 3. Robots Tag (Strict Isolation: noindex for private authenticated routes)
  if (config.isPublic) {
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  } else {
    setMetaTag('name', 'robots', 'noindex, nofollow, noarchive');
  }

  // 4. Canonical Tag
  const canonicalUrl = `${BASE_SITE_URL}${config.canonicalPath}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalUrl;

  // 5. OpenGraph Tags
  setMetaTag('property', 'og:type', config.ogType || 'website');
  setMetaTag('property', 'og:site_name', 'HEAL Engine');
  setMetaTag('property', 'og:title', config.title);
  setMetaTag('property', 'og:description', config.description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:locale', 'en_US');
  setMetaTag('property', 'og:image', config.ogImage || `${BASE_SITE_URL}/og-image.png`);
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');
  setMetaTag('property', 'og:image:alt', 'HEAL Engine — Longitudinal Clinical Intelligence OS');

  // 6. Twitter / X Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', config.title);
  setMetaTag('name', 'twitter:description', config.description);
  setMetaTag('name', 'twitter:image', config.ogImage || `${BASE_SITE_URL}/og-image.png`);

  // 7. Structured Data (JSON-LD)
  updateStructuredDataScript(config);
}

function setMetaTag(keyType: 'name' | 'property', key: string, content: string): void {
  let element = document.querySelector(`meta[${keyType}="${key}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(keyType, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateStructuredDataScript(config: PageSeoConfig): void {
  // Remove existing JSON-LD scripts
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-heal-seo="true"]');
  existingScripts.forEach(el => el.remove());

  if (!config.isPublic) return;

  const schemas: any[] = [];

  // Page specific or organization schema
  if (config.structuredData) {
    schemas.push(config.structuredData);
  }

  // Breadcrumbs schema
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': config.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': b.name,
        'item': `${BASE_SITE_URL}${b.path}`
      }))
    });
  }

  if (schemas.length > 0) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-heal-seo', 'true');
    script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : { '@context': 'https://schema.org', '@graph': schemas });
    document.head.appendChild(script);
  }
}
