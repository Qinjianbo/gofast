import type { UserModule } from '~/types'

const modules = Object.values(
  import.meta.glob<{ install?: UserModule }>('./*.ts', { eager: true }),
)

export function installModules(ctx: Parameters<UserModule>[0]) {
  for (const mod of modules)
    mod.install?.(ctx)
}
