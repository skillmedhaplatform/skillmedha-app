// The saved shape for a template, starting from its current effective values.
export const configPayload = (template, overrides = {}) => ({
  name: template.name,
  description: template.description || "",
  category: template.category || "",
  previewImage: template.previewImage || "",
  bestFor: template.bestFor || [],
  access: template.access,
  visibility: template.visibility,
  price: template.price,
  mrp: template.mrp,
  validityDays: template.validityDays || 0,
  order: template.order,
  featured: template.featured,
  ...overrides,
});
