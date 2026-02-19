import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should show the start screen with title', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Check for the heading on the start screen
    const heading = getByRole('heading', { level: 1 });
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('Amy');
    expect(heading.textContent).toContain('Dan');
  });
});
