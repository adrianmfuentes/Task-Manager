import React, { useEffect, useState, useCallback } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, DatePicker, Input, Row, Select, Typography } from "antd";
import { useTranslation } from 'react-i18next';
import '../Css/CreateTask.css'; 
import { formatTimestamp } from "../Utils";

const { Option } = Select;
const { Text } = Typography;

const CreateTaskComp = ({ createNotification }) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [task, setTask] = useState({
        title: "",
        description: "",
        priority: "medium",
        dateFinish: null,
    });
    const [error, setError] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();

    const checkInputErrors = useCallback(() => {
        let updatedErrors = {};

        if (touched.title && (!task.title || task.title.length < 2)) {
            updatedErrors.name = t("errorTitle");
        }

        if (touched.description && (!task.description || task.description.length < 5)) {
            updatedErrors.description = t("errorDescription");
        }

        if (touched.dateFinish && task.dateFinish && task.dateFinish < Date.now()) {
            updatedErrors.dateFinish = t("errorDateFinish");
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
            dateFinish: date ? formatTimestamp(date.valueOf()) : null
        }));
        setTouched((prevTouched) => ({ ...prevTouched, dateFinish: true }));
    };

    const clickCreate = async () => {
        if (Object.keys(error).length === 0) {
            try {
                const res = await fetch(`${backendUrl}/tasks?apiKey=${localStorage.getItem("apiKey")}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task),
                });

                if (res.ok) {
                    createNotification("success", t("taskCreated"));
                    navigate("/myTasks");
                } else {
                    const jsonData = await res.json();
                    setMessage(jsonData.error || t("errorCreatingTask"));
                }
            } catch {
                setMessage(t("errorCreatingTask"));
            }
        } else {
            setMessage(t("fixErrorsMessage"));
        }
    };

    const isButtonDisabled = !task.title || !task.dateFinish || Object.keys(error).length > 0;

    return (
        <Row align="middle" justify="center" className="row-container">
            {message && <Alert type="error" message={message} style={{ marginBottom: "10px" }} />}

            <Col xs={24} sm={20} md={16} lg={12}>
                <Card title={t("Create Task")} bordered={false} className="task-card">
                    <Input
                        size="large"
                        placeholder={t("taskTitle")}
                        aria-label={t("taskTitle")}
                        value={task.title}
                        onChange={(e) => changeProperty("title", e.target.value)}
                        required
                        className="input-field"
                    />
                    {error.name && <Text type="danger" className="error-message">{error.name}</Text>}

                    <Input.TextArea
                        size="large"
                        placeholder={t("taskDescription")}
                        aria-label={t("taskDescription")}
                        value={task.description}
                        onChange={(e) => changeProperty("description", e.target.value)}
                        required
                        className="input-field"
                    />
                    {error.description && <Text type="danger" className="error-message">{error.description}</Text>}

                    <Select
                        style={{ width: "100%" }}
                        size="large"
                        placeholder={t("selectPriority")}
                        aria-label={t("taskPriority")}
                        value={task.priority}
                        onChange={(value) => changeProperty("priority", value)}
                        className="input-field"
                    >
                        <Option value="low">{t("low")}</Option>
                        <Option value="medium">{t("medium")}</Option>
                        <Option value="high">{t("high")}</Option>
                    </Select>

                    <DatePicker
                        style={{ width: "100%" }}
                        size="large"
                        showTime
                        placeholder={t("selectDueDate")}
                        onChange={changeDate}
                        aria-label={t("taskDueDate")}
                        className="input-field"
                    />
                    {error.dateFinish && <Text type="danger" className="error-message">{error.dateFinish}</Text>}

                    <Button
                        type="primary"
                        aria-label={t("createTask")}
                        onClick={clickCreate}
                        block
                        disabled={isButtonDisabled}
                        className="primary-button"
                    >
                        {t("Create task")}
                    </Button>
                </Card>
            </Col>
        </Row>
    );
};

export default React.memo(CreateTaskComp);
