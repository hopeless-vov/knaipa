import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import LegalScreen, { LegalSection } from '../components/LegalScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Terms'>;

const SECTIONS: LegalSection[] = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using Kutok, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.',
  },
  {
    title: 'User Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
  },
  {
    title: 'Permitted Use',
    body: 'Kutok is provided for personal, non-commercial use. You may not use the app for any illegal purpose or in violation of any local, national, or international law.',
  },
  {
    title: 'Content',
    body: 'You retain ownership of any content you submit to our service. By submitting content, you grant us a worldwide, non-exclusive license to use, reproduce, and distribute that content in connection with our service.',
  },
  {
    title: 'Disclaimers',
    body: 'Kutok is provided "as is" without warranties of any kind. We do not guarantee the accuracy of place information, hours, or pricing. Always verify information directly with the venue.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the maximum extent permitted by law, Kutok shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.',
  },
  {
    title: 'Changes to Terms',
    body: 'We reserve the right to modify these terms at any time. We will notify you of significant changes. Your continued use of the app after changes constitutes your acceptance of the new terms.',
  },
];

export default function TermsScreen({ navigation }: Props) {
  return (
    <LegalScreen
      title="Terms of Service"
      subtitle="Last updated: May 2026"
      sections={SECTIONS}
      onBack={() => navigation.goBack()}
    />
  );
}
