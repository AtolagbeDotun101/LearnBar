import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const AuthContext = createContext<any>(undefined);

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if (!context){
        throw new Error(" useAuth must be used withtin authProvider");
    }
    return context;
} 

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser]= useState<any | null>(null);
    const [loading, setLoading]= useState(true);
    const [isAuthenticated, setIsAuthenticated]= useState(false);

    useEffect (()=>{
        checkAuthStatus()
    }, [])

    const checkAuthStatus = ()=>{
        try {
           const token = localStorage.getItem('token');
           const userStr = localStorage.getItem('user');
            
           if(token && userStr){
            const userData = JSON.parse(userStr);
            setUser(userData);
            setIsAuthenticated(true);
           }
        } catch (error) {
            console.log("Auth check failed :", error);
            logout();
        }finally{
            setLoading(false)
        }
    }

    const login = (responseData:any)=>{
          const token = responseData.data?.token || responseData.token;
  const userData = responseData.data?.user || responseData.user;
  
  if (!token || !userData) {
    console.error('Invalid login response structure:', responseData);
    return;
  }
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));


         setUser(userData)
         setIsAuthenticated(true)

    }

    const logout =()=>{
        localStorage.removeItem('token');
         localStorage.removeItem('user');

         setUser(null);
         setIsAuthenticated(false);
    }

    const updateUser = (updatedUser: any)=>{
        const newUserData = user ? {...user, ...updatedUser} : updatedUser;
        localStorage.setItem('user', JSON.stringify(newUserData))
        setUser(newUserData);
    }

    const value = {
        user,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated,
        checkAuthStatus
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}