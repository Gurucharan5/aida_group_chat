import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, Button, StyleSheet } from 'react-native';
// import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

const NameCheckScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const checkUserName = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || !userDoc.data()?.name) {
          setModalVisible(true);
        }

        setLoading(false);
      }
    };

    checkUserName();
  }, [user]);

  const handleSaveName = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) return; // 👈 Make sure user is available

    const uid = currentUser.uid;
    if (name.trim() === '') return;

    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { name: name.trim() }, { merge: true });
    setModalVisible(false);
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text>Welcome to the screen!</Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Please enter your name to continue:</Text>
            <TextInput
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Button title="Save" onPress={handleSaveName} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NameCheckScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 10
  },
  input: {
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 20
  }
});
