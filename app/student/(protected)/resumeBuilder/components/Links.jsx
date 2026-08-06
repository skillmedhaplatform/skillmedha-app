'use client';
import React from "react";
import { Button, Switch, Dropdown } from "antd";
import { 
  DeleteOutlined, 
  InfoCircleOutlined, 
  PlusOutlined, 
  LinkOutlined, 
  GithubOutlined, 
  HolderOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  GlobalOutlined
} from "@ant-design/icons";

const Links = ({ links, updateLink, addLink, removeLink }) => {

  const handleAdd = () => addLink();

  const handleRemove = (index) => removeLink(index);

  const getIcon = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("github")) return <GithubOutlined className="text-[32px] text-[#0f172a]" />;
    if (t.includes("linkedin")) return <LinkedinOutlined className="text-[32px] text-[#0077b5]" />;
    if (t.includes("twitter") || t.includes("x")) return <TwitterOutlined className="text-[32px] text-[#1DA1F2]" />;
    if (t.includes("facebook")) return <FacebookOutlined className="text-[32px] text-[#1877F2]" />;
    if (t.includes("instagram")) return <InstagramOutlined className="text-[32px] text-[#E4405F]" />;
    if (t.includes("youtube")) return <YoutubeOutlined className="text-[32px] text-[#FF0000]" />;
    return <GlobalOutlined className="text-[32px] text-[#0f172a]" />;
  };

  const getPlaceholder = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("github")) return "github.com/username";
    if (t.includes("linkedin")) return "linkedin.com/in/username";
    if (t.includes("twitter") || t.includes("x")) return "twitter.com/username";
    if (t.includes("facebook")) return "facebook.com/username";
    if (t.includes("instagram")) return "instagram.com/username";
    if (t.includes("youtube")) return "youtube.com/@username";
    return "https://example.com";
  };

  const getMenuItems = (index) => ({
    items: [
      { key: "GitHub", label: "GitHub", icon: <GithubOutlined />, onClick: () => updateLink(index, "title", "GitHub") },
      { key: "LinkedIn", label: "LinkedIn", icon: <LinkedinOutlined />, onClick: () => updateLink(index, "title", "LinkedIn") },
      { key: "Twitter", label: "Twitter", icon: <TwitterOutlined />, onClick: () => updateLink(index, "title", "Twitter") },
      { key: "Facebook", label: "Facebook", icon: <FacebookOutlined />, onClick: () => updateLink(index, "title", "Facebook") },
      { key: "Instagram", label: "Instagram", icon: <InstagramOutlined />, onClick: () => updateLink(index, "title", "Instagram") },
      { key: "YouTube", label: "YouTube", icon: <YoutubeOutlined />, onClick: () => updateLink(index, "title", "YouTube") },
      { key: "Website", label: "Website", icon: <GlobalOutlined />, onClick: () => updateLink(index, "title", "Website") },
    ]
  });

  return (
    <div className="flex flex-col w-full bg-white mb-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1E69DA] rounded-full"></div>
          <h3 className="text-[15px] font-semibold text-[#0f172a] m-0">Links</h3>
        </div>
        <Button 
          type="primary" 
          size="small" 
          icon={<PlusOutlined />}
          className="!bg-[#EFF5FB] !text-[#1E69DA] !border-none !rounded-full !px-4 hover:!bg-[#E2EDF8] transition-all font-medium text-[13px] !shadow-none" 
          onClick={handleAdd}
        >
          Add Link
        </Button>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {links.map((item, index) => (
          <div className="flex flex-wrap xl:flex-nowrap w-full items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e2e8f0]" key={index}>
            <Dropdown menu={getMenuItems(index)} trigger={['click']} placement="bottomLeft">
              <div className="flex items-center justify-center cursor-pointer hover:bg-slate-50 p-1 rounded">
                <HolderOutlined className="text-[#94a3b8] text-[18px] hover:text-[#64748b]" />
              </div>
            </Dropdown>
            
            <Dropdown menu={getMenuItems(index)} trigger={['click']} placement="bottomLeft">
              <div className="w-[50px] h-[50px] flex items-center justify-center bg-white rounded-xl border border-[#e2e8f0] shadow-sm shrink-0 cursor-pointer hover:border-[#1E69DA] transition-colors">
                {getIcon(item.title)}
              </div>
            </Dropdown>

            <div className="w-full xl:w-auto xl:flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 order-last xl:order-none">
              <div className="col-span-1 flex flex-col">
                <label className="text-[13px] font-semibold mb-1.5 text-[#64748b]">Label</label>
                <div className="relative">
                  <input
                    className="w-full px-3 py-2.5 rounded-lg border border-[#e2e8f0] text-[14px] outline-none focus:border-[#1E69DA] focus:ring-1 focus:ring-[#1E69DA] transition-all bg-white"
                    placeholder="e.g. GitHub"
                    value={item.title}
                    onChange={(e) => updateLink(index, "title", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="col-span-1 flex flex-col">
                <label className="text-[13px] font-semibold mb-1.5 text-[#64748b]">URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkOutlined className="text-[#94a3b8] text-[14px]" />
                  </div>
                  <input
                    className="w-full pl-9 px-3 py-2.5 rounded-lg border border-[#e2e8f0] text-[14px] outline-none focus:border-[#1E69DA] focus:ring-1 focus:ring-[#1E69DA] transition-all bg-white"
                    placeholder={getPlaceholder(item.title)}
                    value={item.link}
                    onChange={(e) => updateLink(index, "link", e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center ml-auto xl:ml-2">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent border-none text-[#ef4444] hover:bg-[#fef2f2] transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
              >
                <DeleteOutlined className="text-[18px]" />
              </button>
            </div>
          </div>
        ))}

        <div className="bg-[#EFF5FB] rounded-lg p-3 flex gap-2 items-start mt-2 border border-[#dbeafe]">
          <InfoCircleOutlined className="text-[#1E69DA] mt-0.5" />
          <p className="text-[13px] text-[#1e3a8a] m-0 leading-tight">
            These links will appear in your resume header or sidebar depending on the template.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Links;
