# Blood Donor-Receiver Matching System

A production-ready web application for matching blood donors with receivers using Supabase as the backend and Edge Functions for logic.

## 🚀 Features
- **Donor Registration**: Public form for donors to register their blood group and city.
- **Emergency Requests**: Real-time request submission with matching donor alerts.
- **WhatsApp Notifications**: Integrated with Supabase Edge Functions (mocked structure provided).
- **Public Request Links**: UUID-based unguessable links for each request.
- **Request Closure**: Receivers can close requests, notifying donors that help is no longer needed.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide React.
- **Backend/DB**: Supabase (PostgreSQL, Row Level Security).
- **Automation**: Supabase Edge Functions (Deno).

## 📦 Setup & Deployment

### 1. Database Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** and paste the contents of `./supabase/schema.sql`. Run the query.
3. This creates the tables and enables RLS.

### 2. Edge Functions Deployment
1. Install Supabase CLI: `npm i -g supabase`.
2. Login: `supabase login`.
3. Link project: `supabase link --project-ref your-project-id`.
4. Deploy functions:
   ```bash
   supabase functions deploy notify-donors --no-verify-jwt
   supabase functions deploy close-request --no-verify-jwt
   ```
5. Set Environment Variables in Supabase Dashboard (Settings -> Edge Functions):
   - `WHATSAPP_API_URL`: Your WhatsApp API endpoint.
   - `WHATSAPP_TOKEN`: Your API token.

### 3. Frontend Setup
1. Navigate to the client directory: `cd client`.
2. Install dependencies: `npm install`.
3. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase Project Settings (API).
5. Run locally: `npm run dev`.

## 🧪 Testing Flow
1. **Donor**: Open App -> "Become a Donor" -> Register "Alice" with O+ group.
2. **Receiver**: Home -> "Request Blood" -> Submit for O+ group.
3. **Alert**: Check Supabase `notifications` table or console logs in Edge Functions.
4. **Status**: You will be redirected to `/request/{id}`.
5. **Close**: Click "Mark as Blood Received". Status updates to 'closed' and donors are "notified".

## 🛡 Security
- **RLS Enabled**: `donors` table is protected from public read.
- **UUIDs**: Link IDs are non-sequential.
- **Edge Functions**: Logic runs in a secure backend environment using the `service_role` key.
"# Blood_donation" 
