import React, { useState, useEffect } from "react";
import { StatusBar, StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, Modal, TextInput, Platform, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

const AddTaskDialog = ({ showAddDialog, setShowAddDialog, newTask, setNewTask, handleAddTask }) => (
  <Modal visible={showAddDialog} animationType="slide" transparent={true} onRequestClose={() => setShowAddDialog(false)}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Tilføj ny opgave</Text>

        <TextInput
          style={styles.input}
          placeholder="Titel"
          placeholderTextColor="#666"
          value={newTask.title}
          onChangeText={(text) => setNewTask((prev) => ({ ...prev, title: text }))}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Beskrivelse"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
          value={newTask.description}
          onChangeText={(text) => setNewTask((prev) => ({ ...prev, description: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Deadline (YYYY-MM-DD)"
          placeholderTextColor="#666"
          value={newTask.needsToBedoneBy}
          onChangeText={(text) => setNewTask((prev) => ({ ...prev, needsToBedoneBy: text }))}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setShowAddDialog(false);
              setNewTask({ title: "", description: "", needsToBedoneBy: "" });
            }}
          >
            <Text style={styles.buttonText}>Annuller</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleAddTask}>
            <Text style={styles.buttonText}>Tilføj</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const EditTaskDialog = ({ showEditDialog, setShowEditDialog, selectedTask, setSelectedTask, handleEditTask }) => {
  const [editedTask, setEditedTask] = useState({
    title: "",
    description: "",
    needsToBedoneBy: "",
  });

  useEffect(() => {
    if (selectedTask) {
      setEditedTask({
        title: selectedTask.title,
        description: selectedTask.description,
        needsToBedoneBy: selectedTask.needsToBedoneBy?.toDate().toISOString().split("T")[0],
      });
    }
  }, [selectedTask]);

  return (
    <Modal visible={showEditDialog} animationType="slide" transparent={true} onRequestClose={() => setShowEditDialog(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rediger opgave</Text>

          <TextInput
            style={styles.input}
            placeholder="Titel"
            placeholderTextColor="#666"
            value={editedTask.title}
            onChangeText={(text) => setEditedTask((prev) => ({ ...prev, title: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Beskrivelse"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={editedTask.description}
            onChangeText={(text) => setEditedTask((prev) => ({ ...prev, description: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Deadline (YYYY-MM-DD)"
            placeholderTextColor="#666"
            value={editedTask.needsToBedoneBy}
            onChangeText={(text) => setEditedTask((prev) => ({ ...prev, needsToBedoneBy: text }))}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowEditDialog(false);
                setEditedTask({ title: "", description: "", needsToBedoneBy: "" });
              }}
            >
              <Text style={styles.buttonText}>Annuller</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={() => handleEditTask(editedTask)}>
              <Text style={styles.buttonText}>Gem</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AssignTaskDialog = ({
  showAssignDialog,
  setShowAssignDialog,
  selectedTask,
  tempSelectedUser,
  setTempSelectedUser,
  users,
  assignUserToTask,
}) => (
  <Modal visible={showAssignDialog} animationType="slide" transparent={true} onRequestClose={() => setShowAssignDialog(false)}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Tildel Opgave</Text>

        {selectedTask && (
          <>
            <Text style={styles.taskTitle}>{selectedTask.title}</Text>
            <Text style={styles.taskDetails}>Beskrivelse: {selectedTask.description}</Text>
            <Text style={styles.taskDetails}>Deadline: {selectedTask.needsToBedoneBy?.toDate().toLocaleDateString()}</Text>

            <View style={styles.pickerContainer}>
              <Picker selectedValue={tempSelectedUser} onValueChange={(value) => setTempSelectedUser(value)} style={styles.picker}>
                <Picker.Item label="Vælg en medarbejder" value="" color="#000" />
                {users.map((user) => (
                  <Picker.Item key={user.id} label={user.name} value={user.id} color="#000" />
                ))}
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowAssignDialog(false);
                  setTempSelectedUser("");
                }}
              >
                <Text style={styles.buttonText}>Annuller</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={assignUserToTask}>
                <Text style={styles.buttonText}>Tildel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  </Modal>
);

const SætOpgaver = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempSelectedUser, setTempSelectedUser] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    needsToBedoneBy: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setTempSelectedUser(selectedTask.userId || "");
    }
  }, [selectedTask]);

  const fetchData = async () => {
    try {
      const assignmentsSnapshot = await getDocs(collection(db, "assignments"));
      const fetchedTasks = assignmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.needsToBedoneBy) {
      alert("Udfyld venligst alle felter!");
      return;
    }

    try {
      const dateObject = new Date(newTask.needsToBedoneBy);

      if (isNaN(dateObject.getTime())) {
        alert("Ugyldig dato format. Brug venligst YYYY-MM-DD");
        return;
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        needsToBedoneBy: Timestamp.fromDate(dateObject),
      };

      await addDoc(collection(db, "assignments"), taskData);

      setNewTask({
        title: "",
        description: "",
        needsToBedoneBy: "",
      });

      alert("Opgave tilføjet!");
      setShowAddDialog(false);
      await fetchData();
    } catch (error) {
      console.error("Error adding task:", error);
      alert(`Der skete en fejl ved tilføjelse af opgaven: ${error.message}`);
    }
  };

  const handleEditTask = async (editedTask) => {
    if (!editedTask.title || !editedTask.description || !editedTask.needsToBedoneBy) {
      alert("Udfyld venligst alle felter!");
      return;
    }

    try {
      const dateObject = new Date(editedTask.needsToBedoneBy);

      if (isNaN(dateObject.getTime())) {
        alert("Ugyldig dato format. Brug venligst YYYY-MM-DD");
        return;
      }

      const taskRef = doc(db, "assignments", selectedTask.id);
      await updateDoc(taskRef, {
        title: editedTask.title,
        description: editedTask.description,
        needsToBedoneBy: Timestamp.fromDate(dateObject),
      });

      alert("Opgave opdateret!");
      setShowEditDialog(false);
      await fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
      alert(`Der skete en fejl ved opdatering af opgaven: ${error.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      Alert.alert("Bekræft sletning", "Er du sikker på, at du vil slette denne opgave?", [
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            const taskRef = doc(db, "assignments", taskId);
            await deleteDoc(taskRef);
            alert("Opgave slettet!");
            await fetchData();
          },
        },
      ]);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(`Der skete en fejl ved sletning af opgaven: ${error.message}`);
    }
  };

  const assignUserToTask = async () => {
    if (!selectedTask || !tempSelectedUser) {
      alert("Vælg venligst en medarbejder!");
      return;
    }

    try {
      const taskRef = doc(db, "assignments", selectedTask.id);
      await updateDoc(taskRef, { userId: tempSelectedUser });
      setSelectedUser((prev) => ({ ...prev, [selectedTask.id]: tempSelectedUser }));
      alert("Bruger tildelt opgave!");
      setShowAssignDialog(false);
      await fetchData();
    } catch (error) {
      console.error("Error assigning user to task:", error);
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => {
        setSelectedTask(item);
        setShowAssignDialog(true);
      }}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDetails}>Beskrivelse: {item.description}</Text>
      <Text style={styles.taskDetails}>Deadline: {item.needsToBedoneBy?.toDate().toLocaleDateString()}</Text>
      <Text style={styles.taskDetails}>Tildelt til: {users.find((user) => user.id === item.userId)?.name || "Ikke tildelt"}</Text>

      <View style={styles.taskActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedTask(item);
            setShowEditDialog(true);
          }}
        >
          <Text style={styles.actionButtonText}>Rediger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteTask(item.id);
          }}
        >
          <Text style={styles.actionButtonText}>Slet</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Indlæser data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Tildel Brugere til Opgaver</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddDialog(true)}>
        <Text style={styles.addButtonText}>+ Tilføj ny opgave</Text>
      </TouchableOpacity>

      <FlatList data={tasks} keyExtractor={(item) => item.id} renderItem={renderTask} style={styles.list} />

      <AddTaskDialog
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        newTask={newTask}
        setNewTask={setNewTask}
        handleAddTask={handleAddTask}
      />

      <EditTaskDialog
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        handleEditTask={handleEditTask}
      />

      <AssignTaskDialog
        showAssignDialog={showAssignDialog}
        setShowAssignDialog={setShowAssignDialog}
        selectedTask={selectedTask}
        tempSelectedUser={tempSelectedUser}
        setTempSelectedUser={setTempSelectedUser}
        users={users}
        assignUserToTask={assignUserToTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 40,
  },
  loadingText: {
    color: "#333",
    fontSize: 18,
    textAlign: "center",
  },
  list: {
    width: "100%",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: Dimensions.get("window").width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#FF8C00",
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  taskDetails: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
  },
  pickerContainer: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  picker: {
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF8C00",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#1a1a1a",
  },
  input: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#1a1a1a",
  },
  submitButton: {
    backgroundColor: "#FF8C00",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#FF8C00",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#FFA500",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SætOpgaver;
