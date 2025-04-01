import { Layout } from "antd"
import { ContextProvider, useTRPS } from "../../../../context"
import { MainFooter } from "../../Footer"
import { AccountHeader } from "../AccountHeader"
import { AccountSider } from "../AccountSider"
import { useEffect, useState } from "react"
import axios from "axios"
import { AccountDepartmentMain } from "./AccountDepartmentMain"
export function AccountDepartment(){
    const layoutStyle = {
        minHeight: "100vh"
    }
    const [currentUser, setCurrentUser] = useState(null)
    const [userApplications, setUserApplications] = useState()
    const {location} = useTRPS()
    console.log(location);
    
    useEffect(() => {
        async function isCurrentUser(){
        try{

            // Узнаем текущего пользовалеля(временное решение)
            const response = await axios.get("http://localhost:3001/currentUser")
            if (response.data && Object.keys(response.data).length > 0) {
                setCurrentUser(response.data)
            }else{
                setCurrentUser(null)
            }
            // Достаем все заказы
            const responseUserApps = await axios.get("http://localhost:3001/userApps")
            if (responseUserApps.data && Object.keys(responseUserApps.data).length > 0) {
                setUserApplications(responseUserApps.data)
            }else{
                setUserApplications(null)
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Registration failed!');
        }
        }
        isCurrentUser()
    }, []);
    
    return(
        <ContextProvider>
            <Layout style={layoutStyle}>
                <AccountHeader/>
                <Layout style={{minHeight: '100vh'}}>
                    <AccountSider currentUser={currentUser}/>
                    <AccountDepartmentMain applications={userApplications} setUserApplications={setUserApplications}/>
                </Layout>
                <MainFooter/>
            </Layout>
        </ContextProvider>
    )
}