export const getBusinessQuery = `
query Business($businessId: String) {
  business(id: $businessId) {
    ... on Business {
      _id
      ownerName
      address
      BrandingInfo {
        logo
        icon
        colorPalette
        typography
        tagLine
        description
        websiteData
      }
      SocialMediaInfo
      DomainInfo
      GST
      tax
      businessMail
      businessName
      phone
      integrations
    }
    ... on err {
      err
    }
  }
}

`