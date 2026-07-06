import NadiaMaar from "./NadiaMaar_Framer"
import NadiaMaarAbout from "./NadiaMaar_About"
import { EcommercePage, CorporatePage, WebAppPage, SeoPage, AiPage } from "./NadiaMaar_ServicePage"
import DigitalFoundry from "./DigitalFoundry"
import Cabinet from "./Cabinet"

export default function App() {
  const path = window.location.pathname
  if (path === "/about")      return <NadiaMaarAbout />
  if (path === "/ecommerce")  return <EcommercePage />
  if (path === "/corporate")  return <CorporatePage />
  if (path === "/web-app")    return <WebAppPage />
  if (path === "/seo")        return <SeoPage />
  if (path === "/ai")         return <AiPage />
  if (path === "/foundry")    return <DigitalFoundry />
  if (path === "/cabinet")    return <Cabinet />
  return <NadiaMaar />
}
