const router = require('express').Router()
const Course = require('../models').courseModel
const courseValidation = require('../validation').courseValidation

router.use((req, res, next) => {
  console.log('A request is coming into courseApi...')
  next()
})
/********************************************************************************
*
學生查課
*
*********************************************************************************/
router.get('/coursesByStudentId/:_id', (req, res) => {
  const { _id } = req.params
  Course.find({ student: _id })
    .populate('instructor', ['username', 'email'])
    .then(courses => {
      res.send(courses)
    })
    .catch(e => {
      res.send(e)
    })
})
/********************************************************************************
*
學生選課
*
*********************************************************************************/
router.post('/coursesByStudentId', async (req, res) => {
  const { studentId, courseId } = req.body
  const course = await Course.findOne({ _id: courseId })
  if (course.student.includes(studentId)) {
    return res.status(500).send('此學生已經註冊課程')
  }
  course.student.push(studentId)
  await course.save()
  res.status(200).send(course)
})
/********************************************************************************
*
老師查課
*
*********************************************************************************/
router.get('/:_id', (req, res) => {
  const { _id } = req.params
  Course.findOne({ _id })
    .populate('instructor', ['email'])
    .then(course => {
      res.send(course)
    })
    .catch(e => {
      res.send(e)
    })
})
/********************************************************************************
*
一次取得所有課程資料
*
*********************************************************************************/
router.get('/', (req, res) => {
  Course.find({})
    .populate('instructor', ['username', 'email'])
    .then(course => {
      res.send(course)
    })
    .catch(() => {
      res.status(500).send('Error!! Cannot get course!!')
    })
})
/********************************************************************************
*
老師添加課程
*
*********************************************************************************/
router.post('/', async (req, res) => {
  // validate the inputs before making a new course
  const { error } = courseValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const { title, description, price } = req.body
  if (req.user.isStudent()) {
    return res.status(400).send('Only instructor can post a new course.')
  }

  const newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user._id
  })

  try {
    await newCourse.save()
    res.status(200).send('New course has been saved.')
  } catch (err) {
    res.status(400).send('Cannot save course.')
  }
})
/********************************************************************************
*
老師更新課程資料
*
*********************************************************************************/
router.patch('/:_id', async (req, res) => {
  // validate the inputs before making a new course
  const { error } = courseValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const { _id } = req.params
  const course = await Course.findOne({ _id })
  if (!course) {
    res.status(404)
    return res.json({
      success: false,
      message: 'Course not found.'
    })
  }

  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true
    })
      .then(() => {
        res.send('Course updated.')
      })
      .catch(e => {
        res.send({
          success: false,
          message: e
        })
      })
  } else {
    res.status(403)
    return res.json({
      success: false,
      message:
        'Only the instructor of this course or web admin can edit this course.'
    })
  }
})
/********************************************************************************
*
老師刪除課程
*
*********************************************************************************/
router.delete('/:_id', async (req, res) => {
  const { _id } = req.params
  const course = await Course.findOne({ _id })
  if (!course) {
    res.status(404)
    return res.json({
      success: false,
      message: 'Course not found.'
    })
  }

  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.deleteOne({ _id })
      .then(() => {
        res.send('Course deleted.')
      })
      .catch(e => {
        res.send({
          success: false,
          message: e
        })
      })
  } else {
    res.status(403)
    return res.json({
      success: false,
      message:
        'Only the instructor of this course or web admin can delete this course.'
    })
  }
})

module.exports = router
