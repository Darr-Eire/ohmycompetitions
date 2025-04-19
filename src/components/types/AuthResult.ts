export interface PiUser {
  uid: string
  username: string
}

export interface AuthResult {
  accessToken: string
  user: PiUser
}
