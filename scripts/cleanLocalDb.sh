#!/bin/bash
# Gives a local minikube deployment a new, empty PHT database, so local e2e runs start empty like
# CI's. Each run creates proposals the app can't delete, and a test user's proposal list gets
# slower as they pile up, until it times out.
#
# The release owns a PGDBInstance (from the ska-db-oda-umbrella subchart). Uninstalling the chart
# deletes it, and the ska-ser-db-instance operator then drops its database and user in the ODA
# StackGres cluster. Reinstalling creates them again, and the chart's Liquibase job runs the
# migrations, which also fill in the lookup tables. Only runs against the minikube kubectl context.
#
# Settings (environment variables), passed on to make:
#   KUBE_NAMESPACE      default ska-oso-pht-ui
#   KUBE_HOST           default http://<minikube ip>:30080 (the ingress NodePort)
#   REQUEST_TIMEOUT_MS  default 60000, how long the app waits for the backend in test deployments
set -euo pipefail

log() { echo "cleanLocalDb: $*"; }
fail() {
  echo "cleanLocalDb: $*" >&2
  exit 1
}

context=$(kubectl config current-context)
[ "$context" = "minikube" ] || fail "kubectl context is '$context', not minikube - not touching it"

export KUBE_NAMESPACE=${KUBE_NAMESPACE:-ska-oso-pht-ui}
export KUBE_HOST=${KUBE_HOST:-http://$(minikube ip):30080}
export REQUEST_TIMEOUT_MS=${REQUEST_TIMEOUT_MS:-60000}

# Which database the release's PGDBInstance owns, and where
read -r db_name cluster cluster_namespace < <(kubectl get pgdbinstances -n "$KUBE_NAMESPACE" \
  -o jsonpath='{.items[0].spec.dbName} {.items[0].spec.cluster} {.items[0].spec.clusterNamespace}{"\n"}')
[ -n "${db_name:-}" ] || fail "no PGDBInstance in namespace $KUBE_NAMESPACE - is the chart installed?"

psql_in_cluster() {
  kubectl exec -i -n "$cluster_namespace" "$cluster-0" -c patroni -- psql -qAt -U postgres "$@"
}

log "database $db_name has $(psql_in_cluster -d "$db_name" \
  -c 'SELECT count(*) FROM proposal.proposals' 2>/dev/null || echo '?') proposal(s)"

log "uninstalling the chart from $KUBE_NAMESPACE"
make k8s-uninstall-chart

# The operator drops the database while the PGDBInstance is being deleted
kubectl wait --for=delete pgdbinstances --all -n "$KUBE_NAMESPACE" --timeout=180s

# The operator logs a failed drop and lets the PGDBInstance go anyway, so check. Empty output
# only means the database is gone if the query itself worked
db_exists=$(psql_in_cluster -c "SELECT 1 FROM pg_database WHERE datname = '$db_name'") ||
  fail "could not check whether database $db_name was dropped from $cluster_namespace/$cluster." \
    "The chart is uninstalled: reinstall it with make k8s-install-chart"
if [ -n "$db_exists" ]; then
  fail "database $db_name still exists in $cluster_namespace/$cluster - see the logs of the" \
    "ska-ser-db-instance operator. The chart is uninstalled: reinstall it with make k8s-install-chart"
fi
log "database $db_name dropped"

log "reinstalling the chart (KUBE_HOST=$KUBE_HOST REQUEST_TIMEOUT_MS=$REQUEST_TIMEOUT_MS)"
make k8s-install-chart

count_rows() { psql_in_cluster -d "$db_name" -c "SELECT count(*) FROM $1" 2>/dev/null; }

# The migrations may still be running after the install returns, so wait for their tables
for attempt in $(seq 60); do
  if proposals=$(count_rows proposal.proposals) && roles=$(count_rows proposal.proposal_roles); then
    break
  fi
  [ "$attempt" -lt 60 ] || fail "new database $db_name has no proposal tables after 5 minutes -" \
    "see the logs of the chart's Liquibase job"
  sleep 5
done
log "new database $db_name has $proposals proposal(s) and $roles proposal role(s)"
