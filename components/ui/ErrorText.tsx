// components/ui/ErrorText.tsx
import React from 'react';
import { Text } from 'react-native';

interface ErrorTextProps {
  message?: string;
}

const ErrorText: React.FC<ErrorTextProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Text className="text-xs text-rose-400 mt-1">
      {message}
    </Text>
  );
};

export default ErrorText;
