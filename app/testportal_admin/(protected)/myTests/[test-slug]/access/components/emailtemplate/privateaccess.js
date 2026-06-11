export function generateEmailTemplate(params) {
  const EmailTemplate = `   
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style=" width: 100%;">
    
    <div class="container" style="width: 100%;margin: 0; background-color: #56d2d41a; font-family: 'Montserrat', sans-serif; box-sizing: border-box; padding: 1rem; max-width: 600px; margin: auto;">
    <div class="logo"   style=" width: 100%; text-align: center;">
    <img src="https://res.cloudinary.com/cliqtick/image/upload/v1718341876/sysnper/svgviewer-png-output_1_fvqnal.png" alt="Line 12" style=" margin: 0 ; height: 3rem;">
        </div>

        <div class="title" style="text-align: center; font-weight: 700; font-size: 1.725rem; line-height: 2.31rem; color: #2a8586ff; margin: 1.125rem 0;">
            Your Access Code for <span style="color: #56D2D4;">${params.testName}</span> Test
        </div>

        <div class="message" style="font-weight: 700; font-size: 1.2rem; line-height: 2.32rem; color: #000000ff; margin: 1rem 0;">
            Dear ${params.userName},<br>Your access code for ${params.testName} test is: ${params.accessCode}
        </div>
        <!--
        <div class="info-text" style="font-weight: 700; font-size: 0.8em; line-height: 1.2rem; color: #000000ff; margin: 0.6rem 0;">
            Please enter this code within the next ${params.timeLimit} to complete your sign-in.
        </div>
        -->
        <div class="info-text" style="font-weight: 700; font-size: 0.8rem; line-height: 1.2rem; color: #000000ff; margin: 0.9rem 0;">
            If you didn’t request this code, you can safely ignore this email.
        </div>
             <!--      
        <div class="divider" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 40vh;">
            <img style="width: 100%; height: 100%;" src="./assets/rectangle-152.svg" alt="divifdeer">
        </div>
-->
        <div class="info-text" style="font-weight: 700; font-size: 1rem; line-height: 1.52rem; color: #000000ff; margin-top: 1.25rem;">
            Thank you,<br> <span style="color: #56D2D4;">Synsper</span> Support Team
        </div>
        
         <div class="footer" style="  width: 100%; display: flex;  text-align: center; font-weight: 700; font-size: 1rem; line-height: 1.52rem;  margin-top: 1.1rem;">
            <aside style="width: 50%;  text-align: end; margin-right: 1rem;">
                <a href="https://www.facebook.com/people/Synsper/61560347679348/" style="margin-right: 2%;"><img style="width: 8%;" src="https://res.cloudinary.com/cliqtick/image/upload/v1717415332/079a97a4b44b815cf1280d221515f272_rkphwv.png" alt="facebook"></a>
                <a href="https://www.instagram.com/synsper_official/" style="margin-right: 2%;"><img style="width: 8%;" src="https://res.cloudinary.com/cliqtick/image/upload/v1717415332/d38fa2ba69be2c8d74f2ae74460b21eb_kg5fup.png" alt="instagram"></a>
                <a href="https://www.linkedin.com/in/synsper-india-813ab4311/" style="margin-right: 2%;"><img style="width: 8%;" src="https://res.cloudinary.com/cliqtick/image/upload/v1717415332/2d82bdbfda355cdfb31e786ac1fda92f_aovsd4.png" alt="linkedin"></a>
                <a href="#"><img style="width: 8%; margin-right: 2%;" src="https://res.cloudinary.com/cliqtick/image/upload/v1717415331/dc4f47b9ce9d62fd46b142967479ea60_nfwcpz.png" alt="youtube"></a>
            </aside>
            | <a   href="" style="  margin-left: 1rem;  width: 50%; text-align: start; text-decoration: none; color: black;">${params.companyDetails}</a>
        </div>      
    </div>
    </body>
</html>
    `;
  return EmailTemplate;
}
