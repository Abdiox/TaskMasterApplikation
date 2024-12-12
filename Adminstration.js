import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { Button } from "react-native-paper";
import LottieView from "lottie-react-native";

const Adminstration = ({ navigation }) => {
  const [adminstrationAnimation, setAdminstrationAnimation] = useState(true);

  return (
    <View style={styles.container}>
      {/* Animation placed in the top-left corner */}
      {adminstrationAnimation && (
        <View style={styles.animationContainer}>
          <LottieView source={require("./assets/AdminstrationAnimation.json")} autoPlay loop style={styles.animation} />
        </View>
      )}

      {/* Logo centered */}
      <Image source={{ uri: "https://i.ibb.co/B3291RZ/9430b192-e88b-48cd-bf31-31afdc813153.jpg" }} style={styles.logo} resizeMode="contain" />

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.title}>Administrationsoversigt</Text>
        <Text style={styles.subtitle}>Hold styr på dine medarbejdere</Text>
        <Text style={styles.description}>
          Få et hurtigt overblik over alle medarbejdere og deres status. Tilføj, rediger eller slet medarbejdere direkte fra denne side.
        </Text>
        <Button
          mode="contained"
          buttonColor="#FFA500"
          textColor="#fff"
          labelStyle={styles.buttonText}
          onPress={() => navigation.navigate("Medarbejder")}
        >
          Se medarbejdere
        </Button>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>TaskMaster © 2024</Text>

      <StatusBar style="dark" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },

  animationContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 100,
    height: 100,
  },

  animation: {
    width: "100%",
    height: "100%",
  },

  logo: {
    width: Dimensions.get("window").width * 0.35,
    height: Dimensions.get("window").width * 0.35,
    borderRadius: Dimensions.get("window").width * 0.25,
    marginBottom: 16,
  },

  content: {
    flex: 1,
    alignItems: "center",
    marginTop: 20,
    justifyContent: "center", // Centering content vertically
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },

  footer: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Adminstration;
