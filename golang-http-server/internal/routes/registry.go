package routes

import (
	"fmt"
	"net/http"
	"reflect"
	"sort"
	"strings"
)

type RouteEntry struct {
	Method      string
	Path        string
	RequestDTO  reflect.Type
	ResponseDTO reflect.Type
	QueryDTO    reflect.Type
}

type Registry struct {
	routes []RouteEntry
}

func NewRegistry() *Registry {
	return &Registry{}
}

func (r *Registry) Add(method, path string, req, res, query reflect.Type) {
	r.routes = append(r.routes, RouteEntry{
		Method:      method,
		Path:        path,
		RequestDTO:  req,
		ResponseDTO: res,
		QueryDTO:    query,
	})
}

func (r *Registry) List() []RouteEntry {
	sorted := make([]RouteEntry, len(r.routes))
	copy(sorted, r.routes)
	sort.Slice(sorted, func(i, j int) bool {
		if sorted[i].Method != sorted[j].Method {
			return sorted[i].Method < sorted[j].Method
		}
		return sorted[i].Path < sorted[j].Path
	})
	return sorted
}

func (r *Registry) DocsHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")

		fmt.Fprintln(w, "API Endpoints")
		fmt.Fprintln(w, strings.Repeat("=", 72))
		fmt.Fprintln(w)

		for _, entry := range r.List() {
			fmt.Fprintf(w, "%s %s\n", entry.Method, entry.Path)

			if entry.QueryDTO != nil {
				fmt.Fprintln(w, "  Query Params:")
				describeStruct(w, "    ", entry.QueryDTO)
			}
			if entry.RequestDTO != nil {
				fmt.Fprintln(w, "  Request Body:")
				describeStruct(w, "    ", entry.RequestDTO)
			}
			if entry.ResponseDTO != nil {
				fmt.Fprintln(w, "  Response:")
				describeStruct(w, "    ", entry.ResponseDTO)
			}

			fmt.Fprintln(w)
		}
	}
}

func describeStruct(w http.ResponseWriter, indent string, t reflect.Type) {
	for t.Kind() == reflect.Ptr {
		t = t.Elem()
	}

	if t.Kind() == reflect.Struct {
		name := t.Name()
		if pkg := t.PkgPath(); pkg != "" {
			short := pkg[strings.LastIndex(pkg, "/")+1:]
			if short != "" && name != "" {
				name = short + "." + name
			}
		}
		if name != "" {
			fmt.Fprintf(w, "%s%s\n", indent, name)
			indent += "  "
		}

		for i := range t.NumField() {
			f := t.Field(i)
			if !f.IsExported() {
				continue
			}

			if f.Anonymous {
				describeStruct(w, indent, f.Type)
				continue
			}

			jsonTag := f.Tag.Get("json")
			jsonName := strings.Split(jsonTag, ",")[0]
			if jsonName == "" || jsonName == "-" {
				continue
			}

			isOpt := f.Type.Kind() == reflect.Ptr || strings.Contains(jsonTag, "omitempty")

			if inner := elemType(f.Type); inner != nil && inner.String() == "time.Time" {
				if isOpt {
					fmt.Fprintf(w, "%s%s: datetime (optional)\n", indent, jsonName)
				} else {
					fmt.Fprintf(w, "%s%s: datetime\n", indent, jsonName)
				}
				continue
			}

			typeStr := formatType(f.Type)
			if isOpt {
				fmt.Fprintf(w, "%s%s: %s (optional)\n", indent, jsonName, typeStr)
			} else {
				fmt.Fprintf(w, "%s%s: %s\n", indent, jsonName, typeStr)
			}
		}
		return
	}

	if t.Kind() == reflect.Slice {
		e := t.Elem()
		if e.Kind() == reflect.Struct && e.Name() != "" {
			fmt.Fprintf(w, "%s[]%s\n", indent, e.Name())
			describeStruct(w, indent+"  ", e)
			return
		}
		fmt.Fprintf(w, "%s%s[]\n", indent, formatType(e))
		return
	}

	fmt.Fprintf(w, "%s%s\n", indent, formatType(t))
}

func elemType(t reflect.Type) reflect.Type {
	for t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	return t
}

func formatType(t reflect.Type) string {
	switch t.Kind() {
	case reflect.Ptr:
		return formatType(t.Elem())
	case reflect.Slice:
		return formatType(t.Elem()) + "[]"
	case reflect.Map:
		return fmt.Sprintf("map[%s]%s", t.Key(), formatType(t.Elem()))
	case reflect.Struct:
		return t.Name()
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return "int"
	case reflect.Float32, reflect.Float64:
		return "float"
	case reflect.Bool:
		return "bool"
	case reflect.String:
		return "string"
	default:
		return t.String()
	}
}
