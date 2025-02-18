const db = require("../../db");

//Technician API
const GET_ALLAPPOINTMENT_FOR_TECHNICIAN = (req, res) => {
  const sql = "SELECT * FROM appointment where status = 'Unassigned'";
  db.query(sql, (err, data) => {
    if (err) {
      res.json("Fail to fetch");
    }
    res.send(data);
  });
};

const GET_APPOINTMENT_COUNT_FOR_TECHNICIAN = (req, res) => {
  // SQL query to count appointments based on the assistant's pincode and status 'Unassigned'
  const sql = `
      SELECT COUNT(DISTINCT appointment_id) AS appointmentCount
      FROM appointment
      JOIN assistant ON appointment.pincode = assistant.pincode
      WHERE appointment.status = 'Unassigned'
    `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching appointment count:", err);
      return res.status(500).json("Failed to fetch appointment count");
    }

    // Send the count of appointments as the response
    res.json(data[0].appointmentCount);
  });
};

const GET_ALL_APPOINTMENT_FOR_TECHNICIAN = (req, res) => {
  const lab_id = req.query.lab_id; // Get lab_id from request query

  if (!lab_id) {
    return res
      .status(401)
      .json({ error: "Unauthorized: No assistant ID provided" });
  }

  const sql = `
    SELECT DISTINCT a.*
    FROM appointment a
    JOIN laboratory s 
    ON FIND_IN_SET(a.pincode, s.pincode) > 0
    WHERE s.lab_id = ? AND a.status = 'Unassigned';
    `;

  db.query(sql, [lab_id], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch data" });
    }
    res.json(data);
  });
};

// Assistant

// Get All Assistant
const GET_ALL_ASSISTANT = (req, res) => {
  const sql = "SELECT * FROM assistant";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching laboratories:", err);
      return res.status(500).json("Failed to fetch laboratories");
    }
    return res.status(200).json(data);
  });
};

//Get Assistants for Laboratory
const GET_ASSISTANT = (req, res) => {
  const { token_key } = req.query;

  if (!token_key) {
    return res.status(400).json("Token key is required");
  }

  const sql = `SELECT * FROM assistant WHERE token_key = ?`;

  db.query(sql, [token_key], (err, result) => {
    if (err) {
      console.error("Error fetching assistants:", err);
      return res.status(500).json("Failed to fetch assistants");
    }

    if (result.length === 0) {
      return res.status(404).json("No assistants found");
    }

    return res.status(200).json(result);
  });
};

const GET_ASSISTANT_COUNT = (req, res) => {
  const { token_key } = req.query;

  if (!token_key) {
    return res.status(400).json("Token key is required");
  }

  const sql = `SELECT COUNT(*) AS assistantCount FROM assistant WHERE token_key = ?`;

  db.query(sql, [token_key], (err, result) => {
    if (err) {
      console.error("Error fetching assistant count:", err);
      return res.status(500).json("Failed to fetch assistant count");
    }

    return res.status(200).json({ assistantCount: result[0].assistantCount });
  });
};

// Get Assistant by ID
const GET_ASSISTANT_BY_ID = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM assistant WHERE assistant_id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error fetching assistant:", err);
      return res.status(500).json("Failed to fetch assistant");
    }
    if (data.length === 0) {
      return res.status(404).json("Assistant not found");
    }
    return res.status(200).json(data[0]);
  });
};

