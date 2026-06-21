"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  flex: 1,
  display: "flex",
  padding: "20px",
  border: "dashed ",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};
const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  //   border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  //   minWidth: 100,
  maxHeight: 250,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const media = {
  display: "block",
  height: "100%",
};

function Dropzone(props) {
  const [files, setFiles] = useState([]);
  const { getRootProps, isFocused, isDragAccept, isDragReject, getInputProps } =
    useDropzone({
      accept: {
        "audio/*": [],
        "video/*": [],
      },
      onDrop: (acceptedFiles) => {
        setFiles(
          acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );
      },
    });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        {file.type.includes("audio") && (
          <audio
            src={file.preview}
            style={{ ...media, height: "5rem" }}
            controls
            // Revoke data uri after image is loaded
            onLoad={(event) => {
              URL.revokeObjectURL(file.preview);
              event.target.play();
            }}
          />
        )}
        {file.type.includes("video") && (
          <video
            src={file.preview}
            style={media}
            controls
            // Revoke data uri after image is loaded
            onLoad={(event) => {
              URL.revokeObjectURL(file.preview);
              event.target.play();
            }}
          />
        )}
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <section className="container">
      <div {...getRootProps(style)}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside style={thumbsContainer}>{thumbs}</aside>
    </section>
  );
}

export default Dropzone;
