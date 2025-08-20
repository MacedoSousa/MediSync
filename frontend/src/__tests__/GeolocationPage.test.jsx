import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import GeolocationPage from '../pages/GeolocationPage';

describe('GeolocationPage', () => {
  beforeAll(() => {
    // Mock minimal Geolocation API
    global.navigator.geolocation = {
      watchPosition: () => 1,
      clearWatch: () => {},
    };
  });

  it('renders without crashing', () => {
    const { container } = render(<GeolocationPage />);
    expect(container).toBeTruthy();
  });
});
