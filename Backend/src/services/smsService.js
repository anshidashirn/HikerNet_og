import fs from 'fs';
import path from 'path';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

/**
 * SMS Service
 * Uses Twilio for real SMS delivery if credentials are provided.
 * Otherwise, falls back to logging for simulation.
 */
class SmsService {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.logFile = path.join(this.logDir, 'sms_outbox.log');
        
        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }

        // Initialize Twilio if credentials exist
        this.isTwilioReady = !!(
            process.env.TWILIO_ACCOUNT_SID && 
            process.env.TWILIO_AUTH_TOKEN && 
            process.env.TWILIO_PHONE_NUMBER
        );

        if (this.isTwilioReady) {
            this.client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            console.log('[SmsService] Twilio initialized for REAL SMS delivery.');
        } else {
            console.log('[SmsService] Twilio credentials missing. Running in SIMULATION mode.');
        }
    }

    async sendSms(to, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] TO: ${to} | MSG: ${message}\n`;

        try {
            // ALWAYS log to file/console for debugging
            console.log('\n--- OUTGOING SMS ---');
            console.log(`To: ${to}`);
            console.log(`Message: ${message}`);
            
            fs.appendFileSync(this.logFile, logEntry);

            if (this.isTwilioReady) {
                const response = await this.client.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: to
                });
                console.log(`[SMS Sent] SID: ${response.sid}`);
                return { success: true, sid: response.sid };
            } else {
                console.log('[SIMULATION] Logged to sms_outbox.log');
                console.log('--------------------\n');
                return { success: true, messageId: `mock_${Date.now()}` };
            }
        } catch (error) {
            console.error('Failed to send/log SMS:', error);
            return { success: false, error: error.message };
        }
    }

    async broadcastSos(contacts, user, location) {
        const lat = location?.latitude || 'Unknown';
        const lng = location?.longitude || 'Unknown';
        const mapsLink = lat !== 'Unknown' ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : 'Location Unavailable';
        
        const messageText = `SOS ALERT: ${user.username} is in trouble! Last known location: ${mapsLink}`;

        const results = await Promise.all(
            contacts.map(contact => this.sendSms(contact.phoneNumber, messageText))
        );

        return results;
    }
}

export default new SmsService();
