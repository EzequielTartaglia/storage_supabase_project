"use client";

import {
  getPlatformUsers,
  getPlatformUsersFromBusiness,
  deletePlatformUser,
} from "@/src/controllers/platform/platform_user/platform_user";
import { getPlatformUserRoles } from "@/src/controllers/platform/platform_user_role/platform_user_role";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";
import { useUserInfoContext } from "@/contexts/UserInfoContext";

import PageHeader from "@/components/page_formats/PageHeader";
import Table from "@/components/tables/Table";
import UserRoleFilter from "@/components/filters/users_filters/UserRoleFilter";
import UserStatusFilter from "@/components/filters/users_filters/UserStatusFilter";
import SearchInput from "@/components/SearchInput";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const { user } = useUserInfoContext();
  const { showNotification } = useNotification();

  const router = useRouter();

  useEffect(() => {
    async function fetchUsersAndRoles() {
      try {
        const fetchedRoles = await getPlatformUserRoles();
        setRoles(fetchedRoles);
  
        let fetchedUsers;
        if (user?.user_role_id === 6 || user?.user_role_id === 7) {
          fetchedUsers = await getPlatformUsers();
        } else {
          fetchedUsers = await getPlatformUsersFromBusiness(user?.platform_user_business_id);
        }
  
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    }
  
    if (user) {
      fetchUsersAndRoles();
    }
  }, [user]);
  

  const handleDeleteUser = async (id) => {
    try {
      const userToDelete = users.find((user) => user.id === id);

      const roleErrorMessages = {
        2: "No se puede eliminar este usuario con tus permisos de supervisor.",
        3: "No se puede eliminar este usuario con tus permisos de administrativo.",
        4: "No se puede eliminar este usuario con tus permisos de gerente.",
        6: "No se puede eliminar este usuario.",
        7: "No se puede eliminar este usuario.",
      };

      // Supervisor can't delete admin or manager
      if (
        user.user_role_id === 2 &&
        [3, 4].includes(userToDelete.user_role_id)
      ) {
        showNotification(roleErrorMessages[2], "danger");
        return;
      }

      // Admin can't delete manager
      if (user.user_role_id === 3 && userToDelete.user_role_id === 4) {
        showNotification(roleErrorMessages[3], "danger");
        return;
      }

      // Whoever can't delete root
      if (userToDelete.user_role_id === 6) {
        showNotification(roleErrorMessages[6], "danger");
        return;
      }

      await deletePlatformUser(id);
      showNotification("¡Usuario eliminado exitosamente!", "info");

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error.message);
      showNotification("Error al eliminar el usuario.", "danger");
    }
  };

  const columns = [
    "first_name",
    "last_name",
    "phone",
    "email",
    "user_role",
    "is_active",
  ];
  const columnAliases = {
    first_name: "Nombre",
    last_name: "Apellido",
    phone: "Celular",
    email: "Correo Electrónico",
    user_role: "Rol",
    is_active: "Actividad",
  };

  const filteredData = users
    .filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email.toLowerCase();
      const query = searchTerm.toLowerCase();
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        user.phone.includes(query)
      );
    })
    .filter((user) => {
      if (statusFilter === "all") {
        return true;
      }
      return statusFilter === "online" ? user.is_active : !user.is_active;
    })
    .filter((user) => {
      if (roleFilter === "all") {
        return true;
      }
      return user.user_role_id === parseInt(roleFilter);
    })
    .map((user) => {
      const userRole = roles.find((role) => role.id === user.user_role_id);
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
        user_role: userRole ? userRole.name : "N/A",
        is_active: user.is_active ? "En línea" : "Desconectado",
      };
    });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
  };

  const hasApprove = (item) => {
    return;
  };

  const hasShow = (item) => {
    return;
  };

  const hasEdit = (item) => {
    return;
  };

  return (
    <>
      <PageHeader
        title={"Usuarios"}
        goBackRoute={"/platform"}
        goBackText={"Volver al inicio"}
      />

      <div className="p-4 box-theme shadow rounded-lg mb-4 w-full">
        <div className="flex justify-center mb-4">
          <SearchInput
            placeholder="Buscar correo electronico o curso..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <UserStatusFilter
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
          />

          <UserRoleFilter
            roleFilter={roleFilter}
            roles={roles}
            onRoleChange={handleRoleChange}
          />
        </div>
      </div>

      <Table
        title={"Usuarios registrados"}
        buttonAddRoute={
          user.user_role_id === 2 ||
          user.user_role_id === 3 ||
          user.user_role_id === 4 ||
          user.user_role_id === 6 ||
          user.user_role_id === 7
            ? `/platform/users/sign_up`
            : null
        }
        columns={columns}
        data={filteredData}
        columnAliases={columnAliases}
        hasShow={hasShow}
        hasEdit={hasEdit}
        hasDelete={true}
        buttonDeleteRoute={handleDeleteUser}
        hasApprove={hasApprove}
        confirmModalText={"¿Estás seguro de que deseas eliminar este usuario?"}
      />
    </>
  );
}
