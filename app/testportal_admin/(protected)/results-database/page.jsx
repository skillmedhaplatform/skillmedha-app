import React, { Suspense } from "react";
const Home = React.Fragment;
import resultsPageStyles from "./styles/page.module.scss";
import DepartmentCards from "./components/DepartmentCards";

export default function ResultsDatbasePage() {
  return (
    <Home>
      <div className={resultsPageStyles.container}>
        <Suspense fallback={<div>Loading...</div>}>
          <DepartmentCards />
        </Suspense>
      </div>
    </Home>
  );
}
