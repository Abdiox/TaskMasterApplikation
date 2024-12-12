import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { Button } from "react-native-paper";
import LottieView from "lottie-react-native";

const Profil = ({ navigation }) => {
  const [profilAnimation, setProfilAnimation] = useState(true);

  return (
    <View style={styles.container}>
      {/* Animationer: Profil til venstre og Indstillinger til højre */}
      {profilAnimation && (
        <View style={styles.animationContainer}>
          <LottieView source={require("./assets/ProfilAnimation.json")} autoPlay loop style={styles.profilAnimation} />
          <LottieView source={require("./assets/IndstillingerAnimation.json")} autoPlay loop style={styles.indstillingerAnimation} />
        </View>
      )}

      {/* Profil Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          {/* Profilbillede */}
          <Image source={{ uri: "https://i.ibb.co/tMbLN1W/profile-icon-design-free-vector.jpg" }} style={styles.profilePicture} />

          <View style={styles.statsContainer}>
            <Text style={styles.name}>Vini Jr</Text>
            <Text style={styles.info}>ViniJr@gmail.com</Text>
            <Text style={styles.info}>12345678</Text>
            <Text style={styles.info}>Estadio Santiago Bernebau</Text>
          </View>
        </View>

        {/* Task Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Opgaver</Text>
          </View>
        </View>
      </View>

      {/* Rediger Profil knap */}
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate("RedigerProfil")}>
        Rediger Profil
      </Button>

      {/* Footer */}
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
    left: 20,
    width: 60,
    height: 60,
  },

  profilAnimation: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 50,
    height: 50,
  },

  indstillingerAnimation: {
    position: "absolute",
    top: -12,
    left: 312,
    width: 50,
    height: 50,
  },

  header: {
    width: "100%",
    marginBottom: 20,
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
    flex: 1,
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

  stats: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
  },

  statItem: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFA500",
  },

  statLabel: {
    fontSize: 14,
    color: "#777",
  },

  button: {
    marginTop: 20,
    width: Dimensions.get("window").width * 0.8,
    backgroundColor: "#FFA500",
    paddingVertical: 10,
  },

  footer: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
});

export default Profil;
