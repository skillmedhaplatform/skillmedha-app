"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import formStyles from "../styles/formPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { getOneTests, updateTestValues } from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";

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
      setAdditionalItems(formRequirements.slice(3));
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
            ...SingleTest.startPage,
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
    setDefaultItems({ ...defaultItems, newDefaultItems });
  };

  const handleAdditionalInputChange = (index, event) => {
    const newAdditionalItems = additionalItems.map((item, i) =>
      i === index ? { ...item, label: event.target.value } : item
    );
    setAdditionalItems(newAdditionalItems);
  };

  const handleAddMoreClick = (e) => {
    e.preventDefault();
    setAdditionalItems([
      ...additionalItems,
      { label: "New Field", value: "", requires: false },
    ]);
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

  const renderDefaultItems = () => {
    return defaultItems.map((item, index) => (
      <div key={index} className={formStyles.itemContainer}>
        <input
          type="text"
          value={item.label}
          onChange={(e) => handleDefaultInputChange(index, e)}
          placeholder={item.label}
          readOnly
          className={formStyles.defaultinputs}
        />
        <div className={formStyles.manCon} style={{ display: "none" }}>
          <label>Mandatory: </label>
          <input type="checkbox" checked={true} readOnly />
        </div>
      </div>
    ));
  };

  const renderAdditionalItems = () =>
    additionalItems.map((item, index) => (
      <div key={index} className={formStyles.itemContainer}>
        <input
          type="text"
          value={
            item.label ||
            SingleTest?.startPage?.formRequirements[index + 3]?.label
          }
          onChange={(e) => handleAdditionalInputChange(index, e)}
          placeholder={item.label}
          className={formStyles.Addinputs}
        />
        <div className={formStyles.manCon}>
          <input
            type="checkbox"
            checked={
              item.requires ||
              SingleTest?.startPage?.formRequirements[index + 3]?.requires
            }
            onChange={() => handleMandatoryToggle(index)}
          />
          <label htmlFor={`checkbox-${index}`}>Mandatory</label>
          <FaTrash
            size={16}
            color="red"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteItem(index, "additional")}
          />
        </div>
      </div>
    ));

  return (
    <div className={formStyles.addMoreContainer}>
      {renderDefaultItems()}
      {renderAdditionalItems()}
      <button onClick={handleAddMoreClick}>Add More</button>
    </div>
  );
};

export default AddMoreComponent;
