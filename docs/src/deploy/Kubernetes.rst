Deployment to Kubernetes
~~~~~~~~~~~~~~~~~~~~~~~~

The Helm chart will deploy the application with environment variables from a ConfigMap and an Ingress rule.

To deploy the charts, the standard SKAO make targets are used - for example make k8s-install-chart