import { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from 'next/router'
import { api } from "../services/api";
import { destroyCookie, parseCookies, setCookie } from "nookies";


type AuthContextData = {
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
  isLoading: boolean;
}

type AuthProviderProps = {
  children: ReactNode;
}

interface User {
  id: string;
  username: string;
  accountId: string;
  account: {
    balance: string;
  }
}


export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const cookies = parseCookies()

  const router = useRouter() 

  async function signIn(username: string, password: string) {
    setIsLoading(true)

    const response = await api.get('/login', {
      auth: {
        username,
        password,
      }
    })

    setUser(response.data.user)

    setCookie(null, 'ngcash.token', response.data.accessToken, {
      path: '/',
    })

    setIsLoading(false)
  }

  async function signUp(username: string, password: string) {
    setIsLoading(true)

    const response = await api.post('/signup', {
      username,
      password,
    })

    setUser(response.data.user)

    setCookie(null, 'ngcash.token', response.data.accessToken, {
      path: '/',
    })

    setIsLoading(false)
  }
 
  async function getUser() {
    setIsLoading(true)
    try {
      const response = await api.get('/user', {
        headers: {
          Authorization: `Bearer ${cookies['ngcash.token']}`
        }
      })
  
      setUser(response.data.user)
    } catch (error) {
      console.log(error)
      signOut()
    } finally {
      setIsLoading(false)
    }
  }

  async function signOut() {
    destroyCookie(null, 'ngcash.token')
    setUser(null)
    router.push("/login")

  }
  
  useEffect(() => {
    getUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, getUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
} 