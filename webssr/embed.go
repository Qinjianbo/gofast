package webssr

import "embed"

//go:embed all:dist/client
var FrontendDist embed.FS

//go:embed all:dist/server
var ServerDist embed.FS
