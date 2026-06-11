export const parseIfJson = (text) => {
  try {
    const data = JSON.parse(text);

    if (data !== undefined) {
      return data;
    }
  } catch (e) {
    return text;
  }
};
