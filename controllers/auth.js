import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @function Register
 * @description Method that register a new user in DB
 */
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: err.message });
  }
};

/**
 * @function Login
 * @description Method that login a user and returns the credentials associated
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ msg: 'User doesnt exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN);
    delete user.password;
    return res.status(200).json({ token, user });
  } catch (error) {}
};
