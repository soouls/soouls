import { Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from '../components/Layout';

export interface RenewalReminderProps {
  userId?: string;
  renewalDate?: string;
  amount?: string;
  planName?: string;
}

export const RenewalReminder = ({
  userId,
  renewalDate = 'soon',
  amount = '$9.99',
  planName = 'Pro Plan',
}: RenewalReminderProps) => {
  return (
    <Layout
      previewText="Your subscription is renewing soon"
      heading="Subscription Renewal Reminder"
      userId={userId}
      templateName="renewal-reminder"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        This is a quick reminder that your {planName} subscription will automatically renew on{' '}
        {renewalDate}.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        You will be charged {amount}. If you'd like to keep your subscription, no action is needed.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        You can manage your subscription at any time from your account settings.
      </Text>
    </Layout>
  );
};

export default RenewalReminder;
