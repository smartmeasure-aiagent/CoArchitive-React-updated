import React, { useState } from "react";
import { useRoute } from "./router.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Preloader from "./components/Preloader.jsx";
import Home from "./pages/Home.jsx";
import Expertise from "./pages/Expertise.jsx";
import Offices from "./pages/Offices.jsx";
import About from "./pages/About.jsx";
import Architecture from "./pages/Architecture.jsx";
import Planning from "./pages/Planning.jsx";
import Careers from "./pages/Careers.jsx";
import Contact from "./pages/Contact.jsx";
import Admin from "./pages/Admin.jsx";
import AdminBar from "./components/AdminBar.jsx";

const PAGES = {
  home: Home,
  architecture: Architecture,
  planning: Planning,
  expertise: Expertise,
  people: About, // merged into About; keeps old #/people links working
  offices: Offices,
  about: About,
  careers: Careers,
  contact: Contact,
  admin: Admin,
};

const releaseEntrance = () => document.documentElement.classList.remove("intro");

export default function App({ intro = false }) {
  const route = useRoute();
  const [showIntro, setShowIntro] = useState(intro);
  const Page = PAGES[route] ?? Home;

  return (
    <div className="site">
      {showIntro && <Preloader onReveal={releaseEntrance} onDone={() => setShowIntro(false)} />}
      <Header route={route} />
      <main key={route} className="main">
        <Page />
      </main>
      <Footer />
      <AdminBar />
    </div>
  );
}
