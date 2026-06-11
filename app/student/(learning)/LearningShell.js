"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStudentCreds } from "@/redux/slices/student";
import { getLstorage } from "@/universalUtils/windowMW";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#24A058" },
    secondary: { main: "#24A058" },
  },
});

export default function LearningShell({ children, serverToken }) {
  const nav = useRouter();
  const dispatch = useDispatch();
  const studentCreds = useSelector((state) => state.student.student?.data);

  useEffect(() => {
    if (!studentCreds || Object.keys(studentCreds).length === 0) {
      if (!getLstorage("token")) return;
      dispatch(getStudentCreds()).then((result) => {
        // Auth failure — thunk cleared storage & cookies. Redirect via router.
        if (result?.payload?.authError) {
          nav.replace("/login");
        }
      });
    }
  }, [studentCreds?._id, dispatch]);

  if (!serverToken) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </ThemeProvider>
  );
}
