"use client";
import React, { useEffect, useState } from "react";
import styles from "./interview.module.scss";
import { useDispatch, useSelector } from "react-redux";
;
import { UpdateJob } from "@/redux/slices/tpo/placementsSlice";
import { DatePicker, Radio, Select, message } from "antd";
import { FaChevronDown } from "react-icons/fa";
import dayjs from "dayjs";
import { useRouter } from "@bprogress/next/app";
import { useParams } from "next/navigation";

export default function InterviewPage() {
  const { RangePicker } = DatePicker;
  const dispatch = useDispatch();
  const router = useRouter();
  const { id, jobid } = useParams();
  const { value: ONEJOB, status } = useSelector(
    (state) => state.placement.OneJob
  );
  function generateId() {
    return Math.random().toString(36).substring(2, 8);
  }
  const [rounds, setRounds] = useState([
    {
      id: generateId(),
      type: "",
      mode: "",
      roundName: "",
      venue: "",
      schedule: {
        startDate: "",
        endDate: ""
      },
      link: "",
      description: "",
      isEditable: true
    },
  ]);

  const baseUrl = `/tpo/placementdrive/${id}/${jobid}`;

  useEffect(() => {
    if (ONEJOB?.data?.interviewRounds?.length > 0) {
      const enrichedRounds = ONEJOB.data.interviewRounds.map((round) => ({
        ...round,
        id: generateId(),
        isEditable: false
      }));
      setRounds(enrichedRounds);
    } else {
      setRounds([
        {
          id: generateId(),
          type: "",
          mode: "",
          roundName: "",
          venue: "",
          schedule: {
            startDate: "",
            endDate: ""
          },
          link: "",
          description: "",
          isEditable: true
        },
      ]);
    }
  }, [ONEJOB?.data?.interviewRounds]);

  const handleRoundChange = (id, key, value) => {
    const updatedRounds = rounds.map((round) =>
      round.id === id ? { ...round, [key]: value } : round
    );
    setRounds(updatedRounds);
  };

  const toggleEdit = (id) => {
    const updatedRounds = rounds.map((round) =>
      round.id === id ? { ...round, isEditable: !round.isEditable } : round
    );
    setRounds(updatedRounds);
  };

  const addNewRound = () => {
    setRounds([
      ...rounds,
      {
        id: generateId(),
        type: "",
        mode: "",
        roundName: "",
        venue: "",
        schedule: {
          startDate: "",
          endDate: ""
        },
        link: "",
        description: "",
        isEditable: true
      },
    ]);
  };

  const deleteRound = (id) => {
    const updatedRounds = rounds.filter((round) => round.id !== id);
    setRounds(updatedRounds);
  };

  const handleSubmitAll = async () => {
    // Validation
    for (const [index, round] of rounds.entries()) {
      if (
        !round.type ||
        !round.mode ||
        !round.roundName ||
        !round.venue ||
        !round.description
      ) {
        message.warning(`Please fill all fields in Round ${index + 1}`);
        return;
      }
      if (!round.schedule?.startDate || !round.schedule?.endDate) {
        message.warning(
          `Please select start and end time for Round ${index + 1}`
        );
        return;
      }
      if (
        round.type === "Assessment" &&
        round.mode === "Online" &&
        !round.link
      ) {
        message.warning(`Please provide Assessment URL for Round ${index + 1}`);
        return;
      }
    }

    const sanitizedRounds = rounds.map(({ isEditable, ...rest }) => rest);
    console.log("Final Interview Process Array:", sanitizedRounds);
    const payload = {
      interviewRounds: sanitizedRounds
    };

    await dispatch(UpdateJob({ dispatch, payload, jobid }));
    router.push(baseUrl);
  };

  return (
    <div className={styles.main}>
      {rounds.map((round, index) => (
        <div className={styles.mainCont} key={round.id}>
          <div className={styles.roundCont}>
            <h3>Round {index + 1}</h3>
            <div style={{ display: "flex", width: "100%" }}>
              <div className={styles.fieldCont1}>
                <label>Round Type</label>
                <Select
                  placeholder="Select Round Type"
                  style={{ width: "50%" }}
                  value={round.type}
                  suffixIcon={<FaChevronDown />}
                  onChange={(value) =>
                    handleRoundChange(round.id, "type", value)
                  }
                  disabled={!round.isEditable}
                  options={[
                    { label: "Interview", value: "Interview" },
                    { label: "Assessment", value: "Assessment" },
                  ]}
                />
              </div>
              <div className={styles.fieldCont1}>
                <label>Mode</label>
                <Radio.Group
                  style={{ width: "70%" }}
                  value={round.mode}
                  onChange={(e) =>
                    handleRoundChange(round.id, "mode", e.target.value)
                  }
                  disabled={!round.isEditable}
                  options={[
                    { label: "Offline", value: "Offline" },
                    { label: "Online", value: "Online" },
                  ]}
                  optionType="button"
                  buttonStyle="solid"
                />
              </div>
            </div>
            {round.type === "Assessment" && round.mode === "Online" && (
              <div className={styles.fieldCont}>
                <label>Assessment URL</label>
                <input
                  type="url"
                  placeholder="Enter online assessment link"
                  value={round.link || ""}
                  onChange={(e) =>
                    handleRoundChange(round.id, "link", e.target.value)
                  }
                  disabled={!round.isEditable}
                />
              </div>
            )}
            <div className={styles.fieldCont}>
              <label>Round Name</label>
              <input
                type="text"
                placeholder="Application"
                value={round.roundName}
                onChange={(e) =>
                  handleRoundChange(round.id, "roundName", e.target.value)
                }
                disabled={!round.isEditable}
              />
            </div>

            <div className={styles.fieldCont}>
              <label>Venue</label>
              <input
                type="text"
                placeholder="Auditorium"
                value={round.venue}
                onChange={(e) =>
                  handleRoundChange(round.id, "venue", e.target.value)
                }
                disabled={!round.isEditable}
              />
            </div>

            <div className={styles.fieldCont}>
              <label>Schedule</label>
              <div className={styles.scheduleInput}>
                <RangePicker
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  placeholder={["Start", "End"]}
                  variant="borderless"
                  showTime={{
                    format: "HH:mm",
                    use12Hours: false,
                    hideDisabledOptions: true,
                    defaultValue: [
                      dayjs("09:00", "HH:mm"),
                      dayjs("18:00", "HH:mm"),
                    ]
                  }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%", padding: "0.2rem 0" }}
                  value={
                    round.schedule?.startDate && round.schedule?.endDate
                      ? [
                        dayjs(round.schedule.startDate),
                        dayjs(round.schedule.endDate),
                      ]
                      : []
                  }
                  onChange={(dates) => {
                    const [start, end] = dates || [];
                    handleRoundChange(round.id, "schedule", {
                      startDate: start ? start.toISOString() : null,
                      endDate: end ? end.toISOString() : null
                    });
                  }}
                  disabled={!round.isEditable}
                />
              </div>
            </div>

            <div className={styles.fieldCont}>
              <label>Description</label>
              <textarea
                placeholder="Description"
                className={styles.textarea}
                value={round.description}
                onChange={(e) =>
                  handleRoundChange(round.id, "description", e.target.value)
                }
                disabled={!round.isEditable}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "5%"
              }}
            >
              <button
                className={styles.saveBtn}
                onClick={() => toggleEdit(round.id)}
              >
                {round.isEditable ? "Save" : "Edit"}
              </button>
              <button
                className={styles.saveBtn}
                onClick={() => deleteRound(round.id)}
                disabled={rounds.length === 1}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button className={styles.saveBtn} onClick={addNewRound}>
          + Add New Round
        </button>
        <button className={styles.saveBtn} onClick={handleSubmitAll}>
          Submit All
        </button>
      </div>
    </div>
  );
}
