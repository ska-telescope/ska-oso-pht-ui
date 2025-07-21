#!/bin/bash
# This script is used to write the env.js file that loads the BACKEND_URL
# and BASE_URL at runtime for Kubernetes environments. This is done
# with a script because these environment properties depend on the k8s
# namespace which is not known at build time and has to be injected to the
# application at runtime instead.

OUTPUT_FILE="${ENVJS_FILE:-/usr/share/nginx/html/env.js}"
rm -f $OUTPUT_FILE

# Add assignment
ENV_STRING="window.env = {"

# TODO update with entra const
for varname in "BACKEND_URL" "BASE_URL"; do
  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Exit with error if environment variable not defined
  [[ -z $value ]] && { echo "Environment variable $varname is not defined" ; exit 1; }

  # Append configuration property to JS file
  ENV_STRING+="  $varname: \"$value\","
done

ENV_STRING+="}"

echo $ENV_STRING >> $OUTPUT_FILE