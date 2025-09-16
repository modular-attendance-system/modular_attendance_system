/**
 * @file userManager.js
 * @description Service for handling all user and authentication-related database operations.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserManager {
    constructor({ UserModel, secret="sdidjksnfhodsjfodejfoi" }) {
        if (!UserModel) {
            throw new Error("UserManager requires the UserModel dependency.");
        }
        this.UserModel = UserModel;
        this.secret = secret;
    }

    /**
     * Creates a new user account, hashes the password, and returns the user and a JWT.
     * @param {object} userData - { displayName, email, password }
     * @returns {Promise<{user: object, token: string}>}
     */
    async registerUser(userData) {
        const { email, password, displayName } = userData;
        if (!email || !password || !displayName) {
            throw new Error('Display name, email, and password are required for registration.');
        }

        const existingUser = await this.UserModel.findOne({ email });
        if (existingUser) {
            throw new Error('A user with this email already exists.');
        }

        // password will be hashed by the pre-save hook in UserSchema.js
        const user = await this.UserModel.create({
            displayName,
            email,
            password,
            userId: new mongoose.Types.ObjectId().toString()
        });

        const token = jwt.sign(
            { userId: user._id.toString(), displayName: user.displayName },
            this.secret,
            { expiresIn: '7d' }
        );

        const userObject = user.toObject();
        delete userObject.password; // ensure password is not returned

        return { user: userObject, token };
    }

    /**
     * Verifies user credentials and returns a new JWT on success.
     * @param {string} email
     * @param {string} passwordInput
     * @returns {Promise<{user: object, token: string}>}
     */
    async authenticateUser(email, passwordInput) {
        const user = await this.UserModel.findOne({ email }).select('+password');
        if (!user) {
            throw new Error('Invalid email or password.');
        }

        const isMatch = await bcrypt.compare(passwordInput, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password.');
        }

        const token = jwt.sign(
            { userId: user._id.toString(), displayName: user.displayName },
            this.secret,
            { expiresIn: '7d' }
        );

        const userObject = user.toObject();
        delete userObject.password;

        return { user: userObject, token };
    }

    /**
     * Decodes a JWT and fetches the corresponding user from the database.
     * @param {string} token
     * @returns {Promise<object|null>} The user object or null if invalid.
     */
    async verifyTokenAndGetUser(token) {
        try {
            const decoded = jwt.verify(token, this.secret);
            const user = await this.UserModel.findById(decoded.userId).select('-password');
            return user ? user.toObject() : null;
        } catch (error) {
            return null; // expired/invalid token
        }
    }

    /**
     * Fetches a user by their unique MongoDB _id.
     * @param {string} userId
     * @returns {Promise<object|null>}
     */
    async getUserById(userId) {
        return this.UserModel.findById(userId).select('-password');
    }

    /**
     * Fetches a user by their email address.
     * @param {string} email
     * @returns {Promise<object|null>}
     */
    async getUserByEmail(email) {
        return this.UserModel.findOne({ email }).select('-password');
    }
}

module.exports = { UserManager };
