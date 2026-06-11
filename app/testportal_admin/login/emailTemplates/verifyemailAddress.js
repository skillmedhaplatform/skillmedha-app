export function generateVerifyEmailAddressEmailTemplate(params){
    const VerifyEmailAddressEmailTemplate =
    `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body >
    <div class="container" style="width: 100%;margin: 0;  background-color: #56d2d41a; font-family: 'Montserrat', sans-serif; box-sizing: border-box; padding: 1rem; max-width: 600px; margin: auto;">
        <div class="logo"  style="width: 100%; text-align: center;">
            <img style=" margin: 0 ; height: 3rem;" src="https://res.cloudinary.com/cliqtick/image/upload/v1718341876/sysnper/svgviewer-png-output_1_fvqnal.png" alt="Line 12" >
        </div>

        <div class="title" style=" margin-top:4rem;text-align: center; font-weight: 700; font-size: 1.725rem; line-height: 2.31rem; color: #2a8586ff; margin: 1.125rem 0;">
          Verify Your Email Address for <span style="color: #56D2D4;">Synsper</span>
        </div>

        <div class="message" style=" font-weight: 700; font-size: 1.2rem; line-height: 2.32rem; color: #000000ff; margin: 1rem 0;">
            Dear ${params.userName},<br>
        </div>
        <div style=" font-weight: 700; font-size: 1.1rem; line-height: 1.52rem; color: #000000ff; margin: 1rem 0;">
You're almost there! Please verify your email address to finish setting up your account. Click below to confirm your email address:
        </div>
         <div style="width: 100%;  margin: 1.4rem 0;  text-align: center;">   <a href=${params.url} style=" margin: 0 ; text-align: center;background-color: #56D2D4; color: black; text-decoration: none; font-weight: 600; padding: 0.4rem 2rem; border-radius: 2.5rem;">Verify Email Address</a>    
 </div>
       
 <div style=" font-weight: 700; font-size: 0.8rem; line-height: 1.12rem; color: #000000ff; margin: 1rem 0;">
If you did not sign up for this account, you can safely ignore this email.
 </div>

        <div class="info-text" style="font-weight: 700; font-size: 1rem; line-height: 1.52rem; color: #000000ff; margin-top: 1.25rem;">
            Best regards,<br> <span style="color: #56D2D4;">Synsper</span> Support Team
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
`
return VerifyEmailAddressEmailTemplate;
}