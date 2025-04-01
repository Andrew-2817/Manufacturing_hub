import { Layout, Typography, message, Tabs, Flex } from "antd"
import { useTRPS } from "../../../../context"
import { useEffect, useState } from "react"
import { PersonalData } from "../PersonalData"
import axios from "axios"
import { DepartmentApplicationCard } from "./DepartmentApplicationCard"
import { Button } from "../../Button"
const {Content} = Layout
const { TabPane } = Tabs;
const contentStyle = {
    maxWidth: '50%',
    margin: '0 auto',
    minHeight: '82vh',
    marginTop:'18vh', 
}
const tabStyle = {
    padding: '0.7rem 1rem',
    borderRadius: 8

}
export function AccountDepartmentMain({applications, currentUser, setUserApplications}){
    const {app, data } = useTRPS()
    const [filteredApps, setFilteredApps] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
        console.log(filteredApps);
        useEffect(() => {
            setFilteredApps(applications);
            setActiveTab("all"); // Сброс таба на "Все заявки" при обновлении данных
        }, [applications]);
        const filterApplications = (statusList, statusChange) => {
            if (statusChange === "all") {
                setFilteredApps(applications);
            } else {
                setFilteredApps(applications.filter(app => statusList.includes(app.status)));
            }
            setActiveTab(statusChange);
        };

        // Обновляем статусы заявок пользователей
        const handleUpdateApplication = async (orderNumber, newStatus) => {
            console.log(newStatus);
            
            try {
                await axios.patch(`http://localhost:3001/userApps/${orderNumber}`, {
                    status: newStatus
                });
                
                // Обновляем конкретную заявку в общем списке
                setUserApplications(prev => prev.map(app => 
                    app.id === orderNumber ? {...app, status: newStatus} : app
                ));
                
                message.success('Статус заявки обновлен');
            } catch (error) {
                console.error('Ошибка при обновлении статуса:', error);
                message.error('Не удалось обновить статус');
            }
        }
    
    return <Content style={contentStyle}>
        {app && 
        <>
            <Typography.Title style={{marginBottom:30}} level={2}>Заявки клиентов</Typography.Title>
            <Flex 
                activeKey={activeTab}
                onChange={filterApplications}
                type="card"
                justify="space-between"
                style={{ marginBottom: 30, width:"90%"}}
            >
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'all' ? true : false}
                    onClick={() => filterApplications('all', 'all')}
                    >
                        Все
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'sent_for_evaluation' ? true : false}
                    onClick={() => filterApplications(['sent_for_evaluation'], 'send_for_evaluation')}
                    >
                        Новые
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'accepted_evaluation' ? true : false}
                    onClick={() => filterApplications(['accepted_evaluation'], 'accepted_evaluation')}
                    >
                        Оцениваются
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'evaluated' ? true : false}
                    onClick={() => filterApplications(['evaluated','accepted_production', 'paid_for', 'produced', 'sent'], 'evaluated')}
                    >
                        Завершенные
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'reject' ? true : false}
                    onClick={() => filterApplications(['reject'], 'reject')}
                    >
                        Отклонённые
                </Button>
            </Flex>
            <div className="">
                {filteredApps && filteredApps.map(app => (
                <DepartmentApplicationCard app={app} key={app.id} onStatusChange={handleUpdateApplication}/>
                ))}
            </div>
        </>
        }
        {data && <>
            <Typography.Title style={{marginBottom:60}} level={2}>Мои данные</Typography.Title>
            <PersonalData currentUser={currentUser}/>
        </>}
    </Content>
}