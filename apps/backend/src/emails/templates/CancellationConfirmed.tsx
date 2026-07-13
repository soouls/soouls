import { Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from '../components/Layout';

export interface CancellationConfirmedProps {
  userId?: string;
  endDate?: string;
}

export const CancellationConfirmed = ({
  userId,
  endDate = 'the end of your billing cycle',
}: CancellationConfirmedProps) => {
  return (
    <Layout
      previewText="Your subscription has been canceled"
      heading="Subscription Canceled"
      userId={userId}
      templateName="cancellation-confirmed"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        We've successfully processed your cancellation request.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        You will continue to have access to your premium features until {endDate}.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        We're sorry to see you go. If you change your mind, you can resubscribe at any time.
      </Text>
    </Layout>
  );
};

export default CancellationConfirmed;
