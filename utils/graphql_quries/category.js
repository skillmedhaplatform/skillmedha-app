export const getAllCategories = `
query Category($type: String) {
    category(type: $type) {
      
         _id
      name
      type
     
    }
  }
`;
