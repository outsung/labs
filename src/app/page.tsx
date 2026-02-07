import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LabCard from "@/components/LabCard";
import Footer from "@/components/Footer";
import { getAllLabs } from "@/lib/labs";

export default function Home() {
  const labs = getAllLabs();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-5xl">
            {labs.map((lab, i) => (
              <LabCard key={lab.id} lab={lab} index={i} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
