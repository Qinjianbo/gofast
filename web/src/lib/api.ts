export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export async function myFetch<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (init.body !== undefined)
    headers['Content-Type'] = 'application/json'

  const options: RequestInit = {
    credentials: init.credentials ?? 'same-origin',
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  }

  let response: Response
  try {
    response = await fetch(input, options)
  }
  catch (error) {
    throw new Error('network-error')
  }

  let payload: ApiResponse<T>
  try {
    payload = await response.json() as ApiResponse<T>
  }
  catch (error) {
    throw new Error('invalid-response')
  }

  if (!response.ok)
    throw new Error(payload.message ?? response.statusText)

  if (payload.code !== 0)
    throw new Error(payload.message || 'request-failed')

  return payload.data
}
