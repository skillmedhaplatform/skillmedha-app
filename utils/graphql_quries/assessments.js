export const testsQuery = `
query Tests($cursor: ID, $limit: Int, $status: String, $language: String, $category: String, $origin: String, $studentId: String) {
  tests(cursor: $cursor, limit: $limit, status: $status, language: $language, category: $category, origin: $origin,  studentId: $studentId) {
    pageInfo {
      hasNextPage
    }
    tests {
      _id
      courseName
      title
      longDescription
      shortDescription
      access
      startPage
      grading
      logo
      pricing
      enrolledStudents {
        progress {
          _id
          testId
          response
          flagged
          studentId
          scoreData
        }
        _id
        blocked
        email
        faceData
        firstName
        gender
        otp
        password
        phone
        tempPass
        userName
        lastName
      }
      blockedStudents {
        _id
      }
      time
      status
      testType
      category {
        _id
        type
        name
      }
      createdAt
      updatedAt
      thumbnail
      contentMedia
      content
      createdBy
      totalMarks
      totalQuestions
      totalTime
      startDate
      endDate
      questions {
        ... on ComprehensionQuestions {
          _id
          questionType
          questionContentArr {
            _id
            questionType
            questionContent
            questionCategory {
              _id
              type
              name
            }
            scoreSettings
            answer
          }
          comprehensionText
          sno
          questionScore
          scoreSettings
          answer
          tags {
            _id
            type
            name
          }
          resources
        }
        ... on Questions {
          _id
          questionType
          questionContent
          sno
          questionCategory {
            _id
            type
            name
          }
          questionScore
          scoreSettings
          answer
          resources
        }
      }
      honestRespondent
      snapShotTechnology
      facialRecognitionTechnology
      testEvaluationType
    }
  }
}
`;

export const getOneTest = `query Test($testId: String) {
  test(id: $testId) {
    ... on Test {
      _id
       blockedStudents {
      _id
    }
      courseName
      title
      longDescription
      shortDescription
      snapShotTechnology
      honestRespondent
      facialRecognitionTechnology
      access
      startPage
      grading
      logo
      pricing
      enrolledStudents {
        _id
        firstName
        lastName
        userName
        phone
        image
        email
        password
        tempPass
        gender
        dob
        createdAt
        updatedAt
        progress {
          _id
          testId
          response
          flagged
          studentId
          scoreData
        }
        token
        location
        otp
        Notes
        attandance
        blocked
      }
      time
      status
      testType
      category {
        _id
        type
        name
      }
      createdAt
      updatedAt
      thumbnail
      contentMedia
      content
      createdBy
      totalMarks
      totalQuestions
      totalTime
      startDate
      endDate
      questions {
        ... on Questions {
          _id
          questionType
          questionContent
          sno
          questionCategory {
            _id
            type
            name
          }
          questionScore
          scoreSettings
          answer
        }
        ... on ComprehensionQuestions {
          _id
          resources
          questionType
          questionContentArr {
            _id
            questionType
            questionContent
            sno
            questionCategory {
              _id
              type
              name
            }
            questionScore
            scoreSettings
            answer
          }
          sno
          questionScore
          scoreSettings
          answer
          tags {
            _id
            type
            name
          }
        }
      }
    }
    ... on err {
      err
    }
  }
}
`;

export const GetOneTestData = `query Test($testId: String) {
  test(id: $testId) {
    ... on Test {
      _id
       blockedStudents {
      _id
    }
      courseName
      title
      longDescription
      shortDescription
      snapShotTechnology
      honestRespondent
      access
      startPage
      grading
      logo
      pricing
      enrolledStudents {
        _id
        firstName
        lastName
        userName
        phone
        image
        email
        password
        tempPass
        gender
        dob
        createdAt
        updatedAt
        progress {
          _id
          testId
          response
          flagged
          studentId
          scoreData
        }
        token
        location
        otp
        Notes
        attandance
        blocked
      }
      time
      status
      testType
      category {
        _id
        type
        name
      }
      language {
        _id
        type
        name
      }
      createdAt
      updatedAt
      thumbnail
      contentMedia
      content
      createdBy
      totalMarks
      totalQuestions
      totalTime
      startDate
      endDate
      questions {
        ... on Questions {
          _id
          questionType
          questionContent
          sno
          questionCategory {
            _id
            type
            name
          }
          questionScore
          scoreSettings
          answer
        }
        ... on ComprehensionQuestions {
          _id
          questionType
          resources
          comprehensionText
          questionContentArr {
            _id
            questionType
            questionContent
            sno
            questionCategory {
              _id
              type
              name
            }
            questionScore
            scoreSettings
            answer
          }
          sno
          questionScore
          scoreSettings
          answer
          tags {
            _id
            type
            name
          }
        }
      }
    }
    ... on err {
      err
    }
  }
}
`;

export const coursesQuery = `
  query Courses {
  courses {
    _id
    courseName
    courseType
    noOfDays
    duration
    noOfStudents
    sections {
      _id
      title
      topics {
        _id
        title
        type
        description
        resource
        sourceCode
        content
        createdAt
        updatedAt
      }
      sortingOrder
      createdAt
      updatedAt
      courseName
    }
    longDescription
    shortDescription
    status
    createdBy
    paymentType
    Price
    instructors
    language
    createdAt
    updatedAt
    thumbnail
    rating
    courseContent
    certificate
    slashedPrice
  }
}
`;

export const getSingleCourseQuery = `
query Course($courseId: String) {
  course(id: $courseId) {
    ... on Course {
      _id
      courseName
      courseType
      noOfDays
      duration
      noOfStudents
      sections {
        _id
        title
        topics {
          _id
          title
          type
          description
          resource
          sourceCode
          content
          meeting {
            _id
          }
          createdAt
          updatedAt
        }
        sortingOrder
        createdAt
        updatedAt
        courseName
      }
      longDescription
      shortDescription
      status
      createdBy
      paymentType
      Price
      instructors
      language
      createdAt
      updatedAt
      thumbnail
      rating
      courseContent
      certificate
      slashedPrice
    }
    ... on err {
      err
    }
  }
}
`;
