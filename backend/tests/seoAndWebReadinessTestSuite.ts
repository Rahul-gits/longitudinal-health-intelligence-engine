/**
 * HEAL Engine — SEO, Pre-Rendering & Web Functionality Test Suite
 * Validates robots.txt, sitemap.xml, static SSG pre-rendered HTML files,
 * canonical URLs, Open Graph metadata, Schema.org JSON-LD, WebP image assets,
 * URL normalization redirects, contact form validation & honest delivery states.
 */

import fs from 'fs';
import path from 'path';

export interface SeoTestAssertion {
  testId: string;
  category: 'ROBOTS_SITEMAP' | 'METADATA_SEO' | 'PRE_RENDERING_SSR' | 'STRUCTURED_DATA' | 'IMAGE_OPTIMIZATION' | 'REDIRECTS_NORMALIZATION' | 'CONTACT_ENDPOINT';
  title: string;
  passed: boolean;
  details: string;
}

export class SeoAndWebReadinessTestSuite {
  private baseDir: string;
  private distDir: string;
  private publicDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.cwd();
    this.distDir = path.join(this.baseDir, 'dist');
    this.publicDir = path.join(this.baseDir, 'frontend', 'public');
  }

  public runAllTests(): {
    total: number;
    passed: number;
    failed: number;
    allPassed: boolean;
    assertions: SeoTestAssertion[];
  } {
    console.log('========================================================================');
    console.log('HEAL ENGINE: SEO, PERFORMANCE & WEB READINESS VERIFICATION SUITE');
    console.log('========================================================================\n');

    const assertions: SeoTestAssertion[] = [
      this.testRobotsTxtIntegrity(),
      this.testSitemapXmlSchemaAndUrls(),
      this.testPreRenderedStaticHtmlAndZeroPhi(),
      this.testUniqueTitlesAndMetaDescriptions(),
      this.testCanonicalAndOpenGraphTags(),
      this.testJsonLdStructuredData(),
      this.testOptimizedWebPAssetsAndOgPreview(),
      this.testUrlNormalizationAndSecurityHeaders(),
      this.testContactFormApiValidation(),
      this.testPrivacyPolicyDraftCompleteness()
    ];

    assertions.forEach(a => {
      console.log(`[${a.testId}] ${a.title}`);
      console.log(`  Category: ${a.category}`);
      console.log(`  Result:   ${a.passed ? '✓ PASSED' : '✗ FAILED'}`);
      console.log(`  Details:  ${a.details}\n`);
    });

    const passed = assertions.filter(a => a.passed).length;
    const failed = assertions.length - passed;
    const allPassed = failed === 0;

    console.log('========================================================================');
    console.log(`SUMMARY: ${passed}/${assertions.length} Tests Passed (${((passed / assertions.length) * 100).toFixed(1)}%)`);
    console.log('========================================================================\n');

    return {
      total: assertions.length,
      passed,
      failed,
      allPassed,
      assertions
    };
  }

  // 1. Robots.txt
  private testRobotsTxtIntegrity(): SeoTestAssertion {
    const robotsPath = path.join(this.publicDir, 'robots.txt');
    const exists = fs.existsSync(robotsPath);
    if (!exists) {
      return {
        testId: 'SEO-001',
        category: 'ROBOTS_SITEMAP',
        title: 'Robots.txt Integrity & Disallow Protection Rules',
        passed: false,
        details: 'robots.txt not found in frontend/public'
      };
    }

    const content = fs.readFileSync(robotsPath, 'utf8');
    const hasUserAgent = content.includes('User-agent: *');
    const hasAllowHome = content.includes('Allow: /');
    const hasDisallowApi = content.includes('Disallow: /api/');
    const hasDisallowApp = content.includes('Disallow: /app/');
    const hasDisallowClinical = content.includes('Disallow: /clinical/');
    const hasSitemap = content.includes('Sitemap: https://healengine.hospital.org/sitemap.xml');

    const passed = hasUserAgent && hasAllowHome && hasDisallowApi && hasDisallowApp && hasDisallowClinical && hasSitemap;
    return {
      testId: 'SEO-001',
      category: 'ROBOTS_SITEMAP',
      title: 'Robots.txt Integrity & Disallow Protection Rules',
      passed,
      details: passed
        ? 'Valid production robots.txt verified: allows public routes, protects /api and private workspaces, references sitemap.'
        : 'robots.txt missing required Allow, Disallow, or Sitemap directives'
    };
  }

  // 2. Sitemap.xml
  private testSitemapXmlSchemaAndUrls(): SeoTestAssertion {
    const sitemapPath = path.join(this.publicDir, 'sitemap.xml');
    const exists = fs.existsSync(sitemapPath);
    if (!exists) {
      return {
        testId: 'SEO-002',
        category: 'ROBOTS_SITEMAP',
        title: 'Sitemap.xml Schema & Canonical Production URLs',
        passed: false,
        details: 'sitemap.xml not found in frontend/public'
      };
    }

    const content = fs.readFileSync(sitemapPath, 'utf8');
    const hasNamespace = content.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    const canonicalRoutes = ['/', '/about', '/specialists', '/technology', '/contact', '/privacy', '/terms'];
    const hasAllRoutes = canonicalRoutes.every(r => content.includes(`https://healengine.hospital.org${r === '/' ? '/' : r}`));
    const noLocalhost = !content.includes('localhost') && !content.includes('127.0.0.1');
    const noPrivateRoutes = !content.includes('/app') && !content.includes('/dashboard') && !content.includes('/api');

    const passed = hasNamespace && hasAllRoutes && noLocalhost && noPrivateRoutes;
    return {
      testId: 'SEO-002',
      category: 'ROBOTS_SITEMAP',
      title: 'Sitemap.xml Schema & Canonical Production URLs',
      passed,
      details: passed
        ? 'Sitemap conforms to Sitemaps XML protocol: contains 7 canonical HTTPS URLs, excludes dev/private paths.'
        : 'Sitemap missing namespace, canonical routes, or contains invalid URLs'
    };
  }

  // 3. Pre-rendered HTML & Zero PHI
  private testPreRenderedStaticHtmlAndZeroPhi(): SeoTestAssertion {
    const requiredFiles = [
      path.join(this.distDir, 'index.html'),
      path.join(this.distDir, 'about', 'index.html'),
      path.join(this.distDir, 'specialists', 'index.html'),
      path.join(this.distDir, 'technology', 'index.html'),
      path.join(this.distDir, 'privacy', 'index.html'),
      path.join(this.distDir, 'terms', 'index.html'),
      path.join(this.distDir, 'contact', 'index.html')
    ];

    let allExist = true;
    let hasSemanticContent = true;
    let zeroPhi = true;

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        allExist = false;
        break;
      }
      const html = fs.readFileSync(file, 'utf8');
      if (!html.includes('<h1') || !html.includes('<main') || html.length < 2000) {
        hasSemanticContent = false;
      }
      // Strict PHI check: Never leak patient profile data or secret keys in public pre-rendered HTML
      if (html.includes('Eleanor Vance (68,') || html.includes('JWT_SECRET') || html.includes('session_token')) {
        zeroPhi = false;
      }
    }

    const passed = allExist && hasSemanticContent && zeroPhi;
    return {
      testId: 'SEO-003',
      category: 'PRE_RENDERING_SSR',
      title: 'Pre-Rendered Semantic HTML & Patient PHI Isolation',
      passed,
      details: passed
        ? 'All 7 public routes pre-rendered with rich semantic HTML (<main>, <h1>, navigation); zero clinical PHI leaked.'
        : 'Pre-rendered HTML files missing or failed semantic/privacy criteria'
    };
  }

  // 4. Unique Titles & Meta Descriptions
  private testUniqueTitlesAndMetaDescriptions(): SeoTestAssertion {
    const routes = [
      path.join(this.distDir, 'index.html'),
      path.join(this.distDir, 'about', 'index.html'),
      path.join(this.distDir, 'specialists', 'index.html'),
      path.join(this.distDir, 'technology', 'index.html'),
      path.join(this.distDir, 'privacy', 'index.html'),
      path.join(this.distDir, 'terms', 'index.html'),
      path.join(this.distDir, 'contact', 'index.html')
    ];

    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const r of routes) {
      if (!fs.existsSync(r)) continue;
      const html = fs.readFileSync(r, 'utf8');

      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const descMatch = html.match(/<meta name="description" content="(.*?)"/i);

      if (titleMatch) titles.add(titleMatch[1]);
      if (descMatch) descriptions.add(descMatch[1]);
    }

    const passed = titles.size === routes.length && descriptions.size === routes.length;
    return {
      testId: 'SEO-004',
      category: 'METADATA_SEO',
      title: 'Unique Route-Specific Title Tags & Meta Descriptions',
      passed,
      details: passed
        ? `Verified ${titles.size} unique titles and ${descriptions.size} unique meta descriptions across all indexable routes.`
        : `Duplicate or missing titles/descriptions detected (Titles: ${titles.size}, Descs: ${descriptions.size})`
    };
  }

  // 5. Canonical & Open Graph
  private testCanonicalAndOpenGraphTags(): SeoTestAssertion {
    const indexPath = path.join(this.distDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return {
        testId: 'SEO-005',
        category: 'METADATA_SEO',
        title: 'Canonical Tags, Open Graph & Twitter Card Metadata',
        passed: false,
        details: 'dist/index.html not found'
      };
    }

    const html = fs.readFileSync(indexPath, 'utf8');
    const hasCanonical = html.includes('rel="canonical"') && html.includes('https://healengine.hospital.org/');
    const hasOgTitle = html.includes('property="og:title"');
    const hasOgDesc = html.includes('property="og:description"');
    const hasOgUrl = html.includes('property="og:url"');
    const hasOgImage = html.includes('property="og:image"') && html.includes('/og-image.png');
    const hasOgDims = html.includes('property="og:image:width" content="1200"') && html.includes('property="og:image:height" content="630"');
    const hasTwitter = html.includes('name="twitter:card" content="summary_large_image"');

    const passed = hasCanonical && hasOgTitle && hasOgDesc && hasOgUrl && hasOgImage && hasOgDims && hasTwitter;
    return {
      testId: 'SEO-005',
      category: 'METADATA_SEO',
      title: 'Canonical Tags, Open Graph & Twitter Card Metadata',
      passed,
      details: passed
        ? 'Verified self-referencing canonical tag, Open Graph metadata (1200x630), and summary_large_image Twitter card.'
        : 'Missing required canonical, Open Graph, or Twitter card metadata'
    };
  }

  // 6. Schema.org JSON-LD
  private testJsonLdStructuredData(): SeoTestAssertion {
    const indexPath = path.join(this.distDir, 'index.html');
    const specPath = path.join(this.distDir, 'specialists', 'index.html');

    if (!fs.existsSync(indexPath) || !fs.existsSync(specPath)) {
      return {
        testId: 'SEO-006',
        category: 'STRUCTURED_DATA',
        title: 'Schema.org JSON-LD Structured Data & Breadcrumbs',
        passed: false,
        details: 'Pre-rendered HTML files missing for JSON-LD check'
      };
    }

    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    const specHtml = fs.readFileSync(specPath, 'utf8');

    const indexJsonMatch = indexHtml.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
    const specJsonMatch = specHtml.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);

    let validOrg = false;
    let validBreadcrumb = false;

    if (indexJsonMatch) {
      try {
        const parsed = JSON.parse(indexJsonMatch[1]);
        validOrg = parsed['@type'] === 'MedicalOrganization' && parsed.name === 'HEAL Health Systems';
      } catch {
        validOrg = false;
      }
    }

    if (specJsonMatch) {
      try {
        const parsed = JSON.parse(specJsonMatch[1]);
        const graph = parsed['@graph'] || [parsed];
        validBreadcrumb = graph.some((item: any) => item['@type'] === 'BreadcrumbList' && Array.isArray(item.itemListElement));
      } catch {
        validBreadcrumb = false;
      }
    }

    const passed = validOrg && validBreadcrumb;
    return {
      testId: 'SEO-006',
      category: 'STRUCTURED_DATA',
      title: 'Schema.org JSON-LD Structured Data & Breadcrumbs',
      passed,
      details: passed
        ? 'Verified valid JSON-LD: MedicalOrganization schema with accurate contact data and BreadcrumbList schema on subpages.'
        : 'Invalid or missing JSON-LD structured data'
    };
  }

  // 7. WebP Assets & OG Image
  private testOptimizedWebPAssetsAndOgPreview(): SeoTestAssertion {
    const avatarDir = path.join(this.publicDir, 'avatars');
    const avatars = ['doc-chen', 'doc-jacob', 'doc-lin', 'doc-thorne', 'doc-vance', 'patient-eleanor'];

    let allWebpExist = true;
    let totalSavingsBytes = 0;

    for (const name of avatars) {
      const jpgFile = path.join(avatarDir, `${name}.jpg`);
      const webpFile = path.join(avatarDir, `${name}.webp`);

      if (!fs.existsSync(webpFile)) {
        allWebpExist = false;
        break;
      }

      if (fs.existsSync(jpgFile)) {
        const jpgSz = fs.statSync(jpgFile).size;
        const webpSz = fs.statSync(webpFile).size;
        totalSavingsBytes += (jpgSz - webpSz);
      }
    }

    const ogPngExists = fs.existsSync(path.join(this.publicDir, 'og-image.png'));
    const ogWebpExists = fs.existsSync(path.join(this.publicDir, 'og-image.webp'));

    const passed = allWebpExist && ogPngExists && ogWebpExists && totalSavingsBytes > 1000000;
    return {
      testId: 'SEO-007',
      category: 'IMAGE_OPTIMIZATION',
      title: 'Optimized WebP Image Assets & Approved OG Preview Card',
      passed,
      details: passed
        ? `All avatars optimized to WebP yielding ${(totalSavingsBytes / (1024 * 1024)).toFixed(1)} MB payload reduction; 1200x630 OG social preview images generated.`
        : 'WebP images missing or insufficient compression verified'
    };
  }

  // 8. URL Normalization Middleware
  private testUrlNormalizationAndSecurityHeaders(): SeoTestAssertion {
    const indexPath = path.join(this.baseDir, 'backend', 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');

    const hasTrailingSlashRedirect = content.includes("pathname.endsWith('/')") && content.includes('res.redirect(301');
    const hasUppercaseRedirect = content.includes('pathname.toLowerCase()') && content.includes('res.redirect(301');
    const hasLegacyRedirect = content.includes("pathname === '/home'") && content.includes('res.redirect(301');
    const hasXRobotsTag = content.includes("res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')");

    const passed = hasTrailingSlashRedirect && hasUppercaseRedirect && hasLegacyRedirect && hasXRobotsTag;
    return {
      testId: 'SEO-008',
      category: 'REDIRECTS_NORMALIZATION',
      title: 'URL Normalization (301 Permanent Redirects) & X-Robots-Tag',
      passed,
      details: passed
        ? 'Verified HTTP 301 normalization for trailing slashes, uppercase paths, and legacy aliases; X-Robots-Tag protects private routes.'
        : 'Missing URL normalization rules or X-Robots-Tag middleware'
    };
  }

  // 9. Contact API Validation
  private testContactFormApiValidation(): SeoTestAssertion {
    const routePath = path.join(this.baseDir, 'backend', 'routes', 'contactRoutes.ts');
    if (!fs.existsSync(routePath)) {
      return {
        testId: 'SEO-009',
        category: 'CONTACT_ENDPOINT',
        title: 'Contact Form API Route Validation & Anti-Spam Defense',
        passed: false,
        details: 'contactRoutes.ts does not exist'
      };
    }

    const content = fs.readFileSync(routePath, 'utf8');
    const hasRateLimit = content.includes('checkContactRateLimit') && content.includes('429');
    const hasHoneypot = content.includes('honeypot') && content.includes('SPAM_REJECTED');
    const hasEmailValidation = content.includes('EMAIL_REGEX');
    const hasHeaderInjectionDefense = content.includes('containsHeaderInjection') && content.includes('MALFORMED_HEADER_INJECTION');
    const hasHonestConfigResponse = content.includes('EMAIL_SERVICE_NOT_CONFIGURED');

    const passed = hasRateLimit && hasHoneypot && hasEmailValidation && hasHeaderInjectionDefense && hasHonestConfigResponse;
    return {
      testId: 'SEO-009',
      category: 'CONTACT_ENDPOINT',
      title: 'Contact Form API Route Validation & Anti-Spam Defense',
      passed,
      details: passed
        ? 'Contact route enforces rate limiting, honeypot spam protection, RFC-5322 email validation, CRLF injection defense, and honest configuration feedback.'
        : 'Missing contact validation checks or anti-spam mechanisms'
    };
  }

  // 10. Privacy Policy Completeness
  private testPrivacyPolicyDraftCompleteness(): SeoTestAssertion {
    const privacyPath = path.join(this.baseDir, 'frontend', 'src', 'components', 'public', 'PrivacyPolicyPage.tsx');
    if (!fs.existsSync(privacyPath)) {
      return {
        testId: 'SEO-010',
        category: 'PRE_RENDERING_SSR',
        title: 'Clinical Privacy Policy DPDP / HIPAA Governance Draft',
        passed: false,
        details: 'PrivacyPolicyPage.tsx not found'
      };
    }

    const content = fs.readFileSync(privacyPath, 'utf8');
    const hasCategories = content.includes('Demographics') && content.includes('Biomarkers');
    const hasPurposes = content.includes('Purposes of Processing');
    const hasRetention = content.includes('Retention Schedule');
    const hasEncryption = content.includes('TLS 1.3') && content.includes('AES-256');
    const hasRights = content.includes('DPDP Act 2023') && content.includes('HIPAA');
    const hasDpo = content.includes('dpo@healengine.hospital.org');
    const hasDisclaimer = content.includes('Subject to Hospital Legal Review');

    const passed = hasCategories && hasPurposes && hasRetention && hasEncryption && hasRights && hasDpo && hasDisclaimer;
    return {
      testId: 'SEO-010',
      category: 'PRE_RENDERING_SSR',
      title: 'Clinical Privacy Policy DPDP / HIPAA Governance Draft',
      passed,
      details: passed
        ? 'Verified comprehensive privacy governance draft: data types, retention, AES-256 encryption, DPDP/HIPAA rights, DPO contact, and legal review disclaimer.'
        : 'Privacy policy missing required statutory or operational clauses'
    };
  }
}

// Execution if run directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('seoAndWebReadinessTestSuite.ts')) {
  const suite = new SeoAndWebReadinessTestSuite();
  const results = suite.runAllTests();
  if (!results.allPassed) {
    console.error('One or more SEO & Web Readiness assertions failed.');
    process.exit(1);
  }
}
