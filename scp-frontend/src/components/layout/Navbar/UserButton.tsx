"use client";
import { useEffect, useState } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { Group, Text, UnstyledButton, Skeleton } from "@mantine/core";
import { api } from "@/lib/api";
import classes from "./UserButton.module.css";

interface User {
  name: string;
  email: string;
}

export function UserButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get<User>("investors/me/"); // 👈 endpoint que retorna o usuário logado
        setUser(res.data);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <div style={{ flex: 1 }}>
          {loading ? (
            <>
              <Skeleton height={12} width={120} mb={6} />
              <Skeleton height={10} width={160} />
            </>
          ) : (
            <>
              <Text size="sm" fw={500}>
                {user?.name || "Usuário"}
              </Text>

              <Text c="dimmed" size="xs" lineClamp={1}>
                {user?.email || "email@exemplo.com"}
              </Text>
            </>
          )}
        </div>

        <IconChevronRight size={14} stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
}
