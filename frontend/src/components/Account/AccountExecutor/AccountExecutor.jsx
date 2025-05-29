import { Layout, Spin } from "antd"; // Импортируем Spin
import { useTRPS } from "../../../../context";
import { MainFooter } from "../../Footer";
import { AccountHeader } from "../AccountHeader";
import { AccountExecutorMain } from "./AccountExecutorMain";
import { AccountSider } from "../AccountSider";
import { useEffect, useState } from "react";
import axios from "axios";


export function AccountExecutor(){
    const layoutStyle = {
        minHeight: "100vh"
    }

    const { currentUser, loading: userLoading } = useTRPS();

    // Состояние для заказов производителя
    const [executorApplications, setExecutorApplications] = useState(null); // Используем null для начального состояния "нет данных"
    const [applicationsLoading, setApplicationsLoading] = useState(false); // Индикатор загрузки

    // Effect для загрузки заказов производителя при монтировании компонента
    useEffect(() => {
        console.log("AccountExecutor useEffect: currentUser changed or mounted", currentUser);
        async function fetchExecutorApplications(){
            // Загружаем заказы только если пользователь авторизован и имеет роль executor
            if (currentUser && currentUser.role === 'executor') {
                setApplicationsLoading(true); // Начинаем загрузку

                try{
                    // Запрос к защищенному эндпоинту для получения заказов текущего производителя
                    // Axios Interceptor автоматически добавит токен.
                    const response = await axios.get(`http://localhost:8000/orders/executor/me/`);

                    if (response.data) {
                        console.log("Fetched executor applications:", response.data);
                        // Фильтрация заказов по статусам для производителя (здесь можно предварительно отфильтровать,
                        // если бэкенд отдает все, но лучше, если бэкенд отдаст только актуальные).
                        // Пока передаем все, а фильтрация по вкладкам будет в AccountExecutorMain.
                        setExecutorApplications(response.data);
                    } else {
                        console.log("No executor applications returned.");
                        setExecutorApplications([]);
                    }
                    setApplicationsLoading(false);
                } catch (error) {
                    console.error('Error fetching executor applications:', error);
                    // Axios Interceptor уже обработал 401/403.
                    // Здесь просто сброс и логирование.
                    console.log("Failed to fetch executor applications.");
                    setExecutorApplications([]);
                    setApplicationsLoading(false);
                }
            } else {
                 // Если currentUser нет или роль не executor, сбрасываем заказы
                 console.log("User is not executor, not fetching applications.");
                 setExecutorApplications(null);
                 setApplicationsLoading(false);
            }
        }

        // Вызываем функцию загрузки только после того, как данные currentUser загружены
        if (!userLoading) {
            fetchExecutorApplications();
        }

    }, [currentUser, userLoading]); // Перезагружаем при изменении пользователя или статуса его загрузки

    // Отображаем спиннер, если пользователь загружается или заявки загружаются
    if (userLoading || applicationsLoading === null) {
        return (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" tip={userLoading ? "Loading user data..." : "Loading applications..."} />
            </div>
        );
    }
     // Если executorApplications еще null (не загружены после userLoading завершения),
     // это может быть переходное состояние. ProtectedRoute должен был бы его поймать.
     // Но на всякий случай:
    if (executorApplications === null) {
         console.log("executorApplications is null, potentially unexpected state.");
         return (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" tip="Initializing..." />
            </div>
         );
    }

    return(
        <Layout style={layoutStyle}>
            <AccountHeader/>
            <Layout style={{minHeight: '100vh'}}>
                <AccountSider currentUser={currentUser}/>
                <AccountExecutorMain
                     applications={executorApplications} // Передаем полученные заказы
                     setUserApplications={setExecutorApplications} // Функция для обновления
                     currentUser={currentUser}
                     loading={applicationsLoading} // Передаем состояние загрузки в Main
                />
            </Layout>
            <MainFooter/>
        </Layout>
    )
}