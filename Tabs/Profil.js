import React, { useEffect } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { auth } from "../firebase";
import LottieView from "lottie-react-native";

const Profil = ({ navigation, route }) => {
  const { userData } = route.params || {}; // Hent userData fra navigationens params

  // Handle Logout
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        console.log("User logged out");
        navigation.navigate("Home"); // Send brugeren tilbage til login
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  // Hvis userData ikke er hentet endnu, vis en loading-tekst
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Henter brugerdata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animationer */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require("../assets/ProfilAnimation.json")}
          autoPlay
          loop
          style={styles.profilAnimation}
        />
        <TouchableOpacity onPress={() => navigation.navigate("Indstillinger")}>
          <LottieView
            source={require("../assets/IndstillingerAnimation.json")}
            autoPlay
            loop
            style={styles.indstillingerAnimation}
          />
        </TouchableOpacity>
      </View>

      {/* Profil Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: userData.imageUrl }} // Profilbillede fra userData
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            <Text style={styles.name}>{userData.email}</Text>
            <Text style={styles.info}>Navn: {userData.name}</Text>
            <Text style={styles.info}>rolle: {userData.role}</Text>
            <Text style={styles.info}>Bruger ID:</Text>
            <Text style={styles.uid}>UID: {userData.uid}</Text>
          </View>
        </View>
      </View>

      {/* Logout-knap */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log ud</Text>
      </TouchableOpacity>

      {/* Footer */}
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
    height: 50,
    marginRight: 10,
    right: 260,
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
  logoutButton: {
    backgroundColor: "#FFA500",
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    fontSize: 14,
    color: "#AAA",
    marginTop: 30,
    textAlign: "center",
  },
});

export default Profil;
