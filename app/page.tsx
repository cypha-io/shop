import Navbar from '@/components/Navbar';
import Categories from '@/components/Categories';
import AdSection from '@/components/AdSection';
import PopularItems from '@/components/PopularItems';
import NewArrivals from '@/components/NewArrivals';
import Featured from '@/components/Featured';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Categories />
      <AdSection />
      <PopularItems />
      <NewArrivals />
      <Featured />
      <Footer />
    </div>
  );
}
