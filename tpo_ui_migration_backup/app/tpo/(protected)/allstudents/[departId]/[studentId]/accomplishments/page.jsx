'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import educationStyles from './intern.module.scss'
import right from '@/public/tpo/markdone.svg'
import wrong from '@/public/tpo/marknot.svg'
import btn from '@/public/tpo/btn.svg'
import { useDispatch, useSelector } from 'react-redux'
import { getAllDetails } from '@/redux/slices/tpo/getAllDetailsSlice'
import { updateStudent } from '@/redux/slices/tpo/getAllStudentsSlice'
import {
  setResubmissionFlag,
  setApprovalFlag,
} from '@/redux/slices/tpo/resubmissionSlice'
import PageHeader from "@/modules/tpo/components/PageHeader";

const Accomplishments = () => {
  const dispatch = useDispatch()
  const params = useParams()
  const [localAccomplishments, setLocalAccomplishments] = useState([])

  // 1) Fetch student details
  useEffect(() => {
    if (params.studentId) {
      dispatch(getAllDetails(params.studentId))
    }
  }, [params.studentId, dispatch])

  // 2) Pull student + seed local state
  const selectedStudent = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value
  )
  const studentId = selectedStudent?.data?._id
  useEffect(() => {
    if (selectedStudent?.data?.accomplishments) {
      setLocalAccomplishments(selectedStudent.data.accomplishments)
    }
  }, [selectedStudent?.data?.accomplishments])

  // 3) Helpers
  const mapSectionKey = (txt = '') =>
    txt
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

  // immutably flip one item’s verificationType by matching the `accomplishment` text
  const produceUpdatedAccomplishments = (target, status) =>
    localAccomplishments.map((item) =>
      item.accomplishment === target
        ? { ...item, verificationType: status }
        : item
    )

  // 4) Handlers
  const handleApprove = (accomplishment) => {
    const updated = produceUpdatedAccomplishments(accomplishment, 'approved')
    setLocalAccomplishments(updated)
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, accomplishments: updated },
      })
      )
      .then(() => {        
      dispatch(getAllDetails(studentId))
      const section = mapSectionKey(accomplishment)
      dispatch(setApprovalFlag({ type: 'accomplishMents', section, value: true }))
    })
  }

  const handleResubmit = (accomplishment) => {
    const updated = produceUpdatedAccomplishments(accomplishment, 'resubmission')
    setLocalAccomplishments(updated)

    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, accomplishments: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId))
      const section = mapSectionKey(accomplishment)
      dispatch(
        setResubmissionFlag({ type: 'accomplishMents', section, value: true })
      )
    })
  }

  // 5) Render
  return (
    <>
      <PageHeader title="Accomplishments" />

      <div className={educationStyles.container}>
        {localAccomplishments.length > 0 && (
          <div className={educationStyles.btn}>
            <Image src={btn} />
          </div>
        )}


        {localAccomplishments.length > 0 ? (
          localAccomplishments.map((item, idx) => {
            const sectionKey = mapSectionKey(item.accomplishment)
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '1.7rem',
                  marginTop: '1rem',
                  boxShadow: '1px 4px 8px rgba(0,0,0,0.1)',
                }}
              >
                  <div className={educationStyles.about}>
                  <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                  <p className={educationStyles.head}>
                    {item.accomplishment || 'N/A'}
                  </p>
                  <p
                    style={{
                      color:
                        item?.verificationType === "approved"
                          ? "green"
                          : item?.verificationType === "resubmission"
                          ? "orange"
                          : "gray",
                      fontWeight: "bold",
                    }}
                  >
                    {item?.verificationType === "approved"
                      ? "Verified"
                      : item?.verificationType === "resubmission"
                      ? "Asked for Resubmission"
                      : "Pending"}
                  </p>
                  </div>
                  <div className={educationStyles.mark}>
                    <Image
                      src={right}
                      className={educationStyles.ticks}

                      onClick={() => handleApprove(item.accomplishment)}
                    />
                    <Image
                      src={wrong}
                      className={educationStyles.ticks}

                      onClick={() => handleResubmit(item.accomplishment)}
                    />
                  </div>
                </div>

                <p
                  className={educationStyles.head}
                  style={{ marginBottom: '0.5rem' }}
                >
                  {item.company || 'N/A'}{' '}
                  <strong>|</strong> {item.start || 'N/A'} to{' '}
                  {item.end || 'N/A'} <strong>|</strong> Location:{' '}
                  {item.city || 'N/A'}
                </p>
                <hr />
                <div className={educationStyles.aboutsidedata}>
                  <p>{item.description || 'N/A'}</p>
                </div>
                <Link href={item.fileUrl || '#'}>
                  <p
                    style={{ textAlign: 'center', fontSize: '14px' }}
                  >
                    {item.fileUrl ? 'View Documents' : 'No Documents Available'}
                  </p>
                </Link>
              </div>
            )
          })
        ) : (
          /* fallback card */
          <div
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '1.7rem',
              marginTop: '1rem',
              boxShadow: '1px 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div className={educationStyles.about}>
              <p className={educationStyles.head} style={{color:'red', fontSize:'24px'}}>No Data Available!</p>
              {/* <div className={educationStyles.mark}>
                <Image
                  src={right}
                  className={educationStyles.ticks}
                  alt="approved"
                  onClick={() => handleApprove('nodata')}
                />
                <Image
                  src={wrong}
                  className={educationStyles.ticks}
                  alt="rejected"
                  onClick={() => handleResubmit('nodata')}
                />
              </div> */}
            </div>
            {/* <Link href="#">
              <p style={{ textAlign: 'center', fontSize: '14px' }}>
                No Documents Available
              </p>
            </Link> */}
          </div>
        )}
      </div>
    </>

  )
}

export default Accomplishments