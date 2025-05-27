import { Layout } from "antd"
// import { ContextProvider, useTRPS } from "../../../../context" // ContextProvider не нужен, useTRPS импортируем
import { useTRPS } from "../../../../context" // useTRPS импортируем
import { MainFooter } from "../../Footer"
import { AccountHeader } from "../AccountHeader"
import { AccountSider } from "../AccountSider"
import { useEffect, useState } from "react"
import axios from "axios" // axios нужен для получения applications (пока из json-server)
import { AccountDepartmentMain } from "./AccountDepartmentMain"
// useLocation больше не нужен здесь, он теперь в AccountSider
// import { useLocation } from "react-router-dom";

export function AccountDepartment(){
    const layoutStyle = {
        minHeight: "100vh"
    }
    // Получаем currentUser из контекста, location здесь больше не нужен
    const { currentUser, setCurrentUser } = useTRPS(); // location удален из useTRPS

    // Состояние для заявок пользователей (будет загружаться в следующих этапах)
    const [userApplications, setUserApplications] = useState();

    // Удаляем лог location, т.к. он здесь больше не доступен из контекста
    // console.log(location);

    // Пока оставляем этот useEffect, который получает данные из json-server.
    // Он будет изменен в следующих этапах для работы с FastAPI.
    // Он не вызывает ошибку с useLocation.
    useEffect(() => {
        async function fetchData() { // Переименовал для ясности
            try{
                 // Этот блок для получения currentUser из json-server больше не нужен
                 // currentUser теперь из контекста
                 // const response = await axios.get("http://localhost:3001/currentUser")
                 // if (response.data && Object.keys(response.data).length > 0) {
                 //     setCurrentUser(response.data)
                 // }else{
                 //     setCurrentUser(null)
                 // }

                // Достаем все заказы из json-server (Временно)
                const responseUserApps = await axios.get("http://localhost:3001/userApps")
                if (responseUserApps.data && Object.keys(responseUserApps.data).length > 0) {
                    setUserApplications(responseUserApps.data)
                }else{
                    setUserApplications(null)
                }
            } catch (error) {
                console.error('Error fetching data:', error); // Изменил текст ошибки
                // alert('Failed to load department data!'); // Возможно, не стоит показывать alert при каждой ошибке загрузки данных
            }
        }
         // Вызов функции при монтировании
        fetchData()
    }, []); // Пустой массив зависимостей

    console.log("AccountDepartment - currentUser:", currentUser); // Логируем для отладки
    console.log("AccountDepartment - userApplications:", userApplications); // Логируем для отладки


    return(
        // ContextProvider не нужен здесь
        // <ContextProvider>
            <Layout style={layoutStyle}>
                {/* AccountHeader использует currentUser из контекста */}
                <AccountHeader/>
                <Layout style={{minHeight: '100vh'}}>
                    {/* AccountSider использует currentUser из контекста И получает location самостоятельно */}
                    <AccountSider currentUser={currentUser}/>
                    {/* AccountDepartmentMain использует applications и currentUser. applications пока из json-server */}
                    <AccountDepartmentMain applications={userApplications} setUserApplications={setUserApplications} currentUser={currentUser}/>
                </Layout>
                <MainFooter/>
            </Layout>
        // </ContextProvider>
    )
}