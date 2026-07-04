import React, { useEffect, useState, useCallback } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import { emailPattern } from "../Utils";
import { Alert, Button, Card, Col, Input, Row, Typography } from "antd";
import { useTranslation } from 'react-i18next'; // Importar hook de traducción
import '../Css/LoginUser.css';

const { Text } = Typography;

const LoginUserComp = ({ setLogin, createNotification }) => {
    const { t } = useTranslation(); // Usar el hook para obtener traducciones

    const [email, setEmail] = useState(""); // Email input state
    const [password, setPassword] = useState(""); // Password input state
    const [message, setMessage] = useState(""); // State to display error messages
    const [error, setError] = useState({}); // State to track validation errors
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // Hook para la navegación

    const checkInputErrors = useCallback(() => {
        let updatedErrors = {};

        if (email && (email.length < 3 || !emailPattern.test(email))) {
            updatedErrors.email = t("incorrectEmailFormat");
        }

        if (password && password.length < 5) {
            updatedErrors.password = t("passwordTooShort");
        }

        setError(updatedErrors);
    }, [email, password, t]);

    const handleLoginClick = useCallback(async () => {
        if (!email || !password || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const jsonData = await res.json();

            if (res.ok) {
                if (jsonData.apiKey) {
                    localStorage.setItem("apiKey", jsonData.apiKey);
                    localStorage.setItem("userId", jsonData.id);
                    localStorage.setItem("email", jsonData.email);
                }

                setLogin(true);
                navigate("/myTasks");
            } else {
                const errorMessage = Array.isArray(jsonData.error) ? jsonData.error.join(" ") : jsonData.error;
                setMessage(errorMessage);
                createNotification("error", errorMessage);
            }
        } catch (e) {
            setMessage(t("errorLoggingIn"));
        } finally {
            setLoading(false);
        }
    }, [email, password, loading, navigate, setLogin, createNotification, t]);

    useEffect(() => {
        checkInputErrors();

        const handleKeyDown = (event) => {
            if (event.key === "Enter") {
                handleLoginClick();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [checkInputErrors, handleLoginClick]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    return (
        <Row align="middle" justify="center" className="login-user-container">
            <Col xs={24} sm={20} md={16} lg={10} xl={8}>
                <Card title={t("Login")} className="login-card">
                    {message && <Alert type="error" message={message} style={{ marginBottom: "10px" }} />}

                    <Input
                        className="login-input"
                        size="large"
                        type="text"
                        placeholder={t("emailPlaceholder")}
                        value={email}
                        onChange={handleEmailChange}
                        aria-label={t("emailPlaceholder")}
                    />
                    {error.email && <Text type="danger" className="error-message">{error.email}</Text>}

                    <Input
                        className="login-input"
                        size="large"
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        value={password}
                        onChange={handlePasswordChange}
                        aria-label={t("passwordPlaceholder")}
                    />
                    {error.password && <Text type="danger" className="error-message">{error.password}</Text>}

                    <Button
                        className="login-button"
                        type="primary"
                        onClick={handleLoginClick}
                        block
                        loading={loading}
                        disabled={!email || !password || Object.keys(error).length > 0}
                    >
                        {t("Login")}
                    </Button>
                </Card>
            </Col>
        </Row>
    );
};

export default React.memo(LoginUserComp);
