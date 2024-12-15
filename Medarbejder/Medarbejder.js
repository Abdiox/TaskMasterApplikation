import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import LottieView from "lottie-react-native";

const Medarbejder = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserNumber, setNewUserNumber] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const animation = useRef(null); // Create a ref for the LottieView animation

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Fejl ved hentning af brugere:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserNumber || !newUserRole) {
      Alert.alert("Fejl", "Alle felter skal udfyldes.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "users"), {
        name: newUserName,
        email: newUserEmail,
        number: newUserNumber,
        role: newUserRole,
      });

      setUsers([
        ...users,
        {
          id: docRef.id,
          name: newUserName,
          email: newUserEmail,
          number: newUserNumber,
          role: newUserRole,
        },
      ]);

      // Start animation every time a new user is added
      animation.current.play();

      // Clear input fields and close the modal
      setNewUserName("");
      setNewUserEmail("");
      setNewUserNumber("");
      setNewUserRole("");
      setShowAddUserModal(false);
    } catch (error) {
      console.error("Fejl ved tilføjelse af medarbejder:", error);
    }
  };

  const handleEditUser = async (id) => {
    if (!newUserName || !newUserEmail) {
      Alert.alert("Fejl", "Både navn og e-mail skal udfyldes.");
      return;
    }

    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        name: newUserName,
        email: newUserEmail,
      });

      const updatedUsers = users.map((user) => (user.id === id ? { ...user, name: newUserName, email: newUserEmail } : user));
      setUsers(updatedUsers);
      setNewUserName("");
      setNewUserEmail("");
      setShowUserDetailsModal(false);
    } catch (error) {
      console.error("Fejl ved opdatering af medarbejder:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const userRef = doc(db, "users", id);
      await deleteDoc(userRef);

      const filteredUsers = users.filter((user) => user.id !== id);
      setUsers(filteredUsers);
      setShowUserDetailsModal(false);
    } catch (error) {
      console.error("Fejl ved sletning af medarbejder:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedUser(item);
        setShowUserDetailsModal(true);
      }}
    >
      <View style={styles.userCard}>
        <Image
          source={{
            uri: item.photoURL || "https://i.ibb.co/QF0dv4P/Pngtree-avatar-icon-profile-icon-member-5247852.png",
          }}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || "Ingen navn"}</Text>
          <Text style={styles.userRole}>{item.role || "Rolle ikke angivet"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Henter medarbejdere...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medarbejdere</Text>

      {/* Add user modal */}
      <Modal visible={showAddUserModal} animationType="slide" onRequestClose={() => setShowAddUserModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Opret ny medarbejder</Text>
          <TextInput style={styles.input} placeholder="Navn" value={newUserName} onChangeText={setNewUserName} />
          <TextInput style={styles.input} placeholder="E-mail" value={newUserEmail} onChangeText={setNewUserEmail} />
          <TextInput style={styles.input} placeholder="Nummer" value={newUserNumber} onChangeText={setNewUserNumber} />
          <TextInput style={styles.input} placeholder="Rolle" value={newUserRole} onChangeText={setNewUserRole} />
          <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
            <Text style={styles.addButtonText}>Tilføj medarbejder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowAddUserModal(false)}>
            <Text style={styles.closeButtonText}>Luk</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Display Add User animation if set */}
      <LottieView
        ref={animation}
        source={require("../assets/AddUserSuccesAnimation.json")}
        autoPlay={false}
        loop={false}
        style={[styles.animationSize, { pointerEvents: "none" }]} // Make the animation non-interactive
      />

      {/* Add an overlay with smooth fade-in effect */}
      {loading && (
        <View style={styles.overlay}>
          <LottieView
            ref={animation} // Attach the ref to the animation component
            source={require("../assets/AddUserSuccesAnimation.json")}
            autoPlay={true}
            loop={false}
            style={styles.animationSize}
          />
        </View>
      )}
      {/* User details modal */}
      <Modal visible={showUserDetailsModal} animationType="slide" onRequestClose={() => setShowUserDetailsModal(false)}>
        {selectedUser && (
          <View style={styles.modalContainer}>
            <View style={styles.userCard}>
              <Image
                source={{
                  uri: selectedUser.photoURL || "https://i.ibb.co/QF0dv4P/Pngtree-avatar-icon-profile-icon-member-5247852.png",
                }}
                style={styles.userImage}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{selectedUser.name}</Text>
                <Text style={styles.userEmail}>{selectedUser.email}</Text>
                <Text style={styles.userRole}>{selectedUser.number}</Text>
                <Text style={styles.userRole}>{selectedUser.role}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setNewUserName(selectedUser.name);
                setNewUserEmail(selectedUser.email);
                setEditingUserId(selectedUser.id);
                setShowUserDetailsModal(false);
              }}
            >
              <Text style={styles.editButtonText}>Rediger</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(selectedUser.id)}>
              <Text style={styles.deleteButtonText}>Slet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowUserDetailsModal(false)}>
              <Text style={styles.closeButtonText}>Luk</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      {/* Add button */}
      <TouchableOpacity style={styles.addUserButton} onPress={() => setShowAddUserModal(true)}>
        <Text style={styles.addUserButtonText}>+</Text>
      </TouchableOpacity>

      <FlatList data={users} keyExtractor={(item) => item.id} renderItem={renderItem} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Tilbage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },

  animationSize: {
    width: 250,
    height: 250,
    alignSelf: "center", // Centers the animation
    zIndex: 10, // Brings the animation to the front
    position: "absolute",
    top: "30%", // Adjust based on where you want it to appear on the screen
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent black overlay
    justifyContent: "center", // Center the animation
    alignItems: "center",
    zIndex: 5, // Ensures the overlay is above the content
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#555",
    marginVertical: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#777",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
    width: "100%",
  },
  addButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "#333",
    fontSize: 16,
  },
  addUserButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#FFA500",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },
  addUserButtonText: {
    color: "#FFF",
    fontSize: 24,
  },
  editButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Medarbejder;
