import axios from 'axios';

// Создаем экземпляр Axios. Можно использовать этот экземпляр для всех запросов к API.
// const api = axios.create({
//   baseURL: 'http://localhost:8000', // Базовый URL вашего бэкенда
// });
// Или можно использовать глобальный экземпляр axios, как у вас сейчас.
// Для простоты пока настроим глобальный экземпляр axios.

console.log("Axios Interceptor Setup: Starting...");

// Добавляем перехватчик запросов (request interceptor)
// Он будет вызываться перед каждым HTTP запросом, отправляемым Axios
axios.interceptors.request.use(
    config => {
        console.log("Axios Interceptor: Intercepting request...", config.url);
        // Проверяем, есть ли токен доступа в localStorage
        const accessToken = localStorage.getItem('accessToken');

        // Если токен есть, и запрос не к эндпоинту логина или регистрации (чтобы избежать отправки токена туда)
        // или если запрос идет к вашему бэкенду (например, http://localhost:8000)
        // ВАЖНО: Проверяйте, что запрос идет именно к вашему бэкенду, чтобы не отправлять токен на сторонние API!
        const isBackendApi = config.url.startsWith('http://localhost:8000/'); // Простая проверка по URL

        if (accessToken && isBackendApi && !config.url.endsWith('/users/login/')) {
             console.log("Axios Interceptor: Adding Authorization header.");
             // Добавляем заголовок Authorization с токеном в формате "Bearer <токен>"
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
             console.log("Axios Interceptor: No token or not backend API, skipping Authorization header.");
        }


        return config; // Возвращаем измененный или исходный объект конфигурации запроса
    },
    error => {
        // Обработка ошибок запроса (например, проблем с сетью)
        console.error("Axios Interceptor: Request error:", error);
        return Promise.reject(error); // Пробрасываем ошибку дальше
    }
);

// Добавляем перехватчик ответов (response interceptor)
// Он будет вызываться после получения ответа от сервера
axios.interceptors.response.use(
    response => {
        // Обработка успешных ответов (статусы 2xx)
         console.log("Axios Interceptor: Received response", response.status, response.config.url);
        return response; // Пробрасываем ответ дальше
    },
    error => {
        // Обработка ошибок ответов (статусы 4xx, 5xx)
        console.error("Axios Interceptor: Response error:", error.response?.status, error.config?.url, error.response?.data);

        // Если получен ответ со статусом 401 (Unauthorized) или 403 (Forbidden),
        // это может означать, что токен недействителен или у пользователя нет прав.
        // Здесь можно перенаправить пользователя на страницу логина.
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log("Axios Interceptor: Received 401/403 error. Clearing localStorage and potentially redirecting.");

            // Очищаем токен из localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUserData'); // Очищаем также минимальные данные

            // ВАЖНО: Перенаправление нужно выполнять из компонента, который имеет доступ к useNavigate,
            // а не напрямую здесь в перехватчике, т.к. перехватчик не является React компонентом.
            // Однако, можно использовать глобальное событие или другую механику для уведомления приложения
            // о необходимости перенаправления.
            // Для простоты пока оставим только очистку localStorage.
            // ProtectedRoute в main.jsx теперь будет проверять отсутствие токена
            // и сам перенаправит на страницу логина.

            // Можно также вызвать глобальное сообщение об ошибке
            // import { message } from 'antd';
            // message.error('Ваша сессия истекла или у вас нет прав. Пожалуйста, войдите снова.');
        }

        return Promise.reject(error); // Пробрасываем ошибку дальше, чтобы ее обработал код, вызвавший axios.request
    }
);

console.log("Axios Interceptor Setup: Done.");
