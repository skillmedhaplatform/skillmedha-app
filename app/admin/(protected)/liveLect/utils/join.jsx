"use client";
import { ZoomMtg } from "@zoom/meetingsdk";
import "../page.css";
import { restUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";

// ZoomMtg.preLoadWasm();
// ZoomMtg.prepareWebSDK();

function ZoomClient({ meetingNumber, userName, passWord }) {
  const authEndpoint = restUrl + "/signature";

  const role = 1; // 1 - for host 0 for client
  const leaveUrl = window.location.origin;
  const registrantToken = "";
  const zakToken = "";
  const userEmail = "prasanna@techiepanda.in";

  const getSignature = async () => {
    try {
      const req = await fetch(authEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("token")}`,
        },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: role,
        }),
      });
      const res = await req.json();
      const signature = res.signature;
      const sdkKey = res.sdkKey;
      startMeeting(signature, sdkKey);
    } catch (e) {
      console.log(e);
    }
  };

  function startMeeting(signature, sdkKey) {
    // document.getElementById("zmmtg-root").style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      success: (success) => {
        console.log(success);
        // can this be async?
        ZoomMtg.join({
          signature: signature,
          sdkKey: sdkKey,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: userName,
          userEmail: userEmail,
          tk: registrantToken,
          zak: zakToken,

          success: (success) => {
            ZoomMtg.focusMode({
              enable: true,
              success: () => console.log("Focus mode on"),
              error: (e) => console.error("focusMode error", e),
            });
            console.log(success);
          },
          error: (error) => {
            console.log(error);
          },
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  return (
    <div style={{ height: "90%", overflow: "hidden" }}>
      <button onClick={getSignature} style={{ zIndex: 10 }}>
        Join Meeting
      </button>
      <div id="zmmtg-root"></div>
    </div>
  );
}

export default ZoomClient;
