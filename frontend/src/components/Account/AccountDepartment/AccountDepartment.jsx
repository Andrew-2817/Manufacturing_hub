import { Layout, Spin } from "antd"; // Импортируем Spin для индикатора загрузки
import { useTRPS } from "../../../../context";
import { MainFooter } from "../../Footer";
import { AccountHeader } from "../AccountHeader";
import { AccountSider } from "../AccountSider";
import { useEffect, useState } from "react";
import axios from "axios"; // Импортируем axios
import { AccountDepartmentMain } from "./AccountDepartmentMain";


export function AccountDepartment(){
    const layoutStyle = {
        minHeight: "100vh"
    }
    // Получаем currentUser и loading из контекста.
    // loading показывает, загружаются ли данные самого пользователя при старте.
    const { currentUser, loading: userLoading } = useTRPS();

    // Состояние для хранения списка заявок отдела
    const [departmentApplications, setDepartmentApplications] = useState(null); // Используем null для начального состояния "нет данных"
    const [applicationsLoading, setApplicationsLoading] = useState(false); // Индикатор загрузки заявок

    // Effect для загрузки заявок отдела при монтировании компонента
    // Этот эффект также перезапустится, если currentUser изменится (например, после успешного логина/обновления)
    useEffect(() => {
        console.log("AccountDepartment useEffect: currentUser changed or mounted", currentUser);

        // Асинхронная функция для загрузки заявок
        async function fetchDepartmentApplications(){
             // Проверяем, что пользователь авторизован и имеет роль 'department'
             // ProtectedRoute уже делает эту проверку для маршрута, но здесь проверка данных тоже полезна.
            if (currentUser && currentUser.role === 'department') {
                setApplicationsLoading(true); // Начинаем загрузку заявок

                try{
                    // Отправляем GET запрос к защищенному эндпоинту для получения заявок отдела
                    // Axios Interceptor автоматически добавит токен авторизации из localStorage
                    const response = await axios.get("http://localhost:8000/orders/department/");

                    if (response.data) {
                        console.log("AccountDepartment: RAW Backend Response for Department Apps:", response.data); // <-- ДОБАВЛЕН ЛОГ
                        setDepartmentApplications(response.data); // Устанавливаем полученные данные
                    } else {
                        console.log("AccountDepartment: No department applications returned.");
                        setDepartmentApplications([]); // Если данных нет или пустой массив
                    }
                    setApplicationsLoading(false); // Загрузка завершена

                } catch (error) {
                    console.error('Error fetching department applications:', error);
                    // Перехватчик Axios уже обрабатывает 401/403 ошибки.
                    // Здесь можно просто установить пустой массив и сообщение об ошибке,
                    // если это не ошибка аутентификации/авторизации, которую обработал ProtectedRoute.
                    console.log("Failed to fetch department applications.");
                    setDepartmentApplications([]); // Устанавливаем пустой массив в случае ошибки
                    setApplicationsLoading(false); // Загрузка завершена с ошибкой
                }
            } else {
                // Если пользователь не department или не авторизован, сбрасываем заявки
                 console.log("User is not department, not fetching applications.");
                 setDepartmentApplications([]); // Очищаем или оставляем null
                 setApplicationsLoading(false); // Загрузка завершена
            }
        }

        // Вызываем функцию загрузки
        // Проверка loading: userLoading гарантирует, что мы не пытаемся загрузить заявки,
        // пока данные currentUser еще сами загружаются из localStorage/API при старте.
        if (!userLoading) {
             fetchDepartmentApplications();
        }


    }, [currentUser, userLoading]); // Эффект срабатывает при изменении currentUser или userLoading

    // Если пользователь загружается, или заявки загружаются, можно показать индикатор
    if (userLoading || applicationsLoading === null) { // applicationsLoading === null может означать, что useEffect еще не запустился
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" tip={userLoading ? "Loading user data..." : "Loading applications..."} />
            </div>
        );
    }


    // Если заявки еще null (т.е., эффект не сработал или currentUser стал null),
    // возможно, стоит показать что-то другое, или ProtectedRoute должен был перенаправить.
    // В норме, если userLoading === false и currentUser есть, departmentApplications будет либо [], либо массив.
    // Проверим departmentApplications !== null
     if (departmentApplications === null) {
          console.log("departmentApplications is null, potentially unexpected state.");
          // Можно показать сообщение об ошибке или индикатор, или просто пустой контент
          return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" tip="Initializing..." />
            </div>
          )
     }


    return(
        <Layout style={layoutStyle}>
            <AccountHeader/>
            <Layout style={{minHeight: '100vh'}}>
                <AccountSider currentUser={currentUser}/>
                <AccountDepartmentMain
                    applications={departmentApplications} // Передаем полученный список заявок
                    setApplications={setDepartmentApplications} // Передаем функцию для обновления списка после PATCH
                    currentUser={currentUser}
                    loading={applicationsLoading} // Передаем состояние загрузки в Main компонент для отображения спиннера внутри контента
                />
            </Layout>
            <MainFooter/>
        </Layout>
    )
}