## The following should be standard includes
# include core makefile targets for release management
-include .make/base.mk
-include .make/oci.mk
-include .make/helm.mk
-include .make/k8s.mk

docs-pre-build:
	pip install -r docs/requirements.txt

# Make production deployment to allow application to be run with Helm and Nginx image
production-deploy:
	cp -R public /dist/
	yarn webpack build --optimization-concatenate-modules --mode production --optimization-minimize --output-clean --output-path /dist/