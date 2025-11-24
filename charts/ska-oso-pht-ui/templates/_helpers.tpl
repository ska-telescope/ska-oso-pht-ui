{{- define "ska-oso-pht-ui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ska-oso-pht-ui.labels" -}}
app.kubernetes.io/name: {{ $.Chart.Name }}
app: {{ .Chart.Name }}
chart: {{ template "ska-oso-pht-ui.chart" . }}
release: {{ .Release.Name }}
component: pht-ui
function: ui
domain: operations
{{- end }}

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

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ska-oso-pht-ui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ska-oso-pht-ui.urls-skaOsoServicesUrl" -}}
{{- if .Values.runtimeEnv.skaOsoServicesUrl -}}
{{ .Values.runtimeEnv.skaOsoServicesUrl }}
{{- else -}}
/{{ .Release.Namespace }}/oso/api/v10
{{- end }}
{{- end }}

{{- define "ska-oso-pht-ui.urls-skaSensitivityCalcUrl" -}}
{{- if .Values.runtimeEnv.skaSensitivityCalcUrl -}}
{{ .Values.runtimeEnv.skaSensitivityCalcUrl }}
{{- else -}}
/{{ .Release.Namespace }}/api/v11/
{{- end }}
{{- end }}

{{- define "ska-oso-pht-ui.urls-skaLoginAppUrl" -}}
{{- if .Values.runtimeEnv.skaLoginAppUrl -}}
{{ .Values.runtimeEnv.skaLoginAppUrl }}
{{- else -}}
/{{ .Release.Namespace }}/login/
{{- end }}
{{- end }}


{{- define "ska-oso-pht-ui.urls-msentraRedirectUri" -}}
{{- if .Values.runtimeEnv.msentraRedirectUri -}}
{{ .Values.runtimeEnv.msentraRedirectUri }}
{{- else -}}
/{{ .Release.Namespace }}/pht/
{{- end }}
{{- end }}
