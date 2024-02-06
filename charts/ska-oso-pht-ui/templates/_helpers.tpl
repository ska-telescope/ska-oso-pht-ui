{{- define "ska-oso-pht-ui.name" -}}
{{ .Chart.Name }}-{{ .Release.Name }}-ui
{{- end }}

{{- define "ska-oso-pht-ui.labels" -}}
app.kubernetes.io/name: {{ $.Chart.Name }}
component: pht-ui
function: ui
domain: operations
{{- end }}

{{- define "ska-oso-pht-ui.urls-skaPhtUrl" -}}
{{- if .Values.runtimeEnv.skaPhtUrl -}}
{{ .Values.runtimeEnv.skaPhtUrl }}
{{- else -}}
/{{ .Release.Namespace }}/pht/ui/
{{- end }}
{{- end }}

{{- define "ska-oso-pht-ui.urls-skaPhtApiUrl" -}}
{{- if .Values.runtimeEnv.skaPhtApiUrl -}}
{{ .Values.runtimeEnv.skaPhtApiUrl }}
{{- else -}}
/{{ .Release.Namespace }}/pht/api/
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