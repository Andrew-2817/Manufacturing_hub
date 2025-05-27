import { Layout, Typography, message, Flex, Spin } from "antd" // Импортируем Spin
import { useTRPS } from "../../../../context"
import { useEffect, useState } from "react"
import { PersonalData } from "../PersonalData" // PersonalData не используется в этом компоненте, можно удалить
import axios from "axios"
import { DepartmentApplicationCard } from "./DepartmentApplicationCard"
import { Button } from "../../Button"
// import { ExecutorResourceManagement } from "../AccountExecutor/ExecutorResourceManagement" // Этот компонент не используется здесь, можно удалить


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
    all: [], // Пустой массив для "Все заявки" (бэкенд вернет все)
    sent_for_evaluation: ['sent_for_evaluation'], // Новые заявки
    accepted_evaluation: ['accepted_evaluation'], // Оцениваются
    evaluated: ['evaluated', 'paid_for', 'accepted_production', 'produced', 'sent'], // Завершенные (различные финальные/промежуточные успешные статусы)
    reject: ['reject'], // Отклоненные
};


export function AccountDepartmentMain({applications, setApplications, currentUser, loading}){ // Принимаем loading
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
             return;
        }

        try {
            // Отправляем запрос на бэкенд для обновления заказа
            // Axios Interceptor добавит токен, бэкенд проверит роль
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
                        Все ({applications?.length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'sent_for_evaluation'}
                    onClick={() => handleTabChange('sent_for_evaluation')}
                    >
                        Новые ({applications?.filter(app => STATUSES.sent_for_evaluation.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'accepted_evaluation'}
                    onClick={() => handleTabChange('accepted_evaluation')}
                    >
                        Оцениваются ({applications?.filter(app => STATUSES.accepted_evaluation.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'evaluated'}
                    onClick={() => handleTabChange('evaluated')}
                    >
                        Завершенные ({applications?.filter(app => STATUSES.evaluated.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'reject'}
                    onClick={() => handleTabChange('reject')}
                    >
                        Отклонённые ({applications?.filter(app => STATUSES.reject.includes(app.status)).length || 0})
                </Button>
            </Flex>
            <div className="">
                {loading ? (
                    <Typography.Text>Загрузка заявок...</Typography.Text>
                ) : (
                    filteredApps && filteredApps.length > 0 ? (
                        filteredApps.map(app => (
                            <DepartmentApplicationCard
                                app={app}
                                key={app.id}
                                onUpdate={handleUpdateApplication}
                            />
                        ))
                    ) : (
                        <Typography.Text>Нет заявок с таким статусом.</Typography.Text>
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