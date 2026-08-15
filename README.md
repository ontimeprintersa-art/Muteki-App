# Muteki — React + Netlify Functions

This repository contains the Muteki marketplace web app — a Vite + React client (Tailwind) and Netlify Functions (Twilio Verify for WhatsApp OTP + Supabase product APIs).

Commit: Initial Muteki app with WhatsApp OTP + Supabase

## Structure

- client/ — Vite + React app (JS) with Tailwind, PWA manifest and service worker
- netlify/functions/ — Netlify Functions: auth-send-otp, auth-verify-otp, products
- server/data/products.json — seed data (also useful for local dev)
- netlify.toml — Netlify config
- README.md — this file

## Quick local dev

1. Create a Supabase project and add the SQL schema in `supabase.sql` (see README below).
2. Create a Twilio Verify service and enable WhatsApp sandbox or provision a WhatsApp sender.
3. Set environment variables in Netlify (or for local `netlify dev`):
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_VERIFY_SERVICE_SID
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - VITE_SUPABASE_URL (optional for client)
   - VITE_SUPABASE_ANON_KEY (optional for client)

Use `netlify dev` to run the client + functions locally.
