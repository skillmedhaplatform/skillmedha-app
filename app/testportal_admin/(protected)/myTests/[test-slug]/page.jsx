"use client";
import React, { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

const FormPage = () => {
  const nav = useRouter();
  const currPath = usePathname();
  const param = useParams();

  useEffect(() => {
    if ("/testportal_admin/myTests/" + param["test-slug"] == currPath)
      nav.replace("/testportal_admin/myTests/" + param["test-slug"] + "/about");
  }, [currPath, nav, param]);

  return null;
};

export default FormPage;
