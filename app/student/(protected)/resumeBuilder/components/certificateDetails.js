"use client";
import React from "react";
import { Button, Collapse, DatePicker } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const CertificateDetails = ({
  certificates,
  updateCertificate,
  addCertificate,
  removeCertificate,
}) => {
  const handleAdd = () => addCertificate();

  const handleRemove = (index) => removeCertificate(index);

  return (
    <div className="border border-solid border-[#ccc] flex flex-col justify-center items-center p-4 bg-white">
      <div className="my-3 text-2xl font-bold">Certificates</div>
      <div className="flex flex-col gap-3.5 w-[98%] [&_input]:w-[95%] [&_input]:text-[0.9rem] [&_input]:p-2 [&_input]:m-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc] [&_textarea]:p-2 [&_textarea]:w-full [&_textarea]:m-2 [&_textarea]:rounded-[0.3rem] [&_textarea]:outline-none [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#ccc] [&_textarea]:h-32 [&_textarea]:resize-none">
        {certificates.map((item, index) => (
          <Collapse
            key={item.id || index}
            collapsible="header"
            items={[
              {
                key: item.id || index,
                label: (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      {item.name || item.organization
                        ? `${item.name} - ${item.organization}`
                        : `Certificate ${index + 1}`}
                    </div>
                    <DeleteOutlined
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    />
                  </div>
                ),
                children: (
                  <div>
                    <input
                      name="name"
                      placeholder="Enter Certificate Name"
                      value={item.name}
                      onChange={(e) =>
                        updateCertificate(index, "name", e.target.value)
                      }
                    />
                    <input
                      name="organization"
                      placeholder="Enter Issuing Organization"
                      value={item.organization}
                      onChange={(e) =>
                        updateCertificate(index, "organization", e.target.value)
                      }
                    />
                    <DatePicker
                      onChange={(_, date) =>
                        updateCertificate(index, "issueDate", date)
                      }
                      value={item?.issueDate ? dayjs(item?.issueDate) : null}
                      placeholder="Issue Date"
                      style={{
                        border: "none",
                        width: "100%",
                        padding: "0rem",
                        outline: "none",
                      }}
                    />
                    <DatePicker
                      onChange={(_, date) =>
                        updateCertificate(index, "expiryDate", date)
                      }
                      value={item?.expiryDate ? dayjs(item?.expiryDate) : null}
                      placeholder="Expiry Date (Optional)"
                      style={{
                        border: "none",
                        width: "100%",
                        padding: "0rem",
                        outline: "none",
                      }}
                      disabledDate={(current) => {
                        // Disable dates before the issue date
                        if (!item?.issueDate) return false;
                        return (
                          current &&
                          current < dayjs(item.issueDate).startOf("day")
                        );
                      }}
                    />
                    <input
                      name="credentialId"
                      placeholder="Credential ID (Optional)"
                      value={item.credentialId}
                      onChange={(e) =>
                        updateCertificate(index, "credentialId", e.target.value)
                      }
                    />
                    <input
                      name="credentialUrl"
                      placeholder="Credential URL (Optional)"
                      value={item.credentialUrl}
                      onChange={(e) =>
                        updateCertificate(
                          index,
                          "credentialUrl",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ),
              },
            ]}
          />
        ))}
        <Button className="text-[#4096ff] border-[#4096ff]" onClick={handleAdd}>
          Add More
        </Button>
      </div>
    </div>
  );
};

export default CertificateDetails;
