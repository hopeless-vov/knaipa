import React from 'react';
import { View, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { INK, MUTED } from '../utils/theme';

interface TextInputProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'search' | 'send';
}

export default function TextInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  rightElement,
  onSubmitEditing,
  returnKeyType,
}: TextInputProps) {
  return (
    <View style={styles.container}>
      <RNTextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
      />
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: INK,
    height: '100%',
  },
  rightElement: {
    marginLeft: 8,
  },
});
