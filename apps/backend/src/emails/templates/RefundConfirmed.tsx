import { Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from '../components/Layout';

export interface RefundConfirmedProps {
  userId?: string;
  amount?: string;
}

export const RefundConfirmed = ({ userId, amount = 'the full amount' }: RefundConfirmedProps) => {
  return (
    <Layout
      previewText="Your refund has been processed"
      heading="Refund Confirmed"
      userId={userId}
      templateName="refund-confirmed"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        This is a confirmation that a refund of {amount} has been processed for your account.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        Please allow 5-10 business days for the funds to appear on your original payment method,
        depending on your bank.
      </Text>
    </Layout>
  );
};

export default RefundConfirmed;
