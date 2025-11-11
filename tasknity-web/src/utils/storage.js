export const loadState = () => {
  try {
    const data = localStorage.getItem("pms-data");
    return data ? JSON.parse(data) : undefined;
  } catch {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem("pms-data", JSON.stringify(state));
  } catch {
    // ignore
  }
};
