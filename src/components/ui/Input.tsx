import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <TextInput
      className={`border border-border rounded-lg px-3 py-2 text-foreground bg-background text-base ${className}`}
      placeholderTextColor="#94a3b8"
      {...props}
    />
  );
}
