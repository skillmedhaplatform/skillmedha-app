import { Skeleton } from "antd";
import React from "react";

export default function Loading() {
  return (
    <div>
      <Skeleton active={true} />
      <br />
      <Skeleton active={true} />
    </div>
  );
}
