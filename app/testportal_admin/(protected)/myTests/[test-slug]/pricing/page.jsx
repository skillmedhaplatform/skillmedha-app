"use client";
import React, { useEffect, useState } from "react";

import pricingStyles from "./style/page.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { updatingVals } from "@/redux/slices/testportal_admin/slice/stepform";
import BTag from "../../utils/button";
import { useParams, usePathname } from "next/navigation";
import { getOneTests, updateTest } from "@/redux/slices/testportal_admin/slice/test";
import { getOneTest } from "@/modules/testportal_admin/graphql_quries/testSeries";

const PricingPage = () => {
  const dispatch = useDispatch();
  const currPath = usePathname();
  const updatedata = useSelector((state) => state.tests.value);
  const SingleTest = useSelector((state) => state.tests.test);
  const values = useSelector((state) => state.steps.value);

  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];

  const priceVals = useSelector((state) => state.steps.updatingVals);

  const [selectedOption, setSelectedOption] = useState("free");
  const [slashedPrice, setSlashedPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);

  const updateTestsPricing = (val) => {
    if (SingleTest?._id) {
      const updatingBody = {
        pricing: {
          type: selectedOption,
          slashedPrice: slashedPrice,
          originalPrice: originalPrice,
        },
      };
      dispatch(updateTest({ id: selectedId, updates: updatingBody }));
    }
  };

  return (
    <div className={pricingStyles.container}>
        <div className={pricingStyles.respTitle}>Price</div>
        <div
          className={pricingStyles.radioContainer}
          onClick={() => setSelectedOption("free")}
        >
          <input
            type="radio"
            id="free"
            name="price"
            value="free"
            checked={selectedOption === "free"}
            className={pricingStyles.radioInput}
          />
          <label htmlFor="free" className={pricingStyles.radioLabel}>
            Free
          </label>
        </div>
        <div
          className={pricingStyles.radioContainer}
          onClick={() => setSelectedOption("paid")}
        >
          <input
            type="radio"
            id="paid"
            name="price"
            value="paid"
            checked={selectedOption === "paid"}
            className={pricingStyles.radioInput}
          />
          <label htmlFor="paid" className={pricingStyles.radioLabel}>
            Paid
          </label>
        </div>
        {selectedOption === "paid" && (
          <div className={pricingStyles.inputContainer}>
            <div htmlFor="slashed-price" className={pricingStyles.inputLabel}>
              Slashed Price:
            </div>

            <div className={pricingStyles.flexCon}>
              ₹
              <input
                type="number"
                id="slashed-price"
                value={slashedPrice}
                onChange={(e) => setSlashedPrice(e.target.value)}
                className={pricingStyles.inputField}
              />
            </div>

            <div htmlFor="original-price" className={pricingStyles.inputLabel}>
              Original Price:
            </div>

            <div className={pricingStyles.flexCon}>
              ₹
              <input
                type="number"
                id="original-price"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className={pricingStyles.inputField}
              />
            </div>
          </div>
        )}

        <div onClick={updateTestsPricing} className={pricingStyles.save}>
          <BTag>{SingleTest?._id ? "Update Test" : "Save & Next"}</BTag>
        </div>
      </div>
  );
};

export default PricingPage;
