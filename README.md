# Circl

Circl is a social app built with Next.js, Clerk, Prisma, PostgreSQL, and Cloudinary.
Users can create posts, upload images, like posts, comment with nested replies, follow other users, and receive notifications.

Live URL: [https://circl-five.vercel.app](https://circl-five.vercel.app)

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Clerk authentication
- Prisma
- PostgreSQL
- Cloudinary

## Features

- Authentication with Clerk
- Create text and image posts
- Like posts and comments
- Nested comment replies
- Follow other users
- Real-time notification polling
- Profile pages with posts and liked posts
- Search for users and posts
- Dark mode support

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 20 or newer
- npm
- A PostgreSQL database
- A Clerk app
- A Cloudinary account

## Environment Variables

Create a `.env` file in the project root and add:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=circl/posts
```

Notes:

- `DATABASE_URL` should point to your PostgreSQL database.
- `CLOUDINARY_UPLOAD_FOLDER` is optional. The default used by the app is `circl/posts`.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your environment variables to `.env`.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Production Build

To test a production build locally:

```bash
npm run build
npm run start
```

## Deployment

The app is deployed on Vercel:

- Production URL: [https://circl-five.vercel.app](https://circl-five.vercel.app)

## Project Structure

```text
src/
  app/           App Router pages and layouts
  actions/       Server actions
  components/    UI and feature components
  lib/           Shared utilities and helpers
prisma/          Prisma schema and config
public/          Static assets
```
