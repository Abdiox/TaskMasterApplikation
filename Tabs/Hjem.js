import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions, Animated } from "react-native";
import { Button } from "react-native-paper";
import LottieView from "lottie-react-native";

const Hjem = ({ navigation }) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const fadeOutAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setShowAnimation(false));
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://i.ibb.co/B3291RZ/9430b192-e88b-48cd-bf31-31afdc813153.jpg",
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      {showAnimation && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <LottieView
            source={require("../assets/WelcomeAnimation.json")}
            autoPlay
            loop={false}
            onAnimationFinish={fadeOutAnimation}
            style={styles.animation}
          />
        </Animated.View>
      )}

      {!showAnimation && (
        <View style={styles.content}>
          <Text style={styles.title}>Velkommen til TaskMaster!</Text>
          <Text style={styles.subtitle}>Din partner i effektiv opgavestyring</Text>
          <Text style={styles.description}>
            Få styr på dine projekter og opgaver med TaskMaster. Organiser, deleger og track dine opgaver nemt og effektivt.
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate("Opgaver")} style={styles.customButton} labelStyle={styles.buttonText}>
            Kom i gang
          </Button>
        </View>
      )}
      <Text style={styles.footer}>TaskMaster © 2024</Text>
    </View>
  );
};

export default Hjem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 20,
    justifyContent: "space-between",
  },

  logo: {
    width: Dimensions.get("window").width * 0.35,
    height: Dimensions.get("window").width * 0.35,
    borderRadius: Dimensions.get("window").width * 0.25,
    marginBottom: 16,
  },

  animation: {
    width: Dimensions.get("window").width * 0.6,
    height: Dimensions.get("window").width * 0.6,
    marginVertical: 20,
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
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
    marginBottom: 20,
  },

  footer: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 10,
  },

  customButton: {
    backgroundColor: "#FFA500",
    width: Dimensions.get("window").width * 0.8,
    borderRadius: 25,
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
  },
});
