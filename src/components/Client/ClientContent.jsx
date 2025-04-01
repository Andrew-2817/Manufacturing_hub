import { Layout } from "antd"
import { ContextProvider} from "../../../context"
import { LoginHeader } from "../Header"
import { MainPage } from "../MainPage"
import { MainFooter } from "../Footer"
export function ClientContent(){
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