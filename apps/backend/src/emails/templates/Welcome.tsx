import { Text } from '@react-email/components';
import * as React from 'react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export interface WelcomeEmailProps {
  name?: string;
  userId?: string;
}

export const WelcomeEmail = ({ name = 'there', userId }: WelcomeEmailProps) => {
  return (
    <Layout
      previewText="Welcome to Soouls"
      heading={`Welcome, ${name}!`}
      userId={userId}
      templateName="welcome"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        We're thrilled to have you here. Soouls is designed to be a private, non-judgmental space
        for your thoughts.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        Whenever you're ready, you can start exploring your clusters and writing your first entry.
      </Text>
      <div className="text-center mt-[32px] mb-[32px]">
        <Button href="https://soouls.in/app">Open Soouls</Button>
      </div>
    </Layout>
  );
};

export default WelcomeEmail;
