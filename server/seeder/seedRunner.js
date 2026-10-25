const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

const User = require('../models/User');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Prediction = require('../models/Prediction');
const SystemLog = require('../models/SystemLog');

const { departments, faculties, subjects, studentsRaw } = require('./seedData');
const { calculateGradeDetails } = require('../utils/gradeCalculator');
const { extractStudentFeatures, executeMLPrediction } = require('../utils/mlBridge');

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Faculty.deleteMany({}),
      Subject.deleteMany({}),
      Student.deleteMany({}),
      Mark.deleteMany({}),
      Attendance.deleteMany({}),
      Prediction.deleteMany({}),
      SystemLog.deleteMany({}),
    ]);

    console.log('👤 Creating Administrator Account...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'admin',
    });

    console.log('🏛️ Seeding Departments...');
    const createdDepartments = await Department.insertMany(departments);
    const deptMap = {};
    createdDepartments.forEach((d) => {
      deptMap[d.code] = d._id;
    });

    console.log('👨‍🏫 Seeding Faculty Members & Accounts...');
    const facultyMap = {};
    const createdFaculties = [];

    for (const f of faculties) {
      const fUser = await User.create({
        name: f.name,
        email: f.email,
        password: 'password123',
        role: 'faculty',
      });

      const facultyDoc = await Faculty.create({
        employeeId: f.employeeId,
        user: fUser._id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        department: deptMap[f.deptCode],
        designation: f.designation,
        specialization: f.specialization,
        experienceYears: f.experienceYears,
        officeRoom: f.officeRoom,
      });

      facultyMap[f.email] = facultyDoc._id;
      createdFaculties.push(facultyDoc);
    }

    console.log('📚 Seeding Subjects & Syllabi...');
    const createdSubjects = [];
    for (const s of subjects) {
      const subj = await Subject.create({
        code: s.code,
        name: s.name,
        credits: s.credits,
        department: deptMap[s.deptCode],
        semester: s.semester,
        faculty: facultyMap[s.facultyEmail],
      });

      if (s.facultyEmail && facultyMap[s.facultyEmail]) {
        await Faculty.findByIdAndUpdate(facultyMap[s.facultyEmail], {
          $addToSet: { assignedSubjects: subj._id },
        });
      }

      createdSubjects.push(subj);
    }

    console.log('🎓 Seeding Students & Linking User Accounts...');
    const createdStudents = [];

    for (const s of studentsRaw) {
      const sUser = await User.create({
        name: s.name,
        email: s.email,
        password: 'password123',
        role: 'student',
      });

      const studentDoc = await Student.create({
        rollNo: s.rollNo,
        user: sUser._id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        department: deptMap[s.deptCode],
        semester: s.semester,
        section: s.section,
        enrollmentYear: s.enrollmentYear,
        previousCgpa: s.previousCgpa,
        cgpa: s.cgpa,
        attendanceRate: s.attendanceRate,
        skills: s.skills,
        guardian: s.guardian,
        address: s.address,
        backlogs: s.backlogs,
      });

      createdStudents.push(studentDoc);
    }

    console.log('📝 Seeding Marks & Academic Evaluations...');
    for (const student of createdStudents) {
      // Find subjects for student's department and semester
      const semSubjects = createdSubjects.filter((sub) => sub.semester === student.semester);

      for (const subj of semSubjects) {
        // Calculate realistic marks based on student CGPA
        const qualityRatio = student.cgpa / 10.0;
        const noise = (Math.random() - 0.5) * 0.1;
        const scoreRatio = Math.max(0.35, Math.min(0.98, qualityRatio + noise));

        const internalMarks = Math.round(scoreRatio * 20);
        const assignmentMarks = Math.round(scoreRatio * 10);
        const midtermMarks = Math.round(scoreRatio * 30);
        const endtermMarks = Math.round(scoreRatio * 40);

        const totalMarks = internalMarks + assignmentMarks + midtermMarks + endtermMarks;
        const { percentage, grade, gradePoint, result } = calculateGradeDetails(totalMarks, 100);

        await Mark.create({
          student: student._id,
          subject: subj._id,
          semester: student.semester,
          academicYear: '2025-2026',
          internalMarks,
          assignmentMarks,
          midtermMarks,
          endtermMarks,
          totalMarks,
          percentage,
          grade,
          gradePoint,
          result,
          enteredBy: subj.faculty || adminUser._id,
          remarks: result === 'Pass' ? 'Good performance' : 'Remedial attention required',
        });
      }
    }

    console.log('📅 Seeding Attendance Registers & Session Logs...');
    for (const student of createdStudents) {
      const semSubjects = createdSubjects.filter((sub) => sub.semester === student.semester);

      for (const subj of semSubjects) {
        const totalClasses = 45;
        const attendedClasses = Math.round((student.attendanceRate / 100) * totalClasses);

        const records = [];
        const today = new Date();
        for (let i = 0; i < 15; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i * 2);
          const isPresent = Math.random() < student.attendanceRate / 100;
          records.push({
            date,
            status: isPresent ? 'Present' : 'Absent',
            topic: `Unit ${((i % 4) + 1)} Lecture Concept ${i + 1}`,
            markedBy: subj.faculty || adminUser._id,
          });
        }

        await Attendance.create({
          student: student._id,
          subject: subj._id,
          semester: student.semester,
          academicYear: '2025-2026',
          totalClasses,
          attendedClasses,
          percentage: student.attendanceRate,
          status: student.attendanceRate >= 75 ? 'Safe' : student.attendanceRate >= 65 ? 'Warning' : 'Critical',
          records,
        });
      }
    }

    console.log('🤖 Running Initial AI Predictions for All Students...');
    for (const student of createdStudents) {
      const features = await extractStudentFeatures(student);
      const pred = await executeMLPrediction(features);

      await Prediction.create({
        student: student._id,
        ...pred,
      });
    }

    console.log('📋 Creating Audit Logs...');
    await SystemLog.create({
      action: 'DATABASE_INITIALIZED',
      module: 'SEEDER',
      performedBy: adminUser._id,
      details: {
        studentsCount: createdStudents.length,
        facultiesCount: createdFaculties.length,
        subjectsCount: createdSubjects.length,
        departmentsCount: createdDepartments.length,
      },
    });

    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('   Admin:   admin@college.edu   / password123');
    console.log('   Faculty: faculty@college.edu / password123');
    console.log('   Student: student@college.edu / password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Failed:', error);
    process.exit(1);
  }
};

seedDatabase();
