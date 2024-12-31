import { ProductGallery } from "@/types/product";
import { Coordinate, Location, Translation } from "./global";

interface ShopTranslation extends Translation {
  description: string;
  address: string;
}

export interface ShopClosedDate {
  id: number;
  day: string;
}

export interface WorkingDay {
  id: number;
  created_at: string;
  day: string;
  from: string;
  to: string;
  updated_at: string;
  disabled?: boolean;
}

export interface ShopSocial {
  id: number;
  content: string;
  type: string;
}

export interface Shop {
  background_img: string;
  close_time: string;
  open_time: string;
  created_at: string;
  id: number;
  lat_long: Location;
  logo_img: string;
  open: boolean;
  percentage: number;
  status: string;
  status_note: string;
  tax: number;
  translation: ShopTranslation | null;
  updated_at: string;
  user_id: number;
  uuid: string;
  visibility: boolean;
  verify: boolean;
  shop_working_days: WorkingDay[];
  r_avg?: number;
  r_count?: number;
  distance?: number;
  shop_closed_date: ShopClosedDate[];
  slug: string;
  delivery_time: {
    to: string;
    from: string;
    type: string;
  };
  phone?: string;
  socials?: ShopSocial[];
}

export interface IDelivery {
  active: boolean;
  create_at: string;
  id: number;
  note: string;
  price: number;
  shop_id: number;
  times: string[];
  translation: Translation | null;
  type: string;
  updated_at: string;
}

export interface ShopDetail extends Shop {
  seller: {
    fistname: string;
    lastname: string;
    id: number;
    role: string;
  };
  rating_avg: string;
  subscription: {
    id: number;
    shop_id: number;
    subscription_id: number;
    expired_at: string;
    price: number;
    type: string;
    active: number;
    created_at: string;
    updated_at: string;
  };
}

export interface StoreWithDelivery extends Shop {
  deliveries: IDelivery[];
}


type ImageField = string | undefined;

export interface CreateShopCredentialsFirst {
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  title: string;
  description: string;
  address: string;
  firstname: string;
  lastname: string;
  referral?: string | null;
  password?: string | null;
  password_confirmation?: string | null;
  verifyCode?: string | null;
  pan_no: string;
  name: string;
  adhar_no: string;
  logo_image?: ImageField;
  bg_image?: ImageField;
  pan_img?: ImageField;
  pan_img_back?: ImageField;
  adhar_img?: ImageField;
  adhar_img_back?: ImageField;
  type: string;
}


export interface CreateShopBodyFirst {
  phone:  { [lang: string]: string };
  title: { [lang: string]: string };  // Object with language keys
  description: { [lang: string]: string };  // Object with language keys
  firstname:  { [lang: string]: string };  // Should be a string if it's not localized
  lastname:  { [lang: string]: string };  // Should be a string if it's not localized
  address:  { [lang: string]: string };  // Should be a string if it's not localized
  referral: string | null;
  otp: string | null;
  password: string | null;
  password_confirmation: string | null;
  location: {
    lat: number;
    lng: number;
  };
  logo_image: string;
  bg_image: string;
}

export interface CreateShopCredentials {
  lat_long: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  title: {
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  address: {
    [key: string]: string;
  };
  pan_no: {
    [key: string]: string;
  };
  gst_no: {
    [key: string]: string;
  };
  adhar_no: {
    [key: string]: string;
  };
  images: string[];
}

export interface CreateShopBody
  extends Omit<
    CreateShopCredentials,
    "images" | "location" | "open_time" | "close_time" | "delivery_time_type" | "delivery_type"
  > {
  location: Coordinate;
  logo_image: string;
  bg_image: string;
  pan_img:string;
  gst_img:string;
  adhar_front_img:string;
  adhar_back_img:string;
  documents: string[];
}

export interface ShopGallery {
  id: number;
  shop_id: number;;
  galleries: ProductGallery[];
}

export interface ShopTag {
  translation?: Translation;
  id: number;
}

export interface ShopFilter {
  order_by: { [key: string]: string };
  service_type: { [key: string]: string };
  service_min_price: number;
  service_max_price: number;
  interval_min: number;
  interval_max: number;
  takes: [];
  gender: { [key: string]: string };
  categories: [];
}
