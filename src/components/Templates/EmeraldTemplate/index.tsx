import Navbar from './Navbar'
import MenuSection from './MenuSection'
import Footer from './Footer'
import { useAppSelector } from '@/store/hooks'
import PromoBannerE from './PromoBannerE'

function EmeraldTemplate() {
  const menu = useAppSelector((state) => state.menu);
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);

  console.log(storeMenuItems)
  console.log(storeCategories)

  console.log(menu) 
  return (
    <main className="min-h-screen bg-[#fafaf9] text-stone-900 antialiased scroll-smooth  pt-24 pb-28 md:pb-0">
       <Navbar />
       <PromoBannerE /> 
       <section
          id="menu"
          className="py-8 md:py-16 max-w-6xl mx-auto px-6"
          aria-labelledby="menu-heading"
        >
          <MenuSection items={storeMenuItems ?? []} categories={storeCategories ?? []} />
        </section>

        <Footer />

    </main>
  )
}

export default EmeraldTemplate