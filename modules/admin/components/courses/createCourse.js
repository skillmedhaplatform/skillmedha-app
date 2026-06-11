"use client";
import React, { useEffect, useState, useRef } from "react";
import internStyles from "./page.module.scss";
import TextEditor from "@/modules/admin/utils/editor";
import {
  Button,
  Radio,
  Upload,
  Modal,
  Select,
  Input,
  InputNumber,
  Tag,
  App,
  Alert,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  createCourse,
  getOneInternship,
  updateInternship,
} from "@/redux/slices/admin/cms/internship";
import { uploadFileToS3 } from "@/modules/admin/utils/uploadtos3";
import { restUrl } from "@/config/urls";

const ImgCrop = dynamic(() => import("antd-img-crop"), { ssr: false });
const { TextArea } = Input;
const { Option } = Select;

const CreateCourse = ({ type = "course" }) => {
  const { message } = App.useApp();
  const nav = useRouter();
  const params = useParams();
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Store original data from API
  const originalDataRef = useRef(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Get capitalized type for UI display
  const typeCapitalized = capitalize(type);

  // Basic course info
  const [courseBasic, setCourseBasic] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    language: "English",
    difficulty: "Beginner",
    duration: "",
    projects: "",
  });

  // Store initial description separately to pass to TextEditor
  const [editorInitialContent, setEditorInitialContent] = useState({
    description: "",
  });

  // Arrays
  const [courseArrays, setCourseArrays] = useState({
    subcategories: [],
    tags: [],
    preRequisites: [],
    learningPoints: [],
    skills: [],
    tools: [],
    targetAudience: [],
    keywords: [],
  });

  // Course includes
  const [courseIncludes, setCourseIncludes] = useState({
    videoDuration: "",
    articles: 0,
    downloadableResources: 0,
    codingExercises: 0,
    quizzes: 0,
    lifetimeAccess: true,
    certificateOfCompletion: true,
    jobAssistance: false,
  });

  // Pricing
  const [pricing, setPricing] = useState({
    currentPrice: "",
    originalPrice: "",
    couponCode: "",
    couponDiscount: 0,
  });

  // SEO
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
  });

  // Status & visibility
  const [visibility, setVisibility] = useState({
    status: "active",
    featured: false,
    trending: false,
  });

  // Images
  const [images, setImages] = useState({
    coverImage: "",
    thumbnailImage: "",
    bannerImage: "",
  });

  const [fileList, setFileList] = useState([]);
  const [thumbnailFileList, setThumbnailFileList] = useState([]);
  const [bannerFileList, setBannerFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [toolsList, setToolsList] = useState([]);
  const [toolFileListsMap, setToolFileListsMap] = useState({});
  const userCreds = useSelector((state) => state.user?.singleUser);

  // Comprehensive Course Categories
  const categoryOptions = [
    // Technology & Programming
    "Data Science & AI",
    "Machine Learning",
    "Artificial Intelligence",
    "Deep Learning",
    "Natural Language Processing",
    "Computer Vision",
    "Web Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Mobile Development",
    "Android Development",
    "iOS Development",
    "React Native",
    "Flutter Development",
    "Cloud Computing",
    "AWS (Amazon Web Services)",
    "Azure",
    "Google Cloud Platform",
    "Cybersecurity",
    "Ethical Hacking",
    "Network Security",
    "Information Security",
    "DevOps",
    "CI/CD",
    "Docker & Kubernetes",
    "Software Engineering",
    "Programming Languages",
    "Python Programming",
    "JavaScript",
    "Java Programming",
    "C++ Programming",
    "C Programming",
    "C# Programming",
    "PHP Development",
    "Ruby on Rails",
    "Go Programming",
    "Rust Programming",
    "Kotlin Programming",
    "Swift Programming",
    "Database Management",
    "SQL & MySQL",
    "MongoDB",
    "PostgreSQL",
    "Blockchain & Cryptocurrency",
    "NFTs & Web3",
    "Game Development",
    "Unity Development",
    "Unreal Engine",
    "IT & Software",
    "IT Support",
    "Network Administration",

    // Design & Creative
    "UI/UX Design",
    "Graphic Design",
    "Product Design",
    "Web Design",
    "Logo Design",
    "Brand Identity",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Figma Design",
    "Sketch Design",
    "Video Editing",
    "Adobe Premiere Pro",
    "Final Cut Pro",
    "After Effects",
    "Motion Graphics",
    "3D Modeling & Animation",
    "Blender",
    "Maya",
    "Interior Design",
    "Fashion Design",
    "Photography",
    "Mobile Photography",
    "Digital Art",
    "Illustration",
    "Architecture Design",

    // Business & Marketing
    "Business & Marketing",
    "Digital Marketing",
    "Social Media Marketing",
    "Content Marketing",
    "Email Marketing",
    "Influencer Marketing",
    "SEO (Search Engine Optimization)",
    "SEM & Google Ads",
    "Facebook Ads",
    "Instagram Marketing",
    "YouTube Marketing",
    "Affiliate Marketing",
    "E-commerce",
    "Shopify",
    "Amazon FBA",
    "Dropshipping",
    "Entrepreneurship",
    "Startup",
    "Business Strategy",
    "Business Analytics",
    "Project Management",
    "Agile & Scrum",
    "Product Management",
    "Sales & Selling",
    "Sales Funnel",
    "Copywriting",
    "Public Relations",
    "Branding",
    "Market Research",
    "Supply Chain Management",

    // Finance & Accounting
    "Finance & Accounting",
    "Personal Finance",
    "Investment & Trading",
    "Stock Market",
    "Day Trading",
    "Cryptocurrency Trading",
    "Real Estate Investing",
    "Financial Analysis",
    "Accounting",
    "Bookkeeping",
    "Taxation",
    "Excel for Finance",
    "Financial Modeling",
    "Risk Management",
    "Banking & Insurance",

    // Personal Development
    "Personal Development",
    "Leadership & Management",
    "Career Development",
    "Productivity",
    "Time Management",
    "Communication Skills",
    "Public Speaking",
    "Presentation Skills",
    "Negotiation",
    "Critical Thinking",
    "Problem Solving",
    "Emotional Intelligence",
    "Confidence Building",
    "Goal Setting",
    "Mindfulness & Meditation",
    "Stress Management",
    "Memory & Learning",
    "Speed Reading",

    // Health & Fitness
    "Health & Fitness",
    "Yoga",
    "Pilates",
    "Weight Training",
    "Cardio & HIIT",
    "Nutrition & Diet",
    "Mental Health",
    "Wellness Coaching",
    "Sports & Athletics",
    "Martial Arts",
    "Dance",
    "Meditation",
    "Alternative Medicine",
    "Herbal Medicine",

    // Teaching & Academics
    "Teaching & Academics",
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Test Preparation",
    "IELTS",
    "TOEFL",
    "GRE",
    "GMAT",
    "SAT",
    "ACT",
    "Study Skills",
    "Research Methods",
    "Academic Writing",

    // Language Learning
    "Language Learning",
    "English Language",
    "Business English",
    "IELTS Preparation",
    "TOEFL Preparation",
    "German Language",
    "French Language",
    "Spanish Language",
    "Italian Language",
    "Portuguese Language",
    "Mandarin Chinese",
    "Japanese Language",
    "Korean Language",
    "Arabic Language",
    "Russian Language",
    "Hindi Language",

    // Music & Audio
    "Music",
    "Music Production",
    "Guitar",
    "Piano",
    "Vocals & Singing",
    "Drums",
    "DJ & Audio Mixing",
    "Music Theory",
    "Sound Design",
    "Audio Engineering",
    "Podcast Production",

    // Lifestyle
    "Lifestyle",
    "Cooking",
    "Baking",
    "Parenting",
    "Relationships",
    "Dating & Love",
    "Home Improvement",
    "Gardening",
    "Pet Care",
    "Travel & Tourism",
    "Fashion & Style",
    "Makeup & Beauty",
    "Crafts & Hobbies",
    "Gaming",

    // Office Productivity
    "Office Productivity",
    "Microsoft Office",
    "Microsoft Excel",
    "Microsoft Word",
    "Microsoft PowerPoint",
    "Google Workspace",
    "Notion",
    "Airtable",
    "Trello",

    // Data & Analytics
    "Data & Analytics",
    "Data Analysis",
    "Business Intelligence",
    "Tableau",
    "Power BI",
    "Google Analytics",
    "Excel Analytics",
    "Statistical Analysis",
    "Data Visualization",
    "Big Data",

    // Humanities & Social Sciences
    "Arts & Humanities",
    "History",
    "Philosophy",
    "Psychology",
    "Sociology",
    "Political Science",
    "Economics",
    "Anthropology",
    "Literature",
    "Creative Writing",

    // Religion & Spirituality
    "Religion & Spirituality",
    "Christianity",
    "Islam",
    "Buddhism",
    "Hinduism",
    "Spiritual Development",
    "Astrology",

    // Other
    "Ethics & Compliance",
    "Law & Legal Studies",
    "Human Resources",
    "Customer Service",
    "Quality Management",
    "Environmental Science",
    "Sustainability",
  ];

  // Comprehensive Language Options
  const languageOptions = [
    "English",
    "Spanish (Español)",
    "Mandarin Chinese (中文)",
    "Hindi (हिन्दी)",
    "Arabic (العربية)",
    "Portuguese (Português)",
    "Bengali (বাংলা)",
    "Russian (Русский)",
    "Japanese (日本語)",
    "Punjabi (ਪੰਜਾਬੀ)",
    "German (Deutsch)",
    "French (Français)",
    "Italian (Italiano)",
    "Korean (한국어)",
    "Vietnamese (Tiếng Việt)",
    "Turkish (Türkçe)",
    "Thai (ไทย)",
    "Persian/Farsi (فارسی)",
    "Polish (Polski)",
    "Dutch (Nederlands)",
    "Greek (Ελληνικά)",
    "Swedish (Svenska)",
    "Hebrew (עברית)",
    "Indonesian (Bahasa Indonesia)",
    "Malay (Bahasa Melayu)",
    "Tagalog/Filipino",
  ];

  // ===== VALIDATION FUNCTIONS =====

  /**
   * Validates all form fields
   * @returns {Object} - { isValid: boolean, errors: {} }
   */
  const validateForm = () => {
    const errors = {};

    // Basic Information Validation
    if (!courseBasic.title || courseBasic.title.trim().length < 10) {
      errors.title = `${typeCapitalized} title must be at least 10 characters long`;
    } else if (courseBasic.title.length > 150) {
      errors.title = `${typeCapitalized} title must not exceed 150 characters`;
    }

    if (courseBasic.subtitle && courseBasic.subtitle.length > 200) {
      errors.subtitle = "Subtitle must not exceed 200 characters";
    }

    if (!courseBasic.description || isHtmlEmpty(courseBasic.description)) {
      errors.description = `${typeCapitalized} description is required`;
    } else {
      const descriptionLength = normalizeHtmlContent(
        courseBasic.description
      ).length;
      if (descriptionLength < 100) {
        errors.description = "Description must be at least 100 characters";
      } else if (descriptionLength > 10000) {
        errors.description = "Description must not exceed 10,000 characters";
      }
    }

    if (!courseBasic.category) {
      errors.category = "Please select a category";
    }

    if (!courseBasic.language) {
      errors.language = "Please select a language";
    }

    // Duration validation
    if (!courseBasic.duration || courseBasic.duration.trim().length === 0) {
      errors.duration = `${typeCapitalized} duration is required`;
    }

    // Pricing Validation
    if (!pricing.currentPrice || pricing.currentPrice === "") {
      errors.currentPrice = "Current price is required";
    } else {
      const currentPrice = parseFloat(pricing.currentPrice);
      if (isNaN(currentPrice) || currentPrice < 0) {
        errors.currentPrice = "Current price must be a valid positive number";
      } else if (currentPrice > 1000000) {
        errors.currentPrice = "Current price seems unreasonably high";
      }
    }

    if (pricing.originalPrice) {
      const originalPrice = parseFloat(pricing.originalPrice);
      const currentPrice = parseFloat(pricing.currentPrice);
      if (isNaN(originalPrice) || originalPrice < 0) {
        errors.originalPrice = "Original price must be a valid positive number";
      } else if (originalPrice <= currentPrice) {
        errors.originalPrice =
          "Original price should be greater than current price";
      }
    }

    if (pricing.couponDiscount) {
      const discount = parseFloat(pricing.couponDiscount);
      const currentPrice = parseFloat(pricing.currentPrice);
      if (isNaN(discount) || discount < 0) {
        errors.couponDiscount = "Coupon discount must be a positive number";
      } else if (discount >= currentPrice) {
        errors.couponDiscount =
          "Coupon discount cannot be greater than or equal to current price";
      }
    }

    if (pricing.couponCode && pricing.couponCode.length > 0) {
      if (pricing.couponCode.length < 3) {
        errors.couponCode = "Coupon code must be at least 3 characters";
      } else if (pricing.couponCode.length > 50) {
        errors.couponCode = "Coupon code must not exceed 50 characters";
      } else if (!/^[A-Z0-9_-]+$/i.test(pricing.couponCode)) {
        errors.couponCode =
          "Coupon code can only contain letters, numbers, hyphens, and underscores";
      }
    }

    // Course Includes Validation
    if (
      courseIncludes.articles < 0 ||
      courseIncludes.downloadableResources < 0 ||
      courseIncludes.codingExercises < 0 ||
      courseIncludes.quizzes < 0
    ) {
      errors.courseIncludes = `${typeCapitalized} includes values cannot be negative`;
    }

    if (
      courseIncludes.articles > 1000 ||
      courseIncludes.downloadableResources > 1000 ||
      courseIncludes.codingExercises > 1000 ||
      courseIncludes.quizzes > 1000
    ) {
      errors.courseIncludes = `${typeCapitalized} includes values seem unreasonably high`;
    }

    // SEO Validation
    if (seo.metaTitle && seo.metaTitle.length > 60) {
      errors.metaTitle = "Meta title should not exceed 60 characters";
    }

    if (seo.metaDescription && seo.metaDescription.length > 160) {
      errors.metaDescription =
        "Meta description should not exceed 160 characters";
    }

    // Array Validations
    if (courseArrays.tags.length > 20) {
      errors.tags = "Maximum 20 tags allowed";
    }

    if (courseArrays.learningPoints.length === 0) {
      errors.learningPoints = "Add at least one learning point";
    } else if (courseArrays.learningPoints.length > 50) {
      errors.learningPoints = "Maximum 50 learning points allowed";
    }

    if (courseArrays.skills.length > 30) {
      errors.skills = "Maximum 30 skills allowed";
    }

    if (courseArrays.keywords.length > 15) {
      errors.keywords = "Maximum 15 SEO keywords allowed";
    }

    // Media Validation
    if (!images.coverImage || images.coverImage === "") {
      errors.coverImage = "Cover image is required";
    }
    const validTools = toolsList.filter(
      (tool) => tool.name && tool.name.trim().length > 0
    );
    if (validTools.length < 3) {
      errors.tools = "At least 3 tools with names are required";
    }

    toolsList.forEach((tool, index) => {
      if (tool.name && tool.name.trim().length > 0) {
        if (tool.name.length < 2) {
          errors.tools = `Tool ${
            index + 1
          }: Name must be at least 2 characters`;
        } else if (tool.name.length > 50) {
          errors.tools = `Tool ${
            index + 1
          }: Name must not exceed 50 characters`;
        }
      }
    });
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  /**
   * Validates a single field
   */
  const validateField = (fieldName, value) => {
    const newErrors = { ...validationErrors };

    switch (fieldName) {
      case "title":
        if (!value || value.trim().length < 10) {
          newErrors.title = `${typeCapitalized} title must be at least 10 characters long`;
        } else if (value.length > 150) {
          newErrors.title = `${typeCapitalized} title must not exceed 150 characters`;
        } else {
          delete newErrors.title;
        }
        break;

      case "subtitle":
        if (value && value.length > 200) {
          newErrors.subtitle = "Subtitle must not exceed 200 characters";
        } else {
          delete newErrors.subtitle;
        }
        break;

      case "category":
        if (!value) {
          newErrors.category = "Please select a category";
        } else {
          delete newErrors.category;
        }
        break;

      case "currentPrice":
        if (!value || value === "") {
          newErrors.currentPrice = "Current price is required";
        } else {
          const price = parseFloat(value);
          if (isNaN(price) || price < 0) {
            newErrors.currentPrice =
              "Current price must be a valid positive number";
          } else if (price > 1000000) {
            newErrors.currentPrice = "Current price seems unreasonably high";
          } else {
            delete newErrors.currentPrice;
          }
        }
        break;

      case "coverImage":
        if (!value || value === "") {
          newErrors.coverImage = "Cover image is required";
        } else {
          delete newErrors.coverImage;
        }
        break;

      default:
        break;
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to normalize HTML content (handles TextEditor JSON-stringified output)
  const normalizeHtmlContent = (content) => {
    if (!content) return "";

    // Parse JSON if needed (TextEditor stores as JSON string)
    let html = content;
    try {
      html = JSON.parse(content);
    } catch (e) {
      // Already a string
    }

    // Remove empty paragraphs, breaks, and whitespace
    return html
      .replace(/<p><br><\/p>/g, "")
      .replace(/<p><\/p>/g, "")
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/^\s+|\s+$/g, "")
      .replace(/&nbsp;/g, "");
  };

  // Helper to check if HTML content is effectively empty
  const isHtmlEmpty = (content) => {
    const normalized = normalizeHtmlContent(content);
    return !normalized || normalized === "" || normalized === '""';
  };

  // Helper function to check if a value has actually changed
  const hasChanged = (original, current, fieldName = "") => {
    // Special handling for description field (HTML content)
    if (fieldName === "description") {
      const originalNormalized = normalizeHtmlContent(original);
      const currentNormalized = normalizeHtmlContent(current);

      // Both empty - no change
      if (isHtmlEmpty(original) && isHtmlEmpty(current)) {
        return false;
      }

      return originalNormalized !== currentNormalized;
    }

    // Handle objects and arrays
    if (typeof original === "object" && typeof current === "object") {
      return JSON.stringify(original) !== JSON.stringify(current);
    }

    return original !== current;
  };

  // Helper function to remove empty/unchanged values
  const getChangedValues = (original, current, sectionName = "") => {
    const changes = {};

    Object.keys(current).forEach((key) => {
      const currentValue = current[key];
      const originalValue = original?.[key];

      // Skip if value is empty string and wasn't in original (except for description)
      if (key !== "description" && currentValue === "" && !originalValue) {
        return;
      }

      // Include if value has changed
      if (hasChanged(originalValue, currentValue, key)) {
        changes[key] = currentValue;
      }
    });

    return Object.keys(changes).length > 0 ? changes : null;
  };

  const handleAddTool = () => {
    if (toolsList.length < 20) {
      setToolsList([...toolsList, { name: "", icon: "" }]);
    } else {
      message.warning("Maximum 20 tools allowed");
    }
  };

  const handleRemoveTool = (index) => {
    if (toolsList.length > 3) {
      const newTools = toolsList.filter((_, i) => i !== index);
      setToolsList(newTools);

      // Remove file list for this tool
      const newFileListsMap = { ...toolFileListsMap };
      delete newFileListsMap[index];

      // Reindex the remaining file lists
      const reindexedMap = {};
      Object.keys(newFileListsMap).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedMap[oldIndex - 1] = newFileListsMap[key];
        } else {
          reindexedMap[key] = newFileListsMap[key];
        }
      });
      setToolFileListsMap(reindexedMap);
    } else {
      message.warning("At least 3 tools are required");
    }
  };

  const handleToolNameChange = (index, value) => {
    const newTools = [...toolsList];
    newTools[index] = { ...newTools[index], name: value };
    setToolsList(newTools);
  };

  const handleToolIconUpload = async (options, index) => {
    const { file, onSuccess, onError } = options;
    try {
      const url = await uploadFileToS3({
        file,
        restUrl,
        onUploaded: (s3Url) => {
          const newTools = [...toolsList];
          newTools[index] = { ...newTools[index], icon: s3Url };
          setToolsList(newTools);
        },
      });

      const fileObj = {
        uid: file.uid || String(Date.now()),
        name: file.name,
        status: "done",
        url,
      };

      setToolFileListsMap((prev) => ({
        ...prev,
        [index]: [fileObj],
      }));

      onSuccess && onSuccess({ url }, file);
      message.success("Tool icon uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      message.error("Failed to upload tool icon");
      onError && onError(err);
    }
  };

  useEffect(() => {
    if (
      params.createInternship?.split("/")?.join("") !==
        `new${typeCapitalized}` &&
      !dataLoaded
    ) {
      dispatch(
        getOneInternship({
          id: params.createInternship,
          orgId: userCreds?.orgId,
        })
      )?.then((resp) => {
        if (resp?.payload) {
          const data = resp.payload;

          // Store original data for comparison
          originalDataRef.current = data;

          // Basic info
          setCourseBasic({
            title: data?.title || "",
            subtitle: data?.subtitle || "",
            description: data?.description || "",
            category: data?.category || "",
            language: data?.language || "English",
            difficulty: data?.difficulty || "Beginner",
            duration: data?.duration || "",
            projects: data?.projects || "",
          });

          // Set editor initial content
          setEditorInitialContent({
            description: data?.description || "",
          });

          // Arrays
          setCourseArrays({
            subcategories: data?.subcategories || [],
            tags: data?.tags || [],
            preRequisites: data?.preRequisites || [],
            learningPoints: data?.learningPoints || [],
            skills: data?.skills || [],
            tools: data?.tools || [],
            targetAudience: data?.targetAudience || [],
            keywords: data?.seoMetadata?.keywords || [],
          });

          // Course includes
          setCourseIncludes({
            videoDuration: data?.courseIncludes?.videoDuration || "",
            articles: data?.courseIncludes?.articles || 0,
            downloadableResources:
              data?.courseIncludes?.downloadableResources || 0,
            codingExercises: data?.courseIncludes?.codingExercises || 0,
            quizzes: data?.courseIncludes?.quizzes || 0,
            lifetimeAccess: data?.courseIncludes?.lifetimeAccess ?? true,
            certificateOfCompletion:
              data?.courseIncludes?.certificateOfCompletion ?? true,
            jobAssistance: data?.courseIncludes?.jobAssistance || false,
          });

          // Pricing
          setPricing({
            currentPrice: data?.pricing?.currentPrice || data?.price || "",
            originalPrice: data?.pricing?.originalPrice || "",
            couponCode: data?.pricing?.couponCode || "",
            couponDiscount: data?.pricing?.couponDiscount || 0,
          });

          // SEO
          setSeo({
            metaTitle: data?.seoMetadata?.metaTitle || "",
            metaDescription: data?.seoMetadata?.metaDescription || "",
          });

          // Visibility
          setVisibility({
            status: data?.status || "active",
            featured: data?.featured || false,
            trending: data?.trending || false,
          });

          // Images
          const coverUrl = data?.media?.coverImage || data?.coverImage;
          if (coverUrl) {
            setImages((prev) => ({ ...prev, coverImage: coverUrl }));
            setFileList([
              { uid: "-1", name: "cover-image", status: "done", url: coverUrl },
            ]);
          }
          if (data?.media?.thumbnailImage) {
            setImages((prev) => ({
              ...prev,
              thumbnailImage: data.media.thumbnailImage,
            }));
            setThumbnailFileList([
              {
                uid: "-2",
                name: "thumbnail",
                status: "done",
                url: data.media.thumbnailImage,
              },
            ]);
          }
          if (data?.media?.bannerImage) {
            setImages((prev) => ({
              ...prev,
              bannerImage: data.media.bannerImage,
            }));
            setBannerFileList([
              {
                uid: "-3",
                name: "banner",
                status: "done",
                url: data.media.bannerImage,
              },
            ]);
          }

          if (data?.toolsWithIcons && data.toolsWithIcons.length > 0) {
            setToolsList(data.toolsWithIcons);

            // Create file lists for existing tool icons
            const toolFileLists = {};
            data.toolsWithIcons.forEach((tool, index) => {
              if (tool.icon) {
                toolFileLists[index] = [
                  {
                    uid: `-tool-${index}`,
                    name: `${tool.name}-icon`,
                    status: "done",
                    url: tool.icon,
                  },
                ];
              }
            });
            setToolFileListsMap(toolFileLists);
          } else {
            // Initialize with 3 empty tools if none exist
            setToolsList([
              { name: "", icon: "" },
              { name: "", icon: "" },
              { name: "", icon: "" },
            ]);
          }

          setDataLoaded(true);
        }
      });
    } else {
      if (toolsList.length === 0) {
        setToolsList([
          { name: "", icon: "" },
          { name: "", icon: "" },
          { name: "", icon: "" },
        ]);
      }
    }
  }, [
    params.createInternship,
    userCreds?.orgId,
    dataLoaded,
    dispatch,
    typeCapitalized,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const validateBeforeCrop = (file) => {
    const isAllowed =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";
    if (!isAllowed) {
      message.error("Only JPG/PNG/WebP images are allowed");
      return false;
    }

    // Check file size (max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB");
      return false;
    }

    return true;
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleCustomUpload = async (options, uploadType = "cover") => {
    const { file, onSuccess, onError } = options;
    try {
      const url = await uploadFileToS3({
        file,
        restUrl,
        onUploaded: (s3Url) => {
          setImages((prev) => ({ ...prev, [uploadType + "Image"]: s3Url }));
          // Clear validation error for cover image
          if (uploadType === "cover") {
            validateField("coverImage", s3Url);
          }
        },
      });

      const fileObj = {
        uid: file.uid || String(Date.now()),
        name: file.name,
        status: "done",
        url,
      };

      if (uploadType === "cover") setFileList([fileObj]);
      else if (uploadType === "thumbnail") setThumbnailFileList([fileObj]);
      else if (uploadType === "banner") setBannerFileList([fileObj]);

      onSuccess && onSuccess({ url }, file);
      message.success(`${capitalize(uploadType)} image uploaded successfully`);
    } catch (err) {
      console.error("Upload error:", err);
      message.error(`Failed to upload ${uploadType} image`);
      onError && onError(err);
    }
  };

  const handleSave = async () => {
    setIsValidating(true);

    // Validate form
    const validation = validateForm();

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsValidating(false);

      // Show error message
      message.error("Please fix the validation errors before saving", 5);

      // Scroll to first error
      const firstErrorKey = Object.keys(validation.errors)[0];
      const errorElement = document.querySelector(
        `[data-field="${firstErrorKey}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    const isUpdate =
      params.createInternship?.split("/")?.join("") !==
      `new${type === "workshops" ? "Workshops" : typeCapitalized}`;

    if (isUpdate && originalDataRef.current) {
      // For updates, only send changed values
      const updates = {};

      // Check basic fields
      const basicChanges = getChangedValues(
        originalDataRef.current,
        courseBasic,
        "basic"
      );
      if (basicChanges) {
        Object.assign(updates, basicChanges);
      }

      // Check arrays
      Object.keys(courseArrays).forEach((key) => {
        const originalValue =
          originalDataRef.current[key] ||
          originalDataRef.current.seoMetadata?.[key] ||
          [];
        if (hasChanged(originalValue, courseArrays[key])) {
          updates[key] = courseArrays[key];
        }
      });

      // Check courseIncludes
      if (hasChanged(originalDataRef.current.courseIncludes, courseIncludes)) {
        updates.courseIncludes = courseIncludes;
      }

      // Check pricing
      const pricingWithFinal = {
        ...pricing,
        finalPrice:
          parseFloat(pricing.currentPrice || 0) -
          parseFloat(pricing.couponDiscount || 0),
      };
      if (hasChanged(originalDataRef.current.pricing, pricingWithFinal)) {
        updates.pricing = pricingWithFinal;
      }

      // Check media
      if (hasChanged(originalDataRef.current.media, images)) {
        updates.media = images;
      }
      // Check tools
      if (hasChanged(originalDataRef.current.toolsWithIcons, toolsList)) {
        updates.toolsWithIcons = toolsList;
      }

      // Check SEO
      const seoData = {
        ...seo,
        keywords: courseArrays.keywords,
      };
      if (hasChanged(originalDataRef.current.seoMetadata, seoData)) {
        updates.seoMetadata = seoData;
      }

      // Check visibility
      ["status", "featured", "trending"].forEach((key) => {
        if (hasChanged(originalDataRef.current[key], visibility[key])) {
          updates[key] = visibility[key];
        }
      });

      // Only dispatch if there are actual changes
      if (Object.keys(updates).length > 0) {
        console.log("Sending updates:", updates);
        dispatch(
          updateInternship({
            id: params.createInternship,
            dispatch,
            data: updates,
            message,
          })
        )
          .then(() => {
            message.success(`${typeCapitalized} updated successfully`);
            setIsValidating(false);
            // Update original data ref
            originalDataRef.current = {
              ...originalDataRef.current,
              ...updates,
            };
            setValidationErrors({});
          })
          .catch((err) => {
            message.error(`Failed to update ${type}`);
            setIsValidating(false);
          });
      } else {
        message.info("No changes detected");
        setIsValidating(false);
      }
    } else {
      // For new course, send all data
      const courseData = {
        ...courseBasic,
        ...courseArrays,
        courseIncludes,
        pricing: {
          ...pricing,
          finalPrice:
            parseFloat(pricing.currentPrice || 0) -
            parseFloat(pricing.couponDiscount || 0),
        },
        media: images,
        seoMetadata: {
          ...seo,
          keywords: courseArrays.keywords,
        },
        ...visibility,
        type,
        toolsWithIcons: toolsList,
      };

      dispatch(createCourse(courseData))
        ?.then((resp) => {
          message.success(`${typeCapitalized} created successfully`);
          const id = resp.payload.data.insertedId;
          setIsValidating(false);
          setValidationErrors({});
          nav.replace(`/admin/${type === "workshops" ? "workshops" : type}/${id}`);
        })
        .catch((err) => {
          message.error(`Failed to create ${type}`);
          setIsValidating(false);
        });
    }
  };

  // Helper to display validation error
  const renderFieldError = (fieldName) => {
    if (validationErrors[fieldName]) {
      return (
        <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
          {validationErrors[fieldName]}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={internStyles.container}>
      <div className={internStyles.titleContainer}>
        <div className={internStyles.title}>{typeCapitalized} Details</div>
      </div>

      <div className={internStyles.body}>
        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert
            message="Validation Errors"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: "20px" }}>
                {Object.entries(validationErrors).map(([key, error]) => (
                  <li key={key}>{error}</li>
                ))}
              </ul>
            }
            type="error"
            closable
            onClose={() => setValidationErrors({})}
            style={{ marginBottom: "20px" }}
          />
        )}

        {/* Basic Information Section */}
        <div className={internStyles.sectionHeader}>Basic Information</div>

        <div className={internStyles.internTtle} data-field="title">
          <span>
            {typeCapitalized} Title *{" "}
            <small>(Min 10, Max 150 characters)</small>
          </span>
          <input
            placeholder={`e.g., Complete Python ${typeCapitalized}`}
            value={courseBasic.title}
            onChange={(e) => {
              setCourseBasic((prev) => ({ ...prev, title: e.target.value }));
              validateField("title", e.target.value);
            }}
            onBlur={(e) => validateField("title", e.target.value)}
            style={{
              borderColor: validationErrors.title ? "red" : undefined,
            }}
            maxLength={150}
          />
          <small>{courseBasic.title.length}/150 characters</small>
          {renderFieldError("title")}
        </div>

        <div className={internStyles.internTtle} data-field="subtitle">
          <span>
            Subtitle <small>(Max 200 characters)</small>
          </span>
          <input
            placeholder="e.g., Go from zero to hero in Python"
            value={courseBasic.subtitle}
            onChange={(e) => {
              setCourseBasic((prev) => ({ ...prev, subtitle: e.target.value }));
              validateField("subtitle", e.target.value);
            }}
            style={{
              borderColor: validationErrors.subtitle ? "red" : undefined,
            }}
            maxLength={200}
          />
          <small>{courseBasic.subtitle.length}/200 characters</small>
          {renderFieldError("subtitle")}
        </div>

        <div className={internStyles.desc} data-field="description">
          <div className={internStyles.sd}>
            {typeCapitalized} Description * <small>(Min 100 characters)</small>
          </div>
          <TextEditor
            name="description"
            initialContent={editorInitialContent}
            editorFun={(val) =>
              setCourseBasic((prev) => ({ ...prev, description: val }))
            }
          />
          {renderFieldError("description")}
        </div>

        {/* Category & Classification */}
        <div className={internStyles.sectionHeader}>
          Category & Classification
        </div>

        <div className={internStyles.formRow}>
          <div className={internStyles.formField} data-field="category">
            <label>Category *</label>
            <Select
              placeholder="Select category"
              value={courseBasic.category}
              onChange={(val) => {
                setCourseBasic((prev) => ({ ...prev, category: val }));
                validateField("category", val);
              }}
              style={{
                width: "100%",
                borderColor: validationErrors.category ? "red" : undefined,
              }}
              showSearch
            >
              {categoryOptions.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
            {renderFieldError("category")}
          </div>

          <div className={internStyles.formField}>
            <label>Language</label>
            <Select
              placeholder="Select language"
              value={courseBasic.language}
              onChange={(val) =>
                setCourseBasic((prev) => ({ ...prev, language: val }))
              }
              style={{ width: "100%" }}
            >
              {languageOptions.map((lang) => (
                <Option key={lang} value={lang}>
                  {lang}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className={internStyles.formRow}>
          <div className={internStyles.formField}>
            <label>
              Subcategories <small>(Optional, Max 20)</small>
            </label>
            <Select
              mode="tags"
              placeholder="Add subcategories"
              value={courseArrays.subcategories}
              onChange={(val) =>
                setCourseArrays((prev) => ({ ...prev, subcategories: val }))
              }
              style={{ width: "100%" }}
              tokenSeparators={[","]}
              maxTagCount={20}
            />
          </div>

          <div className={internStyles.formField}>
            <label>
              Tags <small>(Optional, Max 20)</small>
            </label>
            <Select
              mode="tags"
              placeholder="Add tags for SEO"
              value={courseArrays.tags}
              onChange={(val) => {
                if (val.length <= 20) {
                  setCourseArrays((prev) => ({ ...prev, tags: val }));
                } else {
                  message.warning("Maximum 20 tags allowed");
                }
              }}
              style={{ width: "100%" }}
              tokenSeparators={[","]}
              maxTagCount={20}
            />
            {renderFieldError("tags")}
          </div>
        </div>

        {/* Course Details */}
        <div className={internStyles.sectionHeader}>
          {typeCapitalized} Details
        </div>

        <div className={internStyles.formRow}>
          <div className={internStyles.formField} data-field="duration">
            <label>Duration *</label>
            <input
              placeholder="e.g., 4 Months, 12 Weeks"
              value={courseBasic.duration}
              onChange={(e) =>
                setCourseBasic((prev) => ({
                  ...prev,
                  duration: e.target.value,
                }))
              }
              style={{
                borderColor: validationErrors.duration ? "red" : undefined,
              }}
            />
            {renderFieldError("duration")}
          </div>

          <div className={internStyles.formField}>
            <label>Total Video Duration</label>
            <input
              placeholder="e.g., 35 hours"
              value={courseIncludes.videoDuration}
              onChange={(e) =>
                setCourseIncludes((prev) => ({
                  ...prev,
                  videoDuration: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className={internStyles.internTtle}>
          <span>Projects Description</span>
          <input
            placeholder="e.g., 8+ Capstone Projects (Classification, NLP, Time Series)"
            value={courseBasic.projects}
            onChange={(e) =>
              setCourseBasic((prev) => ({ ...prev, projects: e.target.value }))
            }
          />
        </div>

        <div className={internStyles.difficulty}>
          <span>Difficulty Level</span>
          <div>
            <Radio.Group
              value={courseBasic.difficulty}
              onChange={(e) =>
                setCourseBasic((prev) => ({
                  ...prev,
                  difficulty: e.target.value,
                }))
              }
              buttonStyle="solid"
            >
              <Radio.Button value="Beginner">Beginner</Radio.Button>
              <Radio.Button value="Intermediate">Intermediate</Radio.Button>
              <Radio.Button value="Advanced">Advanced</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className={internStyles.sectionHeader}>
          Learning Outcomes & Audience
        </div>

        <div className={internStyles.preQ}>
          <p>Prerequisites</p>
          <div style={{ flex: 1 }}>
            <Select
              mode="tags"
              placeholder="Add prerequisites (press enter to add)"
              value={courseArrays.preRequisites}
              onChange={(val) =>
                setCourseArrays((prev) => ({ ...prev, preRequisites: val }))
              }
              style={{ width: "100%" }}
              tokenSeparators={[","]}
            />
          </div>
        </div>

        <div className={internStyles.preQ} data-field="learningPoints">
          <p>
            Learning Points (What students will learn) *
            <small> (Min 1, Max 50)</small>
          </p>
          <div style={{ flex: 1 }}>
            <Select
              mode="tags"
              placeholder="Add learning outcomes"
              value={courseArrays.learningPoints}
              onChange={(val) => {
                if (val.length <= 50) {
                  setCourseArrays((prev) => ({ ...prev, learningPoints: val }));
                } else {
                  message.warning("Maximum 50 learning points allowed");
                }
              }}
              style={{
                width: "100%",
                borderColor: validationErrors.learningPoints
                  ? "red"
                  : undefined,
              }}
              tokenSeparators={[","]}
            />
            {renderFieldError("learningPoints")}
          </div>
        </div>

        <div className={internStyles.preQ}>
          <p>
            Skills Covered <small>(Max 30)</small>
          </p>
          <div style={{ flex: 1 }}>
            <Select
              mode="tags"
              placeholder="Add skills"
              value={courseArrays.skills}
              onChange={(val) => {
                if (val.length <= 30) {
                  setCourseArrays((prev) => ({ ...prev, skills: val }));
                } else {
                  message.warning("Maximum 30 skills allowed");
                }
              }}
              style={{ width: "100%" }}
              tokenSeparators={[","]}
            />
            {renderFieldError("skills")}
          </div>
        </div>

        <div className={internStyles.preQ}>
          <p>Tools & Technologies</p>
          <div style={{ flex: 1 }}>
            <Select
              mode="tags"
              placeholder="Add tools"
              value={courseArrays.tools}
              onChange={(val) =>
                setCourseArrays((prev) => ({ ...prev, tools: val }))
              }
              style={{ width: "100%" }}
              tokenSeparators={[","]}
            />
          </div>
        </div>

        <div className={internStyles.preQ}>
          <p>Target Audience</p>
          <div style={{ flex: 1 }}>
            <Select
              mode="tags"
              placeholder="e.g., Aspiring Data Scientists, Software Developers"
              value={courseArrays.targetAudience}
              onChange={(val) =>
                setCourseArrays((prev) => ({ ...prev, targetAudience: val }))
              }
              style={{ width: "100%" }}
              tokenSeparators={[","]}
            />
          </div>
        </div>

        {/* Course Includes */}
        <div className={internStyles.sectionHeader}>
          {typeCapitalized} Includes
        </div>

        <div className={internStyles.formRow} data-field="courseIncludes">
          <div className={internStyles.formField}>
            <label>Articles</label>
            <InputNumber
              min={0}
              max={1000}
              value={courseIncludes.articles}
              onChange={(val) =>
                setCourseIncludes((prev) => ({ ...prev, articles: val }))
              }
              style={{ width: "100%" }}
            />
          </div>

          <div className={internStyles.formField}>
            <label>Downloadable Resources</label>
            <InputNumber
              min={0}
              max={1000}
              value={courseIncludes.downloadableResources}
              onChange={(val) =>
                setCourseIncludes((prev) => ({
                  ...prev,
                  downloadableResources: val,
                }))
              }
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className={internStyles.formRow}>
          <div className={internStyles.formField}>
            <label>Coding Exercises</label>
            <InputNumber
              min={0}
              max={1000}
              value={courseIncludes.codingExercises}
              onChange={(val) =>
                setCourseIncludes((prev) => ({ ...prev, codingExercises: val }))
              }
              style={{ width: "100%" }}
            />
          </div>

          <div className={internStyles.formField}>
            <label>Quizzes</label>
            <InputNumber
              min={0}
              max={1000}
              value={courseIncludes.quizzes}
              onChange={(val) =>
                setCourseIncludes((prev) => ({ ...prev, quizzes: val }))
              }
              style={{ width: "100%" }}
            />
          </div>
        </div>
        {renderFieldError("courseIncludes")}

        <div className={internStyles.checkboxGroup}>
          <label className={internStyles.checkboxLabel}>
            <input
              type="checkbox"
              checked={courseIncludes.lifetimeAccess}
              onChange={(e) =>
                setCourseIncludes((prev) => ({
                  ...prev,
                  lifetimeAccess: e.target.checked,
                }))
              }
            />
            <span>Lifetime Access</span>
          </label>

          <label className={internStyles.checkboxLabel}>
            <input
              type="checkbox"
              checked={courseIncludes.certificateOfCompletion}
              onChange={(e) =>
                setCourseIncludes((prev) => ({
                  ...prev,
                  certificateOfCompletion: e.target.checked,
                }))
              }
            />
            <span>Certificate of Completion</span>
          </label>

          <label className={internStyles.checkboxLabel}>
            <input
              type="checkbox"
              checked={courseIncludes.jobAssistance}
              onChange={(e) =>
                setCourseIncludes((prev) => ({
                  ...prev,
                  jobAssistance: e.target.checked,
                }))
              }
            />
            <span>Job Assistance</span>
          </label>
        </div>

        {/* Pricing Section */}
        <div className={internStyles.sectionHeader}>Pricing</div>

        <div className={internStyles.formRow}>
          <div className={internStyles.formField} data-field="currentPrice">
            <label>Current Price *</label>
            <div className={internStyles.priceIn}>
              <span>₹</span>
              <input
                placeholder="699"
                type="number"
                value={pricing.currentPrice}
                onChange={(e) => {
                  setPricing((prev) => ({
                    ...prev,
                    currentPrice: e.target.value,
                  }));
                  validateField("currentPrice", e.target.value);
                }}
                onBlur={(e) => validateField("currentPrice", e.target.value)}
                style={{
                  borderColor: validationErrors.currentPrice
                    ? "red"
                    : undefined,
                }}
              />
            </div>
            {renderFieldError("currentPrice")}
          </div>

          <div className={internStyles.formField} data-field="originalPrice">
            <label>Original Price</label>
            <div className={internStyles.priceIn}>
              <span>₹</span>
              <input
                placeholder="5999"
                type="number"
                value={pricing.originalPrice}
                onChange={(e) =>
                  setPricing((prev) => ({
                    ...prev,
                    originalPrice: e.target.value,
                  }))
                }
                style={{
                  borderColor: validationErrors.originalPrice
                    ? "red"
                    : undefined,
                }}
              />
            </div>
            {renderFieldError("originalPrice")}
          </div>
        </div>

        <div className={internStyles.formRow}>
          <div className={internStyles.formField} data-field="couponCode">
            <label>
              Coupon Code <small>(3-50 chars, alphanumeric)</small>
            </label>
            <input
              placeholder="e.g., DATA_PRO200"
              value={pricing.couponCode}
              onChange={(e) =>
                setPricing((prev) => ({
                  ...prev,
                  couponCode: e.target.value.toUpperCase(),
                }))
              }
              style={{
                borderColor: validationErrors.couponCode ? "red" : undefined,
              }}
              maxLength={50}
            />
            {renderFieldError("couponCode")}
          </div>

          <div className={internStyles.formField} data-field="couponDiscount">
            <label>Coupon Discount (₹)</label>
            <InputNumber
              min={0}
              value={pricing.couponDiscount}
              onChange={(val) =>
                setPricing((prev) => ({ ...prev, couponDiscount: val }))
              }
              style={{
                width: "100%",
                borderColor: validationErrors.couponDiscount
                  ? "red"
                  : undefined,
              }}
              placeholder="200"
            />
            {renderFieldError("couponDiscount")}
          </div>
        </div>

        {pricing.currentPrice && pricing.couponDiscount > 0 && (
          <div className={internStyles.priceSummary}>
            <Tag color="green">
              Final Price: ₹
              {Math.max(
                0,
                parseFloat(pricing.currentPrice || 0) -
                  parseFloat(pricing.couponDiscount || 0)
              )}
            </Tag>
          </div>
        )}

        {/* Media Section */}
        <div className={internStyles.sectionHeader}>Media Assets</div>

        <div
          className={internStyles.coverImage_container}
          data-field="coverImage"
        >
          <div className={internStyles.sd}>
            Cover Image (16:9) * <small>(Max 5MB, JPG/PNG/WebP)</small>
          </div>
          {images.coverImage ? (
            <div className={`${internStyles.previewWrapper} ${internStyles.aspect_16_9}`}>
              <img src={images.coverImage} alt="Cover" />
              <div 
                className={internStyles.removeOverlay}
                onClick={() => {
                  setImages((prev) => ({ ...prev, coverImage: "" }));
                  setFileList([]);
                  validateField("coverImage", "");
                }}
                title="Remove image"
              >
                <DeleteOutlined />
              </div>
              <div className={internStyles.previewLabel}>Click to preview</div>
              <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => handlePreview({ url: images.coverImage })} />
            </div>
          ) : (
            <ImgCrop
              aspect={16 / 9}
              rotate
              zoom
              quality={0.8}
              beforeCrop={validateBeforeCrop}
              cropperProps={{ restrictPosition: false }}
              modalTitle="Edit Cover Image"
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                maxCount={1}
                customRequest={(options) => handleCustomUpload(options, "cover")}
                onChange={({ fileList: fl }) => setFileList(fl)}
                onPreview={handlePreview}
                onRemove={() => {
                  setImages((prev) => ({ ...prev, coverImage: "" }));
                  setFileList([]);
                  validateField("coverImage", "");
                }}
                accept="image/jpeg,image/png,image/webp"
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </ImgCrop>
          )}
          {renderFieldError("coverImage")}
        </div>

        <div className={internStyles.coverImage_container}>
          <div className={internStyles.sd}>
            Thumbnail (1:1) <small>(Max 5MB, JPG/PNG/WebP)</small>
          </div>
          {images.thumbnailImage ? (
            <div className={internStyles.previewWrapper}>
              <img src={images.thumbnailImage} alt="Thumbnail" />
              <div 
                className={internStyles.removeOverlay}
                onClick={() => {
                  setImages((prev) => ({ ...prev, thumbnailImage: "" }));
                  setThumbnailFileList([]);
                }}
                title="Remove image"
              >
                <DeleteOutlined />
              </div>
              <div className={internStyles.previewLabel}>1:1 Thumbnail</div>
              <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => handlePreview({ url: images.thumbnailImage })} />
            </div>
          ) : (
            <ImgCrop
              aspect={1}
              rotate
              zoom
              quality={0.8}
              beforeCrop={validateBeforeCrop}
              cropperProps={{ restrictPosition: false }}
              modalTitle="Edit Thumbnail"
            >
              <Upload
                listType="picture-card"
                fileList={thumbnailFileList}
                maxCount={1}
                customRequest={(options) =>
                  handleCustomUpload(options, "thumbnail")
                }
                onChange={({ fileList: fl }) => setThumbnailFileList(fl)}
                onPreview={handlePreview}
                onRemove={() => {
                  setImages((prev) => ({ ...prev, thumbnailImage: "" }));
                  setThumbnailFileList([]);
                }}
                accept="image/jpeg,image/png,image/webp"
              >
                {thumbnailFileList.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </ImgCrop>
          )}
        </div>

        <div className={internStyles.coverImage_container}>
          <div className={internStyles.sd}>
            Banner Image (21:9) <small>(Max 5MB, JPG/PNG/WebP)</small>
          </div>
          {images.bannerImage ? (
            <div className={`${internStyles.previewWrapper} ${internStyles.aspect_21_9}`}>
              <img src={images.bannerImage} alt="Banner" />
              <div 
                className={internStyles.removeOverlay}
                onClick={() => {
                  setImages((prev) => ({ ...prev, bannerImage: "" }));
                  setBannerFileList([]);
                }}
                title="Remove image"
              >
                <DeleteOutlined />
              </div>
              <div className={internStyles.previewLabel}>21:9 Banner</div>
              <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => handlePreview({ url: images.bannerImage })} />
            </div>
          ) : (
            <ImgCrop
              aspect={21 / 9}
              rotate
              zoom
              quality={0.8}
              beforeCrop={validateBeforeCrop}
              cropperProps={{ restrictPosition: false }}
              modalTitle="Edit Banner"
            >
              <Upload
                listType="picture-card"
                fileList={bannerFileList}
                maxCount={1}
                customRequest={(options) => handleCustomUpload(options, "banner")}
                onChange={({ fileList: fl }) => setBannerFileList(fl)}
                onPreview={handlePreview}
                onRemove={() => {
                  setImages((prev) => ({ ...prev, bannerImage: "" }));
                  setBannerFileList([]);
                }}
                accept="image/jpeg,image/png,image/webp"
              >
                {bannerFileList.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </ImgCrop>
          )}
        </div>
        {/* Tools Covered with Icons */}
        <div className={internStyles.sectionHeader}>
          Tools Covered * <small>(Min 3, Max 20)</small>
        </div>

        <div data-field="tools">
          {toolsList.map((tool, index) => (
            <div
              key={index}
              className={internStyles.toolItem}
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "20px",
                padding: "16px",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Tool Name {index + 1} *
                </label>
                <Input
                  placeholder={`e.g., ${
                    index === 0
                      ? "Python"
                      : index === 1
                      ? "TensorFlow"
                      : "Jupyter Notebook"
                  }`}
                  value={tool.name}
                  onChange={(e) => handleToolNameChange(index, e.target.value)}
                  maxLength={50}
                  showCount
                  style={{
                    borderColor:
                      validationErrors.tools && !tool.name ? "red" : undefined,
                  }}
                />
              </div>

              <div style={{ minWidth: "150px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Tool Icon (1:1)
                </label>
                {tool.icon ? (
                  <div className={internStyles.previewWrapper}>
                    <img src={tool.icon} alt={`${tool.name} icon`} />
                    <div 
                      className={internStyles.removeOverlay}
                      onClick={() => {
                        const newTools = [...toolsList];
                        newTools[index] = { ...newTools[index], icon: "" };
                        setToolsList(newTools);

                        setToolFileListsMap((prev) => {
                          const newMap = { ...prev };
                          delete newMap[index];
                          return newMap;
                        });
                      }}
                      title="Remove icon"
                    >
                      <DeleteOutlined />
                    </div>
                    <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => handlePreview({ url: tool.icon })} />
                  </div>
                ) : (
                  <ImgCrop
                    aspect={1}
                    rotate
                    zoom
                    quality={0.8}
                    beforeCrop={validateBeforeCrop}
                    cropperProps={{ restrictPosition: false }}
                    modalTitle={`Edit ${tool.name || "Tool"} Icon`}
                  >
                    <Upload
                      listType="picture-card"
                      fileList={toolFileListsMap[index] || []}
                      maxCount={1}
                      customRequest={(options) =>
                        handleToolIconUpload(options, index)
                      }
                      onChange={({ fileList: fl }) => {
                        setToolFileListsMap((prev) => ({
                          ...prev,
                          [index]: fl,
                        }));
                      }}
                      onPreview={handlePreview}
                      onRemove={() => {
                        const newTools = [...toolsList];
                        newTools[index] = { ...newTools[index], icon: "" };
                        setToolsList(newTools);

                        setToolFileListsMap((prev) => {
                          const newMap = { ...prev };
                          delete newMap[index];
                          return newMap;
                        });
                      }}
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    >
                      {(toolFileListsMap[index] || []).length >= 1 ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8, fontSize: "12px" }}>
                            Icon
                          </div>
                        </div>
                      )}
                    </Upload>
                  </ImgCrop>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  paddingBottom: "8px",
                }}
              >
                <Button
                  type="text"
                  danger
                  onClick={() => handleRemoveTool(index)}
                  disabled={toolsList.length <= 3}
                  icon={<span>🗑️</span>}
                  title={
                    toolsList.length <= 3
                      ? "Minimum 3 tools required"
                      : "Remove tool"
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {renderFieldError("tools")}

          <Button
            type="dashed"
            onClick={handleAddTool}
            block
            icon={<PlusOutlined />}
            style={{ marginTop: "10px" }}
            disabled={toolsList.length >= 20}
          >
            Add Another Tool {toolsList.length >= 20 ? "(Max 20 reached)" : ""}
          </Button>
        </div>

        <Modal
          open={previewOpen}
          title="Preview"
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>

        {/* SEO Section */}
        <div className={internStyles.sectionHeader}>SEO & Metadata</div>

        <div className={internStyles.internTtle} data-field="metaTitle">
          <span>
            Meta Title <small>(Max 60 characters)</small>
          </span>
          <input
            placeholder="SEO optimized title"
            value={seo.metaTitle}
            onChange={(e) =>
              setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))
            }
            maxLength={60}
            style={{
              borderColor: validationErrors.metaTitle ? "red" : undefined,
            }}
          />
          <small>{seo.metaTitle.length}/60 characters</small>
          {renderFieldError("metaTitle")}
        </div>

        <div className={internStyles.formField} data-field="metaDescription">
          <label>
            Meta Description <small>(Max 160 characters)</small>
          </label>
          <TextArea
            placeholder="SEO meta description"
            value={seo.metaDescription}
            onChange={(e) =>
              setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))
            }
            maxLength={160}
            rows={3}
            showCount
            style={{
              borderColor: validationErrors.metaDescription ? "red" : undefined,
            }}
          />
          {renderFieldError("metaDescription")}
        </div>

        <div className={internStyles.preQ} data-field="keywords">
          <span>
            SEO Keywords <small>(Max 15)</small>
          </span>
          <div style={{ flex: 1 }}>
            <Select
              mode="tags"
              placeholder="Add SEO keywords"
              value={courseArrays.keywords}
              onChange={(val) => {
                if (val.length <= 15) {
                  setCourseArrays((prev) => ({ ...prev, keywords: val }));
                } else {
                  message.warning("Maximum 15 SEO keywords allowed");
                }
              }}
              style={{ width: "100%" }}
              tokenSeparators={[","]}
              maxTagCount="responsive"
              maxTagTextLength={25}
            />
            {renderFieldError("keywords")}
          </div>
        </div>

        {/* Status & Visibility */}
        <div className={internStyles.sectionHeader}>Status & Visibility</div>

        <div className={internStyles.formRow}>
          <div className={internStyles.formField}>
            <label>{typeCapitalized} Status</label>
            <Select
              value={visibility.status}
              onChange={(val) =>
                setVisibility((prev) => ({ ...prev, status: val }))
              }
              style={{ width: "100%" }}
            >
              <Option value="active">Active</Option>
              <Option value="draft">Draft</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </div>

          <div className={internStyles.formField}>
            <div className={internStyles.checkboxGroup}>
              <label className={internStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={visibility.featured}
                  onChange={(e) =>
                    setVisibility((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                />
                <span>Featured {typeCapitalized}</span>
              </label>

              <label className={internStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={visibility.trending}
                  onChange={(e) =>
                    setVisibility((prev) => ({
                      ...prev,
                      trending: e.target.checked,
                    }))
                  }
                />
                <span>Trending {typeCapitalized}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={internStyles.buttonsContainer}>
          <Button type="default" onClick={() => nav.back()}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={isValidating}
            disabled={isValidating}
          >
            {params.createInternship?.split("/")?.join("") !==
            `new${typeCapitalized}`
              ? `Update ${typeCapitalized}`
              : "Save & Continue"}
          </Button>
          <Button
            type="primary"
            onClick={() =>
              nav.replace(
                `/admin/${type}/${params.createInternship}/new${typeCapitalized}`
              )
            }
            disabled={
              params.createInternship?.split("/")?.join("") ===
              `new${typeCapitalized}`
            }
          >
            Next: Add Curriculum
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
