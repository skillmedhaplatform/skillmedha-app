// Import React and necessary hooks
import React, { useRef, useState } from "react";

// Import Ant Design components and icons
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Select, Space } from "antd";

// Define the CustomDropdownSelect component
export const CustomDropdownSelect = ({
  style,
  placeholder,
  value,
  onChange,
  isEditing
}) => {
  const [items, setItems] = useState([
    "Andhra University",
    "Sri Venkateswara University",
    "Jawaharlal Nehru Technological University, Kakinada (JNTUK)",
    "Jawaharlal Nehru Technological University, Anantapur (JNTUA)",
    "Acharya Nagarjuna University",
    "Dr. NTR University of Health Sciences",
    "Sri Krishnadevaraya University",
    "Adikavi Nannaya University",
    "Yogi Vemana University",
  ]);
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  const index = useRef(1);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const addItem = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return;

    // Optional: Avoid adding duplicates
    if (items.includes(trimmedName)) {
      setName("");
      return;
    }

    setItems([...items, trimmedName]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <Select
      style={style}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      labelInValue={false}
      disabled={!isEditing}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <Space style={{ padding: "0 8px 4px" }}>
            <Input
              placeholder="Please enter item"
              ref={inputRef}
              value={name}

              onChange={onNameChange}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
              Add item
            </Button>
          </Space>
        </>
      )}
      options={items.map((item) => ({ label: item, value: item }))}
    />
  );
};
