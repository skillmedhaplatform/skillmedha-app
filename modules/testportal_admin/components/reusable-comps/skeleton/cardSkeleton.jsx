import { Card, Skeleton, Row, Col } from "antd";
import React from "react";

export default function CardSkeleton() {
  return (
    <Card style={{ width: 300, borderRadius: "10px" }}>
      <Skeleton
        active
        title={false}
        paragraph={{ rows: 2, width: "80%" }}
        size="large"
      />
      <br />
      <Col span={5}>
        <Skeleton.Input style={{ width: 40 }} active size="small" />
      </Col>

      <br />
      <Skeleton.Image
        style={{ width: 270, height: 150, borderRadius: "10px 10px 0 0" }}
      />
      <Skeleton paragraph={{ rows: 3 }} active style={{ marginTop: "10px" }} />
      <Skeleton.Button
        active
        shape="round"
        style={{ marginTop: "20px", width: "100px", height: "32px" }}
      />
    </Card>
  );
}
