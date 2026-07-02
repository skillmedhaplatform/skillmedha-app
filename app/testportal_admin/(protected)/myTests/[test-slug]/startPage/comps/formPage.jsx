"use client";
import React, { useState, useEffect, useRef } from "react";
import formStyles from "../styles/formPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { updateTestValues } from "@/redux/slices/testportal_admin/slice/test";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  FileTextOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";

const AddMoreComponent = () => {
  const SingleTest = useSelector((state) => state.tests.test);
  const dispatch = useDispatch();
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const updatingValState = useSelector((state) => state.steps.updatingVals);

  const [defaultItems, setDefaultItems] = useState([
    { label: "Full Name", value: "", requires: true },
    { label: "Email", value: "", requires: true },
    { label: "Phone Number", value: "", requires: true },
  ]);

  const [additionalItems, setAdditionalItems] = useState([]);

  const prevDefaultItemsRef = useRef();
  const prevAdditionalItemsRef = useRef();

  useEffect(() => { 
    dispatch(
      updateTestValues({
        formRequirements: [...defaultItems, ...additionalItems],
      })
    );
  }, []);

  useEffect(() => {
    if (SingleTest?.startPage?.formRequirements) {
      const { formRequirements } = SingleTest.startPage;
      // The first 3 are default items (Full Name, Email, Phone Number)
      // but let's be safe and check if there are at least 3 items
      if (formRequirements.length >= 3) {
        setDefaultItems(formRequirements.slice(0, 3));
        setAdditionalItems(formRequirements.slice(3));
      } else {
        setDefaultItems(formRequirements);
      }
    }
  }, [SingleTest]);

  useEffect(() => {
    const prevDefaultItems = prevDefaultItemsRef.current;
    const prevAdditionalItems = prevAdditionalItemsRef.current;

    if (
      JSON.stringify(prevDefaultItems) !== JSON.stringify(defaultItems) ||
      JSON.stringify(prevAdditionalItems) !== JSON.stringify(additionalItems)
    ) {
      dispatch(
        updateTestValues({
          startPage: {
            ...SingleTest?.startPage,
            formRequirements: [...defaultItems, ...additionalItems],
          },
        })
      );
    }

    prevDefaultItemsRef.current = defaultItems;
    prevAdditionalItemsRef.current = additionalItems;
  }, [defaultItems, additionalItems, dispatch, updatingValState]);

  const handleDefaultInputChange = (index, event) => {
    const newDefaultItems = defaultItems.map((item, i) =>
      i === index ? { ...item, label: event.target.value } : item
    );
    setDefaultItems(newDefaultItems);
  };

  const handleAdditionalInputChange = (index, event) => {
    const newAdditionalItems = additionalItems.map((item, i) =>
      i === index ? { ...item, label: event.target.value } : item
    );
    setAdditionalItems(newAdditionalItems);
  };

  const handleDeleteItem = (index, type) => {
    if (type === "default") {
      setDefaultItems(defaultItems.filter((_, i) => i !== index));
    } else {
      setAdditionalItems(additionalItems.filter((_, i) => i !== index));
    }
  };

  const handleMandatoryToggle = (index) => {
    setAdditionalItems(
      additionalItems.map((item, i) =>
        i === index ? { ...item, requires: !item.requires } : item
      )
    );
  };

  const getDefaultIcon = (label) => {
    const norm = label.toLowerCase();
    if (norm.includes("name")) return <UserOutlined />;
    if (norm.includes("email")) return <MailOutlined />;
    if (norm.includes("phone") || norm.includes("tel") || norm.includes("number")) return <PhoneOutlined />;
    return <UserOutlined />;
  };

  const getDefaultMeta = (label) => {
    const norm = label.toLowerCase();
    if (norm.includes("name")) return "Text field · Required";
    if (norm.includes("email")) return "Email field · Required";
    if (norm.includes("phone") || norm.includes("tel") || norm.includes("number")) return "Tel field · Required";
    return "Text field · Required";
  };

  const renderDefaultItems = () => {
    return defaultItems.map((item, index) => (
      <div key={`default-${index}`} className={formStyles.itemContainer}>
        <div className={formStyles.itemLeft}>
          <div className={formStyles.iconWrapper}>
            {getDefaultIcon(item.label)}
          </div>
          <div className={formStyles.infoWrapper}>
            <p className={formStyles.fieldLabel}>{item.label}</p>
            <span className={formStyles.fieldMeta}>{getDefaultMeta(item.label)}</span>
          </div>
        </div>
        <div className={formStyles.itemRight}>
          <button 
            type="button" 
            className={formStyles.trashBtn} 
            onClick={() => handleDeleteItem(index, "default")}
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>
    ));
  };

  const renderAdditionalItems = () =>
    additionalItems.map((item, index) => (
      <div key={`additional-${index}`} className={formStyles.itemContainer}>
        <div className={formStyles.itemLeft}>
          <div className={formStyles.iconWrapper}>
            <FileTextOutlined />
          </div>
          <div className={formStyles.infoWrapper}>
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleAdditionalInputChange(index, e)}
              placeholder="Field Label"
              className={formStyles.fieldLabelInput}
            />
          </div>
        </div>
        <div className={formStyles.itemRight}>
          <div className={formStyles.mandatoryCheckbox}>
            <input
              id={`checkbox-${index}`}
              type="checkbox"
              checked={item.requires}
              onChange={() => handleMandatoryToggle(index)}
            />
            <label htmlFor={`checkbox-${index}`}>Required</label>
          </div>
          <button 
            type="button" 
            className={formStyles.trashBtn} 
            onClick={() => handleDeleteItem(index, "additional")}
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>
    ));

  return (
    <div className={formStyles.addMoreContainer}>
      {renderDefaultItems()}
      {renderAdditionalItems()}
    </div>
  );
};

export default AddMoreComponent;
