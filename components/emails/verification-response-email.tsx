import * as React from 'react';

interface VerificationResponseEmailProps {
  email: string;
}

export const VerificationResponseEmail: React.FC<VerificationResponseEmailProps> = ({
  email,
}) => {
  return (
    <div style={{
      fontFamily: 'sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{
        color: '#003594',
        marginTop: '40px',
        fontSize: '24px'
      }}>
        PittMC Email Verification
      </h1>
      
      <p>Hello from PittMC!</p>
      
      <p>We've successfully verified your Pitt email address: <strong>{email}</strong></p>
      
      <p>You can now continue with your whitelist request on the PittMC website.</p>
      
      <p>If you did not request this verification, please disregard this email.</p>
      
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p style={{ fontSize: '14px', color: '#666' }}>
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  );
}; 