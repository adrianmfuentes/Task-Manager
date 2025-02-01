import React from 'react';
import './css/Contact.css'; 

const Contact = () => {
    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <p>
                We would love to hear from you! Please reach out with any questions or feedback.
            </p>
            <h2>Email</h2>
            <p>
                You can contact us at: <a href="mailto:support@example.com">support@example.com</a>
            </p>
            <h2>Phone</h2>
            <p>
                You can reach us by phone at: <strong>(123) 456-7890</strong>
            </p>
            <h2>Follow Us</h2>
            <p>
                Follow us on social media for updates:
            </p>
            <ul className="social-links">
                <li><a href="https://twitter.com/example">Twitter</a></li>
                <li><a href="https://facebook.com/example">Facebook</a></li>
                <li><a href="https://instagram.com/example">Instagram</a></li>
            </ul>
        </div>
    );
};

export default React.memo(Contact);
