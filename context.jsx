import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
const Context = createContext({

})

export function ContextProvider({children}){
    const [loading, setLoading] = useState(false)
    const [app, setApp] = useState(true)
    const [data, setData] = useState(false)
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    useEffect(() => {
        async function preload() {
            setLoading(true)
            setLoading(false)
        }
        preload()
    }, [])

    return <Context.Provider value={{
        loading,
        location,
        app, setApp,
        data, setData,
        currentUser, setCurrentUser,
        }}>
        {children}
    </Context.Provider>
}   

export function useTRPS(){
    return useContext(Context)
}