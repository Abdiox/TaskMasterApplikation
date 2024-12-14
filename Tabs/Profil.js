// Imports
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { auth } from "../firebase";
import LottieView from "lottie-react-native";

// Profile Component
const Profil = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  // Fetch authenticated user data
  useEffect(() => {
    const fetchAuthUser = () => {
      const user = auth.currentUser;
      if (user) {
        setUserData({
          name: user.displayName || "Ingen navn",
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL || "https://i.ibb.co/QF0dv4P/Pngtree-avatar-icon-profile-icon-member-5247852.png", // Placeholder image
        });
      } else {
        console.log("Ingen bruger logget ind.");
      }
    };

    fetchAuthUser();
  }, []);

  // Show loading state if userData is null
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Henter brugerdata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView source={require("../assets/ProfilAnimation.json")} autoPlay loop style={styles.profilAnimation} />
        <TouchableOpacity onPress={() => navigation.navigate("Indstillinger")}>
          <LottieView source={require("../assets/IndstillingerAnimation.json")} autoPlay loop style={styles.indstillingerAnimation} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: userData.photoURL }} style={styles.profilePicture} />
          <View style={styles.statsContainer}>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.info}>{userData.email}</Text>
            <Text style={styles.info}>Bruger ID:</Text>
            <Text style={styles.uid}>UID: {userData.uid}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.footer}>TaskMaster © 2024</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  animationContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  profilAnimation: {
    width: 50,
    right: 260,
    height: 50,
    marginRight: 10,
  },
  indstillingerAnimation: {
    width: 50,
    height: 50,
  },
  header: {
    width: "100%",
    marginBottom: 30,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFA500",
    marginRight: 15,
  },
  statsContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  uid: {
    fontSize: 10,
    color: "#FFA500",
    fontWeight: "bold",
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 18,
    color: "#888",
  },
  footer: {
    fontSize: 14,
    color: "#AAA",
    marginTop: 30,
    textAlign: "center",
  },
});

export default Profil;
