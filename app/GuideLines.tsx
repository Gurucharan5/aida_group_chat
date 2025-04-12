import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function Guidelines() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Community Guidelines</Text>
      <Text style={styles.rule}>1. Be respectful – No hate speech, bullying, or harassment.</Text>
      <Text style={styles.rule}>2. No NSFW content – No sexually explicit, violent, or disturbing messages.</Text>
      <Text style={styles.rule}>3. No spam – Don’t flood chat rooms or send unsolicited ads.</Text>
      <Text style={styles.rule}>4. Stay legal – Don’t promote illegal activity.</Text>
      <Text style={styles.rule}>5. 18+ only – This app is for adults only.</Text>
      <Text style={styles.footer}>Violation of these rules may result in reported messages or app restrictions.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  rule: { fontSize: 16, marginBottom: 10 },
  footer: { marginTop: 20, fontStyle: 'italic', color: '#888' },
});
