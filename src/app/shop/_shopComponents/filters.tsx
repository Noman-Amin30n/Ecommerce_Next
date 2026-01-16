"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterContext } from "@/contexts/filterContext";
import useOutsideClick from "@/hooks/outsideclick";
import ShowItemsInput from "./itemsPerPage";
import SortBy from "./sortBy";
import ApplyFilter from "./apply";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import type { ICategory } from "@/models/category";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FiltersProps {
  productsApiEndpoint?: string;
  minPrice: number;
  maxPrice: number;
  categories: ICategory[];
}

export default function Filters({
  minPrice,
  maxPrice,
  categories,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isApplyingFilter } = useFilterContext();

  const filterRef = useRef<HTMLDivElement>(null);
  useOutsideClick(filterRef as React.RefObject<HTMLDivElement>, () =>
    setIsOpen(false)
  );

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => !isApplyingFilter && setIsOpen((prev) => !prev)}
      >
        <TbAdjustmentsHorizontal className="text-xl sm:text-[25px]" />
        <span className="sm:text-xl">Filter</span>
      </div>

      <div
        ref={filterRef}
        className={clsx(
          "absolute top-full left-0 bg-white rounded-md p-4 z-10 shadow-lg min-w-[250px] max-w-[300px] w-[90vw] sm:w-[350px] transform origin-top transition-all duration-200 ease-in-out",
          isOpen ? "translate-y-2 scale-y-100" : "scale-y-0"
        )}
      >
        <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-2">
          <CategoryFilter categories={categories} />

          <div className="border-t pt-4">
            <PriceFilter minPrice={minPrice} maxPrice={maxPrice} />
          </div>

          {/* Mobile-only filters */}
          <div className="flex lg:hidden flex-col gap-4 border-t pt-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Show</span>
              <ShowItemsInput defaultValue={16} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Sort By</span>
              <SortBy />
            </div>
          </div>

          <div className="pt-2">
            <ApplyFilter className="w-full text-sm sm:text-base" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
}

function PriceFilter({ minPrice, maxPrice }: PriceFilterProps) {
  const { priceRangeValue, setPriceRangeValue } = useFilterContext();
  const sliderRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setPriceRangeValue(
      searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : maxPrice
    );
  }, [maxPrice, setPriceRangeValue, searchParams]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const value =
      ((Number(slider.value) - Number(slider.min)) /
        (Number(slider.max) - Number(slider.min))) *
      100;
    slider.style.background = `linear-gradient(to right, #fb923c 0%, #fb923c ${value}%, #fed7aa ${value}%, #fed7aa 100%)`;
  }, [priceRangeValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPriceRangeValue(Number(e.target.value));
    },
    [setPriceRangeValue]
  );

  return (
    <div>
      <span className="text-sm sm:text-base font-medium">Price</span>
      <div className="flex justify-between items-center gap-4 text-xs sm:text-sm mt-2 mb-2">
        <span>${minPrice}</span>
        <span>${priceRangeValue}</span>
      </div>
      <input
        type="range"
        ref={sliderRef}
        className="w-full appearance-none price-range rounded-full bg-orange-200 h-2 cursor-pointer"
        min={minPrice}
        max={maxPrice}
        step={1}
        value={priceRangeValue}
        onChange={handleChange}
      />
    </div>
  );
}

interface CategoryItem extends Omit<ICategory, "parent" | "children" | "_id"> {
  _id: string | { toString: () => string };
  name: string;
  parent?: string | { toString: () => string } | null;
  children: CategoryItem[];
}

function CategoryFilter({ categories }: { categories: ICategory[] }) {
  const { categoryIds, setCategoryIds } = useFilterContext();

  // Organize categories into a tree structure
  const categoryTree = useMemo(() => {
    const tree: CategoryItem[] = [];
    const map = new Map<string, CategoryItem>();

    // Initialize map with all categories
    categories.forEach((cat) => {
      // Use _id if available, otherwise assume the object itself has an id
      // Client side ICategory typically has _id as string or object
      const id = cat._id.toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.set(id, { ...(cat as any), children: [] });
    });

    // Build tree
    categories.forEach((cat) => {
      const id = cat._id.toString();
      const mappedCat = map.get(id);
      if (!mappedCat) return;

      if (cat.parent) {
        const parentId =
          typeof cat.parent === "object"
            ? cat.parent.toString()
            : (cat.parent as string);
        const parent = map.get(parentId);
        if (parent) {
          parent.children.push(mappedCat);
        } else {
          tree.push(mappedCat); // Fallback if parent not found
        }
      } else {
        tree.push(mappedCat);
      }
    });

    return tree;
  }, [categories]);

  const getAllDescendantIds = (category: CategoryItem): string[] => {
    let ids = [category._id.toString()];
    if (category.children) {
      category.children.forEach((child) => {
        ids = [...ids, ...getAllDescendantIds(child)];
      });
    }
    return ids;
  };

  const handleCheck = (category: CategoryItem, checked: boolean) => {
    const idsToToggle = getAllDescendantIds(category);

    let newIds: string[];
    if (checked) {
      // Add all descendants
      newIds = [...new Set([...categoryIds, ...idsToToggle])];
    } else {
      // Remove all descendants
      newIds = categoryIds.filter((id) => !idsToToggle.includes(id));
    }
    setCategoryIds(newIds);
  };

  const renderCategory = (category: CategoryItem, level = 0) => {
    const catId = category._id.toString();
    const isChecked = categoryIds.includes(catId);

    return (
      <div
        key={catId}
        className="flex flex-col gap-2"
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            id={catId}
            checked={isChecked}
            onCheckedChange={(checked) =>
              handleCheck(category, checked as boolean)
            }
            className="data-[state=checked]:bg-[#FF5714] data-[state=checked]:border-[#FF5714]"
          />
          <Label
            htmlFor={catId}
            className="text-sm font-normal cursor-pointer hover:text-[#FF5714] transition-colors"
          >
            {category.name}
          </Label>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm sm:text-base font-medium">Categories</span>
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-2">
        {categoryTree.map((cat) => renderCategory(cat))}
      </div>
    </div>
  );
}

export function FilterFallback() {
  return (
    <Skeleton className="self-stretch w-[66px] sm:w-[80px] rounded-none" />
  );
}
