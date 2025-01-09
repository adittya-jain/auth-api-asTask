const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
    const {  email, password } = req.body;

    try {
        console.log(email,password)
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(email,password,hashedPassword)
        const user = new User({ email: email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// Signin
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid password" });

        res.status(200).json({ message: "Signin successful" });
    } catch (error) {
        res.status(500).json({ error: "Error signing in" });
    }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const token = jwt.sign({ email },"SECRET", { expiresIn: "1h" });
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Use this token to reset your password: ${token}`,
        };

        // await transporter.sendMail(mailOptions);
        res.status(200).json({
            message: "Password reset email sent",
            token: token,
        });
    } catch (error) {
        res.status(500).json({ error: "Error sending email" });
    }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token,"SECRET");
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: "Error resetting password" });
    }
});

module.exports = router;
