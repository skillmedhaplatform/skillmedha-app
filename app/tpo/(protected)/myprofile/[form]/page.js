import React, { use } from "react";
import { formSchemas } from "../(components)/formschema";
import DynamicForm from "../(components)/dynamicform";
import styles from "../form.module.scss";
import { profileSidebarItems } from "../(components)/sidebarData";

export async function generateStaticParams() {
  return profileSidebarItems?.map((item) => {
    const form = item.path.split("/").pop();
    return { form };
  });
}

export default function FormsPage({ params }) {
  const resolvedParams = params && typeof params.then === "function" ? use(params) : params;
  const { form } = resolvedParams || {};
  const currentForm = formSchemas[form];

  return (
    <div className={styles.formContainer}>
      <DynamicForm schema={currentForm} />
    </div>
  );
}
