#!/bin/bash
# Deletes every proposal from the PHT database in a local minikube deployment, so local e2e runs
# start empty like CI's. Each run creates proposals the app can't delete, and a test user's
# proposal list gets slower as they pile up, until it times out.
#
# The database is in the shared ODA cluster (namespace oda), not in the PHT release, so
# reinstalling the chart doesn't clear it. Only runs against the minikube kubectl context.
set -euo pipefail

context=$(kubectl config current-context)
if [ "$context" != "minikube" ]; then
  echo "cleanLocalDb: kubectl context is '$context', not minikube - not touching it" >&2
  exit 1
fi

ODA_NAMESPACE=${ODA_NAMESPACE:-oda}
ODA_POD=${ODA_POD:-oda-0}
ODA_DATABASE=${ODA_DATABASE:-ska_oso_pht_ui}

kubectl exec -i -n "$ODA_NAMESPACE" "$ODA_POD" -c patroni -- \
  psql -qAt -U postgres -d "$ODA_DATABASE" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'cleanLocalDb: deleting ' || count(*) || ' proposal(s)' FROM proposal.proposals;
-- Every table in the proposal schema, plus the status rows that point at proposals
DO $$
BEGIN
  EXECUTE (
    SELECT 'TRUNCATE ' || string_agg(format('%I.%I', schemaname, tablename), ', ') || ' CASCADE'
    FROM pg_tables
    WHERE schemaname = 'proposal'
       OR (schemaname = 'status' AND tablename IN ('entity_paths', 'status_entries'))
  );
END $$;
SQL
