import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Animated } from "react-native";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const Profil = ({ navigation, route }) => {
  const { userData } = route.params || {};
  const [taskCount, setTaskCount] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (userData?.uid) {
      fetchTaskCount();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [userData]);

  const fetchTaskCount = async () => {
    try {
      const assignmentsRef = collection(db, "assignments");
      const q = query(assignmentsRef, where("userId", "==", userData.uid));
      const querySnapshot = await getDocs(q);
      setTaskCount(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching task count:", error);
    }
  };

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigation.navigate("Home");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView source={require("../assets/loading-animation.json")} autoPlay loop style={styles.loadingAnimation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header Animations */}
        <View style={styles.animationContainer}>
          <LottieView source={require("../assets/ProfilAnimation.json")} autoPlay loop style={styles.profilAnimation} />
          <TouchableOpacity onPress={() => navigation.navigate("Indstillinger")} style={styles.settingsButton}>
            <LottieView source={require("../assets/IndstillingerAnimation.json")} autoPlay loop style={styles.indstillingerAnimation} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient colors={["rgba(217, 217, 217, 0.25)", "rgba(255, 166, 0, 0.79)"]} style={styles.profileGradient}>
            <Image source={{ uri: userData.imageUrl }} style={styles.profilePicture} />
            <View style={styles.statsContainer}>
              <Text style={styles.name}>{userData.name}</Text>
              <Text style={styles.email}>{userData.email}</Text>
              <View style={styles.divider} />
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>ROLLE</Text>
                  <Text style={styles.infoValue}>{userData.role}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>OPGAVER</Text>
                  <Text style={styles.infoValue}>{taskCount}</Text>
                </View>
              </View>
              <Text style={styles.uid}>UID: {userData.uid}</Text>
            </View>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient colors={["#FFA500", "#FF8C00"]} style={styles.logoutGradient}>
            <Text style={styles.logoutText}>LOG UD</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footer}>TaskMaster © 2024</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingAnimation: {
    width: 100,
    height: 100,
  },
  animationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  profilAnimation: {
    width: 60,
    height: 60,
  },
  settingsButton: {
    backgroundColor: "rgba(255,165,0,0.1)",
    borderRadius: 30,
    padding: 10,
  },
  indstillingerAnimation: {
    width: 40,
    height: 40,
  },
  profileCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 30,
  },
  profileGradient: {
    padding: 20,
    alignItems: "center",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFA500",
    marginBottom: 20,
  },
  statsContainer: {
    width: "100%",
    alignItems: "center",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#ffffff80",
    marginBottom: 15,
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#FFA50040",
    marginVertical: 15,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#ffffff80",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  uid: {
    fontSize: 12,
    color: "#333",
    marginTop: 10,
    bold: true,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: "auto",
  },
  logoutGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    fontSize: 14,
    color: "#ffffff40",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Profil;
