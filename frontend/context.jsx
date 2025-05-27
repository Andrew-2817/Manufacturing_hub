import { createContext, useContext, useEffect, useState } from "react";
// useLocation больше не используется здесь
// import { useLocation } from "react-router-dom";
// Импортируем axios (теперь он глобально настроен перехватчиком)
import axios from "axios";

const Context = createContext({
    // currentUser: null,
    // setCurrentUser: () => {},
    // loading: true, // Добавляем loading в дефолтное значение контекста
    // Остальные поля контекста...
});

export function ContextProvider({children}){
    // Изначально loading true, пока не проверим localStorage или API
    const [loading, setLoading] = useState(true);
    const [app, setApp] = useState(true);
    const [data, setData] = useState(false);
    const [resource, setResource] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Effect для загрузки данных пользователя из localStorage (токен) и API при монтировании
    useEffect(() => {
        console.log("ContextProvider useEffect: Attempting to load user from storage...");
        async function loadCurrentUserFromStorage() {
            setLoading(true); // Начинаем загрузку

            try {
                // Получаем токен доступа из localStorage
                const accessToken = localStorage.getItem('accessToken');

                if (accessToken) {
                    console.log("Found access token in localStorage, attempting to fetch user data via /users/me/...");
                     // Отправляем запрос к защищенному эндпоинту /users/me/
                     // Axios Interceptor (настроенный в axiosConfig.js) автоматически добавит заголовок Authorization.
                     const response = await axios.get('http://localhost:8000/users/me/');

                    if (response.data) {
                         // Если данные пользователя успешно получены, устанавливаем их в контекст
                        setCurrentUser(response.data);
                        console.log("Loaded currentUser from API:", response.data);
                        // Также обновляем localStorage с минимальными данными, если они нужны (хотя токен важнее)
                         localStorage.setItem('currentUserData', JSON.stringify({ id: response.data.id, role: response.data.role }));
                    } else {
                         // Если API вернул пустой ответ (не должно произойти при 200 OK)
                         console.warn("API /users/me returned empty data, clearing storage.");
                         localStorage.removeItem('accessToken');
                         localStorage.removeItem('currentUserData');
                         setCurrentUser(null);
                    }
                } else {
                     // Если токена в localStorage нет
                    console.log("No access token found in localStorage, user is not logged in.");
                    // Очищаем localStorage на всякий случай, если там были старые данные
                    localStorage.removeItem('currentUserData');
                    setCurrentUser(null);
                }

            } catch (error) {
                // Перехватчик Axios уже обработал 401/403 и очистил localStorage.
                // Здесь просто логируем ошибку и убеждаемся, что currentUser = null.
                console.error('Error fetching user data with token:', error);
                // Убедимся, что currentUser действительно null после ошибки
                setCurrentUser(null);

            } finally {
                setLoading(false); // Загрузка завершена независимо от результата
                console.log("ContextProvider useEffect: Loading finished.");
            }
        }

        // Вызываем асинхронную функцию загрузки пользователя
        loadCurrentUserFromStorage();
    }, []); // Пустой массив зависимостей - эффект выполняется только при монтировании

    return <Context.Provider value={{
        loading, // Передаем состояние загрузки, чтобы ProtectedRoute мог его использовать
        app, setApp,
        data, setData,
        resource, setResource,
        currentUser, setCurrentUser, // currentUser и функция для его установки
        }}>
        {children}
    </Context.Provider>
}

export function useTRPS(){
    const context = useContext(Context);
    // Optional: Проверка, что контекст не undefined
    // if (context === undefined) {
    //     throw new Error('useTRPS must be used within a ContextProvider');
    // }
    return context;
}