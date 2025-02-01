import React from 'react';
import './css/TermsOfService.css'; 

const TermsOfService = () => {
    return (
        <div className="terms-of-service-container">
            <h1>Terms of Service</h1>
            <p>
                Welcome to our To Do List website. By using our services, you agree to comply with and be bound by the following terms.
            </p>
            <h2>Use of Our Service</h2>
            <p>
                You agree to use our service only for lawful purposes and in a manner that does not infringe the rights of others.
            </p>
            <h2>User Accounts</h2>
            <p>
                You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
            <h2>Limitation of Liability</h2>
            <p>
                Our website is provided on an "as is" basis. We are not liable for any damages arising from the use of our service.
            </p>
            <h2>Changes to These Terms</h2>
            <p>
                We may revise these terms from time to time. We will notify you of any changes by posting the updated terms on this page.
            </p>
            <h2>Contact Us</h2>
            <p>
                If you have any questions about these terms, please contact us.
            </p>
        </div>
    );
};

export default React.memo(TermsOfService);
