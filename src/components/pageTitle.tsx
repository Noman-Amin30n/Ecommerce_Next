import React from "react";
import Image from "next/image";
import Breadcrumbs from "./breadcrumbs";

interface PageTitleProps {
    title: string;
    backgroundImageUrl: string;
    logoImageUrl: string;
}
function PageTitle({ title, backgroundImageUrl, logoImageUrl }: PageTitleProps) {
  return (
    <section style={{ backgroundImage: `url(${backgroundImageUrl})` }} className="min-h-[316px] flex justify-center items-center bg-cover bg-center after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0px,rgba(255,255,255,0.5)_9px,rgba(255,255,255,0.5)_308px,rgba(255,255,255,1)_316px)] after:bg-opacity-40 after:backdrop-blur-[2px] relative isolate">
      <div className="z-10 flex flex-col justify-center items-center">
        <Image
          src={logoImageUrl}
          alt="pageTitleLogo"
          width={77}
          height={77}
          className="size-14 sm:size-[77px]"
        />
        <h1 className="font-medium leading-none text-[28px] sm:text-[36px] md:text-[48px] text-center text-black">
          {title}
        </h1>
        <Breadcrumbs />
      </div>
    </section>
  );
}

export default PageTitle;
