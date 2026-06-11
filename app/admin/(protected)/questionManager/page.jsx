"use client";
import React, { useEffect, useState, useCallback } from "react";
import styles from "./page.module.scss";
import Image from "next/image";
import {
  Modal,
  Select,
  Button,
  Table,
  Tag,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { getAllAssessments } from "@/redux/slices/admin/cms/test";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";
import { MdDelete, MdSchool } from "react-icons/md";
import { deleteSkill, fetchSkills } from "@/redux/slices/admin/cms/skillsSlice";
import { parseIfJson } from "@/utils/windowMW";

const Page = () => {
  const nav = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const { canAccess, getPermissionMessage } = usePermissions();

  const SKILLS = useSelector((state) => state.skill?.skills?.value);

  useEffect(() => {
    dispatch(fetchSkills());
  }, []);

  const handleCreateNewSkill = useCallback(() => {
    if (!canAccess(PERMISSION_VALUES.CREATE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
      return;
    }
    nav.push("/admin/questionManager/newSkill");
  }, [nav, canAccess, getPermissionMessage]);

  const handleLoadMore = useCallback(() => {
    console.log("Load more skills");
  }, []);

  const handleCardClick = useCallback(
    (skillId) => {
      nav.replace(`/admin/questionManager/${skillId}/details`);
    },
    [nav]
  );

  const handleDelete = useCallback(
    (skillId) => {
      if (!canAccess(PERMISSION_VALUES.DELETE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
        return;
      }
      // Add your delete logic here
      message.success("Skill deleted successfully");
      console.log("Deleting skill:", skillId);
    },
    [canAccess, getPermissionMessage]
  );

  return (
    <div className={styles.mainContainer}>
      <div className={styles.createButton}>
        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES.CREATE)
              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
              : ""
          }
        >
          <span>
            <Button
              type="primary"
              onClick={handleCreateNewSkill}
              disabled={!canAccess(PERMISSION_VALUES.CREATE)}
            >
              Add new Skill
            </Button>
          </span>
        </Tooltip>
      </div>

      <div className={styles.cardsList}>
        {SKILLS?.length > 0 ? (
          <div className={styles.cards}>
            {SKILLS?.map((skill, ind) => {
              return (
                <div
                  className={styles.card}
                  onClick={() => handleCardClick(skill?._id)}
                >
                  <div className={styles.cardHeader}>
                    <div>{skill?.title}</div>
                    {/* <Popconfirm
                        title="Delete Skill"
                        description="Are you sure you want to delete this skill? This action cannot be undone."
                        onConfirm={(e) => {
                          e.stopPropagation();
                          handleDelete(skill?._id);
                        }}
                        onCancel={(e) => e.stopPropagation()}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        placement="top"
                      >
                        <Button
                          type="text"
                          onClick={(e) => e.stopPropagation()}
                          danger
                        >
                          <MdDelete style={{ color: "red" }} />
                        </Button>
                      </Popconfirm> */}
                  </div>
                  <p className={styles.desc}>{skill?.description}</p>
                  {/* <div className={styles.skillsStyles}>
                      <div className={styles.skillTab}>{skill?.category}</div>
                      <div className={styles.skillTab}>
                        {skill?.subcategory}
                      </div>
                    </div> */}

                  {/* <div className={styles.infoBody}>
                      <div>questions : 0</div> |<div>difficulty : Easy</div> |
                      <div>category : Frontend</div>
                    </div> */}

                  {/* <div className={styles.cardBody}>
                      <div className={styles.imageContainer}>
                        <img src={skill?.imgUrls} alt="Skill" />
                        <Image
                          src={skill?.imageUrl}
                          alt="Skill"
                          fill
                          // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div> */}

                  <div className={styles.cardFooter}>
                    <Tooltip
                      title={
                        !canAccess(PERMISSION_VALUES.CREATE)
                          ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                          : ""
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          type="primary"
                          id="Invite"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canAccess(PERMISSION_VALUES.CREATE)) {
                              message.info(
                                getPermissionMessage(PERMISSION_VALUES.CREATE)
                              );
                              return;
                            }
                            nav.push(
                              `/admin/questionManager/${skill?._id}/questionManager`
                            );
                          }}
                          disabled={!canAccess(PERMISSION_VALUES.CREATE)}
                        >
                          Add Questions
                        </Button>
                        <Button
                          type="primary"
                          id="Invite"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canAccess(PERMISSION_VALUES.DELETE)) {
                              message.info(
                                getPermissionMessage(PERMISSION_VALUES.DELETE)
                              );
                              return;
                            }
                            setDeleteModalData(skill?._id);
                            setDeleteModal(true);
                          }}
                          disabled={!canAccess(PERMISSION_VALUES.DELETE)}
                        >
                          Delete Skill
                        </Button>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <MdSchool size={80} color="#d9d9d9" />
            </div>
            <div className={styles.emptyStateContent}>
              <h3>No Skills Added Yet</h3>
              <p>
                Start building your skill assessment library by adding your
                first skill category.
              </p>
              <Tooltip
                title={
                  !canAccess(PERMISSION_VALUES.CREATE)
                    ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                    : ""
                }
              >
                <span>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleCreateNewSkill}
                    disabled={!canAccess(PERMISSION_VALUES.CREATE)}
                  >
                    Add Your First Skill
                  </Button>
                </span>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      <div className={styles.paddingContainer} />
      <Modal
        title={"Delete Skill"}
        open={deleteModal}
        onOk={() => {
          dispatch(deleteSkill({ skillId: deleteModalData })).then((r) => {
            setDeleteModal(false);
          });
        }}
        onCancel={() => setDeleteModal(false)}
        mask={{ closable: false }}
        // keyboard={!submitting}
        // closable={!submitting}
        okText={"Delete Skill"}
        cancelText="Cancel"
        width={500}
      >
        <h4>Are you sure you want to delete this Skill</h4>
      </Modal>
    </div>
  );
};

export default Page;
