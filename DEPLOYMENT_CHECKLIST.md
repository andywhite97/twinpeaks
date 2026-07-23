# SEO Deployment Checklist

## Before Running: npm run deploy

### Phase 1: Content & Configuration (Required)
- [ ] **Update Business Information**
  - [ ] Phone number in structured-data.service.ts
  - [ ] Email address
  - [ ] Physical address (street, city, state, ZIP)
  - [ ] Update contact info in index.html if visible

- [ ] **Update Social Media Links**
  - [ ] Facebook URL
  - [ ] LinkedIn company page
  - [ ] Twitter handle
  - [ ] Any other social accounts

- [ ] **Create OG Image**
  - [ ] Design 1200x630px image (or use template)
  - [ ] Save as `public/img/og-image.png`
  - [ ] Verify it's readable when shared

- [ ] **Add Google Analytics**
  - [ ] Create Google Analytics account (analytics.google.com)
  - [ ] Get Measurement ID (G-XXXXX)
  - [ ] Add Google Analytics script to index.html

### Phase 2: Content Optimization (Recommended)
- [ ] **Home Page**
  - [ ] H1 tag is descriptive and includes main keyword
  - [ ] Meta description in routes (already set)
  - [ ] At least 300 words of quality content
  - [ ] Images have descriptive alt text
  - [ ] Internal links to Services and Products

- [ ] **Products Page**
  - [ ] Product descriptions are detailed
  - [ ] H1 tag present and optimized
  - [ ] Product images have alt text
  - [ ] Links to related services

- [ ] **Services Page**
  - [ ] Service descriptions are comprehensive
  - [ ] Unique H1 tag
  - [ ] Service images have alt text
  - [ ] CTAs (calls-to-action) present

- [ ] **Gallery Page**
  - [ ] All gallery images have descriptive alt text
  - [ ] Image descriptions or captions
  - [ ] Related services linked

- [ ] **About/Leadership Page**
  - [ ] Team member descriptions
  - [ ] Professional photos with alt text
  - [ ] Experience and credentials highlighted

- [ ] **Contact Page**
  - [ ] Form is optimized for conversion
  - [ ] Clear CTAs
  - [ ] Address and phone number displayed
  - [ ] Social links visible

### Phase 3: Technical SEO (Verify)
- [ ] **Links & Navigation**
  - [ ] No broken internal links
  - [ ] All navigation links work
  - [ ] Footer links functional
  - [ ] Contact form submits properly

- [ ] **Performance**
  - [ ] Page loads in under 3 seconds (test locally)
  - [ ] Images are optimized/compressed
  - [ ] No console errors (check F12)
  - [ ] Mobile responsive (test on device)

- [ ] **Files & Structure**
  - [ ] robots.txt exists at /robots.txt
  - [ ] sitemap.xml exists at /sitemap.xml
  - [ ] CNAME file present for custom domain
  - [ ] favicon.ico and other icons present

- [ ] **Build Verification**
  - [ ] Run: `npm run build`
  - [ ] No build errors
  - [ ] No TypeScript errors
  - [ ] dist/ folder generated successfully
  - [ ] dist/browser/ contains index.html

### Phase 4: Final Checks (Before Deploy)
- [ ] **Run build command**
  ```
  npm run build
  ```
  - [ ] Build completes without errors
  - [ ] Check dist/browser exists

- [ ] **Test locally (optional)**
  - [ ] Preview site in browser
  - [ ] Test all navigation
  - [ ] Verify responsive design
  - [ ] Check social meta tags with OpenGraph debugger

- [ ] **Verify All Files Ready**
  - [ ] public/CNAME exists with domain
  - [ ] public/robots.txt exists
  - [ ] public/sitemap.xml exists
  - [ ] src/index.html has all meta tags
  - [ ] public/img/og-image.png created (if applicable)

---

## Deployment Command

```bash
npm run deploy
```

This will:
1. Build the production version
2. Deploy to GitHub Pages gh-pages branch
3. Preserve your CNAME file (custom domain)
4. Make site live at twinpeaksinvestment.com

---

## Post-Deployment: First 24-48 Hours

### Immediate (Within 1 Hour)
- [ ] Verify site is live: https://twinpeaksinvestment.com
- [ ] Test all main pages load
- [ ] Verify navigation works
- [ ] Check mobile responsiveness
- [ ] Test contact form

