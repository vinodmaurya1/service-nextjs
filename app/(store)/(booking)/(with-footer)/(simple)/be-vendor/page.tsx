"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { LoadingCard } from "@/components/loading";
import BecomeVendorForm from "./components/form";
import SignupForm from "./components/signupForm";


const BecomeVendorPage = () => {

  return <>
  
  <BecomeVendorForm />
  {/* <SignupForm/> */}
  
  </>;
};

export default BecomeVendorPage;
