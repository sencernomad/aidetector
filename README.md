This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication Setup

This project uses Supabase for authentication with Google SSO. Follow these steps to set up authentication:

1. Create a new project on [Supabase](https://supabase.com/)
2. In your project dashboard, navigate to Project Settings > API
3. Copy the `Project URL` and `anon` public API key
4. Create a `.env.local` file in your project root and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Set up Google OAuth:
   - Go to Supabase Authentication > Providers > Google
   - Enable Google OAuth
   - Create a Google OAuth client ID at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add your domain (localhost for development) to authorized origins
   - Add `https://[your-supabase-project].supabase.co/auth/v1/callback` as an authorized redirect URI
   - Copy the Client ID and Client Secret to Supabase configuration

6. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
   ```

## Protected Routes

The application has protected routes that require user authentication:
- `/create` - AI Image Scanner page
- Certain actions on the homepage (Upload Image, See It In Action)
- Purchasing plans from the pricing page

Users will be redirected to the login page if they try to access these features without authentication.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
