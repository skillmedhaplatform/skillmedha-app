"use client";
import { FaInfoCircle, FaLock } from "react-icons/fa";
import { message as m } from "antd";
import React, { useState, useEffect } from "react";
import Privatestyles from "./styles/private.module.scss";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import test, { SendEmailMail, updateTest } from "@/redux/slices/testportal_admin/slice/test";
import { generateEmailTemplate } from "./emailtemplate/privateaccess";

function PrivateComponent() {
  const updatedata = useSelector((state) => state.tests.value);
  const SingleTest = useSelector((state) => state.tests.test);
  const dispatch = useDispatch();
  const params = useParams();
  const nav = useRouter();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const [message, setMessage] = useState({
    title: "Test access will be possible only with an individual access code",
    description:
      'This access type offers the most control over your respondents.  you can distribute access codes yourself or email them to addresses from the table below.To do so,set "Send code" toggle on.Codes will be sent after test activation. ',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [respondents, setRespondents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [numberOfRespondents, setNumberOfRespondents] = useState("");
  const [selectAllSendCode, setSelectAllSendCode] = useState(false);
  const [selectedSet, setSelectedSet] = useState("");
  const [selectedRespondentIndexes, setSelectedRespondentIndexes] = useState(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailData, setemailData] = useState("");
  const [attemptsPerRespondent, setattemptsPerRespondent] = useState(1);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCustomizeClick = () => {
    setNewValue(message.description);
    setIsEditing(true);
  };
  const handleSaveClick = () => {
    setMessage({ ...message, description: newValue });
    setIsEditing(false);
  };

  const generateAccessCode = () => {
    const id = uuidv4().replace(/-/g, "").toUpperCase();
    return id.substring(0, 4) + id.substring(9, 13) + id.substring(19, 23);
  };

  useEffect(() => {
    if (SingleTest?.access?.respondents) {
      setRespondents(SingleTest?.access?.respondents);
    }
    if (SingleTest?.access?.mailMessage) {
      setMessage(SingleTest?.access?.mailMessage);
    }
    if (SingleTest?.access?.type === "private") {
      setattemptsPerRespondent(SingleTest?.access?.attemptsPerRespondent);
    }
  }, [SingleTest]);

  const handleAddRespondents = () => {
    const newEntries = Array.from({ length: numberOfRespondents }, () => ({
      email: "",
      accessCode: generateAccessCode(),
      selected: false,
      sendCode: false,
      setName: "",
      deleted: false,
    }));
    setRespondents([...respondents, ...newEntries]);
  };

  const handleSendCode = async (index) => {
    const respondent = respondents[index];

    if (!respondent.email) {
      m.error("Please enter an email.");
      return;
    }
    const hide = m.loading("code sending");
    if (respondent && respondent.email) {
      const emailData = {
        from: "sender@server.com",
        to: respondent.email,
        subject: `Your Access Code for ${SingleTest.title} Test`,
        text: `Your access code is: ${respondent.accessCode}`,
        html: generateEmailTemplate({
          testName: SingleTest.title,
          userName: respondent.email,
          accessCode: respondent.accessCode,
          // timeLimit: '15 minutes',
          companyDetails: "Teman EdTech pvt ltd",
        }),
      };
      hide();
      m.success("Access code sent");
      setemailData(emailData);
      dispatch(SendEmailMail({ updates: emailData }));
    }
  };

  const handleDeleteSelected = () => {
    const updatedRespondents = respondents.filter(
      (respondent) => !respondent.selected
    );
    setRespondents(updatedRespondents);
    setSelectedRespondentIndexes([]);
    setSelectAll(false);
  };

  const handleSendSelectedCodes = () => {
    respondents.forEach((respondent, index) => {
      if (respondent.selected && respondent.email) {
        handleSendCode(index);
      }
    });
    const updatedRespondents = respondents.map((respondent) => ({
      ...respondent,
      sendCode: false,
      selected: false,
    }));
    setSelectAll(false);
    setRespondents(updatedRespondents);
    setSelectedRespondentIndexes([]);
    setSelectAllSendCode(false);
  };

  const handleCheckboxChange = (index) => {
    const updatedRespondents = [...respondents];
    updatedRespondents[index].selected = !updatedRespondents[index].selected;
    setRespondents(updatedRespondents);
    const selectedIndexes = updatedRespondents.reduce((acc, curr, idx) => {
      if (curr.selected) acc.push(idx);
      return acc;
    }, []);
    setSelectedRespondentIndexes(selectedIndexes);
  };

  const handleEmailChange = (index, email) => {
    const updatedRespondents = [...respondents];
    updatedRespondents[index] = {
      ...updatedRespondents[index],
      email: email,
    };
    setRespondents(updatedRespondents);
  };

  const handleSendCodeChange = (index) => {
    const updatedRespondents = [...respondents];
    updatedRespondents[index].sendCode = !updatedRespondents[index].sendCode;
    setRespondents(updatedRespondents);
  };

  const handleSelectAll = () => {
    const updatedSelectAll = !selectAll;
    setRespondents((prev) => {
      return prev.map((respondent) =>
        respondent.deleted
          ? respondent
          : { ...respondent, selected: updatedSelectAll }
      );
    });

    if (updatedSelectAll) {
      setSelectedRespondentIndexes(
        respondents
          .map((res, idx) => (res.deleted ? null : idx))
          .filter((idx) => idx !== null)
      );
    } else {
      setSelectedRespondentIndexes([]);
    }
    setSelectAll(updatedSelectAll);
  };

  const handleSelectAllSendCode = () => {
    respondents.forEach((e, i) => handleSendCode(i));
  };

  const handleSetNameForSelected = () => {
    if (selectedSet.trim() === "") {
      m.error("Please enter a name for the set.");
      return;
    }

    const updatedRespondents = [...respondents];
    selectedRespondentIndexes.forEach((index) => {
      updatedRespondents[index].setName = selectedSet;
      updatedRespondents[index].selected = false;
    });
    setRespondents(updatedRespondents);
    setSelectedSet("");
    setSelectedRespondentIndexes([]);
    setSelectAll(false);
    m.success("Set name saved for selected respondents.");
    setIsModalOpen(false);
  };

  const updateVals = {
    access: {
      type: "private",
      mailOptions: emailData,
      mailMessage: message,
      attemptsPerRespondent,
      respondents: respondents.map((respondent) => ({
        email: respondent.email,
        accessCode: respondent.accessCode,
        sendCode: respondent.sendCode,
      })),
    },
    pricing: SingleTest.pricing,
    honestRespondent: SingleTest.honestRespondent,
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Print Respondents</title></head><body>"
    );
    printWindow.document.write(
      document.getElementById("respondents-table").outerHTML
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className={Privatestyles.container}>
      <div className={Privatestyles.customize_message_cont}>
        <div className={Privatestyles.message_cont}>
          <FaLock size={40} color="#555" />
          {isEditing ? (
            <div className={Privatestyles.setmessage}>
              <input
                type="text"
                value={message.title}
                onChange={(e) =>
                  setMessage({ ...message, title: e.target.value })
                }
              />
              <input
                type="text"
                value={message.description}
                onChange={(e) =>
                  setMessage({ ...message, description: e.target.value })
                }
              />

              <button onClick={handleSaveClick}>Save</button>
            </div>
          ) : (
            <div className={Privatestyles.message_text}>
              <strong>{message.title}</strong>
              <p>{message.description}</p>
            </div>
          )}
        </div>
        {!isEditing && (
          <button onClick={handleCustomizeClick}>Customize a message</button>
        )}
      </div>

      <div className={Privatestyles.respondents_cont}>
        <h2>Respondents</h2>
        <div className={Privatestyles.add_respondents}>
          Add respondents
          <div>
            <input
              type="number"
              value={numberOfRespondents}
              placeholder="Number of respondents to add"
              onChange={(e) => setNumberOfRespondents(parseInt(e.target.value))}
            />
            <button onClick={handleAddRespondents}>Add</button>
          </div>
        </div>
        {/* <div className={Privatestyles.bottom_message_cont}>
          <img
            src="https://res.cloudinary.com/cliqtick/image/upload/v1719553520/sysnper/eb947b0b9b92b7859c6014965437b2e6_t9wf0k.png"
            alt="info icon"
            width="20px"
          />
          <div>
            Due to the trial limitations,your tests can be taken{" "}
            <strong>15</strong> respondents more.
          </div>
        </div> */}

        <div id="respondents-table" className={Privatestyles.table_container}>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => {
                      handleSelectAll();
                    }}
                  />
                </th>
                <th>#</th>
                <th>Access code</th>
                {/* <th>Set Name</th> */}
                <th>Email:</th>
                <th>Send access code</th>
              </tr>
            </thead>
            <tbody>
              {respondents.map((respondent, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={respondent.selected || false}
                      onChange={() => handleCheckboxChange(index)}
                      disabled={respondent.deleted}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>{respondent.accessCode}</td>
                  <td>
                    <input
                      className={Privatestyles.email_input}
                      type="email"
                      value={respondent.email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      disabled={false}
                    />
                  </td>
                  <td>
                    <button
                      checked={respondent.sendCode || false}
                      disabled={!respondent.email}
                      className={Privatestyles.send_code_btn}
                      onClick={() => handleSendCode(index)}
                    >
                      Send Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={Privatestyles.print_delete_btn}>
          <button
            onClick={handlePrint}
            className={
              selectedRespondentIndexes.length > 0
                ? Privatestyles.highlightedButton
                : ""
            }
          >
            Print
          </button>
          <button
            onClick={handleDeleteSelected}
            className={
              selectedRespondentIndexes.length > 0
                ? Privatestyles.highlightedButton
                : ""
            }
          >
            Delete selected
          </button>
          <button
            onClick={handleSendSelectedCodes}
            className={
              selectedRespondentIndexes.length > 0
                ? Privatestyles.highlightedButton
                : ""
            }
          >
            Send access codes
          </button>
        </div>
        <div className={Privatestyles.attempts_respondent}>
          Attempts per respondent
          <input
            value={attemptsPerRespondent}
            onChange={(e) => {
              const value = parseInt(e.target.value, 6);
              if (value >= 1 || e.target.value === "") {
                setattemptsPerRespondent(value);
              }
            }}
            min="1"
            type="number"
          />
        </div>
      </div>

      <button
        type="submit"
        className={Privatestyles.save_btn}
        onClick={() => {
          const updates = { ...SingleTest };
          delete updates._id;

          dispatch(updateTest({ id: selectedId, updates: updateVals }));
        }}
      >
        {SingleTest?._id ? "Update" : "Save"}
      </button>
    </div>
  );
}

export default PrivateComponent;
