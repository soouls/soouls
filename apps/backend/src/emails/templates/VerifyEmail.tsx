import { Text } from '@react-email/components';
import * as React from 'react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export interface VerifyEmailProps {
  verifyUrl: string;
  userId?: string;
}

export const VerifyEmail = ({
  verifyUrl = 'https://soouls.in/verify',
  userId,
}: VerifyEmailProps) => {
  return (
    <Layout
      previewText="Verify your email address"
      heading="Verify your email address"
      userId={userId}
      templateName="verify-email"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        Please verify your email address so you can securely access your Soouls account.
      </Text>
      <div className="text-center mt-[32px] mb-[32px]">
        <Button href={verifyUrl}>Verify Email</Button>
      </div>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        If you didn't create an account with Soouls, you can safely ignore this email.
      </Text>
    </Layout>
  );
};

export default VerifyEmail;
