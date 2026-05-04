import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SosContactModal({ visible, initialContacts, onConfirm, onCancel }) {
    const [contacts, setContacts] = useState(initialContacts || []);

    useEffect(() => {
        if (visible) {
            if (initialContacts && initialContacts.length > 0) {
                setContacts(JSON.parse(JSON.stringify(initialContacts)));
            } else {
                loadRecentContacts();
            }
        }
    }, [visible, initialContacts]);

    const loadRecentContacts = async () => {
        try {
            const saved = await AsyncStorage.getItem('recent_sos_contacts');
            if (saved) {
                setContacts(JSON.parse(saved));
            } else {
                setContacts([{ name: '', phoneNumber: '' }, { name: '', phoneNumber: '' }]);
            }
        } catch (e) {
            setContacts([{ name: '', phoneNumber: '' }, { name: '', phoneNumber: '' }]);
        }
    };

    const addContact = () => {
        setContacts([...contacts, { name: '', phoneNumber: '' }]);
    };

    const updateContact = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const removeContact = (index) => {
        const newContacts = contacts.filter((_, i) => i !== index);
        setContacts(newContacts);
    };

    const handleConfirm = async () => {
        const validContacts = contacts.filter(c => c.name.trim() && c.phoneNumber.trim());
        if (validContacts.length < 2) {
            Alert.alert("Requirement", "Please provide at least 2 valid emergency contacts.");
            return;
        }
        
        try {
            await AsyncStorage.setItem('recent_sos_contacts', JSON.stringify(validContacts));
        } catch (e) {
            console.error("Failed to save recent contacts", e);
        }
        
        onConfirm(validContacts);
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Confirm SOS Contacts</Text>
                    <Text style={styles.subtitle}>These contacts will be notified in case of emergency during this trek.</Text>
                    
                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {contacts.map((contact, index) => (
                            <View key={index} style={styles.contactItem}>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginRight: 10 }]}
                                        placeholder="Name (e.g. Mom, Police)"
                                        value={contact.name}
                                        onChangeText={(text) => updateContact(index, 'name', text)}
                                    />
                                    <TouchableOpacity onPress={() => removeContact(index)}>
                                        <Ionicons name="close-circle" size={24} color="#dc3545" />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    keyboardType="phone-pad"
                                    value={contact.phoneNumber}
                                    onChangeText={(text) => updateContact(index, 'phoneNumber', text)}
                                />
                            </View>
                        ))}
                        
                        <TouchableOpacity style={styles.addBtn} onPress={addContact}>
                            <Ionicons name="add-circle" size={20} color="#4A7C44" />
                            <Text style={styles.addBtnText}>Add Another Contact</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                            <Text style={styles.confirmBtnText}>Confirm & Start</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 25,
        maxHeight: '80%',
        elevation: 10
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1A3317',
        textAlign: 'center',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20
    },
    list: {
        marginBottom: 20
    },
    contactItem: {
        backgroundColor: '#F8FAF8',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E2EBE1'
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        padding: 12,
        fontSize: 16
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    addBtnText: {
        color: '#4A7C44',
        fontWeight: '700',
        marginLeft: 8
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cancelBtn: {
        flex: 1,
        padding: 15,
        alignItems: 'center'
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: '700'
    },
    confirmBtn: {
        flex: 2,
        backgroundColor: '#4A7C44',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center'
    },
    confirmBtnText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 16
    }
});
