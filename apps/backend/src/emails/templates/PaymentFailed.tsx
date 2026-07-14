import { Text } from '@react-email/components';
import * as React from 'react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export interface PaymentFailedProps {
  userId?: string;
  billingUrl?: string;
}

export const PaymentFailed = ({
  userId,
  billingUrl = 'https://soouls.in/settings/billing',
}: PaymentFailedProps) => {
  return (
    <Layout
      previewText="Action required: Payment failed"
      heading="Payment Failed"
      userId={userId}
      templateName="payment-failed"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        We were unable to process the payment for your recent Soouls subscription renewal.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        To avoid any interruption in your service, please update your payment method.
      </Text>
      <div className="text-center mt-[32px] mb-[32px]">
        <Button href={billingUrl}>Update Payment Method</Button>
      </div>
    </Layout>
  );
};

export default PaymentFailed;
