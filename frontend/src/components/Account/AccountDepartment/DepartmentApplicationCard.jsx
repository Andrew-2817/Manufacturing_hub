import { useState, useEffect } from "react";
import { Drawer, Typography, Card, Steps, Flex, ConfigProvider, message, Input } from "antd"
import axios from "axios";
import {Button} from "../../Button"
import app_reject from '../../../assets/app_reject.jpg'
import completed from '../../../assets/completed.jpg'
import evaluation from '../../../assets/evaluation.jpg'
import accept from '../../../assets/accept.jpg'


export function DepartmentApplicationCard({app, onStatusChange, loading}) {
    const allStatuses = ['sent_for_evaluation', 'accepted_evaluation', 'evaluated']
    const allStatusesCheck = ['evaluated','accepted_production', 'paid_for', 'produced', 'sent']
    const [drawer, setDrawer] = useState(false)
    const [drawerPrice, setDrawerPrice] = useState(false)
    const [current, setCurrent] = useState(0);
    const [input, setInput] = useState('')
    const [inputError, setInputError] = useState('')
    const [priceError, setPriceError] = useState('')
    const [price, setPrice] = useState(100)
    const [evaluated, setEvaluated] = useState(false)
    

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


            // После оценки обновляем стоимость у нужной заявки
            const newStatus = allStatuses[currentStatusIndex+1];
            if (newStatus === 'evaluated'){
                try {
                    await axios.patch(`http://localhost:3001/userApps/${app.id}`, {
                        paidFor: price
                    });
                    message.success('Статус заявки обновлен');
                } catch (error) {
                    console.error('Ошибка при обновлении статуса:', error);
                    message.error('Не удалось обновить статус');
                }
            }
            
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
    async function handleRejectApplication() {
        if(input!==''){
            try {
                await axios.patch(`http://localhost:3001/userApps/${app.id}`, {
                    description: input
                });
                message.success('Статус заявки обновлен');
            } catch (error) {
                console.error('Ошибка при обновлении статуса:', error);
                message.error('Не удалось обновить статус');
            }
            await onStatusChange(app.id, 'reject')
            setDrawer(false)
        }
        else{
            setInputError('Заполните поле')
        }
    }
    function evaluatedApp(){
        if (price){
            setEvaluated(true)
            setDrawerPrice(false)
        }else{
            setPriceError("Заполните поле")
        }
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
            title: 'Принять заявку',
            content: accept,
        },
        {
            title: 'Оценка',
            content: evaluation,
        },
    ];

    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));

    return (
        <Card style={{width: '90%', position: 'relative', overflow: 'hidden', marginBottom:20}} loading={loading}>
            {(app.status !== 'reject' && !allStatusesCheck.includes(app.status)) && <Typography style={{fontSize:22, marginBottom:20}}>
                Заявка №<span style={{fontWeight:600}}>{app?.OrderId}</span>
            </Typography>}
            {app.status === 'reject' && <Flex justify="space-between">
                <Typography style={{fontSize:22}}>
                    Заявка №<span style={{fontWeight:600}}>{app?.OrderId}</span>
                </Typography>
                <Typography.Title style={{margin:0, fontWeight:400, color: 'red'}} level={4}>Отклонена</Typography.Title>
            </Flex>}
            {allStatusesCheck.includes(app.status) && <Flex justify="space-between">
                <Typography style={{fontSize:22}}>
                    Заявка №<span style={{fontWeight:600}}>{app?.OrderId}</span>
                </Typography>
                <Typography.Title style={{margin:0, fontWeight:400, color: 'green'}} level={4}>Оценена</Typography.Title>
            </Flex>}
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: 'rgb(224, 190, 121)',
                        colorBorderSecondary: 'rgb(218, 216, 239)'
                    },
                }}
            >    
                {(app.status !== 'reject' && !allStatusesCheck.includes(app.status)) && <Steps progressDot items={items} current={current} />}
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
                            <span style={{fontWeight: 600}}>Стоимость: </span>{app?.paidFor}
                        </Typography.Title>
                    </div>
                    {(app.status !== 'reject' && !allStatusesCheck.includes(app.status)) && <img 
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"} 
                        src={steps[current]?.content} 
                    />}
                    {allStatusesCheck.includes(app.status) && <img 
                        src={completed}
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"} 
                    />}
                    {app.status === 'reject' && <img 
                        src={app_reject}
                        style={{borderRadius:10, transition: 'all ease .4s'}} 
                        width={"45%"} 
                    />}
                </Flex>
            </ConfigProvider>
            <Flex gap={20}>
                {app.status === 'sent_for_evaluation' && <>
                    <Button 
                        onClick={() => setDrawer(true)}
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                    >
                        Отклонить
                    </Button>
                    <Button 
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        onClick={handleChangeStatusNext}
                    >
                        Принять
                    </Button>
                </>}
                {app.status === 'accepted_evaluation' && <>
                    <Button 
                        onClick={handleChangeStatusPrev}
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                    >
                        Предыдущий шаг
                    </Button>
                    {evaluated ? <Button 
                        isActive 
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        onClick={handleChangeStatusNext}
                    >
                        Завершить
                    </Button> : <Button 
                        style={{padding: '0.5rem 1rem', borderRadius: 10}}
                        onClick={() => setDrawerPrice(true)}
                    >
                        Провести оценку
                    </Button>}
                </>}
            </Flex>
            <Drawer
                title="Отклонение заявки"
                placement="left"
                closable={true}
                onClose={() => setDrawer(false)}
                open={drawer}
                style={{fontSize:22}}
                getContainer={false}
            >
                <Typography.Title style={{fontWeight:400, fontSize:18, marginBottom:20}}>Напишите почему заявка отклонена</Typography.Title>
                <ConfigProvider
                    theme={{
                        components: {
                        Input: {
                            activeBorderColor: '#e6cea4',
                            hoverBorderColor: '#e6cea4'
                        },
                        },
                    }}
                    >            
                    <Input.TextArea showCount style={{fontSize:18, marginBottom:20, height:120}} value={input} onChange={() => setInput(event.target.value)}></Input.TextArea>
                </ConfigProvider>
                <Typography>{inputError}</Typography>
                <Button onClick={handleRejectApplication}>Отправить</Button>
            </Drawer>
            <Drawer
                title="Оценка заявки"
                placement="left"
                closable={true}
                onClose={() => setDrawerPrice(false)}
                open={drawerPrice}
                style={{fontSize:22}}
                getContainer={false}
            >
                <Typography.Title style={{fontWeight:400, fontSize:18, marginBottom:20}}>Напишите стоимость заявки</Typography.Title>
                <Flex gap={10}>

                    <ConfigProvider
                        theme={{
                            components: {
                            Input: {
                                activeBorderColor: '#e6cea4',
                                hoverBorderColor: '#e6cea4'
                            },
                            },
                        }}
                        >            
                        <Input style={{fontSize:18}} status={!Number(price) && "error"} value={price} onChange={() => setPrice(event.target.value)}></Input>
                    </ConfigProvider>
                    <Button onClick={evaluatedApp} style={{borderRadius:"7px"}}>Готово</Button>
                </Flex>
                <Typography>{priceError}</Typography>
            </Drawer>
        </Card>
    )
}