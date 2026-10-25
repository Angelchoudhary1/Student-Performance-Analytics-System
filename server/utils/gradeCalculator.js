/**
 * Helper to compute Grade, Grade Points, and Pass/Fail result based on percentage
 */
const calculateGradeDetails = (totalMarks, maxMarks = 100) => {
  const percentage = Number(((totalMarks / maxMarks) * 100).toFixed(2));
  
  let grade = 'F';
  let gradePoint = 0.0;
  let result = 'Fail';

  if (percentage >= 90) {
    grade = 'O'; // Outstanding
    gradePoint = 10.0;
    result = 'Pass';
  } else if (percentage >= 80) {
    grade = 'A+';
    gradePoint = 9.0;
    result = 'Pass';
  } else if (percentage >= 70) {
    grade = 'A';
    gradePoint = 8.0;
    result = 'Pass';
  } else if (percentage >= 60) {
    grade = 'B+';
    gradePoint = 7.0;
    result = 'Pass';
  } else if (percentage >= 50) {
    grade = 'B';
    gradePoint = 6.0;
    result = 'Pass';
  } else if (percentage >= 40) {
    grade = 'C';
    gradePoint = 5.0;
    result = 'Pass';
  } else {
    grade = 'F';
    gradePoint = 0.0;
    result = 'Fail';
  }

  return { percentage, grade, gradePoint, result };
};

module.exports = {
  calculateGradeDetails,
};
