import {
  IconAdjustments,
  IconCalendarStats,
  IconFileAnalytics,
  IconGauge,
  IconLock,
  IconNotes,
  IconPresentationAnalytics,
} from "@tabler/icons-react";
import { Code, Group, ScrollArea } from "@mantine/core";
import { LinksGroup } from "./NavbarLinksGroup";
import { UserButton } from "./UserButton";
import { Logo } from "./Logo";
import classes from "./NavbarNested.module.css";

const mockdata = [
  { label: "Oportunidades", icon: IconGauge, link: "/opportunities" },
  { label: "Meus Projetos", icon: IconNotes, link: "/dashboard"},
  { label: "Resultados", icon: IconPresentationAnalytics },
  { label: "Configurações", icon: IconAdjustments },
  {
    label: "Segurança",
    icon: IconLock,
    links: [
      { label: "Alterar Senha", link: "/" },
    ],
  },
];

export function NavbarNested() {
  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: 120 }} />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
