# Circular watcher

Checks the official pages in `sources.json` once an hour (GitHub Actions,
`.github/workflows/watch-circulars.yml`) and sends a Telegram message when a
page lists a link it has not seen before.

## One-time setup

1. In Telegram, message **@BotFather**, send `/newbot`, follow the steps, and keep the **token** it gives you.
2. Open your new bot in Telegram and send it any message (for example "hi").
3. Find your chat ID: open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser (replace `<TOKEN>`),
   and look for `"chat":{"id": 123456789`. That number is the chat ID.
4. On GitHub: repository → Settings → Secrets and variables → Actions → New repository secret. Add
   `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
5. Repository → Actions → "Watch official circular pages" → Run workflow, to start it without waiting for the hour.

The first run sends one "Now watching …" message per page and records what is on it. After that you are
only told about new links.

## Adding or removing a page

Edit `sources.json` (`id`, `label`, `url`). A new page is recorded silently on its first check, with a
"Now watching" message.

## If a page cannot be read

After three failed checks in a row you get a warning message, then a reminder once a day. The page's
layout may have changed, or the site may block GitHub's servers.
