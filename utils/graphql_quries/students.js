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
  }
}

`;

export const singleStudent = `
  query SingleStudent($singleStudentId: String!) {
    singleStudent(id: $singleStudentId) {
      ... on Student {
        _id
        email
        fullName
        userName
        token
        phone
        gender
        updatedAt
        createdAt
        appliedJobs
      }
    }
  }
`;
