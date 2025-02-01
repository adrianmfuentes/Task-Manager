import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom'; // Importa Link para navegación
import './css/Footer.css';

const { Footer } = Layout;

const CustomFooter = () => {
    return (
        <Footer className="custom-footer">
            <div className="footer-content">
                <span className="footer-text">Task Master ©2024</span>
                <nav className="footer-nav">
                    <Link to="/privacy" className="footer-link" aria-label="Privacy Policy">Privacy Policy</Link>
                    <Link to="/terms" className="footer-link" aria-label="Terms of Service">Terms of Service</Link>
                    <Link to="/contact" className="footer-link" aria-label="Contact Us">Contact Us</Link>
                </nav>
            </div>
        </Footer>
    );
};

export default React.memo(CustomFooter);
