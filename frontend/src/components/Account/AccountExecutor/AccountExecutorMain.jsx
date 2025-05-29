import { Layout, Typography, message, Flex, Spin } from "antd"
import { useTRPS } from "../../../../context"
import { useState, useEffect } from "react"
import { ExecutorApplicationCard } from "./ExecutorApplicationCard"
import { Button } from "../../Button"
import axios from "axios"
import { ExecutorResourceManagement } from "./ExecutorResourceManagement" // Оставим импорт, он используется ниже


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

// Определяем списки статусов для фильтрации заказов производителя
const EXECUTOR_STATUSES = {
    all: [],
    paid_for: ['paid_for'], // Новые (для производителя - это оплаченные)
    accepted_production: ['accepted_production'], // На производстве
    produced: ['produced'], // Завершенные (готово)
    sent: ['sent'], // Отправленные (доставлено)
};


export function AccountExecutorMain({applications, setUserApplications, currentUser, loading}){ // Принимаем loading
    const {app, resource} = useTRPS();
    const [filteredApps, setFilteredApps] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    // Обновляем filteredApps при изменении applications или activeTab
    useEffect(() => {
        console.log("AccountExecutorMain useEffect: applications or activeTab changed", { applications, activeTab });
        if (applications === null) { // Если applications еще null (не загружены), показываем пустой массив
            setFilteredApps([]);
            return;
        }
        const statusesToFilter = EXECUTOR_STATUSES[activeTab];
        if (activeTab === "all") {
            setFilteredApps(applications);
        } else {
            setFilteredApps(applications.filter(app => statusesToFilter.includes(app.status)));
        }
    }, [applications, activeTab]);

    // Функция для смены активной вкладки фильтрации
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
    };


    // Обновляем статус заказа производителя на бэкенде и в локальном состоянии
    const handleUpdateApplication = async (orderId, updates) => {
        console.log(`Attempting to update executor order ${orderId} with:`, updates);

         if (Object.keys(updates).length === 0) {
             console.warn("No updates provided for handleUpdateApplication");
             message.warning("Не указаны данные для обновления.");
             return;
         }

        try {
             // Отправляем PATCH запрос на бэкенд для обновления заказа
             // Axios Interceptor добавит токен.
            const response = await axios.patch(`http://localhost:8000/orders/${orderId}`, updates);
            console.log('Executor order updated on backend:', response.data);

             // Обновляем конкретный заказ в общем списке заказов
            setUserApplications(prev => prev.map(app =>
                app.id === orderId ? { ...app, ...response.data } : app
            ));

            message.success('Статус заказа обновлен');

        } catch (error) {
            console.error('Error updating executor order status:', error);
             let errorMessage = 'Не удалось обновить статус заказа.';
             if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = `Ошибка: ${error.response.data.detail}`;
            }
            message.error(errorMessage);
        }
    }


    return <Content style={contentStyle}>
        {app &&
        <>
            <Typography.Title style={{marginBottom:60}} level={2}>Мои заказы</Typography.Title>
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
                    isActive={activeTab === 'paid_for'}
                    onClick={() => handleTabChange('paid_for')}
                    >
                        Новые ({applications?.filter(app => EXECUTOR_STATUSES.paid_for.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'accepted_production'}
                    onClick={() => handleTabChange('accepted_production')}
                    >
                        На производстве ({applications?.filter(app => EXECUTOR_STATUSES.accepted_production.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'produced'}
                    onClick={() => handleTabChange('produced')}
                    >
                        Завершенные ({applications?.filter(app => EXECUTOR_STATUSES.produced.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'sent'}
                    onClick={() => handleTabChange('sent')}
                    >
                        Отправленные ({applications?.filter(app => EXECUTOR_STATUSES.sent.includes(app.status)).length || 0})
                </Button>
            </Flex>

            <div className="">
                {loading ? (
                     <Spin size="large" tip="Загрузка заказов..." style={{display: 'block', textAlign: 'center', marginTop: '50px'}}/>
                ) : (
                    // Проверяем, что applications не null и не пустой
                    filteredApps && filteredApps.length > 0 ? (
                        filteredApps.map(app => (
                             <ExecutorApplicationCard
                                onStatusChange={handleUpdateApplication}
                                app={app}
                                key={app.id}
                            />
                        ))
                    ) : (
                         <Typography.Text style={{display: 'block', textAlign: 'center', marginTop: '50px'}}>
                             {applications && applications.length === 0 ? "У вас пока нет назначенных заказов." : "Нет заказов с таким статусом."}
                         </Typography.Text>
                    )
                )}
            </div>
        </>
        }
        {resource && currentUser && (
             <>
                <Typography.Title style={{marginBottom:60}} level={2}>Управление ресурсами</Typography.Title>
                <ExecutorResourceManagement/>
             </>
        )}
    </Content>
}