# Prepares the raw ska-oso-services OpenAPI JSON for code generation (see `make openapi-spec`).
([.paths | keys[] | capture("^/(?<ns>[^/]+)/oso/api/").ns] | first // "") as $ns
| ($ns | gsub("-"; "_")) as $snake
| ($ns | split("-") | map((.[:1] | ascii_upcase) + .[1:]) | join(" ")) as $title
| def refs: [.. | objects | .["$ref"]? | strings
             | select(startswith("#/components/schemas/"))
             | ltrimstr("#/components/schemas/")];
  (if $ns == "" then . else
     .paths |= with_entries(.key |= sub("^/" + $ns + "(?=/oso/api/)"; ""))
   end)
| .paths |= with_entries(select(.key | test("^/oso/api/v[0-9]+/(pht/|coordinates/|visibility/|odt/configuration$)")))
| (if $ns == "" then . else
     walk(if type == "string" then sub("_" + $snake + "(?=_oso_api)"; "") else . end)
     | .components.schemas |= with_entries(.key |= sub("_" + $snake + "(?=_oso_api)"; ""))
     | walk(if type == "object" and (.title | type) == "string"
            then .title |= sub(" " + $title + "(?= Oso Api)"; "") else . end)
   end)
| walk(if type == "object" and has("SKAO Authentication")
       then with_entries(if .key == "SKAO Authentication" then .key = "SKAO-Authentication" else . end)
       else . end)
| . as $doc
| ($doc | del(.components.schemas) | refs) as $roots
| ({seen: [], todo: $roots}
   | until(.todo | length == 0;
           .todo as $t | .seen += $t
           | .todo = (([$t[] | $doc.components.schemas[.] | refs[]] | unique) - .seen))
   | .seen) as $keep
| .components.schemas |= with_entries(select(.key | IN($keep[])))
