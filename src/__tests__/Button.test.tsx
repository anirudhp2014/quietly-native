import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders label', () => {
    const { getByText } = render(<Button onPress={() => {}}>Press me</Button>);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress', () => {
    const fn = jest.fn();
    const { getByText } = render(<Button onPress={fn}>Tap</Button>);
    fireEvent.press(getByText('Tap'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const fn = jest.fn();
    const { getByText } = render(<Button onPress={fn} disabled>Tap</Button>);
    fireEvent.press(getByText('Tap'));
    expect(fn).not.toHaveBeenCalled();
  });
});
