# Karamchari Samachar

A Next.js site tracking DA revisions, circulars, and pay commission news for
government employees, built for deployment on the `karamchari.nrmu.net`
subdomain via GoDaddy cPanel's Node.js App Manager.

## Local development

```
npm install
npm run dev
```

Visit http://localhost:3000

## What's here

- `app/` — pages (App Router): homepage, `/circulars`, `/circulars/[slug]`,
  `/da-cpc-tracker`, `/states/[state]`, `/about`
- `components/` — Header, Footer, CircularCard
- `lib/data.ts` — sample content. This is the only file that needs to change
  when real circulars replace the placeholders, or when it's time to wire up
  the MySQL database (see `lib/db.ts` for the connection stub and notes)
- `server.js` — entry point for cPanel's Node.js App Manager (Passenger)

## Deploying to cPanel (karamchari.nrmu.net)

1. Run `npm run build` locally to confirm it builds cleanly.
2. Zip the project folder — you can exclude `node_modules` and `.next`,
   cPanel will install dependencies and it'll rebuild there.
3. In cPanel → **Setup Node.js App** → **Create Application**:
   - Node.js version: latest available (24.x confirmed working)
   - Application mode: **Production**
   - Application root: a folder name, e.g. `karamchari-app`
   - Application URL: `karamchari.nrmu.net`
   - Application startup file: `server.js`
4. Upload the zip into the application root folder (via File Manager or FTP),
   then extract it there.
5. In cPanel's Node.js app screen, use the provided "Run NPM Install" button
   (or the terminal command it gives you) to install dependencies, then run
   `npm run build` via the app's terminal/SSH access.
6. Restart the application from the Node.js App Manager. It should now be
   live at karamchari.nrmu.net.

## Adding real content

Until the database is connected, publish by editing `lib/data.ts` directly —
add a new object to the `circulars` array and redeploy. This is intentionally
simple to start with; move to MySQL once publishing several times a day makes
file editing the bottleneck.

## Images and PDFs

Circular PDFs and article images are expected to live on the existing
airfindia.org WordPress media library and be linked by URL — this site does
not store files of its own. `next.config.js` already allow-lists
`airfindia.org` for the `next/image` component.
