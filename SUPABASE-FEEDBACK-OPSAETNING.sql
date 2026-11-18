-- Kør dette script i samme Supabase-projekt som besøgsstatistikken.
-- Forudsætter ai_private.admin og extensions.crypt fra SUPABASE-OPSAETNING.sql.
create table if not exists ai_private.feedback (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 type text not null, name text not null default '', message text not null,
 is_read boolean not null default false
);
create index if not exists ai_feedback_created on ai_private.feedback(created_at desc);
alter table ai_private.feedback enable row level security;
revoke all on ai_private.feedback from public, anon, authenticated;

create or replace function public.ai_submit_feedback(p_type text,p_name text,p_message text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_type not in ('Feedback','Forslag og idéer','Teknisk fejl')
 or length(coalesce(p_name,''))>150 or length(btrim(coalesce(p_message,''))) not between 1 and 5000
 then raise exception 'Ugyldig feedback'; end if;
 insert into ai_private.feedback(type,name,message)
 values(p_type,left(btrim(coalesce(p_name,'')),150),btrim(p_message));
end $$;

create or replace function public.ai_get_feedback(p_pin text)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if length(coalesce(p_pin,''))>100 or not exists(
 select 1 from ai_private.admin where pin_hash=extensions.crypt(p_pin,pin_hash))
 then raise exception 'Access denied'; end if;
 return coalesce((select jsonb_agg(to_jsonb(f) order by f.created_at desc)
 from (select id,created_at,type,name,message,is_read from ai_private.feedback
 order by created_at desc limit 500) f),'[]'::jsonb);
end $$;

create or replace function public.ai_mark_feedback_read(p_pin text,p_id bigint)
returns void language plpgsql security definer set search_path='' as $$
begin
 if length(coalesce(p_pin,''))>100 or not exists(
 select 1 from ai_private.admin where pin_hash=extensions.crypt(p_pin,pin_hash))
 then raise exception 'Access denied'; end if;
 update ai_private.feedback set is_read=true where id=p_id;
end $$;

revoke all on function public.ai_submit_feedback(text,text,text) from public;
revoke all on function public.ai_get_feedback(text) from public;
revoke all on function public.ai_mark_feedback_read(text,bigint) from public;
grant execute on function public.ai_submit_feedback(text,text,text) to anon;
grant execute on function public.ai_get_feedback(text) to anon;
grant execute on function public.ai_mark_feedback_read(text,bigint) to anon;
