import React, { useState, useEffect } from "react";
import { StatusBar, StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const SætOpgaver = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Hent assignments
      const assignmentsSnapshot = await getDocs(collection(db, "assignments"));
      const fetchedTasks = assignmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Hent users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const fetchedUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(fetchedTasks);
      setUsers(fetchedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const assignUserToTask = async (taskId, userId) => {
    try {
      const taskRef = doc(db, "assignments", taskId);
      await updateDoc(taskRef, { userId });
      alert("Bruger tildelt opgave!");
    } catch (error) {
      console.error("Error assigning user to task:", error);
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDetails}>Beskrivelse: {item.description}</Text>
      <Text style={styles.taskDetails}>Deadline: {item.needsToBedoneBy?.toDate().toLocaleDateString()}</Text>

      <Picker
        selectedValue={selectedUser[item.id] || ""}
        onValueChange={(value) => {
          setSelectedUser((prev) => ({ ...prev, [item.id]: value }));
          assignUserToTask(item.id, value);
        }}
      >
        <Picker.Item label="Vælg en medarbejder" value="" />
        {users.map((user) => (
          <Picker.Item key={user.id} label={user.name} value={user.id} />
        ))}
      </Picker>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Indlæser data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Tildel Brugere til Opgaver</Text>
      <FlatList data={tasks} keyExtractor={(item) => item.id} renderItem={renderTask} style={styles.list} />
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
  taskDetails: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
});

export default SætOpgaver;
