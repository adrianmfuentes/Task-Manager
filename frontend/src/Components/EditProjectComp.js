import React, { useState, useEffect, useCallback } from "react";
import { backendUrl } from "../Globals";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Col, Input, Row, List, DatePicker, Typography } from "antd";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { useTranslation } from 'react-i18next';
import '../Css/EditProject.css'; 
import { formatTimestamp } from "../Utils";

const { Text } = Typography;

const EditProjectComp = ({ createNotification }) => {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const [project, setProject] = useState({ name: "", description: "", dateFinish: null, subtasks: [] });
    const [message, setMessage] = useState("");
    const [error, setError] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();

    // Obtener detalles del proyecto por ID
    const fetchProject = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/projects/${projectId}?apiKey=${localStorage.getItem("apiKey")}`);
            if (response.ok) {
                const data = await response.json();
                setProject({
                    name: data.title || "",
                    description: data.description || "",
                    dateFinish: data.dateFinish ? dayjs(data.dateFinish) : null, 
                    subtasks: data.subtasks || []
                });
            } else {
                setMessage(t('errorFetchingProject'));
            }
        } catch (error) {
            setMessage(t('failedToFetchProjectData'));
        }
    }, [projectId, t]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    // Validar campos de entrada
    const checkInputErrors = useCallback(() => {
        const updatedErrors = {};
        if (touched.name && (!project.name || project.name.length < 2)) {
            updatedErrors.name = t('projectErrorTitle');
        }
        if (touched.description && (!project.description || project.description.length < 5)) {
            updatedErrors.description = t('projectErrorDescription');
        }
        if (touched.dateFinish) {
            if (project.dateFinish && !dayjs.isDayjs(project.dateFinish)) {
                updatedErrors.dateFinish = t('invalidDueDate');
            } else if (project.dateFinish && project.dateFinish.isBefore(dayjs())) {
                updatedErrors.dateFinish = t('projectErrorDateFinish');
            }
        }
        setError(updatedErrors);
    }, [project, touched, t]);

    useEffect(() => {
        checkInputErrors();
    }, [project, checkInputErrors]);

    // Cambiar propiedad del proyecto
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

    // Cambiar fecha de vencimiento
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

    // Cambiar subtarea
    const changeSubtask = (index, value) => {
        const updatedSubtasks = [...project.subtasks];
        updatedSubtasks[index].task = value;
        setProject((prevProject) => ({
            ...prevProject,
            subtasks: updatedSubtasks,
        }));
    };

    // Agregar nueva subtarea
    const addSubtask = () => {
        setProject((prevProject) => ({
            ...prevProject,
            subtasks: [...prevProject.subtasks, { task: "", created_at: null }],
        }));
    };

    // Manejar la edición del proyecto
    const clickEdit = async () => {
        if (isEmpty(error)) {
            try {
                const projectToSend = {
                    ...project,
                    dateFinish: project.dateFinish ? dayjs(project.dateFinish).format('YYYY-MM-DD HH:mm:ss') : null
                };

                const res = await fetch(`${backendUrl}/projects/${projectId}?apiKey=${localStorage.getItem("apiKey")}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(projectToSend),
                });

                if (res.ok) {
                    createNotification("success", t('projectUpdatedSuccessfully'));
                    navigate("/myProjects");
                } else {
                    const jsonData = await res.json();
                    setMessage(jsonData.error || t('failedToUpdateProject'));
                }
            } catch {
                setMessage(t('errorUpdatingProject'));
            }
        } else {
            setMessage(t('fixErrorsMessage'));
        }
    };

    // Condición para deshabilitar el botón
    const isButtonDisabled = !project.name || !project.dateFinish || !isEmpty(error);

    return (
        <Row align="middle" justify="center" className="edit-project-container">
            {message && <Alert type="error" message={message} className="alert-message" />}

            <Col xs={24} sm={20} md={16} lg={12}>
                <Card title={t('Edit Project')} bordered={false}>
                    <h2 className="edit-project-title">{t('Edit project')}</h2>

                    <Input
                        className="input-field"
                        size="large"
                        placeholder={t('projectTitle')}
                        value={project.name}
                        onChange={(e) => changeProperty("name", e.target.value)}
                        aria-label={t('projectTitle')}
                    />
                    {error.name && <Text type="danger" className="error-text">{error.name}</Text>}

                    <Input.TextArea
                        className="input-field"
                        size="large"
                        placeholder={t('projectDescription')}
                        value={project.description}
                        onChange={(e) => changeProperty("description", e.target.value)}
                        aria-label={t('projectDescription')}
                    />
                    {error.description && <Text type="danger" className="error-text">{error.description}</Text>}

                    <DatePicker
                        className="input-field"
                        style={{ width: "100%" }}
                        size="large"
                        showTime
                        value={project.dateFinish ? project.dateFinish : null}
                        onChange={changeDate}
                        aria-label={t('selectDueDate')}
                    />
                    {error.dateFinish && <Text type="danger" className="error-text">{error.dateFinish}</Text>}

                    <Button
                        type="dashed"
                        onClick={addSubtask}
                        className="add-subtask-button"
                    >
                        {t('Add subtask')}
                    </Button>

                    <List
                        bordered
                        dataSource={project.subtasks}
                        renderItem={(subtask, index) => (
                            <List.Item key={index}>
                                <Input
                                    placeholder={`${t('subtask')} ${index + 1}`}
                                    value={subtask.task}
                                    onChange={(e) => changeSubtask(index, e.target.value)}
                                    style={{ width: "100%" }}
                                    aria-label={`${t('subtask')} ${index + 1}`}
                                />
                            </List.Item>
                        )}
                        style={{ marginTop: "10px" }}
                    />

                    <Button
                        className="edit-project-button"
                        type="primary"
                        onClick={clickEdit}
                        block
                        disabled={isButtonDisabled}
                    >
                        {t('Edit project')}
                    </Button>
                </Card>
            </Col>
        </Row>
    );
};

export default React.memo(EditProjectComp);
