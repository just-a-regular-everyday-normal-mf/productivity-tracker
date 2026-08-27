import client from "./client";

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createCompany({ company_name, fields }) {
  const { data } = await client.post("/api/companies", {
    company_name,
    log_date: todayIso(),
    fields,
  });
  return data;
}
