# LINOVA MUSIC — Security & Data Protection

## 1. Authentication & Session Security
- Passwords are salted and hashed using `bcryptjs` with minimum 10 salt rounds.
- JWT (JSON Web Tokens) are signed with a strong server-side secret (`JWT_SECRET`).
- Token validation middleware checks authorization headers on all protected routes.

## 2. API & Server Hardening
- **Helmet:** Sets secure HTTP response headers to protect against common web vulnerabilities (XSS, clickjacking, MIME sniffing).
- **CORS:** Restricts cross-origin requests to configured client domains.
- **Rate Limiting:** Protects `/api/auth` and public search routes against brute-force and DDoS attacks.
- **Input Sanitization & Validation:** Prevents NoSQL injection and malformed query attacks.

## 3. Compliance & Provider Privacy
- No third-party API keys, JWT secrets, or database credentials exposed to frontend code.
- Strict isolation of external music provider communication through backend-only adapter services.
- Clean `.env.example` provided for safe environment setup.
