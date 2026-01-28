import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Index from './Index';

vi.mock('@/hooks/useAuth', () => {
  return {
    useAuth: () => ({ user: null, loading: false }),
  };
});

describe('Landing page', () => {
  it('renders hero and demo video', () => {
    const { container } = render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /build with specs, ship with confidence\./i })
    ).toBeInTheDocument();

    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('src')).toBe('/primary-specs.mp4');
  });
});

