/**
 * Email Service
 * Handles API calls to FastAPI backend and Supabase real-time
 */

import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch all emails from Supabase
 * @param {string} folder - Folder to fetch from (default: 'Inbox')
 * @returns {Promise<Array>} Array of email objects
 */
export async function fetchEmails(folder = 'Inbox') {
    try {
        const { data, error } = await supabase
            .from('emails')
            .select('*')
            .eq('folder', folder)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map Supabase format to frontend format
        return data.map(email => ({
            id: email.id,
            messageId: email.message_id,
            from: email.sender,
            subject: email.subject,
            body: email.body,
            category: email.category,
            summary: email.summary,
            folder: email.folder,
            isSpam: email.is_spam,
            readStatus: email.read_status,
            createdAt: email.created_at,
        }));
    } catch (error) {
        console.error('Error fetching emails:', error);
        throw error;
    }
}

/**
 * Fetch a single email by ID
 * @param {string} emailId - Email UUID
 * @returns {Promise<Object>} Email object
 */
export async function fetchEmailById(emailId) {
    try {
        const { data, error } = await supabase
            .from('emails')
            .select('*')
            .eq('id', emailId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching email:', error);
        throw error;
    }
}

/**
 * Mark an email as read
 * @param {string} emailId - Email UUID
 */
export async function markAsRead(emailId) {
    try {
        const { error } = await supabase
            .from('emails')
            .update({ read_status: true })
            .eq('id', emailId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error marking email as read:', error);
        throw error;
    }
}

/**
 * Send a reply via the FastAPI backend
 * Backend handles SMTP to keep credentials server-side
 * @param {Object} replyData - { emailId, replyText, toAddress, subject }
 */
export async function sendReply(replyData) {
    try {
        const response = await fetch(`${API_URL}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header when auth is implemented
                // 'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                email_id: replyData.emailId,
                reply_text: replyData.replyText,
                to_address: replyData.toAddress,
                subject: replyData.subject,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send reply');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending reply:', error);
        throw error;
    }
}

/**
 * Trigger on-demand AI analysis for an email
 * @param {string} emailId - Email UUID
 */
export async function analyzeOnDemand(emailId) {
    try {
        const response = await fetch(`${API_URL}/analyze-on-demand`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_id: emailId }),
        });

        if (!response.ok) {
            throw new Error('Failed to start analysis');
        }

        return await response.json();
    } catch (error) {
        console.error('Error triggering analysis:', error);
        throw error;
    }
}

/**
 * Subscribe to real-time email updates
 * @param {Function} onInsert - Callback when new email is inserted
 * @param {Function} onUpdate - Callback when email is updated
 * @returns {Object} Subscription channel (call .unsubscribe() to cleanup)
 */
export function subscribeToEmails(onInsert, onUpdate) {
    const channel = supabase
        .channel('emails-realtime')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'emails',
            },
            (payload) => {
                console.log('📧 New email received:', payload.new);
                if (onInsert) {
                    // Map to frontend format
                    const email = {
                        id: payload.new.id,
                        messageId: payload.new.message_id,
                        from: payload.new.sender,
                        subject: payload.new.subject,
                        body: payload.new.body,
                        category: payload.new.category,
                        summary: payload.new.summary,
                        folder: payload.new.folder,
                        isSpam: payload.new.is_spam,
                        readStatus: payload.new.read_status,
                        createdAt: payload.new.created_at,
                    };
                    onInsert(email);
                }
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'emails',
            },
            (payload) => {
                console.log('🔄 Email updated:', payload.new);
                if (onUpdate) {
                    const email = {
                        id: payload.new.id,
                        messageId: payload.new.message_id,
                        from: payload.new.sender,
                        subject: payload.new.subject,
                        body: payload.new.body,
                        category: payload.new.category,
                        summary: payload.new.summary,
                        folder: payload.new.folder,
                        isSpam: payload.new.is_spam,
                        readStatus: payload.new.read_status,
                        createdAt: payload.new.created_at,
                    };
                    onUpdate(email);
                }
            }
        )
        .subscribe((status) => {
            console.log('📡 Realtime subscription status:', status);
        });

    return channel;
}
