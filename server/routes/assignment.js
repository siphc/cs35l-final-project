const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Grade = require('../models/Grade');
const Class = require('../models/class');
const authMiddleware = require('../middleware/authMiddleware');
const classRoutes = require('./class');

// Import class authorization helpers
const { isInstructor, hasClassAccess, isMember } = classRoutes;

/**
 * @route   POST /api/assignment/create
 * @desc    Create a new assignment (instructor only)
 * @access  Private
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { classId, title, description, dueDate, pointsPossible } = req.body;

    // Validate required fields
    if (!classId || !title || !description || !dueDate || pointsPossible === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (classId, title, description, dueDate, pointsPossible)',
      });
    }

    // Validate pointsPossible is a positive number
    if (pointsPossible < 0) {
      return res.status(400).json({
        success: false,
        message: 'Points possible must be non-negative',
      });
    }

    // Check if user is the instructor of the class
    const userIsInstructor = await isInstructor(req.user._id, classId);
    if (!userIsInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can create assignments',
      });
    }

    // Create the assignment
    const newAssignment = new Assignment({
      title,
      description,
      class: classId,
      dueDate: new Date(dueDate),
      pointsPossible,
      createdBy: req.user._id,
    });

    await newAssignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: {
        id: newAssignment._id,
        title: newAssignment.title,
        description: newAssignment.description,
        dueDate: newAssignment.dueDate,
        pointsPossible: newAssignment.pointsPossible,
      },
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @route   GET /api/assignment/list/:classId
 * @desc    List all assignments for a class
 * @access  Private (must be instructor or student of class)
 */
