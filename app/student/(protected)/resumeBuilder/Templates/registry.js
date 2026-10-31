"use client";

// Every resume template layout, keyed by the id stored in drafts and in the
// admin template catalogue ("template1" … "template40"). Shared by the resume
// builder and the admin Resume Templates screens so both always list the same
// templates. Adding a template = add its component here; the admin can then
// configure its name, access and price without further code changes.
import dynamic from "next/dynamic";

// Note: "template1" and "template3" intentionally map to each other's files.
const Template1 = dynamic(() => import("./components/Template3"), {
  ssr: false,
});
const Template2 = dynamic(() => import("./components/Template2"), {
  ssr: false,
});
const Template3 = dynamic(() => import("./components/Template1"), {
  ssr: false,
});
const Template4 = dynamic(() => import("./components/Template4"), {
  ssr: false,
});
const Template5 = dynamic(() => import("./components/Template5"), {
  ssr: false,
});
const Template6 = dynamic(() => import("./components/Template6"), {
  ssr: false,
});
const Template7 = dynamic(() => import("./components/Template7"), {
  ssr: false,
});
const Template8 = dynamic(() => import("./components/Template8"), {
  ssr: false,
}); const Template9 = dynamic(() => import("./components/Template9"), {
  ssr: false,
});
const Template10 = dynamic(() => import("./components/Template10"), {
  ssr: false,
}); const Template11 = dynamic(() => import("./components/Template11"), {
  ssr: false,
}); const Template12 = dynamic(() => import("./components/Template12"), {
  ssr: false,
}); const Template13 = dynamic(() => import("./components/Template13"), {
  ssr: false,
}); const Template14 = dynamic(() => import("./components/Template14"), {
  ssr: false,
}); const Template15 = dynamic(() => import("./components/Template15"), {
  ssr: false,
}); const Template16 = dynamic(() => import("./components/Template16"), {
  ssr: false,
}); const Template17 = dynamic(() => import("./components/Template17"), {
  ssr: false,
}); const Template18 = dynamic(() => import("./components/Template18"), {
  ssr: false,
}); const Template19 = dynamic(() => import("./components/Template19"), {
  ssr: false,
}); const Template20 = dynamic(() => import("./components/Template20"), {
  ssr: false,
});
const Template21 = dynamic(() => import("./components/Template21"), {
  ssr: false,
});
const Template22 = dynamic(() => import("./components/Template22"), {
  ssr: false,
});
const Template23 = dynamic(() => import("./components/Template23"), {
  ssr: false,
});
const Template24 = dynamic(() => import("./components/Template24"), {
  ssr: false,
});
const Template25 = dynamic(() => import("./components/Template25"), {
  ssr: false,
});
const Template26 = dynamic(() => import("./components/Template26"), {
  ssr: false,
});
const Template27 = dynamic(() => import("./components/Template27"), {
  ssr: false,
});
const Template28 = dynamic(() => import("./components/Template28"), {
  ssr: false,
});
const Template29 = dynamic(() => import("./components/Template29"), {
  ssr: false,
});
const Template30 = dynamic(() => import("./components/Template30"), {
  ssr: false,
});
const Template31 = dynamic(() => import("./components/Template31"), {
  ssr: false,
});
const Template32 = dynamic(() => import("./components/Template32"), {
  ssr: false,
});
const Template33 = dynamic(() => import("./components/Template33"), {
  ssr: false,
});
const Template34 = dynamic(() => import("./components/Template34"), {
  ssr: false,
});
const Template35 = dynamic(() => import("./components/Template35"), {
  ssr: false,
});
const Template36 = dynamic(() => import("./components/Template36"), {
  ssr: false,
});
const Template37 = dynamic(() => import("./components/Template37"), {
  ssr: false,
});
const Template38 = dynamic(() => import("./components/Template38"), {
  ssr: false,
});
const Template39 = dynamic(() => import("./components/Template39"), {
  ssr: false,
});
const Template40 = dynamic(() => import("./components/Template40"), {
  ssr: false,
});
const Template41 = dynamic(() => import("./components/Template41"), {
  ssr: false,
});
const Template42 = dynamic(() => import("./components/Template42"), {
  ssr: false,
});
const Template43 = dynamic(() => import("./components/Template43"), {
  ssr: false,
});
const Template44 = dynamic(() => import("./components/Template44"), {
  ssr: false,
});
const Template45 = dynamic(() => import("./components/Template45"), {
  ssr: false,
});
const Template46 = dynamic(() => import("./components/Template46"), {
  ssr: false,
});
const Template47 = dynamic(() => import("./components/Template47"), {
  ssr: false,
});
const Template48 = dynamic(() => import("./components/Template48"), {
  ssr: false,
});
const Template49 = dynamic(() => import("./components/Template49"), {
  ssr: false,
});
const Template50 = dynamic(() => import("./components/Template50"), {
  ssr: false,
});

