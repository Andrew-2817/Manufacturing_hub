import { Layout } from "antd";
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
    const [executorApplications, setExecutorApplications] = useState([]); // Назовем их executorApplications
    const [applicationsLoading, setApplicationsLoading] = useState(false);

    // Effect для загрузки заказов производителя
    useEffect(() => {
        console.log("AccountExecutor useEffect: currentUser changed", currentUser);
        async function fetchExecutorApplications(){
            // Загружаем заказы только если пользователь авторизован и имеет роль executor
            if (currentUser && currentUser.role === 'executor') {
                setApplicationsLoading(true);
                try{
                    // ЗДЕСЬ НУЖЕН НОВЫЙ ЭНДПОИНТ НА БЭКЕНДЕ для получения заказов производителя
                    // Например: GET /orders/executor/{manufacture_id} или GET /orders/executor/me
                    // Пока используем заглушку или существующий эндпоинт (который вернет не то, что нужно)
                    // Предположим, что будет эндпоинт GET /orders/executor/me который вернет заказы текущего производителя
                    // Этот эндпоинт нужно будет реализовать на этапе 3.5
                    const response = await axios.get(`http://localhost:8000/orders/executor/me`); // <-- ЭТОТ ЭНДПОИНТ НУЖНО СОЗДАТЬ НА ЭТАПЕ 3.5

                    if (response.data) {
                        setExecutorApplications(response.data);
                    } else {
                        setExecutorApplications([]);
                    }
                    setApplicationsLoading(false);
                } catch (error) {
                    console.error('Error fetching executor applications:', error);
                    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                         console.log("Authentication/Authorization error fetching executor apps.");
                    } else {
                        console.error('Other error fetching executor applications:', error);
                        setExecutorApplications([]);
                    }
                    setApplicationsLoading(false);
                }
            } else {
                 setExecutorApplications([]);
                 setApplicationsLoading(false);
            }
        }

        fetchExecutorApplications();
    }, [currentUser]); // Перезагружаем при изменении пользователя

    console.log("AccountExecutor - currentUser:", currentUser);
    console.log("AccountExecutor - executorApplications:", executorApplications);


    return(
        <Layout style={layoutStyle}>
            <AccountHeader/>
            <Layout style={{minHeight: '100vh'}}>
                <AccountSider currentUser={currentUser}/>
                <AccountExecutorMain
                     applications={executorApplications} // Передаем заказы производителя
                     setUserApplications={setExecutorApplications} // Передаем для возможности обновления статуса
                     currentUser={currentUser} // Передаем currentUser
                     loading={applicationsLoading} // Передаем состояние загрузки
                />
            </Layout>
            <MainFooter/>
        </Layout>
    )
}