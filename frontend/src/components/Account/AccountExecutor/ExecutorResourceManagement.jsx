import { Layout, Typography, message, Flex, Tag, ConfigProvider, Input, Select, Space, Form, InputNumber } from "antd"
import { Button } from "../../Button";
import { useEffect, useState } from "react";
import axios from "axios";
// Импортируем useTRPS для получения currentUser
import { useTRPS } from "../../../../context";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"; // Для Form.List


// Опции для выбора типа ресурса (должны совпадать с теми, что указываются отделом)
const RESOURCE_TYPES_OPTIONS = [
    { value: 'Токарный станок', label: 'Токарный станок' },
    { value: 'Фрезерный станок', label: 'Фрезерный станок' },
    { value: 'Сверлильный станок', label: 'Сверлильный станок' },
    { value: 'Шлифовальный станок', label: 'Шлифовальный станок' },
    { value: 'Гидравлический пресс', label: 'Гидравлический пресс' },
    { value: 'Лазерная резка', label: 'Лазерная резка' },
    { value: 'Сварочное оборудование', label: 'Сварочное оборудование' },
    { value: 'Покрасочная камера', label: 'Покрасочная камера' },
];


export function ExecutorResourceManagement() {
    const { currentUser } = useTRPS();
    const [resources, setResources] = useState([]); // Состояние для списка ресурсов
    const [loading, setLoading] = useState(true); // Состояние загрузки ресурсов
    const [displayMode, setDisplayMode] = useState('view'); // Режим отображения: 'view', 'add', 'edit'

    const [addForm] = Form.useForm(); // Форма для добавления ресурса
    const [editForm] = Form.useForm(); // Форма для редактирования ресурса (если будем использовать отдельную форму)
    const [editingResource, setEditingResource] = useState(null); // Ресурс, который редактируется

    useEffect(() => {
        // Загружаем ресурсы при монтировании компонента или изменении currentUser
        async function fetchResources() {
            if (currentUser && currentUser.role === 'executor') {
                setLoading(true);
                try {
                    const response = await axios.get("http://localhost:8000/resources/my-manufacture/");
                    setResources(response.data);
                    console.log("Fetched executor resources:", response.data);
                } catch (error) {
                    console.error('Error fetching resources:', error);
                    message.error('Не удалось загрузить ресурсы.');
                    setResources([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResources([]);
                setLoading(false);
            }
        }
        fetchResources();
    }, [currentUser]); // Зависимость от currentUser

    // Обработчик удаления ресурса
    async function handleDeleteResource(resourceId) {
        if (!window.confirm('Вы уверены, что хотите удалить этот ресурс?')) {
            return;
        }
        try {
            // Отправляем DELETE запрос к бэкенду
            await axios.delete(`http://localhost:8000/resources/${resourceId}`);
            // Обновляем локальное состояние, удаляя ресурс из списка
            setResources(prev => prev.filter(res => res.id !== resourceId));
            message.success('Ресурс успешно удален!');
        } catch (error) {
            console.error('Error deleting resource:', error);
            let errorMessage = 'Не удалось удалить ресурс.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = `Ошибка: ${error.response.data.detail}`;
            }
            message.error(errorMessage);
        }
    }

    // Обработчик добавления нового ресурса
    async function handleAddResource(values) {
        console.log("Adding new resource with values:", values);
        try {
            // Отправляем POST запрос к бэкенду
            const response = await axios.post("http://localhost:8000/resources/", new URLSearchParams(values));
            // Добавляем новый ресурс в локальное состояние
            setResources(prev => [...prev, response.data]);
            message.success('Ресурс успешно добавлен!');
            addForm.resetFields(); // Очищаем поля формы
            setDisplayMode('view'); // Возвращаемся в режим просмотра
        } catch (error) {
            console.error('Error adding resource:', error);
            let errorMessage = 'Не удалось добавить ресурс.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = `Ошибка: ${error.response.data.detail}`;
            }
            message.error(errorMessage);
        }
    }

    // Обработчик обновления существующего ресурса
    async function handleUpdateResource(values) {
        console.log("Updating resource with values:", values, "for resource ID:", editingResource.id);
        if (!editingResource) return; // Проверка, что редактируем что-то

        try {
            // Отправляем PATCH запрос к бэкенду
            const response = await axios.patch(`http://localhost:8000/resources/${editingResource.id}`, values);
            // Обновляем ресурс в локальном состоянии
            setResources(prev => prev.map(res =>
                res.id === editingResource.id ? response.data : res
            ));
            message.success('Ресурс успешно обновлен!');
            setEditingResource(null); // Сбрасываем редактируемый ресурс
            setDisplayMode('view'); // Возвращаемся в режим просмотра
        } catch (error) {
            console.error('Error updating resource:', error);
            let errorMessage = 'Не удалось обновить ресурс.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = `Ошибка: ${error.response.data.detail}`;
            }
            message.error(errorMessage);
        }
    }

    // Функция для переключения режима отображения
    function handleChangeDisplay(mode, resourceToEdit = null) {
        setDisplayMode(mode);
        if (mode === 'add') {
            addForm.resetFields(); // Очищаем форму добавления
        } else if (mode === 'edit' && resourceToEdit) {
            setEditingResource(resourceToEdit);
            editForm.setFieldsValue(resourceToEdit); // Заполняем форму редактирования
        } else {
            setEditingResource(null);
        }
    }

    if (loading) {
        return <Typography.Text>Загрузка ресурсов...</Typography.Text>;
    }

    return(
        <>
            <Typography.Title level={2}>Управление ресурсами</Typography.Title>
            {displayMode === 'view' && <Typography.Title level={3} style={{fontWeight:400}}>Имеющиеся ресурсы</Typography.Title>}
            {displayMode === 'edit' && <Typography.Title level={3} style={{fontWeight:400}}>Обновление ресурса</Typography.Title>}
            {displayMode === 'add' && <Typography.Title level={3} style={{fontWeight:400}}>Добавление ресурса</Typography.Title>}

            {displayMode === 'view' && (
                <>
                    <table style={{width:"100%", fontSize:18}}>
                        <thead>
                            <tr>
                                <th style={{width: '33%', textAlign: 'left', paddingBottom: '10px'}}>Название</th>
                                <th style={{width: '33%', textAlign: 'left', paddingBottom: '10px'}}>Готовность (часов)</th>
                                <th style={{width: '33%', textAlign: 'left', paddingBottom: '10px'}}>Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.length > 0 ? (
                                resources.map(resource => (
                                    <tr key={resource.id} style={{paddingBottom:20}}>
                                        <td style={{textAlign: 'left', paddingTop: '10px'}}>{resource.type_resource}</td>
                                        <td style={{textAlign: 'left', paddingTop: '10px'}}>{resource.ready_time}</td>
                                        <td style={{textAlign: 'left', paddingTop: '10px'}}>
                                            <Flex gap={10}>
                                                <Button onClick={() => handleChangeDisplay('edit', resource)} style={{padding: '0.5rem 1rem'}}>Редактировать</Button>
                                                <Button onClick={() => handleDeleteResource(resource.id)} style={{padding: '0.5rem 1rem'}}>Удалить</Button>
                                            </Flex>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{textAlign: 'center', paddingTop: '20px'}}>Нет ресурсов. Добавьте новые!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Flex gap={40} style={{marginTop: '20px'}}>
                        <Button onClick={() => handleChangeDisplay('add')} style={{padding: '0.7rem 1.2rem'}} isActive={true}>
                            Добавить ресурс
                        </Button>
                    </Flex>
                </>
            )}

            {displayMode === 'add' && (
                <Form form={addForm} onFinish={handleAddResource} autoComplete="off">
                    <Form.Item
                        name="type_resource"
                        label="Тип ресурса"
                        rules={[{ required: true, message: 'Выберите тип ресурса!' }]}
                        style={{ marginBottom: 20 }}
                    >
                        <Select placeholder="Выберите тип ресурса" options={RESOURCE_TYPES_OPTIONS} size="large" />
                    </Form.Item>
                    <Form.Item
                        name="ready_time"
                        label="Время готовности (часов)"
                        rules={[{ required: true, message: 'Укажите время готовности!' }, { type: 'number', min: 0, message: 'Минимум 0' }]}
                        style={{ marginBottom: 20 }}
                    >
                        <InputNumber placeholder="Введите время" min={0} size="large" style={{width: '100%'}}/>
                    </Form.Item>
                    <Flex gap={10}>
                        <Button onClick={() => handleChangeDisplay('view')} style={{padding: '0.7rem 1.2rem'}}>Назад</Button>
                        <Button type="primary" htmlType="submit" isActive={true}>Добавить</Button>
                    </Flex>
                </Form>
            )}

            {displayMode === 'edit' && editingResource && (
                <Form form={editForm} onFinish={handleUpdateResource} autoComplete="off">
                    <Form.Item
                        name="type_resource"
                        label="Тип ресурса"
                        rules={[{ required: true, message: 'Выберите тип ресурса!' }]}
                        style={{ marginBottom: 20 }}
                    >
                        <Select placeholder="Выберите тип ресурса" options={RESOURCE_TYPES_OPTIONS} size="large" />
                    </Form.Item>
                    <Form.Item
                        name="ready_time"
                        label="Время готовности (часов)"
                        rules={[{ required: true, message: 'Укажите время готовности!' }, { type: 'number', min: 0, message: 'Минимум 0' }]}
                        style={{ marginBottom: 20 }}
                    >
                        <InputNumber placeholder="Введите время" min={0} size="large" style={{width: '100%'}}/>
                    </Form.Item>
                    <Flex gap={10}>
                        <Button onClick={() => handleChangeDisplay('view')} style={{padding: '0.7rem 1.2rem'}}>Назад</Button>
                        <Button type="primary" htmlType="submit" isActive={true}>Сохранить изменения</Button>
                    </Flex>
                </Form>
            )}
        </>
    )
}