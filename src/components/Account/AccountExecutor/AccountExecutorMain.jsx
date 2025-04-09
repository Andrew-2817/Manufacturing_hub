import { Layout, Typography, message, Flex } from "antd"
import { useTRPS } from "../../../../context"
import { useState, useEffect } from "react"
import { ExecutorApplicationCard } from "./ExecutorApplicationCard"
import { Button } from "../../Button"
import axios from "axios"
import { ExecutorResourceManagement } from "./ExecutorResourceManagement"
const {Content} = Layout
const contentStyle = {
    maxWidth: '50%',
    margin: '0 auto',
    minHeight: '120vh',
    marginTop:'18vh',
    
}
const tabStyle = {
    padding: '0.7rem 1rem',
    borderRadius: 8

}

export function AccountExecutorMain({applications, setUserApplications}){
    const {app, resource} = useTRPS()
        const [filteredApps, setFilteredApps] = useState([]);
        const [activeTab, setActiveTab] = useState("all");
        console.log(applications);
        useEffect(() => {
            setFilteredApps(applications);
            setActiveTab("all"); // Сброс таба на "Все заявки" при обновлении данных
        }, [applications]);
        const filterApplications = (status) => {
            if (status === "all") {
                setFilteredApps(applications);
            } else {
                setFilteredApps(applications.filter(app => app.status === status));
            }
            setActiveTab(status);
                };

        // Обновляем статусы заказов пользователей
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
                    onClick={() => filterApplications('all')}
                    >
                        Все
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'paid_for' ? true : false}
                    onClick={() => filterApplications('paid_for')}
                    >
                        Новые
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'accepted_production' ? true : false}
                    onClick={() => filterApplications('accepted_production')}
                    >
                        На производстве
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'produced' ? true : false}
                    onClick={() => filterApplications('produced')}
                    >
                        Завершенные
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'sent' ? true : false}
                    onClick={() => filterApplications('sent')}
                    >
                        Отправленные
                </Button>
            </Flex>
            <Typography.Title style={{marginBottom:60}} level={2}>Мои заявки</Typography.Title>
            <div className="">
                {filteredApps && filteredApps.map(app => (

                <ExecutorApplicationCard onStatusChange={handleUpdateApplication} app={app} key={app.id}/>
                ))}
            </div>
        </>
        }
        {resource && <ExecutorResourceManagement/>}
    </Content>
}