"use client";
import React, { useEffect, useState } from "react";
import pricingStyles from "./style/page.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { updateTest } from "@/redux/slices/testportal_admin/slice/test";
import { DollarOutlined } from "@ant-design/icons";
import { message } from "antd";

const PricingPage = () => {
  const dispatch = useDispatch();
  const SingleTest = useSelector((state) => state.tests.test);
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState("free");
  const [slashedPrice, setSlashedPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);

  useEffect(() => {
    if (SingleTest?.pricing) {
      setSelectedOption(SingleTest.pricing.type || "free");
      setSlashedPrice(SingleTest.pricing.slashedPrice ?? "");
      setOriginalPrice(SingleTest.pricing.originalPrice ?? 0);
    }
  }, [SingleTest]);

  const updateTestsPricing = () => {
    if (SingleTest?._id) {
      const updatingBody = {
        pricing: {
          type: selectedOption,
          slashedPrice: slashedPrice,
          originalPrice: originalPrice,
        },
      };
      dispatch(updateTest({ id: selectedId, updates: updatingBody })).then((res) => {
        if (res?.payload) {
          message.success("Pricing updated successfully");
        }
      });
    }
  };

  return (
    <div className={pricingStyles.container}>
      {/* Card: Pricing Settings */}
      <div className={pricingStyles.cardSection}>
        <div className={pricingStyles.sectionHeader}>
          <div className={pricingStyles.headerLeft}>
            <DollarOutlined className={pricingStyles.sectionIcon} />
            <h3>Pricing Settings</h3>
          </div>
        </div>
        <p className={pricingStyles.description}>
          Set whether this test is free or paid for candidates purchasing access.
        </p>

        <div className={pricingStyles.optionsGroup}>
          <div
            className={`${pricingStyles.optionCard} ${selectedOption === "free" ? pricingStyles.activeOption : ""}`}
            onClick={() => setSelectedOption("free")}
          >
            <div className={pricingStyles.radioDot} />
            <div className={pricingStyles.optionText}>
              <span>Free Test</span>
              <p>Candidates can start this test immediately without any payment.</p>
            </div>
          </div>

          <div
            className={`${pricingStyles.optionCard} ${selectedOption === "paid" ? pricingStyles.activeOption : ""}`}
            onClick={() => setSelectedOption("paid")}
          >
            <div className={pricingStyles.radioDot} />
            <div className={pricingStyles.optionText}>
              <span>Paid Test</span>
              <p>Candidates must purchase this test at the specified prices below.</p>
            </div>
          </div>
        </div>

        {selectedOption === "paid" && (
          <div className={pricingStyles.inputsGrid}>
            <div className={pricingStyles.inputGroup}>
              <label htmlFor="slashed-price">Slashed Price</label>
              <div className={pricingStyles.inputWrapper}>
                <span className={pricingStyles.currency}>₹</span>
                <input
                  type="number"
                  id="slashed-price"
                  placeholder="e.g. 499"
                  value={slashedPrice}
                  onChange={(e) => setSlashedPrice(e.target.value)}
                />
              </div>
            </div>

            <div className={pricingStyles.inputGroup}>
              <label htmlFor="original-price">Original Price</label>
              <div className={pricingStyles.inputWrapper}>
                <span className={pricingStyles.currency}>₹</span>
                <input
                  type="number"
                  id="original-price"
                  placeholder="e.g. 999"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={pricingStyles.formActions}>
        <button className={pricingStyles.saveBtn} onClick={updateTestsPricing}>
          Update
        </button>
        <button 
          className={pricingStyles.discardBtn} 
          onClick={() => router.push("/testportal_admin/myTests")}
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
