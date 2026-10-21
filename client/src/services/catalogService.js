// Companies, roles and templates, stored in MongoDB (/api/catalog). Everyone can read them;
// only the admin can change them. Save and delete return the updated list, as the admin pages expect.
import { apiRequest } from './api'

export async function getCatalog() {
  return apiRequest('GET', '/catalog')
}

// Adds a new item (no id yet) or updates an existing one, then returns the fresh list of that kind
async function saveItem(kind, item) {
  if (item.id) await apiRequest('PUT', `/admin/${kind}/${item.id}`, item)
  else await apiRequest('POST', `/admin/${kind}`, item)
  const catalog = await getCatalog()
  return catalog[kind]
}

async function deleteItem(kind, itemId) {
  await apiRequest('DELETE', `/admin/${kind}/${itemId}`)
  const catalog = await getCatalog()
  return catalog[kind]
}

export const saveCompany = (company) => saveItem('companies', company)
export const deleteCompany = (companyId) => deleteItem('companies', companyId)
export const saveRole = (role) => saveItem('roles', role)
export const deleteRole = (roleId) => deleteItem('roles', roleId)
export const saveTemplate = (template) => saveItem('templates', template)
export const deleteTemplate = (templateId) => deleteItem('templates', templateId)
