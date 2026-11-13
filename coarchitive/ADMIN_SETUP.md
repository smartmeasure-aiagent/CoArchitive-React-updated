# Admin content editor — setup

This site has a built-in admin at **`/#/admin`**. Once it's connected to a free
Supabase project, you can log in, turn on **Edit mode**, and click any text or
image on the site to change it. Edits save to the cloud and every visitor sees
them immediately — no code changes, no redeploy.

Until the three steps below are done, the site runs normally on its built-in
default content and `/#/admin` shows these setup instructions.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com>, sign up (free), and create a new project.
2. Once it's ready, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** API key

## 2. Create the content table, image bucket and access rules

In the Supabase dashboard open **SQL Editor → New query**, paste all of this,
and click **Run**:

```sql
-- Table that holds every content override (one row per edited field)
create table if not exists public.site_content (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table public.site_content enable row level security;

-- Anyone may READ content (the public website needs it)
create policy "content is public read"
  on public.site_content for select
  using (true);

-- Only signed-in admins may WRITE content
create policy "content writable by authenticated"
  on public.site_content for insert
  to authenticated with check (true);
create policy "content updatable by authenticated"
  on public.site_content for update
  to authenticated using (true) with check (true);
create policy "content deletable by authenticated"
  on public.site_content for delete
  to authenticated using (true);

-- Public bucket for admin-uploaded images
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Anyone may read images; only signed-in admins may upload/replace
create policy "site images public read"
  on storage.objects for select
  using (bucket_id = 'site-images');
create policy "site images admin write"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'site-images');
create policy "site images admin update"
  on storage.objects for update
  to authenticated using (bucket_id = 'site-images');
```

## 3. Create your admin login

In the dashboard open **Authentication → Users → Add user**, and create a user
with your email and a password. That email + password is your admin login.

> Tip: under **Authentication → Providers → Email**, turn **Confirm email**
> off (or confirm the user) so the account can sign in right away. Leave public
> sign-ups disabled so only users you create here can ever edit the site.

## 4. Add the keys to the project

Create a file named **`.env`** in the `coarchitive/` folder (copy `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

Then add the **same two variables** in your host:
**Vercel → Project → Settings → Environment Variables**, and redeploy.

---

## Using it

1. Visit **`/#/admin`** and sign in.
2. The **Admin bar** appears at the bottom. Flip on **Edit mode**.
3. Browse the site. Editable text shows a dashed outline — click it and type.
   `*a word*` wrapped in asterisks renders in the italic accent face.
4. Hover an image and click **✎ Edit image** to upload a file or paste a URL.
5. Every change saves automatically. Flip Edit mode off (or log out) to preview
   the site exactly as visitors see it.

### Notes

- The **anon key is meant to be public.** All write access is gated by the Row
  Level Security policies above, which require a logged-in user. Never put the
  **service_role** key in this project.
- To undo a change back to the original built-in text/image, use **↺ Reset to
  default** in an image's menu, or retype the original wording.
- Edits are stored as overrides keyed by field. If you later change the default
  wording in the code for a field that has an override, the override still wins
  until it's reset.
