# sphinxagent.com — Production Reference
**Category:** SnapIT Suite Product (Authority Blog / "Think Tank")
**Sibling project:** `sphinxagent.ai` (the actual SaaS app) — separate repo `terrellflautt/sphinxagent`, documented in its own `CLAUDE.md`.

> This repo is the authority/SEO blog for the Sphinx Agent product. The actual SaaS app is at sphinxagent.ai — long-form articles + landing pages designed to rank on search; app UI/dashboard/billing/agents are NOT in this repo.
>
> **This repo is public on GitHub.** Don't commit infrastructure ARNs, AWS account IDs, SSM paths, distribution IDs, S3 bucket names, or anything else that could aid targeted attack reconnaissance. Those details belong in the private `terrellflautt/sphinxagent` repo's `CLAUDE.md` instead.

## What's here
- `index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`, `cookie-policy.html`, `do-not-sell.html` — top-level marketing/legal pages
- `blog/` — 30 long-form SEO articles + `article-template.html` for new posts. `index.html` is the article listing.
- `lambda/support-checkout/` — source for the standalone Stripe checkout Lambda that powers the donation / fellowship tiers (`contribute.html`, `fellowship.html`, `fellows.html`). Deployed independently of the main app's checkout Lambda.
- `marketing/` — Substack, Medium, tweet drafts. Not deployed.
- `competitor-copy-intel.md` — content-strategy notes.
- `css/`, `tailwind-build/` — styling.
- `sitemap.xml`, `robots.txt`, `llms.txt`, `feed.xml` (RSS) — verify these in next session.
- `og-image.png`, `favicon-*.png`, `apple-touch-icon.png` — assets.

## Article inventory (30 articles)
Topics: AI customer service / sales / phone agents / receptionist; "AI replacing jobs 2026"; "AI extinction scenarios"; competitor comparisons (Chatbase, Intercom, Tidio, Drift); ChatWit launch, OpenAI Sora shutdown, OpenClaw vs NemoClaw; how-to guides (build chatbot, sales agent, technical platform); Fellowship / fellows / contribute community pages; Spiralism AI alignment guide.

## Deploy
```bash
# Blog → S3 (bucket name in private docs)
# CloudFront invalidation needed after sync
# See the private sphinxagent CLAUDE.md for exact bucket + distribution IDs.
aws s3 sync /mnt/c/Users/decry/Desktop/domain-portfolio/snapit-suite/sphinxagent-com/ s3://$BLOG_BUCKET/ \
  --exclude ".git/*" --exclude "CLAUDE.md" --exclude ".gitignore" \
  --exclude "marketing/*" --exclude "competitor-copy-intel.md" \
  --exclude "lambda/*" --exclude "tailwind-build/*" --exclude "node_modules/*" --delete
aws cloudfront create-invalidation --distribution-id $BLOG_DIST_ID --paths "/*"

# Lambda → support-checkout
cd lambda/support-checkout
zip -r /tmp/support-checkout.zip . -x "*.git*" "*node_modules*"
aws lambda update-function-code --function-name sphinx-support-checkout \
  --zip-file fileb:///tmp/support-checkout.zip --region us-east-1
```

(Specific AWS resource IDs live in the private `terrellflautt/sphinxagent` repo's `CLAUDE.md` to keep this public repo enumeration-safe.)

## Brand
Same Sphinx gold/cream/midnight palette as the main app:
- Primary `#D4AF37` / Hover `#C5A028` / Dark `#B8960F` / Light `#FFF8E1`
- Parchment `#fdf6e3` / White `#fffef9`
- Midnight `#1e293b` / Text `#111827` / Muted `#6b7280`

## Cross-references (private docs)
- **Main app source + full infrastructure map:** `../sphinxagent/CLAUDE.md` (private repo)
- **Backend API source:** `terrellflautt/sphinxagent-api` (private)
- **Pricing source of truth:** `../sphinxagent/pricing-and-plans.md` (private)
- **2026-05-12 audit reports:** `../sphinxagent/reports/*.md` (private)

## Don't break
- **Legacy widget cross-domain serving:** Some old customer embeds still reference `snapitagent.com/widget/snapit-widget.js`. The `/widget/*` path on the *old* snapitagent.com origin must keep working until those customers update. The sphinxagent.com (this domain) `/widget/*` path is unused — leave it 404-able.
- The blog is content-only — no auth, no agent SDK, no `SphinxAuth` / `SphinxAPI` scripts. Don't add them here.
- This repo is **public**. Anything committed is world-readable. Keep infrastructure detail out.

## Quick orientation for a new agent session
1. If you have access to the private `../sphinxagent/` repo, read its `CLAUDE.md` and `reports/audit-2026-05-12.md` first for full product/app context and infrastructure.
2. The blog is the SEO/authority play — most work here is writing or editing articles in `blog/*.html` using `blog/article-template.html` as the starting structure.
3. Deploy is a single `aws s3 sync` + `cloudfront create-invalidation` (bucket + distribution ID are in the private docs).

## Known open items (2026-05-12)
- Validate `feed.xml` RSS exists + is current.
- Consider adding `BlogPosting` / `Article` JSON-LD to article pages (sister app got Organization + SoftwareApplication schemas on 2026-05-12).
- Verify all 26 sitemap.xml URLs are live.
- Confirm `sphinx-support-checkout` Lambda's Stripe price IDs match the donation tiers on the live `contribute.html` / `fellowship.html` / `fellows.html` pages.
