package page

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path"
	"regexp"
	"strings"
	"time"

	"vitego/pkg"
	"vitego/pkg/locales"

	"github.com/gin-gonic/gin"
)

func Router(group *gin.RouterGroup) {
	for _, rt := range ssrRoutes {
		group.GET(rt.pattern, handleSSRFetch(rt.handler))
	}
}

// Resolve 在服务端内部匹配路径并返回对应 payload，避免经过全局中间件产生副作用。
// 返回值：payload，HTTP status（200/404/500），错误。
func Resolve(ctx context.Context, rawPath, rawQuery string) (pkg.SSRPayload, int, error) {
	cleanPath := path.Clean("/" + strings.TrimPrefix(strings.TrimSpace(rawPath), "/"))
	query, _ := url.ParseQuery(rawQuery)

	for _, rt := range ssrRoutes {
		matches := rt.regex.FindStringSubmatch(cleanPath)
		if len(matches) == 0 {
			continue
		}

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		req := httptest.NewRequest(http.MethodGet, cleanPath, http.NoBody)
		req.URL.RawQuery = query.Encode()
		c.Request = req.WithContext(ctx)

		params := gin.Params{}
		for i, name := range rt.params {
			if len(matches) > i+1 {
				params = append(params, gin.Param{Key: name, Value: matches[i+1]})
			}
		}
		c.Params = params

		payload, err := rt.handler(c)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}
		return payload, http.StatusOK, nil
	}

	return nil, http.StatusNotFound, nil
}

func handleSSRFetch(h func(*gin.Context) (pkg.SSRPayload, error)) gin.HandlerFunc {
	return func(c *gin.Context) {
		payload, err := h(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if payload == nil {
			c.JSON(http.StatusOK, gin.H{})
			return
		}

		c.JSON(http.StatusOK, payload.AsMap())
	}
}

func Home(_ *gin.Context) (pkg.SSRPayload, error) {
	locale := locales.Default

	return homePayload{
		Announcement: announcementByLocale(locale),
		ServerTime:   time.Now().Format(time.RFC1123Z),
		Locale:       locale,
	}, nil
}

func Hi(c *gin.Context) (pkg.SSRPayload, error) {
	locale := locales.Default
	name := c.Param("name")
	if name == "" {
		name = defaultName(locale)
	}

	salutation := c.Query("title")
	if salutation != "" {
		name = fmt.Sprintf("%s %s", salutation, name)
	}

	return greetingPayload{
		Greeting:    greetingByLocale(locale, name),
		GeneratedAt: time.Now().Format(time.RFC3339),
		Locale:      locale,
	}, nil
}

func HomeLocale(c *gin.Context) (pkg.SSRPayload, error) {
	locale := locales.Normalize(paramLocale(c))

	return homePayload{
		Announcement: announcementByLocale(locale),
		ServerTime:   time.Now().Format(time.RFC1123Z),
		Locale:       locale,
	}, nil
}

func HiLocale(c *gin.Context) (pkg.SSRPayload, error) {
	locale := locales.Normalize(paramLocale(c))
	name := c.Param("name")
	if name == "" {
		name = defaultName(locale)
	}

	salutation := c.Query("title")
	if salutation != "" {
		name = fmt.Sprintf("%s %s", salutation, name)
	}

	return greetingPayload{
		Greeting:    greetingByLocale(locale, name),
		GeneratedAt: time.Now().Format(time.RFC3339),
		Locale:      locale,
	}, nil
}

func paramLocale(c *gin.Context) string {
	value := c.Param("locale")
	if value == "" {
		return locales.Default
	}

	return value
}

type greetingPayload struct {
	Greeting    string
	GeneratedAt string
	Locale      string
}

func (g greetingPayload) AsMap() map[string]any {
	return map[string]any{
		"greeting":    g.Greeting,
		"generatedAt": g.GeneratedAt,
		"locale":      g.Locale,
	}
}

type homePayload struct {
	Announcement string
	ServerTime   string
	Locale       string
}

func (h homePayload) AsMap() map[string]any {
	return map[string]any{
		"announcement": h.Announcement,
		"serverTime":   h.ServerTime,
		"locale":       h.Locale,
	}
}

func announcementByLocale(locale string) string {
	switch locale {
	case "zh":
		return "欢迎体验 Go + Vite SSR 示例"
	default:
		return "Welcome to the Go + Vite SSR demo"
	}
}

func defaultName(locale string) string {
	switch locale {
	case "zh":
		return "朋友"
	default:
		return "friend"
	}
}

func greetingByLocale(locale string, name string) string {
	switch locale {
	case "zh":
		return fmt.Sprintf("你好，%s！", name)
	default:
		return fmt.Sprintf("Hello, %s!", name)
	}
}

type ssrRoute struct {
	pattern string
	handler func(*gin.Context) (pkg.SSRPayload, error)
	regex   *regexp.Regexp
	params  []string
}

var ssrRoutes = []ssrRoute{
	newSSRRoute("/", Home),
	newSSRRoute("/hi/:name", Hi),
	newSSRRoute("/:locale", HomeLocale),
	newSSRRoute("/:locale/hi/:name", HiLocale),
}

func newSSRRoute(pattern string, handler func(*gin.Context) (pkg.SSRPayload, error)) ssrRoute {
	segments := strings.Split(strings.Trim(pattern, "/"), "/")
	paramNames := []string{}
	for i, segment := range segments {
		if after, ok := strings.CutPrefix(segment, ":"); ok {
			name := after
			paramNames = append(paramNames, name)
			segments[i] = "([^/]+)"
		}
	}

	regexPattern := fmt.Sprintf("^/%s$", strings.Join(segments, "/"))

	return ssrRoute{
		pattern: pattern,
		handler: handler,
		regex:   regexp.MustCompile(regexPattern),
		params:  paramNames,
	}
}
