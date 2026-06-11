export const allQuestions = `
query Questions($category: String, $limit: Int, $questionType: String) {
  questions(category: $category, limit: $limit, questionType: $questionType) {
      _id
      questionType
      questionContent
      questionCategory {
      _id
      name
      type
      }
      questionScore
      scoreSettings
      resources
    }
  }
`;

export const singleQuestion = `
query Question($questionId: String) {
    question(id: $questionId) {
      ... on Questions {
         _id
         resources
      questionType
      questionContent
      questionCategory {
      _id
      name
      type
      }
      questionScore

      scoreSettings
      answer
      }
      ... on err {
        err
      }
    }
  }
`;

export const comprehensionQuestionGql = `
query ComprehensionQuestion($comprehensionQuestionId: String) {
  ComprehensionQuestion(id: $comprehensionQuestionId) {
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
`;
