// Shares companies, roles and templates with all pages. Use it with useCatalog().
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCatalog } from '../services/catalogService'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState({ companies: [], roles: [], templates: [] })
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)

  useEffect(() => {
    getCatalog()
      .then(setCatalog)
      // Server not reachable: keep empty lists, so pages still open (and show their own messages)
      .catch(() => {})
      .finally(() => setIsCatalogLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      ...catalog,
      isCatalogLoading,
      setCompanies: (companies) => setCatalog((current) => ({ ...current, companies })),
      setRoles: (roles) => setCatalog((current) => ({ ...current, roles })),
      setTemplates: (templates) => setCatalog((current) => ({ ...current, templates })),
    }),
    [catalog, isCatalogLoading]
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  return useContext(CatalogContext)
}
