import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';
type Size = 'default' | 'sm' | 'icon';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary',
  outline: 'bg-transparent border border-border',
  ghost: 'bg-transparent',
  destructive: 'bg-destructive',
};

const textClasses: Record<Variant, string> = {
  default: 'text-primary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive-foreground',
};

const sizeClasses: Record<Size, string> = {
  default: 'px-4 py-2 rounded-lg',
  sm: 'px-3 py-1.5 rounded-md',
  icon: 'p-2 rounded-lg',
};

export function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'default',
  className = '',
}: ButtonProps) {
  return (
    <Pressable
      onPress={() => { if (!disabled && !loading && onPress) onPress(); }}
      accessibilityState={{ disabled }}
      className={`flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      android_ripple={disabled ? null : { color: 'rgba(0,0,0,0.1)' }}
    >
      {loading && <ActivityIndicator size="small" className="mr-2" />}
      {typeof children === 'string' ? (
        <Text className={`font-sans text-sm font-medium ${textClasses[variant]}`}>{children}</Text>
      ) : (
        <View className="flex-row items-center gap-2">{children}</View>
      )}
    </Pressable>
  );
}
