"use client";

import { useState } from "react";
import {
  Table,
  TextInput,
  ScrollArea,
  Text,
  Group,
  Center,
  UnstyledButton,
  keys,
} from "@mantine/core";
import {
  IconSearch,
  IconSelector,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import classes from "./TableSort.module.css";

function Th({ children, reversed, sorted, onSort }) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;

  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data, search) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) =>
      String(item[key] ?? "")
        .toLowerCase()
        .includes(query)
    )
  );
}

function sortData(data, payload) {
  const { sortBy } = payload;

  if (!sortBy) return filterData(data, payload.search);

  return filterData(
    [...data].sort((a, b) => {
      const valA = String(a[sortBy] ?? "");
      const valB = String(b[sortBy] ?? "");

      if (payload.reversed) return valB.localeCompare(valA);
      return valA.localeCompare(valB);
    }),
    payload.search
  );
}

export default function ExpensesTable({ projectId, expenses }) {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(expenses);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(expenses, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const value = event.currentTarget.value;
    setSearch(value);
    setSortedData(sortData(expenses, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((exp) => (
    <Table.Tr key={exp.id}>
      <Table.Td>{exp.number || `#${exp.id}`}</Table.Td>
      <Table.Td>{exp.vendor?.name || "—"}</Table.Td>
      <Table.Td>{exp.date || "—"}</Table.Td>
      <Table.Td>
        R$
        {Number(exp.total).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}
      </Table.Td>

      <Table.Td>
        <div className="flex gap-2">
          <Link href={`/expenses/${exp.id}`}>
            <Button variant="secondary" size="sm">
              Abrir
            </Button>
          </Link>
          <Link href={`/expenses/${exp.id}/edit`}>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </Link>
        </div>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <TextInput
        placeholder="Buscar por qualquer campo"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />

      <Table horizontalSpacing="md" verticalSpacing="xs" miw={700}>
        <Table.Thead>
          <Table.Tr>
            <Th sorted={sortBy === "number"} reversed={reverseSortDirection} onSort={() => setSorting("number")}>Número</Th>
            <Th sorted={sortBy === "vendor"} reversed={reverseSortDirection} onSort={() => setSorting("vendor")}>Fornecedor</Th>
            <Th sorted={sortBy === "date"} reversed={reverseSortDirection} onSort={() => setSorting("date")}>Data</Th>
            <Th sorted={sortBy === "total"} reversed={reverseSortDirection} onSort={() => setSorting("total")}>Total</Th>
            <Table.Th>Ações</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text fw={500} ta="center">
                  Nenhuma nota encontrada
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
