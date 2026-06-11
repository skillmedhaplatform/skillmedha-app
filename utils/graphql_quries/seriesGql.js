export const allSeries = `
query AllTestSeries($cursor: ID, $limit: Int, $category: String, $status: String, $language: String, $origin: String, $testEvaluationType: String) {
  allTestSeries(cursor: $cursor, limit: $limit, category: $category, status: $status, language: $language, origin: $origin, testEvaluationType: $testEvaluationType) {
    pageInfo {
      hasNextPage
    }
    testseries {
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
      tests {
        _id
        title
        totalQuestions
        totalMarks
        totalTime
        status
        createdAt
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
            resources
          }
          ... on ComprehensionQuestions {
            _id
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
              resources
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
        }
      }
      honestRespondent
      snapShotTechnology
      facialRecognitionTechnology
      testEvaluationType
    }
  }
}
`



export const singleTestSeries = `
query SingleTestSeries($singleTestSeriesId: String) {
  singleTestSeries(id: $singleTestSeriesId) {
    ... on TestSeries {
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
            resources
          }
          ... on ComprehensionQuestions {
            _id
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
              resources
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
        }
        honestRespondent
        snapShotTechnology
        facialRecognitionTechnology
        testEvaluationType
        blockedStudents {
          _id
        }
      }
      honestRespondent
      snapShotTechnology
      facialRecognitionTechnology
      testEvaluationType
      blockedStudents {
        _id
      }
      enrolledStudents {
        _id
      }
    }
    ... on err {
      err
    }
  }
}
`


export const getManualProgressQuery = `
  query Progress {
  progress {
    _id
    testId
    response
    flagged
    studentId
    scoreData
    capturedImage
    testDetails {
      _id
      title
    }
    studentDetails {
      _id
      email
      firstName
    }
    studentData
    createdAt
    studentActivity
  }
}

`
