
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const db = require("../../db");

// Email configuration
const imapConfig = {
  user: "prajwalsitsolutions@gmail.com",
  password: "fpvw pxjq ietk svdl", // Use an app password for Gmail
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};


// Email Pattern no 7

async function parseAndInsertEmail7(emailContent) {
  try {
    // Helper function to extract fields with regex
    const extractField = (pattern, text, defaultValue = null) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : defaultValue;
    };

    // Extracting individual fields from the email content
    const tpaDetails = extractField(/sales number\s*:\s*(\d+)/i, emailContent);
    const name = extractField(
      /\*?Customer Full Name:\*?\s*([\w-]+)/i,
      emailContent
    );
    const appointmentNo = extractField(
      /\*?application Number:\*?\s*(\d+)/i,
      emailContent
    );
    const mobileno = extractField(
      /Contact No\.\s*\(.*?\)\s*\|\s*\d+\s*\|\s*(\d{10})/i,
      emailContent
    );
    const time = extractField(
      /\*?Appointment date & time:\*?\s*([\d-]+\s[\d:]+\s[APM]+)/i,
      emailContent
    );

    // Extracting address details
    const addressDetails = emailContent.match(
      /HOME Visit Address\s*\*?\s*([\s\S]+?),\s*([\w\s]+),\s*([\w\s]+)\s*[-.,\s]*\s*(\d{6})/i
    );
    const parsedAddress = addressDetails
      ? addressDetails[1].trim().replace(/\n/g, " ")
      : null;
    const city = addressDetails ? addressDetails[2].trim() : null;
    const state = addressDetails ? addressDetails[3].trim() : null;
    const pincode = addressDetails ? addressDetails[4] : null;

    const treatmentMatch = emailContent.match(
      /Medicals[\s\S]*?(Medical Examination Report[\s\S]*?)\nNote[\s\S]*?(In Biochemistry.*)/i
    );
    const treatmentDetails = treatmentMatch
      ? `${treatmentMatch[1]
          .trim()
          .replace(/\n/g, " ")}. Note - ${treatmentMatch[2]
          .trim()
          .replace(/\n/g, " ")}`
      : "No treatment details found";

    // Log the parsed data for verification
    console.log("Parsed Email Data Before Insert:");
    console.log({
      tpaDetails,
      name,
      appointmentNo,
      mobileno,
      time,
      address: parsedAddress,
      country: "India",
      state,
      city,
      pincode,
      treatment: treatmentDetails,
    });

    // Insert data into the database
    db.query(
      "INSERT INTO appointment (tpa_details, name, appointment_no, mobileno, time, address, country, state, city, pincode, treatment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        tpaDetails,
        name,
        appointmentNo,
        mobileno,
        time,
        parsedAddress,
        "India",
        state,
        city,
        pincode,
        treatmentDetails, // Storing only the relevant treatment details
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting data into the database:", err.message);
        } else {
          console.log("Data inserted successfully!", result);
        }
      }
    );
  } catch (error) {
    console.error("Error parsing email content:", error.message);
  }
}

// Read emails and process them
function readEmails7() {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) throw err;

      imap.search(["UNSEEN"], (err, results) => {
        if (err || results.length === 0) {
          console.log("No new emails found.");
          imap.end();
          return;
        }

        const fetch = imap.fetch(results, { bodies: "" });
        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error("Error parsing email:", err.message);
                return;
              }

              const emailContent = parsed.text;
              console.log("Processing email content:\n", emailContent);

              // Parse and insert the email content into the database
              await parseAndInsertEmail7(emailContent);
            });
          });
        });

        fetch.once("end", () => {
          console.log("Done fetching all unseen emails.");
          imap.end();
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP Error:", err);
  });

  imap.once("end", () => {
    console.log("Connection closed.");
  });

  imap.connect();
}

// Start reading emails
// readEmails7();

