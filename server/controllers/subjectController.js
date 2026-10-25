const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public / Private
exports.getSubjects = async (req, res, next) => {
  try {
    const { department, semester, faculty, search } = req.query;
    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (faculty) query.faculty = faculty;
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query)
      .populate('department')
      .populate('faculty', 'name employeeId email designation')
      .sort({ semester: 1, code: 1 });

    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public / Private
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('department')
      .populate('faculty', 'name employeeId email designation');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin)
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);

    if (subject.faculty) {
      await Faculty.findByIdAndUpdate(subject.faculty, {
        $addToSet: { assignedSubjects: subject._id },
      });
    }

    const populated = await Subject.findById(subject._id)
      .populate('department')
      .populate('faculty', 'name employeeId email designation');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
exports.updateSubject = async (req, res, next) => {
  try {
    const oldSubject = await Subject.findById(req.params.id);
    if (!oldSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('department')
      .populate('faculty', 'name employeeId email designation');

    // Sync faculty assignment
    if (oldSubject.faculty && String(oldSubject.faculty) !== String(subject.faculty)) {
      await Faculty.findByIdAndUpdate(oldSubject.faculty, {
        $pull: { assignedSubjects: subject._id },
      });
    }
    if (subject.faculty) {
      await Faculty.findByIdAndUpdate(subject.faculty, {
        $addToSet: { assignedSubjects: subject._id },
      });
    }

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (subject.faculty) {
      await Faculty.findByIdAndUpdate(subject.faculty, {
        $pull: { assignedSubjects: subject._id },
      });
    }

    await subject.deleteOne();
    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};
