# KUBE_NAMESPACE defines the Kubernetes Namespace that will be deployed to
# using Helm.  If this does not already exist it will be created
KUBE_NAMESPACE ?= ska-oso-pht-ui
K8S_CHART ?= ska-oso-pht-ui-umbrella
KUBE_HOST ?= http://localhost

K8S_WAIT_LABEL_FILTER_ARGS = -l release=$(HELM_RELEASE)

# JS Template Variables
JS_E2E_TEST_BASE_URL ?= $(KUBE_HOST)/$(KUBE_NAMESPACE)/pht/
JS_E2E_COVERAGE_COMMAND_ENABLED = false
JS_ESLINT_CONFIG ?= eslint.config.js
JS_E2E_TESTS_DIR ?= tests/cypress

$(info $(JS_E2E_TEST_BASE_URL))

JS_COMMAND_RUNNER ?= yarn
JS_TEST_COMMAND ?= vitest
JS_TEST_DEFAULT_SWITCHES = run --coverage.enabled=true --reporter=junit --reporter=default --coverage.reportsDirectory=$(JS_BUILD_REPORTS_DIRECTORY) --outputFile=$(JS_BUILD_REPORTS_DIRECTORY)/unit-tests.xml

# # Post hook for coverage reports
# js-post-e2e-test:
# 	yarn test:e2e:coverage
# 	cp build/reports/cobertura-coverage.xml build/reports/code-coverage.xml

js-pre-e2e-test:
	mkdir -p build/reports
	mkdir -p build/.nyc_output

AWK := $(shell command -v gawk 2>/dev/null || command -v awk 2>/dev/null)
ifeq ($(AWK),)
  $(error This script relies on gawk (or awk) for setting the correct URI paths to the services and senscalc. Please install gawk or awk and try again.)
endif
OSO_SERVICES_MAJOR_VERSION ?= $(shell helm dependency list ./charts/ska-oso-pht-ui-umbrella/ | grep ska-oso-services | $(AWK) -F'[[:space:]]+|[.]' '{print $$2}')
OST_SENSCALC_MAJOR_VERSION ?= $(shell helm dependency list ./charts/ska-oso-pht-ui-umbrella/ | grep ska-ost-senscalc | $(AWK) -F'[[:space:]]+|[.]' '{print $$2}')

# BACKEND_PROXY is the target origin (+ path prefix) for the vite dev proxy (avoids CORS).
# For local k8s:  http://<minikube-ip>/<namespace>  (default)
# For remote k8s: https://k8s.stfc.skao.int/dev-ska-oso-pht-ui-aaa
BACKEND_PROXY ?= $(KUBE_HOST)/$(KUBE_NAMESPACE)


# Major version of the deployed ska-ost-senscalc — keep in sync with charts/ska-oso-pht-ui-umbrella/Chart.yaml
SENSCALC_API_VERSION ?= v11


# include core makefile targets for release management
-include .make/base.mk
-include .make/oci.mk
-include .make/helm.mk
-include .make/k8s.mk
-include PrivateRules.mak
-include .make/xray.mk
-include .make/js.mk


XRAY_TEST_RESULT_FILE ?= ctrf/ctrf-report.json
XRAY_EXECUTION_CONFIG_FILE ?= tests/xray-config.json

ifneq ($(USE_INDIGO),)
  K8S_CHART_PARAMS += --set ska-oso-pht-ui.runtimeEnv.useIndigo=$(USE_INDIGO)
endif

K8S_CHART_PARAMS += \
  --set ska-oso-pht-ui.runtimeEnv.skaOsoServicesUrl="/$(KUBE_NAMESPACE)/oso/api/v$(OSO_SERVICES_MAJOR_VERSION)"


# PRODUCTION DEPLOYMENT CONFIG
ENV_CHECK := $(shell echo $(CI_ENVIRONMENT_SLUG) | egrep 'prod')
ifneq ($(ENV_CHECK),)

PRODUCTION_URL=sv-ideas.skao.int
API_DEPLOY_PATH=/api

