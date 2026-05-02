alter table public.action_center_route_closeouts
  drop constraint if exists action_center_route_closeouts_closed_by_role_check;

alter table public.action_center_route_closeouts
  add constraint action_center_route_closeouts_closed_by_role_check
  check (
    closed_by_role in (
      'verisight_admin',
      'verisight',
      'hr_owner',
      'hr_member',
      'hr',
      'manager'
    )
  );

alter table public.action_center_route_reopens
  drop constraint if exists action_center_route_reopens_reopened_by_role_check;

alter table public.action_center_route_reopens
  add constraint action_center_route_reopens_reopened_by_role_check
  check (
    reopened_by_role in (
      'verisight_admin',
      'verisight',
      'hr_owner',
      'hr_member',
      'hr',
      'manager'
    )
  );

alter table public.action_center_route_relations
  drop constraint if exists action_center_route_relations_recorded_by_role_check;

alter table public.action_center_route_relations
  add constraint action_center_route_relations_recorded_by_role_check
  check (
    recorded_by_role in (
      'verisight_admin',
      'hr_owner',
      'hr_member',
      'hr',
      'manager'
    )
  );

notify pgrst, 'reload schema';
