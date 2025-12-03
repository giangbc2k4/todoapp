// components/ui/Input.tsx
import React from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ErrorText from './ErrorText';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIconName?: string; // tên icon Feather
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIconName,
  ...rest
}) => {
  const hasError = !!error;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-slate-200 mb-1.5">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-2xl border px-4 py-3 bg-slate-900/70
        ${hasError ? 'border-rose-500/70' : 'border-slate-700'} `}
      >
        {leftIconName && (
          <Icon
            name={leftIconName}
            size={18}
            color={hasError ? '#fb7185' : '#9ca3af'}
          />
        )}

        <TextInput
          placeholderTextColor="#6b7280"
          className={`flex-1 text-[15px] text-slate-50 ${leftIconName ? 'ml-3' : ''}`}
          {...rest}
        />
      </View>

      <ErrorText message={error} />
    </View>
  );
};

export default Input;
