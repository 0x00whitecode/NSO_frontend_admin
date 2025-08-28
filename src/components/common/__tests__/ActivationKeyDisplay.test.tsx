import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivationKeyDisplay from '../ActivationKeyDisplay';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('ActivationKeyDisplay', () => {
  const mockActivationKey = 'NSO-1234-5678-9ABC-DEF0';
  const mockShortCode = 'ABC123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders activation key in compact mode', () => {
    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        shortCode={mockShortCode}
        compact={true}
      />
    );

    expect(screen.getByText(mockActivationKey)).toBeInTheDocument();
    expect(screen.getByText(`Short Code: ${mockShortCode}`)).toBeInTheDocument();
  });

  it('renders activation key in full mode', () => {
    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        shortCode={mockShortCode}
        compact={false}
      />
    );

    expect(screen.getByText('Activation Key')).toBeInTheDocument();
    expect(screen.getByText(mockActivationKey)).toBeInTheDocument();
    expect(screen.getByText('Copy Activation Key')).toBeInTheDocument();
    expect(screen.getByText('Copy Short Code')).toBeInTheDocument();
  });

  it('masks key when not visible', () => {
    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        compact={true}
        showFullKey={false}
      />
    );

    // Should show masked key (first 4 and last 4 characters)
    expect(screen.getByText('NSO-****-****-DEF0')).toBeInTheDocument();
  });

  it('copies activation key to clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        compact={true}
      />
    );

    const copyButton = screen.getByTitle('Copy activation key');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(mockActivationKey);
    });
  });

  it('copies short code to clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        shortCode={mockShortCode}
        compact={true}
      />
    );

    const copyShortCodeButton = screen.getByTitle('Copy short code');
    fireEvent.click(copyShortCodeButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(mockShortCode);
    });
  });

  it('toggles key visibility', () => {
    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        compact={true}
        showFullKey={false}
      />
    );

    // Initially masked
    expect(screen.getByText('NSO-****-****-DEF0')).toBeInTheDocument();

    // Click to show
    const toggleButton = screen.getByTitle('Show key');
    fireEvent.click(toggleButton);

    // Should now show full key
    expect(screen.getByText(mockActivationKey)).toBeInTheDocument();
  });

  it('shows status chip when provided', () => {
    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        status="active"
        compact={false}
      />
    );

    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('shows expiration information when provided', () => {
    const expiresAt = '2024-12-31T23:59:59Z';
    
    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        expiresAt={expiresAt}
        remainingDays={30}
        compact={false}
      />
    );

    expect(screen.getByText('Expires')).toBeInTheDocument();
    expect(screen.getByText('Remaining Days')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('calls onCopy callback when provided', async () => {
    const mockOnCopy = jest.fn();
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        onCopy={mockOnCopy}
        compact={true}
      />
    );

    const copyButton = screen.getByTitle('Copy activation key');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockOnCopy).toHaveBeenCalledWith(mockActivationKey, 'Activation Key');
    });
  });

  it('handles clipboard errors gracefully', async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(
      <ActivationKeyDisplay
        activationKey={mockActivationKey}
        compact={true}
      />
    );

    const copyButton = screen.getByTitle('Copy activation key');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to copy to clipboard')).toBeInTheDocument();
    });
  });
});
