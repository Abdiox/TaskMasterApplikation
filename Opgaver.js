import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

const Opgaver = ({ route, navigation }) => {
  const [animationPlayed, setAnimationPlayed] = useState(false);

  // Handle when the animation finishes playing
  const handleAnimationFinish = () => {
    setAnimationPlayed(true); // Once animation is finished, set the state
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Smaller logo and moved up */}
      <Image
        source={{
          uri: "https://i.ibb.co/B3291RZ/9430b192-e88b-48cd-bf31-31afdc813153.jpg",
        }}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Display animation only once */}
      <LottieView
        source={require("./assets/TaskAnimation.json")}
        autoPlay
        loop={false} // Disable loop, play once
        onAnimationFinish={handleAnimationFinish} // Trigger when animation finishes
        style={styles.animationSize}
      />

      <Text style={styles.title}>Opgaver</Text>
      <Text>Her er dagens arbejds opgaver!</Text>
      {/* Display tasks here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  image: {
    width: Dimensions.get("window").width * 0.4, // Smaller size
    height: Dimensions.get("window").width * 0.4, // Smaller size
    borderRadius: Dimensions.get("window").width * 0.2, // Adjusted for smaller image
    marginBottom: 16,
    marginTop: -50, // Move the logo higher up
  },

  animationSize: {
    width: Dimensions.get("window").width * 0.5,
    height: Dimensions.get("window").width * 0.5,
  },
});

export default Opgaver;
