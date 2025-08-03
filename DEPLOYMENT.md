# Vercel Deployment Guide

## Quick Deploy Steps:

1. **Connect to Vercel:**
   - Sign up at vercel.com
   - Connect your GitHub/GitLab repository
   - Or use Vercel CLI: `npm i -g vercel && vercel`

2. **Deploy:**
   - Push code to your repository 
   - Vercel will auto-deploy
   - Or run `vercel --prod` for production

## Admin Setup:

After deployment, create your first admin user through the registration process, then manually update their role in the database to 'admin' or 'super_admin'.

## Environment Variables (if needed):
- NODE_ENV=production
- JWT_SECRET=your-secret-key

## Build Commands:
- Build Command: `npm run build`
- Output Directory: `client/dist`
- Install Command: `npm ci`

The app will be live at your-app-name.vercel.app
