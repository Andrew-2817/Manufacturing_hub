import { Layout } from "antd"
import { ContextProvider } from "../../../context"
import { MainFooter } from "../Footer"
import { MainPage } from "../MainPage"
import { LoginHeader } from "../Header"
export function DepartmentContent(){
    const layoutStyle = {
        minHeight: "100vh"
    }
    return(
        <ContextProvider>
            <Layout style={layoutStyle}>
                <LoginHeader/>
                <MainPage/>
                <MainFooter/>
            </Layout>
        </ContextProvider>
    )
}