const ADD_ASSISTANT = (req, res) => {
  const { name, mobileno, email, pincode, username, password, token_key } =
    req.body;

  if (
    !name ||
    !mobileno ||
    !email ||
    !pincode ||
    !username ||
    !password ||
    !token_key
  ) {
    return res.status(400).json("All fields are required!");
  }

  const sql = `
      INSERT INTO assistant (name, mobileno, email, pincode, username, password, token_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [name, mobileno, email, pincode, username, password, token_key], // Include token_key in the query
    (err, result) => {
      if (err) {
        console.error("Error adding assistant:", err);
        return res.status(500).json("Failed to add assistant");
      }
      return res.status(201).json("Assistant added successfully");
    }
  );
};

// Update Assistant by ID
const UPDATE_ASSISTANT = (req, res) => {
  const { id } = req.params;
  const { name, mobileno, email, pincode, username, password } = req.body;

  if (!name || !mobileno || !email || !pincode || !username || !password) {
    return res.status(400).json("All fields are required!");
  }

  const sql = `
      UPDATE assistant
      SET name = ?, mobileno = ?, email = ?, pincode = ?, username = ?, password = ?
      WHERE assistant_id = ?
    `;
  db.query(
    sql,
    [name, mobileno, email, pincode, username, password, id],
    (err, result) => {
      if (err) {
        console.error("Error updating assistant:", err);
        return res.status(500).json("Failed to update assistant");
      }
      if (result.affectedRows === 0) {
        return res.status(404).json("Assistant not found");
      }
      return res.status(200).json("Assistant updated successfully");
    }
  );
};

// Delete Assistant by ID
const DELETE_ASSISTANT = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM assistant WHERE assistant_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting assistant:", err);
      return res.status(500).json("Failed to delete assistant");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json("Assistant not found");
    }
    return res.status(200).json("Assistant deleted successfully");
  });
};

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK (Ensure you have your Firebase credentials)
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ASSIGN_TECHNICIAN = (req, res) => {
  console.log("Request body:", req.body);

  const { technicianId, appointmentIds } = req.body;

  if (!technicianId || !appointmentIds || !Array.isArray(appointmentIds)) {
    return res
      .status(400)
      .json("Technician ID and Appointment IDs are required!");
  }

  // Insert Technician into assign_appointment
  const assignments = appointmentIds.map((appointmentId) => [
    appointmentId,
    technicianId,
  ]);

  const assignSql = `
      INSERT INTO assign_appointment (appointment_id, technician_id)
      VALUES ?
    `;

  db.query(assignSql, [assignments], (assignErr, assignResult) => {
    if (assignErr) {
      console.error("SQL Error on Insert:", assignErr);
      return res
        .status(500)
        .json("Failed to assign technicians to appointments");
    }

    console.log("Insert Result:", assignResult);

    // Update appointment status after assignment
    const updateSql = `
        UPDATE appointment
        SET status = 'Assigned'
        WHERE appointment_id IN (?)
      `;

    db.query(updateSql, [appointmentIds], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("SQL Error on Update:", updateErr);
        return res
          .status(500)
          .json("Failed to update appointment statuses to 'Assigned'");
      }

      console.log("Update Result:", updateResult);

      // Fetch FCM token after insertion
      const getTokenSql = `
          SELECT a.fcmtoken_key 
          FROM assistant a 
          JOIN assign_appointment aa ON a.assistant_id = aa.technician_id
          WHERE aa.technician_id = ?
          LIMIT 1
        `;

      db.query(getTokenSql, [technicianId], (tokenErr, tokenResult) => {
        if (tokenErr) {
          console.error("SQL Error on Fetching FCM Token:", tokenErr);
          return res.status(500).json("Failed to fetch FCM token");
        }

        if (tokenResult.length === 0 || !tokenResult[0].fcmtoken_key) {
          console.warn("No FCM token found for the given technician.");
          return res.status(404).json("FCM token not found for technician");
        }

        const fcmToken = tokenResult[0].fcmtoken_key;
        console.log("Fetched FCM Token:", fcmToken);

        // Send Push Notification after success
        const message = {
          notification: {
            title: "New Appointment Assigned",
            body: `You have been assigned ${appointmentIds.length} new appointments.`,
          },
          token: fcmToken, // Technician's FCM token
        };

        admin
          .messaging()
          .send(message)
          .then((response) => {
            console.log("Notification sent successfully:", response);
            return res.status(200).json({
              message:
                "Technician assigned to appointments and notification sent successfully",
            });
          })
          .catch((error) => {
            console.error("Error sending notification:", error);
            return res
              .status(500)
              .json("Technician assigned but notification failed.");
          });
      });
    });
  });
};

module.exports = {
  GET_ALLAPPOINTMENT_FOR_TECHNICIAN,
  GET_APPOINTMENT_COUNT_FOR_TECHNICIAN,
  GET_ALL_APPOINTMENT_FOR_TECHNICIAN,
  GET_ALL_ASSISTANT,
  GET_ASSISTANT,
  GET_ASSISTANT_COUNT,
  GET_ASSISTANT_BY_ID,
  ADD_ASSISTANT,
  UPDATE_ASSISTANT,
  DELETE_ASSISTANT,
  ASSIGN_TECHNICIAN,
};
