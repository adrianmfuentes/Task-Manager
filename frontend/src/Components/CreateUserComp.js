import React, { useState, useEffect } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import { emailPattern } from "../Utils";
import { Button, Card, Col, Input, Row, Typography, Alert } from "antd";
import { useTranslation } from "react-i18next";
import '../Css/CreateUser.css'; 

const CreateUserComp = (props) => {
  const { t } = useTranslation();
  const { createNotification } = props;

  // State variables for email, password, messages, and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState({});

  const navigate = useNavigate();

  // Validate inputs and set errors
  const validateInputs = (email, password) => {
    const errors = {};
    if (email !== "" && (!email || email.length < 3 || !emailPattern.test(email))) {
      errors.email = t("incorrectEmailFormat");
    }
    if (password !== "" && (!password || password.length < 5)) {
      errors.password = t("passwordTooShort");
    }
    setError(errors);
    return Object.keys(errors).length === 0; // Return true if valid
  };

  // Handle input changes
  const changeEmail = (e) => setEmail(e.currentTarget.value);
  const changePassword = (e) => setPassword(e.currentTarget.value);

  // Validate inputs on email or password change
  useEffect(() => {
    validateInputs(email, password);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  // Handle user creation on button click
  const clickCreate = async () => {
    if (!validateInputs(email, password)) return; // Check for errors before submission

    try {
      const res = await fetch(`${backendUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        createNotification("success", t("userCreated"));
        navigate("/login");
      } else {
        const jsonData = await res.json();
        const errorMessages = Array.isArray(jsonData.errors)
          ? jsonData.errors.map((element) => element.error).join(" ")
          : jsonData.errors;
        setMessage(errorMessages);
      }
    } catch (error) {
      setMessage(t("errorCreatingUser"));
    }
  };

  const { Text } = Typography;

  return (
    <Row align="middle" justify="center" className="row-container"> {/* Clase de CSS */}
      {message && <Alert type="error" message={message} style={{ marginBottom: "10px" }} />}

      <Col xs={24} sm={20} md={16} lg={12}>
        <Card title={t("Register")} className="user-card"> {/* Clase para el card */}
          <Input
            size="large"
            type="text"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={changeEmail}
            aria-label={t("emailPlaceholder")}
            required
            className="input-field" // Clase para el input de email
          />
          {error.email && <Text type="danger" className="error-message">{error.email}</Text>} {/* Error email */}

          <Input
            size="large"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={changePassword}
            aria-label={t("passwordPlaceholder")}
            required
            className="input-field" // Clase para el input de password
          />
          {error.password && <Text type="danger" className="error-message">{error.password}</Text>} {/* Error password */}

          <Button
            type="primary"
            onClick={clickCreate}
            block
            disabled={Object.keys(error).length > 0} // Disable if there are validation errors
            className="primary-button" // Clase para el botón principal
          >
            {t("Register")}
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateUserComp;
