import * as React from 'react';

interface VerificationEmailProps {
  verificationCode: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  verificationCode,
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
        PittMC
      </h1>
      
      <p>Hello from PittMC!</p>
      
      <p>Your PittMC code is: <strong style={{
        fontSize: '24px'
      }}>{verificationCode}</strong></p>
      
      <p>If you didn't request this code, please ignore this email.</p>
      
      <div style={{
        marginTop: '40px',
        padding: '20px 0',
        borderTop: '1px solid #e1e1e1',
        fontSize: '12px',
        color: '#666'
      }}>
        <p>Feel free to reply to this email if you have any questions or run into any issues.</p>
      </div>
    </div>
  );
}; 