const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_token_academic_analytics_2026_nosql_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const query = { email: email.toLowerCase().trim() };
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Account found, but assigned role is '${user.role}', not '${role}'. Please switch role.`,
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Fetch linked student or faculty profile if exists
    let studentProfile = null;
    let facultyProfile = null;

    if (user.role === 'student') {
      studentProfile = await Student.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'faculty') {
      facultyProfile = await Faculty.findOne({ user: user._id }).populate('department').populate('assignedSubjects');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentProfile,
        facultyProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let studentProfile = null;
    let facultyProfile = null;

    if (user.role === 'student') {
      studentProfile = await Student.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'faculty') {
      facultyProfile = await Faculty.findOne({ user: user._id }).populate('department').populate('assignedSubjects');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentProfile,
        facultyProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Demo Accounts Info for quick evaluation
// @route   GET /api/auth/demo-accounts
// @access  Public
exports.getDemoAccounts = (req, res) => {
  res.status(200).json({
    success: true,
    accounts: [
      {
        role: 'admin',
        email: 'admin@college.edu',
        password: 'password123',
        description: 'Super Administrator with full analytics, ranking, and database inspection access',
      },
      {
        role: 'faculty',
        email: 'faculty@college.edu',
        password: 'password123',
        description: 'Faculty portal for marks entry, attendance marking, and subject analytics',
      },
      {
        role: 'student',
        email: 'student@college.edu',
        password: 'password123',
        description: 'Student portal with personal CGPA, AI predictions, and course recommendations',
      },
    ],
  });
};
