import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { INK, MUTED, PAPER } from '../utils/theme';
import TextInput from '../ui/TextInput';

interface AccountEditRowProps {
  label: string;
  value: string;
  actionLabel: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  /** Text the input starts with when opened (empty for passwords). */
  initialDraft?: string;
  loading?: boolean;
  onSave: (value: string) => Promise<boolean>;
}

export default function AccountEditRow({
  label,
  value,
  actionLabel,
  placeholder,
  secureTextEntry,
  initialDraft = '',
  loading = false,
  onSave,
}: AccountEditRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialDraft);

  const open = () => {
    setDraft(initialDraft);
    setEditing(true);
  };

  const save = async () => {
    const ok = await onSave(draft);
    if (ok) setEditing(false);
  };

  if (!editing) {
    return (
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value || '—'}</Text>
        </View>
        <Pressable onPress={open} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.editArea}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <View style={styles.editButtons}>
        <Pressable onPress={() => setEditing(false)} style={[styles.btn, styles.btnOutline]}>
          <Text style={styles.btnOutlineText}>CANCEL</Text>
        </Pressable>
        <Pressable onPress={save} disabled={loading} style={[styles.btn, styles.btnFilled, loading && styles.btnDisabled]}>
          <Text style={styles.btnFilledText}>{loading ? 'SAVING…' : 'SAVE'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  info: { gap: 2 },
  label: { fontSize: 15, fontWeight: '500', color: INK },
  value: { fontSize: 13, color: MUTED },
  action: { padding: 4 },
  actionText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: INK,
    textDecorationLine: 'underline',
  },
  editArea: { paddingVertical: 14, gap: 10 },
  editButtons: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: { backgroundColor: PAPER },
  btnFilled: { backgroundColor: INK },
  btnDisabled: { opacity: 0.5 },
  btnOutlineText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: INK },
  btnFilledText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: PAPER },
});
