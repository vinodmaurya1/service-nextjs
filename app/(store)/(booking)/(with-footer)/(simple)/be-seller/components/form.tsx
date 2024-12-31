"use client";

/* eslint-disable camelcase */
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { yupResolver } from "@hookform/resolvers/yup";
import { Autocomplete, MarkerF } from "@react-google-maps/api";
import { getCookie } from "cookies-next";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Pin from "@/assets/img/pin.png";
import { CreateShopBody, CreateShopCredentials } from "@/types/shop";
import { ImageTypes } from "@/types/global";
import { ImageUpload } from "@/components/image-upload";
import LoadingIcon from "@/assets/icons/loading-icon";
import { IconButton } from "@/components/icon-button";
import { shopService } from "@/services/shop";
import { useSearchAddress } from "@/hook/use-search-address";
import { TextArea } from "@/components/text-area";
import UploadLineIcon from "remixicon-react/UploadLineIcon";
import TrashIcon from "@/assets/icons/trash";
import { defaultLocation } from "@/config/global";
import { PhoneInput } from "@/components/phone-input";
import useAddressStore from "@/global-store/address";
import { error, success } from "@/components/alert";
import NetworkError from "@/utils/network-error";
import dynamic from "next/dynamic";
import { useSettings } from "@/hook/use-settings";
import { FileUpload } from "@/components/file-upload";
import DeleteBin4LineIcon from "remixicon-react/DeleteBin4LineIcon";
import Link from "next/link";

const lang = (getCookie("locale") as string) || "en";

const Map = dynamic(() =>
  import("@/components/map").then((component) => ({ default: component.Map }))
);

const shopSchema = yup.object({
  logo_image: yup.string().required("Logo image is required"),
  bg_image: yup.string().required("Background image is required"),
  documents: yup
    .array()
    .of(yup.string().required("Document is required"))
    .min(1, "At least one document is required"),
  phone: yup.string().required("Phone number is required"),
  title: yup.object({
    [lang]: yup.string().required("Shop title is required"),
  }),
  description: yup.object({
    [lang]: yup.string().required("Please write comment for your shop"),
  }),
  address: yup.object({
    [lang]: yup.string().required("Shop address is required"),
  }),
});

