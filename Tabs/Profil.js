import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { auth } from "../firebase";

const Profil = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchAuthUser = () => {
      const user = auth.currentUser; // Få den loggede bruger
      if (user) {
        setUserData({
          name: user.displayName || "Ingen navn",
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL || "https://via.placeholder.com/120", // Placeholder, hvis foto ikke er angivet
        });
      } else {
        console.log("Ingen bruger logget ind.");
      }
    };

    fetchAuthUser();
  }, []);

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Henter brugerdata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: userData.photoURL }} style={styles.profilePicture} />
          <View style={styles.statsContainer}>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.info}>{userData.email}</Text>
            <Text style={styles.info}>UID: {userData.uid}</Text>
          </View>
        </View>
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFA500",
    marginRight: 20,
  },
  statsContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  footer: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
});

export default Profil;
