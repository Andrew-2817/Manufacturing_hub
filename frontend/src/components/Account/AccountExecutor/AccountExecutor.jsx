import { Layout } from "antd";
// import { ContextProvider, useTRPS } from "../../../../context"; // ContextProvider не нужен, useTRPS импортируем
import { useTRPS } from "../../../../context"; // Импортируем useTRPS
import { MainFooter } from "../../Footer";
import { AccountHeader } from "../AccountHeader";
import { AccountExecutorMain } from "./AccountExecutorMain";
import { AccountSider } from "../AccountSider";
import { useEffect, useState } from "react";
// import axios from "axios"; // Axios больше не нужен для получения currentUser

export function AccountExecutor(){
    const layoutStyle = {
        minHeight: "100vh"
    }

    // Получаем currentUser из контекста
    const { currentUser, setCurrentUser } = useTRPS();

    // Состояние для заявок пользователя (будет загружаться в следующих этапах)
    const [userApplications, setUserApplications] = useState();

    // Удаляем useEffect, который получал данные из json-server
    // useEffect(() => {
    //     async function isCurrentUser(){
    //       try{
    //             // Узнаем текущего пользовалеля(временное решение)
    //               const response = await axios.get("http://localhost:3001/currentUser")
    //               if (response.data && Object.keys(response.data).length > 0) {
    //                   setCurrentUser(response.data)
    //               }else{
    //                   setCurrentUser(null)
    //               }
    //             // Достаем все заказы
    //               const responseUserApps = await axios.get("http://localhost:3001/userApps")
    //               if (responseUserApps.data && Object.keys(responseUserApps.data).length > 0) {
    //                 // Фильтрация заказов для производителя (по статусам) - эту логику нужно будет перенести на бэкенд в Этапе 5
    //                 const filterredApps = responseUserApps.data.filter( el => ['paid_for', 'accepted_production', 'produced', 'sent'].includes(el.status))
    //                 setUserApplications(filterredApps)
    //             }else{
    //                 setUserApplications(null)
    //             }
    //           } catch (error) {
    //               console.error('Error fetching data:', error); // Изменил текст ошибки
    //               alert('Failed to load executor data!'); // Изменил текст ошибки
    //           }
    //         }
    //     isCurrentUser() // Вызов функции при монтировании
    // }, []); // Пустой массив зависимостей

    console.log("AccountExecutor - currentUser:", currentUser); // Логируем для отладки
    console.log("AccountExecutor - userApplications:", userApplications); // Логируем для отладки

    // Примечание: Загрузка userApplications пока остается связанной с json-server
    // и будет перенесена на бэкенд в следующих этапах.
    // Сейчас компонент будет работать, но данные заявок будут подтягиваться со старого источника,
    // если json-server запущен, или будут null без него.


    return(
        // ContextProvider не нужен здесь
        // <ContextProvider>
            <Layout style={layoutStyle}>
                {/* AccountHeader использует currentUser из контекста */}
                <AccountHeader/>
                <Layout style={{minHeight: '100vh'}}>
                     {/* AccountSider использует currentUser из контекста */}
                    <AccountSider currentUser={currentUser}/>
                    {/* AccountExecutorMain использует applications. applications пока из json-server */}
                    <AccountExecutorMain applications={userApplications} setUserApplications={setUserApplications}/>
                </Layout>
                <MainFooter/>
            </Layout>
        // </ContextProvider>
    )
}