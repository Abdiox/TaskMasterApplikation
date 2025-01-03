import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import LottieView from "lottie-react-native";

const Indstillinger = ({ navigation }) => {
  const [indstillingerAnimation, setIndstillingerAnimation] = useState(true);

  return (
    <View style={styles.container}>
      {indstillingerAnimation && (
        <View style={styles.animationContainer}>
          <LottieView source={require("../assets/IndstillingerAnimation.json")} autoPlay loop style={styles.indstillingerAnimation} />
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>Privatindstillinger for konto</Text>
        <Button mode="contained" style={styles.button} labelStyle={styles.buttonText} onPress={() => navigation.navigate("OmTaskMaster")}>
          Om TaskMaster
        </Button>
        <Button mode="contained" style={styles.button} labelStyle={styles.buttonText} onPress={() => navigation.navigate("Kontakt")}>
          Kontakt
        </Button>
      </View>

      <Text style={styles.footer}>TaskMaster © 2024</Text>
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

  animationContainer: {
    position: "absolute",
    top: 20,
    left: 168,
    width: 60,
    height: 60,
  },

  indstillingerAnimation: {
    width: 60,
    height: 60,
  },

  header: {
    alignItems: "center",
    width: "100%",
    marginTop: 40, // Add some margin to the top to avoid overlap
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },

  subtitle: {
    fontSize: 16,
    marginVertical: 5,
  },

  button: {
    width: "80%",
    marginVertical: 10,
    paddingVertical: 10,
    backgroundColor: "#FFA500",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    color: "#333",
    marginTop: 20,
    fontSize: 12,
  },
});

export default Indstillinger;
