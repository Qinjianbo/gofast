//go:build nov8

package pkg

import (
	"log"

	"vitego/pkg/renderer"
	rendegojs "vitego/pkg/renderer/engine/gojs"
)

func newRendererFromEnv(scriptContents string) renderer.Renderer {
	log.Printf("Using goja SSR engine (v8 disabled via build tag)")
	return rendegojs.NewRenderer(scriptContents)
}
