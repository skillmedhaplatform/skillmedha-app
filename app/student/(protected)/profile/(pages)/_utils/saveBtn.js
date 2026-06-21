"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import { resetStudent, updateStudent } from "@/redux/slices/student";
export default function SaveBtn({ children, type,sameAsCurrent }) {
  const dispatch = useDispatch();
  const basicDetailsData = useSelector((state) => state.basicDetails.value);

  const handleSave = () => {
    dispatch(resetStudent());
    switch (type) {
      case "basicDetails": {
        const aboutDetails = basicDetailsData?.about?.reduce((acc, curr) => {
          if (curr?.key) {
            acc[curr.key] = curr.value;
          }
          return acc;
        }, {});

        const professionalSummary = basicDetailsData?.professionalSummary || "";

        const permanentAddress =
          basicDetailsData?.address?.permanentAddress?.reduce((acc, curr) => {
            if (curr?.key) {
              acc[curr.key] = curr.value;
            }
            return acc;
          }, {});

        const currentAddress =
          basicDetailsData?.address?.currentAddress?.reduce((acc, curr) => {
            if (curr?.key) {
              acc[curr.key] = curr.value;
            }
            return acc;
          }, {});

        const socialMedia = basicDetailsData?.socialMedia || [];
        dispatch(
          updateStudent({
            dispatch,
            aboutDetails: {
              professionalSummary,
              links: socialMedia,
              addresses: { permanentAddress, currentAddress,sameAsCurrent },
              ...aboutDetails
            },
          })
        );
        break;
      }
      default:
        console.warn("No save action defined for:", type);
        break;
    }
  };
  return (
    <div className="flex justify-end mt-4">
      <Button
        className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
        onClick={handleSave}
      >
        {children}
      </Button>
    </div>
  );
}
