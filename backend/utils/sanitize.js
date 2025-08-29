const sanitizeString = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim();
};

export { sanitizeString };