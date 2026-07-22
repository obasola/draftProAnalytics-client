export interface AppleAuthorizationResult {
  authorization: {
    id_token: string
  }
  user?: {
    name?: {
      firstName?: string
      lastName?: string
    }
  }
}

type GoogleCredentialResponse = { credential?: string }

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
            use_fedcm_for_prompt?: boolean
          }): void
          renderButton(element: HTMLElement, options: Record<string, unknown>): void
        }
      }
    }
    AppleID?: {
      auth: {
        init(config: {
          clientId: string
          scope: string
          redirectURI: string
          state: string
          usePopup: boolean
        }): void
        signIn(): Promise<AppleAuthorizationResult>
      }
    }
  }
}

const loadedScripts = new Map<string, Promise<void>>()

function loadScript(src: string): Promise<void> {
  const existing = loadedScripts.get(src)
  if (existing) return existing

  const promise = new Promise<void>((resolve, reject) => {
    const prior = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (prior) {
      if (prior.dataset.loaded === 'true') resolve()
      else {
        prior.addEventListener('load', () => resolve(), { once: true })
        prior.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true })
      }
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true })
    document.head.appendChild(script)
  })

  loadedScripts.set(src, promise)
  return promise
}

export async function renderGoogleSignInButton(
  element: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void,
): Promise<void> {
  if (!clientId) throw new Error('VITE_GOOGLE_CLIENT_ID is not configured')

  await loadScript('https://accounts.google.com/gsi/client')
  if (!window.google) throw new Error('Google Identity Services did not initialize')

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: response => {
      if (!response.credential) throw new Error('Google did not return an ID token')
      onCredential(response.credential)
    },
    use_fedcm_for_prompt: true,
  })

  element.replaceChildren()
  window.google.accounts.id.renderButton(element, {
    type: 'standard',
    theme: 'filled_blue',
    size: 'large',
    text: 'signin_with',
    shape: 'pill',
    width: Math.max(200, Math.min(400, Math.floor(element.getBoundingClientRect().width) || 254)),
  })
}

export async function signInWithApple(clientId: string, redirectUri: string): Promise<AppleAuthorizationResult> {
  if (!clientId) throw new Error('VITE_APPLE_CLIENT_ID is not configured')
  if (!redirectUri) throw new Error('VITE_APPLE_REDIRECT_URI is not configured')

  await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
  if (!window.AppleID) throw new Error('Sign in with Apple did not initialize')

  const state = crypto.randomUUID()
  sessionStorage.setItem('apple_oauth_state', state)

  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: redirectUri,
    state,
    usePopup: true,
  })

  return window.AppleID.auth.signIn()
}
