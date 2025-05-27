import { Layout } from "antd";
// import { ContextProvider} from "../../../../context"; // ContextProvider обернут выше в main.jsx
import { MainFooter } from "../../Footer";
import { AccountHeader } from "../AccountHeader";
import { AccountMain } from "./AccountMain";
import { AccountSider } from "../AccountSider";
import { useEffect, useState } from "react";
// import axios from "axios"; // Axios больше не нужен для получения currentUser здесь
import { useTRPS } from "../../../../context"; // Импортируем useTRPS

export function AccountContent(){
    const layoutStyle = {
        minHeight: "100vh"
    }

    // Получаем currentUser из контекста
    const { currentUser, setCurrentUser } = useTRPS();

    // Состояние для заявок пользователя (будет загружаться в следующих этапах)
    const [userApplications, setUserApplications] = useState();

    // Удаляем useEffect, который получал currentUser из json-server
    // useEffect(() => {
    //     async function isCurrentUser(){
    //       try{
    //              const response = await axios.get("http://localhost:3001/currentUser")
    //               if (response.data && Object.keys(response.data).length > 0) {
    //                   setCurrentUser(response.data)
    //               }else{
    //                   setCurrentUser(null)
    //               }
    //               // Достаем заказы  нужного пользователя
    //               const responseUserApps = await axios.get("http://localhost:3001/userApps", {
    //                 params:{
    //                     userId: response.data.id
    //                 }
    //               })
    //               if (responseUserApps.data && Object.keys(responseUserApps.data).length > 0) {
    //                 setUserApplications(responseUserApps.data)
    //             }else{
    //                 setUserApplications(null)
    //             }
    //           } catch (error) {
    //               console.error('Error fetching currentUser or userApps:', error);
    //               alert('Failed to load user data or applications!'); // Изменил текст ошибки
    //           }
    //         }
    //         // Вызов функции isCurrentUser при монтировании компонента
    //         isCurrentUser()
    // }, []); // Пустой массив зависимостей означает, что эффект выполняется один раз после монтирования

    console.log("AccountContent - currentUser:", currentUser); // Логируем для отладки
    console.log("AccountContent - userApplications:", userApplications); // Логируем для отладки

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
                    <AccountSider currentUser = {currentUser}/>
                    {/* AccountMain использует currentUser и applications. applications пока из json-server */}
                    <AccountMain currentUser={currentUser} setUserApplications={setUserApplications} applications={userApplications}/>
                </Layout>
                <MainFooter/>
            </Layout>
        // </ContextProvider>
    )
}