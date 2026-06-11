export const data = [
  {
    title: "Html- Css - Independent Project",
    description:
      "To develop a full-stack Razorpay website with authentication and payment integration, start by initializing the project directory using npm or yarn. Install essential backend packages such as express for setting up the server, bcrypt for password hashing, jsonwebtoken (JWT) for authentication, and the Razorpay SDK for handling payments. Set up the backend using Express, configuring middleware for parsing JSON, handling sessions, and managing cross-origin requests (CORS). Create necessary routes for user registration, login, and payment processing. For user authentication, implement password hashing using bcrypt and issue JWT tokens upon successful login to maintain secure sessions.",
    skills: ["Html", "Css", "JavaScript"],
    preRequisites: ["Basic knowledge of JavaScript"],
    noOfTasks: 4,
    difficulty: "Beginner",
    duration: "4 days",
   sections : [
      {
       title: "Day 1: Project Setup ",
        topics: [
          {
            title: "Project Introduction",
            task: "<p><span style=\"color: #0C58B6;background-color: transparent;font-size: 20pt;font-family: Arial;\"><strong>Project Title</strong></span><span style=\"color: rgb(0,0,0);background-color: transparent;font-size: 20pt;font-family: Arial;\"> - </span><span style=\"color: rgb(0,0,0);background-color: transparent;font-size: 11pt;font-family: Arial;\">Razorpay clone using HTML and CSS</span></p>\n<p><span style=\"color: #0C58B6;background-color: transparent;font-size: 20pt;font-family: Arial;\"><strong>Objective</strong></span><span style=\"color: rgb(0,0,0);background-color: transparent;font-size: 20pt;font-family: Arial;\"> - </span><span style=\"color: rgb(0,0,0);background-color: transparent;font-size: 11pt;font-family: Arial;\">To build a static version of the Razorpay website’s homepage using HTML &amp; CSS.</span></p>\n<p><span style=\"color: #0C58B6;background-color: transparent;font-size: 20pt;font-family: Arial;\"><strong>Project Context</strong></span><span style=\"color: rgb(0,0,0);background-color: transparent;font-size: 20pt;font-family: Arial;\"> - </span><span style=\"color: rgb(0,0,0);background-color: transparent;font-size: 11pt;font-family: Arial;\">The world is changing rapidly. Even for the simplest search and smallest needs, the customer knows that they can use the internet and get what they want in seconds from the comfort of their place. They do not go to any physical location to buy clothing or book a ticket.Payment gateway is a network through which  customers transfer funds to sellers. Payment gateways allow businesses to keep up with the constantly changing world, rapidly changing methods of doing business, and innovations in customer behavior.</span><span style=\"font-family: Arial;\"><br> </span></p>\n",
          },
          {
            title: "Banner",
            task: "<p style=\"text-align:justify;\"><span style=\"color:  #0C58B6;font-family: Arial;\"><strong>Task Objective : </strong></span><span style=\"font-family: Arial;\">To build a banner that includes an image, heading, paragraph and button.</span></p>\n<p><span style=\"color:  #0C58B6;font-family: Arial;\"><strong>Task Interface :</strong></span><span style=\"font-family: Arial;\"> </span></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395198/independent%20projects/razor/banner_k2rflf.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p><span style=\"color:  #0C58B6;font-family: Arial;\"><strong>Task Description :  </strong></span></p>\n<ul>\n<li><span style=\"font-family: Arial;\"><strong>Create a container element :</strong> Start by creating a container element, to hold the banner content. You can give it a class or an ID for easy targeting in CSS.</span></li>\n<li><span style=\"font-family: Arial;\"><strong>Set the background : </strong>Provide a solid background color for the container element (that is close enough to the color used in the task interface). Add padding to the container element to accommodate space between the content and the edges. You can use the clip-path property to attain the irregular shape for the container element.</span></li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689249839/independent%20projects/razor/banner1_pq9gdp.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<ul>\n<li><span style=\"font-family: Arial;\"><strong>Define the layout : </strong>Divide the container into two columns using the CSS grid or flex property. Position the elements vertically at the center of the container element.</span></li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689249839/independent%20projects/razor/banner2_nub7z6.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<ul>\n<li><span style=\"font-family: Arial;\"><strong>Create the first column :</strong> Inside the container, create the first column for the heading, description, and sign-up button. You can use HTML elements like &lt;h1&gt; for the heading, &lt;p&gt; for the description, and &lt;button&gt; for the sign-up button. Do not miss the small horizontal line below the heading element.</span></li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689250528/independent%20projects/razor/banner6.jpg_feihuq.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<ul>\n<li><span style=\"color: rgb(0,0,0);font-size: medium;font-family: Arial;\"><strong>Style the first column :</strong> Use text properties like text alignment, color, and font size to style the content in the first column. You can use margins along the y-axis to provide space in between the elements.</span></li>\n<li><span style=\"color: rgb(0,0,0);font-size: medium;font-family: Arial;\"><strong>Create the second column :</strong> Using the `&lt;img&gt;` tag, add the banner image and specify the source attribute (`src`) to link the image file. Also specify alternate text attribute (`alt`) for the image tag.</span>&nbsp;</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689249839/independent%20projects/razor/banner3_eyachc.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<ul>\n<li><span style=\"font-family: Arial;\"><strong>Style the second column :</strong> Add height or width properties to the image to confine it to the height of the container element. Add padding, if required, to accommodate space between the image and the edges of the container element.</span></li>\n<li><span style=\"font-family: Arial;\"><strong>Apply responsive design :</strong> Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the banner elements using relative units. At medium screen size: the banner should contain two columns of equal width (keeping all remaining constant). In smaller screens: the contents of the banner should be horizontally aligned to the center. And the banner should contain only one column. All the elements should be a part of this single column – heading, paragraph, button and the image (from the second column).</span></li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689249839/independent%20projects/razor/banner4_z3ns0j.png\" alt=\"undefined\" style=\"height: auto;width: 250px\"/>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689249839/independent%20projects/razor/banner5.jpg_mnpsrc.png\" alt=\"undefined\" style=\"height: auto;width: 200px\"/>\n<ul>\n<li><span style=\"font-family: Arial;\"><strong>Test and refine : </strong>Test the banner across different browsers and devices, making adjustments as needed to ensure consistent rendering.  </span></li>\n</ul>\n",
          },
          {
            title: "Header",
            task: "<p><span style=\"color:  #0C58B6;\"><strong>Task Objective : </strong></span>To create a responsive header component with a logo, navigation links and signup button.</p>\n<p><span style=\"color:  #0C58B6;font-size: medium;font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif;\"><strong>Task Interface :</strong></span></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395198/independent%20projects/razor/HEADER_q9hiee.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Description :</strong></span></p>\n<ul>\n<li><strong>Create a container element :</strong> Start by creating a container element.</li>\n<li><strong>Set the background : </strong>Provide a solid background color for the container element (that is close enough to the color used in the task interface). Add padding to the container element to accommodate space between the content and the edges.&nbsp;</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689317601/independent%20projects/razor/header1_bz11fw.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Create a section element : </strong>Create a child element to the container to hold the header content. Provide a maximum width to the section element to avoid distortion after a specific screen width.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689317600/independent%20projects/razor/header2_ybcsg0.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Define the layout : </strong>Arrange the header elements – logo, navigation menu, image and two buttons – in two columns using the CSS grid or flex properties. Position the vertically at the center of the container element and space them along the horizontal axis.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689317601/independent%20projects/razor/header3_fihhcy.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Add a logo : </strong>In the first column, using the `&lt;img&gt;` tag, add the Razorpay logo and specify the source attribute (`src`) to link the image file.</li>\n<li><strong>Style the logo : </strong>Add height or width properties to the image to confine it to the height of the container element.</li>\n<li><strong>Create a navigation menu : </strong>Create a navigation menu within the header container. You can use an unordered list (`&lt;ul&gt;`) and list items (`&lt;li&gt;`) to represent the menu items.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689317600/independent%20projects/razor/header4_nliniy.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Style the navigation menu : </strong>To style the navigation menu, you can use the CSS flex property and list style properties. Add hover effects to the menu items, so users can understand that the list items can be used to navigate to different pages of sections. If you are using hyperlinks for the navigation menu items, do not forget to change the color of the text and remove the underline property for the hyperlinks.</li>\n<li><strong>Add other header elements : </strong>In the second column, add an image of the Indian flag and resize it using the width property. You can leave height property as auto to maintain aspect ratio. Add the last two buttons - “Log in” and “Sign Up”. The “Sign up” button also consists of an icon. This is where you can use ion-icons (make sure that you have added the script tags for using the ion-icons).</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689317600/independent%20projects/razor/header5_qnfzsw.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Style the button elements : </strong>Provide background color to the buttons as shown in the task interface. Use other styling properties, like border and padding to match them with the interface.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the header elements. At medium screen size : the header should only consist of the logo, the “log in” button and a “Sign up” button. For smaller screens : only the logo and “Sign up” button should be visible.</li>\n</ul>\n<p><em>For medium screens (tablets, small screen laptops): </em></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689317600/independent%20projects/razor/header6_wdueu2.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p><em>For smaller screens (mobiles, portrait in tablets) : </em></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689317601/independent%20projects/razor/header7_voih2i.png\" alt=\"undefined\" style=\"height: auto;width: 250px\"/>\n<ul>\n<li><strong>Test and refine : </strong>Test the header across different browsers and devices, making adjustments as needed to ensure consistent rendering.&nbsp;&nbsp;</li>\n</ul>\n",
          },
        ],
      },
      {
       title: "Day 2: Project Description",
        topics: [
          {
            title: "Project Description",
            task:"<p style=\"text-align:justify;\"><span style=\"color:  #0C58B6;\"><strong>Project Description : </strong></span></p>\n<p>We will build the web page one component at a time. All the components are described in detail. Each component description will contain the following sections :</p>\n<ol>\n<li><strong>Component objective : </strong>that describes the component you will be building in one line.&nbsp;</li>\n<li><strong>Component interface : </strong>an image depicting the User Interface of the component.</li>\n<li><strong>Component description : </strong>this section will provide a pictorial representation of the HTML structure you will need to build the component and will breifly describe the corresponding CSS properties to achieve the desired appearance.</li>\n</ol>\n<p><strong><em>Note : </em></strong><em>Before going into the component descriptions, it is recommended that you build the component yourself with the help of the task interfaces and then use the component descriptions as reference for any clarifications. </em></p>\n<p>In order to complete the project, you must build 10 components, starting with the header component, banner component, sign up components, and so on. The following image represents the components of the homepage :</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395201/independent%20projects/razor/Cmponent_tasks_iz6abz.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p>&nbsp;&nbsp;</p>\n",
          },
          {
            title: "How to Get Started ?",
            task: "<p><span style=\"color:  #0C58B6;\"><strong>Step 1 : </strong></span><strong>Create a new folder : </strong>Start by creating a new folder on your computer. This folder will serve as the root directory for your web page project. Give it a descriptive name, such as \"<em>MyWebPage</em>\", or as desired.</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Step 2 : </strong></span><strong>Open a text editor : </strong>Open a text editor of your choice. You can use simple text editors like Notepad (Windows) or TextEdit (Mac), or more advanced editors like <em>Visual Studio Code</em> (like we discussed throughout the course).</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Step 3 : </strong></span><strong>Create an HTML file : </strong>In your text editor, create a new file within the root directory and save it with a \"<em>.html</em>\" extension. For example, you can name it \"<em>index.html</em>\". This file will serve as the main HTML file for your web<br>page.&nbsp;</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Step 4 : </strong></span><strong>Set up the HTML structure : </strong>Inside the HTML file, start by adding the basic structure of an HTML document. You can use the shortcut : “<em>Shift + 1</em>” followed by “<em>Enter</em>” to create the structure. In the <em>&lt;head&gt; </em>section include the title of your web page and a link to an external CSS file called \"<em>styles.css</em>\" (which we'll create in the next step). The actual content of your web page will go inside the <em>&lt;body&gt; </em>section.</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Step 5 : </strong></span><strong>Create a CSS file : </strong>In your text editor, create another new file within the root directory and save it with a \"<em>.css</em>\" extension. For example, name it \"<em>styles.css</em>\". This file will contain the CSS code that will style your web page.</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Step 6 : </strong></span><strong>Link the CSS file : </strong>Go back to your HTML file (<em>index.html</em>) and locate the <em>&lt;link&gt; </em>tag in the <em>&lt;head&gt; </em>section. This tag is used to link the CSS file to your HTML file. Update the <em>href </em>attribute value to match the relative path to your CSS file.</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Step 7 : </strong></span><strong>Create a media folder : </strong>Create a new folder called “<em>media</em>” for all the images for your web page. You can visit the Razor pay website (<a href=\"https://razorpay.com/\" target=\"_self\"><em>https://razorpay.com/</em></a>) to download the images.</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Step 8 : </strong></span><strong>Start coding your web page : </strong>Now you're ready to start coding the content of your web page within the <em>&lt;body&gt; </em>section of <em>index.html</em>.&nbsp;&nbsp;&nbsp;</p>\n",
          },
          {
            title: "Payment Features",
            task: "<p style=\"text-align:justify;\"><span style=\"color: rgb(255,153,0);\"><strong>Task Objective :</strong></span><strong> </strong>Create a banner type component for sign up and a grid component for payment features.</p>\n<p><span style=\"color: rgb(255,153,0);\"><strong>Task Interface :</strong></span></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395199/independent%20projects/razor/Task_3_iyfmls.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p><span style=\"color: rgb(255,153,0);\"><strong>Task Description :</strong></span></p>\n<p>This component is divided into two sections. The first section resembles the banner component, while the second section utilizes a grid structure.&nbsp;</p>\n<ul>\n<li><strong>Create a heading : </strong>Create a main heading for the component and horizontally align the text at the center. Add a small horizontal line and style it using<br>background, height and width properties.&nbsp;</li>\n</ul>\n<p><span style=\"color: rgb(255,192,0);\"><strong>For the first section :</strong></span>&nbsp;</p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the first section. You can give it a class or an ID for easy targeting in CSS.&nbsp;</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689329795/independent%20projects/razor/payment1_vfpdq9.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container into two columns using the CSS grid or flex property. Position the elements vertically at the center of the container element.</li></ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689328896/independent%20projects/razor/payment2_syflcb.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul><li><strong>Create the first column : </strong>Follow the steps mentioned in the previous component description to include a heading, paragraph, button and a hyperlink within the section. You can use HTML elements like `h1` for the heading, `ul` or `p` for the description, `button` for the sign-up button and `a` for the hyperlink. Do not miss the small horizontal line below the heading element. For the unordered list, you can change the list style and add the check mark icons before every list item.&nbsp;</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689328896/independent%20projects/razor/payment3_yedk1g.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Style the first column : </strong>Use text properties like text alignment, color, and font size to style the content in the first column. You can use margins along the y-axis to provide space in between the elements.</li>\n<li><strong>Create the second column : </strong>Using the `<em>&lt;img&gt;</em>` tag, add the image and specify the source attribute (`src`) to link the image file. Also specify alternate text<br>attribute (`alt`) for the image tag.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689328896/independent%20projects/razor/payment4_v3vkdd.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Style the second column : </strong>Add height or width properties to the image to confine it to the height of the container element. Add padding, if required, to accommodate space between the image and the edges of the container element.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the banner elements using relative units. At medium screen size : the first section should contain two columns of equal width (keeping all remaining constant). In smaller screens : the contents of the section should be horizontally aligned to the center. And the section should contain only one column. All the elements should be a part of this single column – heading, paragraph, button, hyperlink and the image (from the second column).</li>\n</ul>\n<p><em>For medium screens (tablets, small screen laptops) :</em></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689328896/independent%20projects/razor/payment5_f4lz6i.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p>&nbsp;<em>For smaller screens (mobiles, portrait in tablets) :</em>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689328896/independent%20projects/razor/payment6_uzbkck.png\" alt=\"undefined\" style=\"height: auto;width: 250px\"/>\n<p><span style=\"color: rgb(255,192,0);\"><strong>For the second section :</strong></span><strong> </strong></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the second section. You can give it a class or an ID for easy targeting in CSS.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689330170/independent%20projects/razor/features1_tv7mye.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container into two rows with three columns using the CSS grid or flex property. Align the elements vertically and horizontally, ensuring they are evenly distributed. Tip: use the same class name for the six divisions for easier CSS styling.&nbsp;</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689330170/independent%20projects/razor/features2_t0v5ve.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Fill the divisions : </strong>Each division includes a heading, paragraph and a hyperlink. You can use HTML elements like &lt;h3&gt; or &lt;h4&gt; for the heading, &lt;p&gt;<br>for the description and &lt;a&gt; for the hyperlink. Do not miss the small icon in the anchor element.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689330170/independent%20projects/razor/features3_vv9uzu.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Style the division : </strong>Use text properties like text alignment, color, and font size to style the content in the first column. You can use margins along the y-axis to provide space in between the elements. Add additional border radius to the top right corner of each division or use the clip path property to create an<br>irregular shape, where we will be positioning an icon in the next step. Also add hover effects to each division. When hovered upon, add a slight pop up effect to the division. Tip : you can add this pop up effect by giving a box shadow property to the divisions.</li>\n<li><strong>Create the icon : </strong>Using Ion Icons, add an icon in each division.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689330170/independent%20projects/razor/features4_fysgzl.png\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<ul>\n<li><strong>Style the icon : </strong>Add background and border properties to the icon. Position each of the icons behind (tip : use z-index property) the top right corner of each division.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. For the second section, at medium screen size : instead of two rows with three columns each, there should be three rows with two columns each and for smaller screens only one column per row, which would make six rows.</li>\n</ul>\n<p><em>For medium screens (tablets, small screen laptops):</em>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689330170/independent%20projects/razor/features5_z8kji1.png\" alt=\"undefined\" style=\"height: auto;width: 350px\"/>\n<p><em>For smaller screens (mobiles, portrait in tablets) :</em>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689330170/independent%20projects/razor/features6_nrzjqa.png\" alt=\"undefined\" style=\"height: auto;width: 200px\"/>\n<ul>\n<li><strong>Test and refine : </strong>Test the banner across different browsers and devices, making adjustments as needed to ensure consistent rendering.&nbsp;&nbsp;</li>\n</ul>\n",
          },
        ],
      },
      {
       title: "Day 3: Business Banking",
        topics: [
          {
            title: "Business Banking",
            task: "<p style=\"text-align:justify;\"><span style=\"color: rgb(255,153,0);\"><strong>Task Objective :</strong></span><strong> </strong>Create a banner type component for sign up and a grid component for business banking features.</p>\n<p><span style=\"color: rgb(255,153,0);\"><strong>Task Interface :</strong></span>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395198/independent%20projects/razor/Task_4_uby5oq.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p><span style=\"color: rgb(255,153,0);\"><strong>Task Description :</strong></span></p>\n<p>This component is divided into three sections. The first section resembles the banner component, while the second section utilizes a grid structure. Both these sections are exactly similar to what you have created in the previous component.&nbsp;</p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the banner content. You can give it a class or an ID for easy targeting in CSS.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404507/independent%20projects/razor/business1_gsjmhs.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Set the background : </strong>Provide a solid background color for the container element (that is close enough to the color used in the task interface). Add padding to the container element to accommodate space between the content and the edges. You can use the clip-path property to attain the irregular shape for the container element.&nbsp;</li>\n<li><strong>Create a heading : </strong>Create a main heading for the whole component and horizontally align the text at the center. Add a small horizontal line below the heading and style it using background, height and width properties.&nbsp;</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404508/independent%20projects/razor/business2_egeweg.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p><span style=\"color: rgb(255,192,0);\"><strong>For the first section :</strong></span></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the first section. You can give it a class or an ID for easy targeting in CSS.&nbsp;</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404508/independent%20projects/razor/business3_lfpaq6.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container into two columns using the CSS grid or flex property. Position the elements vertically at the center of the container element.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404507/independent%20projects/razor/business4_sxvdb9.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Create the first column : </strong>Follow the steps mentioned in the previous component description to include a heading, paragraph, button and a hyperlink within the section. You can use HTML elements like &lt;h1&gt; for the heading, &lt;p&gt; for the description, &lt;button&gt; for the sign-up button and &lt;a&gt; for the hyperlink. Do not miss the small horizontal line below the heading element.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404508/independent%20projects/razor/business5_iehznh.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Style the first column : </strong>Use text properties like text alignment, color, and font size to style the content in the first column. You can use margins along the y-axis to provide space in between the elements.</li>\n<li><strong>Create the second column : </strong>Using the `&lt;img&gt;` tag, add the image and specify the source attribute (`src`) to link the image file. Also specify alternate text attribute (`alt`) for the image tag.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404508/independent%20projects/razor/business6_mxnvwv.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Style the second column : </strong>Add height or width properties to the image to confine it to the height of the container element. Add padding, if required, to accommodate space between the image and the edges of the container element.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the banner elements using relative units. At medium screen size : the first section should contain two columns of equal width (keeping all remaining constant). In smaller screens : the contents of the section should be horizontally aligned to the center. And the section should contain only one column. All the elements should be a part of this single column – heading, paragraph, button, hyperlink and the image (from the second column).</li>\n</ul>\n<p><em>For medium screens (tablets, small screen laptops):</em>&nbsp;&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404508/independent%20projects/razor/business7_rppb1i.png\" alt=\"undefined\" style=\"height: auto;width: 250px\"/>\n<p><em>For smaller screens (mobiles, portrait in tablets) :</em>&nbsp;&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689404508/independent%20projects/razor/business8_uyiomm.png\" alt=\"undefined\" style=\"height: auto;width: 150px\"/>\n<p><span style=\"color: rgb(255,192,0);\"><strong>For the second section :</strong></span></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the second section. You can give it a class or an ID for easy targeting in CSS.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689412310/independent%20projects/razor/business9_igc0k7.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container into three columns using the CSS grid or flex property. Align the elements vertically and horizontally, ensuring they are evenly distributed. <em>Tip: use the same class name for the six divisions for easier CSS styling.</em></li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689412310/independent%20projects/razor/business10_duufrk.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Fill the grid cells : </strong>Each division includes a heading, paragraph and a hyperlink. You can use HTML elements like &lt;h3&gt; or &lt;h4&gt; for the heading, &lt;p&gt; for the description and &lt;a&gt; for the hyperlink. Do not miss the small icon in the anchor element.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689412310/independent%20projects/razor/business11_qqjnec.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<ul>\n<li><strong>Style the grid cells : </strong>Use text properties like text alignment, color, and font size to style the content in the first column. You can use margins along the y-axis to provide space in between the elements. Add additional border radius to the top right corner of each division or use the clip path property to create an irregular shape, where we will be positioning an icon in the next step. Also<br>add hover effects to each division. When hovered upon, add a slight pop up effect to the division. <em>Tip : you can add this pop up effect by giving scale and box shadow properties to the divisions.</em></li>\n<li><strong>Create the icon : </strong>Using Ion Icons, add an icon in each division.</li>\n<li><strong>Style the icon : </strong>Add background and border properties to the icon. Position each of the icons behind (tip : use z-index property) the top right corner of each division.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. At medium screen size : instead of two rows with three columns each, there should be three rows with two columns each and for smaller screens only one column per row, which would make six rows.</li>\n</ul>\n<p><em>For smaller screens (mobiles, portrait in tablets) :</em>&nbsp;&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1689412310/independent%20projects/razor/business12_aitqcz.png\" alt=\"undefined\" style=\"height: auto;width: 150px\"/>\n<p><span style=\"color: rgb(255,192,0);\"><strong>For the third section :</strong></span>&nbsp;</p>\n<ul>\n<li><strong>Create a container element : </strong>Create a container element and include a child div and a button in it.</li>\n<li><strong>Style the container element :  </strong>Arrange the div and the button vertically at the center of the container element and space them evenly along the x-axis. Add padding to provide space between the edges of the container element and the elements.</li>\n<li><strong>Style the child elements : </strong>Style the button element using background color, text color and border properties.</li>\n</ul>\n<p><strong>Test and refine : </strong>Test the banner across different browsers and devices, making adjustments as needed to ensure consistent rendering.&nbsp;&nbsp;</p>\n",
          },
          {
            title: "Product suites",
            task: "<p><span style=\"color:  #0C58B6;\"><strong>Task Objective :</strong></span> Create a grid component for product suites.&nbsp;</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Interface :</strong></span>\n</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395199/independent%20projects/razor/Task_5_s7ldhj.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p></p>\n\n<p><span style=\"color:  #0C58B6;\"><strong>Task Description :  </strong></span></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the second section. You can give it a class or an ID for easy targeting in CSS.&nbsp;</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690442971/independent%20projects/razor/suites1_epqxvj.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container into two rows with three columns using the CSS grid or flex property. Align the elements vertically and horizontally, ensuring they are evenly distributed. Tip: use the same class name for the six divisions for easier CSS styling.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690442971/independent%20projects/razor/suites2_zorss6.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Create a heading : </strong>The first cell of the container element, consists of the main heading for the component. You can create the heading using &lt;h1&gt; tag and horizontally align the text to the left of the container. Notice the difference in text color of the word. Tip : you can use a span element exclusively for the word and style it as required.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690443400/independent%20projects/razor/suites3_b625uo.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Fill the remaining cells : </strong>Each division includes an icon, a heading, paragraph and hyperlink. You can use HTML elements like &lt;h3&gt; or &lt;h4&gt; for the heading, &lt;p&gt; for the description and &lt;a&gt; for the hyperlink. Use Ion-Icons for the icon. Do not miss the small icon in the anchor element.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690442971/independent%20projects/razor/suites4_ouboro.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Style the cell content : </strong>Use text properties like text alignment, color, and font size to style the content in the first column. You can use margins along the y-axis to provide space in between the elements. Also add hover effects to each division. When hovered upon, add a slight pop up effect to the division. Tip : you can add this pop up effect by giving scale and box shadow properties to the divisions.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. At medium screen size : instead of two rows with three columns each, there should be three rows with two columns each and for smaller screens only one column per row, which would make six rows. At smaller screens, align the heading text horizontally at the center of the screen.</li>\n</ul>\n<p><em>For medium screens (tablets, small screen laptops):</em>&nbsp;</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690442971/independent%20projects/razor/suites5_v3vvwc.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<p><em>For smaller screens (mobiles, portrait in tablets) :</em>&nbsp;&nbsp;</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690442971/independent%20projects/razor/suites6_k0apgn.png\" alt=\"undefined\" style=\"height: auto;width: 200px\"/>\n<p></p>\n<ul>\n<li><strong>Test and refine : </strong>Test the component across different browsers and devices, making adjustments as needed to ensure consistent rendering.</li>\n</ul>\n<p></p>\n",
          },
          {
            title: "Features",
            task: "<p><span style=\"color:  #0C58B6;\"><strong>Task Objective :</strong></span> Create a banner type component for sign up and a grid component for payment features.&nbsp;</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Interface :</strong></span></p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395201/independent%20projects/razor/Task_6_boxyqh.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p>&nbsp;</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Description :</strong>  </span>This component is designed to be user-friendly and easy to comprehend. It consists of a clear heading, a concise paragraph, and well-organized grid structure that effectively displays the features of Razropay.</p>\n<ul>\n<li style=\"margin-left:1.5em;\"><strong>Create a container element :</strong> Start by creating a container element, to hold the banner content. You can give it a class or an ID for easy targeting in CSS.</li>\n<li><span style=\"color: rgb(0,0,0);font-size: medium;font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif;\"><strong>Set the background :</strong> Provide a solid background color for the container element (that is close enough to the color used in the task interface). Add padding to the container element to accommodate space between the content and the edges. You can use the clip-path property to attain the irregular shape for the container element.</span>&nbsp;</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690437728/independent%20projects/razor/features1_pawyqh.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Create a heading : </strong>Create a main heading for the whole component and horizontally align the text at the center. Add a small horizontal line below the heading and style it using background, height and width properties. Additionally add a caption to the component using a paragraph tag. Style the caption.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690437728/independent%20projects/razor/features2_drmnrl.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p>&nbsp;&nbsp;</p>\n<ul>\n<li><strong>Define the layout : </strong>Create a section after the caption. Divide the section into two rows with four columns each, using the CSS grid or flex property. Align the elements vertically and horizontally, ensuring they are evenly distributed. Tip: use the same class name for the eight divisions for easier CSS styling.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690437728/independent%20projects/razor/features3_eykxkz.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Fill the cells : </strong>Each division includes an image, a heading and a paragraph. You can use HTML elements like &lt;h3&gt; or &lt;h4&gt; for the heading and &lt;p&gt; for the description and. Using the `&lt;img&gt;` tag, add the image and specify the source attribute (`src`) to link the image file. Also specify alternate text attribute (`alt`)  for the image tag.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690437728/independent%20projects/razor/features4_ihs4nm.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Style the cell content : </strong>Use text properties like text alignment, color, and font size to style the content in the first column. You can use margins along the y-axis to provide space in between the elements. Also add hover effects to each division. When hovered upon, add a slight pop up effect to the division. Tip : you can add this pop up effect by giving scale and box shadow properties to the divisions.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. At medium screen size : instead of two rows with four columns each, there should be four rows with two columns each and for smaller screens only one column per row, which would make eight rows. At smaller screens, align the heading and other text horizontally at the center of the screen.</li>\n</ul>\n<p><em>For medium screens (tablets, small screen laptops):</em>&nbsp;</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690442971/independent%20projects/razor/suites5_v3vvwc.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<p><em>For smaller screens (mobiles, portrait in tablets) :</em>&nbsp;&nbsp;</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690442971/independent%20projects/razor/suites6_k0apgn.png\" alt=\"undefined\" style=\"height: auto;width: 200px\"/>\n<p></p>\n<ul>\n<li><strong>Test and refine : </strong>Test the component across different browsers and devices, making adjustments as needed to ensure consistent rendering.</li>\n</ul>\n",
          },
          {
            title: "Clients",
            task:"<p><span style=\"color:  #0C58B6;\"><strong>Task Objective :</strong></span> Create a banner type component to display the list of users.&nbsp;</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Interface :</strong></span></p>\n<p>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395200/independent%20projects/razor/Task_7_uvcvtp.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p></p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Description :  </strong></span></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the first section. You can give it a class or an ID for easy targeting in CSS.&nbsp;</li>\n</ul>\n<p>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690459690/independent%20projects/razor/clients1_p05mdq.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container into two columns, one slightly wider than the second one, using the CSS grid or flex property. Position the elements vertically at the center of the container element.&nbsp;</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690459690/independent%20projects/razor/clients2_g3aap2.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Fill the first column :  </strong>Create a main heading for the whole component and horizontally align the text to the left side of the container element. Add a small horizontal line below the heading and style it using background, height and width properties. Additionally add a description to the component using two paragraph tags and align the description to the left side of the container element.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690459690/independent%20projects/razor/clients3_tyhacs.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Fill the second column : </strong>Using the `&lt;img&gt;` tag, add the image and specify the source attribute (`src`) to link the image file. Also specify alternate text attribute (`alt`)  for the image tag.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690459840/independent%20projects/razor/clients4_exf9mj.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Style the second column : </strong>Create a marquee effect for the image that allows it to scroll vertically across the height of the container element. <strong>Note : </strong>The marquee tag is no longer recommended due to usability and accessibility concerns. It may negatively impact user experience, especially for users with cognitive or visual impairments. It is advisable to explore alternative design approaches or utilize modern CSS animations and transitions to create engaging and accessible web experiences. <em>Tip : Define an animation using keyframes. Use the transform property with translateY to animate the vertical movement of the image. Adjust the translateY value to control the direction and distance of the scroll.</em></li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. At medium screen size : align the heading and description text horizontally at the center of the screen. Instead of two columns and one row, from medium screens, make it one column and two rows.</li>\n</ul>\n<p><em>For medium screens (tablets, small screen laptops) :</em></p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690459840/independent%20projects/razor/clients5_zsgqax.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<p></p>\n<ul>\n<li><strong>Test and refine : </strong>Test the component across different browsers and devices, making adjustments as needed to ensure consistent rendering.</li>\n</ul>\n<p></p>\n",
          },
        ],
      },
      {
       title: "Day 4: Testimonials",
        topics: [
          {
            title: "Testimonials",
            task:"<p><span style=\"color:  #0C58B6;\"><strong>Task Objective : </strong></span>Create a carousel component to display the testimonials from happy users.&nbsp;</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Interface :</strong></span></p>\n<p>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395199/independent%20projects/razor/Task_8_eoc1po.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p></p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Description : </strong></span></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the first section. You can give it a class or an ID for easy targeting in CSS.&nbsp;</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690461834/independent%20projects/razor/test1_puk7xt.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Create a heading :  </strong>Create a main heading for the carousel component and horizontally align the text at the center. Add a small horizontal line below the heading and style it using background, height and width properties.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690461834/independent%20projects/razor/test2_mbx2kz.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Structure the carousel : </strong>Within the container, create a wrapper element, such as another &lt;div&gt;, to hold the carousel items. This wrapper will have a fixed width and will overflow horizontally to create the sliding effect.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690461834/independent%20projects/razor/test3_cbcktg.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Create carousel items : </strong>Inside the wrapper, create individual carousel items. Each item will represent a slide in the carousel.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690461834/independent%20projects/razor/test4_rzhzbb.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p>&nbsp;</p>\n<ul>\n<li><strong>Create carousel item slides : </strong>Divide each slide into two columns using the CSS grid or flex property. Position the elements vertically at the center of the container element. Using the `&lt;img&gt;` tag, add the image of theclient in the first column and specify the source attribute (`src`) to link the image file. Also specify alternate text attribute (`alt`)  for the image tag. In the second column, you can use HTML elements like &lt;p&gt; for the description, &lt;img&gt; for the logo and &lt;a&gt; for the hyperlink. Observe that each element is styled in a different way in the second column. You can style the text in the second column using properties like text color, font weight and font size.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690461834/independent%20projects/razor/test5_ffwwwb.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Style the carousel : </strong>Provide fixed width and height. Use flexbox to display the carousel items side by side. Distribute the carousel items equally within the wrapper by providing equal width to each. Create the sliding effect using CSS animations. Add translateX property to the carousel items to keep them moving horizontally. <em>Tip : Alternatively, you can also use a horizontal scroll property for the carousel wrapper, so that the carousel items can slide horizontally when the user scrolls.</em> <strong>Note : </strong>While it is possible to create a basic slideshow or image carousel using only HTML and CSS, implementing a fully functional carousel with interactive features like navigation controls and autoplay requires JavaScript or a library like Bootstrap.&nbsp;</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. At medium screen size : align the description, logo and hyperlink text horizontally at the center of the screen. Instead of two columns and one row, from medium screens, make it one column and two rows.</li>\n</ul>\n<p>For medium screens (tablets, small screen laptops) :&nbsp;</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690461834/independent%20projects/razor/test6_k7cqks.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<p></p>\n<ul>\n<li style=\"text-align:justify;\"><strong>Test and refine : </strong>Test the component across different browsers and devices, making adjustments as needed to ensure consistent rendering.</li>\n</ul>\n<p></p>\n",
          },
          {
            title: "Sign Up",
            task: "<p><span style=\"color:  #0C58B6;\"><strong>Task Objective :</strong></span> Create a Sign up component that resembles the banner component.&nbsp;</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Interface :</strong></span></p>\n<p>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395200/independent%20projects/razor/Task_9_tykyv3.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p></p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Description :  </strong></span></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the sign up component. You can give it a class or an ID for easy targeting in CSS.&nbsp;</li>\n<li><strong>Set the background : </strong>Provide a solid background color for the container element (that is close enough to the color used in the task interface). Add padding to the container element to accommodate space between the content and the edges. You can use the clip-path property to attain the irregular shape for the container element.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690520509/independent%20projects/razor/signup1_yjcs7s.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container element into two columns, using the CSS grid or flex property. Align the columns vertically and horizontally, ensuring they are evenly distributed.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690520509/independent%20projects/razor/signup2_gdyck7.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Fill the first column : </strong>Create a main heading for the whole component and horizontally align the text to the left side of the container element. Add a small horizontal line below the heading and style it using background, height and width properties. Additionally add a description to the component using paragraph tags or an unordered list and align the description to the left side of the container element. Followed by a button for Sign up.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690520509/independent%20projects/razor/signup3_mlq89d.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Fill the second column : </strong>Using the `&lt;img&gt;` tag, add the image and specify the source attribute (`src`) to link the image file. Also specify alternate text attribute (`alt`)  for the image tag.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690520509/independent%20projects/razor/signup4_ckx1vu.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Style the second column : </strong>Use spacing properties like margin or position properties to place the image out of the box.</li>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. At medium screen size : align the heading, paragraph text and the button horizontally at the center of the screen. Instead of two columns and one row, from medium screens, make it one column and two rows. You can eliminate the small image in medium and smaller screens.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690521395/independent%20projects/razor/signup5_lxz90b.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<p></p>\n<ul>\n<li><strong>Test and refine : </strong>Test the component across different browsers and devices, making adjustments as needed to ensure consistent rendering.</li>\n</ul>\n<p></p>\n",
          },
          {
            title: "Footer",
            task: "<p><span style=\"color:  #0C58B6;\"><strong>Task Objective :</strong></span> Create a footer component.</p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Interface :</strong></span></p>\n<p>&nbsp;</p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1688395201/independent%20projects/razor/Task_10_yx9jie.jpg\" alt=\"undefined\" style=\"height: auto;width: 500px\"/>\n<p></p>\n<p><span style=\"color:  #0C58B6;\"><strong>Task Description :  </strong></span></p>\n<ul>\n<li><strong>Create a container element : </strong>Start by creating a container element, to hold the content of the sign up component. You can give it a class or an ID for easy targeting in CSS.&nbsp;</li>\n<li><strong>Set the background : </strong>Provide a solid background color for the container element (that is close enough to the color used in the task interface). Add padding to the container element to accommodate space between the content and the edges.&nbsp;</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690524854/independent%20projects/razor/footer1_xnic58.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Add the logo : </strong>Using the `&lt;img&gt;` tag, add the image and specify the source attribute (`src`) to link the image file. Also specify alternate text attribute (`alt`)  for the image tag.</li>\n</ul>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690524854/independent%20projects/razor/footer2_hn3cvv.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Create a child element</strong>: Create a child section in the container element for the footer content.&nbsp;</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690524854/independent%20projects/razor/footer3_ghjiif.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Define the layout : </strong>Divide the container element into two columns, using the CSS grid or flex property. Align the columns vertically and horizontally, ensuring they are evenly distributed along the top baseline. Sud-divide the second column into two other columns (this will help in making the component responsive).</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690524854/independent%20projects/razor/footer4_jjvugl.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Fill the columns : </strong>Fill the first two columns with descriptions about Razor pay using paragraph tags. In the third column, add a heading tag (h2 or h3) and then a description.</li>\n</ul>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690524855/independent%20projects/razor/footer5_ahrusn.png\" alt=\"undefined\" style=\"height: auto;width: 400px\"/>\n<p></p>\n<ul>\n<li><strong>Apply responsive design : </strong>Use media queries to apply specific CSS rules based on the screen width. As the screen width reduces, reduce the font-size of the sections’ elements using relative units. At medium screen size : instead of two columns and one row, make it one column and two rows. And for smaller screens, create three rows with one column each.</li>\n</ul>\n<p><em>For medium screens ( tablets, smalle screen laptops) :</em></p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690524854/independent%20projects/razor/footer6_k6hssx.png\" alt=\"undefined\" style=\"height: auto;width: 300px\"/>\n<p><span style=\"color: rgb(0,0,0);font-size: medium;font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif;\"><em>For small screens ( mobiles, portrait in tablets) :</em></span>&nbsp;</p>\n<p></p>\n<img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1690524855/independent%20projects/razor/footer7_w2lexi.png\" alt=\"undefined\" style=\"height: auto;width: 200px\"/>\n<p></p>\n<ul>\n<li><strong>Test and refine : </strong>Test the component across different browsers and devices, making adjustments as needed to ensure consistent rendering.</li>\n</ul>\n<p></p>\n",
          },
        ],
      },
   
    ],
  },
  {
    title: "House Price Prediction",
    description:
      "In this project we will create a machine learning model with linear regression on Boston housing dataset. This model will aid us in making better real estate decisions by making house price predictions in that area. For this we will carryout data exploration for better understanding of data and will require preprocessing to improve the model accuracy.",
    skills: ["Python"],
    preRequisites: ["Python","Basic statistics"],
    noOfTasks: 4,
    difficulty: "Beginner",
    duration: "4 days",
   sections : [
      {
       title: "Day 1: Overview ",
        topics: [
          {
            title: "Project Context",
            task:`
    <h2 style="font-size: 1.8em; margin-bottom: 10px;">Introduction to Machine Learning 🤖📚</h2>
    
    <p><strong>Machine Learning (ML)</strong> is a branch of artificial intelligence (AI) that allows us to write computer programs that <strong>automatically improve with experience</strong>. These programs, known as <em>machine learning models</em>, learn from data and can solve complex problems without the need to explicitly code every rule or condition.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Why Use Machine Learning? 🧠</h3>
    <p>In traditional programming, we write code to define the logic step-by-step. However, in machine learning, we let the model <strong>learn the patterns from data</strong> and make predictions or decisions based on what it has learned. This approach is particularly useful for handling <strong>real-world, complex datasets</strong>, where manually coding every possible rule would be impractical.</p>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Illustration of a Machine Learning Model Learning from Data
    </div>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Supervised Learning and Linear Regression 📈</h3>
    <p>In this project, we are going to use <strong>supervised learning</strong>, which is a type of machine learning where the model is <strong>trained with labeled data</strong>. This means that the dataset contains both input features and the corresponding correct outputs (labels), allowing the model to learn by example.</p>

    <h4 style="font-size: 1.3em;">Project Workflow:</h4>
    <ol style="padding-left: 20px;">
        <li><strong>Exploring the Dataset 🗂️:</strong> We will first explore the attributes (features) in the <em>Boston Housing Dataset</em>, which includes information about housing prices and various factors that affect them, such as the number of rooms, pollution levels, and crime rates.</li>
        <li><strong>Splitting the Dataset 🧩:</strong> We will split the dataset into a <strong>training set</strong> and a <strong>test set</strong>. The training set will be used to train the <em>linear regression model</em>.</li>
        <li><strong>Training the Model ⚙️:</strong> We will train the linear regression algorithm using the training set to learn the relationship between the input features and the target variable (house prices).</li>
        <li><strong>Making Predictions 🔮:</strong> Once the model is trained, we will use it to make predictions on the test set and evaluate its performance by comparing the predicted and actual house prices.</li>
    </ol>

    <h4 style="font-size: 1.3em;">What is Linear Regression? 🧾</h4>
    <p><strong>Linear Regression</strong> is one of the most basic and widely used machine learning algorithms. It finds the best-fit line that predicts the output variable (house prices) based on the input features (such as the number of rooms or pollution levels).</p>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Diagram of Linear Regression with a Best-Fit Line
    </div>

    <p>This workflow will help us understand how to apply machine learning techniques to real-world datasets and improve our understanding of data-driven decision-making.</p>
` ,
          },
          {
            title: "Project Stages",
            task: "<p>The project consists of the following stages:</p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742894333/delete/Screenshot_2025-03-25_at_2.39.05_PM_sigooq.png\" style=\"width:100%\"></p><p><br></p><p><strong style=\"color: rgb(0, 71, 178);\">High-Level Approach</strong></p><p>• Exploring and analyzing the data used for making prediction</p><p>• Creating a simple model using linear regression</p><p>• Using the model to carryout prediction and evaluating it's efficiency</p><p><br></p><p><strong style=\"color: rgb(0, 71, 178);\">Task 1</strong></p><p>Importing libraries and dataset</p><p>In this section we will load a few libraries which we will need to develop, visualize and test</p><p>our model. We will also be loading our dataset for one of the imported libraries named</p><p>Sklearn.</p>",
          },
          {
            title: "Requirements",
            task: "<p>To start right away search on Google for \"Google colab\", click on the first link and then<p>click on new notebook. [Colab is a cloud based environment which provides all the</p><p>resources required for model development.]</p><p>• Import the stated libraries:</p><p>- Numpy</p><p>- Pandas</p><p><br></p><p>- Sklearn</p><p>- matplotlib.plt</p><p>- Seaborn</p><p>• Import Boston housing dataset from Sklearn using the following command.</p><p><br></p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742894979/delete/Screenshot_2025-03-25_at_2.58.24_PM_vxm9yj.png\"  style=\"width:100%\"></p><p><br></p><p>A bunch object is returned by load_boston() on which we will do our further work.</p><p><strong style=\"color: rgb(0, 71, 178);\">References</strong></p><p>• Introduction to Google colaboratory</p><p>• Top 10 Python Packages for Machine Learning</p><p>• Loading the dataset</p><p>• Boston Housing Dataset</p><p>• Methods of loading data</p><p><span style=\"color: rgb(0, 71, 178);\">Tip</span></p><p>Run the command %matplotlib inline to get the view of plots in notebook itself.</p><p><strong  style=\"color: rgb(0, 71, 178);\">Bring it On!</strong></p><p>• Instead of load_boston() method try to load the dataset in colab notebook as a CSV file</p><p>after downloading it from it's source mentioned above.</p><p>• Try to load from local disk as well as from a URL.</p><p><strong  style=\"color: rgb(0, 71, 178);\">Expected Outcome</strong></p><p>• Required libraries should be imported as well as the dataset from Sklearn</p><p>• print(var.keys()) should return a dictionary</p>",
          },
        ],
      },
      {
       title: "Day 2:Data exploration and preprocessing",
        topics: [
          {
            title: "Description",
            task:`
    <h2 style="font-size: 1.8em; margin-bottom: 10px;">Task 2: Data Exploration and Preprocessing 🔍🧹</h2>
    <p>In this section, we will <strong>analyze the dataset</strong> using various methods and then create a <code>DataFrame</code> to store and manipulate the data. We will also perform necessary <strong>data preprocessing</strong> to clean and transform the data for use in the linear regression model.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Exploring the Dataset 📊</h4>
    <p>First, we need to load and inspect the dataset. If you are using the Boston Housing dataset from <code>sklearn</code>, you can print the dataset's keys and examine its structure:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
from sklearn.datasets import load_boston
import pandas as pd

# Load the Boston Housing dataset
data = load_boston()
print(data.keys())  # Print the keys of the dataset
print(data['DESCR'])  # Display dataset description
    </pre>

    <p>The dataset returns a dictionary-like structure containing keys such as <code>'data'</code>, <code>'target'</code>, <code>'feature_names'</code>, and <code>'DESCR'</code>. You can explore the dataset to understand its attributes better.</p>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Dataset Structure (dictionary keys)
    </div>

    <h4 style="font-size: 1.3em;">2. Creating a DataFrame 🗂️</h4>
    <p>Next, we create a <code>DataFrame</code> to store the dataset. This makes it easier to perform operations like filtering, describing, and visualizing the data:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Create a DataFrame using feature names as column headers
df = pd.DataFrame(data.data, columns=data.feature_names)

# Add a new column for the target variable (house prices)
df['MEDV'] = data.target
print(df.head())  # Display the first 5 rows of the DataFrame
    </pre>

    <p>This will create a DataFrame with columns corresponding to the dataset's features and an additional column <code>MEDV</code> for the target label (Median Value of Owner-Occupied Homes).</p>

    <h4 style="font-size: 1.3em;">3. Checking for Missing Values ❓</h4>
    <p>To ensure data quality, we should check for any missing values in the dataset:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Check for missing values in each column
missing_values = df.isnull().sum()
print(missing_values)
    </pre>

    <p>If any missing values are found, we can handle them by filling them with appropriate values (e.g., mean or median) or dropping the rows/columns:</p>

    <p><strong>Example Code (Handling Missing Values):</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Fill missing values with the median of the respective column
df.fillna(df.median(), inplace=True)
    </pre>

    <h4 style="font-size: 1.3em;">4. Identifying Outliers Using Box Plot 📦</h4>
    <p>Outliers can impact the performance of the regression model. We can visualize outliers in the dataset using a box plot:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
import seaborn as sns
import matplotlib.pyplot as plt

# Create a box plot to visualize outliers in the 'MEDV' column
sns.boxplot(x=df['MEDV'])
plt.show()
    </pre>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Box plot showing outliers
    </div>

    <h4 style="font-size: 1.3em;">5. Visualizing Correlations Using a Heatmap 🌡️</h4>
    <p>We can create a heatmap to visualize the correlation between different features and identify the most important features for our regression model:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Create a heatmap to visualize feature correlations
plt.figure(figsize=(10, 8))
sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
plt.show()
    </pre>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Heatmap showing feature correlations
    </div>

    <h4 style="font-size: 1.3em;">6. Normalizing the Data 📐</h4>
    <p>To improve model performance, we can normalize the dataset by rescaling numeric values to a range of [0, 1]:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
from sklearn.preprocessing import MinMaxScaler

# Apply Min-Max normalization to the dataset
scaler = MinMaxScaler()
df_normalized = pd.DataFrame(scaler.fit_transform(df), columns=df.columns)
print(df_normalized.head())
    </pre>

    <p>Normalization helps ensure that all features have the same scale, which is important for certain machine learning algorithms.</p>
`,
          },
          {
            title: "Requirements",
            task:"<p>• Use print statement on each element of dictionary returned by the above statement</p><p>and read the results Ex: print(var.DESCR) to understand the dataset.</p><p>• Create a pandas dataframe for creating a copy of the dataset on which we will carry out</p><p>further preprocessing. Use the following command:</p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895286/delete/Screenshot_2025-03-25_at_3.04.10_PM_w8xzlo.png\"  style=\"width:100%\"></p><p>• Checkout references available below to know more about other arguments which can</p><p>be used in DataFrame() function.</p><p>• Use functions head() and tail() to see first and last five rows of the created</p><p>dataframe.</p><p>• Use describe() to get even further insights on the created data frame.</p><p>• Add another column to the dataframe and store the value of target attribute in it</p><p>df['MEDV'] = var.target Confirm the addition of column using head().</p><p>• Use df.dtype or df.info to know data type various features present in the dataset. If</p><p>we find categorical data, then we'll require to use different encoding methods.</p><p>• Use df.isnull().sum() to check for missing values in each column. If we find missing</p><p>values, then either we will place values there or we can drop the row or column.</p><p>• Create a box plot using seaborn to see the outliers in the dataset. Generally we remove</p><p>the rows having outliers from our data but for small dataset like Boston housing it can</p><p>lead to a loss of a significant percentage of data.</p><p><br></p><p><br></p><p>• Create a heatmap using seaborn to find corelation between different features and</p><p>labels. In model creation we will be using features having a high corelation with our</p><p>target label.</p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895689/delete/Screenshot_2025-03-25_at_3.07.43_PM_kfotmw.png\"  style=\"width:100%\"></p><p>• Create KDE plot of different variables using seaborn library.</p><p><br></p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895689/delete/Screenshot_2025-03-25_at_3.08.03_PM_vto8zi.png\"  style=\"width:100%\"></p>",
          },
          {
            title: "References",
            task: "<p><strong style=\"color: rgb(0, 71, 178);\">References</strong></p><p>• Seaborn Guide</p><p>• Seaborn tutorial</p><p>• Pandas Documentation</p><p>• Guide fo Pandas</p><p>• Normalization of data</p><p>• Understanding describe()</p><p>• Effect of multicolinearity</p><p><strong style=\"color: rgb(0, 71, 178);\">Bring it On!</strong></p><p>• In normalization we rescale numeric values of attributes to the range [1,0]. Create</p><p>another dataframe and perform all the above steps followed by normalization of data.</p><p>• After model implementation check the effect of normalization on the accuracy of the</p><p>model</p><p>• Instead of heatmap try to create a bar graph to identify collinearity.</p><p><strong style=\"color: rgb(0, 71, 178);\">Expected Outcome</strong></p><p>• On completion of this milestone, you should be able to achieve the following:</p><p>• A dataframe being created and a new column having value of target being added to it .</p><p><br></p><p>• Data being observed and understood using different methods</p><p>• Different aspects of data being visualized for a better understanding.</p><p>• Using heatmap features having high corelation with the target label had been</p><p>identified.</p>",
          },
        ],
      },
      {
       title: "Day 3: Model Implementation",
        topics: [
          {
            title: "Description",
            task: `  <h2 style="font-size: 1.8em; margin-bottom: 10px;">Task 3: Model Training with Linear Regression 📚🤖</h2>
    <p>In this section, we will import the <strong>Linear Regression model</strong> from <code>sklearn</code> and create training and testing sets using the features identified in the heatmap. Finally, we will train our model using the training set and use it to predict on the test set.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Importing Required Libraries 🛠️</h4>
    <p>First, we import the necessary libraries that we’ll use for model training and evaluation:</p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import pandas as pd
    </pre>

    <h4 style="font-size: 1.3em;">2. Creating Training and Testing Sets 📊</h4>
    <p>Next, we split the dataset into <strong>training</strong> and <strong>testing</strong> sets. We will use the features identified from the heatmap (e.g., <code>NOX</code>, <code>RM</code>, <code>DIS</code>, <code>PTRATIO</code>, and <code>LSTAT</code>) and the target label <code>MEDV</code> (median house value).</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Selecting features and target label
X = df[['NOX', 'RM', 'DIS', 'PTRATIO', 'LSTAT']]  # Features
y = df['MEDV']  # Target label

# Splitting the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=5)
    </pre>

    <p>Here, <code>test_size=0.33</code> means that 33% of the data will be used for testing, and <code>random_state=5</code> ensures that the results are reproducible.</p>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Heatmap with selected features
    </div>

    <h4 style="font-size: 1.3em;">3. Training the Linear Regression Model ⚙️</h4>
    <p>Now, we will create an instance of the <code>LinearRegression</code> class and fit the model using the training data:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Creating and training the Linear Regression model
regressor = LinearRegression()
regressor.fit(X_train, y_train)
    </pre>

    <p>After training the model, we can use it to make predictions on the test data:</p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Predicting the target values for the test set
y_pred = regressor.predict(X_test)
    </pre>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Training process illustration or regression plot
    </div>

    <h4 style="font-size: 1.3em;">4. Comparing Actual vs. Predicted Values 🧾</h4>
    <p>To evaluate the model's performance, we can compare the actual vs. predicted values by creating a DataFrame:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Creating a DataFrame to compare actual and predicted values
results_df = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred})
print(results_df)
    </pre>

    <p>This comparison gives us a better understanding of how well our model is predicting house prices in the test set.</p>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Table comparing actual vs. predicted values
    </div>
`,
          },
          {
            title: "Requirements",
            task: "<p>• Select features for creating training and test set. In place of variable x put your features</p><p>(for example, NOX which stands for Nitric Oxide content) and MEDV (Median value) as</p><p>a label in y</p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895689/delete/Screenshot_2025-03-25_at_3.08.21_PM_kne1i9.png\"  style=\"width:100%\"></p><p>• Use train_test split() from Sklearn to create train and test sets</p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895689/delete/Screenshot_2025-03-25_at_3.08.39_PM_g5rwbq.png\"  style=\"width:100%\"></p><p>• Use regression on training data</p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895856/delete/Screenshot_2025-03-25_at_3.13.52_PM_b5eagj.png\"  style=\"width:100%\"></p>",
          },
          
          {
            title: "References",
            task:"<p><strong style=\"color: rgb(0, 71, 178);\">References</strong></p><p>• Train and Test Set in Python Machine Learning - How to split</p><p>• Training and Test Sets: Splitting Data</p><p>• What is Linear Regression?</p><p>• Linear Regression for Machine Learning</p><p>• A Beginner’s Guide to Linear Regression in Python with Scikit-Learn</p><p>Tip</p><p>• In case of error in using the functions we can directly import the required functions.</p><p><br></p><p>from sklearn.model_selection import train_test_split</p><p>from sklearn.linear_model import LinearRegression</p><p>from sklearn import metrics</p><p><br></p><p><strong style=\"color: rgb(0, 71, 178);\">Bring it On!</strong></p><p>• Try to use SVM Regressor and Random Forest Regressor for model creation on</p><p>normalized dataframe, and compare the respective R2 scores.</p><p><strong style=\"color: rgb(0, 71, 178);\">Expected Outcome</strong></p><p>• You should be able to achieve the following:</p><p>- Create training and test set from the dataframe.</p><p>- Train the model using the training set and display the predicted and actual values.</p>",
          },
        ],
      },
      {
       title: "Day 3: Model Testing",
        topics: [
          {
            title: "Description",
            task: `
              <h2 style="font-size: 1.8em; margin-bottom: 10px;">Task 4: Model Testing and Evaluation 🧪📊</h2>
    <p>In this section, we will thoroughly evaluate our <strong>linear regression model</strong> using testing data to assess its performance. Model evaluation is essential to determine how accurately the model predicts unseen data and whether it generalizes well to new inputs.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Display Key Evaluation Metrics 📈</h4>
    <p>We will calculate and display important regression metrics that help measure the error in our model’s predictions:</p>
    <ul style="padding-left: 20px;">
        <li><strong>Mean Absolute Error (MAE):</strong> Provides the average of the absolute differences between the predicted and actual values.</li>
        <li><strong>Mean Squared Error (MSE):</strong> Squares the errors before averaging, making it more sensitive to large deviations.</li>
        <li><strong>Root Mean Squared Error (RMSE):</strong> The square root of MSE, bringing the units back to the same scale as the target variable.</li>
        <li><strong>R² Score (Coefficient of Determination) 📊:</strong> Measures how well the regression line fits the data, ranging from 0 to 1 (closer to 1 is better).</li>
    </ul>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
from sklearn import metrics
mae = metrics.mean_absolute_error(y_test, y_pred)
mse = metrics.mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2_score = metrics.r2_score(y_test, y_pred)

print("Mean Absolute Error:", mae)
print("Mean Squared Error:", mse)
print("Root Mean Squared Error:", rmse)
print("R² Score:", r2_score)
    </pre>

    <p>Here’s what the metrics indicate:</p>
    <ul style="padding-left: 20px;">
        <li><strong>R² Score close to 1:</strong> Excellent fit – the model explains most of the variance in the target variable.</li>
        <li><strong>R² Score close to 0:</strong> Poor fit – the model fails to capture the target’s variability.</li>
    </ul>

    <h4 style="font-size: 1.3em;">2. Plotting the Regression Results 📉</h4>
    <p>Visualization helps us better understand how well our model is performing. We will create a scatter plot showing the actual vs. predicted values:</p>

    <p><strong>Example Code:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
import matplotlib.pyplot as plt
plt.scatter(y_test, y_pred, color='blue', alpha=0.5, label="Predicted vs Actual")
plt.plot(y_test, y_test, color='red', label="Ideal Fit Line")
plt.xlabel("Actual Values")
plt.ylabel("Predicted Values")
plt.title("Actual vs. Predicted Values")
plt.legend()
plt.show()
    </pre>
`,
          },
          {
            title: "Requirements",
            task: "<p>• Display the following: Mean Absolute Error, Mean Squared Error, Root Mean Squared</p><p>Error, R2 Score.</p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895856/delete/Screenshot_2025-03-25_at_3.13.07_PM_cenwgc.png\"  style=\"width:100%\"></p><p>The above code block is missing some arguments. Checkout the references to get a clear</p><p>idea on what it's missing.</p><p>• Use array function in numpy to crate an array of target label and any one of the features.</p><p>Pass this through polyfit() function. polyfit() will return the slope and intercept of</p><p>regression line. Store the returned values.</p><p><br></p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895856/delete/Screenshot_2025-03-25_at_3.13.19_PM_iirkpb.png\"  style=\"width:100%\"></p><p><br></p><p>The above code snippet is missing arguments for polyfit(). Checkout the references</p><p>for a solution.</p><p>• Use the plot() function to plot the regression line corresponding to the chosen</p><p>feature.</p><p><br></p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895857/delete/Screenshot_2025-03-25_at_3.13.40_PM_arlj3o.png\"  style=\"width:100%\"> </p><p><br></p><p>Read about the functions and it's argument in the references section.</p><p>• Use seaborn library to create a pairplot</p><p><br></p><p><img src=\"https://res.cloudinary.com/cliqtick/image/upload/v1742895858/delete/Screenshot_2025-03-25_at_3.14.03_PM_hcoysu.png\"  style=\"width:100%\"></p><p>Read about the function and its arguments from references to know more about pairplot</p><p>and try to play around with various argument values.</p>",
          },
          
          {
            title: "References",
            task:"<p><strong style=\"color: rgb(0, 71, 178);\">References</strong></p><p>• Sickit Learn</p><p>• How to plot a linear regression line on a scatter plot in Python</p><p>• Matplotlib for beginners</p><p>• Matplotlib plot()</p><p>• Seaborn pairplot()</p><p><strong style=\"color: rgb(0, 71, 178);\">Bring it On!</strong></p><p>• Use other features to create their plots with predicted values.</p><p><strong style=\"color: rgb(0, 71, 178);\">Expected Outcome</strong></p><p>• You should be able to achieve the following:</p><p>- Display and interpret the R2 score and results of error functions</p><p>- Create and display a plot using negative slope and positive y intercept obtained from</p><p>polyfit() function for Median value label and Nitric oxide content attribute.</p><p>- Create and display a pairplot of the attributes against the label where attributes</p><p>with positive corelation with the label will have plots with positive slope and</p><p>attributes having negative corelation will have negative slope.</p>",
          },
        ],
      },

   
    ],
  },
  {
    title: "E-Commerce Website",
    description:
      "To develop a full-stack e-commerce website with authentication and payment integration, start by setting up the project environment. Initialize a new project directory and install necessary backend dependencies like express for server setup, bcrypt for password hashing, jsonwebtoken (JWT) for authentication, and a payment SDK such as Razorpay or Stripe for handling payments. Configure the backend with Express, setting up middleware for parsing JSON, handling CORS, and managing sessions or authentication tokens. Create routes for user registration, login, product retrieval, cart management, and payment processing. ",
    skills: ["React", "Node.js", "MongoDB", "Express", "Stripe API"],
    preRequisites: [
      "Basic knowledge of JavaScript",
      "Understanding of REST APIs",
    ],
    noOfTasks: 10,
    difficulty: "Intermediate",
    duration: "10 days",
   sections : [
      {
       title: "Day 1: Project Setup and Database Schema Design",
        topics: [
          {
            title: "Initialize the project structure",
            task: `
    <p>In this task, we will <strong>set up the basic structure</strong> for our project. This involves creating a project directory and initializing it with <code>npm</code> or <code>yarn</code>, which will allow us to manage dependencies and scripts effectively.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Create a New Project Directory 📂</h4>
    <p>First, create a folder that will serve as the root directory for your project:</p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Create a new directory named "my-project"
mkdir my-project

# Navigate into the new directory
cd my-project
    </pre>

    <h4 style="font-size: 1.3em;">2. Initialize the Project with npm or yarn 📦</h4>
    <p>Next, initialize the project with <code>npm</code> or <code>yarn</code>. This will create a <code>package.json</code> file, which stores project metadata and dependency information.</p>

    <p><strong>Example Code:</strong></p>
    <ul style="padding-left: 20px;">
        <li>If you are using <strong>npm</strong>:</li>
    </ul>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
npm init -y
    </pre>
    <ul style="padding-left: 20px;">
        <li>If you are using <strong>yarn</strong>:</li>
    </ul>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
yarn init -y
    </pre>

    <p>The <code>-y</code> flag automatically answers "yes" to all setup questions, creating the <code>package.json</code> file with default settings.</p>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Command line output showing successful project initialization
    </div>

    <h4 style="font-size: 1.3em;">3. Verify the Project Initialization ✅</h4>
    <p>After running the above command, you should see a new file called <code>package.json</code> in your project directory. This file contains essential information about your project, including:</p>
    <ul style="padding-left: 20px;">
        <li><strong>Project name</strong></li>
        <li><strong>Version number</strong></li>
        <li><strong>Dependencies</strong> (once you add them)</li>
        <li><strong>Scripts</strong> for running tasks</li>
    </ul>

    <p>You can inspect the file by opening it in your favorite code editor:</p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
# Open the project in VS Code (if installed)
code .
    </pre>

    <p>Congratulations! You’ve successfully initialized your project structure. 🎉</p>
`,
          },
          {
            title: "Configure the database schema",
            task: `
    <p>In this task, we will <strong>design and configure the database schema</strong> to store essential entities such as <em>products</em>, <em>users</em>, and <em>orders</em>. A well-structured schema ensures efficient data storage, retrieval, and overall performance.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Identify Core Entities and Relationships 🔍</h4>
    <p>The first step is to identify the core entities that the database needs to store and the relationships between them:</p>
    <ul style="padding-left: 20px;">
        <li><strong>Products:</strong> Information such as product name, description, price, stock level, and category.</li>
        <li><strong>Users:</strong> User data including name, email, password (hashed), and user role (e.g., customer, admin).</li>
        <li><strong>Orders:</strong> Details about customer orders, including order date, total amount, payment status, and associated products.</li>
    </ul>

    <h4 style="font-size: 1.3em;">2. Design the Database Tables and Fields 🏗️</h4>
    <p>We will create tables for each entity and define the necessary fields. Below is a basic schema design:</p>

    <p><strong>Products Table:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(100)
);
    </pre>

    <p><strong>Users Table:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer'
);
    </pre>

    <p><strong>Orders Table:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
    </pre>

    <h4 style="font-size: 1.3em;">3. Establish Relationships and Constraints ⚙️</h4>
    <p>To maintain data integrity, we define <strong>foreign keys</strong> to link the tables:</p>
    <ul style="padding-left: 20px;">
        <li><strong>Products and Orders:</strong> Each order can include multiple products, and we can create a join table <code>order_items</code> to manage this relationship.</li>
        <li><strong>Users and Orders:</strong> Each order is linked to a specific user through the <code>user_id</code> foreign key.</li>
    </ul>

    <p>Example for <code>order_items</code> table:</p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
    </pre>

    <h4 style="font-size: 1.3em;">4. Verify the Schema Design ✅</h4>
    <p>Once the tables are created, run SQL queries to inspect the schema and verify that the structure meets the project requirements. For example:</p>

    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
-- View the schema of the products table
DESCRIBE products;

-- Fetch all products to verify data storage
SELECT * FROM products;
    </pre>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: ER Diagram showing relationships between products, users, and orders
    </div>

    <p>With the schema configured, you can proceed to insert data and build CRUD operations to manage the products, users, and orders in the database. 🎉</p>
`,
          },
          {
            title: "Establish database connections",
            task: ` <p>In this task, we will <strong>set up database connections</strong> to ensure that our application can communicate with the database. You can establish the connection either by using an <strong>ORM (Object-Relational Mapping)</strong> tool or by writing direct SQL queries.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Using an ORM (e.g., Sequelize for Node.js or SQLAlchemy for Python) 🛠️</h4>
    <p>ORMs provide a high-level abstraction to interact with the database, making it easier to manage database operations without writing raw SQL queries.</p>

    <p><strong>Example: Setting up a Database Connection with Sequelize (Node.js)</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
// Install Sequelize and a database driver (MySQL/PostgreSQL/SQLite)
npm install sequelize mysql2

// Import Sequelize and establish a connection
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database_name', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql', // Change to 'postgres', 'sqlite', etc., based on your DB
});

// Test the connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();
    </pre>

    <p>In this example, <code>Sequelize</code> is used to set up a connection with a MySQL database. You can modify the connection settings to match your database credentials and type.</p>

    <h4 style="font-size: 1.3em;">2. Using Direct SQL Queries 📝</h4>
    <p>If you prefer to interact with the database directly, you can write SQL queries using a database client. Below is an example for setting up a direct connection with <strong>MySQL</strong> in Node.js:</p>

    <p><strong>Example: Setting up a Database Connection with mysql2 (Node.js)</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
// Install mysql2
npm install mysql2

// Import mysql2 and create a connection
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'yourdatabase',
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database.');
    }
});
    </pre>

    <p>Once connected, you can use <code>connection.query()</code> to run SQL queries directly on the database.</p>

    <h4 style="font-size: 1.3em;">3. Verify the Database Connection ✅</h4>
    <p>After setting up the connection, it’s important to verify that your application can successfully communicate with the database. Run your application and check for the following:</p>
    <ul style="padding-left: 20px;">
        <li>No connection errors in the terminal output.</li>
        <li>A confirmation message indicating that the connection has been established.</li>
        <li>Optional: Test some CRUD operations to ensure data can be added, retrieved, updated, and deleted.</li>
    </ul>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Database connection flowchart or console output screenshot
    </div>

    <p>With the database connection established, you are now ready to interact with the database and perform CRUD operations efficiently! 🎉</p>
`,
          },
        
        ],
      },
      {
       title: "Day 2: User Authentication System",
        topics: [
          {
            title: "Implement user registration",
            task:`
    <p>In this task, we will <strong>implement user registration functionality</strong> by creating registration forms and handling user sign-up on the backend. This includes validating user input, storing hashed passwords, and saving user details in the database.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Create the Registration Form 📄</h4>
    <p>First, we’ll create a simple registration form with fields like <strong>name</strong>, <strong>email</strong>, and <strong>password</strong>. Below is an example using HTML:</p>

    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
<form action="/register" method="POST" style="max-width: 400px; margin: 0 auto;">
    <label for="name">Name:</label><br>
    <input type="text" id="name" name="name" required style="width: 100%; padding: 8px; margin-bottom: 10px;"><br>

    <label for="email">Email:</label><br>
    <input type="email" id="email" name="email" required style="width: 100%; padding: 8px; margin-bottom: 10px;"><br>

    <label for="password">Password:</label><br>
    <input type="password" id="password" name="password" required style="width: 100%; padding: 8px; margin-bottom: 10px;"><br>

    <button type="submit" style="background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Register</button>
</form>
    </pre>

    <h4 style="font-size: 1.3em;">2. Handle User Sign-Up on the Backend 🛠️</h4>
    <p>To handle form submissions, we’ll create an endpoint in our backend that processes the sign-up request. Below is an example in Node.js with Express:</p>

    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
// Import required modules
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Middleware to parse JSON request body
app.use(express.json());

// User registration route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Hash the user's password for secure storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user details (name, email, hashed password) in the database
        // (Example only: Replace this with actual DB logic)
        const user = { name, email, password: hashedPassword };
        console.log('User registered:', user);

        res.status(201).send('User registered successfully!');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(Server running at http://localhost:port);
})
    </pre>

    <h4 style="font-size: 1.3em;">3. Validate User Input 🛡️</h4>
    <p>To enhance security, we’ll validate the user input before processing the sign-up. This includes:</p>
    <ul style="padding-left: 20px;">
        <li>Ensuring that the <strong>name</strong> and <strong>email</strong> fields are not empty.</li>
        <li>Checking that the <strong>password</strong> meets minimum strength requirements (e.g., length, special characters).</li>
        <li>Verifying that the <strong>email</strong> has a valid format.</li>
    </ul>

    <p>Example validation with JavaScript:</p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
function validateForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email.includes('@')) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return false;
    }

    return true;
}
    </pre>

    <h4 style="font-size: 1.3em;">4. Store User Data Securely 🔐</h4>
    <p>When storing user passwords, always hash them using a secure algorithm such as <strong>bcrypt</strong>. This ensures that even if the database is compromised, the actual passwords remain protected.</p>

    <h4 style="font-size: 1.3em;">5. Verify User Registration ✅</h4>
    <p>Once the backend logic is set up, you can test the registration functionality by submitting the form and checking the backend logs or database for the registered user details.</p>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Registration form UI or backend console output
    </div>

    <p>With this registration functionality in place, users will be able to sign up securely and their data will be safely stored in the database. 🎉</p>

`,
          },
          {
            title: "Implement user login",
            task: `

    <p>In this task, we will <strong>create a login form</strong> and handle <strong>user authentication</strong> on the backend. This involves validating user credentials, checking the stored password, and establishing user sessions or generating authentication tokens.</p>

    <h3 style="font-size: 1.5em; margin-bottom: 10px;">Steps to Follow:</h3>

    <h4 style="font-size: 1.3em;">1. Create the Login Form 📄</h4>
    <p>First, we’ll create a simple login form with fields for <strong>email</strong> and <strong>password</strong>. Below is an example using HTML:</p>

    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
<form action="/login" method="POST" style="max-width: 400px; margin: 0 auto;">
    <label for="email">Email:</label><br>
    <input type="email" id="email" name="email" required style="width: 100%; padding: 8px; margin-bottom: 10px;"><br>

    <label for="password">Password:</label><br>
    <input type="password" id="password" name="password" required style="width: 100%; padding: 8px; margin-bottom: 10px;"><br>

    <button type="submit" style="background-color: green; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Login</button>
</form>
    </pre>

    <h4 style="font-size: 1.3em;">2. Handle User Authentication on the Backend 🛠️</h4>
    <p>We’ll create a backend endpoint to handle user login requests. The backend will verify the provided email and password against the database records and, if the login is successful, respond with a success message or a JSON Web Token (JWT).</p>

    <p><strong>Example: Handling Login Requests with Node.js and Express</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

app.use(express.json());  // Middleware to parse JSON request body

// Mock database (replace with real DB logic)
const users = [{ email: 'user@example.com', password: '$2b$10$hashedPasswordHere' }];

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(400).send('User not found');
    }

    try {
        // Compare hashed password with user input
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }

        // Generate JWT (JSON Web Token)
        const token = jwt.sign({ email: user.email }, 'yourSecretKey', { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log("Server running at http://localhost:port");
});
    </pre>

    <h4 style="font-size: 1.3em;">3. Validate User Input 🛡️</h4>
    <p>To prevent invalid data from reaching the backend, validate the user input on the front-end. This includes checking that:</p>
    <ul style="padding-left: 20px;">
        <li>The <strong>email</strong> is in the correct format.</li>
        <li>The <strong>password</strong> field is not empty.</li>
    </ul>

    <p>Example validation with JavaScript:</p>
    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
function validateLoginForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email.includes('@')) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (!password) {
        alert('Password cannot be empty.');
        return false;
    }

    return true;
}
    </pre>

    <h4 style="font-size: 1.3em;">4. Handle Authentication Token or Session Storage 🔑</h4>
    <p>After a successful login, the server can respond with a <strong>JWT (JSON Web Token)</strong> or set up a session to manage user authentication. Store the token securely on the client side (e.g., in <code>localStorage</code> or <code>sessionStorage</code>):</p>

    <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; color: #333;">
// Example: Storing token in localStorage
localStorage.setItem('authToken', token);
    </pre>

    <h4 style="font-size: 1.3em;">5. Test the Login Flow ✅</h4>
    <p>After implementing the front-end form and backend logic, test the login flow by submitting the form and verifying:</p>
    <ul style="padding-left: 20px;">
        <li>The user receives an appropriate success or error message.</li>
        <li>The JWT or session is set up correctly on the client side.</li>
        <li>The backend logs show successful login attempts.</li>
    </ul>

    <div style="font-style: italic; color: gray; margin: 20px 0; text-align: center; padding: 10px; border: 1px dashed #aaa;">
        🖼 Image Placeholder: Screenshot of login form or backend console output
    </div>

    <p>With the login functionality implemented, users will be able to securely access their accounts. 🎉</p>

            `,
          },
          {
            title: "Password hashing and session management",
            task: "Hash user passwords and manage user sessions securely.",
          },
        ],
      },
      {
       title: "Day 3: Product Listing and Search Functionality",
        topics: [
          {
            title: "Develop product listing API",
            task: "Create API endpoints to fetch and display products.",
          },
          {
            title: "Implement search functionality",
            task: "Add search and filter options for products.",
          },
          {
            title: "Create product detail pages",
            task: "Design pages to display detailed product information.",
          },
        ],
      },
      {
       title: "Day 4: Shopping Cart Implementation",
        topics: [
          {
            title: "Add products to the cart",
            task: "Implement functionality to add products to the shopping cart.",
          },
          {
            title: "Update cart quantities",
            task: "Allow users to update the quantity of items in the cart.",
          },
          {
            title: "Remove items from the cart",
            task: "Implement functionality to remove items from the cart.",
          },
        ],
      },
      {
       title: "Day 5: Payment Gateway Integration",
        topics: [
          {
            title: "Integrate Stripe API",
            task: "Set up Stripe for secure payment processing.",
          },
          {
            title: "Handle payment transactions",
            task: "Implement payment processing and handle transaction responses.",
          },
          {
            title: "Display payment status",
            task: "Show users the status of their payments.",
          },
        ],
      },
      {
       title: "Day 6: Order Management System",
        topics: [
          {
            title: "Order processing",
            task: "Handle order creation and processing.",
          },
          {
            title: "Order status updates",
            task: "Implement order status tracking and updates.",
          },
          {
            title: "Order tracking",
            task: "Allow users to track their order status.",
          },
        ],
      },
      {
       title: "Day 7: User Profile and Order History",
        topics: [
          {
            title: "User profile management",
            task: "Allow users to manage their profile information.",
          },
          {
            title: "Order history display",
            task: "Show users their order history.",
          },
          {
            title: "Profile security",
            task: "Implement security measures for user profiles.",
          },
        ],
      },
      {
       title: "Day 8: Admin Panel for Product Management",
        topics: [
          {
            title: "Admin dashboard",
            task: "Create an admin dashboard for managing products.",
          },
          {
            title: "Product creation and editing",
            task: "Allow admins to add, edit, and delete products.",
          },
          {
            title: "Product categorization",
            task: "Implement product categories and tags.",
          },
        ],
      },
      {
       title: "Day 9: Testing and Debugging",
        topics: [
          {
            title: "Unit testing",
            task: "Write unit tests for individual components and functions.",
          },
          {
            title: "Integration testing",
            task: "Test the integration of different components and services.",
          },
          {
            title: "Bug fixing",
            task: "Identify and fix bugs in the application.",
          },
        ],
      },
      {
       title: "Day 10: Deployment and Documentation",
        topics: [
          {
            title: "Deploy the application",
            task: "Deploy the application to a cloud platform.",
          },
          {
            title: "Document the codebase",
            task: "Write comprehensive documentation for the codebase.",
          },
          { title: "User guides", task: "Create user guides and tutorials." },
        ],
      },
    ],
  },
 ];
