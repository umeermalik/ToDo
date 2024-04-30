import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'task.db' });

const FrontPage = props => {
  const [reviews, setReviews] = useState([]);

  const fetchDataFromDB = () => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM reviews`,
        [],
        (sqlTxn, res) => {
          console.log("Notes retrieved successfully");
          let len = res.rows.length;
          let results = [];
          if (len > 0) {
            for (let i = 0; i < len; i++) {
              let item = res.rows.item(i);
              results.push({ id: item.id, Reviews: item.Reviews });
            }
          }
          setReviews(results);
        },
        error => {
          console.log("error on getting products " + error.message);
        },
      );
    });
  };

  useEffect(() => {
    fetchDataFromDB();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchDataFromDB();
    }, [])
  );

  const deleteReview = id => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM reviews WHERE id = ?',
        [id],
        () => {
          fetchDataFromDB();
        },
        error => {
          console.error('Error deleting review: ', error);
        }
      );
    });
  };

  const updateNote = item => {
    props.navigation.navigate('UpdateNote', { note: item });
  };

  return (
    <View style={{ backgroundColor: 'white', flex: 1, marginTop: 50 }}>
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <View style={{ flex: 1 }}>
              <Text>{item.Reviews}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteReview(item.id)} style={{ width: 40, marginRight: 10 }}>
              <Text style={{ color: 'red', marginBottom: 50 }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => updateNote(item)} style={{ width: 60 }}>
              <Text style={{ color: 'blue', marginBottom: 50 }}>Update</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity onPress={() => props.navigation.navigate('NoteEntry')} style={{ backgroundColor: '#FFFF00', width: 60, height: 60, borderRadius: 40, marginTop: 15, marginLeft: 160, alignItems: 'center' }}>
        <Text style={{ fontSize: 40 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const NoteEntry = props => {
  const [note, setNote] = useState('');

  const saveNote = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO reviews (Reviews) VALUES (?)',
        [note],
        () => {
          console.log('Note saved successfully');
          setNote('');
          props.navigation.navigate('ToDo');
        },
        error => {
          console.error('Error saving note: ', error);
        }
      );
    });
  };

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        placeholder="Write your note"
        value={note}
        onChangeText={text => setNote(text)}
        style={{ backgroundColor: 'lightgrey', height: 400, paddingTop: 10, paddingLeft: 10, textAlignVertical: 'top', textAlign: 'left' }}
        multiline={true}
      />
      <TouchableOpacity onPress={saveNote} style={{ backgroundColor: '#FFFF00', width: 200, height: 60, borderRadius: 15, marginTop: 15, marginLeft: 90 }}>
        <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 24 }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const UpdateNote = ({ route, navigation }) => {
  const { note } = route.params;
  const [updatedNote, setUpdatedNote] = useState(note.Reviews);

  const updateNote = () => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE reviews SET Reviews = ? WHERE id = ?',
        [updatedNote, note.id],
        () => {
          console.log('Note updated successfully');
          navigation.goBack();
        },
        error => {
          console.error('Error updating note: ', error);
        }
      );
    });
  };

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        placeholder="Update your note"
        value={updatedNote}
        onChangeText={text => setUpdatedNote(text)}
        style={{ backgroundColor: 'lightgrey', height: 400, paddingTop: 10, paddingLeft: 10, textAlignVertical: 'top', textAlign: 'left' }}
        multiline={true}
      />
      <TouchableOpacity onPress={updateNote} style={{ backgroundColor: '#FFFF00', width: 200, height: 60, borderRadius: 15, marginTop: 15, marginLeft: 90 }}>
        <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 24 }}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, Reviews TEXT)',
        [],
        () => {
          console.log('Table created successfully');
        },
        error => {
          console.error('Error creating table: ', error);
        }
      );
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ToDo"
        screenOptions={{ headerStyle: { backgroundColor: '#00A040' }, headerTintColor: 'white' }}
      >
        <Stack.Screen name="ToDo" component={FrontPage} />
        <Stack.Screen name="NoteEntry" component={NoteEntry} />
        <Stack.Screen name="UpdateNote" component={UpdateNote} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
