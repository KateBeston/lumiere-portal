-- Security advisor fixes: pin search_path on trigger/helper functions and
-- stop signed-out visitors calling the staff check.
alter function public.touch_updated_at() set search_path = public;
alter function public.stage_label(public.project_stage) set search_path = public;
alter function public.log_client_created() set search_path = public;
alter function public.log_project_change() set search_path = public;
alter function public.log_document_added() set search_path = public;
revoke execute on function public.is_staff() from anon;
