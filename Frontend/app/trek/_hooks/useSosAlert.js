import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import client from '../../../api/client';
import { getDistance } from '../../../utils/geoUtils';

export function useSosAlert(location, isResting, params) {
    const [showSosPrompt, setShowSosPrompt] = useState(false);
    const [sosTimer, setSosTimer] = useState(120);
    const [sosTriggered, setSosTriggered] = useState(false);

    const lastMovedTime = useRef(Date.now());
    const lastLocation = useRef(null);
    const intervalRef = useRef(null);
    const promptTimerRef = useRef(null);

    // Only active if we have location
    const isSosActive = !!location;

    useEffect(() => {
        if (!location || !isSosActive) return;

        const now = Date.now();
        if (lastLocation.current) {
            const dist = getDistance(
                lastLocation.current.latitude,
                lastLocation.current.longitude,
                location.latitude,
                location.longitude
            );
            // If moved more than 5 meters, consider not idle
            if (dist > 5) {
                lastMovedTime.current = now;
                lastLocation.current = location;
            }
        } else {
            lastLocation.current = location;
            lastMovedTime.current = now;
        }
    }, [location, isSosActive]);

    useEffect(() => {
        if (!isSosActive || sosTriggered || isResting) return;

        intervalRef.current = setInterval(() => {
            const idleTime = Date.now() - lastMovedTime.current;
            // FOR TESTING: 1 minute = 60,000 ms
            if (idleTime > 60000 && !showSosPrompt) {
                setShowSosPrompt(true);
                setSosTimer(20); // 20 second timer for testing
            }
        }, 5000); // Check more frequently (every 5 seconds) for testing

        return () => clearInterval(intervalRef.current);
    }, [showSosPrompt, sosTriggered, isSosActive, isResting]);

    useEffect(() => {
        if (showSosPrompt && sosTimer > 0) {
            promptTimerRef.current = setTimeout(() => {
                setSosTimer(prev => prev - 1);
            }, 1000);
        } else if (showSosPrompt && sosTimer === 0 && !sosTriggered) {
            triggerSos();
        }

        return () => clearTimeout(promptTimerRef.current);
    }, [showSosPrompt, sosTimer, sosTriggered]);

    const triggerSos = async () => {
        setSosTriggered(true);
        setShowSosPrompt(false);
        try {
            let contacts = params?.emergencyContacts;
            if (contacts && typeof contacts === 'string') {
                contacts = JSON.parse(contacts);
            }

            await client.post('/safety/sos', {
                location: location || lastLocation.current,
                customContacts: contacts
            });
            Alert.alert("SOS Alert Sent", "Emergency contacts have been notified.");
        } catch (error) {
            console.error("Failed to send SOS:", error);
            Alert.alert("SOS Error", "Failed to send SOS Alert. Please check your connection.");
        }
    };

    const cancelSosPrompt = () => {
        setShowSosPrompt(false);
        lastMovedTime.current = Date.now(); // Reset idle timer
    };

    return {
        showSosPrompt,
        sosTimer,
        cancelSosPrompt
    };
}
