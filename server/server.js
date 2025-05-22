require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3001;

const uri = process.env.ATLAS_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!uri) {
  console.error("❌ MONGODB_URI is not defined in .env file");
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS is not defined in .env file");
  process.exit(1);
}

const client = new MongoClient(uri);

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

let db;
let usersCollection;
let poojasCollection;
let accommodationsCollection;
let donationsCollection;
let adminsCollection;
let darshanCollection;
let eventsCollection;
let feedbackCollection;
let membershipCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("Temple");
    usersCollection = db.collection("users");
    poojasCollection = db.collection("poojas");
    accommodationsCollection = db.collection("accommodations");
    donationsCollection = db.collection("donations");
    adminsCollection = db.collection("admins");
    darshanCollection = db.collection("darshan");
    eventsCollection = db.collection("events");
    feedbackCollection = db.collection("feedback");
    membershipCollection = db.collection("membership");
    console.log("✅ MongoDB connected to 'Temple' database");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to verify user token
const verifyUserToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Forgot Password route
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Store OTP and expiry in user document
    await usersCollection.updateOne(
      { email },
      { $set: { resetOtp: otp, otpExpiry } }
    );

    // Send OTP email
    const mailOptions = {
      from: `"Temple Administration" <${EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.fullName},</p>
        <p>We received a request to reset your password. Use the following OTP to reset your password:</p>
        <h3>${otp}</h3>
        <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Temple Administration</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Server error during OTP generation" });
  }
});

// Reset Password route
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword }, $unset: { resetOtp: "", otpExpiry: "" } }
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Server error during password reset" });
  }
});

// Admin Signup route
app.post("/api/admin-signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Email, password, and full name are required" });
    }

    const existingAdmin = await adminsCollection.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await adminsCollection.insertOne({
      fullName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Admin signup successful" });
  } catch (err) {
    console.error("❌ Admin signup error:", err);
    res.status(500).json({ message: "Server error during admin signup" });
  }
});

// Admin Login route
app.post("/api/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminsCollection.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id.toString() }, JWT_SECRET, { expiresIn: "1h" });

    await adminsCollection.updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date() } }
    );

    res.status(200).json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

// Verify Admin route
app.get("/api/verify-admin", verifyAdminToken, async (req, res) => {
  try {
    const admin = await adminsCollection.findOne({ _id: new ObjectId(req.adminId) });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin verified" });
  } catch (err) {
    console.error("❌ Admin verification error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// Verify User route
app.get("/api/verify-user", verifyUserToken, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User verified" });
  } catch (err) {
    console.error("❌ User verification error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// Get all admins route
app.get("/api/admins", verifyAdminToken, async (req, res) => {
  try {
    const admins = await adminsCollection.find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json(admins);
  } catch (err) {
    console.error("❌ Error fetching admins:", err);
    res.status(500).json({ message: "Failed to load admins" });
  }
});

// User Signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Signup successful!" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// User Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "1h" });

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Book Darshan route
app.post("/api/book-darshan", async (req, res) => {
  try {
    const { name, email, phone, address, date, time, type, numberOfPeople } = req.body;

    if (!name || !email || !phone || !address || !date || !time || !type || !numberOfPeople) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await darshanCollection.insertOne({
      name,
      email,
      phone,
      address,
      date,
      time,
      type,
      numberOfPeople: parseInt(numberOfPeople),
      status: "pending",
      bookedAt: new Date(),
    });

    res.status(201).json({ success: true, message: "Darshan booked successfully", id: result.insertedId });
  } catch (err) {
    console.error("❌ Error booking darshan:", err);
    res.status(500).json({ message: "Failed to book darshan" });
  }
});

// Get all Darshan bookings
app.get("/api/darshan", verifyAdminToken, async (req, res) => {
  try {
    const bookings = await darshanCollection.find().toArray();
    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Error fetching darshan bookings:", err);
    res.status(500).json({ message: "Failed to load darshan bookings" });
  }
});

// Confirm Darshan booking
app.post("/api/confirm-darshan/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await darshanCollection.findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({ message: "Booking already confirmed" });
    }

    const result = await darshanCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "confirmed", confirmedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to confirm booking" });
    }

    const mailOptions = {
      from: `"Temple Administration" <${EMAIL_USER}>`,
      to: booking.email,
      subject: "Darshan Booking Confirmation",
      html: `
        <h2>Darshan Booking Confirmed</h2>
        <p>Dear ${booking.name},</p>
        <p>Your Darshan booking has been confirmed with the following details:</p>
        <ul>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Type:</strong> ${booking.type}</li>
          <li><strong>Number of People:</strong> ${booking.numberOfPeople}</li>
          <li><strong>Address:</strong> ${booking.address}</li>
        </ul>
        <p>We look forward to welcoming you!</p>
        <p>Best regards,<br>Temple Administration</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${booking.email}`);

    res.status(200).json({ message: "Darshan booking confirmed and email sent" });
  } catch (err) {
    console.error("❌ Error confirming darshan:", err);
    res.status(500).json({ message: "Failed to confirm darshan booking" });
  }
});

// Pooja routes
app.post("/api/poojas", verifyAdminToken, async (req, res) => {
  try {
    const { name, date, time, thingsNeeded } = req.body;

    if (!name || !date || !time) {
      return res.status(400).json({ message: "Name, date, and time are required" });
    }

    const result = await poojasCollection.insertOne({
      name,
      date,
      time,
      thingsNeeded: thingsNeeded || "",
    });

    res.status(201).json({ message: "Pooja added successfully", id: result.insertedId });
  } catch (err) {
    console.error("❌ Error adding pooja:", err);
    res.status(500).json({ message: "Failed to add pooja" });
  }
});

app.get("/api/poojas", async (req, res) => {
  try {
    const poojas = await poojasCollection.find().toArray();
    res.status(200).json(poojas);
  } catch (err) {
    console.error("❌ Error fetching poojas:", err);
    res.status(500).json({ message: "Failed to load poojas" });
  }
});

app.get("/api/poojas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid pooja ID" });
    }

    const pooja = await poojasCollection.findOne({ _id: new ObjectId(id) });

    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }

    res.status(200).json(pooja);
  } catch (err) {
    console.error("❌ Error fetching pooja by ID:", err);
    res.status(500).json({ message: "Failed to fetch pooja details" });
  }
});

// Accommodation routes
app.post("/api/accommodations", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      checkInDate,
      checkOutDate,
      numberOfPeople,
      roomType,
      totalPrice,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !checkInDate ||
      !checkOutDate ||
      !roomType
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const result = await accommodationsCollection.insertOne({
      fullName,
      email,
      phone,
      checkInDate,
      checkOutDate,
      numberOfPeople: parseInt(numberOfPeople) || 1,
      roomType,
      totalPrice: parseFloat(totalPrice) || 0,
      status: "pending",
      bookedAt: new Date(),
    });

    const mailOptions = {
      from: `"Temple Administration" <${EMAIL_USER}>`,
      to: email,
      subject: "Accommodation Booking Request Received",
      html: `
        <h2>Booking Request Received</h2>
        <p>Dear ${fullName},</p>
        <p>We have received your accommodation booking request with the following details:</p>
        <ul>
          <li><strong>Room Type:</strong> ${roomType}</li>
          <li><strong>Check-in Date:</strong> ${checkInDate}</li>
          <li><strong>Check-out Date:</strong> ${checkOutDate}</li>
          <li><strong>Number of Guests:</strong> ${numberOfPeople}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Total Price:</strong> ₹${totalPrice}</li>
        </ul>
        <p>Your booking is pending admin confirmation. You will receive a confirmation email once approved.</p>
        <p>Best regards,<br>Temple Administration</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Acknowledgment email sent to ${email}`);

    res.status(201).json({
      message: "Accommodation booking request submitted successfully",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("❌ Error booking accommodation:", err);
    res.status(500).json({ message: "Failed to submit booking request" });
  }
});

app.get("/api/accommodations", async (req, res) => {
  try {
    const bookings = await accommodationsCollection.find().toArray();
    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to load accommodation bookings" });
  }
});

// Donation routes
app.post("/api/donations", async (req, res) => {
  try {
    const { donationType, amount, paymentMethod, cardNumber, expiryDate, cvv, upiId } = req.body;

    if (!donationType || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Donation type, amount, and payment method are required" });
    }

    const donationData = {
      donationType,
      amount: parseFloat(amount),
      paymentMethod,
      createdAt: new Date(),
    };

    if (paymentMethod === "card" && cardNumber && expiryDate && cvv) {
      donationData.cardNumber = cardNumber.replace(/\s/g, "").slice(-4);
      donationData.expiryDate = expiryDate;
    } else if (paymentMethod === "upi" && upiId) {
      donationData.upiId = upiId;
    }

    const result = await donationsCollection.insertOne(donationData);

    res.status(201).json({
      message: "Donation recorded successfully",
      donationId: result.insertedId.toString(),
    });
  } catch (err) {
    console.error("❌ Error adding donation:", err);
    res.status(500).json({ message: "Failed to record donation" });
  }
});

app.get("/api/donations", verifyUserToken, async (req, res) => {
  try {
    const donations = await donationsCollection.find().toArray();
    res.status(200).json(donations);
  } catch (err) {
    console.error("❌ Error fetching donations:", err);
    res.status(500).json({ message: "Failed to load donations" });
  }
});

// Donation Usage routes
app.post("/api/donation-usage", verifyAdminToken, async (req, res) => {
  try {
    const { purpose, amountSpent, date, description } = req.body;

    if (!purpose || !amountSpent || !date) {
      return res.status(400).json({ message: "Purpose, amount spent, and date are required" });
    }

    const result = await db.collection("donationUsage").insertOne({
      purpose,
      amountSpent: parseFloat(amountSpent),
      date,
      description: description || "",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Donation usage recorded successfully", id: result.insertedId });
  } catch (err) {
    console.error("❌ Error recording donation usage:", err);
    res.status(500).json({ message: "Failed to record donation usage" });
  }
});

app.get("/api/donation-usage", verifyUserToken, async (req, res) => {
  try {
    const usageRecords = await db.collection("donationUsage").find().toArray();
    res.status(200).json(usageRecords);
  } catch (err) {
    console.error("❌ Error fetching donation usage:", err);
    res.status(500).json({ message: "Failed to load donation usage records" });
  }
});

// Event routes
app.post("/api/events", verifyAdminToken, async (req, res) => {
  try {
    const { title, date, description } = req.body;

    if (!title || !date || !description) {
      return res.status(400).json({ message: "Title, date, and description are required" });
    }

    const result = await eventsCollection.insertOne({
      title,
      date,
      description,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Event added successfully", id: result.insertedId });
  } catch (err) {
    console.error("❌ Error adding event:", err);
    res.status(500).json({ message: "Failed to add event" });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await eventsCollection.find().toArray();
    res.status(200).json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ message: "Failed to load events" });
  }
});

// Feedback route
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const result = await feedbackCollection.insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    const mailOptions = {
      from: `"Temple Administration" <${EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Your Feedback",
      html: `
        <h2>Feedback Received</h2>
        <p>Dear ${name},</p>
        <p>Thank you for sharing your feedback with Ramalayam Temple. We value your input and will review it carefully.</p>
        <p>Your message: ${message}</p>
        <p>Best regards,<br>Temple Administration</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Feedback confirmation email sent to ${email}`);

    res.status(201).json({ message: "Feedback submitted successfully", id: result.insertedId });
  } catch (err) {
    console.error("❌ Error submitting feedback:", err);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

// Membership route
app.post("/api/membership", async (req, res) => {
  try {
    const { fullName, email, phone, membershipType } = req.body;

    if (!fullName || !email || !phone || !membershipType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await membershipCollection.insertOne({
      fullName,
      email,
      phone,
      membershipType,
      status: "pending",
      createdAt: new Date(),
    });

    const mailOptions = {
      from: `"Temple Administration" <${EMAIL_USER}>`,
      to: email,
      subject: "Membership Application Received",
      html: `
        <h2>Membership Application</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for applying for our ${membershipType} membership. We will review your application and get back to you soon.</p>
        <p>Best regards,<br>Temple Administration</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Membership confirmation email sent to ${email}`);

    res.status(201).json({ message: "Membership application submitted successfully", id: result.insertedId });
  } catch (err) {
    console.error("❌ Error submitting membership:", err);
    res.status(500).json({ message: "Failed to submit membership application" });
  }
});

// Check room availability
app.get("/api/accommodations/availability", async (req, res) => {
  try {
    const bookings = await accommodationsCollection.find().toArray();
    const availability = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];

      let isBooked = false;
      let isFilling = false;

      bookings.forEach((booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        if (date >= checkIn && date < checkOut) {
          isBooked = true;
        } else if (
          date.getTime() === checkIn.getTime() ||
          date.getTime() === checkOut.getTime()
        ) {
          isFilling = true;
        }
      });

      availability[dateStr] = isBooked
        ? "unavailable"
        : isFilling
        ? "filling"
        : "available";
    }

    res.status(200).json(availability);
  } catch (err) {
    console.error("❌ Error fetching availability:", err);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

// Check specific date range availability
app.post("/api/accommodations/check", async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.body;

    if (!checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({ message: "Check-in and check-out dates are required" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    const bookings = await accommodationsCollection.find().toArray();

    const isAvailable = !bookings.some((booking) => {
      const bookedCheckIn = new Date(booking.checkInDate);
      const bookedCheckOut = new Date(booking.checkOutDate);
      bookedCheckIn.setHours(0, 0, 0, 0);
      bookedCheckOut.setHours(0, 0, 0, 0);

      return (
        (checkIn >= bookedCheckIn && checkIn < bookedCheckOut) ||
        (checkOut > bookedCheckIn && checkOut <= bookedCheckOut) ||
        (checkIn <= bookedCheckIn && checkOut >= bookedCheckOut)
      );
    });

    res.status(200).json({ isAvailable });
  } catch (err) {
    console.error("❌ Error checking availability:", err);
    res.status(500).json({ message: "Failed to check availability" });
  }
});

// Confirm accommodation booking
app.post("/api/accommodations/confirm/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await accommodationsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({ message: "Booking already confirmed" });
    }

    const result = await accommodationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "confirmed", confirmedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to confirm booking" });
    }

    const mailOptions = {
      from: `"Temple Administration" <${EMAIL_USER}>`,
      to: booking.email,
      subject: "Accommodation Booking Confirmation",
      html: `
        <h2>Accommodation Booking Confirmed</h2>
        <p>Dear ${booking.fullName},</p>
        <p>Your accommodation booking has been confirmed with the following details:</p>
        <ul>
          <li><strong>Room Type:</strong> ${booking.roomType}</li>
          <li><strong>Check-in Date:</strong> ${booking.checkInDate}</li>
          <li><strong>Check-out Date:</strong> ${booking.checkOutDate}</li>
          <li><strong>Number of Guests:</strong> ${booking.numberOfPeople}</li>
          <li><strong>Phone:</strong> ${booking.phone}</li>
        </ul>
        <p>We look forward to welcoming you!</p>
        <p>Best regards,<br>Temple Administration</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${booking.email}`);

    res.status(200).json({ message: "Accommodation booking confirmed and email sent" });
  } catch (err) {
    console.error("❌ Error confirming accommodation:", err);
    res.status(500).json({ message: "Failed to confirm accommodation booking" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
