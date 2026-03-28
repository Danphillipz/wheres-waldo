import { render, screen } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';
import { LeaderboardEntry } from '../../utils/firestoreLeaderboard';

// Mock LoadingSpinner so we don't need its CSS module
jest.mock('../LoadingSpinner/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

function makeEntry(overrides: Partial<LeaderboardEntry> & { name: string }): LeaderboardEntry {
  return {
    score: 10,
    foundImages: 5,
    totalImages: 8,
    hintsUsed: 0,
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('Leaderboard', () => {
  it('should show loading state', () => {
    render(<Leaderboard entries={[]} loading />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    expect(screen.getByText(/Leaderboard/)).toBeTruthy();
  });

  it('should show empty state when no entries', () => {
    render(<Leaderboard entries={[]} />);
    expect(screen.getByText(/No scores yet/)).toBeTruthy();
  });

  it('should render medals for top 3 entries', () => {
    const entries = [
      makeEntry({ name: 'Alice', foundImages: 8, score: 10 }),
      makeEntry({ name: 'Bob', foundImages: 7, score: 12 }),
      makeEntry({ name: 'Charlie', foundImages: 6, score: 15 }),
    ];
    render(<Leaderboard entries={entries} />);
    expect(screen.getByText('🥇')).toBeTruthy();
    expect(screen.getByText('🥈')).toBeTruthy();
    expect(screen.getByText('🥉')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('Charlie')).toBeTruthy();
  });

  it('should render 4th+ entries in a list with rank numbers', () => {
    const entries = [
      makeEntry({ name: 'Alice', foundImages: 8, score: 10 }),
      makeEntry({ name: 'Bob', foundImages: 7, score: 12 }),
      makeEntry({ name: 'Charlie', foundImages: 6, score: 15 }),
      makeEntry({ name: 'Diana', foundImages: 5, score: 18 }),
      makeEntry({ name: 'Eve', foundImages: 4, score: 20 }),
    ];
    render(<Leaderboard entries={entries} />);
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('Diana')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('Eve')).toBeTruthy();
  });

  it('should highlight the current player', () => {
    const entries = [
      makeEntry({ name: 'Alice', foundImages: 8 }),
      makeEntry({ name: 'Bob', foundImages: 7 }),
    ];
    const { container } = render(
      <Leaderboard entries={entries} currentPlayerName="Bob" />
    );
    const highlighted = container.querySelectorAll('[class*="currentPlayer"]');
    expect(highlighted).toHaveLength(1);
  });

  it('should show hint count when hints were used', () => {
    const entries = [
      makeEntry({ name: 'Alice', foundImages: 8, hintsUsed: 3 }),
    ];
    render(<Leaderboard entries={entries} />);
    expect(screen.getByText(/💡3/)).toBeTruthy();
  });
});
