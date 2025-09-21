// Wallet Authentication Service
// This service handles authentication for the wallet flow separately from admin auth

export const walletAuthService = {
  // Check if running on mobile device
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768)
  },

  // Initialize Google Sign-In
  initializeGoogleSignIn(clientId, callback) {
    if (!window.google) {
      throw new Error('Google Sign-In library not loaded. Please refresh the page.')
    }

    // TODO: Configure your Google Wallet Client ID in .env as VITE_GOOGLE_WALLET_CLIENT_ID
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: callback,
      auto_select: false,
      cancel_on_tap_outside: true,
      // Add this for better mobile support
      ux_mode: 'popup', // Can be 'popup' or 'redirect'
      // For mobile, we might need to use redirect
      redirect_uri: window.location.origin + '/loginWallet'
    })
  },

  // Generate OAuth URL for redirect flow (mobile-friendly)
  generateOAuthUrl(clientId) {
    // IMPORTANT: The redirect URI must match EXACTLY what's in Google Console
    const currentOrigin = window.location.origin
    
    // Normalize the origin (remove any trailing slashes, ensure consistent format)
    let redirectUri = `${currentOrigin}/loginWallet`
    
    // On mobile, window.location might report differently

    const scope = 'openid email profile'
    const responseType = 'token id_token' // Use implicit flow for SPAs
    const nonce = Math.random().toString(36).substring(7)
    
    // Store nonce for verification
    sessionStorage.setItem('oauth_nonce', nonce)
    
    // Use the implicit flow which works better for SPAs
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${encodeURIComponent(responseType)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `nonce=${nonce}&` +
      `prompt=select_account`

    return authUrl
  },

  // Handle OAuth redirect response
  handleOAuthRedirect() {
    // Check if we have tokens in the URL hash (implicit flow)
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const idToken = params.get('id_token')
    const accessToken = params.get('access_token')
    const error = params.get('error')

    if (error) {
      
      return { error: params.get('error_description') || error }
    }
    
    if (idToken || accessToken) {
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname)
      // Use ID token if available, otherwise use access token
      return { credential: idToken || accessToken }
    }
    
    return null
  },

  // Render Google Sign-In button
  renderGoogleButton(buttonElement) {
    if (!window.google) {
      
      return
    }

    window.google.accounts.id.renderButton(buttonElement, {
      theme: 'filled_black',
      size: 'large',
      width: '100%',
      text: 'continue_with',
      shape: 'rectangular',
      locale: 'es'
    })
  },

  // Handle Google credential response and authenticate with backend
  async handleGoogleCredential(credentialResponse) {

    if (!credentialResponse.credential) {
      throw new Error('No credential received from Google')
    }

    // Decode the JWT to see user info (for debugging)
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]))
      
    } catch (e) {
      
    }

    try {

      // Try multiple request formats to see which one works
      // Format 1: Token in header as specified
      let response;
      let lastError;
      
      // Send request with idToken in body only (as per backend specification)
      
      response = await fetch('https://opills.app/api/auth/googleLogin', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
          // NO idToken header - backend expects it in body only
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential
        })
      })

      if (!response.ok) {
        let errorMessage = `Authentication failed (${response.status})`
        try {
          const errorText = await response.text()
          
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.message || errorJson.error || errorText
            } catch {
              errorMessage = errorText
            }
          }
        } catch (e) {
          
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Handle the response format: { token: "...", user: { ... } }
      if (data.token) {
        sessionStorage.setItem('walletToken', data.token)

        // Store user data if provided
        if (data.user) {
          sessionStorage.setItem('walletUser', JSON.stringify(data.user))
          
        }
        
        return data
      } else {
        
        throw new Error('No token received from server')
      }
    } catch (error) {

      // Provide more specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`No se puede conectar con el servidor. Posibles causas:
1. El backend no está disponible
2. Error de CORS (verifica la consola del navegador)
3. Conexión a internet interrumpida
Origen actual: ${window.location.origin}`)
      }
      
      throw error
    }
  },

  // Add pass to Google Wallet
  async addPassToWallet() {

    const token = sessionStorage.getItem('walletToken')
    if (!token) {
      throw new Error('No authentication token found. Please login first.')
    }

    try {
      // Always use 'android' platform since this is for phones accessing via web browser
      const platform = 'android'

      // Call backend to get the Google Wallet pass URL
      const response = await fetch('https://opills.app/api/wallet/pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: platform // Always 'android' for mobile web
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to add pass: ${error || response.statusText}`)
      }

      const result = await response.json()

      // Handle the response format: { success: true, message: "...", data: { passUrl: "...", ... } }
      if (result.success && result.data && result.data.passUrl) {
        const passUrl = result.data.passUrl

        // Open the Google Wallet save URL
        // This will open the Google Wallet app on the phone
        window.location.href = passUrl // Use location.href instead of window.open for better mobile compatibility
        
        return result.data
      } else {
        
        throw new Error(result.message || 'Invalid response from server - no pass URL received')
      }
    } catch (error) {
      
      throw error
    }
  },

  // Check if user is authenticated for wallet flow
  isWalletAuthenticated() {
    return !!sessionStorage.getItem('walletToken')
  },

  // Clear wallet authentication
  clearWalletAuth() {
    sessionStorage.removeItem('walletToken')
    sessionStorage.removeItem('walletUser')
    sessionStorage.removeItem('walletResponse')
  },

  // Get wallet user info
  getWalletUser() {
    // First try to get stored user data from backend response
    const storedUser = sessionStorage.getItem('walletUser')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch (e) {
        
      }
    }
    
    // Fallback to decoding JWT token
    const token = sessionStorage.getItem('walletToken')
    if (!token) return null

    try {
      // Basic JWT decode
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        email: payload.email || 'wallet@user.com',
        name: payload.name || 'Wallet User',
        exp: payload.exp
      }
    } catch (error) {
      
      return null
    }
  }
}