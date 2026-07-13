import { Text } from '@react-email/components';
import * as React from 'react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export interface PasswordResetProps {
  resetUrl: string;
  userId?: string;
}

export const PasswordReset = ({
  resetUrl = 'https://soouls.in/reset-password',
  userId,
}: PasswordResetProps) => {
  return (
    <Layout
      previewText="Reset your Soouls password"
      heading="Reset your password"
      userId={userId}
      templateName="password-reset"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        Someone recently requested a password change for your Soouls account. If this was you, you
        can set a new password here:
      </Text>
      <div className="text-center mt-[32px] mb-[32px]">
        <Button href={resetUrl}>Reset Password</Button>
      </div>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        If you don't want to change your password or didn't request this, just ignore and delete
        this message.
      </Text>
    </Layout>
  );
};

export default PasswordReset;