// Default display details for each template. The admin can override any of
// these from Admin → Resume Templates; these apply until they do.
export const TEMPLATE_CATEGORIES = ["Simple", "Professional", "Modern", "Creative", "ATS-Friendly"];

export const TEMPLATE_OPTIONS = [
  {
    id: "template1",
    label: "Bento Cards",
    category: "Modern",
    description: "Each section sits in its own soft card under a bold blue name header — tidy and easy to scan.",
    summary: "Each section sits in its own soft card under a bold blue name header — tidy and easy to scan.",
    bestFor: ["Software Engineers", "Product Roles", "Freshers"],
    features: ["Card layout", "Colour themes", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template2",
    label: "Azure Header",
    category: "Modern",
    description: "A full-width blue header with a slim skills sidebar and a roomy area for experience.",
    summary: "A full-width blue header with a slim skills sidebar and a roomy area for experience.",
    bestFor: ["Developers", "IT Professionals", "Analysts"],
    features: ["Colour header", "Sidebar", "Colour themes", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template3",
    label: "Forest Sidebar",
    category: "Professional",
    description: "A deep green sidebar for contact and skills beside a clean, serif-accented main column.",
    summary: "A deep green sidebar for contact and skills beside a clean, serif-accented main column.",
    bestFor: ["Consultants", "Finance", "Operations"],
    features: ["Dark sidebar", "Skill bars", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template4",
    label: "Navy Executive",
    category: "Professional",
    description: "A navy sidebar and crisp blue headings that read as confident and senior.",
    summary: "A navy sidebar and crisp blue headings that read as confident and senior.",
    bestFor: ["Managers", "Team Leads", "Executives"],
    features: ["Dark sidebar", "Colour themes", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template5",
    label: "Classic Minimal",
    category: "Simple",
    description: "A quiet single-column layout with thin dividers that lets your content do the talking.",
    summary: "A quiet single-column layout with thin dividers that lets your content do the talking.",
    bestFor: ["Freshers", "Internships", "Any role"],
    features: ["ATS-friendly", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template6",
    label: "Midnight Profile",
    category: "Modern",
    description: "A dark sidebar with a round profile badge and teal section accents.",
    summary: "A dark sidebar with a round profile badge and teal section accents.",
    bestFor: ["Developers", "Designers", "Tech Roles"],
    features: ["Dark sidebar", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template7",
    label: "Heritage Classic",
    category: "Professional",
    description: "A centred serif name with traditional uppercase headings — the timeless recruiter favourite.",
    summary: "A centred serif name with traditional uppercase headings — the timeless recruiter favourite.",
    bestFor: ["Law", "Finance", "Government"],
    features: ["Serif type", "ATS-friendly", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template8",
    label: "Crisp Blue",
    category: "Simple",
    description: "Single column with blue icon headings and a compact two-column footer for education and skills.",
    summary: "Single column with blue icon headings and a compact two-column footer for education and skills.",
    bestFor: ["Freshers", "Campus Hiring", "Engineers"],
    features: ["Icon headings", "ATS-friendly", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template9",
    label: "Bold Split",
    category: "Creative",
    description: "An oversized stacked name and a strong rule that splits the page into two confident columns.",
    summary: "An oversized stacked name and a strong rule that splits the page into two confident columns.",
    bestFor: ["Designers", "Marketers", "Content Creators"],
    features: ["Bold type", "Two-column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 2,
  },
  {
    id: "template10",
    label: "Timeline Blue",
    category: "Simple",
    description: "Blue timeline dots walk recruiters through your experience in order.",
    summary: "Blue timeline dots walk recruiters through your experience in order.",
    bestFor: ["Engineers", "Analysts", "Early Career"],
    features: ["Timeline", "ATS-friendly", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template11",
    label: "Snapshot",
    category: "Simple",
    description: "A compact single column with a small photo beside your name — fits a lot on one page.",
    summary: "A compact single column with a small photo beside your name — fits a lot on one page.",
    bestFor: ["Freshers", "Internships", "Customer Roles"],
    features: ["Compact", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template12",
    label: "Serene Centered",
    category: "Simple",
    description: "A light, centred header and airy spacing for a calm, elegant read.",
    summary: "A light, centred header and airy spacing for a calm, elegant read.",
    bestFor: ["Teachers", "HR", "Administration"],
    features: ["Centred header", "ATS-friendly", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template13",
    label: "Crimson Photo",
    category: "Modern",
    description: "A profile photo with crimson headings and a two-column lower section.",
    summary: "A profile photo with crimson headings and a two-column lower section.",
    bestFor: ["Sales", "Marketing", "Hospitality"],
    features: ["Accent colour", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template14",
    label: "Editorial Amber",
    category: "Creative",
    description: "Magazine-style serif type on warm cream with amber highlights and a photo.",
    summary: "Magazine-style serif type on warm cream with amber highlights and a photo.",
    bestFor: ["Writers", "Media", "Communications"],
    features: ["Serif type", "Warm tones", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template15",
    label: "Noir Band",
    category: "Modern",
    description: "A dramatic dark band across the top sets off a clean content area below.",
    summary: "A dramatic dark band across the top sets off a clean content area below.",
    bestFor: ["Developers", "Startups", "Creative Tech"],
    features: ["Dark header", "Two-column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 2,
  },
  {
    id: "template16",
    label: "Peach Profile",
    category: "Creative",
    description: "A soft peach header with your photo and warm orange accents.",
    summary: "A soft peach header with your photo and warm orange accents.",
    bestFor: ["Design", "Hospitality", "Customer Success"],
    features: ["Warm tones", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template17",
    label: "Scholar Serif",
    category: "Professional",
    description: "Academic serif styling with strong ruled headings and a photo — great for detailed histories.",
    summary: "Academic serif styling with strong ruled headings and a photo — great for detailed histories.",
    bestFor: ["Research", "Academia", "Teaching"],
    features: ["Serif type", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template18",
    label: "Ruby Compact",
    category: "Modern",
    description: "A dense two-column layout with a photo and ruby accents — fits a lot without feeling crowded.",
    summary: "A dense two-column layout with a photo and ruby accents — fits a lot without feeling crowded.",
    bestFor: ["Experienced Hires", "Consultants", "Sales"],
    features: ["Compact", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template19",
    label: "Royal Centered",
    category: "Professional",
    description: "A centred blue name, photo and labelled sections for a polished, formal look.",
    summary: "A centred blue name, photo and labelled sections for a polished, formal look.",
    bestFor: ["Managers", "Banking", "Corporate Roles"],
    features: ["Centred header", "Colour themes", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template20",
    label: "Lavender Cards",
    category: "Creative",
    description: "Rounded cards on a soft grey page with lavender skill tags and a centred photo header.",
    summary: "Rounded cards on a soft grey page with lavender skill tags and a centred photo header.",
    bestFor: ["Designers", "UX", "Product"],
    features: ["Card layout", "Colour themes", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template21",
    label: "Plum Sidebar",
    category: "Creative",
    description: "A rich plum sidebar with your photo, contact details and skills.",
    summary: "A rich plum sidebar with your photo, contact details and skills.",
    bestFor: ["Marketing", "Creative Roles", "HR"],
    features: ["Dark sidebar", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template22",
    label: "Ivory Classic",
    category: "Professional",
    description: "Centred serif headings on warm ivory — classic, calm and highly readable.",
    summary: "Centred serif headings on warm ivory — classic, calm and highly readable.",
    bestFor: ["Law", "Administration", "Education"],
    features: ["Serif type", "ATS-friendly", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template23",
    label: "Sapphire Banner",
    category: "Modern",
    description: "A bold sapphire banner with your photo and a skills column on the right.",
    summary: "A bold sapphire banner with your photo and a skills column on the right.",
    bestFor: ["Developers", "Analysts", "Engineers"],
    features: ["Colour header", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template24",
    label: "ATS Plain",
    category: "ATS-Friendly",
    description: "Plain text, standard headings and no graphics — built to pass applicant tracking systems.",
    summary: "Plain text, standard headings and no graphics — built to pass applicant tracking systems.",
    bestFor: ["Any role", "Mass Recruiters", "Online Applications"],
    features: ["ATS-friendly", "No graphics", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template25",
    label: "Slate Minimal",
    category: "Simple",
    description: "A light grey sidebar and generous white space for a clean, modern minimal resume.",
    summary: "A light grey sidebar and generous white space for a clean, modern minimal resume.",
    bestFor: ["Freshers", "Engineers", "Analysts"],
    features: ["Light sidebar", "Minimal", "Two-column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 2,
  },
  {
    id: "template26",
    label: "Cobalt Sidebar",
    category: "Modern",
    description: "A vivid cobalt sidebar with your photo and blue section headings.",
    summary: "A vivid cobalt sidebar with your photo and blue section headings.",
    bestFor: ["Developers", "IT Support", "Tech Sales"],
    features: ["Colour sidebar", "Colour themes", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template27",
    label: "Framed Teal",
    category: "Modern",
    description: "A teal frame and header card with your photo give the page a finished, premium feel.",
    summary: "A teal frame and header card with your photo give the page a finished, premium feel.",
    bestFor: ["Product", "Consulting", "Business Roles"],
    features: ["Framed page", "Colour themes", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template28",
    label: "Skyline",
    category: "Professional",
    description: "A sky-blue top rule, photo header and light sidebar — balanced and businesslike.",
    summary: "A sky-blue top rule, photo header and light sidebar — balanced and businesslike.",
    bestFor: ["Managers", "Engineers", "Operations"],
    features: ["Sidebar", "Colour themes", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template29",
    label: "Ocean Card",
    category: "Modern",
    description: "A rounded ocean-blue header card with your photo and sections laid out as cards.",
    summary: "A rounded ocean-blue header card with your photo and sections laid out as cards.",
    bestFor: ["Developers", "Freshers", "Tech Roles"],
    features: ["Card layout", "Colour themes", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template30",
    label: "Midnight Header",
    category: "Professional",
    description: "A navy header with your photo above a clean single-column body.",
    summary: "A navy header with your photo above a clean single-column body.",
    bestFor: ["Managers", "Finance", "Corporate Roles"],
    features: ["Dark header", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template31",
    label: "Centered Spotlight",
    category: "Simple",
    description: "Your photo and name centred at the top with centred headings throughout.",
    summary: "Your photo and name centred at the top with centred headings throughout.",
    bestFor: ["Freshers", "Customer Roles", "Teaching"],
    features: ["Centred header", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template32",
    label: "Indigo Rail",
    category: "Creative",
    description: "A slim indigo icon rail down the left edge adds character without taking space.",
    summary: "A slim indigo icon rail down the left edge adds character without taking space.",
    bestFor: ["Designers", "Developers", "Startups"],
    features: ["Icon rail", "Colour themes", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template33",
    label: "Skill Spotlight",
    category: "Modern",
    description: "Your key skills appear as blue pills right under your name — ideal when skills matter most.",
    summary: "Your key skills appear as blue pills right under your name — ideal when skills matter most.",
    bestFor: ["Developers", "Data Roles", "Engineers"],
    features: ["Skill pills", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template34",
    label: "Compact Duo",
    category: "Professional",
    description: "A tight two-column layout that fits a lot of experience on one page.",
    summary: "A tight two-column layout that fits a lot of experience on one page.",
    bestFor: ["Experienced Hires", "Engineers", "Consultants"],
    features: ["Compact", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template35",
    label: "Graphite Skills",
    category: "Creative",
    description: "A charcoal sidebar with skill-level bars and a clean white main column.",
    summary: "A charcoal sidebar with skill-level bars and a clean white main column.",
    bestFor: ["Developers", "Designers", "Technical Roles"],
    features: ["Dark sidebar", "Skill bars", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template36",
    label: "One-Page Pro",
    category: "ATS-Friendly",
    description: "Dense, text-first layout that keeps everything on one page and reads cleanly in ATS.",
    summary: "Dense, text-first layout that keeps everything on one page and reads cleanly in ATS.",
    bestFor: ["Experienced Hires", "Online Applications", "Any role"],
    features: ["ATS-friendly", "Compact", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template37",
    label: "Coral Pop",
    category: "Creative",
    description: "Playful coral shapes and pill-shaped skills for a friendly, memorable resume.",
    summary: "Playful coral shapes and pill-shaped skills for a friendly, memorable resume.",
    bestFor: ["Marketing", "Design", "Social Media"],
    features: ["Decorative", "Colour themes", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template38",
    label: "Parchment Elegant",
    category: "Professional",
    description: "Centred uppercase serif headings on parchment — refined and elegant.",
    summary: "Centred uppercase serif headings on parchment — refined and elegant.",
    bestFor: ["Law", "Hospitality", "Senior Roles"],
    features: ["Serif type", "Centred header", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template39",
    label: "Night Mode",
    category: "Creative",
    description: "A full dark theme with bright green accents that stands out in any pile.",
    summary: "A full dark theme with bright green accents that stands out in any pile.",
    bestFor: ["Developers", "Gaming", "Creative Tech"],
    features: ["Dark theme", "Colour themes", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template40",
    label: "Impact Stats",
    category: "Creative",
    description: "Headline numbers (years, projects, skills) at the top show your impact at a glance.",
    summary: "Headline numbers (years, projects, skills) at the top show your impact at a glance.",
    bestFor: ["Sales", "Product", "Achievers"],
    features: ["Stats row", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template41",
    label: "Metro Split",
    category: "Modern",
    description: "A pale teal sidebar with your photo, contact details and skill chips beside a roomy main column.",
    summary: "A pale teal sidebar with your photo, contact details and skill chips beside a roomy main column.",
    bestFor: ["Developers", "Analysts", "Product Roles"],
    features: ["Light sidebar", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template42",
    label: "Harvard Classic",
    category: "ATS-Friendly",
    description: "The classic career-office format: centred serif name, ruled headings and education first — clean for any ATS.",
    summary: "The classic career-office format: centred serif name, ruled headings and education first — clean for any ATS.",
    bestFor: ["Freshers", "Campus Placements", "Higher Studies"],
    features: ["ATS-friendly", "Serif type", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template43",
    label: "Gradient Hero",
    category: "Modern",
    description: "A bold violet-to-pink hero header with your photo, and a two-column body with a tinted skills panel.",
    summary: "A bold violet-to-pink hero header with your photo, and a two-column body with a tinted skills panel.",
    bestFor: ["Designers", "Marketing", "Startups"],
    features: ["Gradient header", "Two-column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 2,
  },
  {
    id: "template44",
    label: "Executive Gold",
    category: "Professional",
    description: "Charcoal and gold with a large serif name and a core-competencies column — made for senior profiles.",
    summary: "Charcoal and gold with a large serif name and a core-competencies column — made for senior profiles.",
    bestFor: ["Managers", "Senior Leaders", "Consultants"],
    features: ["Serif type", "Elegant", "Two-column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 2,
  },
  {
    id: "template45",
    label: "Tech Terminal",
    category: "Modern",
    description: "A code-editor look: terminal header, // section comments and your tech stack as tags.",
    summary: "A code-editor look: terminal header, // section comments and your tech stack as tags.",
    bestFor: ["Software Engineers", "Developers", "Data Engineers"],
    features: ["Dark header", "Skill tags", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template46",
    label: "Fresh Graduate",
    category: "Simple",
    description: "Education and projects come first with a clear skills grid — ideal for students and freshers.",
    summary: "Education and projects come first with a clear skills grid — ideal for students and freshers.",
    bestFor: ["Freshers", "Internships", "Campus Hiring"],
    features: ["ATS-friendly", "Skills grid", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template47",
    label: "Timeline Pro",
    category: "Modern",
    description: "Your career as one continuous timeline, with dates in a gutter and a photo in the header.",
    summary: "Your career as one continuous timeline, with dates in a gutter and a photo in the header.",
    bestFor: ["Experienced Hires", "Engineers", "Project Managers"],
    features: ["Timeline", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template48",
    label: "Swiss Grid",
    category: "Simple",
    description: "International minimalism: section labels on the left, content on the right, hairline rules and lots of white space.",
    summary: "International minimalism: section labels on the left, content on the right, hairline rules and lots of white space.",
    bestFor: ["Designers", "Architects", "Consultants"],
    features: ["Grid layout", "Minimal", "Single column"],
    // Measured from the rendered layout on a desktop screen.
    photo: false,
    columns: 1,
  },
  {
    id: "template49",
    label: "Corporate Banner",
    category: "Modern",
    description: "A navy banner with your photo, a contact strip and a three-column key-skills checklist.",
    summary: "A navy banner with your photo, a contact strip and a three-column key-skills checklist.",
    bestFor: ["Managers", "Sales", "Business Roles"],
    features: ["Colour header", "Skills grid", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
  {
    id: "template50",
    label: "Impact Wave",
    category: "Modern",
    description: "A warm orange wave header, headline numbers from your profile and achievements as highlight cards.",
    summary: "A warm orange wave header, headline numbers from your profile and achievements as highlight cards.",
    bestFor: ["Sales", "Product", "Achievers"],
    features: ["Stats row", "Colour header", "Single column", "Photo"],
    // Measured from the rendered layout on a desktop screen.
    photo: true,
    columns: 1,
  },
];

export const getTemplateCategory = (id) =>
  TEMPLATE_OPTIONS.find((t) => t.id === id)?.category || "Modern";

export const templateSupportsPhoto = (id) =>
  Boolean(TEMPLATE_OPTIONS.find((t) => t.id === id)?.photo);

export const templateComponents = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template5: Template5,
  template6: Template6,
  template7: Template7,
  template8: Template8,
  template9: Template9,
  template10: Template10,
  template11: Template11,
  template12: Template12,
  template13: Template13,
  template14: Template14,
  template15: Template15,
  template16: Template16,
  template17: Template17,
  template18: Template18,
  template19: Template19,
  template20: Template20,
  template21: Template21,
  template22: Template22,
  template23: Template23,
  template24: Template24,
  template25: Template25,
  template26: Template26,
  template27: Template27,
  template28: Template28,
  template29: Template29,
  template30: Template30,
  template31: Template31,
  template32: Template32,
  template33: Template33,
  template34: Template34,
  template35: Template35,
  template36: Template36,
  template37: Template37,
  template38: Template38,
  template39: Template39,
  template40: Template40,
  template41: Template41,
  template42: Template42,
  template43: Template43,
  template44: Template44,
  template45: Template45,
  template46: Template46,
  template47: Template47,
  template48: Template48,
  template49: Template49,
  template50: Template50,
};
