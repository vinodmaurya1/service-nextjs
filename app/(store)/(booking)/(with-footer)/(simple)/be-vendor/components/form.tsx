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
import { CreateShopBody, CreateShopCredentials ,CreateShopCredentialsFirst,CreateShopBodyFirst} from "@/types/shop";
import { ImageTypes } from "@/types/global";
import { ImageUpload } from "@/components/image-upload";
import LoadingIcon from "@/assets/icons/loading-icon";
import { IconButton } from "@/components/icon-button";
import { shopService } from "@/services/shop";
import { vendorService } from "@/services/vendor";
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
import { FieldError } from "react-hook-form";
import StoreWaiting from "./waiting";
import { ImageVendorUpload } from "@/components/image-upload/image-vendor-upload";
import { useRouter } from "next/navigation";


const lang = (getCookie("locale") as string) || "en";

const Map = dynamic(() =>
  import("@/components/map").then((component) => ({ default: component.Map }))
);

const shopSchema = yup.object({
  phone: yup.string().required("Phone number is required"),
  title: yup.object({
    [lang]: yup.string().required("Shop title is required"),
  }),
  description: yup.object({
    [lang]: yup.string().required("Please write comment for your shop"),
  }),
  firstname: yup.string().required("First name is required"),
  verifyCode: yup.string().required("OTP name is required"),
  lastname: yup.string().required("Last name is required"),
  referral: yup.string().notRequired(),
  password: yup.string().required("Password is required"),
  password_confirmation: yup
    .string()
    .nullable()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});


