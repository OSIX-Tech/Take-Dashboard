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
      console.error('Google Sign-In library not loaded')
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
    // Since we're using localhost in the emulator, use localhost
    const currentOrigin = window.location.origin
    const redirectUri = `${currentOrigin}/loginWallet`
    
    console.log('🔗 [walletAuthService] Redirect URI:', redirectUri)
    
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
    
    console.log('🔗 [walletAuthService] Full OAuth URL:', authUrl)
    
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
    
    console.log('🔍 [walletAuthService] OAuth redirect params:', {
      hasIdToken: !!idToken,
      hasAccessToken: !!accessToken,
      error: error
    })
    
    if (error) {
      console.error('OAuth error:', error)
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
      console.error('Google Sign-In library not loaded')
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
    console.log('🔐 [walletAuthService] Processing Google credential')
    console.log('📦 [walletAuthService] Credential response:', credentialResponse)
    
    if (!credentialResponse.credential) {
      throw new Error('No credential received from Google')
    }

    // Decode the JWT to see user info (for debugging)
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]))
      console.log('👤 [walletAuthService] Google user info:', {
        email: payload.email,
        name: payload.name,
        iss: payload.iss,
        aud: payload.aud
      })
    } catch (e) {
      console.log('Could not decode JWT for debugging')
    }

    try {
      console.log('📡 [walletAuthService] Calling backend at: https://opills.app/api/auth/googleLogin')
      console.log('📍 [walletAuthService] Request origin:', window.location.origin)
      
      // Try multiple request formats to see which one works
      // Format 1: Token in header as specified
      let response;
      let lastError;
      
      try {
        console.log('🔄 [walletAuthService] Attempt 1: Token in custom header + body')
        response = await fetch('https://opills.app/api/auth/googleLogin', {
          method: 'POST',
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'include', // Include cookies if needed
          headers: {
            'Content-Type': 'application/json',
            'idToken': credentialResponse.credential
          },
          body: JSON.stringify({
            idToken: credentialResponse.credential
          })
        })
      } catch (error) {
        console.error('❌ Attempt 1 failed:', error.message)
        lastError = error;
        
        // Format 2: Token only in body (more standard)
        try {
          console.log('🔄 [walletAuthService] Attempt 2: Token only in body')
          response = await fetch('https://opills.app/api/auth/googleLogin', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              idToken: credentialResponse.credential,
              credential: credentialResponse.credential // Some backends expect this field
            })
          })
        } catch (error2) {
          console.error('❌ Attempt 2 failed:', error2.message)
          lastError = error2;
          
          // Format 3: Token in Authorization header
          try {
            console.log('🔄 [walletAuthService] Attempt 3: Token in Authorization header')
            response = await fetch('https://opills.app/api/auth/googleLogin', {
              method: 'POST',
              mode: 'cors',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentialResponse.credential}`
              },
              body: JSON.stringify({
                idToken: credentialResponse.credential
              })
            })
          } catch (error3) {
            console.error('❌ Attempt 3 failed:', error3.message)
            lastError = error3;
            throw new Error(`Network error: ${error3.message}. This might be a CORS issue or the backend is not reachable.`)
          }
        }
      }

      console.log('📡 [walletAuthService] Response received')
      console.log('📡 [walletAuthService] Response status:', response.status)
      console.log('📡 [walletAuthService] Response headers:', [...response.headers.entries()])

      if (!response.ok) {
        let errorMessage = `Authentication failed (${response.status})`
        try {
          const errorText = await response.text()
          console.error('❌ [walletAuthService] Error response body:', errorText)
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.message || errorJson.error || errorText
            } catch {
              errorMessage = errorText
            }
          }
        } catch (e) {
          console.error('Error reading response:', e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ [walletAuthService] Backend response received:', data)
      
      // Store the wallet token - try multiple fields
      const token = data.token || data.access_token || data.accessToken || data.authToken
      if (token) {
        sessionStorage.setItem('walletToken', token)
        console.log('✅ [walletAuthService] Wallet token stored')
      } else {
        console.warn('⚠️ [walletAuthService] No standard token field in response, storing entire response')
        sessionStorage.setItem('walletToken', JSON.stringify(data))
        sessionStorage.setItem('walletResponse', JSON.stringify(data))
      }

      return data
    } catch (error) {
      console.error('❌ [walletAuthService] Error authenticating with backend:', error)
      console.error('Stack trace:', error.stack)
      
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
    console.log('🎫 [walletAuthService] Adding pass to wallet')
    
    const token = sessionStorage.getItem('walletToken')
    if (!token) {
      throw new Error('No authentication token found. Please login first.')
    }

    try {
      // Always use 'android' platform since this is for phones accessing via web browser
      const platform = 'android'
      
      console.log('📱 [walletAuthService] Platform:', platform)
      
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

      console.log('📡 [walletAuthService] Response status:', response.status)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to add pass: ${error || response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ [walletAuthService] Backend response:', result)
      
      // Handle the response format: { success: true, message: "...", data: { passUrl: "...", ... } }
      if (result.success && result.data && result.data.passUrl) {
        const passUrl = result.data.passUrl
        console.log('🔗 [walletAuthService] Opening Google Wallet with pass URL:', passUrl)
        console.log('🎫 [walletAuthService] Pass details:', {
          currentSeals: result.data.currentSeals,
          totalSeals: result.data.totalSeals,
          passId: result.data.passId
        })
        
        // Open the Google Wallet save URL
        // This will open the Google Wallet app on the phone
        window.location.href = passUrl // Use location.href instead of window.open for better mobile compatibility
        
        return result.data
      } else {
        console.warn('⚠️ [walletAuthService] Unexpected response format:', result)
        throw new Error(result.message || 'Invalid response from server - no pass URL received')
      }
    } catch (error) {
      console.error('❌ [walletAuthService] Error adding pass to wallet:', error)
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
  },

  // Decode JWT token to get user info (optional)
  getWalletUser() {
    const token = sessionStorage.getItem('walletToken')
    if (!token) return null

    try {
      // Basic JWT decode (you may want to use a library for this)
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        email: payload.email || 'wallet@user.com',
        name: payload.name || 'Wallet User',
        exp: payload.exp
      }
    } catch (error) {
      console.error('Error decoding wallet token:', error)
      return null
    }
  }
}