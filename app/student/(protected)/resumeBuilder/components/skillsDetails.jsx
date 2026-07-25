"use client";
import React, { useState } from "react";
import { Button, Input, Select, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, HolderOutlined, InfoCircleOutlined, StarOutlined, PlusOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const SkillsDetails = ({ skills, updateSkill, setSkills, onNext }) => {
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editSkillName, setEditSkillName] = useState("");
  const [editSkillLevel, setEditSkillLevel] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const proficiencyOptions = [
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
    { label: "Expert", value: "Expert" }
  ];

  const handleAdd = () => {
    if (newSkillName.trim()) {
      const newSkill = { name: newSkillName.trim(), level: newSkillLevel };
      const cleanedSkills = skills.filter(s => {
        if (typeof s === 'string') return s.trim() !== "";
        return s && s.name && s.name.trim() !== "";
      });
      setSkills([...cleanedSkills, newSkill]);
      setNewSkillName("");
      setNewSkillLevel(null);
      setIsAdding(false);
    }
  };

  const handleRemove = (index) => {
    const updated = [...skills];
    updated.splice(index, 1);
    setSkills(updated.length ? updated : []);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    const skill = skills[index];
    if (typeof skill === 'string') {
      setEditSkillName(skill);
      setEditSkillLevel(null);
    } else {
      setEditSkillName(skill?.name || "");
      setEditSkillLevel(skill?.level || null);
    }
  };

  const saveEdit = (index) => {
    const updated = [...skills];
    updated[index] = { name: editSkillName.trim(), level: editSkillLevel };
    setSkills(updated);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(skills);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSkills(items);
  };

  const validSkills = skills.filter(s => {
    if (typeof s === 'string') return s.trim() !== "";
    return s && s.name && s.name.trim() !== "";
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-2">
      {/* Add Skill Form */}
      {isAdding && (
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <StarOutlined className="text-[#3b82f6] text-[20px]" />
          <h3 className="text-[18px] font-bold text-[#0f172a] m-0">Add Skill</h3>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[13px] font-semibold text-[#475569]">Skill Name <span className="text-[#ef4444]">*</span></label>
            <Input
              placeholder="e.g. JavaScript, Data Analysis, Python"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onPressEnter={handleAdd}
              className="h-11 rounded-lg border-[#e2e8f0]"
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-[200px]">
            <label className="text-[13px] font-semibold text-[#475569]">Proficiency Level <span className="text-[#ef4444]">*</span></label>
            <Select
              placeholder="Select level"
              value={newSkillLevel}
              onChange={setNewSkillLevel}
              options={proficiencyOptions}
              className="h-11 w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              className="h-11 px-5 border-[#e2e8f0] text-[#475569] font-semibold rounded-lg hover:!border-[#cbd5e1] hover:!text-[#0f172a]" 
              onClick={() => { setNewSkillName(""); setNewSkillLevel(null); setIsAdding(false); }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              className="h-11 px-6 bg-[#1E69DA] font-semibold rounded-lg shadow-sm"
              disabled={!newSkillName.trim()}
              onClick={handleAdd}
            >
              Add Skill
            </Button>
          </div>
          </div>
        </div>
      )}
      {/* Skills List */}
      <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-[#0f172a] m-0">Your Skills <span className="text-[#64748b] text-[15px] font-medium">({validSkills.length})</span></h3>
          <span className="text-[#64748b] text-[13px] flex items-center gap-1">
            <HolderOutlined /> Reorder skills by drag and drop
          </span>
        </div>

        {validSkills.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="skillsList">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                  {validSkills.map((skill, index) => {
                    const isEditing = editingIndex === index;
                    const name = typeof skill === 'string' ? skill : skill.name;
                    const level = typeof skill === 'string' ? null : skill.level;

                    return (
                      <Draggable key={`skill-${index}`} draggableId={`skill-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white rounded-lg border border-[#e2e8f0] p-3 flex items-center justify-between shadow-sm group hover:border-[#cbd5e1] transition-all"
                          >
                            {isEditing ? (
                              <div className="flex flex-col md:flex-row items-center gap-3 w-full pl-8">
                                <Input
                                  value={editSkillName}
                                  onChange={(e) => setEditSkillName(e.target.value)}
                                  className="h-9 rounded-md border-[#e2e8f0]"
                                />
                                <Select
                                  value={editSkillLevel}
                                  onChange={setEditSkillLevel}
                                  options={proficiencyOptions}
                                  className="h-9 w-[150px]"
                                />
                                <div className="flex items-center gap-2">
                                  <Button size="small" type="primary" onClick={() => saveEdit(index)}>Save</Button>
                                  <Button size="small" onClick={cancelEdit}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4">
                                  <div {...provided.dragHandleProps} className="text-[#94a3b8] cursor-grab hover:text-[#64748b] p-1">
                                    <HolderOutlined className="text-[16px]" />
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="font-semibold text-[#0f172a] text-[15px] min-w-[120px]">{name}</span>
                                    {level && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#3b82f6] text-[12px] font-semibold border border-[#bfdbfe]">
                                        {level}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button type="text" className="text-[#64748b] hover:text-[#3b82f6]" icon={<EditOutlined />} onClick={() => startEdit(index)} />
                                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemove(index)} />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="text-center py-8 text-[#64748b]">No skills added yet. Add a skill above.</div>
        )}

        {!isAdding && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setIsAdding(true)}
            className="h-12 w-full mt-4 text-[#3b82f6] border-[#3b82f6] bg-[#eff6ff] hover:!bg-[#dbeafe] transition-all font-semibold rounded-xl"
          >
            Add Another Skill
          </Button>
        )}
      </div>

      <div className="bg-[#eff6ff] rounded-xl border border-[#bfdbfe] p-4 flex items-center gap-3">
        <InfoCircleOutlined className="text-[#3b82f6] text-[20px]" />
        <p className="text-[#475569] text-[14px] m-0">
          <span className="font-bold text-[#1e3a8a]">Tips:</span> Add skills that are relevant to the job you are applying for. Keep the list updated and remove outdated skills.
        </p>
      </div>

      {onNext && (
        <div className="flex justify-end mt-2">
          <Button type="primary" size="large" className="bg-[#1E69DA] px-8 font-semibold rounded-lg" onClick={onNext}>
            Next Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default SkillsDetails;
