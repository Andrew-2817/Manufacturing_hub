import { Layout } from "antd"
import { ContextProvider, useTRPS } from "../../../../context"
import { MainFooter } from "../../Footer"
import { AccountHeader } from "../AccountHeader"
import { AccountExecutorMain } from "./AccountExecutorMain"
import { AccountSider } from "../AccountSider"
import { useEffect, useState } from "react"
import axios from "axios"
export function AccountExecutor(){
    const layoutStyle = {
        minHeight: "100vh"
    }
    const [currentUser, setCurrentUser] = useState(null)
    const [userApplications, setUserApplications] = useState()
    
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
                const filterredApps = responseUserApps.data.filter( el => ['paid_for', 'accepted_production', 'produced', 'sent'].includes(el.status))
                setUserApplications(filterredApps)
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
    console.log(currentUser, userApplications);
    
    return(
        <ContextProvider>
            <Layout style={layoutStyle}>
                <AccountHeader/>
                <Layout style={{minHeight: '100vh'}}>
                    <AccountSider currentUser={currentUser}/>
                    <AccountExecutorMain applications={userApplications} setUserApplications={setUserApplications}/>
                </Layout>
                <MainFooter/>
            </Layout>
        </ContextProvider>
    )
}