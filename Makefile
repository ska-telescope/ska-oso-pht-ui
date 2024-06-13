# KUBE_NAMESPACE defines the Kubernetes Namespace that will be deployed to
# using Helm.  If this does not already exist it will be created
KUBE_NAMESPACE ?= ska-oso-pht-ui
K8S_CHART ?= ska-oso-pht-ui-umbrella
KUBE_HOST ?= http://`minikube ip`
RELEASE_NAME ?= test

# The default PHT_BACKEND_URL points to the umbrella chart PHT back-end deployment
BACKEND_URL ?= $(KUBE_HOST)/$(KUBE_NAMESPACE)/pht/api/v1
POSTGRES_HOST ?= $(RELEASE_NAME)-postgresql

K8S_CHART_PARAMS += \
  --set ska-oso-pht-ui.backendURL=$(BACKEND_URL) \
  --set ska-db-oda-umbrella.pgadmin4.serverDefinitions.servers.firstServer.Host=$(POSTGRES_HOST)

## The following should be standard includes
# include core makefile targets for release management

-include .make/base.mk
-include .make/oci.mk
-include .make/helm.mk
-include .make/k8s.mk
-include .make/js.mk

JS_SERVE_PORT = 6101 ## serve port

k8s-do-test:
	@echo "Nothing to do here yet!"
	@mkdir -p build; echo "0" > build/status

js-do-test:
	@mkdir -p $(JS_BUILD_REPORTS_DIRECTORY)
	@rm -rf ./build/tests/unit*.xml
	@{ \
		. $(JS_SUPPORT); \
		$(JS_COMMAND_RUNNER) cypress run \
			--component --headless --browser chrome --config video=false \
			--reporter junit --reporter-options mochaFile=build/tests/unit-tests-[hash].xml; \
		EXIT_CODE=$$?; \
    	echo "js-do-test: Exit code $$EXIT_CODE"; \
		JS_PACKAGE_MANAGER=$(JS_PACKAGE_MANAGER) jsMergeReports ${JS_BUILD_REPORTS_DIRECTORY}/unit-tests.xml "build/tests/unit*.xml"; \
		cp ${JS_BUILD_REPORTS_DIRECTORY}/cobertura-coverage.xml ${JS_BUILD_REPORTS_DIRECTORY}/code-coverage.xml; \
		exit $$EXIT_CODE; \
	}


