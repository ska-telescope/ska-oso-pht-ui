{{/*
Selector labels
*/}}
{{- define "ska-oso-pht.labels" -}}
app.kubernetes.io/name: {{ $.Chart.Name }}
{{- end }}

{{- define "ska-oso-pht.dashboard.labels" -}}
{{ include "ska-oso-pht.labels" . }}
app: {{ $.Chart.Name }}-dashboard
{{- end }}

{{- define "ska-oso-pht.api.labels" -}}
{{ include "ska-oso-pht.labels" . }}
app: {{ $.Chart.Name }}-api
{{- end }}

{{- define "ska-oso-pht.login.labels" -}}
{{ include "ska-oso-pht.labels" . }}
app: {{ $.Chart.Name }}-login-page
{{- end }}

{{- define "ingress_path_prepend" }}
    {{- if $.Values.ingress.namespaced }}
        {{- printf "/%s%s" .Release.Namespace .Values.ingress.pathStart }}
    {{- else }}
        {{- printf "%s" $.Values.ingress.pathStart }}
    {{- end }}
{{- end }}

{{- define "api_chart" }}
    {{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dashboard_url" }}
    {{- if $.Values.urls.override }}
        {{- printf "%s" $.Values.urls.dashboardurl }}
    {{- else }}
        {{- printf "%s/dashboard" (include "ingress_path_prepend" .) }}
    {{- end }}
{{- end }}

{{- define "api_url" }}
    {{- if $.Values.urls.override }}
        {{- printf "%s" $.Values.urls.apiUrl }}
    {{- else }}
        {{- printf "%s/api" (include "ingress_path_prepend" .) }}
    {{- end }}
{{- end }}
