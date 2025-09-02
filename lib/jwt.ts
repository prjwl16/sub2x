import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  username: string
  provider: string
  aud: string
  iss: string
  iat: number
  exp: number
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      throw new Error('Token expired')
    }
    
    return decoded
  } catch (error) {
    throw new Error('Invalid JWT token')
  }
}

export async function decodeJWT(token: string): Promise<JWTPayload | null> {
  try {
    return await verifyJWT(token)
  } catch (error) {
    return null
  }
}