### Same Day
- [ ] Set up Google Search Console (if not done)
- [ ] Set up Google Analytics tracking
- [ ] Request indexing in Search Console

### Within 48 Hours
- [ ] Submit sitemap to Search Console
- [ ] Submit homepage URL to Search Console
- [ ] Test with PageSpeed Insights
- [ ] Run Lighthouse audit (F12 → Lighthouse tab)

---

## Search Engine Submission

### Google Search Console
1. Go to: https://search.google.com/search-console
2. Add property: `https://twinpeaksinvestment.com`
3. Verify ownership (choose HTML file method)
4. Upload verification file to public/ folder
5. Verify in Search Console
6. Go to "Sitemaps" section
7. Add: `https://twinpeaksinvestment.com/sitemap.xml`

### Bing Webmaster Tools
1. Go to: https://www.bing.com/webmaster/home
2. Add site: `https://twinpeaksinvestment.com`
3. Verify and add sitemap

---

## Monitoring First Month

### Week 1
- [ ] Site indexed in Google (check Search Console)
- [ ] Pages appearing in Google search results
- [ ] Analytics tracking visitor activity
- [ ] No crawl errors in Search Console

### Week 2-4
- [ ] Monitor impressions in Search Console
- [ ] Track click-through rate (CTR)
- [ ] Check average position for keywords
- [ ] Review PageSpeed Insights feedback
- [ ] Plan content improvements based on data

### Month 1 Review
- [ ] Analyze analytics data
- [ ] Review Search Console reports
- [ ] Identify top-performing pages
- [ ] Plan next content updates
- [ ] Adjust strategy if needed

---

## Troubleshooting

### Site Not Showing in Google
- **Wait 1-2 weeks** - Google takes time to crawl and index
- **Submit URL in Search Console** - Speeds up process
- **Check robots.txt** - Ensure it allows crawling
- **Verify no robots meta tag** - Should be index, follow

### Poor PageSpeed Score
- **Compress images** - Use ImageOptim or TinyPNG
- **Check file sizes** - Remove unused packages
- **Enable caching** - Already done with GitHub Pages
- **Review third-party scripts** - Minimize external calls

### Low Search Rankings
- **Update content** - Add more detail and keywords
- **Build internal links** - Link related pages
- **Improve readability** - Better headings and formatting
- **Get backlinks** - Share content, reach out to relevant sites

---

## Success Metrics to Track

### Monthly KPIs
| Metric | Target | How to Check |
|--------|--------|-------------|
| Organic Traffic | Growing | Google Analytics |
| Search Impressions | Increasing | Search Console |
| Search Clicks | Increasing | Search Console |
| Average CTR | > 2% | Search Console |
| Page Position | Moving up | Search Console |
| Page Speed | < 3 sec | PageSpeed Insights |
| Mobile Score | > 85 | PageSpeed Insights |

---

## Common Issues & Solutions

### CNAME Gets Overwritten
✅ **Already fixed** - Added CNAME to assets in angular.json

### Images Don't Load
- Check image paths (use /img/filename.png)
- Ensure images in public/img/ folder
- Verify image names are correct

### Meta Tags Not Updating
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R)
- Wait for deployment to complete
- Check SeoService is being called

### Analytics Not Working
- Verify GA ID is correct
- Check Google Analytics script in index.html
- Wait 24 hours for data to appear
- Check Analytics console for errors

---

## Deployment Timeline

| Step | Time | Command |
|------|------|---------|
| Build | 2-3 min | `npm run build` |
| Deploy | 1-2 min | `npm run deploy` |
| GitHub Pages Update | 1-5 min | (automatic) |
| Google Crawl | 24-48 hours | (automatic) |
| Index in Google | 3-7 days | (variable) |
| Rankings Show | 2-4 weeks | (depends on competition) |

---

## Next Steps Document

After deployment, save these for reference:
1. Google Search Console URL and setup steps
2. Google Analytics reporting dashboard
3. Keyword rankings to track (if using premium tool)
4. Monthly review date (every 1st of month recommended)

---

## Deployment Notes

**Deployed:** [Date]
**Domain:** https://twinpeaksinvestment.com
**Status:** ✅ Ready

Changes deployed:
- ✅ SEO meta tags system
- ✅ Dynamic descriptions
- ✅ robots.txt and sitemap.xml
- ✅ Structured data ready
- ✅ Analytics service
- ✅ 404 page
- ✅ CNAME configuration

Next review date: [Add date 30 days from deployment]
