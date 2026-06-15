#!/usr/bin/env bash
set -euo pipefail

kubectl create serviceaccount ska-oso-pht-ui -n prod-ska-oso-pht-ui --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: s3-identity-test
  namespace: prod-ska-oso-pht-ui
spec:
  serviceAccountName: ska-oso-pht-ui
  containers:
  - name: aws-cli
    image: amazon/aws-cli:latest
    command: ["sh", "-c", "aws sts get-caller-identity && echo '---' && aws s3 ls s3://services-eks-svt-cache --region eu-west-2"]
    env:
    - name: AWS_DEFAULT_REGION
      value: eu-west-2
  restartPolicy: Never
EOF

kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/s3-identity-test -n prod-ska-oso-pht-ui --timeout=60s
kubectl logs s3-identity-test -n prod-ska-oso-pht-ui
kubectl delete pod s3-identity-test -n prod-ska-oso-pht-ui
