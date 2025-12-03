// components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  fullWidth,
}) => {
  const isDisabled = disabled || loading;

  const base = 'rounded-full py-3 px-4 items-center justify-center my-1';
  const width = fullWidth ? 'w-full' : '';
  const variantClass =
    variant === 'primary'
      ? 'bg-sky-400 active:bg-sky-300 shadow-lg shadow-sky-500/30'
      : variant === 'outline'
      ? 'border border-slate-700 bg-slate-900/40'
      : 'bg-transparent';

  const textClass =
    variant === 'primary'
      ? 'text-slate-950'
      : 'text-slate-100';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      className={`${base} ${width} ${variantClass} ${isDisabled ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className={`font-semibold text-base ${textClass}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
