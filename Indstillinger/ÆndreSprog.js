import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Picker } from "react-native";

const ÆndreSprog = () => {
  const [language, setLanguage] = useState("da"); // Default language is Danish

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Here you would typically update the language globally, e.g., using a context, i18n, etc.
    alert(`Language changed to ${lang === "da" ? "Danish" : "English"}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ændre Sprog</Text>

      <Text style={styles.subtitle}>Vælg dit ønskede sprog:</Text>
      <Picker selectedValue={language} style={styles.picker} onValueChange={handleLanguageChange}>
        <Picker.Item label="Dansk" value="da" />
        <Picker.Item label="English" value="en" />
      </Picker>

      <Button
        title="Bekræft"
        onPress={() => alert("Sprog ændret!")} // You can add more logic here if needed
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    width: "80%",
    height: 50,
    marginBottom: 20,
  },
});

export default ÆndreSprog;
