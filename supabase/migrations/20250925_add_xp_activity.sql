-- XP and Activity schema for CodeSnap
-- Tables: user_xp_profile, user_activity_log
-- RPC: award_xp

-- Tables
create table if not exists public.user_xp_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 1,
  level integer not null default 1,
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default (now() at time zone 'utc')::date,
  views integer not null default 0,
  completes integer not null default 0,
  likes integer not null default 0,
  bookmarks integer not null default 0,
  shares integer not null default 0,
  xp_earned integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (user_id, activity_date)
);

-- RLS
alter table public.user_xp_profile enable row level security;
alter table public.user_activity_log enable row level security;

create policy "Users can view own xp" on public.user_xp_profile for select using (auth.uid() = user_id);
create policy "Users can upsert own xp" on public.user_xp_profile for insert with check (auth.uid() = user_id);
create policy "Users can update own xp" on public.user_xp_profile for update using (auth.uid() = user_id);

create policy "Users can view own activity" on public.user_activity_log for select using (auth.uid() = user_id);
create policy "Users can upsert own activity" on public.user_activity_log for insert with check (auth.uid() = user_id);
create policy "Users can update own activity" on public.user_activity_log for update using (auth.uid() = user_id);

-- Helpers
create or replace function public.xp_threshold(p_level int)
returns int
language sql as $$
  select (p_level * p_level + 3 * p_level) * 25;
$$;

create or replace function public.compute_level(p_xp int)
returns int
language plpgsql as $$
declare
  lvl int := 1;
begin
  if p_xp is null or p_xp < 0 then
    return 1;
  end if;
  loop
    exit when p_xp < public.xp_threshold(lvl);
    lvl := lvl + 1;
    -- Safety cap to avoid runaway loops
    if lvl > 200 then
      exit;
    end if;
  end loop;
  return greatest(lvl, 1);
end;
$$;

-- RPC to award XP and log activity
create or replace function public.award_xp(p_action text, p_user_id uuid default auth.uid())
returns table (new_xp int, new_level int, leveled_up boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  weight int := 0;
  prev_level int;
  act_date date := (now() at time zone 'utc')::date;
begin
  -- Map action to XP weight
  case lower(coalesce(p_action, ''))
    when 'view' then weight := 5;
    when 'complete' then weight := 20;
    when 'like' then weight := 10;
    when 'bookmark' then weight := 8;
    when 'share' then weight := 15;
    else weight := 0;
  end case;

  if weight = 0 then
    return query select
      coalesce(xp, 0) as new_xp,
      coalesce(level, 1) as new_level,
      false as leveled_up
    from public.user_xp_profile where user_id = p_user_id;
  end if;

  -- Upsert profile
  insert into public.user_xp_profile(user_id, xp, level)
  values (p_user_id, weight, public.compute_level(weight))
  on conflict (user_id)
  do update set
    xp = public.user_xp_profile.xp + excluded.xp,
    level = public.compute_level(public.user_xp_profile.xp + excluded.xp),
    updated_at = now()
  returning user_xp_profile.xp, user_xp_profile.level into new_xp, new_level;

  -- Determine previous level
  select level into prev_level from public.user_xp_profile where user_id = p_user_id;
  leveled_up := (new_level > prev_level);

  -- Upsert daily activity
  insert into public.user_activity_log(user_id, activity_date, xp_earned, views, completes, likes, bookmarks, shares)
  values (
    p_user_id,
    act_date,
    weight,
    case when lower(p_action) = 'view' then 1 else 0 end,
    case when lower(p_action) = 'complete' then 1 else 0 end,
    case when lower(p_action) = 'like' then 1 else 0 end,
    case when lower(p_action) = 'bookmark' then 1 else 0 end,
    case when lower(p_action) = 'share' then 1 else 0 end
  )
  on conflict (user_id, activity_date)
  do update set
    xp_earned = public.user_activity_log.xp_earned + excluded.xp_earned,
    views = public.user_activity_log.views + excluded.views,
    completes = public.user_activity_log.completes + excluded.completes,
    likes = public.user_activity_log.likes + excluded.likes,
    bookmarks = public.user_activity_log.bookmarks + excluded.bookmarks,
    shares = public.user_activity_log.shares + excluded.shares,
    updated_at = now();

  return query select new_xp, new_level, leveled_up;
end;
$$;

revoke all on function public.award_xp(text, uuid) from public;
grant execute on function public.award_xp(text, uuid) to authenticated;

create index if not exists idx_activity_user_date on public.user_activity_log(user_id, activity_date);


