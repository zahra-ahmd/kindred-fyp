import { supabase } from '..@/lib/supabase'; // Import your Supabase client setup

// Fetch all conversations for a user (assuming you have a 'conversations' table with a foreign key to 'users')
export const getConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, last_message, last_message_time')
      .eq('user_id', userId); // Adjust this query to match your schema (e.g., filter by userId)

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Fetch messages for a specific conversation
export const getMessages = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, text, sender_id, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }); // Order messages by creation time

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (conversationId, text, senderId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          text: text,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Create a new conversation (if needed)
export const createConversation = async (userId, participantId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          participant_id: participantId, // Assuming a participant is another user
        },
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};
