# Deployment Guide - Mobile Quiz App

## Quick Deploy Options

### ✅ Option 1: Netlify (Easiest - Automatic Updates)

**Step 1: Create a GitHub Account & Repository**
1. Go to https://github.com/signup
2. Sign up for free
3. Create new repository: `mobile-quiz-app`
4. Clone to your computer: `git clone <your-repo-url>`
5. Copy all files from "Mobile Quiz" folder into it

**Step 2: Deploy to Netlify**
1. Go to https://app.netlify.com/signup
2. Click "Sign up with GitHub"
3. Click "New site from Git"
4. Select your `mobile-quiz-app` repository
5. **Build command:** Leave empty (or `echo Done`)
6. **Publish directory:** `quiz-app`
7. Click "Deploy"

**Your app is now LIVE!** Get the URL from Netlify dashboard.

---

### ✅ Option 2: Vercel (Also Free & Fast)

1. Go to https://vercel.com/signup
2. Sign in with GitHub
3. Click "Add New Project"
4. Select your `mobile-quiz-app` repository
5. Set **Root Directory** to `.` (root)
6. Click "Deploy"

---

### ✅ Option 3: Instant Deploy (No Git Required)

**Using Netlify Drag & Drop:**
1. Go to https://app.netlify.com/drop
2. Drag the `quiz-app` folder into the page
3. Done! Your site is live

---

## After Deployment

### Enable Database Features
Your app uses **localStorage** (works offline). To use real SQLite:

1. In deployed version, database still works via localStorage
2. For advanced backend, add a Node.js API later

### Custom Domain
1. In Netlify dashboard → Site settings → Domain management
2. Add custom domain (or use netlify subdomain)

### HTTPS & SSL
✅ **Automatic** - Netlify provides free HTTPS/SSL

---

## Troubleshooting

**App shows blank page?**
- Check browser console (F12 → Console tab)
- Verify all `<script src>` paths are relative: `./js/auth.js` ✅ (not `/js/auth.js`)

**Data not saving?**
- localStorage is working - try in private/incognito window
- Check console for errors

**Need to update app?**
- Push changes to GitHub
- Netlify auto-deploys in ~30 seconds

---

## One-Click Deploy Commands

If you want to use CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from quiz-app folder
cd quiz-app
netlify deploy --prod --dir .
```

---

**Recommended: Option 1 + Netlify** - Takes 10 minutes, gives you automatic updates and professional hosting.
