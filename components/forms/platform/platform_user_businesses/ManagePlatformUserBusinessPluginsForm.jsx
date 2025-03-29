"use client";

import { getPlatformUserBusiness, editPlatformUserBusinessEnabledPlugins } from "@/src/controllers/platform/platform_user_business/platform_user_business";
import { getPlatformPlugins } from "@/src/controllers/platform/platform_plugin/platform_plugin";

import { useNotification } from "@/contexts/NotificationContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/page_formats/PageHeader";
import SubmitLoadingButton from "../../SubmitLoadingButton";
import MultiSelectInput from "../../MultiSelectInput";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ManagePlatformUserBusinessPluginsForm({
  platformUserBusinessId,
}) {
  const [platformUserBusiness, setPlatformUserBusiness] = useState(null);

  const [pluginsTable, setPluginsTable] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchPlatformUserBusiness = async () => {
      try {
        const fetchedPlatformUserBusiness = await getPlatformUserBusiness(
          platformUserBusinessId
        );
        const plugins = await getPlatformPlugins();
        setPluginsTable(plugins);

        if (fetchedPlatformUserBusiness.id === 1) {
          setIsEditable(false);
        }

        const parsedEnabledPlugins =
          typeof fetchedPlatformUserBusiness?.enabled_plugins === "string"
            ? JSON.parse(fetchedPlatformUserBusiness?.enabled_plugins)
            : fetchedPlatformUserBusiness?.enabled_plugins;

        const selectedPluginIds =
          parsedEnabledPlugins?.map((plugin) => plugin.id || plugin) || [];

        setPlatformUserBusiness({
          ...fetchedPlatformUserBusiness,
          enabled_plugins: selectedPluginIds,
        });
      } catch (error) {
        console.error("Error fetching platform user business:", error.message);
      }
    };

    fetchPlatformUserBusiness();
  }, [platformUserBusinessId]);

  const handleMultiSelectChange = (selectedPlugins) => {
    setPlatformUserBusiness({
      ...platformUserBusiness,
      enabled_plugins: selectedPlugins.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!platformUserBusiness.name || !isEditable) {
      return;
    }

    setIsLoading(true);

    try {
      await editPlatformUserBusinessEnabledPlugins(
        platformUserBusinessId,
        JSON.stringify(platformUserBusiness.enabled_plugins)
      );

      showNotification(
        "¡Plugins habilitados de la empresa editados exitosamente!",
        "success"
      );

      setTimeout(() => {
        setIsLoading(false);
        router.push(`/platform/platform_user_businesses`);
      }, 2000);
    } catch (error) {
      console.error(
        "Error trying to update control center user business enabled_plugins:",
        error.message
      );
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlatformUserBusiness({ ...platformUserBusiness, [name]: value });
  };

  if (isLoading || !platformUserBusiness?.enabled_plugins) {
    return <LoadingSpinner />;
  }

  if (!isEditable) {
    return (
      <div className="p-4 box-theme shadow rounded-lg text-center">
        <p>No se puede editar los plugins habilitados de la empresa.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={platformUserBusiness.name}
        subtitle="Administrar plugins habilitados"
        goBackRoute="/platform/platform_user_businesses"
        goBackText="Volver al listado de empresas asociadas al sistema"
      />

      {platformUserBusiness?.enabled_plugins && (
        <form onSubmit={handleSubmit} className="box-theme">
          <MultiSelectInput
            label="Plugins habilitados"
            name="enabled_plugins"
            value={platformUserBusiness?.enabled_plugins}
            onChange={handleMultiSelectChange}
            table={pluginsTable}
            columnName="name"
            idColumn="id"
            required
            isSubmitted={isSubmitted}
            errorMessage="Debe seleccionar al menos un plugin"
          />

          <SubmitLoadingButton isLoading={isLoading} type="submit">
            Editar plugins habilitados de la empresa
          </SubmitLoadingButton>
        </form>
      )}
    </>
  );
}
