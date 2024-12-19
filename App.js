import React, { useEffect, useState } from "react";
import { app, db, auth } from "./firebase";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { TextInput, Button } from "react-native-paper";
import LottieView from "lottie-react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Opgaver from "./Tabs/Opgaver";
import Hjem from "./Tabs/Hjem";
import SætOpgaver from "./Tabs/SætOpgaver";
import Adminstration from "./Tabs/Adminstration";
import Profil from "./Tabs/Profil";
import Indstillinger from "./Indstillinger/Indstillinger";
import Medarbejder from "./Medarbejder/Medarbejder";
import OmTaskMaster from "./Indstillinger/OmTaskMaster";
import Kontakt from "./Indstillinger/Kontakt";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

async function handleSignIn(enteredEmail, enteredPassword, navigation, setAccountAnimation, setLoginSuccessAnimation) {
  try {
    // Log ind med email og password
    const userCredentials = await signInWithEmailAndPassword(auth, enteredEmail, enteredPassword);
    if (!userCredentials) {
      throw new aler("Login attempt failed. Incorrect email or password.");
    }
    const user = userCredentials.user; // Bruger objekt fra Auth
    const uid = user.uid; // Hent UID for den indloggede bruger

    console.log("Bruger UID:", uid);

    // Hent brugerdata fra Firestore baseret på UID
    const userDocRef = doc(db, "users", uid); // 'users' er samlingen
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      // Log brugerdata og UID før navigation
      console.log("Brugerdata før navigation:", { ...userData, uid });

      // Eksempel: Gem brugerdata i en state, context eller navigation-parametre
      setAccountAnimation(false);
      setLoginSuccessAnimation(true);
      // Naviger videre og inkluder både userData og uid
      setTimeout(() => {
        navigation.navigate("Main", { userData: { ...userData, uid } });
      }, 150000); // Giv mere tid til animationen
    } else {
      console.error("Ingen brugerdata fundet i Firestore.");
      alert("Ingen brugerdata fundet. Kontakt administrator.");
    }
  } catch (error) {
    console.error("Fejl ved login:", error);
    alert("Forkert email eller adgangskode.");
  }
}

function LoginSite({ navigation }) {
  const [AccountAnimation, setAccountAnimation] = useState(true);
  const [LoginSuccessAnimation, setLoginSuccessAnimation] = useState(false);
  const [enteredEmail, setEmail] = useState("");
  const [enteredPassword, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const uid = user.uid;
          const userDocRef = doc(db, "users", uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log("Auto-login brugerdata:", userData);

            // Navigér til Main med brugerdata
            navigation.navigate("Main", { userData: { ...userData, uid } });
          } else {
            console.error("Brugerdata findes ikke.");
            alert("Fejl ved hentning af brugerdata. Kontakt administrator.");
          }
        } catch (error) {
          console.error("Fejl ved auto-login:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://i.ibb.co/B3291RZ/9430b192-e88b-48cd-bf31-31afdc813153.jpg",
        }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Velkommen til TaskMaster!</Text>
      {AccountAnimation && <LottieView source={require("./assets/AccountAnimation.json")} autoPlay loop style={styles.animationSize} />}
      <Text style={styles.label}>Login:</Text>
      <TextInput label="Email" mode="outlined" style={styles.input} value={enteredEmail} onChangeText={(text) => setEmail(text)} />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        style={styles.input}
        value={enteredPassword}
        onChangeText={(text) => setPassword(text)}
      />
      <Button
        mode="contained"
        onPress={() => handleSignIn(enteredEmail, enteredPassword, navigation, setAccountAnimation, setLoginSuccessAnimation)}
        buttonColor="#FFA500"
        textColor="#fff"
      >
        Sign In
      </Button>
      {LoginSuccessAnimation && (
        <LottieView
          source={require("./assets/LoginSuccesfullyAnimation.json")}
          autoPlay
          loop={false} // Kun spil én gang
          style={styles.animationSize}
        />
      )}

      <StatusBar style="auto" />
      <Text style={styles.footerText}>TaskMaster © 2024</Text>
    </View>
  );
}

function BottomTabs({ route }) {
  const { userData } = route.params || {}; // Hent brugerdata fra navigationen

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Hjem") {
            iconName = "home";
          } else if (route.name === "Opgaver") {
            iconName = "assignment";
          } else if (route.name === "SætOpgaver") {
            iconName = "add-task";
          } else if (route.name === "Adminstration") {
            iconName = "admin-panel-settings";
          } else if (route.name === "Profil") {
            iconName = "person";
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FFA500",
        tabBarInactiveTintColor: "#FFF",
        tabBarStyle: {
          backgroundColor: "#111",
        },
      })}
    >
      <Tab.Screen name="Hjem" component={Hjem} />
      <Tab.Screen name="Opgaver" component={Opgaver} initialParams={{ userData }} />

      {/* Vis kun fanen "SætOpgaver" hvis brugerens rolle er "Byggeleder" */}
      {(userData?.role === "Byggeleder" || userData?.role === "CEO") && <Tab.Screen name="SætOpgaver" component={SætOpgaver} />}

      {/* Vis kun fanen Adminstration hvis brugerens rolle er "Byggeleder" */}
      {(userData?.role === "Byggeleder" || userData?.role === "CEO") && <Tab.Screen name="Adminstration" component={Adminstration} />}

      <Tab.Screen name="Profil" component={Profil} initialParams={{ userData }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={LoginSite} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Indstillinger" component={Indstillinger} />
        <Stack.Screen name="Medarbejder" component={Medarbejder} />
        <Stack.Screen name="OmTaskMaster" component={OmTaskMaster} />
        <Stack.Screen name="Kontakt" component={Kontakt} />
      </Stack.Navigator>
    </NavigationContainer>
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
  footerText: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
});
