'use client';
import React from "react";
import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const SkillDetails = ({ skills, updateSkill, addSkill, removeSkill }) => {

  const handleAdd = () => addSkill();

  const handleRemove = (index) => removeSkill(index);

  return (
    <div className="border border-solid border-[#ccc] flex flex-col justify-center items-center p-4 bg-white">
      <div className="my-3 text-2xl font-bold">Skills</div>
      <div className="flex flex-col gap-3.5 w-[98%]">
        {skills.map((item, index) => (
          <div className="flex border border-solid border-[#ccc] pr-4 rounded-[0.3rem] w-full justify-between items-center" key={index}>
            <div>
              <input
                className="w-full text-[0.9rem] p-2 m-2 outline-none border-none"
                placeholder="Enter a Skill"
                value={item}
                onChange={(e) => updateSkill(index, e.target.value)}
              />
            </div>
            <div>
              <DeleteOutlined
                className="text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
              />
            </div>
          </div>
        ))}

        <Button className="text-[#4096ff] border-[#4096ff]" onClick={handleAdd}>
          Add More
        </Button>
      </div>
    </div>
  );
};

export default SkillDetails;
