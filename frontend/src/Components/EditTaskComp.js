import dayjs from "dayjs";
import React, { useEffect, useState, useCallback } from "react";
import { backendUrl } from "../Globals";
import { Alert, Button, Card, Col, DatePicker, Input, Row, Select, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import '../Css/EditTask.css';

const { Option } = Select;
const { Text } = Typography;

const EditTaskComp = ({ createNotification }) => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [task, setTask] = useState({ title: "", description: "", priority: "medium", dateFinish: null });
    const [message, setMessage] = useState("");
    const [error, setError] = useState({});
    const [touched, setTouched] = useState({});

    const fetchTask = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/tasks/${taskId}?apiKey=${localStorage.getItem("apiKey")}`);
            if (response.ok) {
                const data = await response.json();
                setTask({
                    title: data.title || "",
                    description: data.description || "",
                    priority: data.priority || "medium",
                    dateFinish: data.dateFinish ? dayjs(data.dateFinish) : null,
                });
            } else {
                setMessage(t("errorFetchingTask"));
            }
        } catch {
            setMessage(t("failedToFetchTaskData"));
        }
    }, [taskId, t]);

    useEffect(() => {
        fetchTask();
    }, [fetchTask]);

    const checkInputErrors = useCallback(() => {
        const updatedErrors = {};
        if (touched.title && (!task.title || task.title.length < 2)) {
            updatedErrors.title = t("taskErrorTitle");
        }
        if (touched.description && (!task.description || task.description.length < 5)) {
            updatedErrors.description = t("taskErrorDescription");
        }
        if (touched.dateFinish && task.dateFinish && task.dateFinish.isBefore(dayjs())) {
            updatedErrors.dateFinish = t("taskErrorDateFinish");
        }
    
        setError(updatedErrors);
    }, [task, touched, t]);

    useEffect(() => {
        checkInputErrors();
    }, [task, checkInputErrors]);

    const changeProperty = (propertyName, value) => {
        setTask((prevTask) => ({ ...prevTask, [propertyName]: value }));
        setTouched((prevTouched) => ({ ...prevTouched, [propertyName]: true }));
    };

    const changeDate = (date) => { 
        setTask((prevTask) => ({
            ...prevTask,
            dateFinish: date ? dayjs(date) : null
        }));
        setTouched((prevTouched) => ({ ...prevTouched, dateFinish: true }));
    };

    const clickEdit = async () => {
        if (Object.keys(error).length === 0) {
            try {
                const taskToSend = {
                    ...task,
                    dateFinish: task.dateFinish ? dayjs(task.dateFinish).format('YYYY-MM-DD HH:mm:ss') : null,
                };

                const res = await fetch(`${backendUrl}/tasks/${taskId}?apiKey=${localStorage.getItem("apiKey")}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskToSend),
                });

                if (res.ok) {
                    createNotification("success", t("taskUpdatedSuccessfully"));
                    navigate("/myTasks");
                } else {
                    const jsonData = await res.json();
                    setMessage(jsonData.error || t("failedToUpdateTask"));
                }
            } catch {
                setMessage(t("errorUpdatingTask"));
            }
        } else {
            setMessage(t("fixErrorsMessage"));
        }
    };

    const isButtonDisabled = !task.title || !task.dateFinish || Object.keys(error).length > 0;

    return (
        <Row align="middle" justify="center" className="edit-task-container">
            {message && <Alert type="error" message={message} className="alert-message" />}

            <Col xs={24} sm={20} md={16} lg={12}>
                <Card title={t("Edit Task")} bordered={false}>
                    
                    {/* Task Title Input */}
                    <Input
                        size="large"
                        placeholder={t("taskTitle")}
                        value={task.title}
                        onChange={(e) => changeProperty("title", e.target.value)}
                        aria-label="Task Title"
                        className="input-field"
                    />
                    {error.title && <Text type="danger" className="error-text">{error.title}</Text>}

                    {/* Task Description Input */}
                    <Input.TextArea
                        style={{ marginTop: "10px" }}
                        size="large"
                        placeholder={t("taskDescription")}
                        value={task.description}
                        onChange={(e) => changeProperty("description", e.target.value)}
                        aria-label="Task Description"
                        className="input-field"
                    />
                    {error.description && <Text type="danger" className="error-text">{error.description}</Text>}

                    {/* Task Priority Select */}
                    <Select
                        style={{ marginTop: "10px", width: "100%" }}
                        size="large"
                        value={task.priority}
                        onChange={(value) => changeProperty("priority", value)}
                        aria-label="Task Priority"
                        className="input-field"
                    >
                        <Option value="low">{t("low")}</Option>
                        <Option value="medium">{t("medium")}</Option>
                        <Option value="high">{t("high")}</Option>
                    </Select>

                    {/* Due Date Picker */}
                    <DatePicker
                        style={{ marginTop: "10px", width: "100%" }}
                        size="large"
                        showTime
                        value={task.dateFinish}
                        onChange={changeDate}
                        aria-label="Due Date"
                        className="input-field"
                    />
                    {error.dateFinish && <Text type="danger" className="error-text">{error.dateFinish}</Text>}

                    {/* Edit Task Button */}
                    <Button
                        className="edit-task-button"
                        type="primary"
                        onClick={clickEdit}
                        block
                        disabled={isButtonDisabled}
                    >
                        {t("Edit task")}
                    </Button>
                </Card>
            </Col>
        </Row>
    );
}

export default React.memo(EditTaskComp);
