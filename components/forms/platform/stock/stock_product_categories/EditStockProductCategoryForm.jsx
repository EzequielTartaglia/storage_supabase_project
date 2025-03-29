"use client";

import {
  getProductCategory,
  editProductCategory,
} from "@/src/controllers/platform/product_category/product_category";

import { useNotification } from "@/contexts/NotificationContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserInfoContext } from "@/contexts/UserInfoContext";

import Input from "@/components/forms/Input";
import PageHeader from "@/components/page_formats/PageHeader";
import TextArea from "@/components/forms/TextArea";
import SubmitLoadingButton from "@/components/forms/SubmitLoadingButton";


export default function EditStockProductCategoryForm({
  stockProductCategoryId,
}) {

  const { user } = useUserInfoContext();

  const [productCategory, setProductCategory] = useState({
    name: "",
    description: "",
    platform_user_business_id: null,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProductCategory = async () => {
      try {
        const fetchedProductCategory = await getProductCategory(
          stockProductCategoryId
        );
        setProductCategory(fetchedProductCategory);
      } catch (error) {
        console.error("Error fetching the product category:", error.message);
      }
    };
    fetchProductCategory();
  }, [stockProductCategoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!productCategory.name) {
      return;
    }

    setIsLoading(true);

    try {
      await editProductCategory(
        stockProductCategoryId,
        productCategory.name,
        productCategory.description,
        productCategory.platform_user_business_id
      );

      showNotification("¡Categoria editada exitosamente!", "success");

      setTimeout(() => {
        setIsLoading(false);
        router.push(`/platform/stock/stock_product_categories`);
      }, 2000);
    } catch (error) {
      console.error("Error editing product category:", error.message);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductCategory({ ...productCategory, [name]: value });
  };

  return (
    <>
      <PageHeader
        title="Editar categoria"
        goBackRoute="/platform/stock/stock_product_categories"
        goBackText="Volver al listado de categorias"
      />

      <form onSubmit={handleSubmit} className="box-theme">
        <Input
          label="Nombre"
          name="name"
          value={productCategory.name}
          required={true}
          placeholder=""
          onChange={handleInputChange}
          isSubmitted={isSubmitted}
          errorMessage="Campo obligatorio"
        />

        <TextArea
          label="Descripcion"
          name="description"
          value={productCategory.description}
          placeholder="Escribe una breve descripción de la categoria..."
          onChange={handleInputChange}
          isSubmitted={isSubmitted}
        />

        <SubmitLoadingButton isLoading={isLoading} type="submit">
          Editar categoria
        </SubmitLoadingButton>
      </form>
    </>
  );
}
