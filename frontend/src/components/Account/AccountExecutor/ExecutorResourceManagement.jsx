import { Layout, Typography, message, Flex, Tag, ConfigProvider, Input, Select, Space } from "antd"
import { Button } from "../../Button";
import { use, useEffect, useState } from "react";
import axios from "axios";
export function ExecutorResourceManagement() {
    const [resources, setResources] = useState([
      ]);
    const [displayEl, setDisplayEl] = useState('resource')
    const [select, setSelect] = useState("")
    const [addInputType, setAddInputType] = useState('')
    const [addInputCount, setAddInputCount] = useState()
    const [updateInputCount, setUpdateInputCount] = useState()
    const [error, setError] = useState('')
    useEffect(() =>{
        async function reloadResource() {
            try {
                const responce = await axios.get("http://localhost:3001/orderResources")
            setResources(responce.data)
            } catch (error) {
                console.log(error);
                
            }
            
        }
        reloadResource()
    }, [])

    function handleSelectChange(value){
        setSelect(value)
    }
    async function handleDeleteResource(resource) {
        try {
            await axios.delete(`http://localhost:3001/orderResources/${resource}`)
            setResources(prev => prev.filter(el => el.id !== resource))
        } catch (error) {
            console.log(error);
            
        }
    }
    async function handleAddResource() {
        if (!addInputType && !addInputCount) {
            setError('Введите ресурс и укажите количество для добавления');
            return;
        }
        else if (!addInputType){
            setError('Введите тип ресурса')
            return
        }
        else if (!addInputCount){
            setError('Укажите количество для ресурса')
            return
        }
        const resource = {
            name: addInputType,
            quantity: addInputCount
        }
        try {
            await axios.post(`http://localhost:3001/orderResources`, resource)
            setResources(prev => [...prev, resource]);
            setDisplayEl('resource')
            setAddInputCount('')
            setAddInputType('')
            setError('')
        } catch (error) {
            console.log(error);
            
        }
    }

    async function handleUpdateResource() {
        if (!select && !updateInputCount) {
            setError('Выберите ресурс и укажите количество для добавления');
            return;
        }
        else if (!select){
            setError('Выберите тип ресурса')
            return
        }
        else if (!updateInputCount){
            setError('Укажите новое количество для ресурса')
            return
        }
        try {
            console.log(select);
            const currentResource = await axios.get(`http://localhost:3001/orderResources`, {
                params: {
                    name: select
                }
            })
            console.log(currentResource);
            
            
            await axios.patch(`http://localhost:3001/orderResources/${currentResource.data[0].id}`, {
                quantity: updateInputCount
            })
            setResources(prev => prev.map(resource => 
                resource.id === currentResource.data[0].id 
                    ? { ...resource, quantity: Number(updateInputCount) }
                    : resource
            ));
            console.log(resources);
            
            setDisplayEl('resource')
            setUpdateInputCount('')
            setSelect('')
            setError('')
        } catch (error) {
            console.log(error);
            
        }
    }
    function handleChangeDisplay(params) {
        setDisplayEl(params)
        setError('')
    }
    
    return(
        <>
        <Typography.Title level={2}>Управление ресурсами</Typography.Title>
        {displayEl === 'resource' && <Typography.Title level={3} style={{fontWeight:400}}>Имеющиеся ресурсы</Typography.Title>}
        {displayEl === 'update' && <Typography.Title level={3} style={{fontWeight:400}}>Обновление ресуросов</Typography.Title>}
        {displayEl === 'add' && <Typography.Title level={3} style={{fontWeight:400}}>Добавление ресурсов</Typography.Title>}
        {displayEl === 'resource' && <table style={{width:"100%", fontSize:18}}>
          <thead>
            <tr>
              <th style={{width: '33%'}}>Название</th>
              <th style={{width: '33%'}}>Количество</th>
              <th style={{width: '33%'}}>Действие</th>
            </tr>
          </thead>
          <tbody>
            {resources && resources.map(resource => (
              <tr style={{paddingBottom:20}} key={resource.id}>
                <td style={{textAlign: 'center'}}>{resource.name}</td>
                <td style={{textAlign: 'center'}}>{resource.quantity}</td>
                <td style={{textAlign: 'center'}}>
                  <Button style={{}} onClick={() => handleDeleteResource(resource.id)}>Удалить</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
        {displayEl === 'update' && <div>
            <Flex style={{margin: '20px 0'}} gap={100}>
            <ConfigProvider
                    theme={{
                        components: {
                        Select: {
                            activeBorderColor: '#e2b932',
                            hoverBorderColor: '#e2b932'
                        },
                        },
                    }}
                    >
                    <Select
                        defaultValue="Выберите тип ресурса"

                        style={{
                            width: "60%",
                        }}
                        size="large"
                        onChange={handleSelectChange}   
                        options={resources.map(el =>({
                            id: el.id,
                            value: el.name
                          }))}
                        optionRender={(option) => (
                            <Space>
                            {option.data.value}
                            </Space>
                        )}
                    />
                </ConfigProvider>
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
                    <Input value={updateInputCount} onChange={() => setUpdateInputCount(event.target.value)} placeholder="Введите количество: " style={{fontSize:18, width: '30%'}} ></Input>
                </ConfigProvider>
            </Flex>
            <Typography style={{marginBottom:10, color:"red"}}>{error}</Typography>
            </div>}
        {displayEl === 'add' && <div>
            <Flex style={{margin: "20px 0"}} gap={100}>

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
                    <Input value={addInputType} onChange={() => setAddInputType(event.target.value)} placeholder="Введите тип ресурса: " style={{fontSize:18}} ></Input>
                </ConfigProvider>
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
                    <Input value={addInputCount}  onChange = {() => setAddInputCount(event.target.value)} placeholder="Введите количество: " style={{fontSize:18, width:"45%"}} ></Input>
                </ConfigProvider>
            </Flex>
            <Typography style={{marginBottom:10, color:"red"}}>{error}</Typography>
        </div>}
        <Flex gap={40}>
            {displayEl === 'resource' && 
                <>
                <Button onClick={() => handleChangeDisplay('update')} style={{padding: '0.7rem 1.2rem'}}>Обновить</Button>
                <Button onClick={() => setDisplayEl('add')}>Добавить</Button>
                </>
            }
            {displayEl === 'update' && 
                <>
                <Button onClick={() => handleChangeDisplay('resource')} style={{padding: '0.7rem 1.2rem'}}>Назад</Button>
                <Button onClick={() => handleUpdateResource()} isActive>Обновить</Button>
                </>
            }
            {displayEl === 'add' && 
                <>
                <Button onClick={() => handleChangeDisplay('resource')} style={{padding: '0.7rem 1.2rem'}}>Назад</Button>
                <Button onClick={() => handleAddResource()} isActive>Добавить</Button>
                </>
            }
            
        </Flex>
        </>
    )
}