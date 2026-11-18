-- Kør dette én gang i Supabase SQL Editor. Sletning udføres kun på serveren
-- efter kontrol af admin-koden. Statistik og feedback slettes separat.
create or replace function public.ai_clear_statistics(p_pin text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if length(coalesce(p_pin,'')) <> 4 or p_pin !~ '^[0-9]{4}$' or not exists (
    select 1 from ai_private.admin where pin_hash=extensions.crypt(p_pin,pin_hash)
  ) then raise exception 'Access denied'; end if;
  delete from ai_private.events where id > 0;
end $$;

create or replace function public.ai_clear_feedback(p_pin text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if length(coalesce(p_pin,'')) <> 4 or p_pin !~ '^[0-9]{4}$' or not exists (
    select 1 from ai_private.admin where pin_hash=extensions.crypt(p_pin,pin_hash)
  ) then raise exception 'Access denied'; end if;
  delete from ai_private.feedback where id > 0;
end $$;

revoke all on function public.ai_clear_statistics(text) from public, anon, authenticated;
revoke all on function public.ai_clear_feedback(text) from public, anon, authenticated;
grant execute on function public.ai_clear_statistics(text) to anon;
grant execute on function public.ai_clear_feedback(text) to anon;