//Email Pattern no 8
async function parseAndInsertNewEmail8(emailContent) {
  try {
    // Helper function to extract fields using regex
    const extractField = (pattern, text, defaultValue = null) => {
      const match = text.match(pattern);
      if (match) {
        console.log(`Match for pattern ${pattern}:`, match[1].trim()); // Log matched data
        return match[1].trim();
      }
      return defaultValue; // Return default value if no match found
    };

    // Extracting individual fields from the email content
    const appointmentNo = extractField(
      /Appointment ID\s*\*?(\d+)\*?/i,
      emailContent
    );
    const name = extractField(/Customer Name\s*\*([^*]+)\*/i, emailContent);
    const mobileno = extractField(
      /Customer Contact\s*\*(\d{10})\*/i,
      emailContent
    );
    const insuranceName = extractField(
      /Corporate Name\s*\*([\w\s]+)\*/i,
      emailContent
    );
    let address = extractField(
      /Customer Address\s*\*([\s\S]+?)\*/i,
      emailContent
    );

    // Extract the pincode from the address
    const pincodeMatch = address ? address.match(/\b\d{6}\b/) : null;
    const pincode = pincodeMatch ? pincodeMatch[0] : null;

    const formattedAddress = address
      ? address
          .replace(/\n/g, " ")
          .replace(/\b\d{6}\b/, "")
          .trim() // Remove pincode from address
      : null;

    const dob = extractField(
      /Date of Birth\s*\*([\d\-a-zA-Z]+)\*/i,
      emailContent
    );
    const packageName = extractField(
      /PackageName\s*\*([\s\S]+?)\*/i,
      emailContent
    );
    const formattedPackageName = packageName.replace(/\n/g, " ").trim();
    const appointmentDate = extractField(
      /Date of Appointment\s*\*([\d\-a-zA-Z]+)\*/i,
      emailContent
    );
    const appointmentTime = extractField(
      /Appointment Time\s*\*([\d:APM\- ]+)\*/i,
      emailContent
    );

    const time =
      appointmentDate && appointmentTime
        ? `${appointmentDate} ${appointmentTime}`
        : null;

    let testDetailsStart =
      emailContent.indexOf("*Test Details*") + "*Test Details*".length;
    let testDetails = emailContent.slice(testDetailsStart).trim();

    // Clean up extra characters or unwanted lines
    let formattedTestDetails = testDetails
      .split("\n")
      .filter((item) => item.trim().length > 0) // Remove empty lines
      .map((item) => item.trim()) // Trim each line
      .join(", "); // Join with commas

    let cleanedTestDetails = formattedTestDetails
      .replace(/(\*Please find below SPOC details.*|Please note:.*)/gs, "")
      .trim();

    // Log the parsed data for verification before insertion
    console.log("Parsed Email Data Before Insert:", {
      appointmentNo,
      name,
      mobileno,
      insuranceName,
      formattedAddress,
      pincode,
      dob,
      formattedPackageName,
      time,
      cleanedTestDetails,
    });

    const formattedDob = dob ? new Date(dob).toISOString().split("T")[0] : null; // Date format YYYY-MM-DD

    // Insert data into the database
    const query = `
      INSERT INTO appointment 
      (appointment_no, name, mobileno, insurance_name, address, pincode, dob, package_name, time, treatment) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      appointmentNo,
      name,
      mobileno,
      insuranceName,
      formattedAddress,
      pincode,
      formattedDob, // Use formatted dob
      formattedPackageName,
      time,
      cleanedTestDetails,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting data into the database:", err.message);
        throw new Error("Database insertion failed");
      } else {
        console.log("Data inserted successfully!", result);
      }
    });
  } catch (error) {
    console.error("Error parsing new email content:", error.message);
  }
}

// Read emails and process them
function readNewEmails8() {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) throw err;

      imap.search(["UNSEEN"], (err, results) => {
        if (err || results.length === 0) {
          console.log("No new emails found.");
          imap.end();
          return;
        }

        const fetch = imap.fetch(results, { bodies: "" });
        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error("Error parsing email:", err.message);
                return;
              }

              const emailContent = parsed.text;
              console.log("Processing new email content:\n", emailContent);

              // Parse and insert the new email content into the database
              await parseAndInsertNewEmail8(emailContent);
            });
          });
        });

        fetch.once("end", () => {
          console.log("Done fetching all unseen emails.");
          imap.end();
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP Error:", err);
  });

  imap.once("end", () => {
    console.log("Connection closed.");
  });

  imap.connect();
}

// Start reading the new emails
// readNewEmails8();

//Email Pattern no 9

async function parseAndInsert9Email(emailContent) {
  try {
    // Helper function to extract fields with regex
    const extractField = (pattern, text, defaultValue = null) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : defaultValue;
    };

    // Extracting individual fields from the email content
    const tpaDetails = extractField(/sales number\s*:\s*(\d+)/i, emailContent);
    const name = extractField(
      /\*?Customer Full Name:\*?\s*([\w\s.-]+)/i,
      emailContent
    );

    const appointmentNo = extractField(
      /\*?application Number:\*?\s*(\d+)/i,
      emailContent
    );
    const mobileno = extractField(/\b(\d{10})\b/, emailContent);
    const time = extractField(
      /\*?Appointment date & time:\*?\s*([\d-]+\s[\d:]+\s[APM]+)/i,
      emailContent
    );

    // Extracting address details
    const addressDetails = emailContent.match(
      /HOME Visit Address\s*\*?\s*([\s\S]+?),\s*([\w\s]+),\s*([\w\s]+)\s*[-.,\s]*\s*(\d{6})/i
    );
    const parsedAddress = addressDetails
      ? addressDetails[1].trim().replace(/\n/g, " ")
      : null;
    const city = addressDetails ? addressDetails[2].trim() : null;
    const state = addressDetails ? addressDetails[3].trim() : null;
    const pincode = addressDetails ? addressDetails[4] : null;

    const treatmentPattern = /\*Medicals\*\n\n([\s\S]*?)\n\n\*/;
    const treatmentMatch = emailContent.match(treatmentPattern);
    let treatment = treatmentMatch ? treatmentMatch[1].trim() : null;

    // Remove newlines and extra spaces to create a single-line string
    if (treatment) {
      treatment = treatment.replace(/\n+/g, " ").replace(/\s+/g, " ");
    }

    // Log the parsed data for verification
    console.log("Parsed Email Data Before Insert:");
    console.log({
      tpaDetails,
      name,
      appointmentNo,
      mobileno,
      time,
      address: parsedAddress,
      country: "India",
      state,
      city,
      pincode,
      treatment,
    });

    // Insert data into the database
    db.query(
      "INSERT INTO appointment (tpa_details, name, appointment_no, mobileno, time, address, country, state, city, pincode, treatment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        tpaDetails,
        name,
        appointmentNo,
        mobileno,
        time,
        parsedAddress,
        "India",
        state,
        city,
        pincode,
        treatment, // Storing only the relevant treatment details
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting data into the database:", err.message);
        } else {
          console.log("Data inserted successfully!", result);
        }
      }
    );
  } catch (error) {
    console.error("Error parsing email content:", error.message);
  }
}

// Read emails and process them
function readEmails9() {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) throw err;

      imap.search(["UNSEEN"], (err, results) => {
        if (err || results.length === 0) {
          console.log("No new emails found.");
          imap.end();
          return;
        }

        const fetch = imap.fetch(results, { bodies: "" });
        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error("Error parsing email:", err.message);
                return;
              }

              const emailContent = parsed.text;
              console.log("Processing email content:\n", emailContent);

              // Parse and insert the email content into the database
              await parseAndInsert9Email(emailContent);
            });
          });
        });

        fetch.once("end", () => {
          console.log("Done fetching all unseen emails.");
          imap.end();
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP Error:", err);
  });

  imap.once("end", () => {
    console.log("Connection closed.");
  });

  imap.connect();
}

// Start reading emails
// readEmails9();

// Email Pattern No 10
// Function to parse and insert email content into the database
async function parseAndInsertEmail10(emailContent) {
  try {
    // Helper function to extract fields using regex
    const extractField = (pattern, text, defaultValue = null) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : defaultValue;
    };

    // Extracting fields from the email content
    const tpaDetails = extractField(/sales number\s*:\s*(\d+)/i, emailContent);

    // Extracting Customer Name
    const name = extractField(
      /\*Customer Name\*\s*([a-zA-Z\s.-]+)/i, // Regex for Customer Name
      emailContent
    );

    // Extracting Application ID as appointment_no
    const appointmentNo = extractField(
      /Application ID\s*[:*]\s*(\w+)/i, // Regex for Application ID
      emailContent
    );

    // Extracting 10-digit mobile number
    const mobileno = extractField(/\b(\d{10})\b/, emailContent);

    // Extracting Date of Appointment
    const dateOfAppointment = extractField(
      /Date Of Appointment\s*[:*]\s*([\d/]+)/i,
      emailContent
    );

    // Extracting Time of Appointment
    const timeOfAppointment = extractField(
      /Time Of Appointment\s*[:*]\s*([\d:]+\s*[APM]*)/i,
      emailContent
    );

    // Combining Date and Time
    const time =
      dateOfAppointment && timeOfAppointment
        ? `${dateOfAppointment} ${timeOfAppointment}`
        : null;

    const addressDetails = emailContent.match(
      /\*Customer Address\*\s*([a-zA-Z0-9\s,.-]+)\s*([\w\s]+)\s*([\w\s]+)\s*(\d{6})/i
    );

    // Parsing address, city, state, and pincode
    const parsedAddress = addressDetails
      ? addressDetails[1].trim().replace(/\n/g, " ")
      : null;
    const city = addressDetails ? addressDetails[2].trim() : null;
    const state = addressDetails ? addressDetails[3].trim() : null;
    const pincode = addressDetails ? addressDetails[4] : null;

    const packagePattern =
      /- \*Package Name: ([\s\S]*?)\*[\s\S]*?Tests Included: ([\s\S]*?)(?=\n\n|$)/g;
    let packageInfo = "";
    let match;

    while ((match = packagePattern.exec(emailContent)) !== null) {
      const packageName = match[1].trim();
      const testsIncluded = match[2]
        .trim()
        .replace(/\n+/g, ", ") // Replace newlines with commas
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .replace(/,\s*$/, ""); // Remove trailing comma if any

      packageInfo += `- *Package Name: ${packageName}*\n        Tests Included: ${testsIncluded},\n\n`;
    }

    // Now, set the treatment field to only include the package details
    let treatment = packageInfo.trim(); // Removing any extra spaces or newlines

    // Log or save the updated treatment field
    console.log(treatment);

    // Example of how you would update the database
    const updatedData = {
      treatment: treatment, // Updated treatment field with package details only
    };

    // Logging parsed data for debugging
    console.log("Parsed Email Data:");
    console.log({
      tpaDetails,
      name,
      appointmentNo,
      mobileno,
      time, // Combined date and time will be here
      address: parsedAddress,
      country: "India",
      state,
      city,
      pincode,
      treatment,
    });

    // Insert data into the database
    db.query(
      "INSERT INTO appointment (tpa_details, name, appointment_no, mobileno, time, address, country, state, city, pincode, treatment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        tpaDetails,
        name,
        appointmentNo,
        mobileno,
        time, // Insert the combined date and time into the database
        parsedAddress,
        "India",
        state,
        city,
        pincode,
        treatment,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting data into the database:", err.message);
        } else {
          console.log("Data inserted successfully:", result);
        }
      }
    );
  } catch (error) {
    console.error("Error parsing email content:", error.message);
  }
}

// Function to read emails and process them
function readEmails10() {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) {
        console.error("Error opening inbox:", err.message);
        return;
      }

      imap.search(["UNSEEN"], (err, results) => {
        if (err || results.length === 0) {
          console.log("No new emails found.");
          imap.end();
          return;
        }

        const fetch = imap.fetch(results, { bodies: "" });
        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error("Error parsing email:", err.message);
                return;
              }

              const emailContent = parsed.text;
              console.log("Processing email content:\n", emailContent);

              // Parse and insert the email content into the database
              await parseAndInsertEmail10(emailContent);
            });
          });
        });

        fetch.once("end", () => {
          console.log("Done fetching all unseen emails.");
          imap.end();
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP Error:", err.message);
  });

  imap.once("end", () => {
    console.log("Connection closed.");
  });

  imap.connect();
}

// Start reading emails
// readEmails10();

// Email Pattern No 11
// Function to parse and insert email content into the database
async function parseAndInsertEmail11(emailContent, emailSubject) {
  try {
    // Helper function to extract fields using regex
    const extractField = (pattern, text, defaultValue = null) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : defaultValue;
    };

    // Extracting proposal number from the email subject
    const appointmentNo = extractField(
      /Proposal No[:\s]*([\w\d]+)/i, // Regex for Proposal No
      emailSubject
    );

    // Extracting tpaDetails (Test Location)
    const tpaDetails = extractField(
      /Test Location\s*:\s*([^\n]+)/i,
      emailContent
    );

    // Extracting the full address
    const addressMatch = emailContent.match(
      /Test Location\s*:\s*[^\n]+\n([\s\S]+?),\s*IND/i
    );
    const address = addressMatch
      ? addressMatch[1].replace(/\n/g, ", ").trim()
      : null;

    // Extracting city, state, and pincode directly from the address
    const addressDetails = emailContent.match(
      /Test Location\s*:[^\n]+\n[\s\S]+,\s*([a-zA-Z\s]+),\s*([a-zA-Z\s]+),\s*(\d{6})/i
    );

    const city = addressDetails ? addressDetails[1].trim() : null;
    const state = addressDetails ? addressDetails[2].trim() : null;
    const pincode = addressDetails ? addressDetails[3].trim() : null;

    // Extracting name
    const firstName = extractField(
      /First Name\s*:\s*([a-zA-Z\s]+?)(?=\s*Middle Name)/i,
      emailContent
    );
    const name = firstName || "Unknown";

    // Extracting mobile number
    const mobileno = extractField(/\b(\d{10})\b/, emailContent);

    // Extracting Date and Time of Appointment
    const dateOfAppointment = extractField(
      /Appointment scheduled date\s*:\s*([\d/]+)/i,
      emailContent
    );
    const timeOfAppointment = extractField(
      /Appointment scheduled time\s*:\s*([\d:]+\s*[APM]*)/i,
      emailContent
    );
    const time =
      dateOfAppointment && timeOfAppointment
        ? `${dateOfAppointment} ${timeOfAppointment}`
        : null;

    const treatmentPattern = /Reports Required\s*:\s*([\s\S]+?)(?=\n\*)/i; // Captures up to the next "*"
    const treatmentMatch = emailContent.match(treatmentPattern);

    const treatment = treatmentMatch
      ? treatmentMatch[1].trim().replace(/\n/g, ", ").replace(/\s+/g, " ")
      : "";

    console.log("Parsed Email Data:");
    console.log({
      tpaDetails,
      name,
      appointmentNo,
      mobileno,
      time,
      address,
      country: "India",
      state,
      city,
      pincode,
      treatment,
    });

    // Insert data into the database
    db.query(
      "INSERT INTO appointment (tpa_details, name, appointment_no, mobileno, time, address, country, state, city, pincode, treatment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        tpaDetails,
        name,
        appointmentNo,
        mobileno,
        time,
        address,
        "India",
        state,
        city,
        pincode,
        treatment,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting data into the database:", err.message);
        } else {
          console.log("Data inserted successfully:", result);
        }
      }
    );
  } catch (error) {
    console.error("Error parsing email content:", error.message);
  }
}

// Function to read emails and process them
function readEmails11() {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) {
        console.error("Error opening inbox:", err.message);
        return;
      }

      imap.search(["UNSEEN"], (err, results) => {
        if (err || results.length === 0) {
          console.log("No new emails found.");
          imap.end();
          return;
        }

        const fetch = imap.fetch(results, { bodies: "" });
        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error("Error parsing email:", err.message);
                return;
              }

              // Accessing email content and subject
              const emailContent = parsed.text;
              const subject = parsed.subject;

              console.log("Processing email content:\n", emailContent);
              console.log("Subject:", subject);

              // Parse and insert the email content and subject into the database
              await parseAndInsertEmail11(emailContent, subject);
            });
          });
        });

        fetch.once("end", () => {
          console.log("Done fetching all unseen emails.");
          imap.end();
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP Error:", err.message);
  });

  imap.once("end", () => {
    console.log("Connection closed.");
  });

  imap.connect();
}

// Start reading emails
readEmails11();
