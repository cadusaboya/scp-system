"use client";
import { useState } from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { Box, Collapse, Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import classes from "./NavbarLinksGroup.module.css";

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string; // 👈 agora também aceita link direto
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link }: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  // sublinks (se houver)
  const items = (hasLinks ? links : []).map((item) => (
    <Text
      key={item.label}
      component={Link}
      href={item.link}
      className={classes.link}
      onClick={() => setOpened(false)}
    >
      {item.label}
    </Text>
  ));

  // botão principal
  const handleClick = () => {
    if (hasLinks) setOpened((o) => !o);
  };

  const ButtonContent = (
    <Group justify="space-between" gap={0}>
      <Box style={{ display: "flex", alignItems: "center" }}>
        <ThemeIcon variant="light" size={30}>
          <Icon size={18} />
        </ThemeIcon>
        <Box ml="md">{label}</Box>
      </Box>
      {hasLinks && (
        <IconChevronRight
          className={classes.chevron}
          stroke={1.5}
          size={16}
          style={{ transform: opened ? "rotate(-90deg)" : "none" }}
        />
      )}
    </Group>
  );

  // se tiver link direto (sem sublinks), usa <Link>; senão, usa <button>
  return (
    <>
      {hasLinks ? (
        <UnstyledButton onClick={handleClick} className={classes.control}>
          {ButtonContent}
        </UnstyledButton>
      ) : (
        <UnstyledButton component={Link} href={link || "#"} className={classes.control}>
          {ButtonContent}
        </UnstyledButton>
      )}

      {hasLinks && <Collapse in={opened}>{items}</Collapse>}
    </>
  );
}
