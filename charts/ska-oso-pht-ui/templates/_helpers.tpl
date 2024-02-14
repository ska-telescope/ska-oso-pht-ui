{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "ska-oso-pht-ui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "ska-oso-pht-ui.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "ska-oso-pht-ui.labels" }}
app: {{ template "ska-oso-pht-ui.name" . }}
chart: {{ template "ska-oso-pht-ui.chart" . }}
release: {{ .Release.Name }}
heritage: {{ .Release.Service }}
system: {{ .Values.system }}
subsystem: {{ .Values.subsystem }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ska-oso-pht-ui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
set the ingress url path
*/}}
{{- define "ska-oso-pht-ui.ingress.path" }}
{{- if .Values.ingress.prependByNamespace -}}
/{{ .Release.Namespace }}/{{ .Values.ingress.path }}
{{- else if .Values.ingress.path -}}
/{{ .Values.ingress.path }}
{{- else -}}

{{- end }}
{{- end }}

{{- define "ska-oso-pht-ui.urls-skaPhtApiUrl" -}}
{{- if .Values.runtimeEnv.skaPhtApiUrl -}}
{{ .Values.runtimeEnv.skaPhtApiUrl }}
{{- else -}}
/{{ .Release.Namespace }}/pht/api/v1
{{- end }}
{{- end }}

{{- define "ska-oso-pht-ui.urls-skaSensitivityCalcUrl" -}}
{{- if .Values.runtimeEnv.skaSensitivityCalcUrl -}}
{{ .Values.runtimeEnv.skaSensitivityCalcUrl }}
{{- else -}}
/{{ .Release.Namespace }}/sensitivity/
{{- end }}
{{- end }}

{{- define "ska-oso-pht-ui.urls-skaLoginAppUrl" -}}
{{- if .Values.runtimeEnv.skaLoginAppUrl -}}
{{ .Values.runtimeEnv.skaLoginAppUrl }}
{{- else -}}
/{{ .Release.Namespace }}/login/
{{- end }}
{{- end }}
