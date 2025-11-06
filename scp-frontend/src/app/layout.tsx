import "@mantine/core/styles.css";
import { MantineProvider, MantineProviderProps } from "@mantine/core";
import { createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "brand",
  fontFamily: "Inter, sans-serif",
  headings: { fontFamily: "Inter, sans-serif" },
  colors: {
    brand: [
      "#edf2ff",
      "#dbe4ff",
      "#bac8ff",
      "#91a7ff",
      "#748ffc",
      "#5c7cfa",
      "#4c6ef5",
      "#4263eb",
      "#3b5bdb",
      "#364fc7",
    ],
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light" withCssVariables withGlobalStyles withNormalizeCSS>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
