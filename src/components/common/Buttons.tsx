import { cn } from "@/lib/utils";

interface ButtonProps {
  btnText: string;
  className?: string;
  variant?: "full-underline" | "partial-underline";
}
export function AppButton({
  btnText,
  className,
  variant = "full-underline",
}: ButtonProps) {
  switch (variant) {
    case "partial-underline":
      return (
        <div>
          <button className="text-base sm:text-[18px] md:text-[24px] leading-normal font-medium pb-2 md:pb-3 hover:text-gray-600 transition-colors duration-300">
            {btnText}
          </button>
          <hr className="h-0 border-0 border-b-2 border-black w-4/5 mx-auto" />
        </div>
      );
    case "full-underline":
      return (
        <button
          className={cn(
            "text-base sm:text-[18px] md:text-[20px] leading-normal font-medium border-b-2 border-black pb-2 md:pb-3 hover:scale-105 active:scale-95 transition-transform duration-300",
            className
          )}
        >
          {btnText}
        </button>
      );
  }
}

export function MyButton({
  btnText,
  className,
}: {
  btnText: string;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "text-base sm:text-lg lg:text-[20px] font-medium border-b-2 border-black pb-1 hover:text-gray-600 transition-colors duration-300",
        className
      )}
    >
      {btnText}
    </button>
  );
}
