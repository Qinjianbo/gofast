package main

import (
	"context"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"

	"vitego/admin"
	"vitego/api"
	"vitego/api/page"
	"vitego/conf"
	"vitego/dao"
	"vitego/job"
	"vitego/webssr"

	"github.com/daodao97/gossr"

	"github.com/daodao97/xgo/xapp"
	"github.com/daodao97/xgo/xlog"
	"github.com/daodao97/xgo/xredis"
	"github.com/daodao97/xgo/xrequest"
	"github.com/gin-gonic/gin"
)

var Version string

func init() {
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "dev" {
		xlog.SetLogger(xlog.StdoutTextPretty(xlog.WithLevel(slog.LevelDebug)))
		xrequest.SetRequestDebug(true)
	} else {
		xlog.SetLogger(xlog.StdoutJson(xlog.WithLevel(slog.LevelInfo)))
		xrequest.SetRequestDebug(false)
	}
}

func main() {
	app := xapp.NewApp().
		AddStartup(
			conf.Init,
			func() error {
				return xredis.Inits(conf.Get().Redis)
			},
			dao.Init,
		).
		AddServer(xapp.NewGinHttpServer(xapp.Args.Bind, h))

	if os.Getenv("CRON_ENABLE") == "true" {
		app.AddServer(job.NewCronServer())
	}

	if err := app.Run(); err != nil {
		panic(err)
	}
}

func h() *gin.Engine {
	r := xapp.NewGin(xapp.WithPrintReqeustLog(false))
	defer func() {
		xapp.GenerateOpenAPIDoc(
			r,
			xapp.WithInfo("team-gpt", Version, ""),
			xapp.WithBearerAuth(),
		)
	}()
	vueSsr(r)
	api.SetupRouter(r)
	admin.SetupRouter(r)

	return r
}

func vueSsr(r *gin.Engine) {
	fsyFrontend, _ := fs.Sub(webssr.FrontendDist, "dist/client")
	fsyServer, _ := fs.Sub(webssr.ServerDist, "dist/server")

	gossr.RunBlocking(
		r,
		gossr.FrontendBuild{
			FrontendDist: fsyFrontend,
			ServerDist:   fsyServer,
		},
		registerSSRFetchRoutes(r),
	)
}

const ssrFetchPrefix = gossr.DefaultSSRFetchPrefix

func registerSSRFetchRoutes(r *gin.Engine) gossr.BackendDataFetcher {
	group := r.Group(ssrFetchPrefix, ssrGuardMiddleware())
	page.Router(group)

	return func(ctx context.Context, req *http.Request) (gossr.SSRPayload, error) {
		payload, status, err := page.Resolve(ctx, req.URL.Path, req.URL.RawQuery)
		if err != nil {
			return nil, err
		}

		switch status {
		case http.StatusOK:
			return payload, nil
		case http.StatusNotFound:
			return mapPayload{}, nil
		default:
			return nil, fmt.Errorf("ssr fetch %s returned status %d", req.URL.Path, status)
		}
	}
}

func ssrGuardMiddleware() gin.HandlerFunc {
	sharedToken := strings.TrimSpace(os.Getenv("SSR_FETCH_TOKEN"))

	return func(c *gin.Context) {
		flagHeader := c.GetHeader("X-SSR-Fetch") == "1"
		originOK := sameOriginRequest(c.Request)

		if sharedToken != "" && c.GetHeader("X-SSR-Token") != sharedToken {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// 允许同源请求；若非同源则必须显式标头
		if !originOK && !flagHeader {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		c.Next()
	}
}

func sameOriginRequest(r *http.Request) bool {
	host := r.Host
	if xf := r.Header.Get("X-Forwarded-Host"); xf != "" {
		parts := strings.Split(xf, ",")
		if len(parts) > 0 {
			host = strings.TrimSpace(parts[0])
		}
	}

	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = r.Header.Get("Referer")
	}
	if origin == "" {
		return true
	}

	parsed, err := url.Parse(origin)
	if err != nil || parsed.Host == "" {
		return false
	}

	return strings.EqualFold(parsed.Host, host)
}

type mapPayload map[string]any

func (m mapPayload) AsMap() map[string]any {
	return m
}
