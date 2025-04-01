import { Layout, Typography, message, Flex } from "antd"
import { useTRPS } from "../../../../context"
import { UserApplicationCardOne } from "./UserApplicationCardOne"
import { useEffect, useState } from "react"
import { PersonalData } from "../PersonalData"
import { Button } from "../../Button"
import axios from "axios"
const {Content} = Layout
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

export function AccountMain({applications, currentUser, setUserApplications}){
    const {app, data } = useTRPS()
    const [filteredApps, setFilteredApps] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
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

        // Обновляем статусы заказов пользователя
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
                    onClick={() => filterApplications('all', 'all')}
                    >
                        Все
                </Button>
                <Button
                    style={tabStyle}
                    isActive={(activeTab === 'evaluation') ? true : false}
                    onClick={() => filterApplications(['sent_for_evaluation', 'accepted_evaluation'], 'evaluation')}
                    >
                        На оценке
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'evaluated' ? true : false}
                    onClick={() => filterApplications(['evaluated'], 'evaluated')}
                    >
                        Оплатить
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'produced' ? true : false}
                    onClick={() => filterApplications(['accepted_production', 'produced'], 'produced')}
                    >
                        На производстве
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'completed' ? true : false}
                    onClick={() => filterApplications(['sent', 'reject'], 'completed')}
                    >
                        Завершенные
                </Button>
            </Flex>
            <Typography.Title style={{marginBottom:60}} level={2}>Мои заказы</Typography.Title>
            <div className="">
                {filteredApps && filteredApps.map(app => (
                <UserApplicationCardOne app={app} key={app.id} onStatusChange={handleUpdateApplication}/>
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