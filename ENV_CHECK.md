# Environment Variable Checklist 📝

To make the Landing Page & Payments work, you need to set up your `.env.local` file in the `web` folder.

## 1. Create the File
Create a file named `.env.local` in `c:\Users\LWRSH\Videos\taskclarify\taskclarify-mobile\web`.

## 2. Add These Keys
Copy and paste this into the file, filling in your actual values:

```env
# Supabase (Same as Mobile App)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Paddle (Payments)
# Go to: https://vendors.paddle.com/
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token (starts with 'live_' or 'test_')
NEXT_PUBLIC_PADDLE_PRICE_ID=pri_... (The ID of your $9.99 Product Price)

# Paddle Webhook Secret
# Go to: Developer Tools > Notifications
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here
```

## 3. Deployment
When you deploy this to Vercel (or Netlify), make sure to add these same Environment Variables in their dashboard!
