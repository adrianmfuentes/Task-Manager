import React, { useEffect, useState } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import { emailPattern } from "../Utils";
import { Button, Card, Col, Input, Row } from "antd";
import { useTranslation } from 'react-i18next'; // Importar hook de traducción
import '../Css/LoginUser.css'; 

const LoginUserComp = ({ setLogin, createNotification }) => {
    const { t } = useTranslation(); // Usar el hook para obtener traducciones

    const [email, setEmail] = useState(""); // Email input state
    const [password, setPassword] = useState(""); // Password input state
    const [, setMessage] = useState(""); // State to display error messages
    const [, setError] = useState({}); // State to track validation errors

    const navigate = useNavigate(); // Hook para la navegación

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password,]);

    const checkInputErrors = () => {
        let updatedErrors = {};

        if (!email || email.length < 3 || !emailPattern.test(email)) {
            updatedErrors.email = t("incorrectEmailFormat"); 
        }

        if (!password || password.length < 5) {
            updatedErrors.password = t("passwordTooShort"); 
        }

        setError(updatedErrors);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleLoginClick = async () => {
        const res = await fetch(`${backendUrl}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            const jsonData = await res.json();
            if (jsonData.apiKey) {
                localStorage.setItem("apiKey", jsonData.apiKey);
                localStorage.setItem("userId", jsonData.id);
                localStorage.setItem("email", jsonData.email);
            }

            setLogin(true); 
            navigate("/myTasks"); 
        } else {
            const jsonData = await res.json();
            setMessage(jsonData.error);
            createNotification(jsonData.error);
        }
    };

    return (
        <Row align="middle" justify="center" className="login-user-container">
            <Col xs={24} sm={20} md={16} lg={10} xl={8}> 
                <Card title={t("Login")} className="login-card">
                    <Input
                        className="login-input"
                        size="large"
                        type="text"
                        placeholder={t("emailPlaceholder")}
                        onChange={handleEmailChange} 
                    />
                    <Input
                        className="login-input"
                        size="large"
                        type="password" 
                        placeholder={t("passwordPlaceholder")}
                        onChange={handlePasswordChange} 
                    />
                    <Button
                        className="login-button"
                        type="primary"
                        onClick={handleLoginClick} 
                        block
                        disabled={!email || !password} 
                    >
                        {t("Login")} 
                    </Button>
                </Card>
            </Col>
        </Row>
    );
};

export default React.memo(LoginUserComp);
