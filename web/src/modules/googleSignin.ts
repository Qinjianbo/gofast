import GoogleSignInPlugin from 'vue3-google-signin'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app, isClient }) => {
  if (!isClient)
    return

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId)
    return

  app.use(GoogleSignInPlugin, { clientId })
}
