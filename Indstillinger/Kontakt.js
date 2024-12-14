import React from "react";
import { StyleSheet, Text, View, Linking, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";

const Kontakt = () => {
  const openEmail = () => {
    Linking.openURL("mailto:support@taskmaster.com?subject=Support Request");
  };

  const openPhone = () => {
    Linking.openURL("tel:+1234567890");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kontakt os</Text>

      <Text style={styles.description}>Hvis du har spørgsmål eller brug for hjælp, kan du kontakte os via e-mail eller telefon.</Text>

      <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
        <Text style={styles.contactText}>Send en e-mail</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactButton} onPress={openPhone}>
        <Text style={styles.contactText}>Ring til os</Text>
      </TouchableOpacity>

      <Button mode="contained" style={styles.button} onPress={() => alert("Chat support is coming soon!")}>
        Chat med os
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  contactButton: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#FFA500",
    width: "80%",
    alignItems: "center",
    borderRadius: 5,
  },
  contactText: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FFA500",
    width: "80%",
  },
});

export default Kontakt;
