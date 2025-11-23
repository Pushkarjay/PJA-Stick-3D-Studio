# Security Best Practices

## Overview

This document outlines security measures implemented and recommended practices for PJA Stick & 3D Studio.

## Authentication & Authorization

### Firebase Authentication
- Admin users authenticated via Firebase Auth (email/password)
- ID tokens verified server-side using Firebase Admin SDK
- Tokens expire after 1 hour and must be refreshed

### Role-Based Access Control (RBAC)
- User roles stored in Firestore `users` collection
- Admin role required for protected endpoints
- Middleware verifies both authentication and authorization

```javascript
// Example: Checking admin role
const userDoc = await db.collection('users').doc(uid).get()
if (userDoc.data().role !== 'admin') {
  throw new Error('Forbidden')
}
```

## API Security

### Rate Limiting
- Configured via `express-rate-limit`
- Default: 100 requests per 15 minutes per IP
- Adjust in environment variables:
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_MAX_REQUESTS`

### Input Validation
- All request bodies validated using Joi schemas
- Strict type checking and sanitization
- Located in `backend/src/middlewares/validate.js`

### CORS Configuration
- Production: Whitelist specific origins
- Development: Allow localhost
- Configure via `CORS_ORIGIN` environment variable

### Security Headers (Helmet.js)
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)

## Secret Management

### Google Secret Manager (Production)
All sensitive credentials should be stored in Secret Manager:

```bash
# Store secret
echo -n "secret_value" | gcloud secrets create SECRET_NAME --data-file=-

# Grant access to service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Never Commit:
- ❌ Service account keys
- ❌ API keys (except Firebase public keys)
- ❌ Database credentials
- ❌ Twilio credentials
- ❌ `.env` files with real values

### Use `.env.example` as template

## Firestore Security

### Security Rules
Production rules in `firestore.rules`:
- Products: Public read, admin write
- Orders: Guest create, admin read/update
- Users: Owner/admin only
- Settings: Admin only

### Validation
- Server-side validation in addition to rules
- Never trust client input
- Validate all IDs and references

### Data Sanitization
```javascript
// Example: Sanitize order data
const sanitizedOrder = {
  items: items.map(item => ({
    productId: String(item.productId).trim(),
    quantity: parseInt(item.quantity),
  })),
  customer: {
    name: String(customer.name).trim().substring(0, 100),
    email: String(customer.email).toLowerCase().trim(),
  }
}
```

## Cloud Storage Security

### Storage Rules
- Public read for product images
- Admin write only
- Content type validation
- File size limits (implement in backend)

### Signed URLs
- Use signed URLs for uploads
- Short expiration (15 minutes)
- Generated server-side only

```javascript
// Generate signed upload URL
const [url] = await file.getSignedUrl({
  version: 'v4',
  action: 'write',
  expires: Date.now() + 15 * 60 * 1000,
  contentType: 'image/jpeg',
})
```

## HTTPS & SSL

### Firebase Hosting
- Automatic SSL/TLS certificates
- HTTPS enforced by default
- HTTP → HTTPS redirects automatic

### Cloud Run
- HTTPS endpoints only
- Managed SSL certificates
- No HTTP access

## Secrets Rotation

### Regular Rotation Schedule
1. **Service Account Keys**: Rotate every 90 days
2. **API Keys**: Rotate annually or if compromised
3. **Twilio Credentials**: Rotate if exposed

### Rotation Process:
```bash
# 1. Create new service account key
gcloud iam service-accounts keys create new-key.json \
  --iam-account=SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com

# 2. Update GitHub Secrets or Secret Manager
# 3. Deploy with new key
# 4. Verify deployment works
# 5. Delete old key
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com
```

## Logging & Monitoring

### Structured Logging
- All logs in JSON format
- Include request context (path, method, user)
- Never log sensitive data (passwords, tokens)

### Monitoring Alerts
Setup alerts for:
- High error rates (>5%)
- Unusual traffic patterns
- Failed authentication attempts
- API rate limit hits

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50
```

## Incident Response

### If Credentials Are Compromised:
1. **Immediately revoke** the compromised credentials
2. **Rotate** all related secrets
3. **Audit** logs for unauthorized access
4. **Update** GitHub Secrets
5. **Re-deploy** services
6. **Document** the incident

### Emergency Contacts:
- Google Cloud Support: https://cloud.google.com/support
- Firebase Support: https://firebase.google.com/support
- Twilio Support: https://www.twilio.com/help/contact

## Security Checklist

### Pre-Deployment
- [ ] All secrets in Secret Manager or GitHub Secrets
- [ ] Service account keys rotated (< 90 days old)
- [ ] Firestore rules tested and deployed
- [ ] Storage rules tested and deployed
- [ ] CORS restricted to production domains
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info

### Post-Deployment
- [ ] HTTPS enforced (no HTTP access)
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured
- [ ] Backup schedule active
- [ ] Admin account secured (strong password, 2FA)
- [ ] Logs reviewed for anomalies
- [ ] Penetration testing performed (if applicable)

### Ongoing
- [ ] Regular security audits (quarterly)
- [ ] Dependency updates (monthly)
- [ ] Secrets rotation (per schedule)
- [ ] Monitor security advisories
- [ ] Review access logs weekly
- [ ] Test backup restoration quarterly

## OWASP Top 10 Compliance

1. **Injection**: Joi validation, parameterized queries
2. **Broken Authentication**: Firebase Auth, token verification
3. **Sensitive Data Exposure**: Secret Manager, HTTPS only
4. **XML External Entities**: Not applicable (JSON API)
5. **Broken Access Control**: RBAC, Firestore rules
6. **Security Misconfiguration**: Helmet.js, CSP headers
7. **XSS**: React auto-escaping, CSP headers
8. **Insecure Deserialization**: JSON only, input validation
9. **Using Components with Known Vulnerabilities**: `npm audit`, Dependabot
10. **Insufficient Logging & Monitoring**: Winston logger, Cloud Logging

## Content Security Policy (CSP)

Recommended CSP headers (configured in Helmet.js):

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],  // React requires unsafe-inline
    styleSrc: ["'self'", "'unsafe-inline'"],   // Tailwind requires unsafe-inline
    imgSrc: ["'self'", "data:", "https:", "https://storage.googleapis.com"],
    connectSrc: ["'self'", "https://*.firebaseapp.com", "https://*.run.app"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}
```

## Data Privacy

### GDPR Compliance (if applicable)
- User data collection transparency
- Right to access personal data
- Right to deletion (implement if needed)
- Data retention policies
- Privacy policy published

### Data Minimization
- Only collect necessary data
- No tracking without consent
- Analytics anonymized (if used)

## Vulnerability Disclosure

If you discover a security vulnerability:
1. **Do not** open a public GitHub issue
2. Email: security@pja3dstudio.com (replace with real email)
3. Include: Description, steps to reproduce, impact
4. Response time: 48 hours

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Last Updated**: 2024-01-01  
**Next Review**: 2024-04-01
