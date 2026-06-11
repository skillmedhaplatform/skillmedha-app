export const getOneTest = `
query Test($testId: String) {
  test(id: $testId) {
    ... on Test {
      _id
       blockedStudents {
      _id
    }
      courseName
      title
      shortDescription
      snapShotTechnology
      facialRecognitionTechnology
      honestRespondent
      access
      startPage
      grading
      testEvaluationType
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

      thumbnail
      totalMarks
      totalQuestions
      totalTime
      startDate
      endDate
      questions {
        ... on Questions {
          _id
          resources
          answer
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
          
        }
        ... on ComprehensionQuestions {
          _id
          resources
          comprehensionText
          questionType
          questionContentArr {
            _id
            answer
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
            
          }
          sno
          questionScore
          scoreSettings
          
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
