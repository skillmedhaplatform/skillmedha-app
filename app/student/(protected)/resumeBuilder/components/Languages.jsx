"use client";
import React, { useState } from "react";
import { Button, Input, Select, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, HolderOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Language = ({ languages, updateLanguage, setLanguages, onNext }) => {
  const [newLanguageName, setNewLanguageName] = useState("");
  const [newLanguageLevel, setNewLanguageLevel] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editLanguageName, setEditLanguageName] = useState("");
  const [editLanguageLevel, setEditLanguageLevel] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const proficiencyOptions = [
    { value: "Native", label: "Native" },
    { value: "Fluent", label: "Fluent" },
    { value: "Proficient", label: "Proficient" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Beginner", label: "Beginner" },
  ];

  const handleAdd = () => {
    if (newLanguageName.trim()) {
      const newLanguage = { name: newLanguageName.trim(), level: newLanguageLevel };
      const cleanedLanguages = languages.filter(s => {
        if (typeof s === 'string') return s.trim() !== "";
        return s && s.name && s.name.trim() !== "";
      });
      setLanguages([...cleanedLanguages, newLanguage]);
      setNewLanguageName("");
      setNewLanguageLevel(null);
      setIsAdding(false);
    }
  };

  const handleRemove = (index) => {
    const updated = [...languages];
    updated.splice(index, 1);
    setLanguages(updated);
  };

  const handleEditClick = (index, lang) => {
    setEditingIndex(index);
    if (typeof lang === 'string') {
      setEditLanguageName(lang);
      setEditLanguageLevel(null);
    } else {
      setEditLanguageName(lang.name || "");
      setEditLanguageLevel(lang.level || null);
    }
  };

  const handleSaveEdit = (index) => {
    if (editLanguageName.trim()) {
      updateLanguage(index, { name: editLanguageName.trim(), level: editLanguageLevel });
      setEditingIndex(null);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(languages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLanguages(items);
  };

  const validLanguages = languages.filter(s => {
    if (typeof s === 'string') return s.trim() !== "";
    return s && s.name && s.name.trim() !== "";
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[0.9rem] text-gray-500 mb-2">
        Add the languages you know and your proficiency level.
      </div>

      {validLanguages.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="languages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                {validLanguages.map((lang, index) => {
                  const name = typeof lang === 'string' ? lang : lang.name;
                  const level = typeof lang === 'object' ? lang.level : null;

                  return (
                    <Draggable key={`lang-${index}`} draggableId={`lang-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white hover:border-[#4096ff] transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                              <HolderOutlined />
                            </div>

                            {editingIndex === index ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editLanguageName}
                                  onChange={(e) => setEditLanguageName(e.target.value)}
                                  placeholder="e.g. English, Hindi, Spanish"
                                  className="w-[180px]"
                                  autoFocus
                                />
                                <Select
                                  value={editLanguageLevel}
                                  onChange={setEditLanguageLevel}
                                  options={proficiencyOptions}
                                  placeholder="Select level"
                                  className="w-[130px]"
                                  allowClear
                                />
                                <Button type="primary" size="small" onClick={() => handleSaveEdit(index)}>Save</Button>
                                <Button size="small" onClick={() => setEditingIndex(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-800">{name}</span>
                                {level && (
                                  <span className="text-[0.75rem] px-2 py-0.5 bg-[#f0f5ff] text-[#2f54eb] rounded-full border border-[#adc6ff]">
                                    {level}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {editingIndex !== index && (
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip title="Edit">
                                <Button
                                  type="text"
                                  icon={<EditOutlined className="text-[#4096ff]" />}
                                  onClick={() => handleEditClick(index, lang)}
                                  className="flex items-center justify-center p-0 w-8 h-8 rounded-full hover:bg-blue-50"
                                />
                              </Tooltip>
                              <Tooltip title="Delete">
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined className="text-red-500" />}
                                  onClick={() => handleRemove(index)}
                                  className="flex items-center justify-center p-0 w-8 h-8 rounded-full hover:bg-red-50"
                                />
                              </Tooltip>
                            </div>
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
      )}

      {!isAdding && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setIsAdding(true)}
          className="w-full text-[#4096ff] border-[#4096ff] hover:bg-blue-50 h-[40px]"
        >
          Add Language
        </Button>
      )}

      {isAdding && (
        <div className="p-4 border border-gray-200 rounded-md bg-[#fafafa]">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. English, Hindi, Spanish"
                value={newLanguageName}
                onChange={(e) => setNewLanguageName(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency Level
              </label>
              <Select
                className="w-full"
                size="large"
                placeholder="Select level"
                value={newLanguageLevel}
                onChange={setNewLanguageLevel}
                options={proficiencyOptions}
                allowClear
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button type="primary" onClick={handleAdd} disabled={!newLanguageName.trim()}>
              Add Language
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-600 rounded-md mt-2">
        <InfoCircleOutlined className="mt-0.5" />
        <span className="text-sm">
          <strong>Tip:</strong> Mention languages that are relevant to the role you are applying for.
        </span>
      </div>

      {validLanguages.length > 0 && onNext && (
        <div className="flex justify-end mt-4">
          <Button type="primary" size="large" onClick={onNext}>
            Next Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default Language;