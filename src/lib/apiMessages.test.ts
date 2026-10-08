import { describe, expect, it } from '@jest/globals';
import { codeForMessage } from '@/lib/errors';

describe('API error messages', () => {
  it('reads every "out of minutes" message as quotaExceeded', () => {
    expect(
      codeForMessage(
        'Your account limit has been reached. Upgrade to continue denoising',
      ),
    ).toBe('quotaExceeded');
    expect(codeForMessage('Monthly limit reached')).toBe('quotaExceeded');
  });

  it('reads plan-only features and token problems', () => {
    expect(
      codeForMessage('Voice Design is only available for Studio users'),
    ).toBe('studioRequired');
    expect(codeForMessage('This needs a paid plan')).toBe('paidPlanRequired');
    expect(codeForMessage('Invalid token')).toBe('authRequired');
    expect(codeForMessage('Something else')).toBeNull();
  });
});
