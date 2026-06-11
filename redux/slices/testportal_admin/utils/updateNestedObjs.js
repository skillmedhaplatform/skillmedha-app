// keynames is an array according to nesting ===> ["category","name",]

export const updateObject = (keyNames, newVal, object) => {
  const [currentKey, ...remainingKeys] = keyNames;

  if (remainingKeys.length === 0) {
    object[currentKey] = newVal;
    return object;
  }

  if (!object[currentKey]) {
    object[currentKey] = {
        ...object[currentKey]
    };
  }
  console.log(remainingKeys,newVal,object[currentKey]);
  
  return updateObject(remainingKeys, newVal, object[currentKey]);
};
