# KUBE_NAMESPACE defines the Kubernetes Namespace that will be deployed to
# using Helm.  If this does not already exist it will be created
KUBE_NAMESPACE ?= ska-oso-pht-ui
K8S_CHART ?= ska-oso-pht-ui-umbrella
KUBE_HOST ?= http://`minikube ip`
RELEASE_NAME ?= test

# JS Template Variables
JS_E2E_TEST_BASE_URL ?= $(KUBE_HOST)/$(KUBE_NAMESPACE)/pht/
JS_E2E_COVERAGE_COMMAND_ENABLED = false
JS_ESLINT_CONFIG ?= .eslintrc

JS_COMMAND_RUNNER ?= yarn
JS_TEST_COMMAND ?= cypress
JS_TEST_DEFAULT_SWITCHES = run --e2e --record --key 4a3a14b8-b3ce-429e-b960-6183c885513e --headless --config video=false 

# The default PHT_BACKEND_URL points to the umbrella chart PHT back-end deployment
BACKEND_URL ?= $(KUBE_HOST)/$(KUBE_NAMESPACE)/pht/api/v2
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

# For the test, dev and integration environment, use the freshly built image in the GitLab registry
ENV_CHECK := $(shell echo $(CI_ENVIRONMENT_SLUG) | egrep 'test|dev|integration')
ifneq ($(ENV_CHECK),)
K8S_CHART_PARAMS += --set ska-oso-pht-ui.image.tag=$(VERSION)-dev.c$(CI_COMMIT_SHORT_SHA) \
	--set ska-oso-pht-ui.image.registry=$(CI_REGISTRY)/ska-telescope/oso/ska-oso-pht-ui
endif

set-dev-env-vars:
	BASE_URL="/" BACKEND_URL=$(BACKEND_URL) ENVJS_FILE=./public/env.js ./nginx_env_config.sh
	