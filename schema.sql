-- Run this against the MySQL database created via cPanel's "MySQL Databases"
-- tool (or `mysql -u root -p your_db < schema.sql` locally).

-- NOTE: this file is for fresh installs only (CREATE TABLE IF NOT EXISTS
-- won't touch an existing table). If you already have data in `circulars`,
-- do NOT re-run this file to pick up new columns — use the ALTER TABLE
-- statements in the "existing database migrations" comment block below
-- instead, so existing rows are preserved.

CREATE TABLE IF NOT EXISTS circulars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  -- Retained for existing rows but no longer collected via the admin form.
  department VARCHAR(255) NOT NULL,
  -- Comma-separated: "all" for pan-India, or state slugs e.g. "punjab,haryana"
  states TEXT NOT NULL,
  -- Top-nav taxonomy, e.g. "railway-board", "dopt" — see SECTION_OPTIONS in
  -- lib/constants.ts. NULL when a circular isn't filed under any section.
  section VARCHAR(50) NULL,
  -- Retained for existing rows but no longer collected via the admin form.
  ref_number VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  effective_date DATE NULL,
  summary TEXT NOT NULL,
  -- Optional as of the admin form change that dropped the required PDF URL.
  pdf_url VARCHAR(1000) NULL,
  image_url VARCHAR(1000) NULL,
  -- Homepage "Must Read" sidebar — hand-picked via the admin form.
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  -- Homepage "Most Popular" sidebar — incremented on each detail-page view.
  view_count INT NOT NULL DEFAULT 0,
  category ENUM('da', 'pay', 'transfer', 'recruitment', 'pension', 'general') NOT NULL DEFAULT 'general',
  -- Only 'published' rows appear on public pages; AIRF imports start as 'draft'.
  status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_circulars_issue_date (issue_date),
  INDEX idx_circulars_category (category),
  INDEX idx_circulars_section (section),
  INDEX idx_circulars_status (status)
);

CREATE TABLE IF NOT EXISTS da_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  effective_from DATE NOT NULL,
  percentage INT NOT NULL,
  orders_issued DATE NOT NULL,
  INDEX idx_da_history_effective_from (effective_from)
);

-- Admin image uploads, stored as blobs rather than on disk: GitHub-sync
-- deploys reset the app's working tree, which was silently wiping
-- uploaded files that only ever lived on the server's local filesystem.
-- The database survives redeploys, so images do too.
CREATE TABLE IF NOT EXISTS uploads (
  name VARCHAR(80) PRIMARY KEY,
  mime VARCHAR(20) NOT NULL,
  size INT NOT NULL,
  data LONGBLOB NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Small key/value store for admin-configured settings — currently the raw
-- AdSense embed code for each ad slot (key_name: ad_sidebar_1, ad_sidebar_2,
-- ad_in_article).
CREATE TABLE IF NOT EXISTS settings (
  key_name VARCHAR(80) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional: seed with the same sample data the site previously shipped
-- statically, so the admin panel has something to show right away.
--
-- INSERT INTO circulars (slug, title, department, states, ref_number, issue_date, effective_date, summary, pdf_url, category) VALUES
-- ('da-hike-july-2026-53-percent', 'Dearness Allowance Raised to 53% Effective July 2026', 'Ministry of Finance', 'all', 'F.No. 1/3/2026-E-II(B)', '2026-09-18', '2026-07-01', 'Central government employees will receive Dearness Allowance at 53% of basic pay, up from 50%, with arrears payable for July and August 2026.', 'https://airfindia.org/wp-content/uploads/2026/09/da-order-july-2026.pdf', 'da'),
-- ('railway-transfer-policy-revision-2026', 'Revised Transfer and Posting Guidelines for Railway Staff', 'Ministry of Railways', 'all', 'E(NG)II/2026/RC-4/12', '2026-09-10', NULL, 'Updated guidelines tighten the mutual transfer request window and clarify priority categories for staff citing medical or spousal grounds.', 'https://airfindia.org/wp-content/uploads/2026/09/transfer-policy-2026.pdf', 'transfer'),
-- ('punjab-state-employees-medical-reimbursement', 'Punjab Enhances Medical Reimbursement Ceiling for State Employees', 'Punjab Finance Department', 'punjab', 'FD-3-26/2026-1FR(1)', '2026-09-05', '2026-09-01', 'The annual medical reimbursement ceiling for Punjab government employees and pensioners rises from ₹1.5 lakh to ₹2 lakh per family.', 'https://airfindia.org/wp-content/uploads/2026/09/punjab-medical-2026.pdf', 'pension'),
-- ('8th-pay-commission-terms-of-reference', '8th Pay Commission: Terms of Reference Notified', 'Ministry of Finance', 'all', 'F.No. A-26011/1/2026-E-III', '2026-08-22', NULL, 'The government has notified the terms of reference for the 8th Central Pay Commission, setting an 18-month timeline for recommendations.', 'https://airfindia.org/wp-content/uploads/2026/08/8th-cpc-tor.pdf', 'pay');
--
-- INSERT INTO da_history (effective_from, percentage, orders_issued) VALUES
-- ('2026-07-01', 53, '2026-09-18'),
-- ('2026-01-01', 50, '2026-03-20'),
-- ('2025-07-01', 46, '2025-09-25'),
-- ('2025-01-01', 42, '2025-03-18');

-- ---------------------------------------------------------------------
-- Existing database migrations (run these directly via phpMyAdmin's SQL
-- tab, or GoDaddy's database browser, against a database that already has
-- data — non-destructive, does not touch existing rows):
--
-- ALTER TABLE circulars ADD COLUMN section VARCHAR(50) NULL AFTER category;
-- ALTER TABLE circulars ADD COLUMN image_url VARCHAR(1000) NULL AFTER pdf_url;
-- ALTER TABLE circulars ADD INDEX idx_circulars_section (section);
-- ALTER TABLE circulars ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE AFTER image_url;
-- ALTER TABLE circulars ADD COLUMN view_count INT NOT NULL DEFAULT 0 AFTER is_featured;
-- ALTER TABLE circulars ADD COLUMN status ENUM('draft', 'published') NOT NULL DEFAULT 'published' AFTER category, ADD INDEX idx_circulars_status (status);
-- ALTER TABLE circulars MODIFY COLUMN pdf_url VARCHAR(1000) NULL;
-- CREATE TABLE IF NOT EXISTS uploads (name VARCHAR(80) PRIMARY KEY, mime VARCHAR(20) NOT NULL, size INT NOT NULL, data LONGBLOB NOT NULL, uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
-- CREATE TABLE IF NOT EXISTS settings (key_name VARCHAR(80) PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
