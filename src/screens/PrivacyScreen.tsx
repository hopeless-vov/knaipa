import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import LegalScreen, { LegalSection } from '../components/LegalScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

const SECTIONS: LegalSection[] = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide directly to us, such as your name, email address, and preferences. We also collect information about your use of our services, including places you like or pass, and your location data when you choose to share it.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use the information we collect to provide, maintain, and improve our services; to personalize your experience; to communicate with you about updates; and to analyze how our services are used.',
  },
  {
    title: 'Information Sharing',
    body: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our app.',
  },
  {
    title: 'Data Security',
    body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us at privacy@kutok.app.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.',
  },
];

export default function PrivacyScreen({ navigation }: Props) {
  return (
    <LegalScreen
      title="Privacy Policy"
      subtitle="Last updated: May 2026"
      sections={SECTIONS}
      onBack={() => navigation.goBack()}
    />
  );
}
