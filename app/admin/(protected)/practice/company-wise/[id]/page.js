"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Space, Typography, Modal, message, Popconfirm, Checkbox, Tooltip } from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CloudUploadOutlined, 
  CaretRightOutlined,
  DownloadOutlined,
  InboxOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuestions, deleteQuestion } from "@/redux/slices/admin/cms/practiceSlice";
import listStyles from "../../Practice_utils/listStyles.module.scss";
import CompanyQuestionForm from "./CompanyQuestionForm";
import BulkUploadModal from "../../Practice_utils/BulkUploadModal";

const { Title, Text } = Typography;

export default function CompanyManageQuestionsPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [activePanels, setActivePanels] = useState([]);
  const dispatch = useDispatch();
  const { questions } = useSelector((state) => state.adminPractice || {});
  
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchQuestions({ subjectId: id }));
    }
  }, [dispatch, id]);

  const handleDelete = (questionId) => {
    dispatch(deleteQuestion(questionId))
      .unwrap()
      .then(() => message.success("Question deleted successfully"))
      .catch((err) => message.error("Failed to delete question"));
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = useCallback(async () => {
    setIsDeleting(true);
    const promises = selectedQuestions.map(qid => dispatch(deleteQuestion(qid)).unwrap());
    
    try {
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      if (successful.length > 0) {
        message.success(`${successful.length} questions deleted successfully.`);
      }
      if (failed.length > 0) {
        message.error(`Failed to delete ${failed.length} questions.`);
        console.error("Bulk delete failures:", failed);
      }
      setSelectedQuestions([]);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedQuestions, dispatch]);

  const handleSelectAll = useCallback((checked) => {
    if (checked && questions) {
      setSelectedQuestions(questions.map(q => q._id || q.id));
    } else {
      setSelectedQuestions([]);
    }
  }, [questions]);

  const togglePanel = (qid) => {
    setActivePanels(prev => prev.includes(qid) ? prev.filter(p => p !== qid) : [...prev, qid]);
  };

  return (
    <div className={listStyles.pageContainer}>
      <div className={listStyles.topActionRow}>
        <div className={listStyles.actionsLeft}>
          <div className="flex items-center gap-3">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined style={{ fontSize: '18px', color: '#6b7280' }} />} 
              onClick={() => router.push('/admin/practice/company-wise')}
              className="hover:bg-gray-200/50 -ml-3"
            />
            <Title level={3} style={{ margin: 0, color: '#1E69DA' }}>Manage Questions</Title>
          </div>
        </div>
        
        <div className={listStyles.actionsRight}>
          <button
            className={listStyles.btnPrimary}
            onClick={() => setManualModalOpen(true)}
          >
            + Create Question
          </button>

          <button
            className={listStyles.btnSecondary}
            onClick={() => setBulkModalOpen(true)}
          >
            <CloudUploadOutlined /> Bulk Upload
          </button>
        </div>
      </div>

      <div className={listStyles.questionList}>
        {questions && questions.length > 0 && (
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Checkbox 
               checked={selectedQuestions.length === questions.length}
               indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < questions.length}
               onChange={(e) => handleSelectAll(e.target.checked)}
            >
              Select All
            </Checkbox>
            {selectedQuestions.length > 0 && (
              <Popconfirm title={`Delete ${selectedQuestions.length} questions?`} onConfirm={handleBulkDelete}>
                <Button danger type="primary" size="small" loading={isDeleting}>Delete Selected</Button>
              </Popconfirm>
            )}
          </div>
        )}
        {!questions || questions.length === 0 ? (
          <div className={listStyles.emptyState} style={{ padding: '4rem', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
            <QuestionCircleOutlined style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
            <Title level={4} style={{ color: '#475569', margin: '0 0 8px 0' }}>No questions found</Title>
            <Text type="secondary">Create your first question to get started.</Text>
          </div>
        ) : (
          questions.map((q, index) => {
            const qId = q._id || q.id;
            const isExpanded = activePanels.includes(qId);
            const isSelected = selectedQuestions.includes(qId);
            return (
              <div key={qId}>
                <div className={listStyles.questionRow} onClick={() => togglePanel(qId)} style={{ cursor: 'pointer' }}>
                  <div className={listStyles.rowLeft}>
                    <Checkbox 
                       style={{ marginRight: 8 }} 
                       checked={isSelected}
                       onClick={(e) => e.stopPropagation()}
                       onChange={(e) => {
                         if (e.target.checked) setSelectedQuestions([...selectedQuestions, qId]);
                         else setSelectedQuestions(selectedQuestions.filter(id => id !== qId));
                       }} 
                    />
                    <CaretRightOutlined className={`${listStyles.expandIcon} ${isExpanded ? listStyles.expanded : ""}`} />
                    <span className={listStyles.qNumber}>{index + 1}</span>
                    <span className={listStyles.qText}>
                      {q.questionContent?.question?.substring(0, 50) || "No Question Text"}...
                    </span>
                  </div>
                  
                  <div className={listStyles.rowRight}>
                    <div className={listStyles.badges}>
                      <span className={`${listStyles.badge} ${listStyles.pts}`}>{q.scoreSettings?.pointsForCorrectAns || 1} pts</span>
                      <span className={`${listStyles.badge} ${listStyles.type}`}>{q.questionType}</span>
                      <span className={`${listStyles.badge} ${listStyles.difficulty}`}>{q.difficulty}</span>
                    </div>
                    
                    <div className={listStyles.actions} onClick={e => e.stopPropagation()}>
                      <Tooltip title="Edit">
                        <Button type="text" icon={<EditOutlined />} />
                      </Tooltip>
                      <Popconfirm title="Delete this question?" onConfirm={() => handleDelete(qId)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={listStyles.expandedContent} style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <Text strong style={{ color: '#64748b' }}>Section / Category: </Text>
                      <Text>{q.sectionName || q.concept || "N/A"}</Text>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <Text strong style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Question Content:</Text>
                      <Text>{q.questionContent?.question}</Text>
                    </div>
                    
                    {/* Render Options if available */}
                    {q.questionType !== 'Coding Question' && q.questionContent && (
                      <div style={{ marginBottom: '1rem' }}>
                        <Text strong style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Options:</Text>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569' }}>
                          {q.questionContent["option 1"] && <li>A: {q.questionContent["option 1"]}</li>}
                          {q.questionContent["option 2"] && <li>B: {q.questionContent["option 2"]}</li>}
                          {q.questionContent["option 3"] && <li>C: {q.questionContent["option 3"]}</li>}
                          {q.questionContent["option 4"] && <li>D: {q.questionContent["option 4"]}</li>}
                        </ul>
                      </div>
                    )}

                    {/* Render Correct Answer */}
                    <div style={{ marginBottom: '1rem' }}>
                      <Text strong style={{ color: '#10b981', display: 'block', marginBottom: '0.5rem' }}>Correct Answer:</Text>
                      <Text style={{ color: '#059669' }}>
                        {q.answer?.singleChoice && Object.keys(q.answer.singleChoice).find(k => q.answer.singleChoice[k])?.replace("option", "Option")}
                        {q.answer?.multipleChoice && Object.keys(q.answer.multipleChoice).filter(k => q.answer.multipleChoice[k]).map(k => k.replace("option", "Option")).join(", ")}
                      </Text>
                    </div>

                    {/* Render Explanation */}
                    {q.answer?.explanation && (
                      <div style={{ marginBottom: '1rem' }}>
                        <Text strong style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Explanation:</Text>
                        <Text>{q.answer.explanation}</Text>
                      </div>
                    )}

                    {/* Render Coding Specific Fields */}
                    {q.questionType === 'Coding Question' && (
                      <>
                        <div style={{ marginBottom: '1rem' }}>
                          <Text strong style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Constraints:</Text>
                          <Text style={{ whiteSpace: 'pre-wrap' }}>{q.questionContent?.constraints || 'N/A'}</Text>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <Text strong style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Time Limit:</Text>
                          <Text>{q.questionContent?.timeLimit ? `${q.questionContent.timeLimit} ms` : 'N/A'}</Text>
                        </div>
                        {q.questionContent?.testCases && q.questionContent.testCases.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <Text strong style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Test Cases:</Text>
                            {q.questionContent.testCases.map((tc, idx) => (
                              <div key={idx} style={{ marginBottom: '0.5rem', background: tc.isHidden ? '#fff1f0' : '#f1f5f9', border: tc.isHidden ? '1px solid #ffa39e' : 'none', padding: '0.5rem', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <Text strong style={{ fontSize: '12px' }}>Input:</Text>
                                  {tc.isHidden && <span style={{ fontSize: '10px', background: '#ff4d4f', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Hidden</span>}
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: '12px', marginBottom: '4px', whiteSpace: 'pre-wrap' }}>{tc.input}</div>
                                <Text strong style={{ fontSize: '12px' }}>Output:</Text>
                                <div style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{tc.output}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Manual Upload Modal */}
      <Modal
        title="Create New Question"
        open={manualModalOpen}
        onCancel={() => setManualModalOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <CompanyQuestionForm onAddQuestion={(newQ) => {
          setQuestions([...questions, { ...newQ, points: 1 }]);
          setManualModalOpen(false);
          message.success("Question added successfully!");
        }} />
      </Modal>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        subjectId={id}
        isCompanyWise={true}
        onSuccess={() => {
          dispatch(fetchQuestions({ subjectId: id }));
        }}
      />
    </div>
  );
}
