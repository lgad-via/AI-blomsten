-- Kør én gang i Supabase SQL Editor. Koden lagres kun som hash på serveren.
create extension if not exists pgcrypto with schema extensions;
create schema if not exists ai_private;
revoke all on schema ai_private from public, anon, authenticated;
create table if not exists ai_private.admin (id boolean primary key default true check(id), pin_hash text not null);
insert into ai_private.admin(id,pin_hash) values(true,extensions.crypt('1234',extensions.gen_salt('bf'))) on conflict(id) do nothing;
create table if not exists ai_private.events (id bigint generated always as identity primary key, created_at timestamptz not null default now(), visitor text not null, event text not null, detail text not null default '', title text not null default '', institution text not null default '');
create index if not exists ai_events_time on ai_private.events(created_at);
create index if not exists ai_events_visitor on ai_private.events(visitor);
alter table ai_private.events enable row level security;
alter table ai_private.admin enable row level security;
create or replace function public.ai_record_event(p_visitor text,p_event text,p_detail text default '',p_title text default '',p_institution text default '') returns void language plpgsql security definer set search_path='' as $$
begin
 if length(p_visitor)>100 or length(p_visitor)<8 or length(p_title)>100 or length(p_detail)>120 then raise exception 'Invalid input'; end if;
 if p_event not in ('visit','profile','page','leaf','download_click','flower_download_click','app_install_click','recommend_mail_click','manual_paging','manual_zoom','manual_open','flower_copy_success','explanations','app_install_success','feedback_success') then raise exception 'Invalid event'; end if;
 if p_institution not in ('','Grundskole','Ungdomsuddannelse','Videregående uddannelse','Andet') then raise exception 'Invalid institution'; end if;
 if (select count(*) from ai_private.events where visitor=p_visitor and created_at>now()-interval '1 minute')>=120 then return; end if;
 insert into ai_private.events(visitor,event,detail,title,institution) values(p_visitor,p_event,coalesce(p_detail,''),coalesce(p_title,''),coalesce(p_institution,''));
end $$;
create or replace function public.ai_get_stats(p_pin text,p_days integer default 30) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; cutoff timestamptz;
begin
 if length(p_pin)>100 or not exists(select 1 from ai_private.admin where pin_hash=extensions.crypt(p_pin,pin_hash)) then raise exception 'Access denied'; end if;
 cutoff:=now()-make_interval(days=>greatest(1,least(p_days,3650)));
 with e as (select *,created_at at time zone 'Europe/Copenhagen' as local_time from ai_private.events where created_at>=cutoff),
 profiles as (select distinct on(visitor) visitor,title,institution from e order by visitor,created_at desc),
 days as (select to_char(local_time,'YYYY-MM-DD') label,count(*) count from e where event='visit' group by 1 order by 1),
 hours as (select to_char(local_time,'HH24') label,count(*) count from e where event='visit' group by 1 order by 1),
 weekdays as (select extract(isodow from local_time)::int as weekday_number,count(*) count from e where event='visit' group by 1 order by 1),
 actions as (select event||case when detail<>'' then ' · '||detail else '' end label,count(*) count from e group by 1 order by 2 desc),
 titles as (select coalesce(nullif(title,''),'Ikke oplyst') label,count(*) count from profiles group by 1 order by 2 desc),
 institutions as (select coalesce(nullif(institution,''),'Ikke oplyst') label,count(*) count from profiles group by 1 order by 2 desc)
 select jsonb_build_object('visitors',(select count(distinct visitor) from e where event='visit'),'visits',(select count(*) from e where event='visit'),
 'days',coalesce((select jsonb_agg(to_jsonb(days)) from days),'[]'::jsonb),
 'hours',coalesce((select jsonb_agg(to_jsonb(hours)) from hours),'[]'::jsonb),
 'weekdays',coalesce((select jsonb_agg(jsonb_build_object('label',(array['Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag','Søndag'])[weekday_number],'count',count)) from weekdays),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(to_jsonb(actions)) from actions),'[]'::jsonb),
 'titles',coalesce((select jsonb_agg(to_jsonb(titles)) from titles),'[]'::jsonb),
 'institutions',coalesce((select jsonb_agg(to_jsonb(institutions)) from institutions),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function public.ai_record_event(text,text,text,text,text) from public;
revoke all on function public.ai_get_stats(text,integer) from public;
grant execute on function public.ai_record_event(text,text,text,text,text) to anon;
grant execute on function public.ai_get_stats(text,integer) to anon;
