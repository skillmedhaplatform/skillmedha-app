import Title from "antd/es/skeleton/Title";
import StoreProvider from "../redux/storeProvider";
import ResultsComp from "./resultscomp";

export const metadata = {
  title: "Results Page",
};
export default function ResultsPage() {
  return (
    <div>
      <StoreProvider>
        <ResultsComp />
      </StoreProvider>
    </div>
  );
}
