"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import commercialStyles from "./styles/commercial.module.scss";
import { useSelector } from "react-redux";
import { Select } from "antd";
import { updateTest, updateTestValues } from "@/redux/slices/testportal_admin/slice/test";

export default function CommercialPage() {
  const [currency, setCurrency] = useState("₹");
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState("free");
  const SingleTest = useSelector((state) => state.tests.test);
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];

  useEffect(() => {
    if (
      SingleTest &&
      SingleTest.access.pricing &&
      SingleTest.access.pricing.paid
    ) {
      setSelectedOption("paid");
    } else {
      setSelectedOption("free");
    }
    if (SingleTest?.access?.pricing?.currency) {
      setCurrency(SingleTest?.access?.pricing?.currency);
    }
    if (SingleTest?.access?.pricing?.paid) {
      setPrice(SingleTest?.access?.pricing);
    }
  }, [SingleTest._id]);

  const updateVals = {
    access: {
      type: "commercial",
      pricing: SingleTest.pricing,
    },
  };

  const handleSelectPricing = (val) => {
    setSelectedOption(val);
    dispatch(
      updateTestValues({
        pricing: {
          ...SingleTest.pricing,
          paid: val === "paid",
        },
      })
    );
  };
  const [price, setPrice] = useState({
    slashedPrice: null,
    originalPrice: null,
    currency: null,
  });
  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value);
    setPrice({ ...price, [type]: e.target.value, currency });
  };
  return (
    <div className={commercialStyles.container}>
      <div className={commercialStyles.price_container}>
        <div className={commercialStyles.respTitle}>Price</div>
        <div className={commercialStyles.radioContainer}>
          <input
            type="radio"
            id="free"
            name="price"
            value="free"
            checked={selectedOption === "free"}
            className={commercialStyles.radioInput}
            onChange={() => handleSelectPricing("free")}
          />
          <label htmlFor="free" className={commercialStyles.radioLabel}>
            Free
          </label>
        </div>
        <div className={commercialStyles.radioContainer}>
          <input
            type="radio"
            id="paid"
            name="price"
            value="paid"
            checked={selectedOption === "paid"}
            className={commercialStyles.radioInput}
            onChange={() => handleSelectPricing("paid")}
          />
          <label htmlFor="paid" className={commercialStyles.radioLabel}>
            Paid
          </label>
        </div>
        {selectedOption === "paid" && (
          <div className={commercialStyles.inputContainer}>
            <div
              htmlFor="slashed-price"
              className={commercialStyles.inputLabel}
            >
              Slashed Price:
            </div>
            <div className={commercialStyles.flexCon}>
              <Select
                value={currency}
                onChange={(value) => setCurrency(value)}
                className={commercialStyles.currencySelect}
              >
                <option value="INR">₹</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
                <option value="GBP">£</option>
              </Select>
              <input
                type="number"
                id="slashed-price"
                placeholder="10,000"
                value={price?.slashedPrice || ""}
                onChange={(e) => handlePriceChange(e, "slashedPrice")}
                className={commercialStyles.inputField}
              />
            </div>
            <div
              htmlFor="original-price"
              className={commercialStyles.inputLabel}
            >
              Original Price:
            </div>
            <div className={commercialStyles.flexCon}>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e)}
                className={commercialStyles.currencySelect}
              >
                <option value="INR">₹</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
                <option value="GBP">£</option>
              </Select>
              <input
                type="number"
                id="original-price"
                placeholder="8,000"
                value={price?.originalPrice || ""}
                onChange={(e) => handlePriceChange(e, "originalPrice")}
                className={commercialStyles.inputField}
              />
            </div>
          </div>
        )}
        <button
          type="submit"
          className={commercialStyles.save_btn}
          onClick={() => {
            const updates = {
              access: {
                type: "commercial",
                pricing: {
                  paid: selectedOption == "paid" ? true : false,
                  
                },
              },
            }
            if(selectedOption == "paid") updates.pricing = {...updates.pricing, ...price}
            dispatch(
              updateTest({
                id: selectedId,
                updates,
              })
            );
          }}
        >
          {SingleTest?._id ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
