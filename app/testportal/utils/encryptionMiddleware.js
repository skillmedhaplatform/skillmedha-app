import CryptoJS from "crypto-js";

export const encryptObject = ({ object, key, name }) => {
  try {
    const converted = JSON.stringify(object);
    const encryptedObject = CryptoJS.AES.encrypt(converted, key).toString();
    sessionStorage.setItem(name, encryptedObject);
    return encryptedObject;
  } catch (error) {
    console.log(error);
  }
};

export const decryptObject = (encryptedObject, key) => {
  if (encryptedObject && key) {
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedObject.split(" ").join("+"),
      key.split(" ").join("+")
    );
    const decryptedObject = JSON.parse(
      decryptedBytes.toString(CryptoJS.enc.Utf8)
    );
    return decryptedObject;
  }
};

// export const decryptObject = (encryptedObject, key) => {
//   if (!encryptedObject || !key) {
//     console.error("Missing encryptedObject or key");
//     return null;
//   }

//   try {

//     const decryptedBytes = CryptoJS.AES.decrypt(
//       encryptedObject.split(" ").join("+"),
//       key
//     );

//     // Check if decryption produced any data
//     if (decryptedBytes.sigBytes <= 0) {
//       console.error("Decryption failed - invalid key or corrupted data");
//       return null;
//     }

//     const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

//     // Check if we got a valid string before parsing
//     if (!decryptedString || decryptedString.trim() === "") {
//       console.error("Decryption produced empty string - wrong key");
//       return null;
//     }

//     const decryptedObject = JSON.parse(decryptedString);
//     return decryptedObject;
//   } catch (error) {
//     console.error("Decryption/JSON parse error:", error.message);
//     console.error("Failed to decrypt or parse data");
//     return null;
//   }
// };
