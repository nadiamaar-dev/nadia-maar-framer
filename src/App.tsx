import NadiaMaar from "./NadiaMaar_Framer"
import NadiaMaarAbout from "./NadiaMaar_About"
import NadiaMaarProjects from "./NadiaMaar_Projects"
import { EcommercePage, CorporatePage, WebAppPage, SeoPage, AiPage } from "./NadiaMaar_ServicePage"
import DigitalFoundry from "./DigitalFoundry"
import CabinetApp from "./portal/cabinet/CabinetApp"
import DashboardGate from "./DashboardGate"

export default function App() {
  const path = window.location.pathname
  if (path === "/about")      return <NadiaMaarAbout />
  if (path === "/projects")   return <NadiaMaarProjects />
  if (path === "/ecommerce")  return <EcommercePage />
  if (path === "/corporate")  return <CorporatePage />
  if (path === "/web-app")    return <WebAppPage />
  if (path === "/seo")        return <SeoPage />
  if (path === "/ai")         return <AiPage />
  if (path === "/foundry")    return <DigitalFoundry />
  if (path === "/cabinet")    return <CabinetApp />
  if (path === "/dashboard")  return <DashboardGate />
  return <NadiaMaar />
}
