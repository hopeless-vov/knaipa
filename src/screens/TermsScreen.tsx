import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import LegalScreen, { LegalSection } from '../components/LegalScreen';
import { useTranslation } from '../hooks/useTranslation';

type Props = NativeStackScreenProps<RootStackParamList, 'Terms'>;

export default function TermsScreen({ navigation }: Props) {
  const { t, tList } = useTranslation();
  return (
    <LegalScreen
      title={t('legal.termsTitle')}
      subtitle={t('legal.updated')}
      sections={tList<LegalSection>('legal.terms')}
      onBack={() => navigation.goBack()}
    />
  );
}
