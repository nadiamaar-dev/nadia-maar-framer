import NadiaMaar from "./NadiaMaar_Framer"
import NadiaMaarAbout from "./NadiaMaar_About"

export default function App() {
  const path = window.location.pathname
  if (path === "/about") return <NadiaMaarAbout />
  return <NadiaMaar />
}
