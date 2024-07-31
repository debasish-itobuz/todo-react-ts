// import React, { useState, ChangeEvent, FormEvent } from "react";
// import axios from "axios";

// const FileUpload: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [message, setMessage] = useState<string>("");

//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [phone, setPhone] = useState("");

//   const onChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     }
//   };

//   function handleFirstName(e: {
//     target: { value: React.SetStateAction<string> };
//   }) {
//     setFirstName(e.target.value);
//   }

//   function handleLastName(e: {
//     target: { value: React.SetStateAction<string> };
//   }) {
//     setLastName(e.target.value);
//   }

//   function handlephone(e: {
//     target: { value: React.SetStateAction<string> };
//   }) {
//     setPhone(e.target.value);
//   }

//   const onSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!file) {
//       setMessage("Please select a file");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       const res = await axios.post(
//         `http://localhost:4001/user/upload-profile?id=66a750bd080d82b95d94954f`,
//         FormData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setMessage(res.data);
//     } catch (err: any) {
//       if (err.response && err.response.status === 500) {
//         setMessage("There was a problem with the server");
//       } else {
//         setMessage(err.response.data.message);
//       }
//     }
//   };

//   return (
//     <div>
//       <h1>Upload an Image</h1>
//       <form onSubmit={onSubmit}>
//         <label>
//           Image:
//           <input type="file" onChange={onChange} />
//         </label>

//         <label>
//           FirstName:
//           <input type="text" value={firstName} onChange={handleFirstName} />
//         </label>

//         <label>
//           LastName:
//           <input type="text" value={lastName} onChange={handleLastName} />
//         </label>

//         <label>
//           Phone:
//           <input type="tel" value={phone} onChange={handlephone} />
//         </label>
//         <label>

//           Email:
//           <input type="email"/>
//         </label>

//         <input type="submit" value="Upload" />
//       </form>
//       <h3>{message}</h3>
//     </div>
//   );
// };

// export default FileUpload;
