const accessTokenKey = 'hrms_access_token'

export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem(accessTokenKey)
  },

  setAccessToken(token: string) {
    localStorage.setItem(accessTokenKey, token)
  },

  clearAccessToken() {
    localStorage.removeItem(accessTokenKey)
  },
}
