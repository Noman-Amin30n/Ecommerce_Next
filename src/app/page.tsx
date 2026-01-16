import Footer from "@/components/footer";
import Header from "@/components/header/header";
import BlogCard from "@/components/blogCard/blogCard";
import Image from "next/image";
import { MyButton } from "@/components/buttons";
import { ProductCard_Big, ProductCard_Normal } from "@/components/product_card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to our online store",
};

export default function Home() {
  return (
    <>
      {/* Header and Hero section */}
      <article className="flex flex-col justify-start items-stretch min-h-[100dvh]">
        <Header className="bg-[#fbebb5]" />
        <section className="w-full bg-[#fbebb5] text-black flex justify-center items-center grow">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-[48px] md:px-[120px] lg:px-[48px] lg:pl-[96px] xl:px-[100px] xl:pl-[200px] flex flex-col lg:flex-row justify-center items-stretch gap-9 lg:gap-12">
            <div
              className="relative flex justify-center lg:order-1"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <Image
                src={"/images/hero_image.png"}
                alt="hero"
                width={500}
                height={500}
                className="object-contain object-right drop-shadow-[0px_28px_30px_rgba(0,0,0,0.1)] hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div
              className="flex flex-col justify-end items-center lg:items-start gap-4 pb-8"
              data-aos="fade-right"
            >
              <h2 className="font-medium text-[36px] sm:text-[48px] md:text-[56px] leading-normal text-center lg:text-left sm:text-nowrap">
                Rocket single<span className="block">seater</span>
              </h2>
              <MyButton btnText="Shop Now" />
            </div>
          </div>
        </section>
      </article>
      {/* Featured products section */}
      <section className="w-full bg-[#FAF4F4] text-black py-12 md:py-[54px]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-[48px] md:px-[100px] flex flex-col md:flex-row justify-between items-stretch gap-[30px]">
          <ProductCard_Big
            imageSrc={"/images/products/product_1.png"}
            imageAlt="section_01"
            title="Side Table"
          />
          <ProductCard_Big
            imageSrc={"/images/products/product_2.png"}
            imageAlt="section_01"
            title="Coffee Table"
          />
        </div>
      </section>
      {/* Top Picks for user */}
      <section className="bg-white text-black py-12 md:py-[54px]">
        <div className="max-w-[1440px] mx-auto flex flex-col justify-center items-center px-6 sm:px-[48px] md:px-[100px]">
          <div className="text-center" data-aos="fade-up" data-aos-offset="0">
            <h2 className="font-medium text-[28px] md:text-[36px] leading-normal">
              Top Picks For You
            </h2>
            <p className="font-medium text-sm md:text-base leading-normal text-[#9F9F9F] text-center mt-3">
              Find a bright ideal to suit your taste with our great selection of
              suspension, floor and table lights.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[30px] self-stretch mt-12 md:mt-16">
            <ProductCard_Normal
              imageSrc="/images/products/product_3.png"
              imageAlt="section_01"
              title="Trenton modular sofa_3"
              price="Rs. 25,000.00"
            />
            <ProductCard_Normal
              imageSrc="/images/products/product_4.png"
              imageAlt="section_01"
              title="Granite dining table with dining chair"
              price="Rs. 25,000.00"
            />
            <ProductCard_Normal
              imageSrc="/images/products/product_5.png"
              imageAlt="section_01"
              title="Outdoor bar table and stool"
              price="Rs. 25,000.00"
            />
            <ProductCard_Normal
              imageSrc="/images/products/product_6.png"
              imageAlt="section_01"
              title="Plain console with teak mirror"
              price="Rs. 25,000.00"
            />
          </div>
          <div className="mt-12 md:mt-16">
            <MyButton btnText="View More" />
          </div>
        </div>
      </section>
      {/* New arrivals section */}
      <section className="bg-[#FFF9E5] text-black py-12 md:py-[54px] overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-stretch px-6 sm:px-[48px] md:pl-12 md:pr-[60px] xl:pr-[100px] gap-[30px] md:gap-[60px] xl:gap-[100px]">
          <div className="md:grow relative group" data-aos="fade-right">
            <Image
              src="/images/products/product_7.png"
              alt="Newly arrived sofa"
              width={500}
              height={500}
              className="w-full group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          </div>
          <div
            className="flex flex-col justify-center items-center"
            data-aos="fade-left"
          >
            <p className="font-medium text-base sm:text-lg md:text-[20px] leading-normal">
              New Arrivals
            </p>
            <h3 className="font-bold text-[28px] sm:text-[32px] md:text-[36px] lg:text-[48px] leading-normal sm:text-nowrap">
              Asgaard sofa
            </h3>
            <button className="text-sm sm:text-base lg:text-lg xl:text-[20px] leading-normal text-black py-2 md:py-3 lg:py-4 px-8 md:px-12 lg:px-[74px] border border-black mt-6 lg:mt-8 hover:bg-black hover:text-white transition-all duration-300">
              Order Now
            </button>
          </div>
        </div>
      </section>
      {/* Our blogs section */}
      <section className="w-full bg-white text-black py-12 md:py-[54px]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 md:px-[100px] flex flex-col justify-between items-center gap-9 sm:gap-12 md:gap-16">
          <div>
            <h2 className="font-medium text-[28px] md:text-[36px] leading-normal text-center">
              Our Blogs
            </h2>
            <p className="font-medium text-sm md:text-base leading-normal text-[#9F9F9F] text-center mt-3">
              Find a bright ideal to suit your taste with our great selection
            </p>
          </div>
          <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[30px] gap-y-12">
            <BlogCard
              imageSrc="/images/post_1.jpeg"
              imageAlt="blog post 1 thumbnail"
              title="Going all-in with millennial design"
              readTime="5 min"
              createdAt={new Date()}
            />
            <BlogCard
              imageSrc="/images/post_2.jpeg"
              imageAlt="blog post 1 thumbnail"
              title="Going all-in with millennial design"
              readTime="5 min"
              createdAt={new Date()}
            />
            <BlogCard
              imageSrc="/images/post_3.jpeg"
              imageAlt="blog post 1 thumbnail"
              title="Going all-in with millennial design"
              readTime="5 min"
              createdAt={new Date()}
            />
          </div>
        </div>
      </section>
      {/* Follow us on Instagram */}
      <section className='text-black bg-[url(/images/bg.jpeg)] bg-cover bg-center py-20 md:py-[100px] lg:py-[125px] isolate relative before:content-["_"] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-[rgba(255,255,255,0.85)] before:z-[-999]'>
        <div
          className="max-w-[1440px] mx-auto flex flex-col justify-center items-center px-6 sm:px-[48px] md:px-[100px]"
          data-aos="zoom-in"
        >
          <h2 className="font-bold text-[36px] sm:text-[48px] md:text-[60px] leading-normal text-center">
            Our Instagram
          </h2>
          <p className="text-base sm:text-lg md:text-xl leading-normal text-center">
            Follow our store on Instagram
          </p>
          <button className="text-base sm:text-lg md:text-xl leading-normal text-black py-2 md:py-3 lg:py-4 px-10 md:px-[60px] lg:px-20 bg-[#FAF4F4] rounded-full shadow-[0px_20px_20px_rgba(0,0,0,0.1)] mt-4 hover:shadow-xl hover:scale-105 transition-all duration-300">
            Follow Us
          </button>
        </div>
      </section>
      <Footer />
    </>
  );
}
