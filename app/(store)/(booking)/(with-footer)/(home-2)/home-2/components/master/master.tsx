"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSettings } from "@/hook/use-settings";
import { shopService } from "@/services/shop";
import { vendorService } from "@/services/vendor";
import { useTranslation } from "react-i18next";
import { Paginate } from "@/types/global";
import { Shop } from "@/types/shop";
import { extractDataFromPagination } from "@/utils/extract-data";
import { ListHeader } from "@/components/list-header";
import { VendorCardUi } from "@/components/vendor-card/vendor-card-ui";
import { Swiper, SwiperSlide } from "swiper/react";
import { buildUrlQueryParams } from "@/utils/build-url-query-params";
import { MasterCard } from "@/components/master-card";


export const Master = ({data} ) => {
  const { language } = useSettings();
  const { t } = useTranslation();
  const { data: shops } = useInfiniteQuery(
    {
      initialData: data ? { pages: [data], pageParams: [1] } : undefined,
    }
  );

  // const shopList = extractDataFromPagination(shops?.pages);
  const shopList = data?.data;


  console.log("masterlist", shopList)

  return (
    <div className="mb-14">
      <ListHeader
        title={t("masters")}
        link={buildUrlQueryParams("/masters", { column: "rate", sort: "desc" })}
      />
      <Swiper
        breakpoints={{
          992: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          562: {
            slidesPerView: 2.4,
            spaceBetween: 20,
          },
          0: {
            slidesPerView: 1.4,
            spaceBetween: 8,
          },
        }}
        className="!z-0"
      >
        {shopList?.map((shop) => (
          <SwiperSlide key={shop.id}>
            <MasterCard data={shop} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