const BecomeVendorForm = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const country = useAddressStore((state) => state.country);
  const autoComplete = useRef<google.maps.places.Autocomplete>(null);
  const { mutate: search } = useSearchAddress();
  const router = useRouter();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { settings } = useSettings();
  const [getOTP, setGetOTP] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
    const [currentView, setCurrentView] = useState("SIGNUP");

  
  const lat= 28.6496;
  const lng = 77.3406 ;

  const { mutate: createStore, isLoading: createStoreLoading } = useMutation({
    mutationFn: (body: CreateShopCredentialsFirst) => vendorService.create(body),
    onError: (err: NetworkError) => error(err.message),
  });
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // resolver: yupResolver(shopSchema),
    mode: "onSubmit",
    defaultValues: {
      location: {
        // lat: Number(settings?.latitude) || defaultLocation.lat,
        // lng: Number(settings?.longitude) || defaultLocation.lng,
        lat:28.6496,
        lng:77.3406
      },
    },
  });

  const handleCreateStore = (data: CreateShopCredentialsFirst) => {
    try {
      const {
        location, firstname, lastname, referral, password, name,
        password_confirmation, phone, title, description, 
        address, verifyCode, logo_image = "", bg_image = "", type="2",
        pan_img = "", adhar_img = "", pan_no, adhar_no 
      } = data;
  
      if (!location || location.lat === undefined || location.lng === undefined) {
        throw new Error("Location is missing or incomplete");
      }
  
      createStore(
        {
          firstname,
          lastname,
          referral: referral || null,
          password: password || null,
          password_confirmation: password_confirmation || null,
          location: {
            lat: location.lat,
            lng: location.lng
          },
          phone, 
          title, 
          description, 
          name,
          address,
          verifyCode: verifyCode || null,
          logo_image, 
          bg_image, 
          pan_img, 
          adhar_img, 
          pan_no, 
          adhar_no,
          type,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["profile"]);
            success(t("successfully.created"));
            router.push('/success')
          },
          onError: (err) => {
            console.error("Error creating store:", err);
            error(err.message || "An error occurred");
          },
        }
      );
    } catch (err) {
      console.error("Form submission error:", err);
      error(err.message || "An unexpected error occurred");
    }
  };
  
  
  
  
  const handleSendOTP = async () => {
    const phoneNumber = watch("phone") || ""; // Replace with the actual phone number
    console.log(phoneNumber)
    if(phoneNumber === ''){
      error("Invaid Phone Number")
      return
    }
    try {
      setOtpLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}v1/auth/signup-vendor-send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: phoneNumber })
      });
  
      const data = await response.json();

      if(data?.status === true){
        success(data.message);
        setGetOTP(data?.data?.otp)
      }else{
        error(t("internal.error"));
      }
      console.log(data);
      setOtpLoading(false)
    } catch (error) {
      console.log('Error sending OTP:', error);
      setOtpLoading(false)
    }
  };
  
  const handleNext = async () => {
    const fname = watch("firstname")?.trim() || "";
    const lname = watch("lastname")?.trim() || "";
    const password = watch("password")?.trim() || "";
    const cpassword = watch("password_confirmation")?.trim() || "";
    const phoneNumber = watch("phone")?.trim() || "";
    const otp = watch("verifyCode")?.trim() || "";
    const desc = watch("description")?.en.trim() || "";
  
    // Check required fields
    if (!phoneNumber) {
      error("Invalid Phone Number");
      return;
    }
  
    if (!fname) {
      error("First name is required");
      return;
    }
  
    if (!lname) {
      error("Last name is required");
      return;
    }
  
    if (!password) {
      error("Password is required");
      return;
    }
  
    if (password !== cpassword) {
      error("Passwords must match");
      return;
    }
  
    if (!otp) {
      error("OTP is required");
      return;
    }
  
    // Proceed to the next step if all validations pass
    await setCurrentView("SECONDSTEP");
  };
  
  
  

  const onPlaceChanged = () => {
    if (autoComplete.current === null) {
      console.error("Autocomplete instance is not initialized");
      return;
    }
  
    const position = autoComplete.current.getPlace();
  
    if (!position) {
      console.error("No place details available");
      return;
    }
  
    const lat = position?.geometry?.location?.lat?.() || 0;
    const lng = position?.geometry?.location?.lng?.() || 0;
    const address = position?.formatted_address || "";
  
    if (!lat || !lng) {
      console.error("Invalid latitude or longitude");
      return;
    }
  
    if (!lang) {
      console.error("lang is undefined");
      return;
    }
  
    // Update values
    setValue("location", { lat, lng });
    setValue("address", {
      en: position?.formatted_address || "", // Provide a default value for 'en'
      [lang]: position?.formatted_address || "", // Dynamic key
    });
    
  };

  type FormErrors = {
    phone?: FieldError;
    firstname?: FieldError;
    lastname?: FieldError;
    referral?: FieldError;
    password?: FieldError;
    verifyCode?: FieldError;
    pan_no?: FieldError;
    adhar_no?: FieldError;
    pan_img?: FieldError;
    adhar_img?: FieldError;
  };
  
  const err: FormErrors = {}; // Replace this with your form errors state
  
  
  const getErrorMessage = (error: FieldError | undefined): string | undefined =>error?.message;

  const phoneValue = typeof watch("phone") === "object" ? watch("phone")?.en : watch("phone");


  function createShopFirst (datas){
    console.log("datas", datas)
  }



        return (
    <section className="xl:container px-4 py-7 flex-1">
      <form onSubmit={handleSubmit(handleCreateStore)}>
        <h2 className="text-[22px] font-medium  mb-7">{t("become.seller")}</h2>
{ currentView === 'SIGNUP' ?
        <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-12 md:gap-8 gap-4">
          <div className="flex flex-col gap-16">
            
            <div className="flex flex-col gap-5">
              <h5 className="text-lg font-medium">{t("general")}</h5>
              <Input
                fullWidth
                {...register("firstname")}
                label={t("firstname")}
                error={getErrorMessage(err.firstname)}
              />

              <Input
                fullWidth
                {...register("lastname")}
                label={t("lastname")}
                error={getErrorMessage(err.lastname)}
              />
              <Input
                fullWidth
                {...register("referral")}
                label={t("referral")}
                error={getErrorMessage(err.referral)}
              />
              <Input
                fullWidth
                {...register("password")}
                label={t("password")}
                type="password"
                error={getErrorMessage(err.password)}
              />

              <Input
                fullWidth
                {...register("password_confirmation")}
                label={t("password.confirmation")}
                type="password"
                error={errors.password_confirmation?.message}
              />
              {/* <Input
                fullWidth
                error={errors.title && errors.title[lang]?.message}
                {...register(`title.${lang}`)}
                label={t("name").toString()}
                required
              /> */}

            <div className="flex" >
              <PhoneInput 
                error={getErrorMessage(err.phone)}
                country={"in"}
                value={watch("phone") || ""} // Access the 'en' property or default to an empty string
                onChange={(value) => setValue("phone", value)} // Wrap the value in an object
              />
              <div style={{cursor:"pointer"}} class="outline-none focus:outline-none rounded-button overflow-hidden text-ellipsis whitespace-nowrap  inline-flex items-center gap-2 justify-center active:translate-y-px hover:brightness-95 focus-ring disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 text-xs font-medium py-4 px-4 bg-primary text-white disabled:bg-gray-placeholder" loading={otpLoading} onClick={handleSendOTP}>
                {t("get.otp")}
              </div>
              </div>
             {getOTP !== '' && 
             <>
              <div>{getOTP} </div> 
             <Input
                fullWidth
                {...register("verifyCode")}
                label={t("otp")}
                error={getErrorMessage(err.verifyCode)}
              /></>}
              <TextArea
                placeholder={t("description").toString()}
                rows={3}
                {...register(`description`)}
                error={errors.description && errors.description[lang]?.message}
              />
            </div>

          </div>
          <div className="flex flex-col gap-16 xl:col-span-2">
            <div className="flex flex-col gap-5">
              <h5 className="text-lg font-medium">{t("address")}</h5>

              <Input
                label={t("address").toString()}
                {...register("address")}
                value={"noida , india"}
                onChange={(e) =>
                  setValue("address", { 
                    en: "", // Provide a default value for `en` 
                    [lang]: e.target.value 
                  })
                }
                error={errors?.address && errors?.address[lang]?.message}
                fullWidth
              />


              {/* {map && (
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
                    value={"noida , india"}
                    // value={watch("address") ? watch("address")[lang] : ""}
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
              </Map> */}
            </div>
          </div>
        </div>
:

<>
        <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-12 md:gap-8 gap-4">
        <div className="flex flex-col gap-10">
        {/* <h5 className="text-lg font-medium">{t("upload.images")}</h5> */}
        <Input
                fullWidth
                {...register("name")}
                label={t("shop.name")}
                error={getErrorMessage(err.name)}
              />
        <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <ImageVendorUpload
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
                </ImageVendorUpload>
                <ImageVendorUpload
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
                </ImageVendorUpload>
              </div>
            </div>
            </div>
          <div className="flex flex-col gap-16">
            
            <div className="flex flex-col gap-5">
              <Input
                fullWidth
                {...register("pan_no")}
                label={t("pan_no")}
                error={getErrorMessage(err.pan_no)}
              />
<div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <ImageVendorUpload
                  onChange={(value) => setValue("pan_img", value)}
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
                </ImageVendorUpload>
                <ImageVendorUpload
                  onChange={(value) => setValue("pan_img_back", value)}
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
                          <span className="text-sm underline">{t("pan.back.image")}</span>
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
                </ImageVendorUpload>
              </div>
            </div>
            </div>
           
          </div>
          
          <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-5">
              <Input
                fullWidth
                {...register("adhar_no")}
                label={t("adhar_no")}
                error={getErrorMessage(err.adhar_no)}
              />
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <ImageVendorUpload
                  onChange={(value) => setValue("adhar_img", value)}
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
                </ImageVendorUpload>
                <ImageVendorUpload
                  onChange={(value) => setValue("adhar_img_back", value)}
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
                          <span className="text-sm underline">{t("adhar.back.image")}</span>
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
                </ImageVendorUpload>
              </div>
            </div>
              
            </div>
          </div>
          
        </div>
        </>
        }

        <div className="grid xl:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-12 my-4">
        {  currentView === 'SIGNUP' ? 
        <button class="outline-none focus:outline-none rounded-button overflow-hidden text-ellipsis whitespace-nowrap  inline-flex items-center gap-2 justify-center active:translate-y-px hover:brightness-95 focus-ring disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 text-xs font-medium py-4 px-4 bg-primary text-white disabled:bg-gray-placeholder"
         onClick={()=> setCurrentView("SECONDSTEP")} >
            {t("next")}
          </button> 
          :
          <>
        <Button size="small"
          color="blackOutlined" fullWidth onClick={()=>setCurrentView('SIGNUP')} >
            {t("back")}
          </Button> 
        <Button type="submit" fullWidth loading={createStoreLoading} >
            {t("save")}
          </Button>
          </>
          }
        </div>
      </form>
    </section> 
    
  //       );
  //     case "SECONDSTEP":
  //       return (
  //         <>
          
  //       </>
  //       );
  //     case "COMPLETE":
  //       return (
  //         <StoreWaiting />
  //       );
  //   }
  // };
  // return renderView();

        );
};

export default BecomeVendorForm;
