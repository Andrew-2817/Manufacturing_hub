import { createContext, useContext, useEffect, useState } from "react";
// useLocation больше не используется напрямую здесь
// import { useLocation } from "react-router-dom";
// Импортируем axios для загрузки данных пользователя по ID
import axios from "axios";

const Context = createContext({
    // currentUser: null, // Добавлен для лучшей ясности, хотя необязательно
    // setCurrentUser: () => {}, // Добавлен для лучшей ясности, хотя необязательно
    // Остальные поля контекста...
})

export function ContextProvider({children}){
    const [loading, setLoading] = useState(false)
    const [app, setApp] = useState(true)
    const [data, setData] = useState(false)
    const [resource, setResource] = useState(false)
    // Изначально currentUser null, будет загружен из localStorage/API если есть
    const [currentUser, setCurrentUser] = useState(null);
    // location не в контексте

    // Эффект для загрузки данных пользователя из localStorage при монтировании
    useEffect(() => {
        async function loadCurrentUserFromStorage() {
            try {
                const storedUserData = localStorage.getItem('currentUserData');
                if (storedUserData) {
                    const userData = JSON.parse(storedUserData);
                    // Проверяем наличие ID
                    if (userData && userData.id) {
                        // Загружаем полные данные пользователя с бэкенда по ID
                        setLoading(true); // Возможно, индикатор загрузки
                        const response = await axios.get(`http://localhost:8000/users/${userData.id}`);
                        if (response.data) {
                            setCurrentUser(response.data);
                            console.log("Loaded currentUser from storage and API:", response.data);
                        } else {
                             // Если данные не получены, очищаем localStorage и контекст
                            localStorage.removeItem('currentUserData');
                            setCurrentUser(null);
                            console.log("Failed to load user from API, cleared storage.");
                        }
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error loading user from storage or API:', error);
                 // В случае ошибки очищаем localStorage и контекст
                localStorage.removeItem('currentUserData');
                setCurrentUser(null);
                setLoading(false);
            }
        }

        loadCurrentUserFromStorage();
    }, []); // Пустой массив зависимостей - эффект выполняется только при монтировании

    return <Context.Provider value={{
        loading,
        // location больше не в контексте
        // location,
        app, setApp,
        data, setData,
        resource, setResource,
        currentUser, setCurrentUser,
        }}>
        {children}
    </Context.Provider>
}

export function useTRPS(){
    return useContext(Context)
}