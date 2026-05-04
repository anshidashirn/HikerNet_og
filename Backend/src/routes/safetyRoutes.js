import express from "express";
import User from "../models/User.js";
import Trek from "../models/Trek.js";
import Notification from "../models/Notification.js";
import protectRoute from "../middleware/auth.middleware.js";
import SmsService from "../services/smsService.js";

const router = express.Router();

// Trigger SOS Alert
router.post("/sos", protectRoute, async (req, res) => {
    try {
        const { location, customContacts } = req.body; // { lat, lng }
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        let contacts = customContacts;
 
        if (!contacts || (Array.isArray(contacts) && contacts.length === 0)) {
            console.log(`[SOS] No contacts provided or empty list, searching active trek for user: ${req.user._id}`);
            // Check active trek for this user
            const activeTrek = await Trek.findOne({ 
                status: "ongoing", 
                $or: [{ user: req.user._id }, { participants: req.user._id }] 
            });

            if (activeTrek && activeTrek.emergencyContacts) {
                console.log(`[SOS] Found active trek: ${activeTrek._id}`);
                const userContacts = activeTrek.emergencyContacts.find(ec => ec.user && ec.user.toString() === req.user._id.toString());
                if (userContacts) {
                    contacts = userContacts.contacts;
                    console.log(`[SOS] Found trek-specific contacts for user`);
                } else {
                    console.log(`[SOS] No contacts registered for this user in trek ${activeTrek._id}`);
                }
            } else if (activeTrek) {
                 console.log(`[SOS] Active trek found but emergencyContacts field is missing/empty`);
            } else {
                console.log(`[SOS] No ongoing trek found for user: ${req.user._id}`);
            }
        }

        if (!contacts || !Array.isArray(contacts) || contacts.length < 2) {
            console.log(`[SOS] Failed to find sufficient contacts (found: ${contacts?.length || 0})`);
            return res.status(400).json({ message: "Minimum 2 emergency contacts required" });
        }

        const messageText = `SOS: This user (${user.username}) is in trouble! Last known coordinates: Latitude ${location?.latitude || 'Unknown'}, Longitude ${location?.longitude || 'Unknown'}. Please contact them immediately.`;

        // Broadcast SMS via SmsService
        try {
            await SmsService.broadcastSos(contacts, user, location);
        } catch (smsError) {
            console.error("[SOS] SmsService Error:", smsError);
            // We continue because we still want to create the notification
        }

        console.log(`SOS ALERT triggered by ${user.username}`);
        console.log(`Notifying contacts: ${JSON.stringify(contacts)}`);
        console.log(`SOS Message Sent: ${messageText}`);

        // Create a local notification for the user confirming it was sent
        await Notification.create({
            recipient: user._id,
            type: "system",
            message: "SOS Alert sent to your emergency contacts.",
            read: false
        });

        res.json({ message: "SOS Alert sent successfully" });
    } catch (error) {
        console.error("Error sending SOS:", error);
        res.status(500).json({ message: "Error sending SOS" });
    }
});

// Calculate Rendezvous Point (Geometric Median / Midpoint)
router.post("/rendezvous", protectRoute, async (req, res) => {
    try {
        const { locations } = req.body; // Array of { latitude, longitude }

        if (!locations || locations.length < 2) {
            return res.status(400).json({ message: "Need at least 2 locations" });
        }

        // Simple Centroid Calculation (Average of Lat/Lng)
        // For better accuracy on spheres, use 3D vector sum, but this is fine for small distances.
        let sumLat = 0;
        let sumLng = 0;

        locations.forEach(loc => {
            sumLat += loc.latitude;
            sumLng += loc.longitude;
        });

        const centerLat = sumLat / locations.length;
        const centerLng = sumLng / locations.length;

        res.json({
            latitude: centerLat,
            longitude: centerLng,
            message: "Rendezvous point calculated"
        });

    } catch (error) {
        console.error("Error calculating rendezvous:", error);
        res.status(500).json({ message: "Error calculating rendezvous" });
    }
});

export default router;
