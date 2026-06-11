"use client"
import React, { useEffect, useRef,useState } from 'react'
import TrainingStyles from "./styles/training.module.scss"
import { message } from 'antd';

const TrainingComponent = () => {
  const copyRef = useRef(null);

  const copyToClipboard = () => {
    if (copyRef.current) {
      navigator.clipboard.writeText(copyRef.current.innerText);
      message.success("copied link")
    }
  };

  const link = `https://tests.synsper.com/test.html?t=` + "K1D235T3H"

  return (
    <div className={TrainingStyles.container}>
       <div className={TrainingStyles.message_cont}>
       <img src='https://res.cloudinary.com/cliqtick/image/upload/v1719553520/sysnper/eb947b0b9b92b7859c6014965437b2e6_t9wf0k.png' alt='info icon' width='20px' />
       <div>
         <strong>This access type is for practice only and  is not suitable for assessments</strong>
         <p>Number of times  respondent can take this test is unlimited.Every respondent can see answers to each question instantly.</p>
       </div>
       </div>
       <div className={TrainingStyles.copyComp}>
          <div ref={copyRef}>
            <span>{link}</span>
          </div>
            <button onClick={copyToClipboard}><img src="https://res.cloudinary.com/cliqtick/image/upload/v1719396940/dmfi0c5ezgtticuziytz.png" alt="copy link" />CopyLink</button>
        </div>
        <button className={TrainingStyles.save_btn}>Save</button>

    </div>
  )
}

export default TrainingComponent