const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Subject = require('../models/Subject');

// @desc    Get all faculty members with department & assigned subjects
// @route   GET /api/faculty
// @access  Private (Admin / Faculty)
exports.getFaculties = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const query = {};

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const faculties = await Faculty.find(query)
      .populate('department')
      .populate('assignedSubjects')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: faculties.length, data: faculties });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single faculty member
// @route   GET /api/faculty/:id
// @access  Private
exports.getFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('department')
      .populate('assignedSubjects')
      .populate('user', '-password');

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty member not found' });
    }

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty member and linked user account
// @route   POST /api/faculty
// @access  Private (Admin)
exports.createFaculty = async (req, res, next) => {
  try {
    const { employeeId, name, email, password = 'password123', department, designation, specialization, assignedSubjects } = req.body;

    // Check if user or faculty already exists
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        name,
        email,
        password,
        role: 'faculty',
      });
    }

    const faculty = await Faculty.create({
      employeeId,
      user: user._id,
      name,
      email,
      department,
      designation,
      specialization,
      assignedSubjects: assignedSubjects || [],
    });

    // Update subjects to point to this faculty
    if (assignedSubjects && assignedSubjects.length > 0) {
      await Subject.updateMany({ _id: { $in: assignedSubjects } }, { faculty: faculty._id });
    }

    const populatedFaculty = await Faculty.findById(faculty._id).populate('department').populate('assignedSubjects');

    res.status(201).json({ success: true, data: populatedFaculty });
  } catch (error) {
    next(error);
  }
};

// @desc    Update faculty member
// @route   PUT /api/faculty/:id
// @access  Private (Admin)
exports.updateFaculty = async (req, res, next) => {
  try {
    const { name, email, department, designation, specialization, assignedSubjects, phone, officeRoom } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, email, department, designation, specialization, assignedSubjects, phone, officeRoom },
      { new: true, runValidators: true }
    )
      .populate('department')
      .populate('assignedSubjects');

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty member not found' });
    }

    // Also update User profile if name/email changed
    if (faculty.user) {
      await User.findByIdAndUpdate(faculty.user, { name, email });
    }

    // Sync subjects
    if (assignedSubjects) {
      await Subject.updateMany({ faculty: faculty._id }, { $unset: { faculty: '' } });
      if (assignedSubjects.length > 0) {
        await Subject.updateMany({ _id: { $in: assignedSubjects } }, { faculty: faculty._id });
      }
    }

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete faculty member
// @route   DELETE /api/faculty/:id
// @access  Private (Admin)
exports.deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty member not found' });
    }

    if (faculty.user) {
      await User.findByIdAndDelete(faculty.user);
    }
    await Subject.updateMany({ faculty: faculty._id }, { $unset: { faculty: '' } });
    await faculty.deleteOne();

    res.status(200).json({ success: true, message: 'Faculty member deleted successfully' });
  } catch (error) {
    next(error);
  }
};
