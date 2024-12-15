import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Dimensions, FlatList } from "react-native";
import LottieView from "lottie-react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import { da } from "date-fns/locale";

const Opgaver = () => {
  const [taskAnimation, setTaskAnimation] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const assignmentsCollection = collection(db, "assignments");
      const querySnapshot = await getDocs(assignmentsCollection);
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationFinish = () => {
    setTaskAnimation(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return format(date, "dd/MM/yyyy", { locale: da });
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskDetails}>Skal være færdig: {formatDate(item.needsToBedoneBy)}</Text>
      <Text style={styles.taskDetails}>Status: {item.isDone ? "Færdig" : "I gang"}</Text>
      {item.location && (
        <Text style={styles.taskDetails}>
          Lokation: {item.location.latitude}, {item.location.longitude}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Indlæser opgaver...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <LottieView
        source={require("../assets/TaskAnimation.json")}
        autoPlay
        loop={false}
        onAnimationFinish={handleAnimationFinish}
        style={styles.animationSize}
      />

      <Text style={styles.title}>Opgaver</Text>
      <Text style={styles.subtitle}>Her er dagens arbejdsopgaver!</Text>

      <FlatList data={tasks} keyExtractor={(item) => item.id} renderItem={renderTask} style={styles.list} />

      <Text style={styles.footerText}>TaskMaster © 2024</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  list: {
    width: "100%",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: Dimensions.get("window").width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  taskDetails: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
  animationSize: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").width * 0.8,
    marginBottom: 20,
  },
});

export default Opgaver;
