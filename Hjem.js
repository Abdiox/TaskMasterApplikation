import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions, Animated } from "react-native";
import { Button } from "react-native-paper";
import LottieView from "lottie-react-native";

const Hjem = ({ navigation }) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0]; // Start opacity at 1

  const handleStart = () => {
    navigation.navigate("Opgaver"); // Skifter til Opgaver-skærmen
  };

  const fadeOutAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 0, // Fade out animation
      duration: 1000, // Duration of fade-out
      useNativeDriver: true,
    }).start(() => setShowAnimation(false)); // Når animationen er færdig, skjul animationen
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* Hvis du bruger et lokalt billede */}
      <Image
        source={require("./assets/logo.png")} // Lokalt billede
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Vis animationen og fade den ud når den er færdig */}
      {showAnimation && (
        <LottieView
          source={require("./assets/WelcomeAnimation.json")}
          autoPlay
          loop={false}
          onAnimationFinish={fadeOutAnimation} // Start fade out animation, når animationen er færdig
          style={styles.animationSize}
        />
      )}

      {/* Fadet ud animation */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Velkommen til TaskMaster!</Text>
        <Text style={styles.subtitle}>Din partner i effektiv opgavestyring</Text>

        <Text style={styles.description}>
          Få styr på dine projekter og opgaver med TaskMaster. Organiser, deleger og track dine opgaver nemt og effektivt. Kom hurtigt i gang med at
          skabe orden i dine arbejdsdage!
        </Text>

        <Button mode="contained" onPress={handleStart} style={styles.button}>
          Kom i gang
        </Button>

        <Text style={styles.footerText}>TaskMaster © 2024</Text>
      </Animated.View>
    </View>
  );
};

// Styling af komponenten
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 20,
  },
  logo: {
    width: Dimensions.get("window").width * 0.5,
    height: Dimensions.get("window").width * 0.5,
    marginBottom: 30,
  },
  animationSize: {
    width: Dimensions.get("window").width * 0.7,
    height: Dimensions.get("window").width * 0.7,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    paddingVertical: 10,
    backgroundColor: "#2e8b57",
  },
  footerText: {
    fontSize: 14,
    color: "#bbb",
    position: "absolute",
    bottom: 20,
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default Hjem;
