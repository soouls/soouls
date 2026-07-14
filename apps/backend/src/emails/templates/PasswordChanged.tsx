import { Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from '../components/Layout';

export interface PasswordChangedProps {
  userId?: string;
}

export const PasswordChanged = ({ userId }: PasswordChangedProps) => {
  return (
    <Layout
      previewText="Your password was changed"
      heading="Password Changed"
      userId={userId}
      templateName="password-changed"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        This is a confirmation that the password for your Soouls account has just been changed.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        If you made this change, you can safely ignore this email.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        If you didn't change your password, please contact support immediately to secure your
        account.
      </Text>
    </Layout>
  );
};

export default PasswordChanged;
