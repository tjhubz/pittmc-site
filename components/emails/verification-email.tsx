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
      
      <p>Hello there! Your PittMC code is: <strong style={{
        fontSize: '24px'
      }}>{verificationCode}</strong></p>
      
      <p>Reply to this email if you run into any issues.</p>
    </div>
  );
}; 