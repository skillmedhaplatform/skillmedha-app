export const allProgressSchema = `
query ProgressLimit($cursor: ID, $limit: Int, $skip: Int) {
  progressLimit(cursor: $cursor, limit: $limit, skip: $skip) {
 _id
    testId
    response
    flagged
    studentId
    scoreData
        studentActivity
    capturedImage
    createdAt

    testDetails {
      _id
      title
      status
      testType
      access
    }
    studentDetails {
      _id
      email
      firstName
      lastName
      phone
      userName
      department
    }
    studentData
  }
}
`;

export const progressTotalSchema = `
query ProgressTotal {
  progressTotal
}
`;

export const singleProgress = `

query Progresses($id: String) {
  progresses(_id: $id) {
    ... on Progress {
      _id
      testId
      response
    studentActivity
      flagged
      studentId
      scoreData
      capturedImage


      studentDetails {
        _id
        firstName
        email
        lastName
        phone
        userName
      }
      studentData
      testDetails {
        _id
        title
        totalTime
        totalMarks
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
              resources
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
            resources
          }
        }
        category {
          _id
          type
          name
        }
        access
        endDate
        startDate
        startPage
        status
        testType
        time
        shortDescription
        grading
        logo
        pricing
      }
    }
    ... on err {
      err
    }
  }
}
`;
