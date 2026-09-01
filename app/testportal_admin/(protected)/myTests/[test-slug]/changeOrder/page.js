// "use client";
// import React, { useState, useCallback, useEffect } from "react";
// import DraggableQuestion from "./deag";
// import DraggableQuestionStyles from "./DraggableQuestion.module.scss";
// import { useDispatch, useSelector } from "react-redux";
// import { allQues, ChangeQuestionOrder } from "@/redux/slices/testportal_admin/slice/questions";
// import _ from "lodash";
// import { Pagination } from "antd";
// import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";
// import { useParams } from "next/navigation";

// const DraggableQuestionList = ({ draggable, testTitle, testId }) => {
//   const dispatch = useDispatch();

//   const filteredQuestions = useSelector(
//     (state) => state.questions.filteredQuestions
//   );

//   const singleTestStaus = useSelector(
//     (state) => state.tests.singleTestStatus.status
//   );
//   const singleTestQuestions = useSelector(
//     (state) => state.tests.test?.questions
//   );

//   const [questions, setQuestions] = useState(filteredQuestions);
//   const [reorderedQuestions, setReorderedQuestions] =
//     useState(filteredQuestions);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;
//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
//   // const paginatedQuestions = filteredQuestions.slice(
//   //   (currentPage - 1) * itemsPerPage,
//   //   currentPage * itemsPerPage
//   // );
//   const moveQuestion = useCallback(
//     (dragIndex, hoverIndex) => {
//       const dragQuestion = questions[dragIndex];
//       setQuestions((questions) => {
//         const newQuestions = [...questions];
//         newQuestions.splice(dragIndex, 1);
//         newQuestions.splice(hoverIndex, 0, dragQuestion);

//         setReorderedQuestions(newQuestions);
//         return newQuestions;
//       });
//     },
//     [questions]
//   );

//   // useEffect(() => {
//   //   if (!draggable) {
//   //     if (Array.isArray(reorderedQuestions))
//   //       if (Array.isArray(questions))
//   //         if (reorderedQuestions.length !== 0 &&reorderedQuestions.length == questions.length && !_.isEqual(reorderedQuestions,questions))
//   //           dispatch(
//   //             ChangeQuestionOrder({
//   //               title: testTitle,
//   //               testId: testId,
//   //               questions: reorderedQuestions?.map((e) => {
//   //                 return e?._id;
//   //               }),
//   //             })
//   //           );
//   //   }
//   //   dispatch(allQues({}));
//   // }, [draggable]);

//   return (
//     <div>
//       {singleTestStaus === "pending" ? (
//         <div className={DraggableQuestionStyles.questionCard}>
//           <QuestionSkeleton />
//           <br />
//           <QuestionSkeleton />
//           <br />
//           <QuestionSkeleton />
//           <br />
//           <QuestionSkeleton />
//           <br />
//           <QuestionSkeleton />
//         </div>
//       ) : (
//         <div className={DraggableQuestionStyles.questions_cont}>
//           {filteredQuestions?.length ? (
//             filteredQuestions?.map((question, index) => {
//               const originalIndex = singleTestQuestions.findIndex(
//                 (q) => q._id === question._id
//               );

//               return (
//                 <DraggableQuestion
//                   key={index}
//                   question={question}
//                   index={originalIndex}
//                   moveQuestion={moveQuestion}
//                   draggable={draggable}
//                 />
//               );
//             })
//           ) : (
//             <div className={DraggableQuestionStyles.No_Questions_container}>
//               No Questions added yet!
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DraggableQuestionList;

"use client";
import React, { useState, useCallback, useEffect } from "react";
import DraggableQuestion from "./deag";
import DraggableQuestionStyles from "./DraggableQuestion.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { allQues, ChangeQuestionOrder } from "@/redux/slices/testportal_admin/slice/questions";
import _ from "lodash";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";
import { useParams } from "next/navigation";

const DraggableQuestionList = ({ draggable, testTitle, testId }) => {
  const dispatch = useDispatch();

  const filteredQuestions = useSelector(
    (state) => state.questions.filteredQuestions
  );

  const singleTestStaus = useSelector(
    (state) => state.tests.singleTestStatus.status
  );
  const singleTestQuestions = useSelector(
    (state) => state.tests.test?.questions
  );

  const [questions, setQuestions] = useState(filteredQuestions);
  const [reorderedQuestions, setReorderedQuestions] =
    useState(filteredQuestions);
  const moveQuestion = useCallback(
    (dragIndex, hoverIndex) => {
      // Calculate actual indices in the full array
      const actualDragIndex = parseInt(dragIndex);
      const actualHoverIndex = parseInt(hoverIndex);

      const dragQuestion = questions[actualDragIndex];
      setQuestions((prevQuestions) => {
        const newQuestions = [...prevQuestions];
        newQuestions.splice(actualDragIndex, 1);
        newQuestions.splice(actualHoverIndex, 0, dragQuestion);

        setReorderedQuestions(newQuestions);
        return newQuestions;
      });
    },
    [questions]
  );

  // Sync questions state with filteredQuestions when it changes
  useEffect(() => {
    setQuestions(filteredQuestions);
    setReorderedQuestions(filteredQuestions);
  }, [filteredQuestions]);

  // useEffect(() => {
  //   if (!draggable) {
  //     if (Array.isArray(reorderedQuestions))
  //       if (Array.isArray(questions))
  //         if (reorderedQuestions.length !== 0 &&reorderedQuestions.length == questions.length && !_.isEqual(reorderedQuestions,questions))
  //           dispatch(
  //             ChangeQuestionOrder({
  //               title: testTitle,
  //               testId: testId,
  //               questions: reorderedQuestions?.map((e) => {
  //                 return e?._id;
  //               }),
  //             })
  //           );
  //   }
  //   dispatch(allQues({}));
  // }, [draggable]);

  return (
    <div>
      {singleTestStaus === "pending" ? (
        <div className={DraggableQuestionStyles.questionCard}>
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
        </div>
      ) : (
        <>
          <div className={DraggableQuestionStyles.questions_cont}>
            {filteredQuestions?.length ? (
              filteredQuestions?.map((question, index) => {
                const originalIndex = singleTestQuestions.findIndex(
                  (q) => q._id === question._id
                );

                return (
                  <DraggableQuestion
                    key={question._id || index}
                    question={question}
                    index={index}
                    moveQuestion={moveQuestion}
                    draggable={draggable}
                  />
                );
              })
            ) : (
              <div className={DraggableQuestionStyles.No_Questions_container}>
                No Questions added yet!
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
};

export default DraggableQuestionList;
