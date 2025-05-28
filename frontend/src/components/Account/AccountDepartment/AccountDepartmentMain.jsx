import { Layout, Typography, message, Flex, Spin } from "antd";
import { useTRPS } from "../../../../context";
import { useEffect, useState } from "react";
import { PersonalData } from "../PersonalData";
import axios from "axios";
import { DepartmentApplicationCard } from "./DepartmentApplicationCard";
import { Button } from "../../Button";


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

const STATUSES = {
    all: [],
    sent_for_evaluation: ['sent_for_evaluation'],
    accepted_evaluation: ['accepted_evaluation'],
    evaluated: ['evaluated'],
    evaluated_and_after: ['evaluated', 'paid_for', 'accepted_production', 'produced', 'sent'],
    reject: ['reject'],
};


export function AccountDepartmentMain({applications, setApplications, currentUser, loading}){
    const {app, data } = useTRPS();
    const [filteredApps, setFilteredApps] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        console.log("AccountDepartmentMain useEffect: applications or activeTab changed", { applications, activeTab });
        if (!applications) {
             setFilteredApps([]);
             return;
        }

        const statusesToFilter = STATUSES[activeTab];

        if (activeTab === "all") {
            setFilteredApps(applications);
        } else {
            setFilteredApps(applications.filter(app => statusesToFilter.includes(app.status)));
        }
    }, [applications, activeTab]);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
    };

    const handleUpdateApplication = async (orderId, updates) => {
        console.log(`Attempting to update order ${orderId} with:`, updates);

        if (Object.keys(updates).length === 0) {
             console.warn("No updates provided for handleUpdateApplication");
             message.warning("Не указаны данные для обновления.");
             return;
        }

        try {
            const response = await axios.patch(`http://localhost:8000/orders/${orderId}`, updates);
            console.log('Order updated on backend:', response.data);

            setApplications(prev => prev.map(app =>
                app.id === orderId ? { ...app, ...response.data } : app
            ));

            message.success('Статус заявки обновлен');

        } catch (error) {
            console.error('Error updating order status:', error);
            let errorMessage = 'Не удалось обновить статус заявки.';
             if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = `Ошибка: ${error.response.data.detail}`;
            }
            message.error(errorMessage);
        }
    }

    const countApplicationsByStatus = (statuses) => {
        if (!applications) return 0;
        if (statuses.length === 0) return applications.length;
        return applications.filter(app => statuses.includes(app.status)).length;
    };


    return <Content style={contentStyle}>
        {app &&
        <>
            <Typography.Title style={{marginBottom:30}} level={2}>Заявки клиентов</Typography.Title>

            <Flex
                justify="space-between"
                style={{ marginBottom: 30, width:"90%"}}
            >
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'all'}
                    onClick={() => handleTabChange('all')}
                >
                    Все ({countApplicationsByStatus(STATUSES.all)})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'sent_for_evaluation'}
                    onClick={() => handleTabChange('sent_for_evaluation')}
                >
                    Новые ({countApplicationsByStatus(STATUSES.sent_for_evaluation)})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'accepted_evaluation'}
                    onClick={() => handleTabChange('accepted_evaluation')}
                >
                    Оцениваются ({countApplicationsByStatus(STATUSES.accepted_evaluation)})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'evaluated_and_after'}
                    onClick={() => handleTabChange('evaluated_and_after')}
                >
                    Оцененные и далее ({countApplicationsByStatus(STATUSES.evaluated_and_after)})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'reject'}
                    onClick={() => handleTabChange('reject')}
                >
                    Отклонённые ({countApplicationsByStatus(STATUSES.reject)})
                </Button>
            </Flex>

            <div style={{ minHeight: '100px' }}>
                {loading ? (
                    <Spin size="large" tip="Загрузка заявок..." style={{display: 'block', textAlign: 'center', marginTop: '50px'}}/>
                ) : (
                    console.log("AccountDepartmentMain: filteredApps before map:", filteredApps),
                    filteredApps && filteredApps.length > 0 ? (
                        filteredApps.map(app => {
                            console.log("AccountDepartmentMain: Rendering card for app:", app);
                            return (
                                <DepartmentApplicationCard
                                    app={app}
                                    key={app.id}
                                    onUpdate={handleUpdateApplication}
                                />
                            );
                        })
                    ) : (
                        <Typography.Text style={{display: 'block', textAlign: 'center', marginTop: '50px'}}>
                             {applications && applications.length === 0 ? "Нет заявок в системе." : "Нет заявок с таким статусом."}
                         </Typography.Text>
                    )
                )}
            </div>
        </>
        }
        {data && currentUser && (
            <>
                <Typography.Title style={{marginBottom:60}} level={2}>Мои данные</Typography.Title>
                <PersonalData currentUser={currentUser}/>
            </>
        )}
    </Content>
}