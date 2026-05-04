import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SosModal({ visible, timer, onCancel }) {
    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Ionicons name="warning" size={50} color="#dc3545" />
                    <Text style={styles.title}>Are you in trouble or resting?</Text>
                    <Text style={styles.desc}>We noticed you haven't moved in a while.</Text>
                    
                    <View style={styles.timerContainer}>
                        <Text style={styles.timer}>{timer}</Text>
                        <Text style={styles.timerLabel}>seconds remaining</Text>
                    </View>

                    <Text style={styles.warning}>
                        If you don't respond, an SOS will be sent to your emergency contact.
                    </Text>

                    <TouchableOpacity style={styles.btn} onPress={onCancel}>
                        <Text style={styles.btnText}>YES, I AM OKAY</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 350,
        elevation: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#dc3545',
        marginTop: 10,
        marginBottom: 5
    },
    desc: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff3cd',
        padding: 20,
        borderRadius: 75,
        width: 150,
        height: 150,
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#ffc107'
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#856404'
    },
    timerLabel: {
        fontSize: 12,
        color: '#856404',
        marginTop: -5
    },
    warning: {
        fontSize: 12,
        color: '#dc3545',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic'
    },
    btn: {
        backgroundColor: '#28a745',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center'
    },
    btnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
