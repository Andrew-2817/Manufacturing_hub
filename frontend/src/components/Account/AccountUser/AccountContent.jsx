import { Layout } from "antd";
import { MainFooter } from "../../Footer";
import { AccountHeader } from "../AccountHeader";
import { AccountMain } from "./AccountMain";
import { AccountSider } from "../AccountSider";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTRPS } from "../../../../context";

export function AccountContent(){
    const layoutStyle = {
        minHeight: "100vh"
    }

    const { currentUser, loading: userLoading } = useTRPS();

    const [userApplications, setUserApplications] = useState(null);
    const [applicationsLoading, setApplicationsLoading] = useState(false);

    useEffect(() => {
        console.log("AccountContent useEffect: currentUser changed", currentUser);
        async function fetchUserApplications(){
            if (currentUser && currentUser.id) {
                setApplicationsLoading(true);
                try{
                    const responseUserApps = await axios.get(`http://localhost:8000/orders/user/${currentUser.id}`);

                    if (responseUserApps.data && responseUserApps.data.length > 0) {
                        setUserApplications(responseUserApps.data);
                    } else {
                        setUserApplications([]);
                    }
                    setApplicationsLoading(false);
                } catch (error) {
                    console.error('Error fetching user applications:', error);
                    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                         console.log("Authentication/Authorization error fetching user apps, clearing user.");
                         localStorage.removeItem('accessToken');
                         localStorage.removeItem('currentUserData');
                    } else {
                        console.error('Other error fetching user applications:', error);
                        setUserApplications([]);
                    }
                    setApplicationsLoading(false);
                }
            } else {
                 userApplications !== null && setUserApplications(null); // Clear if user logs out or is not present
                 setApplicationsLoading(false);
            }
        }

        if (!userLoading) { // Только когда currentUser загружен
            fetchUserApplications();
        }

    }, [currentUser, userLoading]); // Добавляем userLoading в зависимости

    console.log("AccountContent - currentUser:", currentUser);
    console.log("AccountContent - userApplications:", userApplications);


    return(
        <Layout style={layoutStyle}>
            <AccountHeader/>
            <Layout style={{minHeight: '100vh'}}>
                <AccountSider currentUser = {currentUser}/>
                <AccountMain
                    currentUser={currentUser}
                    applications={userApplications}
                    setUserApplications={setUserApplications}
                    loading={applicationsLoading}
                />
            </Layout>
            <MainFooter/>
        </Layout>
    )
}