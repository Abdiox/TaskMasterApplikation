import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { TextInput, Button } from "react-native-paper";
import LottieView from "lottie-react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import Opgaver from "./Opgaver";
import Hjem from "./Hjem";
import SætOpgaver from "./SætOpgaver";
import Adminstration from "./Adminstration";
import Profil from "./Profil";
import { LinearGradient } from "react-native-linear-gradient"; // Importer LinearGradient

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Login-skærm
function LoginSite({ navigation }) {
  const [AccountAnimation, setAccountAnimation] = useState(true);
  const [LoginSuccessAnimation, setLoginSuccessAnimation] = useState(false);

  const handleSignIn = () => {
    setAccountAnimation(false);
    setLoginSuccessAnimation(true);
    setTimeout(() => {
      navigation.navigate("Main"); // Naviger til bundnavigationen
    }, 2000);
    console.log("Sign In pressed");
  };

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
      <TextInput label="Username" mode="outlined" style={styles.input} />
      <TextInput label="Password" mode="outlined" secureTextEntry style={styles.input} />
      <Button mode="contained" onPress={handleSignIn} buttonColor="#FFA500" textColor="#fff">
        Sign In
      </Button>
      {LoginSuccessAnimation && <LottieView source={require("./assets/LoginSuccesfullyAnimation.json")} autoPlay loop style={styles.animationSize} />}

      <StatusBar style="auto" />
      <Text style={styles.footerText}>TaskMaster © 2024</Text>
    </View>
  );
}

// Bundnavigation
function BottomTabs() {
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
      <Tab.Screen name="Opgaver" component={Opgaver} />
      <Tab.Screen name="SætOpgaver" component={SætOpgaver} />
      <Tab.Screen name="Adminstration" component={Adminstration} />
      <Tab.Screen name="Profil" component={Profil} />
    </Tab.Navigator>
  );
}

// Hovednavigator
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={LoginSite} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
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
