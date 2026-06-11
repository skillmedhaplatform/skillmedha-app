"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getOneMeeting, updateMeeting } from "@/redux/slices/admin/adminZoomSlice";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";

export default function ZoomPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const singleMeeting = useSelector((s) => s.adminZoom.singleMeeting);
  
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (params?.meeting) {
      dispatch(getOneMeeting({ id: params.meeting }));
    }
  }, [dispatch, params.meeting]);

  const generateSignatureAndRedirect = useCallback(async () => {
    const meetingNumber = singleMeeting?.meetingDetails?.id;
    const role = 1;

    if (!meetingNumber || isRedirecting) return;

    try {
        setIsRedirecting(true);
        const { signature, sdkKey } = await fetch(`${restUrl}/signature`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getLstorage("token")}`,
            },
            body: JSON.stringify({ meetingNumber, role }),
          }).then((r) => r.json());

          const passWord = singleMeeting?.meetingDetails?.password;
          const userName = singleMeeting?.hostName;
          const userEmail = "prasanna@techiepanda.in";
          const leaveUrl = window.location.origin + "/admin/liveLect"; // Redirect back to list

          const urlParams = new URLSearchParams({
              signature,
              sdkKey,
              meetingNumber,
              passWord,
              userName,
              userEmail,
              leaveUrl
          });

          // Redirect to the zoom meeting page directly (no iframe)
          window.location.href = `/zoom-meeting.html?${urlParams.toString()}`;

    } catch (error) {
        console.error("Failed to generate signature", error);
        setIsRedirecting(false);
    }
  }, [singleMeeting, isRedirecting]);

  useEffect(() => {
    if (singleMeeting?._id && !isRedirecting) {
        generateSignatureAndRedirect();
    }
  }, [singleMeeting, isRedirecting, generateSignatureAndRedirect]);

  return (
    <div className="parentComp" style={{ height: "100vh", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p>Preparing meeting...</p>
    </div>
  );
}