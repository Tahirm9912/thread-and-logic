import pool from "../config/db.js";

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in all required fields" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    // Message length validation
    if (message.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Message must be at least 10 characters" 
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: "Message is too long (max 1000 characters)" 
      });
    }

    // Insert into database
    await pool.query(
      `INSERT INTO contact_messages (name, email, phone, message, status) 
       VALUES ($1, $2, $3, $4, 'unread')`,
      [name, email, phone || null, message]
    );

    return res.json({ 
      success: true, 
      message: "Message sent successfully! We'll get back to you soon." 
    });

  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
};

// Get all messages (admin)
export const getAllMessages = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT * FROM contact_messages
    `;

    let values = [];

    if (status && status !== 'all') {
      query += ` WHERE status = $1`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const messages = await pool.query(query, values);

    res.render("layouts/admin/messages", {
      messages: messages.rows,
      filterStatus: status || 'all'
    });

  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).render("layouts/error", {
      message: "Could not load messages"
    });
  }
};

// Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId, status } = req.body;

    const validStatuses = ['unread', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    await pool.query(
      "UPDATE contact_messages SET status = $1 WHERE id = $2",
      [status, messageId]
    );

    return res.json({ success: true });

  } catch (err) {
    console.error("Update message status error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Could not update status" 
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM contact_messages WHERE id = $1", [id]);

    return res.json({ success: true });

  } catch (err) {
    console.error("Delete message error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Could not delete message" 
    });
  }
};