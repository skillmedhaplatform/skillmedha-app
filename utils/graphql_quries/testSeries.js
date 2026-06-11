export const AllTests = `

query Tests($cursor: ID, $limit: Int, $category: String, $status: String, $origin: String, $testEvaluationType: String) {
  tests(cursor: $cursor, limit: $limit, category: $category, status: $status, origin: $origin, testEvaluationType: $testEvaluationType) {
    pageInfo {
      hasNextPage
    }
    tests {
      _id
      title
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
      thumbnail
      totalMarks
      totalQuestions
      totalTime
      startDate
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
    }
  }
}
`;

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
      testEvaluationType
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
      thumbnail
      totalMarks
      totalQuestions
      totalTime
      startDate
      questions {
        ... on Questions {
          _id
          resources
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
          resources
        }
      }
              honestRespondent
              snapShotTechnology
              facialRecognitionTechnology
    }
    ... on err {
      err

    }
  }
}
`;
