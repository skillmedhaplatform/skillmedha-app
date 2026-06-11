import CryptoJS from "crypto-js";

export const encryptObject = ({ object, key }) => {
  try {
    const converted = JSON.stringify(object);
    const encryptedObject = CryptoJS.AES.encrypt(converted, key).toString();

    return encryptedObject;
  } catch (error) {
    console.log(error);
  }
};

export const decryptObject = (encryptedObject, key) => {

  try {
    if (encryptedObject && key) {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedObject?.split(" ")?.join("+"), key?.split(" ")?.join("+"));
      const decryptedObject = JSON.parse(
        decryptedBytes.toString(CryptoJS.enc.Utf8)
      );

      return decryptedObject;
    }
  } catch (error) {
    console.log(error);
  }
};
