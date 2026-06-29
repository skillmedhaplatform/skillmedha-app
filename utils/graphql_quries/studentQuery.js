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

      progress {
           _id
        flagged
        response
        studentId
        testId
        scoreData
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
`


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
      }
      token
      blocked
      email
      phone
    }
  }
}`
