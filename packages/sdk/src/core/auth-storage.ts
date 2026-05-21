// Auth Storage Abstraction

export interface AuthStorage {
  getToken(): string | null
  setToken(token: string): void
  removeToken(): void
  getRefreshToken(): string | null
  setRefreshToken(token: string): void
  removeRefreshToken(): void
}

export class LocalStorageAuthStorage implements AuthStorage {
  private readonly tokenKey = 'nurisk_auth_token'
  private readonly refreshKey = 'nurisk_refresh_token'

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(this.tokenKey)
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey)
  }

  getRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(this.refreshKey)
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshKey, token)
  }

  removeRefreshToken(): void {
    localStorage.removeItem(this.refreshKey)
  }
}

export class MemoryAuthStorage implements AuthStorage {
  private token: string | null = null
  private refreshToken: string | null = null

  getToken(): string | null {
    return this.token
  }

  setToken(token: string): void {
    this.token = token
  }

  removeToken(): void {
    this.token = null
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token
  }

  removeRefreshToken(): void {
    this.refreshToken = null
  }
}