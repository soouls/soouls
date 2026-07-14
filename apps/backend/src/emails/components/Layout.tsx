import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import type * as React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  previewText: string;
  heading?: string;
  userId?: string;
  templateName?: string;
}

export const Layout = ({ children, previewText, heading, userId, templateName }: LayoutProps) => {
  // If we have userId and templateName, we could construct a 1-click unsubscribe URL
  const unsubscribeUrl =
    userId && templateName
      ? `https://soouls.in/preferences?userId=${userId}`
      : 'https://soouls.in/preferences';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans text-gray-800">
          <Container className="border border-solid border-gray-200 rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Section className="mt-[32px]">
              <Text className="text-xl font-bold text-gray-900">Soouls</Text>
            </Section>
            {heading && (
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                {heading}
              </Heading>
            )}
            <Section>{children}</Section>
            <Hr className="border border-solid border-gray-200 my-[26px] mx-0 w-full" />
            <Text className="text-gray-500 text-[12px] leading-[24px]">
              You received this email because you signed up for Soouls.
              <br />
              <Link href={unsubscribeUrl} className="text-gray-500 underline">
                Manage your email preferences
              </Link>
              .
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
