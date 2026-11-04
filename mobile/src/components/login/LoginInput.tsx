import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
  TextInputProps,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';

interface LoginInputProps extends TextInputProps {
  label?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: string;
}

export const LoginInput: React.FC<LoginInputProps> = ({
  label,
  iconName,
  isPassword = false,
  error,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(!isPassword);
  const inputRef = useRef<any>(null);

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
      <Pressable
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        <Ionicons
          name={iconName}
          size={19}
          color={hasError ? '#EF4444' : isFocused ? '#FF6B00' : '#8E95A5'}
          style={styles.leftIcon}
        />
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
          ]}
          placeholder={placeholder}
          placeholderTextColor="#717684"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !passwordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor="#FF6B00"
          editable={true}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeIconContainer}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={19}
              color={isFocused ? '#E2E8F0' : '#8E95A5'}
            />
          </TouchableOpacity>
        )}
      </Pressable>
      {hasError ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color="#EF4444" style={styles.errorIcon} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    width: '100%',
  },
  label: {
    fontSize: 12.5,
    color: '#B0B4BA',
    marginBottom: 5,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 18, 26, 0.88)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    height: 50,
  },
  inputContainerFocused: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(21, 25, 36, 0.96)',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14.5,
    paddingVertical: 10,
  },
  eyeIconContainer: {
    padding: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 4,
  },
  errorIcon: {
    marginRight: 5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
});