router.get('/list/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if user has access to this class
    const userHasAccess = await hasClassAccess(req.user._id, classId);
    if (!userHasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this class',
      });
    }

    // Get all assignments for this class
    const assignments = await Assignment.find({ class: classId })
      .sort({ dueDate: 1 })
      .lean();

    // If user is a student, include their grade for each assignment
    const userIsStudent = await isMember(req.user._id, classId);

    if (userIsStudent) {
      // Fetch all grades for this student in this class
      const assignmentIds = assignments.map(a => a._id);
      const grades = await Grade.find({
        assignment: { $in: assignmentIds },
        student: req.user._id,
      }).lean();

      // Create a map of assignmentId -> grade
      const gradeMap = {};
      grades.forEach(grade => {
        gradeMap[grade.assignment.toString()] = {
          score: grade.score,
          feedback: grade.feedback,
        };
      });

      // Add grade info to each assignment
      const assignmentsWithGrades = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        pointsPossible: assignment.pointsPossible,
        userGrade: gradeMap[assignment._id.toString()] || null,
      }));

      return res.status(200).json({
        success: true,
        data: { assignments: assignmentsWithGrades },
      });
    }

    // For instructors, return assignments without grade info
    const assignmentData = assignments.map(assignment => ({
      id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      pointsPossible: assignment.pointsPossible,
    }));

    res.status(200).json({
      success: true,
      data: { assignments: assignmentData },
    });
  } catch (error) {
    console.error('List assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @route   DELETE /api/assignment/:assignmentId
 * @desc    Delete an assignment (instructor only)
 * @access  Private
 */
router.delete('/:assignmentId', authMiddleware, async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is the instructor of the class
    const userIsInstructor = await isInstructor(req.user._id, assignment.class);
    if (!userIsInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can delete assignments',
      });
    }

    // Delete all grades associated with this assignment
    await Grade.deleteMany({ assignment: assignmentId });

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({
      success: true,
      message: 'Assignment and associated grades deleted successfully',
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @route   POST /api/assignment/grade
 * @desc    Create or update a grade for a student (instructor only)
 * @access  Private
 */
router.post('/grade', authMiddleware, async (req, res) => {
  try {
    const { assignmentId, studentId, score, feedback = '' } = req.body;

    // Validate required fields
    if (!assignmentId || !studentId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'assignmentId, studentId, and score are required',
      });
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is the instructor of the class
    const userIsInstructor = await isInstructor(req.user._id, assignment.class);
    if (!userIsInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can grade assignments',
      });
    }

    // Validate score is within range
    if (score < 0 || score > assignment.pointsPossible) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${assignment.pointsPossible}`,
      });
    }

    // Check if student is a member of the class
    const studentIsMember = await isMember(studentId, assignment.class);
    if (!studentIsMember) {
      return res.status(400).json({
        success: false,
        message: 'Student is not a member of this class',
      });
    }

    // create or update the grade
    const grade = await Grade.findOneAndUpdate(
      { assignment: assignmentId, student: studentId },
      {
        score,
        feedback,
        gradedBy: req.user._id,
        gradedAt: Date.now(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Grade saved successfully',
      data: {
        assignmentId: grade.assignment,
        studentId: grade.student,
        score: grade.score,
        feedback: grade.feedback,
      },
    });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @route   GET /api/assignment/grades/:classId
 * @desc    Get grades for a class (role-based filtering)
 * @access  Private
 */
router.get('/grades/:classId', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if user has access to this class
    const userHasAccess = await hasClassAccess(req.user._id, classId);
    if (!userHasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this class',
      });
    }

    const userIsInstructor = await isInstructor(req.user._id, classId);

    if (userIsInstructor) {
      // Get the class with all members populated
      const classDoc = await Class.findById(classId)
        .populate('members', 'email displayName')
        .lean();

      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: 'Class not found',
        });
      }

      const assignments = await Assignment.find({ class: classId })
        .sort({ dueDate: 1 })
        .lean();

      const assignmentsWithGrades = await Promise.all(
        assignments.map(async (assignment) => {
          // Fetch existing grades for this assignment
          const existingGrades = await Grade.find({ assignment: assignment._id }).lean();

          // Create a map of studentId -> grade for quick lookup
          const gradeMap = {};
          existingGrades.forEach(grade => {
            gradeMap[grade.student.toString()] = grade;
          });

          // Create grade entry for EVERY student in the class
          const grades = classDoc.members.map(student => {
            const existingGrade = gradeMap[student._id.toString()];

            return {
              student: {
                id: student._id,
                email: student.email,
                displayName: student.displayName || student.email,
              },
              score: existingGrade ? existingGrade.score : undefined,
              feedback: existingGrade ? existingGrade.feedback : '',
              gradedAt: existingGrade ? existingGrade.gradedAt : null,
            };
          });

          return {
            id: assignment._id,
            title: assignment.title,
            pointsPossible: assignment.pointsPossible,
            dueDate: assignment.dueDate,
            grades,
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: { assignments: assignmentsWithGrades },
      });
    }
    else {
      // Student view: only their own grades
      const assignments = await Assignment.find({ class: classId })
        .sort({ dueDate: 1 })
        .lean();

      const assignmentIds = assignments.map(a => a._id);
      const grades = await Grade.find({
        assignment: { $in: assignmentIds },
        student: req.user._id,
      }).lean();

      const gradesWithAssignmentInfo = grades.map(grade => {
        const assignment = assignments.find(
          a => a._id.toString() === grade.assignment.toString()
        );
        return {
          assignment: {
            id: assignment._id,
            title: assignment.title,
            pointsPossible: assignment.pointsPossible,
            dueDate: assignment.dueDate,
          },
          score: grade.score,
          feedback: grade.feedback,
          gradedAt: grade.gradedAt,
        };
      });

      return res.status(200).json({
        success: true,
        data: { grades: gradesWithAssignmentInfo },
      });
    }
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @route   GET /api/assignment/my-assignments
 * @desc    Get all assignments for classes the user is enrolled in
 * @access  Private
 */
router.get('/my-assignments', authMiddleware, async (req, res) => {
  try {
    // Find all classes where the user is a member or creator
    const classes = await Class.find({
      $or: [{ members: req.user._id }, { creator: req.user._id }],
    }).select('_id name');

    const classIds = classes.map((c) => c._id);

    // Find all assignments for these classes
    const assignments = await Assignment.find({ class: { $in: classIds } })
      .populate('class', 'name') // Populate class name
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
