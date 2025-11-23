# WhatsApp Integration Guide

## Overview

PJA Stick & 3D Studio uses WhatsApp as the primary order communication channel. This guide explains both implementation methods:

1. **wa.me Links** (Primary, no cost, immediate)
2. **Twilio WhatsApp Business API** (Optional, automated, requires approval)

## Method 1: wa.me Links (Default)

### How It Works
- Client-side implementation
- Opens WhatsApp with pre-filled message
- User manually sends the message
- Zero cost, no setup required
- Works immediately

### Implementation

#### Frontend (already implemented):
```javascript
// src/utils/whatsapp.js
const WHATSAPP_NUMBER = '916372362313'  // Without + or spaces

function createWhatsAppLink(message) {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
}

// Open WhatsApp
window.open(createWhatsAppLink(message), '_blank')
```

### Message Format
```
Hi! I'd like to place an order:

📋 Order #ABC123

*Items:*
1. Moon Lamp - Custom
   Qty: 2 | Price Tier: ₹500-1000

2. Flip Name - Personalized
   Qty: 1 | Price Tier: ₹200-500

*Customer Details:*
👤 Name: John Doe
📧 Email: john@example.com
📱 Phone: +91 9876543210
📍 Address: 123 Street, City

Please confirm the order and share payment details. Thank you!
```

### Advantages
- ✅ No setup required
- ✅ Zero cost
- ✅ Works immediately
- ✅ No API limitations
- ✅ Users familiar with WhatsApp
- ✅ No approval process needed

### Limitations
- ❌ User must manually send message
- ❌ No automated responses
- ❌ Manual order tracking
- ❌ No message templates

---

## Method 2: Twilio WhatsApp Business API (Optional)

### When to Use
- Want automated order confirmations
- Need to send proactive notifications
- Want to integrate with chatbots
- Require message templates
- Need conversation tracking

### Prerequisites
1. Twilio account
2. WhatsApp Business Profile
3. Approved message templates
4. Phone number capable of WhatsApp

### Setup Process

#### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify email and phone number
4. Get $15 free credit

#### Step 2: Enable WhatsApp Sandbox (Development)
```bash
# In Twilio Console:
# 1. Go to Messaging → Try it out → Send a WhatsApp message
# 2. Follow instructions to join sandbox
# 3. Send "join <sandbox-code>" to sandbox number

# Test sandbox:
# From: whatsapp:+14155238886 (Twilio sandbox)
# To: whatsapp:+919876543210 (Your number)
```

#### Step 3: Request WhatsApp Business API Access (Production)

**Requirements:**
- Registered business
- Business verification documents
- Facebook Business Manager account
- WhatsApp Business Profile

**Application Process:**
1. Go to Twilio Console → WhatsApp → Request Access
2. Fill business information
3. Connect Facebook Business Manager
4. Create WhatsApp Business Profile
5. Submit for review
6. Approval time: 1-3 weeks

#### Step 4: Create Message Templates

WhatsApp requires pre-approved templates for proactive messages:

```plaintext
Template Name: order_confirmation
Category: TRANSACTIONAL
Language: English

Message:
Hello {{1}},

Your order #{{2}} has been received!

We'll confirm the details and pricing shortly via WhatsApp.

Thank you for choosing PJA 3D Studio!
```

Submit templates in Twilio Console → WhatsApp → Message Templates

#### Step 5: Get Twilio Credentials
```bash
# From Twilio Console → Account → Keys & Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Your approved number
```

#### Step 6: Store in Secret Manager
```bash
# Production: Use Google Secret Manager
echo -n "ACxxxxxxxx" | gcloud secrets create TWILIO_ACCOUNT_SID --data-file=-
echo -n "your_token" | gcloud secrets create TWILIO_AUTH_TOKEN --data-file=-
echo -n "whatsapp:+14155238886" | gcloud secrets create TWILIO_WHATSAPP_FROM --data-file=-

# Grant backend access
gcloud secrets add-iam-policy-binding TWILIO_ACCOUNT_SID \
  --member="serviceAccount:pja3d-backend@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Repeat for other secrets
```

#### Step 7: Update Backend Configuration

The backend automatically detects Twilio credentials:

```javascript
// src/services/whatsapp.service.js
if (config.twilio.accountSid && config.twilio.authToken) {
  // Use Twilio
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken)
} else {
  // Fall back to wa.me links
  console.log('Twilio not configured - using wa.me fallback')
}
```

#### Step 8: Test Integration

```bash
# Test endpoint (with admin token)
curl -X POST https://your-backend.run.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "customer": {
      "name": "Test User",
      "phone": "+919876543210",
      "email": "test@example.com",
      "address": "Test Address"
    }
  }'

# Check backend logs
gcloud logging read "resource.type=cloud_run_revision" --limit=10
```

### Backend Implementation (Already Included)

