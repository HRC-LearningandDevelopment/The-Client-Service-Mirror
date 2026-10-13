# The Client Service Mirror (GitHub Pages version)

A single-file version of the assessment. No Apps Script, no Google Sheets, no tracking. Everything runs in the participant's browser, including the PDF.

## Put it online
1. Create a public GitHub repository (or reuse the one from before).
2. Upload `index.html` to the root and commit. If an old `index.html` is there, replace it.
3. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Optional custom domain: enter `client-service-mirror-test.revexpertone.com` in the Custom domain box, and in Cloudflare add a CNAME `client-service-mirror-test` → `jsan8574.github.io` (DNS only, grey cloud). Then tick Enforce HTTPS.

## Settings (near the top of the script in index.html)
- `SUBMIT_NOTE`: the instruction shown on the result page about sending the result back.
- `SEND_TO_EMAIL`: add an email address to show an "Email my result" button. It opens the participant's email app with their result summary filled in; they attach the PDF and send.
- `SHUFFLE_OPTIONS`: randomises the A–D order per person.

## What participants get
- A result page with their name, role, department and date on screen, so a screenshot identifies them.
- "Download my answers": a branded PDF with their details, scores, answer pattern, all 10 answers and their full profile.
