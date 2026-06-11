"use client";
import React from "react";
import { Skeleton, Card, Col, Row } from "antd";

const ResultSkeleton = () => {
  return (
    <Card
      style={{
        padding: "5px",
        borderRadius: "10px",
        width: "70%",
        backgroundColor: "#D3D3D3",
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <Card bordered={false} style={{ borderRadius: "10px" }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: "50px", marginBottom: "10px" }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: "50px",
                  marginBottom: "10px",
                  marginLeft: "2rem",
                }}
              />
            </Card>

            <Card bordered={false} style={{ borderRadius: "10px" }}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: "50px",
                  marginBottom: "10px",
                }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: "50px",
                  marginBottom: "10px",
                  marginLeft: "2rem",
                }}
              />
            </Card>
          </div>
        </Col>
        <Col span={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: "10px",
              height: "90%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                justifyContent: "space-between",
                padding: "20px",
              }}
            >
              <Skeleton.Avatar
                active
                size="large"
                shape="circle"
                style={{ width: "150px", height: "150px" }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  gap: "15px",
                  marginLeft: "1rem",
                }}
              >
                <Skeleton.Input active size="small" style={{ width: "80px" }} />
                <Skeleton.Input
                  active
                  size="small"
                  style={{
                    width: "80px",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                  }}
                />
                <Skeleton.Input active size="small" style={{ width: "80px" }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default ResultSkeleton;
