import { Badge, Button, Card, Group, Image, Text } from "@mantine/core";

interface BadgeCardProps {
  title: string;
  description?: string;
  amount?: string;
  tag?: string;
}

const mockImage =
  "https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";

export function BadgeCard({ title, description, amount, tag }: BadgeCardProps) {
  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      {/* 🔹 Imagem */}
      <Card.Section>
        <Image src={mockImage} alt={title} height={140} fit="cover" />
      </Card.Section>

      {/* 🔹 Conteúdo principal */}
      <Card.Section style={{ padding: "1rem" }}>
        {/* Título com limite de 2 linhas */}
        <Text
          fz="md"
          fw={600}
          mb="xs"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2, // 👈 máximo de 2 linhas
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: "3.2em", // 👈 garante altura fixa
          }}
        >
          {title}
        </Text>

        {/* 🔹 Tag logo abaixo do título */}
        {tag && (
          <Group mb="xs">
            <Badge size="sm" variant="light" color="blue">
              {tag.toUpperCase()}
            </Badge>
          </Group>
        )}

        {/* Descrição */}
        {description && (
          <Text
            fz="sm"
            c="dimmed"
            lineClamp={3}
            style={{
              minHeight: 60,
              maxHeight: 75,
              overflow: "hidden",
            }}
          >
            {description}
          </Text>
        )}

        {/* Valor */}
        {amount && (
          <Text fz="sm" fw={500} mt="xs">
            {amount}
          </Text>
        )}
      </Card.Section>

      {/* 🔹 Botão fixo no fim */}
      <Button radius="md" fullWidth mt="auto">
        Mostrar detalhes
      </Button>
    </Card>
  );
}
