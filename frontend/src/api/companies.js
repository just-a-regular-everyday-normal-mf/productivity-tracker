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

export async function fetchCompanies() {
  const { data } = await client.get("/api/companies");
  return data;
}

export async function fetchCompany(id) {
  const { data } = await client.get(`/api/companies/${id}`);
  return data;
}

export async function updateCompany(id, payload) {
  const { data } = await client.patch(`/api/companies/${id}`, payload);
  return data;
}

export async function deleteCompany(id) {
  await client.delete(`/api/companies/${id}`);
}

export async function downloadCompaniesCsv() {
  const response = await client.get("/api/companies/export", {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "applications.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
