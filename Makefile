## The following should be standard includes
# include core makefile targets for release management

-include .make/base.mk
-include .make/oci.mk
-include .make/helm.mk
-include .make/k8s.mk
-include .make/js.mk

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
