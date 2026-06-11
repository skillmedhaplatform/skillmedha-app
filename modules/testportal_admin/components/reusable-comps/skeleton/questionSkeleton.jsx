import { Skeleton } from "antd";
import React from "react";

export default function QuestionSkeleton() {
  return (
    <Skeleton
      avatar
      paragraph={{
        rows: 2,
      }}
      active={true}
      
    />
  );
}
