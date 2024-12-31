import { Shop } from "@/types/shop";
import React from "react";
import Link from "next/link";
import { ImageWithFallBack } from "@/components/image";
import Image from "next/image";
import MapPinIcon from "@/assets/icons/map-pin";
import { useTranslation } from "react-i18next";
import { createRatingText } from "@/utils/create-rating-text";
import { useLike } from "@/hook/use-like";
import { IconButton } from "@/components/icon-button";
import HeartLightIcon from "@/assets/icons/heart-light";
import HeartIcon from "@/assets/icons/heart";
import StarCurvedIcon from "@/assets/icons/star-curved";
import HeartFillOutlinedIcon from "@/assets/icons/heart-fill-outlined";
import HeartOutlinedIcon from "@/assets/icons/heart-outlined";
import Cross from "@/assets/icons/cross";
import CheckGreen3Icon from "@/assets/icons/check-green-3";

interface ShopCardProps {
  data: Shop;
}

export const VendorCardUi = ({ data }: ShopCardProps) => {
  const { t } = useTranslation();
  const { isLiked, handleLikeDisLike } = useLike("shop", data.id);
  return (
    <div className="relative rounded-button overflow-hidden group shadow-storeCard justify-start">
      <div className="absolute top-3 right-3 z-[1] text-dark">
        <IconButton onClick={handleLikeDisLike}>
          {isLiked ? <HeartIcon /> : <HeartLightIcon />}
        </IconButton>
      </div>

      <Link href={`/shops/${data.slug}`} scroll>
        <div className="relative aspect-[2/1]">
          <ImageWithFallBack
            src={data.img}
            alt={data.translation?.name || ""}
            fill
            className="object-cover transition-all group-hover:scale-105"
          />
          {/* <div className="absolute -bottom-5 rounded-full bg-white w-10 h-10 left-6 flex items-center justify-center z-[1]">
            <Image
              src={data.img}
              alt={data.translation?.title || "shoplogo"}
              width={36}
              height={36}
              className="rounded-full object-cover w-9 h-9"
            />
          </div> */}
        </div>
        <div className="flex flex-col gap-3 z-[2] xl:pb-5 xl:px-6 lg:pb-3 lg:px-3 pb-2 px-1">
          <div className="flex flex-col gap-1.5">
            <strong className="text-lg font-semibold mt-7 line-clamp-1">
              {data.name}
            </strong>
            <span className="text-sm text-gray-field line-clamp-2">
              {data.translation?.description}
            </span> 
            <div className="flex">
              <div style={{fontSize:"14px"}}>{data.open === 2 ? "Close" : "Open"}</div>
            <IconButton  color="white" size="small" style={{aspectRatio:0}}>
            {data.open === 2 ? <Cross size={16} color="red" /> : <CheckGreen3Icon size={16}/>}
          </IconButton>
            </div>
            
          </div>
          {/* <div className="flex items-center gap-1">
            <MapPinIcon />
            <span className="text-xs text-gray-field">
              {data?.distance} {t("km.away.from.you")}
            </span>
          </div> */}
          <div className="h-px w-full bg-gray-link" />
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{createRatingText(data.r_avg)}</span>
              <div className="bg-footerBg rounded-full w-1 h-1" />
              <span className="text-sm font-normal">
                {data.r_count || 0} {t("reviews")}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <StarCurvedIcon />
              <span className="text-sm font-semibold text-black">{data.r_avg || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
