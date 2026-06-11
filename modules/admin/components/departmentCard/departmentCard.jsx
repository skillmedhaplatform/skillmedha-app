import React from "react";
import { Button, Dropdown, Menu, message, Popconfirm } from "antd";
import styles from "./departmentcard.module.scss";
import { HiDotsVertical } from "react-icons/hi";
import { deleteLstorageVal, setSstorage } from "@/utils/windowMW";
import { useDispatch } from "react-redux";

const DepartmentCard = ({ handleClick, item }) => {
  const dispatch = useDispatch();
  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          handleClick(item?._id, "EDIT");
        }}
      >
        Edit
      </Menu.Item>

      <Menu.Item
        key="2"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          handleClick(item?._id, "DELETE");
        }}
      >
        Delete
      </Menu.Item>
      <Menu.Item key="3" onClick={(e) => e.domEvent.stopPropagation()}>
        <Popconfirm
          title="Are you sure you want to delete all students?"
          onConfirm={() => {
            handleClick(item?._id, "DELETE_ALL_STUDENTS");
          }}
          onCancel={() => {
            message.info("Deletion canceled");
          }}
          okText="Yes"
          cancelText="No"
        >
          <span style={{ cursor: "pointer", color: "red" }}>
            Delete All Students
          </span>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      className={styles.cardCont}
      onClick={() => {
        // deleteLstorageVal("departmentTitle");
        // setSstorage("departmentTitle", item?.title);
        // handleClick(item?._id, "GET");
      }}
    >
      <div className={styles.imgCont}>
        <img
          className={styles.branchImage}
          src={item?.branchLogo || "/default-dept.png"}
          alt={item?.title}
        />
      </div>
      <div className={styles.titleCont}>
        <p className={styles.title}>{item?.title || "Department"}</p>

        {/* <Dropdown overlay={menu} trigger={["click"]}>
          <Button type="text" onClick={(e) => e.stopPropagation()}>
            <HiDotsVertical className={styles.moreIcon} />
          </Button>
        </Dropdown> */}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.titleSection}>
          <p>Number of students registered: {item?.students?.length || 0}</p>
        </div>

        <div className={styles.detailsSection}>
          <p>
            <strong>HOD:</strong> {item?.hodName || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {item?.mobile || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {item?.email || "N/A"}
          </p>
          <p>
            <strong>SPOC:</strong> {item?.spoc || "N/A"}
          </p>
        </div>
      </div>

      {/* <Button
        type="primary"
        className={styles.brochureBtn}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        Download Brochure
      </Button> */}
    </div>
  );
};

export default DepartmentCard;
