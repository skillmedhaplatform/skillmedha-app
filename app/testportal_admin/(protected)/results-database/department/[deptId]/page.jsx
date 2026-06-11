import React, { Suspense } from "react";
const Home = React.Fragment;
import resultsPageStyles from "../../styles/page.module.scss";
import ProgressComp from "../../components/progress";

export default async function DepartmentResultsPage({ params }) {
    const resolvedParams = await params;
    return (
        <Home>
            <div className={resultsPageStyles.container}>
                <Suspense fallback={<div>Loading...</div>}>
                    <ProgressComp deptId={resolvedParams?.deptId} />
                </Suspense>
            </div>
        </Home>
    );
}
