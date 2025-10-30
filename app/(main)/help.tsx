import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create a team?',
    answer:
      'Go to the Teams tab and tap the "Create Team" button. Fill in the team details including name, sport, and description. As the captain, you can then invite players to join your team.',
  },
  {
    id: '2',
    question: 'How do I join a tournament?',
    answer:
      'Navigate to the tournament details page and tap the "Join Tournament" button. Your team must meet the tournament requirements (sport, team size, etc.) to participate.',
  },
  {
    id: '3',
    question: 'How do I book a venue?',
    answer:
      'Go to the venue details page, select an available time slot in green, and tap "Book Selected Slot". Confirm your booking and you\'ll receive a confirmation.',
  },
  {
    id: '4',
    question: 'Can I edit my team after creation?',
    answer:
      "Yes! If you're the team captain, you can edit team details from the team detail screen by tapping the edit button.",
  },
  {
    id: '5',
    question: 'How do match invitations work?',
    answer:
      "When someone creates a match and invites your team, you'll see the invitation in the Matches tab. You can accept or decline the invitation. Both teams must accept for the match to be confirmed.",
  },
  {
    id: '6',
    question: 'What are the different tournament formats?',
    answer:
      "Tournaments can be single elimination (lose once and you're out), double elimination (two chances), or round-robin (everyone plays everyone). The format is set when creating the tournament.",
  },
  {
    id: '7',
    question: 'How do I view my upcoming matches?',
    answer:
      'Use the Calendar tab to see all your upcoming matches, tournaments, and bookings in a timeline view. You can also check the Matches tab for detailed match information.',
  },
  {
    id: '8',
    question: 'Can I cancel a venue booking?',
    answer:
      'Contact the venue owner directly using the contact information on the venue details page. Cancellation policies vary by venue.',
  },
  {
    id: '9',
    question: 'How do I become a venue owner?',
    answer:
      "Contact our admin team through the support email below. You'll need to provide venue details and verification documents.",
  },
  {
    id: '10',
    question: 'What if I find a bug or have feedback?',
    answer:
      "We'd love to hear from you! Use the contact information below to report bugs or share your feedback.",
  },
];

export default function HelpScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Find answers and get assistance</Text>
      </View>

      {/* FAQs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Frequently Asked Questions</Text>
        {faqs.map(faq => (
          <View key={faq.id} style={styles.faqItem}>
            <TouchableOpacity style={styles.faqQuestion} onPress={() => toggleFAQ(faq.id)}>
              <Text style={styles.questionText}>{faq.question}</Text>
              <Text style={styles.expandIcon}>{expandedId === faq.id ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {expandedId === faq.id && (
              <View style={styles.faqAnswer}>
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 Contact Us</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>support@milokhelo.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text style={styles.contactValue}>+27 (0) 11 123 4567</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Hours:</Text>
            <Text style={styles.contactValue}>Mon-Fri: 8:00 AM - 6:00 PM SAST</Text>
          </View>
        </View>
      </View>

      {/* Social Media Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Follow Us</Text>
        <View style={styles.socialLinks}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}>Twitter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}>Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Links Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚖️ Legal</Text>
        <TouchableOpacity style={styles.legalLink}>
          <Text style={styles.legalText}>Privacy Policy</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.legalLink}>
          <Text style={styles.legalText}>Terms of Service</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.legalLink}>
          <Text style={styles.legalText}>Community Guidelines</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ App Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name:</Text>
            <Text style={styles.infoValue}>Milokhe.lo</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>{Constants.platform?.ios ? 'iOS' : 'Android'}</Text>
          </View>
        </View>
      </View>

      {/* Quick Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Quick Tips</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            • Use the Calendar tab to see all your upcoming events in one place
          </Text>
          <Text style={styles.tipText}>
            • Tap the + button on Matches screen to quickly create a new match
          </Text>
          <Text style={styles.tipText}>
            • Filter matches, tournaments, and teams by sport to find what you need
          </Text>
          <Text style={styles.tipText}>
            • Check your notifications regularly for match invitations and updates
          </Text>
          <Text style={styles.tipText}>
            • As a team captain, you can manage your team from the team detail screen
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for using Milokhe.lo! 🏆⚽🏀</Text>
        <Text style={styles.footerSubtext}>
          We're here to make sports management easier for everyone.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    paddingRight: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: '#6200ee',
  },
  faqAnswer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  contactItem: {
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  socialButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  socialText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legalText: {
    fontSize: 16,
    color: '#333',
  },
  linkArrow: {
    fontSize: 18,
    color: '#6200ee',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  tipCard: {
    backgroundColor: '#fff9e6',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
