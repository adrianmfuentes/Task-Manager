import React, { useEffect, useState, useCallback } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import { Button, Card, List } from "antd";
import { DeleteOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons"; 
import { convertDateTimeToReadableFormat } from "../Utils";
import { useTranslation } from 'react-i18next'; // Importa el hook useTranslation
import '../Css/ViewTasks.css'; 

const TasksComp = ({ createNotification }) => {
    const { t } = useTranslation(); // Inicializa el hook de traducción
    const [tasks, setTasks] = useState([]); // Estado para almacenar las tareas
    const [messageText, setMessageText] = useState(""); // Estado para mensajes de error
    const navigate = useNavigate(); // Hook para navegación

    // Obtener tareas del backend
    const getItems = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/tasks?apiKey=${localStorage.getItem("apiKey")}`);
            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (response.ok) {
                const jsonData = await response.json();
                setTasks(jsonData); // Actualizar el estado con las tareas
            } else {
                const jsonData = await response.json();
                setMessageText(jsonData.error);
            }
        } catch (error) {
            setMessageText(t("Failed to fetch tasks. Please try again.")); // Usa la traducción
        }
    }, [navigate, t]);

    useEffect(() => {
        getItems(); // Obtener las tareas cuando se monta el componente
    }, [getItems]);

    // Navegar a la página de edición de tareas
    const moveToEditTask = (id) => {
        navigate(`/task/edit/${id}`);
    };

    // Eliminar tarea
    const deleteTask = async (id) => {
        try {
            const res = await fetch(`${backendUrl}/tasks/${id}?apiKey=${localStorage.getItem("apiKey")}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
                createNotification("success", t("Task deleted")); // Usa la traducción
                setMessageText(""); 
            } else {
                const jsonData = await res.json();
                setMessageText(jsonData.error || t("Failed to delete task. Please try again.")); // Usa la traducción
            }
        } catch (error) {
            setMessageText(t("Failed to delete task. Please try again.")); // Usa la traducción
        }
    };

    // Completar tarea
    const completeTask = async (id) => {
        try {
            const res = await fetch(`${backendUrl}/tasks/${id}?apiKey=${localStorage.getItem("apiKey")}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "completed" }),
            });

            if (res.ok) {
                createNotification("success", t("Task marked as completed")); // Usa la traducción
                getItems(); // Refrescar lista de tareas
            } else {
                const jsonData = await res.json();
                setMessageText(jsonData.error);
            }
        } catch (error) {
            setMessageText(t("Failed to mark task as completed. Please try again.")); // Usa la traducción
        }
    };

    return (
        <div role="main" className="tasks-container">
            {/* Encabezado accesible */}
            <Card
                className="tasks-header"
                tabIndex={0} // Asegurar navegación por teclado
                aria-label="Task List Header"
            >
                {t("My Tasks")} {/* Usa la traducción */}
            </Card>

            {/* Mensaje de error accesible */}
            {messageText && <h3 aria-live="assertive" className="error-message">{messageText}</h3>}

            {/* Lista de tareas responsiva */}
            <List
                className="task-list"
                grid={{
                    gutter: 16,
                    xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 4, 
                }}
                dataSource={tasks}
                renderItem={(task) => (
                    <List.Item>
                        <Card
                            hoverable
                            title={task.title}
                            aria-label={`Task: ${task.title}`}
                            className="task-card"
                        >
                            {/* Descripción */}
                            <p className="task-description">
                                <strong>{t("Description:")}</strong> {task.description} {/* Usa la traducción */}
                            </p>

                            {/* Fecha de vencimiento */}
                            <p className="due-date">
                                <strong>{t("Due Date:")}</strong> {convertDateTimeToReadableFormat(task.dateFinish)} {/* Usa la traducción */}
                            </p>

                            {/* Botones de acción */}
                            <div className="task-actions">
                                <Button
                                    onClick={() => completeTask(task.id)}
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    aria-label={`Mark ${task.title} as completed`}
                                    className="task-action-button"
                                >
                                    {t("Complete")} {/* Usa la traducción */}
                                </Button>
                                <Button
                                    onClick={() => moveToEditTask(task.id)}
                                    icon={<EditOutlined />}
                                    aria-label={`Edit ${task.title}`}
                                    className="task-action-button"
                                >
                                    {t("Edit")} {/* Usa la traducción */}
                                </Button>
                                <Button
                                    onClick={() => deleteTask(task.id)}
                                    icon={<DeleteOutlined />}
                                    danger
                                    aria-label={`Delete ${task.title}`}
                                    className="task-action-button"
                                >
                                    {t("Delete")} {/* Usa la traducción */}
                                </Button>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default React.memo(TasksComp);
