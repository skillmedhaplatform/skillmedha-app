"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// Import your tab components
import Overview from "./components/overview";
import Resources from "./components/resources";
import Quiz from "./components/quiz";
import Coding from "./components/coding";
import Video from "./components/video";

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
    editTopic,
  } = params;

  // Redirect to overview if no editTopic param or if it's the base route
  useEffect(() => {
    if (!editTopic) {
      router.replace(`/admin/internship/${internshipId}/${sectionId}/${topicId}`);
    }
  }, [editTopic, router, internshipId, sectionId, topicId]);

  // Function to render the appropriate component
  const renderTabContent = () => {
    switch (editTopic) {
      case "topic":
        return <Overview />;
      case "pdf":
        return <Resources />;
      case "quiz":
        return <Quiz />;
      case "coding":
        return <Coding />;
      case "video":
        return <Video />;
      default:
        return;
    }
  };

  return (
    <div style={{ height: "65vh", overflowY: "auto" }}>
      {renderTabContent()}
    </div>
  );
}
