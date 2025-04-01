import { useState, useEffect } from "react";
import { Drawer, Typography, Card, Steps, Flex, ConfigProvider, message, Tag } from "antd"
import {Button} from "../../Button"
import app_reject from '../../../assets/app_reject.jpg'
import accept from '../../../assets/accept.jpg'
import produced from '../../../assets/produced.jpg'
import production from '../../../assets/production.jpg'
import sent from '../../../assets/sent.jpg'

export function ExecutorApplicationCard({app, onStatusChange}) {
    const allStatuses = ['paid_for','accepted_production', 'produced', 'sent']
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        // Устанавливаем текущий шаг на основе статуса заявки
        const statusIndex = allStatuses.findIndex(status => status === app.status);
        if (statusIndex !== -1) {
            setCurrent(statusIndex);
        }
    }, [app.status]);

    async function handleChangeStatusNext() {

            const currentStatusIndex = allStatuses.findIndex(el => el === app.status);
            if (currentStatusIndex === -1 || currentStatusIndex >= allStatuses.length - 1) {
                message.warning('Заявка уже имеет конечный статус');
                return;
            }

            const newStatus = allStatuses[currentStatusIndex+1];         
            // Правильный запрос для обновления статуса
            await onStatusChange(app.id, newStatus);
            next()
    }
    async function handleChangeStatusPrev() {
            const currentStatusIndex = allStatuses.findIndex(el => el === app.status);
            if (currentStatusIndex === -1 || currentStatusIndex >= allStatuses.length - 1) {
                message.warning('Заявка уже имеет конечный статус');
                return;
            }

            const newStatus = allStatuses[currentStatusIndex-1];
            await onStatusChange(app.id, newStatus);
            prev()
    }
        
    const next = () => {
        if (current < steps.length - 1) {
            setCurrent(current + 1);
        }
    };

    const prev = () => {
        if (current > 0) {
            setCurrent(current - 1);
        }
    };
    const steps = [
        {
            title: 'Начало производства',
            content: accept,
        },
        {
            title: 'Производство',
            content: production,
        },
        {
            title: 'Отправка',
            content : produced,
            },
    ];
    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));

    return (
        <Card style={{width: '90%', position: 'relative', overflow: 'hidden', marginBottom:20}}>
            {app.status !== 'sent' && <Typography style={{fontSize:22, marginBottom:20}}>
                Заказ №<span style={{fontWeight:600}}>{app?.OrderId}</span>
            </Typography>}
            {app.status === 'sent' && <Flex justify="space-between">
                <Typography style={{fontSize:22}}>
                    Заявка №<span style={{fontWeight:600}}>{app?.OrderId}</span>
                </Typography>
                <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Выполнен</Typography.Title>
            </Flex>}
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: 'rgb(224, 190, 121)',
                        colorBorderSecondary: 'rgb(218, 216, 239)'
                    },
                }}
            >    
                {app.status !== 'sent' && <Steps progressDot items={items} current={current} />}
                <Flex justify="space-between" align="center" style={{margin: '20px 0', padding: '0 10px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap:5}}>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Почта: </span>{app?.email}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Файл: </span>{app?.file?.name || app?.file?.uid}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Описание: </span>{app?.description}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Сроки: </span>{app?.deadline}
                        </Typography.Title>
                        <Typography.Title style={{margin: 0, fontSize: '18px', fontWeight: 400}} level={5}>
                            <span style={{fontWeight: 600}}>Стоимость: </span><Tag style={{fontSize:16}} color="green" bordered={false}>{app?.paidFor}₽</Tag>
                        </Typography.Title>
                    </div>
                    {app.status !== 'sent' && <img 
                        src={steps[current]?.content}
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"} 
                    />}
                    {app.status === 'sent' && <img 
                        src={sent}
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"} 
                    />}
                </Flex>
            </ConfigProvider>
            <Flex gap={20}>
                {app.status === 'paid_for' &&
                    <Button 
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        onClick={handleChangeStatusNext}
                    >
                        Принять
                    </Button>
                }
                {app.status === 'accepted_production' && <>
                    <Button 
                        onClick={handleChangeStatusPrev}
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                    >
                        Предыдущий шаг
                    </Button>
                    <Button 
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        onClick={handleChangeStatusNext}
                    >
                        Следующий шаг
                    </Button>
                </>}
                {app.status === 'produced' && <>
                    <Button 
                        onClick={handleChangeStatusPrev}
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                    >
                        Предыдущий шаг
                    </Button>
                    <Button 
                        isActive={true}
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        onClick={handleChangeStatusNext}
                    >
                        Завершить
                    </Button>
                </>}
            </Flex>
        </Card>
    )
}