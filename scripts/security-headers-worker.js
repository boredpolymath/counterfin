/**
 * Cloudflare Worker: SettleMint Edge Security Headers
 * 
 * Purpose:
 *   GitHub Pages natively emits 'Server: GitHub.com' and 'Access-Control-Allow-Origin: *'
 *   while omitting custom response headers. When routing via Cloudflare (or a reverse proxy),
 *   this Worker intercepts requests, strips server disclosures, restricts CORS, and attaches
 *   the complete suite of enterprise security headers for an A+ rating on security audits.
 */

export default {
  async fetch(request) {
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);

    // 1. Information Exposure: Strip server and runtime disclosure
    newHeaders.delete('server');
    newHeaders.delete('x-powered-by');
    newHeaders.delete('x-github-request-id');

    // 2. Strict CORS (Eliminates Access-Control-Allow-Origin: *)
    newHeaders.set('Access-Control-Allow-Origin', 'https://boredpolymath.github.io');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 3. MIME Sniffing & Framing Defense
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('Cross-Origin-Resource-Policy', 'same-origin');
    newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

    // 4. Privacy & Hardware Boundary Directives
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), display-capture=()');

    // 5. Transport Layer Security (with includeSubDomains & preload)
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // 6. Content Security Policy (Strict XSS and framing mitigation)
    newHeaders.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://boredpolymath.github.io; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");
    newHeaders.set('X-Permitted-Cross-Domain-Policies', 'none');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
};
