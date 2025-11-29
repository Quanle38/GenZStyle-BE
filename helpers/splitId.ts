export const SplitId = (id: string): number => {
  const numberPart = id.replace(/\D/g, ""); // lấy toàn bộ số
  return Number(numberPart);
};
