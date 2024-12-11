import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { TextInput, Button } from "react-native-paper";
import LottieView from "lottie-react-native";

export default function App() {
  const [AccountAnimation, setAnimation] = useState(true);
  const [LoginSuccessAnimation, setLoginSuccessAnimation] = useState(false);

  return (
    <View style={styles.container}>
      <Image source={{ uri: "https://i.ibb.co/B3291RZ/9430b192-e88b-48cd-bf31-31afdc813153.jpg" }} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>Velkommen til TaskMaster!</Text>
      {AccountAnimation && <LottieView source={require("./assets/AccountAnimation.json")} autoPlay loop style={styles.animationSize} />}
      <Text style={styles.label}>Login:</Text>
      <TextInput label="Username" mode="outlined" style={styles.input} />
      <TextInput label="Password" mode="outlined" secureTextEntry style={styles.input} />
      <Button mode="contained" onPress={() => console.log("Sign In pressed")} buttonColor="#333" textColor="#333">
        Sign In
      </Button>
      {LoginSuccessAnimation && <LottieView source={require("./assets/LoginSuccesfullyAnimation.json")} autoPlay loop style={styles.animationSize} />}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },

  image: {
    width: Dimensions.get("window").width * 0.5,
    height: Dimensions.get("window").width * 0.5,
    borderRadius: Dimensions.get("window").width * 0.25,
    marginBottom: 16,
  },

  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    textAlign: "left",
  },
  input: {
    width: Dimensions.get("window").width * 0.8,
    marginBottom: 16,
  },
  animationSize: {
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
  },
});