K8S_CHART_PARAMS += --set ska-oso-pht-ui.ingress.host=$(PRODUCTION_URL) \
  --set ska-oso-pht-ui.ingress.production=true \
  --set ska-oso-pht-ui.ingress.prependByNamespace=false \
  --set ska-oso-pht-ui.ingress.path= \
  --set ska-oso-pht-ui.runtimeEnv.skaOsoServicesUrl=$(API_DEPLOY_PATH) \
  --set ska-oso-pht-ui.runtimeEnv.skaSensitivityCalcUrl=https://sensitivity-calculator.skao.int/api/v11 \
  --set ska-oso-pht-ui.runtimeEnv.msentraRedirectUri=/ \
  --set ska-ost-senscalc.enabled=false \
  --set ska-oso-services-umbrella.ska-oso-services.ingress.host=$(PRODUCTION_URL) \
  --set ska-oso-services-umbrella.ska-oso-services.ingress.pathOverride=$(API_DEPLOY_PATH) \
  --set ska-oso-services-umbrella.ska-db-oda-umbrella.postgres.enabled=false \
  --set ska-oso-services-umbrella.ska-db-oda-umbrella.ska-db-oda.ska-db-migrations.liquibase.contextFilter='' \
  --set global.oda.postgres.secret.vault.mount=aws-eu-west-2 \
  --set global.oda.postgres.secret.vault.secretPath=production/ska-ser-postgres/pghqaa/oda/odaadm \
  --set 'global.oda.postgres.secret.vault.secretKeys={PGHOST,PGPORT,PGDATABASE,PGUSER,PGPASSWORD,PGOPTIONS}'

# TODO Disabled while ODA deployment is worked on and until secrets are available in prod Vault path
K8S_CHART_PARAMS += --set ska-oso-pht-ui.vault.enabled=false \
  --set ska-oso-services-umbrella.ska-oso-services.vault.enabled=false
endif

# CI_ENVIRONMENT_SLUG should only be defined when running on the CI/CD pipeline, so these variables are set for a local deployment
# Set cluster_domain to minikube default (cluster.local) in local development
ifeq ($(CI_ENVIRONMENT_SLUG),)
SGCLUSTER = oda
SGCLUSTER_NAMESPACE = oda

K8S_CHART_PARAMS += \
  --set global.cluster_domain="cluster.local" \
  --set ska-oso-pht-ui.vault.enabled=false \
  --set ska-oso-pht-ui.rest.image.tag=$(VERSION) \
  --set ska-oso-services-umbrella.ska-oso-services.vault.enabled=false \
  --set global.oda.postgres.secret.vault.enabled=false \
  --set global.oda.postgres.cluster=$(SGCLUSTER) \
  --set global.oda.postgres.clusterNamespace=$(SGCLUSTER_NAMESPACE)
endif

PGDATABASE ?= $(subst -,_,$(KUBE_NAMESPACE))
PGUSER = $(PGDATABASE)_admin
K8S_CHART_PARAMS += --set global.oda.postgres.database=$(PGDATABASE) \
	--set global.oda.postgres.user=$(PGUSER)


# For the test, dev and integration environment, use the freshly built image in the GitLab registry
ENV_CHECK := $(shell echo $(CI_ENVIRONMENT_SLUG) | egrep 'test|dev|integration|prod')
ifneq ($(ENV_CHECK),)
K8S_CHART_PARAMS += --set ska-oso-pht-ui.image.tag=10.1.0-dev.cb7808ad2 \
	--set ska-oso-pht-ui.image.registry=$(CI_REGISTRY)/ska-telescope/oso/ska-oso-pht-ui
endif

ENV_CHECK_DEV := $(shell echo $(CI_ENVIRONMENT_SLUG) | grep 'dev')
ifneq ($(ENV_CHECK_DEV),)
endif

set-dev-env-vars:
	REACT_APP_SKA_PHT_BASE_URL="/" \
	REACT_APP_SKA_OSO_SERVICES_URL="/oso/api/v$(OSO_SERVICES_MAJOR_VERSION)" \
	REACT_APP_SKA_SENSITIVITY_CALC_URL="/senscalc/api/v$(OST_SENSCALC_MAJOR_VERSION)/" \
	REACT_APP_USE_LOCAL_DATA="false" \
	MSENTRA_CLIENT_ID="2445e300-54c9-470f-9578-0f54840672af" \
	MSENTRA_TENANT_ID="78887040-bad7-494b-8760-88dcacfb3805" \
	MSENTRA_REDIRECT_URI="http://localhost:6101" \
	USE_INDIGO="$(or $(USE_INDIGO),false)" \
	INDIGO_AUTHORITY="https://iam-1.staging.devx.skao.int/" \
	INDIGO_CLIENT_ID="d546e462-637c-44ff-b2b9-3345a960ad42" \
	INDIGO_REDIRECT_URI="http://localhost:6101/" \
	INDIGO_SCOPE="pht:readwrite pht:read openid profile" \
	INDIGO_AUDIENCE="test:pht" \
	ENVJS_FILE=./public/env.js ./scripts/write_env_js.sh

dev-start: set-dev-env-vars
	BACKEND_PROXY="$(BACKEND_PROXY)" yarn start
