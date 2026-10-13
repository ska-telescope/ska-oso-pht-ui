# Prepares the raw ska-oso-services OpenAPI JSON for code generation (see `make openapi-spec`).
# Read the deployment namespace (e.g. `ska-oso-services`) from the first path, so the filter works for any deployment.
([.paths | keys[] | capture("^/(?<ns>[^/]+)/oso/api/").ns] | first // "") as $ns
| ($ns | gsub("-"; "_")) as $snake
| ($ns | split("-") | map((.[:1] | ascii_upcase) + .[1:]) | join(" ")) as $title
# Names of the schemas referenced by a $ref inside the input.
| def refs: [.. | objects | .["$ref"]? | strings
             | select(startswith("#/components/schemas/"))
             | ltrimstr("#/components/schemas/")];
# 1. Drop the namespace from the URLs, keeping /oso/api/version-number.
  (if $ns == "" then . else
     .paths |= with_entries(.key |= sub("^/" + $ns + "(?=/oso/api/)"; ""))
   end)
# 2. Keep only the routes the PHT / SV ideas tool uses, leaving out ODT and other routes except /odt/configuration, which the UI uses.
| .paths |= with_entries(select(.key | test("^/oso/api/v[0-9]+/(pht/|coordinates/|visibility/|odt/configuration$)")))
# 3. Drop the namespace from the operationIds, $refs, schema names and titles. (FastAPI adds it as well)
| (if $ns == "" then . else
     walk(if type == "string" then sub("_" + $snake + "(?=_oso_api)"; "") else . end)
     | .components.schemas |= with_entries(.key |= sub("_" + $snake + "(?=_oso_api)"; ""))
     | walk(if type == "object" and (.title | type) == "string"
            then .title |= sub(" " + $title + "(?= Oso Api)"; "") else . end)
   end)
# 4. Replace the space in the security scheme name with a hyphen, in the definition and in each requirement, as the generator rejects it.
| walk(if type == "object" and has("SKAO Authentication")
       then with_entries(if .key == "SKAO Authentication" then .key = "SKAO-Authentication" else . end)
       else . end)
# 5. Keep only the schemas the remaining routes use, following $refs through to the schemas nested inside them.
| . as $doc
| ($doc | del(.components.schemas) | refs) as $roots
| ({seen: [], todo: $roots}
   | until(.todo | length == 0;
           .todo as $t | .seen += $t
           | .todo = (([$t[] | $doc.components.schemas[.] | refs[]] | unique) - .seen))
   | .seen) as $keep
| .components.schemas |= with_entries(select(.key | IN($keep[])))
