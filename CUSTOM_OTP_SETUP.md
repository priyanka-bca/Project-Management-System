# Custom OTP Password Reset System - Setup Guide

## Overview
Simple OTP password reset system using **only Flutter and Supabase**. No external email services required.

The system generates a 6-digit OTP, stores it in Supabase, and displays it for verification. You can add email delivery later if needed.

## Database Setup

### Step 1: Create the password_reset_otp Table

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
CREATE TABLE password_reset_otp (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_reset_otp_email ON password_reset_otp(email);
```

That's it! No external configuration needed.

## Flutter App Implementation

### Step 2: Password Reset Flow (Already Implemented)

The password reset screen has three steps:

1. **Email Entry**: User enters email → OTP is generated and stored in database
   - 6-digit random code generated
   - Stored in `password_reset_otp` table with 10-minute expiration
   - **OTP displayed in app for verification** (can hide in production)

2. **OTP Verification**: User enters the 6-digit OTP from the app display
   - Validates against database record
   - Checks expiration time
   - Marks OTP as used

3. **Password Reset**: User enters new password
   - Updates their Supabase auth password
   - Redirects to login

## Testing

### Development/Testing:

When you tap "Send OTP", the screen shows:
```
OTP sent to email@example.com
(Dev OTP: 123456)
```

Use the displayed OTP to complete the reset flow.

### Production:

Simply remove the OTP display in `reset_password.dart` if you add email delivery later.

## Flow Diagram

```
User enters email
    ↓
Generate 6-digit OTP
    ↓
Save to password_reset_otp table with 10-min expiration
    ↓
Display OTP in app
    ↓
User enters OTP from app display
    ↓
Verify against DB (check expiration, not used)
    ↓
Mark OTP as used
    ↓
User enters new password
    ↓
Update Supabase auth password
    ↓
Redirect to login
```

## Future: Adding Email

If you want to send OTP via email later, you can add email sending at that time using:
- Supabase Edge Functions + external email API (SendGrid, Resend, etc.)
- Supabase Email API (for transactional emails)
- Custom backend service

## Cleanup (Optional)

You can delete expired OTPs periodically to keep the table clean:

```sql
-- Delete OTPs older than 1 hour
DELETE FROM password_reset_otp 
WHERE created_at < NOW() - INTERVAL '1 hour';
```

Run this manually or set up a scheduled job in Supabase.

## Security Considerations

✅ **Implemented:**
- 6-digit OTP (1 million combinations)
- 10-minute expiration
- One-time use (marked as used after verification)
- OTP isolated from auth system in separate table
- Database validation on every attempt

⚠️ **Recommended Additions (Optional):**
- Rate limit OTP generation (max 5 per email per hour)
- Rate limit verification attempts (max 3 attempts)
- Log failed verification attempts
- Add CAPTCHA for repeated failures

⚠️ **When Adding Email Later:**
- Use secure email service (SendGrid, Resend, AWS SES)
- Never log OTPs in plain text
- Add email verification before saving OTP
- Implement TLS/SSL for all email transmission

## Troubleshooting

### Can't reset password
1. Verify Supabase credentials are correct
2. Check user is not already authenticated (sign out first)
3. Check password meets requirements (6+ characters recommended)
4. Verify `password_reset_otp` table exists and is properly set up

### OTP expired error
1. Check your system time is correct
2. Verify `expires_at` calculation uses correct timezone
3. Confirm 10-minute expiration window is appropriate for your use case

### Database errors
1. Check `password_reset_otp` table exists
2. Verify Supabase RLS policies (should allow inserts for anonymous users)
3. Check for SQL syntax errors
