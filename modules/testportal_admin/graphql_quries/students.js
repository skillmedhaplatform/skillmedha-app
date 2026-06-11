export const allStudentsQuery = `
query Students {
  students {
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
      capturedImage
      studentData
      
    }
    token
    location
    otp
    Notes
    attandance
    blocked
    faceData
    globalId
    faceData
  }
}

`;

export const singleStudent = `

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