const BecomeSellerForm = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const country = useAddressStore((state) => state.country);
  const autoComplete = useRef<google.maps.places.Autocomplete>(null);
  const { mutate: search } = useSearchAddress();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { settings } = useSettings();
  const { mutate: createStore, isLoading: createStoreLoading } = useMutation({
    mutationFn: (body: CreateShopCredentials) => shopService.create(body),
    onError: (err: NetworkError) => error(err.message),
  });
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<CreateShopBody>({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // resolver: yupResolver(shopSchema),
    mode: "onSubmit",
    defaultValues: {
      location: {
        lat: Number(settings?.latitude) || defaultLocation.lat,
        lng: Number(settings?.longitude) || defaultLocation.lng,
      },
      documents: [],
    },
  });

  const handleCreateStore = (data: CreateShopBody) => {
    console.log(data);
    const { logo_image, bg_image, adhar_front_img, adhar_back_img,pan_img, gst_img, location, ...dataForServer } = data;
    createStore(
      {
        ...dataForServer,
        images: [logo_image, bg_image,adhar_front_img, adhar_back_img,pan_img, gst_img],
        lat_long: { latitude: location.lat, longitude: location.lng },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["profile"]);
          success(t("successfully.created"));
        },
      }
    );
  };

  const onPlaceChanged = () => {
    if (autoComplete.current !== null) {
      const position = autoComplete.current.getPlace();
      setValue("location", {
        lat: position?.geometry?.location?.lat() || 0,
        lng: position?.geometry?.location?.lng() || 0,
      });
      setValue("address", { [lang]: position?.formatted_address || "" });
    }
  };

  return (
    <section className="xl:container px-4 py-7 flex-1">
      <form onSubmit={handleSubmit(handleCreateStore)}>
        <h2 className="text-[22px] font-medium  mb-7">{t("become.partner")}</h2>
        <div className="grid xl:grid-cols-3 md:grid-cols-3 grid-cols-1 lg:gap-12 md:gap-8 gap-2">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-5">
              <h5 className="text-lg font-medium">{t("upload.images")}</h5>
              <div className="flex items-center gap-4">
                <ImageUpload
                  onChange={(value) => setValue("logo_image", value)}
                  type={ImageTypes.SHOP_LOGO}
                >
                  {({ handleClick, preview, isLoading, handleDelete }) => (
                    <div className="relative group flex-1 w-full h-full flex flex-col">
                      {preview ? (
                        <div className="relative aspect-square rounded-2xl overflow-hidden">
                          <Image
                            src={preview}
                            alt="logo_img"
                            fill
                            className=" object-cover block"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleClick}
                          className="border-dashed border rounded-2xl w-full h-full aspect-square border-borderColor inline-flex items-center justify-center flex-col hover:bg-search"
                        >
                          <UploadLineIcon />
                          <span className="text-sm underline">{t("logo.image")}</span>
                        </button>
                      )}
                      {isLoading && (
                        <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-50">
                          <LoadingIcon />{" "}
                        </div>
                      )}
                      {!!preview && (
                        <div className="absolute transition-all group-hover:opacity-100 opacity-0 w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-40">
                          <IconButton color="white" size="medium" onClick={handleDelete}>
                            <TrashIcon />
                          </IconButton>
                        </div>
                      )}
                      {!!errors?.logo_image && (
                        <p role="alert" className="text-sm text-red mt-1">
                          {t(errors.logo_image.message || "")}
                        </p>
                      )}
                    </div>
                  )}
                </ImageUpload>
                <ImageUpload
                  onChange={(value) => setValue("bg_image", value)}
                  type={ImageTypes.SHOP_BG}
                >
                  {({ handleClick, preview, isLoading, handleDelete }) => (
                    <div className="relative group flex-1 w-full h-full flex flex-col">
                      {preview ? (
                        <div className="relative aspect-square rounded-2xl overflow-hidden">
                          <Image src={preview} alt="bg_img" fill className="object-cover" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleClick}
                          className="border-dashed border w-full rounded-2xl h-full aspect-square border-borderColor inline-flex items-center justify-center flex-col hover:bg-search"
                        >
                          <UploadLineIcon />
                          <span className="text-sm underline">{t("background.image")}</span>
                        </button>
                      )}
                      {isLoading && (
                        <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search">
                          <LoadingIcon />
                        </div>
                      )}
                      {!!preview && (
                        <div className="absolute transition-all group-hover:opacity-100 opacity-0 w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-40">
                          <IconButton color="white" size="medium" onClick={handleDelete}>
                            <TrashIcon />
                          </IconButton>
                        </div>
                      )}
                      {!!errors?.logo_image && (
                        <p role="alert" className="text-sm text-red mt-1">
                          {t(errors.logo_image.message || "")}
                        </p>
                      )}
                    </div>
                  )}
                </ImageUpload>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h5 className="text-lg font-medium">{t("general")}</h5>
              <Input
                fullWidth
                error={errors.title && errors.title[lang]?.message}
                {...register(`title.${lang}`)}
                label={t("name").toString()}
                required
              />
              <PhoneInput
                error={errors.phone?.message}
                country={country?.code}
                value={watch("phone")}
                onChange={(value) => setValue("phone", value)}
              />
              <TextArea
                placeholder={t("description").toString()}
                rows={3}
                {...register(`description.${lang}`)}
                error={errors.description && errors.description[lang]?.message}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
              <h5 className="text-lg font-medium">{t("upload.documents.for.verification")}</h5>
              <FileUpload
                fileList={getValues("documents") || []}
                onChange={(value) => setValue("documents", value)}
              >
                {({ handleClick, isLoading, handleDelete, preview }) => (
                  <div className="relative group flex-1 w-full h-full flex flex-col">
                    <button
                      type="button"
                      onClick={handleClick}
                      className="relative border-dashed border w-full rounded-2xl h-40 aspect-square border-borderColor inline-flex items-center justify-center flex-col hover:bg-search"
                    >
                      {isLoading ? (
                        <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search">
                          <LoadingIcon />
                        </div>
                      ) : (
                        <>
                          <UploadLineIcon />
                          <span className="text-sm underline">{t("upload.documents")}</span>
                        </>
                      )}
                    </button>
                    {!!errors?.documents && (
                      <p role="alert" className="text-sm text-red mt-1">
                        {t(errors.documents.message || "")}
                      </p>
                    )}
                    {!!preview?.length && (
                      <div className="mt-4 flex flex-col gap-4">
                        {preview?.map((item, index) => (
                          <div key={item} className="flex justify-between items-center">
                            <Link
                              href={item}
                              target="_blank"
                              className="underline hover:text-blue-link"
                            >
                              {t("document")} {index + 1}
                            </Link>
                            <button onClick={() => handleDelete(item)} type="button">
                              <DeleteBin4LineIcon size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </FileUpload>
            </div>

            
            <div className="flex flex-col gap-5">
              <Input
                fullWidth
                {...register("adhar_no")}
                label={t("adhar_no")}
                error={errors.title && errors.title[lang]?.message}
                required
              />
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <ImageUpload
                    onChange={(value) => setValue("adhar_front_img", value)}
                    type={ImageTypes.SHOP_DOCS}
                  >
                    {({ handleClick, preview, isLoading, handleDelete }) => (
                      <div className="relative group flex-1 w-full h-full flex flex-col">
                        {preview ? (
                          <div className="relative aspect-square rounded-2xl overflow-hidden">
                            <Image
                              src={preview}
                              alt="logo_img"
                              fill
                              className=" object-cover block"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleClick}
                            className="border-dashed border rounded-2xl w-full h-full aspect-square border-borderColor inline-flex items-center justify-center flex-col hover:bg-search"
                          >
                            <UploadLineIcon />
                            <span className="text-sm underline">{t("adhar.image")}</span>
                          </button>
                        )}
                        {isLoading && (
                          <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-50">
                            <LoadingIcon />{" "}
                          </div>
                        )}
                        {!!preview && (
                          <div className="absolute transition-all group-hover:opacity-100 opacity-0 w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-40">
                            <IconButton color="white" size="medium" onClick={handleDelete}>
                              <TrashIcon />
                            </IconButton>
                          </div>
                        )}
                        {!!errors?.logo_image && (
                          <p role="alert" className="text-sm text-red mt-1">
                            {t(errors.logo_image.message || "")}
                          </p>
                        )}
                      </div>
                    )}
                  </ImageUpload>
                  <ImageUpload
                    onChange={(value) => setValue("adhar_back_img", value)}
                    type={ImageTypes.SHOP_DOCS}
                  >
                    {({ handleClick, preview, isLoading, handleDelete }) => (
                      <div className="relative group flex-1 w-full h-full flex flex-col">
                        {preview ? (
                          <div className="relative aspect-square rounded-2xl overflow-hidden">
                            <Image
                              src={preview}
                              alt="logo_img"
                              fill
                              className=" object-cover block"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleClick}
                            className="border-dashed border rounded-2xl w-full h-full aspect-square border-borderColor inline-flex items-center justify-center flex-col hover:bg-search"
                          >
                            <UploadLineIcon />
                            <span className="text-sm underline">{t("adhar.back.image")}</span>
                          </button>
                        )}
                        {isLoading && (
                          <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-50">
                            <LoadingIcon />{" "}
                          </div>
                        )}
                        {!!preview && (
                          <div className="absolute transition-all group-hover:opacity-100 opacity-0 w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-40">
                            <IconButton color="white" size="medium" onClick={handleDelete}>
                              <TrashIcon />
                            </IconButton>
                          </div>
                        )}
                        {!!errors?.logo_image && (
                          <p role="alert" className="text-sm text-red mt-1">
                            {t(errors.logo_image.message || "")}
                          </p>
                        )}
                      </div>
                    )}
                  </ImageUpload>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-5">
              <Input
                fullWidth
                {...register("pan_no")}
                label={t("pan_no")}
                error={errors.title && errors.title[lang]?.message}
                required
                />
              <Input
                fullWidth
                {...register("gst_no")}
                label={t("gst_no")}
                error={errors.title && errors.title[lang]?.message}
              />
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <ImageUpload
                    onChange={(value) => setValue("pan_img", value)}
                    type={ImageTypes.SHOP_DOCS}
                  >
                    {({ handleClick, preview, isLoading, handleDelete }) => (
                      <div className="relative group flex-1 w-full h-full flex flex-col">
                        {preview ? (
                          <div className="relative aspect-square rounded-2xl overflow-hidden">
                            <Image
                              src={preview}
                              alt="logo_img"
                              fill
                              className=" object-cover block"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleClick}
                            className="border-dashed border rounded-2xl w-full h-full aspect-square border-borderColor inline-flex items-center justify-center flex-col hover:bg-search"
                          >
                            <UploadLineIcon />
                            <span className="text-sm underline">{t("pan.image")}</span>
                          </button>
                        )}
                        {isLoading && (
                          <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-50">
                            <LoadingIcon />{" "}
                          </div>
                        )}
                        {!!preview && (
                          <div className="absolute transition-all group-hover:opacity-100 opacity-0 w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-40">
                            <IconButton color="white" size="medium" onClick={handleDelete}>
                              <TrashIcon />
                            </IconButton>
                          </div>
                        )}
                        {!!errors?.logo_image && (
                          <p role="alert" className="text-sm text-red mt-1">
                            {t(errors.logo_image.message || "")}
                          </p>
                        )}
                      </div>
                    )}
                  </ImageUpload>
                  <ImageUpload
                    onChange={(value) => setValue("gst_img", value)}
                    type={ImageTypes.SHOP_DOCS}
                  >
                    {({ handleClick, preview, isLoading, handleDelete }) => (
                      <div className="relative group flex-1 w-full h-full flex flex-col">
                        {preview ? (
                          <div className="relative aspect-square rounded-2xl overflow-hidden">
                            <Image
                              src={preview}
                               alt="logo_img"
                              fill
                              className=" object-cover block"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleClick}
                            className="border-dashed border rounded-2xl w-full h-full aspect-square border-borderColor inline-flex items-center justify-center flex-col hover:bg-search"
                          >
                            <UploadLineIcon />
                            <span className="text-sm underline">{t("gst.image")}</span>
                          </button>
                        )}
                        {isLoading && (
                          <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-50">
                            <LoadingIcon />{" "}
                          </div>
                        )}
                        {!!preview && (
                          <div className="absolute transition-all group-hover:opacity-100 opacity-0 w-full h-full top-0 left-0 flex items-center justify-center text-lg bg-search bg-opacity-40">
                            <IconButton color="white" size="medium" onClick={handleDelete}>
                              <TrashIcon />
                            </IconButton>
                          </div>
                        )}
                        {!!errors?.logo_image && (
                          <p role="alert" className="text-sm text-red mt-1">
                            {t(errors.logo_image.message || "")}
                          </p>
                        )}
                      </div>
                    )}
                  </ImageUpload>
                </div>
              </div>
            </div>

          </div>
          <div className="flex flex-col gap-5">
            <h5 className="text-lg font-medium">{t("address")}</h5>

            {map && (
              <Autocomplete
                onLoad={(autocomplete) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  autoComplete.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
              >
                <Input
                  label={t("address").toString()}
                  // value={"noida , india"}
                  value={watch("address") ? watch("address")[lang] : ""}
                  onChange={(e) => setValue("address", { [lang]: e.target.value })}
                  error={errors?.address && errors?.address[lang]?.message}
                  fullWidth
                  required
                />
              </Autocomplete>
            )}
            <Map
              onLoad={(loadedMap) => {
                setMap(loadedMap);
              }}
              onClick={(e) => {
                setValue("location", { lat: e.latLng?.lat() || 0, lng: e.latLng?.lng() || 0 });
                search(
                  { lat: e.latLng?.lat(), lng: e.latLng?.lng() },
                  {
                    onSuccess: (res) => {
                      setValue("address", { [lang]: res?.results[0]?.formatted_address });
                    },
                  }
                );
              }}
              containerStyles={{ height: "400px", borderRadius: "15px" }}
              options={{
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                minZoom: 3,
                center: watch("location")
                  ? { lat: watch("location")?.lat || 0, lng: watch("location")?.lng || 0 }
                  : undefined,
              }}
            >
              {watch("location") && (
                <MarkerF
                  icon={Pin.src}
                  position={{ lat: watch("location").lat || 0, lng: watch("location").lng || 0 }}
                />
              )}
            </Map>
          </div>
        </div>
        <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-12 my-4">
          <Button type="submit" fullWidth loading={createStoreLoading}>
            {t("save")}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default BecomeSellerForm;
