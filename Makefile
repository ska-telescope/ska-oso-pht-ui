# KUBE_NAMESPACE defines the Kubernetes Namespace that will be deployed to
# using Helm.  If this does not already exist it will be created
KUBE_NAMESPACE ?= ska-oso-pht-ui
K8S_CHART ?= ska-oso-pht-ui-umbrella
# KUBE_HOST ?= http://`minikube ip`
RELEASE_NAME ?= test

# JS Template Variables
JS_E2E_TEST_BASE_URL ?= $(KUBE_HOST)/$(KUBE_NAMESPACE)/pht/
JS_E2E_COVERAGE_COMMAND_ENABLED = false
JS_ESLINT_CONFIG ?= .eslintrc
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

# The default PHT_BACKEND_URL points to the umbrella chart PHT back-end deployment
BACKEND_URL ?= $(KUBE_HOST)/$(KUBE_NAMESPACE)/pht/api/v8
POSTGRES_HOST ?= $(RELEASE_NAME)-postgresql

K8S_CHART_PARAMS += \
  --set ska-oso-pht-ui.backendURL=$(BACKEND_URL) \
  --set ska-db-oda-umbrella.pgadmin4.serverDefinitions.servers.firstServer.Host=$(POSTGRES_HOST)

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

# CI_ENVIRONMENT_SLUG should only be defined when running on the CI/CD pipeline, so these variables are set for a local deployment
# Set cluster_domain to minikube default (cluster.local) in local development
ifeq ($(CI_ENVIRONMENT_SLUG),)
K8S_CHART_PARAMS += \
  --set global.cluster_domain="cluster.local" \
  --set ska-db-oda-umbrella.vault.enabled=false \
  --set ska-oso-services.vault.enabled=false \
  --set ska-oso-pht-ui.vault.enabled=false
endif


# For the test, dev and integration environment, use the freshly built image in the GitLab registry
ENV_CHECK := $(shell echo $(CI_ENVIRONMENT_SLUG) | egrep 'test|dev|integration')
ifneq ($(ENV_CHECK),)
K8S_CHART_PARAMS += --set ska-oso-pht-ui.image.tag=$(VERSION)-dev.c$(CI_COMMIT_SHORT_SHA) \
	--set ska-oso-pht-ui.image.registry=$(CI_REGISTRY)/ska-telescope/oso/ska-oso-pht-ui 
endif

# For dev - use oso-services integration
ENV_CHECK_DEV := $(shell echo $(CI_ENVIRONMENT_SLUG) | grep 'dev')
ifneq ($(ENV_CHECK_DEV),)
K8S_CHART_PARAMS += \
  --set ska-oso-pht-ui.runtimeEnv.skaOsoServicesUrl="/integration-ska-oso-services/oso/api/v8"
endif

set-dev-env-vars:
	BASE_URL="/" BACKEND_URL=$(BACKEND_URL) ENVJS_FILE=./public/env.js ./nginx_env_config.sh
	