import { Layout } from "antd";
import { useTRPS } from "../../../../context";
import { MainFooter } from "../../Footer";
import { AccountHeader } from "../AccountHeader";
import { AccountSider } from "../AccountSider";
import { useEffect, useState } from "react";
import axios from "axios";
import { AccountDepartmentMain } from "./AccountDepartmentMain";


export function AccountDepartment(){
    const layoutStyle = {
        minHeight: "100vh"
    }
    const { currentUser, loading: userLoading } = useTRPS(); // Получаем currentUser и loading

    // Состояние для всех заявок отдела
    const [departmentApplications, setDepartmentApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false); // Индикатор загрузки

    // Effect для загрузки заявок отдела при монтировании или изменении пользователя
    useEffect(() => {
        console.log("AccountDepartment useEffect: currentUser changed", currentUser);
        async function fetchDepartmentApplications(){
             // Загружаем заявки только если пользователь авторизован и имеет роль department
             // (Хотя ProtectedRoute уже гарантирует роль, явная проверка здесь - хорошая практика)
            if (currentUser && currentUser.role === 'department') {
                setApplicationsLoading(true);
                try{
                    // Запрос к защищенному эндпоинту для получения заявок отдела
                    // Axios Interceptor добавит токен, бэкенд проверит роль
                    const response = await axios.get("http://localhost:8000/orders/department/");
                    if (response.data) {
                        setDepartmentApplications(response.data);
                    } else {
                        setDepartmentApplications([]);
                    }
                    setApplicationsLoading(false);
                } catch (error) {
                    console.error('Error fetching department applications:', error);
                    // Обработка ошибок аутентификации/авторизации
                    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                         console.log("Authentication/Authorization error fetching department apps.");
                         // ProtectedRoute должен перенаправить
                    } else {
                        console.error('Other error fetching department applications:', error);
                        setDepartmentApplications([]); // Сброс в случае ошибки
                    }
                    setApplicationsLoading(false);
                }
            } else {
                 // Если currentUser нет или роль не department, очищаем список
                 setDepartmentApplications([]);
                 setApplicationsLoading(false);
            }
        }

        fetchDepartmentApplications();
    }, [currentUser]); // Перезагружаем заявки при изменении текущего пользователя

    console.log("AccountDepartment - currentUser:", currentUser);
    console.log("AccountDepartment - departmentApplications:", departmentApplications);


    return(
        <Layout style={layoutStyle}>
            <AccountHeader/>
            <Layout style={{minHeight: '100vh'}}>
                <AccountSider currentUser={currentUser}/>
                <AccountDepartmentMain
                    applications={departmentApplications}
                    setApplications={setDepartmentApplications}
                    currentUser={currentUser}
                    loading={applicationsLoading} // Передаем состояние загрузки
                />
            </Layout>
            <MainFooter/>
        </Layout>
    )
}