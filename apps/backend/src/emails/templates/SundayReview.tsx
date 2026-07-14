import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

export interface SundayReviewProps {
  userId?: string;
  userName?: string;
  weekRange?: string;
  tasksCompleted?: number;
  entriesWritten?: number;
  dashboardUrl?: string;
}

export const SundayReview = ({
  userId,
  userName = 'there',
  weekRange = 'this week',
  tasksCompleted = 0,
  entriesWritten = 0,
  dashboardUrl = 'https://soouls.in/dashboard',
}: SundayReviewProps) => {
  return (
    <Layout
      previewText="Your weekly Soouls review is here"
      heading={`Your Sunday Review, ${userName}`}
      userId={userId}
      templateName="sunday-review"
    >
      <Text className="text-[14px] leading-[24px] text-gray-700">
        Here's a look back at your journey {weekRange}.
      </Text>

      <Section className="bg-gray-50 rounded-lg p-6 my-6 border border-gray-200 text-center">
        <Text className="text-[24px] font-semibold text-gray-900 m-0">{entriesWritten}</Text>
        <Text className="text-[14px] text-gray-500 m-0 mt-1">Journal Entries</Text>
      </Section>

      <Section className="bg-gray-50 rounded-lg p-6 my-6 border border-gray-200 text-center">
        <Text className="text-[24px] font-semibold text-gray-900 m-0">{tasksCompleted}</Text>
        <Text className="text-[14px] text-gray-500 m-0 mt-1">Tasks Completed</Text>
      </Section>

      <Text className="text-[14px] leading-[24px] text-gray-700">
        Take a moment to reflect on your progress. Ready for the week ahead?
      </Text>
      <div className="text-center mt-[32px] mb-[32px]">
        <Button href={dashboardUrl}>View Full Review</Button>
      </div>
    </Layout>
  );
};

export default SundayReview;
