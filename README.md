# Truck Detection Dashboard

A Next.js 16 app that displays truck detection data, camera devices, and truck data from Supabase, with a UI inspired by cloud surveillance dashboards.

## Stack

- **Next.js** 16.0.7 (App Router)
- **React** 19.0.1
- **Supabase** (tables: `truck_detections`, `camera`, `truck`)
- **Tailwind CSS** 4

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Supabase**

   Copy `.env.local.example` to `.env.local` and set your Supabase URL and anon key:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Supabase schema

The app expects these tables:

- **camera** – `id` (uuid), `camera_name`, `camera_info`, `camera_location`, `battery`, `data_used`, `created_at`, `updated_at`
- **truck** – `id` (uuid), `truck_name`, `truck_number`, `truck_detail`, `created_at`, `updated_at`
- **truck_detections** – `id` (int8), `camera_id` (FK → camera), `truck_id` (FK → truck), `bin_status`, `truck_status`, `detected_at`, `image_url`, `video_url`, `created_at`

Ensure Row Level Security (RLS) allows your anon key to `SELECT` from these tables (or use a service role key server-side if you add API routes).

## Features

- **Filter bar** – “All Cameras” (camera), “All” (status), and date range filters
- **Empty state** – “No Videos Yet” with data protection message and action buttons when there are no detections
- **Detection list** – Grid of detection cards with video/image, timestamp, truck, camera, and status when data exists

## Project structure

- `app/` – Layout and home page
- `components/` – `FilterBar`, `EmptyState`, `DetectionList`, `Dashboard`
- `lib/supabase/` – Supabase client and TypeScript types
