import { Text } from '@react-email/components';
import * as React from 'react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export interface SubscriptionConfirmedProps {
  userId?: string;
  planName?: string;
  amount?: string;
  dashboardUrl?: string;
}

export const SubscriptionConfirmed = ({
  userId,
  planName = 'Pro Plan',
  amount = '$9.99',
  dashboardUrl = 'https://soouls.in/dashboard',
}: SubscriptionConfirmedProps) => {
  return (
    <Layout
      previewText="Your subscription is confirmed!"
      heading="Welcome to Soouls Pro"
      userId={userId}
      templateName="subscription-confirmed"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        Thank you for subscribing to the {planName}. Your payment of {amount} was successful.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        You now have full access to all premium features.
      </Text>
      <div className="text-center mt-[32px] mb-[32px]">
        <Button href={dashboardUrl}>Go to Dashboard</Button>
      </div>
    </Layout>
  );
};

export default SubscriptionConfirmed;
