export const SingleStudentGqlQuery = `
    query Student($id: String) {
  student(_id: $id) {
    ... on Student {
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
        flagged
        response
        studentId
        testId
      }
      token
      location
      otp
      Notes
      attandance
      blocked
      faceData
    }
    ... on err {
      err
    }
  }
}   
`;

export const getRandomStudent = `query RandomStudent($id: String) {
  randomStudent(_id: $id) {
    ... on randomStudent {
      _id
      firstName
      lastName
      gender
      progress {
        _id
        flagged
        response
        studentId
        testId
        scoreData
      }
      token
      blocked
      email
      phone
    }
  }
}`;
