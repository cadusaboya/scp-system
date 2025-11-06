"use client";
import Link from "next/link";
import { Anchor, Button, Group, Progress, Table, Text } from "@mantine/core";
import classes from "./TableReviews.module.css";

export interface ReviewItem {
  id: number;
  name: string;
  type: string;
  expected_end_date: string;
  share_value: number;
  status: "planejado" | "em_obra" | "a_venda" | "vendido" | "encerrado";
  invested_value?: number; // 👈 novo campo opcional
  investment_date?: string; // 👈 novo campo opcional
}

interface TableReviewsProps {
  data: ReviewItem[];
}

export function TableReviews({ data }: TableReviewsProps) {
  const getProgress = (status: ReviewItem["status"]) => {
    switch (status) {
      case "planejado":
        return 20;
      case "em_obra":
        return 40;
      case "a_venda":
        return 60;
      case "vendido":
        return 80;
      case "encerrado":
        return 100;
      default:
        return 0;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "leilao":
        return "Leilão";
      case "construcao":
        return "Construção";
      case "reforma":
        return "Reforma";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: ReviewItem["status"]) => {
    switch (status) {
      case "planejado":
        return "Planejado";
      case "em_obra":
        return "Em obra";
      case "a_venda":
        return "À venda";
      case "vendido":
        return "Vendido";
      case "encerrado":
        return "Encerrado";
      default:
        return "Desconhecido";
    }
  };

  const rows = data.map((proj) => {
    const progress = getProgress(proj.status);

    return (
      <Table.Tr key={proj.id}>
        {/* Nome */}
        <Table.Td>
          <Anchor component="button" fz="sm">
            {proj.name}
          </Anchor>
        </Table.Td>

        {/* Tipo */}
        <Table.Td>{getTypeLabel(proj.type)}</Table.Td>

        {/* Data de Aporte */}
        <Table.Td>
          {proj.investment_date
            ? new Date(proj.investment_date).toLocaleDateString("pt-BR")
            : "-"}
        </Table.Td>

        {/* Término Previsto */}
        <Table.Td>
          {proj.expected_end_date
            ? new Date(proj.expected_end_date).toLocaleDateString("pt-BR")
            : "-"}
        </Table.Td>

        {/* Valor Investido */}
        <Table.Td>
          {proj.invested_value
            ? proj.invested_value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : "-"}
        </Table.Td>

        {/* Status + Progresso */}
        <Table.Td>
          <Group justify="space-between">
            <Text fz="xs" fw={700}>
              {getStatusLabel(proj.status)}
            </Text>
            <Text fz="xs" c="blue" fw={700}>
              {getProgress(proj.status)}%
            </Text>
          </Group>
          <Progress.Root mt={4}>
            <Progress.Section
              className={classes.progressSection}
              value={getProgress(proj.status)}
              color="blue"
            />
          </Progress.Root>
        </Table.Td>

        {/* Ação */}
        <Table.Td>
          <Button
            component={Link}
            href={`/projects/${proj.id}`}
            size="xs"
            variant="light"
            color="blue"
            radius="sm"
          >
            Ver mais
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table.ScrollContainer minWidth={1000}>
      <Table verticalSpacing="xs" striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nome</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th>Data de aporte</Table.Th>
            <Table.Th>Término previsto</Table.Th>
            <Table.Th>Valor investido</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Ações</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
