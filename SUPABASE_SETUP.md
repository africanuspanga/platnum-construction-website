# Supabase Manual Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `platnum-construction-erp`
   - **Database Password**: (create a strong password and save it)
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait for it to initialize

## Step 2: Get Your Environment Variables

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

3. Add these to your project:
   - In v0: Click the **Vars** section in the sidebar and add both variables
   - Or create a `.env.local` file in your project root with these values

## Step 3: Run SQL Scripts

1. In Supabase dashboard, go to **SQL Editor**
2. Run each script in order:

### Script 1: Create Tables
- Click "New Query"
- Copy and paste the contents of `scripts/01-create-tables.sql`
- Click "Run" (or press Cmd/Ctrl + Enter)
- You should see "Success. No rows returned"

### Script 2: Enable Row Level Security
- Create another new query
- Copy and paste the contents of `scripts/02-enable-rls.sql`
- Click "Run"
- This sets up security policies so users can only access their own data

### Script 3: Create Functions and Triggers
- Create another new query
- Copy and paste the contents of `scripts/03-create-functions.sql`
- Click "Run"
- This creates automatic timestamp updates and user profile creation

### Script 4: Seed Equipment Data
- Create another new query
- Copy and paste the contents of `scripts/04-seed-data.sql`
- Click "Run"
- This adds all 18 equipment items to your database

## Step 4: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Email** provider (should be enabled by default)
3. Go to **Authentication** → **URL Configuration**
4. Add your site URL:
   - For development: `http://localhost:3000`
   - For production: Your actual domain

## Step 5: Create Your First Admin User

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: your admin email
   - **Password**: create a strong password
   - **Auto Confirm User**: Check this box
4. Click "Create user"
5. Copy the user's UUID (you'll need this)

6. Go to **SQL Editor** and run this query (replace `YOUR_USER_UUID` with the actual UUID):

\`\`\`sql
UPDATE public.users 
SET role = 'admin', full_name = 'Admin Name'
WHERE id = 'YOUR_USER_UUID';
\`\`\`

## Step 6: Test Your Setup

1. Go to your app at `http://localhost:3000`
2. Click "Sign In" in the navigation
3. Log in with your admin credentials
4. You should be redirected to the admin dashboard

## Troubleshooting

### "relation does not exist" error
- Make sure you ran all SQL scripts in order
- Check that the scripts completed successfully

### Can't log in
- Verify your environment variables are correct
- Check that you confirmed the user in Supabase Auth
- Make sure the user has a role set in the users table

### RLS policy errors
- Ensure script 02 (RLS policies) ran successfully
- Check that your user has the correct role in the users table

## Next Steps

After setup is complete:
1. Create additional users (Project Managers and Clients)
2. Test the equipment rental flow
3. Create sample projects
4. Generate test invoices

Need help? Check the Supabase documentation at [https://supabase.com/docs](https://supabase.com/docs)
