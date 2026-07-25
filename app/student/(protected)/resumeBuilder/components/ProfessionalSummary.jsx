"use client";
import React, { useState } from "react";
import TextEditor from "@/universalUtils/editor";
import { BulbOutlined, AimOutlined, StarOutlined, UserOutlined, ArrowRightOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

const EXAMPLES = [
  { role: "Experienced Software Developer", text: "Experienced Software Developer with a proven track record of designing and implementing scalable web applications. Skilled in modern JavaScript frameworks and cloud infrastructure." },
  { role: "Frontend Developer", text: "Detail-oriented Frontend Developer with 3+ years of experience building responsive, user-centric web interfaces using React, Redux, and Tailwind CSS." },
  { role: "Full Stack Developer", text: "Versatile Full Stack Developer proficient in React, Node.js, and MongoDB. Passionate about creating seamless end-to-end user experiences and optimizing application performance." },
  { role: "Data Analyst", text: "Analytical Data Analyst with expertise in SQL, Python, and Tableau. Adept at transforming complex datasets into actionable insights to drive business strategy." },
  { role: "Product Manager", text: "Strategic Product Manager with 5 years of experience leading cross-functional teams to deliver innovative software products from concept to launch." },
  { role: "UI/UX Designer", text: "Creative UI/UX Designer focused on delivering intuitive and visually engaging digital experiences. Skilled in wireframing, prototyping, and user research." },
  { role: "DevOps Engineer", text: "Results-driven DevOps Engineer experienced in automating deployment pipelines, managing CI/CD workflows, and ensuring cloud infrastructure reliability." },
  { role: "Marketing Specialist", text: "Dynamic Marketing Specialist with a strong background in digital campaigns, SEO, and content strategy to boost brand awareness and engagement." },
  { role: "Data Scientist", text: "Innovative Data Scientist specializing in machine learning, predictive modeling, and statistical analysis to solve complex business problems." },
  { role: "Sales Executive", text: "High-performing Sales Executive with a track record of exceeding revenue targets, building client relationships, and driving market expansion." },
];

const ProfessionalSummary = ({ data, updateField }) => {
  const currentText = data.professionalSummary || "";
  let unquotedText = currentText;
  if (unquotedText.startsWith('"') && unquotedText.endsWith('"')) {
    unquotedText = unquotedText.slice(1, -1);
  }
  const rawText = unquotedText.replace(/<[^>]*>?/gm, "").trim();
  const charCount = rawText.length;

  const ITEMS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(EXAMPLES.length / ITEMS_PER_PAGE);

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const currentExamples = EXAMPLES.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  return (
    <div className="w-full flex flex-col gap-5 mt-2 pb-6">
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <TextEditor
          initialContent={{ professionalSummary: data.professionalSummary }}
          editorFun={(e) => updateField("professionalSummary", e)}
          name="professionalSummary"
          placeholder="Write a brief summary about your professional background, key skills, achievements and what you bring to the table..."
        />
        <div className="px-4 py-3 flex items-center justify-between border-t border-[#e2e8f0] bg-[#f8fafc]">
          <span className="text-[12px] text-[#64748b]">{charCount} / 500 characters</span>
        </div>
      </div>

      <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex items-center gap-2 mb-3">
          <BulbOutlined className="text-[#1E69DA] text-[16px]" />
          <h4 className="text-[13px] font-bold text-[#0f172a] m-0">Tips to write a great summary</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
              <AimOutlined className="text-[#1E69DA] text-[12px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#0f172a] mb-0.5">Highlight your key strengths</span>
              <span className="text-[11px] text-[#64748b]">Focus on your top skills and expertise.</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
              <StarOutlined className="text-[#1E69DA] text-[12px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#0f172a] mb-0.5">Show your value</span>
              <span className="text-[11px] text-[#64748b]">Mention achievements and impact.</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
              <UserOutlined className="text-[#1E69DA] text-[12px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#0f172a] mb-0.5">Keep it relevant</span>
              <span className="text-[11px] text-[#64748b]">Tailor it to the job you're applying for.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-[#0f172a] m-0">Examples to get you started</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="w-7 h-7 rounded flex items-center justify-center border border-[#e2e8f0] text-[#64748b] bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8fafc] transition-colors"
            >
              <LeftOutlined className="text-[11px]" />
            </button>
            <span className="text-[12px] text-[#64748b] font-medium">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="w-7 h-7 rounded flex items-center justify-center border border-[#e2e8f0] text-[#64748b] bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8fafc] transition-colors"
            >
              <RightOutlined className="text-[11px]" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentExamples.map((ex, i) => (
            <button
              key={i}
              onClick={() => updateField("professionalSummary", `<p>${ex.text}</p>`)}
              className="flex items-center justify-between p-3 rounded-lg border border-[#e2e8f0] bg-white hover:border-[#1E69DA] hover:shadow-sm transition-all text-left group min-h-[60px]"
            >
              <span className="text-[12px] font-semibold text-[#334155] group-hover:text-[#1E69DA] leading-snug pr-2">
                {ex.role}
              </span>
              <ArrowRightOutlined className="text-[#94a3b8] text-[11px] group-hover:text-[#1E69DA]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSummary;