```javascript
// src/services/whatsapp.service.js
export async function sendWhatsAppNotification(to, message) {
  if (!twilioClient) {
    return { success: false, method: 'wa.me' }
  }

  try {
    const result = await twilioClient.messages.create({
      from: config.twilio.whatsappFrom,
      to: `whatsapp:+${to}`,
      body: message,
    })

    return { success: true, method: 'twilio', sid: result.sid }
  } catch (error) {
    console.error('Twilio error:', error)
    return { success: false, method: 'twilio', error: error.message }
  }
}
```

### Message Template Compliance

#### Allowed (Session Messages):
- Responses within 24 hours of customer message
- Order confirmations
- Customer support replies

#### Requires Template (Proactive Messages):
- Order status updates
- Delivery notifications
- Marketing messages
- Reminders

#### Template Variables:
```javascript
// Use {{1}}, {{2}}, etc. for dynamic content
const message = `Hello {{1}}, your order {{2}} is ready!`
client.messages.create({
  from: 'whatsapp:+14155238886',
  to: 'whatsapp:+919876543210',
  body: message,
  // OR use contentSid for approved templates
  contentSid: 'HXxxxxxxxxxxxxxxxxxxxxx',
  contentVariables: JSON.stringify({
    '1': 'John',
    '2': 'ORD123',
  }),
})
```

### Cost Estimate

| Service | Cost |
|---------|------|
| WhatsApp Sandbox | Free (development only) |
| Business Conversations | $0.005 per message (varies by country) |
| Template Messages | First 1,000 free/month, then $0.005/msg |
| User-initiated (24hr window) | Free |

**Estimated monthly cost**: $5-20 for low volume

### Advantages
- ✅ Automated notifications
- ✅ Template messages
- ✅ Rich media support
- ✅ Conversation analytics
- ✅ Integration with CRM

### Limitations
- ❌ Requires approval (1-3 weeks)
- ❌ Ongoing costs
- ❌ Template restrictions
- ❌ Setup complexity
- ❌ Business verification required

---

## Comparison Matrix

| Feature | wa.me Links | Twilio API |
|---------|-------------|------------|
| Cost | Free | ~$5-20/month |
| Setup Time | Immediate | 1-3 weeks |
| Automation | Manual | Automated |
| Templates | None | Required for proactive |
| User Action | Must send | Receives automatically |
| Analytics | None | Full tracking |
| Approval | Not required | Required |

## Recommended Approach

### Phase 1: Launch with wa.me (Immediate)
- Start taking orders immediately
- Zero cost
- Build customer base
- Gather requirements

### Phase 2: Add Twilio (Optional, after 3-6 months)
- Apply for Business API once established
- Automate notifications
- Improve customer experience
- Scale operations

## Best Practices

### Message Content
- Keep messages concise (< 500 characters)
- Use emojis sparingly
- Include order ID for tracking
- Provide clear call-to-action
- Add business hours information

### Response Time
- Acknowledge messages within 1 hour
- Set customer expectations
- Use auto-replies for off-hours
- Maintain 24-hour response window (for Twilio)

### Privacy & Compliance
- Get consent for WhatsApp communication
- Don't spam customers
- Respect opt-out requests
- Comply with GDPR if applicable
- Follow WhatsApp Business Policy

### Testing Checklist
- [ ] Message format displays correctly
- [ ] Phone number validation works
- [ ] Links open WhatsApp on mobile
- [ ] Links work on desktop (WhatsApp Web)
- [ ] Order details are complete
- [ ] Customer info is accurate
- [ ] Emojis render properly
- [ ] Message length within limits

## Troubleshooting

### Issue: WhatsApp link doesn't open
**Solution**: Ensure phone number format is correct (no spaces, no +)
```javascript
// Correct
const number = '916372362313'

// Incorrect
const number = '+91 6372362313'  // Has + and space
```

### Issue: Twilio error "Invalid 'To' number"
**Solution**: Include `whatsapp:` prefix
```javascript
to: `whatsapp:+${phoneNumber}`  // Correct
```

### Issue: Template not approved
**Solution**: 
- Remove marketing language
- Keep it transactional
- Follow WhatsApp guidelines
- Resubmit with changes

### Issue: Messages not delivered
**Solution**:
- Check phone number is valid
- Verify customer has WhatsApp
- Ensure they haven't blocked number
- Check Twilio logs

## Support Resources

- **Twilio Docs**: https://www.twilio.com/docs/whatsapp
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Template Guidelines**: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
- **Pricing**: https://www.twilio.com/whatsapp/pricing

## Implementation Timeline

### Immediate (Day 1):
- ✅ wa.me links implemented
- ✅ Order messages formatted
- ✅ Customer can place orders

### Week 1-2 (Optional):
- Create Twilio account
- Test sandbox
- Prepare templates

### Month 1-2 (Optional):
- Apply for Business API
- Business verification
- Submit templates for approval

### Month 2-3 (Optional):
- Templates approved
- Production deployment
- Automated notifications live

---

**Current Implementation**: wa.me links (fully functional)  
**Twilio Integration**: Optional feature for future scaling  
**Recommendation**: Launch with wa.me, add Twilio later if needed
