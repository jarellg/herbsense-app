'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef } from 'react';

interface HCaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
}

export function HCaptchaWrapper({ onVerify, onExpire, onError }: HCaptchaWrapperProps) {
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error('hCaptcha site key is missing');
    return null;
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
      />
    </div>
  );
}
