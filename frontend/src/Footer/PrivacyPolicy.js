import React from 'react';
import './css/PrivacyPolicy.css'; 

const PrivacyPolicy = () => {
    return (
        <div className="privacy-policy-container">
            <h1>Privacy Policy</h1>
            <p>
                Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information.
            </p>
            <h2>Information We Collect</h2>
            <p>
                We collect information you provide directly to us, such as when you register for an account or use our services.
            </p>
            <h2>How We Use Your Information</h2>
            <p>
                We use the information we collect to provide, maintain, and improve our services, and to communicate with you.
            </p>
            <h2>Data Security</h2>
            <p>
                We implement security measures to protect your information from unauthorized access or disclosure.
            </p>
            <h2>Changes to This Policy</h2>
            <p>
                We may update this policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
            <h2>Contact Us</h2>
            <p>
                If you have any questions about this privacy policy, please contact us.
            </p>
        </div>
    );
};

export default React.memo(PrivacyPolicy);
