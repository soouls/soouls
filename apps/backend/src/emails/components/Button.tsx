import { Button as ReactEmailButton } from '@react-email/components';
import type * as React from 'react';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export const Button = ({ href, children }: ButtonProps) => {
  return (
    <ReactEmailButton
      className="bg-black text-white text-[14px] font-semibold no-underline text-center px-5 py-3 rounded-md"
      href={href}
    >
      {children}
    </ReactEmailButton>
  );
};
