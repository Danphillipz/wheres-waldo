import { render } from '@testing-library/react';

import WheresWaldoSharedUi from './shared-ui';

describe('WheresWaldoSharedUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WheresWaldoSharedUi />);
    expect(baseElement).toBeTruthy();
  });
});
