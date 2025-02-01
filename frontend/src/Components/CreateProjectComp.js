import React, { useEffect, useState, useCallback } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { isEmpty } from "lodash";
import { Alert, Button, Card, Col, Input, Row, Typography, List, DatePicker } from "antd";
import '../Css/CreateProject.css'; 
import { formatTimestamp } from "../Utils";

const { Text } = Typography;

const CreateProjectComp = ({ createNotification }) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [project, setProject] = useState({
        title: "",
        description: "",
        dateFinish: null,
        subtasks: [],
    });
    const [error, setError] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();

    const checkInputErrors = useCallback(() => {
        const updatedErrors = {};
        if (touched.title && (!project.title || project.title.length < 2)) {
            updatedErrors.title = t("errorTitle");
        }
        if (touched.description && (!project.description || project.description.length < 5)) {
            updatedErrors.description = t("errorDescription");
        }
        if (project.dateFinish && project.dateFinish < Date.now()) {
            updatedErrors.dateFinish = t("errorDateFinish");
        }
        setError(updatedErrors);
    }, [project, touched, t]);

    useEffect(() => {
        checkInputErrors();
    }, [project, checkInputErrors]);

    const changeProperty = (propertyName, value) => {
        setProject((prevProject) => ({
            ...prevProject,
            [propertyName]: value,
        }));
        setTouched((prevTouched) => ({
            ...prevTouched,
            [propertyName]: true,
        }));
    };

    const changeDate = (date) => {
        setProject((prevProject) => ({
            ...prevProject,
            dateFinish: date ? formatTimestamp(date.valueOf()) : null,
        }));
        setTouched((prevTouched) => ({
            ...prevTouched,
            dateFinish: true,
        }));
    };

    const addSubtask = () => {
        setProject((prevProject) => ({
            ...prevProject,
            subtasks: [...prevProject.subtasks, { task: "", created_at: null }],
        }));
    };

    const changeSubtask = (index, value) => {
        const updatedSubtasks = [...project.subtasks];
        updatedSubtasks[index].task = value;
        setProject((prevProject) => ({
            ...prevProject,
            subtasks: updatedSubtasks,
        }));
    };

    const checkButtonDisabled = () => {
        return !project.title || !project.dateFinish || !isEmpty(error);
    };

    const clickCreate = async () => {
        if (isEmpty(error)) {
            try {
                const res = await fetch(`${backendUrl}/projects?apiKey=${localStorage.getItem("apiKey")}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(project),
                });
                if (res.ok) {
                    createNotification("success", t("projectCreated"));
                    navigate("/myProjects");
                } else {
                    const jsonData = await res.json();
                    setMessage(jsonData.error);
                }
            } catch {
                setMessage(t("errorCreatingProject"));
            }
        } else {
            setMessage(t("fixErrorsMessage"));
        }
    };

    return (
        <Row align="middle" justify="center" className="row-container">
            {message && <Alert type="error" message={message} style={{ marginBottom: "10px" }} />}

            <Col xs={24} sm={20} md={16} lg={12}>
                <Card title={t("Create Project")} bordered={false} className="project-card">
                    <Input
                        size="large"
                        type="text"
                        placeholder={t("projectTitle")}
                        value={project.title}
                        onChange={(e) => changeProperty("title", e.target.value)}
                        aria-label={t("projectTitle")}
                        required
                        className="input-field"
                    />
                    {error.title && <Text type="danger" className="error-message">{error.title}</Text>}

                    <Input.TextArea
                        size="large"
                        placeholder={t("projectDescription")}
                        value={project.description}
                        onChange={(e) => changeProperty("description", e.target.value)}
                        aria-label={t("projectDescription")}
                        required
                        className="input-field"
                    />
                    {error.description && <Text type="danger" className="error-message">{error.description}</Text>}

                    <DatePicker
                        style={{ marginTop: "10px", width: "100%" }}
                        size="large"
                        showTime
                        placeholder={t("selectDueDate")}
                        onChange={changeDate}
                        aria-label={t("projectDueDate")}
                    />
                    {error.dateFinish && <Text type="danger" className="error-message">{error.dateFinish}</Text>}

                    <Button
                        type="dashed"
                        onClick={addSubtask}
                        className="input-field"
                    >
                        {t("Add subtask")}
                    </Button>

                    <List
                        bordered
                        dataSource={project.subtasks}
                        renderItem={(subtask, index) => (
                            <List.Item key={index}>
                                <Input
                                    placeholder={`${t("subtask")} ${index + 1}`}
                                    value={subtask.task}
                                    onChange={(e) => changeSubtask(index, e.target.value)}
                                    aria-label={`${t("subtask")} ${index + 1}`}
                                    style={{ width: '100%', marginRight: '10px' }}
                                />
                            </List.Item>
                        )}
                        style={{ marginTop: "10px" }}
                    />

                    <Button
                        type="primary"
                        onClick={clickCreate}
                        block
                        disabled={checkButtonDisabled()}
                        className="primary-button"
                    >
                        {t("createProject")}
                    </Button>
                </Card>
            </Col>
        </Row>
    );
};

export default React.memo(CreateProjectComp);
