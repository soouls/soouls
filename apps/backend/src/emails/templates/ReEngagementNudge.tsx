import { Text } from '@react-email/components';
import * as React from 'react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export interface ReEngagementNudgeProps {
  userId?: string;
  userName?: string;
  dashboardUrl?: string;
}

export const ReEngagementNudge = ({
  userId,
  userName = 'there',
  dashboardUrl = 'https://soouls.in/dashboard',
}: ReEngagementNudgeProps) => {
  return (
    <Layout
      previewText="We haven't seen you in a while"
      heading={`Checking in, ${userName}`}
      userId={userId}
      templateName="re-engagement-nudge"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        It’s been a little while since you last logged into Soouls. We wanted to drop a quick note
        to say we hope you’re doing well.
      </Text>
      <Text className="text-[14px] leading-[24px] text-gray-700">
        Life gets busy, and that's okay. Your journal and your thoughts are right here whenever
        you're ready to pick up where you left off.
      </Text>
      <div className="text-center mt-[32px] mb-[32px]">
        <Button href={dashboardUrl}>Return to Soouls</Button>
      </div>
    </Layout>
  );
};

export default ReEngagementNudge;
