import { Layout } from "antd";
import { MainFooter } from "../../Footer";
import { AccountHeader } from "../AccountHeader";
import { AccountMain } from "./AccountMain";
import { AccountSider } from "../AccountSider";
import { useEffect, useState } from "react";
import axios from "axios"; // Импортируем axios для запроса заказов
import { useTRPS } from "../../../../context"; // Импортируем useTRPS

export function AccountContent(){
    const layoutStyle = {
        minHeight: "100vh"
    }

    const { currentUser, loading: userLoading } = useTRPS(); // Получаем currentUser и loading из контекста (loading - для состояния загрузки пользователя)

    // Состояние для заявок конкретного пользователя
    const [userApplications, setUserApplications] = useState(null); // Изначально null или []
    const [applicationsLoading, setApplicationsLoading] = useState(false); // Состояние загрузки заявок

    // Effect для загрузки заказов пользователя, когда currentUser становится доступен
    useEffect(() => {
        console.log("AccountContent useEffect: currentUser changed", currentUser);
        async function fetchUserApplications(){
             // Загружаем заявки только если currentUser авторизован
            if (currentUser && currentUser.id) {
                setApplicationsLoading(true); // Начинаем загрузку заявок
                try{
                    // ИЗМЕНЕНО: Запрос к новому защищенному эндпоинту для получения заказов пользователя по ID
                    const responseUserApps = await axios.get(`http://localhost:8000/orders/user/${currentUser.id}`);

                    if (responseUserApps.data && responseUserApps.data.length > 0) {
                        setUserApplications(responseUserApps.data);
                    } else {
                        setUserApplications([]); // Если данных нет, устанавливаем пустой массив
                    }
                    setApplicationsLoading(false); // Загрузка завершена
                } catch (error) {
                    console.error('Error fetching user applications:', error);
                     // Если ошибка 401/403, это может быть невалидный токен - редирект на логин
                    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                         // Логика редиректа должна быть в Axios Interceptor или здесь, используя useNavigate
                         // Пока просто логируем и очищаем данные пользователя, редирект сделает ProtectedRoute
                         console.log("Authentication/Authorization error fetching user apps, clearing user.");
                         localStorage.removeItem('accessToken');
                         localStorage.removeItem('currentUserData');
                         // setCurrentUser(null); // Вызов setCurrentUser(null) здесь может вызвать проблемы, лучше положиться на ProtectedRoute
                    } else {
                        // Другие ошибки при загрузке данных
                        console.error('Other error fetching user applications:', error);
                        setUserApplications([]); // В случае ошибки также сбрасываем заявки
                    }
                    setApplicationsLoading(false);
                }
            } else {
                 // Если currentUser нет, очищаем список заявок
                 setUserApplications(null); // Или []
                 setApplicationsLoading(false);
            }
        }

        // Вызываем функцию загрузки
        fetchUserApplications();

    }, [currentUser]); // Эффект срабатывает при изменении currentUser (при первой загрузке или после логина)

    console.log("AccountContent - currentUser:", currentUser);
    console.log("AccountContent - userApplications:", userApplications);


    return(
        <Layout style={layoutStyle}>
            <AccountHeader/>
            <Layout style={{minHeight: '100vh'}}>
                <AccountSider currentUser = {currentUser}/>
                <AccountMain
                    currentUser={currentUser}
                    applications={userApplications}
                    setUserApplications={setUserApplications} // Передаем для возможности обновления статуса
                    loading={applicationsLoading} // Передаем состояние загрузки заявок
                />
            </Layout>
            <MainFooter/>
        </Layout>
    )
}