import { Layout, Typography, message, Flex, Spin } from "antd" // Импортируем Spin
import { useTRPS } from "../../../../context"
// import { UserApplicationCardOne } from "./UserApplicationCardOne" // Оставим импорт, он используется ниже
import { useEffect, useState } from "react"
import { PersonalData } from "../PersonalData"
import { Button } from "../../Button"
import axios from "axios"
import { UserApplicationCardOne } from "./UserApplicationCardOne" // Явный импорт


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

// Определяем списки статусов для фильтрации заявок пользователя
const USER_STATUSES = {
    all: [],
    evaluation: ['sent_for_evaluation', 'accepted_evaluation'], // На оценке
    evaluated: ['evaluated'], // Оплатить
    produced: ['paid_for', 'accepted_production', 'produced'], // На производстве (оплачено, в производстве, готово)
    completed: ['sent', 'reject'], // Завершенные (отправлено, отклонено)
};


export function AccountMain({ applications, currentUser, setUserApplications, loading }){ // Принимаем applications, currentUser, setUserApplications и loading
    const {app, data } = useTRPS();

    const [filteredApps, setFilteredApps] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    // Обновляем filteredApps при изменении applications или activeTab
    useEffect(() => {
        console.log("AccountMain useEffect: applications or activeTab changed", { applications, activeTab });
         if (!applications) {
             setFilteredApps([]);
             return;
         }
        const statusesToFilter = USER_STATUSES[activeTab];
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


    // Обновляем статус заказа пользователя на бэкенде и в локальном состоянии
    // Эта функция будет передаваться в UserApplicationCardOne
    const handleUpdateApplication = async (orderId, updates) => {
        console.log(`Attempting to update user order ${orderId} with:`, updates);

         if (Object.keys(updates).length === 0) {
             console.warn("No updates provided for handleUpdateApplication");
             return;
         }

        try {
            const response = await axios.patch(`http://localhost:8000/orders/${orderId}`, updates);
            console.log('User order updated on backend:', response.data);

             // Обновляем конкретную заявку в общем списке заявок
            setUserApplications(prev => prev.map(app =>
                app.id === orderId ? { ...app, ...response.data } : app
            ));

            message.success('Статус заказа обновлен');

        } catch (error) {
            console.error('Error updating user order status:', error);
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
                    isActive={activeTab === 'evaluation'}
                    onClick={() => handleTabChange('evaluation')}
                    >
                        На оценке ({applications?.filter(app => USER_STATUSES.evaluation.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'evaluated'}
                    onClick={() => handleTabChange('evaluated')}
                    >
                        Оплатить ({applications?.filter(app => USER_STATUSES.evaluated.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'produced'}
                    onClick={() => handleTabChange('produced')}
                    >
                        На производстве ({applications?.filter(app => USER_STATUSES.produced.includes(app.status)).length || 0})
                </Button>
                <Button
                    style={tabStyle}
                    isActive={activeTab === 'completed'}
                    onClick={() => handleTabChange('completed')}
                    >
                        Завершенные ({applications?.filter(app => USER_STATUSES.completed.includes(app.status)).length || 0})
                </Button>
            </Flex>

            <Typography.Title style={{marginBottom:60}} level={2}>Мои заказы</Typography.Title>

            <div className="">
                {loading ? (
                     <Typography.Text>Загрузка заказов...</Typography.Text>
                ) : (
                    filteredApps && filteredApps.length > 0 ? (
                        filteredApps.map(app => (
                            // Передаем данные заказа и функцию обновления
                            <UserApplicationCardOne
                                app={app}
                                key={app.id}
                                onStatusChange={handleUpdateApplication} // Передаем функцию обновления
                            />
                        ))
                    ) : (
                         <Typography.Text>Нет заказов с таким статусом.</Typography.Text>
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