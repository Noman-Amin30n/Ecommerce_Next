import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-white pt-12 lg:pt-[100px] px-6 md:px-12 xl:px-[100px]">
      <section className="max-w-[1440px] mx-auto flex flex-col justify-between items-stretch gap-12">
        <div className="flex flex-col justify-between items-stretch">
          <div className="flex flex-col md:flex-row justify-evenly items-stretch gap-9">
            <p className="leading-normal text-sm md:text-base text-[#9F9F9F] text-center md:text-left sm:my-auto sm:text-nowrap">
              400 University Drive Suite 200 Coral
              <br />
              Gables,
              <br />
              FL 33134 USA
            </p>
            <div className="leading-normal text-black font-medium text-sm md:text-base flex justify-evenly items-stretch gap-9 sm:gap-[80px] md:grow">
              <ul className="flex flex-col justify-start items-stretch gap-7 lg:gap-[54px]">
                <li className="text-[#9F9F9F]">Links</li>
                <li>Home</li>
                <li>Shop</li>
                <li>About</li>
                <li>Contact</li>
              </ul>
              <ul className="flex flex-col justify-start items-stretch gap-7 lg:gap-[54px]">
                <li className="text-[#9F9F9F]">Help</li>
                <li className="text-nowrap">Payment Options</li>
                <li>Returns</li>
                <li>Privacy Policies</li>
              </ul>
            </div>
            <div className="flex flex-col justify-start items-center lg:items-start gap-7 lg:gap-[54px] md:hidden lg:flex">
              <p className="text-[#9F9F9F] text-sm md:text-base">Newsletter</p>
              <div className="flex justify-between items-stretch gap-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Your Email Address"
                  className="text-[#9F9F9F] text-xs sm:text-sm leading-normal pr-[25px] border-b border-b-black focus:outline-none grow w-[200px] sm:w-auto"
                />
                <button className="text-black font-medium text-xs sm:text-sm leading-normal border-b border-b-black">
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </div>
          <div className="hidden md:flex lg:hidden justify-start items-start self-center gap-6 mt-14">
              <p className="text-[#9F9F9F] hidden">Newsletter</p>
              <div className="flex justify-between items-stretch gap-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Your Email Address"
                  className="text-[#9F9F9F] text-sm leading-[21px] pr-[25px] border-b border-b-black focus:outline-none grow"
                />
                <button className="text-black font-medium text-sm leading-[21px] border-b border-b-black">
                  SUBSCRIBE
                </button>
              </div>
            </div>
        </div>
        <p className="border-t border-t-[#d9d9d9] py-9 leading-6 text-black text-sm md:text-base text-center md:text-left">
          {new Date().getFullYear()} Meubel House. All rights reserved.
        </p>
      </section>
    </footer>
  );
}

export default Footer;
