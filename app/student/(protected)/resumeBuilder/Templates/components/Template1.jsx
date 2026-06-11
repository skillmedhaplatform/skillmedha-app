'use client'
import React from 'react'
// Ant Design Icons
import { GithubOutlined, GlobalOutlined, LinkedinFilled, MailOutlined, PhoneFilled } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const Template1 = () => {
  const Details = useSelector((state) => state.student.student?.data);

  // Helper to get a link from 'links' array (by platform)
  const getLink = (platform) => (
    Details?.links?.find(link => link.platform.toLowerCase() === platform.toLowerCase())?.value || '#'
  );

  return (
    <div className="max-w-[50rem] h-full m-0 overflow-y-scroll p-12 bg-white border border-solid border-[#ccc] font-['Source_Sans_Pro',sans-serif] text-[#333] [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-thumb]:rounded-[20px]">
      <header className="grid grid-cols-[1fr_10rem] mb-3.5">
        <div className="flex flex-col justify-center items-start text-start [&_p]:text-[14px] [&_p]:my-2">
          <div className="mb-3.5 text-start">
            <h1 className="text-start text-[2.2rem] font-bold m-0">{Details?.firstName} {Details?.middleName} {Details?.lastName}</h1>
          </div>
          <div className="flex flex-wrap mt-2 mb-3.5 [&_a]:text-[13px] [&_a]:mr-4 [&_a]:mb-2 [&_a]:text-[#333] [&_a]:no-underline [&_a]:flex [&_a]:items-center [&_a]:gap-1.5 [&_a:hover]:underline">
            <a href={`mailto:${Details?.email}`}> <MailOutlined /> {Details?.email} </a>
            <a href={getLink('linkedin')} target="_blank" rel="noopener noreferrer">
              <LinkedinFilled /> Linkedin
            </a>
            <a href={getLink('github')} target="_blank" rel="noopener noreferrer">
              <GithubOutlined /> Github
            </a>
            <a href={`tel:${Details?.phone}`}> <PhoneFilled /> {Details?.phone} </a>
            <a href={getLink('portfolio')} target="_blank" rel="noopener noreferrer">
              <GlobalOutlined /> {Details?.userName}
            </a>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <img
            width="70%"
            src={
              Details?.profile
                ? Details.profile
                : 'https://images.squarespace-cdn.com/content/v1/62f05096e769c660f906b4e3/771377d2-dee9-44a4-9443-50b42a718eb5/240409aLinkedInSample.jpg'
            }
            alt="profile"
          />
        </div>
      </header>

      <section className="mb-3.5 [&_h2]:text-[1.1rem] [&_h2]:border-b [&_h2]:border-solid [&_h2]:border-[#ccc] [&_h2]:pb-1 [&_h2]:mb-3.5 [&_h2]:text-[#222] [&_p]:text-[14px]">
        <h2>Professional Summary</h2>
        <div>
          <p>{Details?.professionalSummary || 'No summary provided.'}</p>
        </div>
      </section>

      <section className="mb-3.5 [&_h2]:text-[1.1rem] [&_h2]:border-b [&_h2]:border-solid [&_h2]:border-[#ccc] [&_h2]:pb-1 [&_h2]:mb-3.5 [&_h2]:text-[#222] [&_p]:text-[14px]">
        <h2>Experience</h2>
        {Array.isArray(Details?.experiences) && Details.experiences.length > 0 ? (
          Details.experiences.map((exp, i) => (
            <div className="flex flex-col gap-1 mb-3.5 justify-center" key={i}>
              <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[15px]">
                <div>
                  <span>{exp.role}, {exp.company}</span>
                </div>
                <div className="min-w-[10rem] italic text-[14px] font-medium">
                  <p>{exp.start} – {exp.end}</p>
                </div>
              </div>
              <div className="flex leading-loose tracking-wider [&_p]:m-[0.2rem_0_0] [&_p]:text-[14px]">
                <p>{exp.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No experience listed.</p>
        )}
      </section>

      <section className="mb-3.5 [&_h2]:text-[1.1rem] [&_h2]:border-b [&_h2]:border-solid [&_h2]:border-[#ccc] [&_h2]:pb-1 [&_h2]:mb-3.5 [&_h2]:text-[#222] [&_p]:text-[14px]">
        <h2>Education</h2>
        {Array.isArray(Details?.educationDetails) && Details.educationDetails.length > 0 ? (
          Details.educationDetails.map((edu, i) => (
            <div className="flex flex-col gap-1 mb-3.5 justify-center" key={i}>
              <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[15px]">
                <div>
                  <span>{edu.type} - {edu.school}</span>
                </div>
                <div className="min-w-[10rem] italic text-[14px] font-medium">
                  <p>{edu.startDate} – {edu.endDate}</p>
                </div>
              </div>
              <div className="flex leading-loose tracking-wider [&_p]:m-[0.2rem_0_0] [&_p]:text-[14px]">
                <p>{edu.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No education details listed.</p>
        )}
      </section>

      <section className="mb-3.5 [&_h2]:text-[1.1rem] [&_h2]:border-b [&_h2]:border-solid [&_h2]:border-[#ccc] [&_h2]:pb-1 [&_h2]:mb-3.5 [&_h2]:text-[#222] [&_p]:text-[14px]">
        <h2>Skills</h2>
        {Array.isArray(Details?.technical) && Details.technical.length > 0 ? (
          <ul className="flex flex-wrap gap-16 box-border [&_li]:text-[14px] [&_li]:list-square [&_li]:ml-4">
            {Details.technical.map((tech, i) => <li key={i}>{tech}</li>)}
          </ul>
        ) : (
          <p>No skills listed.</p>
        )}
      </section>

      <section className="mb-3.5 [&_h2]:text-[1.1rem] [&_h2]:border-b [&_h2]:border-solid [&_h2]:border-[#ccc] [&_h2]:pb-1 [&_h2]:mb-3.5 [&_h2]:text-[#222] [&_p]:text-[14px]">
        <h2>Languages</h2>
        <p>{Array.isArray(Details?.languages) && Details.languages.length > 0 ? Details.languages.join(', ') : 'No languages listed.'}</p>
      </section>
    </div>
  );
};

export default Template1;
