# Custom OTP Password Reset - Setup (Simple Version)

## One-Time Setup

### Step 1: Create Database Table
Go to your Supabase dashboard → SQL Editor → Run this:

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

That's it! ✅

## How It Works

1. **User clicks "Forgot Password"** from login screen
2. **User enters email** and clicks "Send OTP"
3. **System generates 6-digit OTP** and displays it on screen
4. **User enters the OTP** shown and clicks "Verify OTP"
5. **User enters new password** and clicks "Reset Password"
6. **Done!** User is redirected to login

## Tech Stack
- **Flutter** - Mobile/Web app
- **Supabase** - Database only (no external services)
- **OTP Storage** - password_reset_otp table
- **10-minute expiration** - Automatic security timeout

## Testing
1. Build and run the app
2. Click "Forgot Password" on login screen
3. Enter your email
4. Copy the OTP shown (e.g., 123456)
5. Enter it in the OTP field
6. Set a new password
7. Login with new password ✅

## Future
When you want to add email sending:
1. Deploy Supabase Edge Function
2. Integrate with email service (SendGrid, AWS SES, etc)
3. Remove OTP display from app
4. Users get OTP via email instead

But this works great as-is right now!
