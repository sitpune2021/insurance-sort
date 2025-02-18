const db = require("../../db");

// Get All Laboratories
const GET_ALL_LABORATORIES = (req, res) => {
  const sql = "SELECT * FROM laboratory";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching laboratories:", err);
      return res.status(500).json("Failed to fetch laboratories");
    }
    return res.status(200).json(data);
  });
};

const GET_LABORATORIES = (req, res) => {
  const { token_key } = req.query; // Get token_key from the request query

  if (!token_key) {
    return res.status(400).json("Token key is required");
  }

  const sql = `SELECT * FROM laboratory WHERE token_key = ?`;

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

const GET_LABORATORIES_COUNT = (req, res) => {
  const sql = "SELECT COUNT(*) AS count FROM laboratory";
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json("Fail to fetch appointment count");
    }
    return res.json(data[0].count); // Send the count of appointments
  });
};

// Get Laboratory by ID
const GET_LABORATORY_BY_ID = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM laboratory WHERE lab_id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error fetching laboratory:", err);
      return res.status(500).json("Failed to fetch laboratory");
    }
    if (data.length === 0) {
      return res.status(404).json("Laboratory not found");
    }
    return res.status(200).json(data[0]);
  });
};

const DOWNLOAD_LABORAORY = async (req, res) => {
  try {
    // Fetch laboratory data from the database
    const query = "SELECT * FROM laboratory";
    db.query(query, async (err, results) => {
      if (err) {
        console.error("Error fetching laboratories:", err);
        return res.status(500).json("Failed to fetch laboratories");
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laboratories");

      // Define columns
      worksheet.columns = [
        { header: "ID", key: "lab_id", width: 10 },
        { header: "Title", key: "title", width: 20 },
        { header: "Country", key: "country", width: 20 },
        { header: "State", key: "state", width: 20 },
        { header: "City", key: "city", width: 20 },
        { header: "Pincode", key: "pincode", width: 15 },
        { header: "Address", key: "address", width: 30 },
        { header: "Name", key: "name", width: 20 },
        { header: "Mobile No", key: "mobileno", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Username", key: "username", width: 20 },
        { header: "Client Name", key: "client_name", width: 20 },
        { header: "Client Email", key: "client_email", width: 25 },
        { header: "Client Address", key: "client_address", width: 30 },
        { header: "Token Key", key: "token_key", width: 30 },
      ];

      // Add rows from the database
      results.forEach((row) => {
        worksheet.addRow(row);
      });

      // Save file in the server directory
      const filePath = path.join(__dirname, "laboratories.xlsx");
      await workbook.xlsx.writeFile(filePath);

      // Send file as a response
      res.download(filePath, "Laboratories.xlsx", (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json("Error sending file");
        }
        // Delete file after sending
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json("Error generating file");
  }
};

const ADD_LABORATORY = (req, res) => {
  const {
    title,
    country,
    state,
    city,
    pincode,
    address,
    name,
    mobileno,
    email,
    username,
    password,
    token_key, // New field for subadmin_key
  } = req.body;

  console.log("Received request to add laboratory:", req.body); // Log the incoming request

  if (
    !title ||
    !country ||
    !state ||
    !city ||
    !pincode ||
    !address ||
    !name ||
    !mobileno ||
    !email ||
    !username ||
    !password ||
    !token_key // Check for new subadmin_key field
  ) {
    console.log("Validation error: All fields are required");
    return res.status(400).json("All fields are required!");
  }

  // SQL query to insert into the laboratory table
  const laboratorySql = `
      INSERT INTO laboratory (title, country, state, city, pincode, address, name, mobileno, email, username, password, token_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  console.log("SQL Query for laboratory:", laboratorySql);

  // SQL query to insert into the admin_login table
  const adminLoginSql = `
      INSERT INTO admin_login (token_key, name, email, username, password, post)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  console.log("SQL Query for admin login:", adminLoginSql);

  // Generate a random token_key
  const tokenKey = Math.random().toString(36).substr(2, 10);
  console.log("Generated token key:", tokenKey);

  // Start a transaction to ensure data consistency
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction Error:", err);
      return res.status(500).json("Transaction Error");
    }

    // Insert into the laboratory table
    db.query(
      laboratorySql,
      [
        title,
        country,
        state,
        city,
        pincode,
        address,
        name,
        mobileno,
        email,
        username,
        password,

        token_key, // Pass subadmin_key field
      ],
      (err, labResult) => {
        if (err) {
          console.error("Error adding laboratory:", err);
          return db.rollback(() => {
            res.status(500).json("Failed to add laboratory");
          });
        }
        console.log("Laboratory added successfully:", labResult);

        const lab_id = labResult.insertId;
        // Insert into the admin_login table
        db.query(
          adminLoginSql,
          [tokenKey, name, email, username, password, "laboratory"],
          (err, adminResult) => {
            if (err) {
              console.error("Error adding admin login:", err);
              return db.rollback(() => {
                res.status(500).json("Failed to add admin login");
              });
            }
            console.log("Admin login added successfully:", adminResult);

            // Commit the transaction
            db.commit((err) => {
              if (err) {
                console.error("Commit Error:", err);
                return db.rollback(() => {
                  res.status(500).json("Failed to commit transaction");
                });
              }

              console.log("Transaction committed successfully");
              res.status(201).json({
                message: "Laboratory and Admin Login added successfully",
                lab_id: lab_id,
              });
            });
          }
        );
      }
    );
  });
};

// Update Laboratory by ID
const UPDATE_LABORATORY = (req, res) => {
  const { id } = req.params;
  const {
    title,
    country,
    state,
    city,
    pincode,
    address,
    name,
    mobileno,
    email,
    username,
    password,
  } = req.body;

  // Validate that all required fields are provided
  if (
    !title ||
    !country ||
    !state ||
    !city ||
    !pincode ||
    !address ||
    !name ||
    !mobileno ||
    !email ||
    !username ||
    !password
  ) {
    return res.status(400).json("All fields are required!");
  }

  // Validate pincode
  if (isNaN(pincode) || pincode.length !== 6) {
    return res.status(400).json("Pincode must be a 6-digit number.");
  }

  const sql = `
      UPDATE laboratory
      SET title = ?, country = ?, state = ?, city = ?, pincode = ?, address = ?, 
          name = ?, mobileno = ?, email = ?, username = ?, password = ?
          
      WHERE lab_id = ?
    `;

  db.query(
    sql,
    [
      title,
      country,
      state,
      city,
      pincode,
      address,
      name,
      mobileno,
      email,
      username,
      password,

      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating laboratory:", err);
        return res.status(500).json("Failed to update laboratory");
      }
      if (result.affectedRows === 0) {
        return res.status(404).json("Laboratory not found");
      }
      return res.status(200).json("Laboratory updated successfully");
    }
  );
};

// Delete Laboratory by ID
const DELETE_LABORATORY = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM laboratory WHERE lab_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting laboratory:", err);
      return res.status(500).json("Failed to delete laboratory");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json("Laboratory not found");
    }
    return res.status(200).json("Laboratory deleted successfully");
  });
};

const GET_ALL_APPOINTMENT_FOR_LABORATORY = (req, res) => {
  const lab_id = req.query.lab_id; // Get lab_id from request query

  if (!lab_id) {
    return res.status(401).json({ error: "Unauthorized: No assistant ID provided" });
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


module.exports = {
  GET_ALL_LABORATORIES,
  GET_LABORATORIES,
  GET_LABORATORIES_COUNT,
  GET_LABORATORY_BY_ID,
  DOWNLOAD_LABORAORY,
  ADD_LABORATORY,
  UPDATE_LABORATORY,
  DELETE_LABORATORY,
  GET_ALL_APPOINTMENT_FOR_LABORATORY
};
