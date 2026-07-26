revoke all privileges on table public.notes from anon;
revoke all privileges on table public.watchlist_groups from anon;
revoke all privileges on table public.layouts from anon;
revoke all privileges on table public.alerts from anon;

revoke truncate, references, trigger on table public.notes from authenticated;
revoke truncate, references, trigger on table public.watchlist_groups from authenticated;
revoke truncate, references, trigger on table public.layouts from authenticated;
revoke truncate, references, trigger on table public.alerts from authenticated;

grant select, insert, update, delete on table public.notes to authenticated;
grant select, insert, update, delete on table public.watchlist_groups to authenticated;
grant select, insert, update, delete on table public.layouts to authenticated;
grant select, insert, update, delete on table public.alerts to authenticated;
