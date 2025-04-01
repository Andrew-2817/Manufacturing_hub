import { Layout } from "antd"
import { ContextProvider} from "../../../../context"
import { MainFooter } from "../../Footer"
import { AccountHeader } from "../AccountHeader"
import { AccountMain } from "./AccountMain"
import { AccountSider } from "../AccountSider"
import { useEffect, useState } from "react"
import axios from "axios"
export function AccountContent(){
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
              // Достаем заказы  нужного пользователя
              const responseUserApps = await axios.get("http://localhost:3001/userApps", {
                params:{
                    userId: response.data.id
                }
              })
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
    console.log(currentUser, userApplications);
    
    return(
        <ContextProvider>
            <Layout style={layoutStyle}>
                <AccountHeader/>
                <Layout style={{minHeight: '100vh'}}>
                    <AccountSider currentUser = {currentUser}/>
                    <AccountMain currentUser={currentUser} setUserApplications={setUserApplications} applications={userApplications}/>
                </Layout>
                <MainFooter/>
            </Layout>
        </ContextProvider>
    )
}