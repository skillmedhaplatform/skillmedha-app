"use client";

// A simple client-only helper to init & join a Zoom meeting.
// All ZoomMtg calls here will only ever run in the browser.
export function joinMeeting(ZoomMtg, {
  signature,
  sdkKey,
  meetingNumber,
  passWord,
  userName,
  userEmail,
  registrantToken = "",
  zakToken = "",
  leaveUrl,
  onMeetingEnd,     // callback if you want to handle end events
  onJoinError       // callback on join errors
}) {
  ZoomMtg.init({
    leaveUrl,
    patchJsMedia: true,
    leaveOnPageUnload: true,
    success: () => {
      ZoomMtg.join({
        signature,
        sdkKey,
        meetingNumber,
        passWord,
        userName,
        userEmail,
        tk: registrantToken,
        zak: zakToken,
        success: (joinSuccess) => {
          console.log("Zoom join success", joinSuccess);

          // optional: listen for in-meeting events
          ZoomMtg.inMeetingServiceListener("onMeetingStatus", (data) => {
            if (data.status === 3 && onMeetingEnd) {
              onMeetingEnd();
            }
          });
          ZoomMtg.inMeetingServiceListener("onUserLeave", (data) => {
            if (data.reasonCode === 1 && onMeetingEnd) {
              onMeetingEnd();
            }
          });
        },
        error: (err) => {
          console.error("Zoom join error", err);
          if (onJoinError) onJoinError(err);
        }
      });
    },
    error: (err) => {
      console.error("Zoom init error", err);
      if (onJoinError) onJoinError(err);
    }
  });
}
